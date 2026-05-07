"""
Trade Agent — executes and monitors a single trade.

Lifecycle per trade:
  enter_trade()  → 4 orders placed (market + TP1 + TP2 + disaster SL)
  on_tp1_hit()   → move SL to entry (break-even)
  on_tp2_hit()   → log trade complete
  on_sl_hit()    → log trade as stopped out
  on_body_close_sl() → close position, log trade

The trade agent never scans zones or watches prices — that is sentinel's job.
Loop.py wires sentinel events to these handlers.
"""
import asyncio
import logging
import time
from dataclasses import dataclass, field
from typing import Literal

from trading_agent.base.exchange_base import ExchangeBase
from trading_agent.base.config import TELEGRAM_CHAT_ID
import trading_agent.base.notifier as notifier

logger = logging.getLogger(__name__)

DISASTER_SL_BUFFER = 0.03   # 3% beyond structural SL


@dataclass
class Trade:
    symbol: str
    side: Literal["long", "short"]
    entry_price: float
    size: float                     # total position size
    tp1_price: float
    tp2_price: float
    sl_price: float                 # structural SL (body-close primary)
    disaster_sl_price: float        # exchange hard SL (structural + 3% buffer)
    tp1_qty: float = 0.0            # 50% of size
    tp2_qty: float = 0.0            # remaining 50%
    status: str = "open"            # open | tp1_hit | closed
    open_time: float = field(default_factory=time.time)
    close_time: float = 0.0
    close_price: float = 0.0
    pnl: float = 0.0


class TradeAgent:
    """Manages open trades. One instance shared across all active trades."""

    def __init__(self, exchange: ExchangeBase):
        self._exchange = exchange
        self._trades: dict[str, Trade] = {}   # keyed by symbol

    # ------------------------------------------------------------------
    # TA2 — enter_trade: place all 4 orders
    # ------------------------------------------------------------------

    async def enter_trade(
        self,
        symbol: str,
        side: Literal["long", "short"],
        entry_price: float,
        size: float,
        tp1_price: float,
        tp2_price: float,
        sl_price: float,
        leverage: int = 200,
    ) -> Trade:
        """
        Place 4 orders atomically:
          1. Market entry order
          2. TP1 limit (50% qty)
          3. TP2 limit (50% qty)
          4. Disaster SL (100% qty, structural + 3% buffer)

        Returns the Trade dataclass on success. Raises on any order failure.
        """
        tp1_qty = round(size * 0.5, 8)
        tp2_qty = size - tp1_qty   # remainder avoids float rounding drift

        disaster_sl = (
            sl_price * (1 - DISASTER_SL_BUFFER) if side == "long"
            else sl_price * (1 + DISASTER_SL_BUFFER)
        )

        trade = Trade(
            symbol=symbol,
            side=side,
            entry_price=entry_price,
            size=size,
            tp1_price=tp1_price,
            tp2_price=tp2_price,
            sl_price=sl_price,
            disaster_sl_price=disaster_sl,
            tp1_qty=tp1_qty,
            tp2_qty=tp2_qty,
        )

        # TA3 — market entry
        logger.info("Entering %s %s size=%.4f @ market (leverage=%dx)", side.upper(), symbol, size, leverage)
        await self._place_market_entry(trade, leverage)

        # TA4 — TP1
        logger.info("Placing TP1 for %s: %.4f qty=%.4f", symbol, tp1_price, tp1_qty)
        await self._place_tp1(trade)

        # TA5 — TP2
        logger.info("Placing TP2 for %s: %.4f qty=%.4f", symbol, tp2_price, tp2_qty)
        await self._place_tp2(trade)

        # TA6 — disaster SL
        logger.info("Placing disaster SL for %s: %.4f", symbol, disaster_sl)
        await self._place_disaster_sl(trade)

        self._trades[symbol] = trade
        logger.info(
            "Trade open: %s %s entry=%.4f tp1=%.4f tp2=%.4f sl=%.4f disaster_sl=%.4f",
            symbol, side, entry_price, tp1_price, tp2_price, sl_price, disaster_sl,
        )

        await notifier.send(
            user_id=TELEGRAM_CHAT_ID,
            event=notifier.TRADE_ENTERED,
            data={"symbol": symbol, "side": side, "price": entry_price,
                  "tp1": tp1_price, "tp2": tp2_price, "sl": sl_price},
        )
        return trade

    # ------------------------------------------------------------------
    # TA3–TA6 — individual order helpers
    # ------------------------------------------------------------------

    async def _place_market_entry(self, trade: Trade, leverage: int) -> None:
        result = await self._exchange.open_position(
            symbol=trade.symbol,
            side=trade.side,
            size=trade.size,
            leverage=leverage,
        )
        logger.debug("Market entry result: %s", result)

    async def _place_tp1(self, trade: Trade) -> None:
        result = await self._exchange.set_tp(
            symbol=trade.symbol,
            price=trade.tp1_price,
            qty=trade.tp1_qty,
        )
        logger.debug("TP1 order result: %s", result)

    async def _place_tp2(self, trade: Trade) -> None:
        result = await self._exchange.set_tp(
            symbol=trade.symbol,
            price=trade.tp2_price,
            qty=trade.tp2_qty,
        )
        logger.debug("TP2 order result: %s", result)

    async def _place_disaster_sl(self, trade: Trade) -> None:
        result = await self._exchange.set_sl(
            symbol=trade.symbol,
            price=trade.disaster_sl_price,
        )
        logger.debug("Disaster SL order result: %s", result)

    # ------------------------------------------------------------------
    # TA7 — on_tp1_hit: move SL to entry (break-even)
    # ------------------------------------------------------------------

    async def on_tp1_hit(self, symbol: str) -> None:
        trade = self._trades.get(symbol)
        if not trade:
            logger.warning("on_tp1_hit: no open trade for %s", symbol)
            return

        trade.status = "tp1_hit"
        logger.info("TP1 hit for %s — moving SL to entry %.4f", symbol, trade.entry_price)

        # Update the exchange hard SL to entry price (break-even)
        await self._exchange.set_sl(symbol=symbol, price=trade.entry_price)
        trade.sl_price = trade.entry_price
        trade.disaster_sl_price = trade.entry_price

        logger.info("SL moved to break-even for %s: %.4f", symbol, trade.entry_price)

        await notifier.send(
            user_id=TELEGRAM_CHAT_ID,
            event=notifier.TP1_HIT,
            data={"symbol": symbol, "price": trade.tp1_price},
        )

    # ------------------------------------------------------------------
    # TA8 — on_sl_hit: log trade as stopped out
    # ------------------------------------------------------------------

    async def on_sl_hit(self, symbol: str, exit_price: float) -> None:
        trade = self._trades.pop(symbol, None)
        if not trade:
            logger.warning("on_sl_hit: no open trade for %s", symbol)
            return

        pnl = _calc_pnl(trade, exit_price, trade.size)
        trade.status = "closed"
        trade.close_price = exit_price
        trade.close_time = time.time()
        trade.pnl = pnl

        logger.info(
            "SL HIT: %s %s entry=%.4f exit=%.4f pnl=%.4f",
            symbol, trade.side, trade.entry_price, exit_price, pnl,
        )

        await notifier.send(
            user_id=TELEGRAM_CHAT_ID,
            event=notifier.SL_HIT,
            data={"symbol": symbol, "price": exit_price, "pnl": pnl},
        )

    # ------------------------------------------------------------------
    # TA9 — on_tp2_hit: log trade complete
    # ------------------------------------------------------------------

    async def on_tp2_hit(self, symbol: str) -> None:
        trade = self._trades.pop(symbol, None)
        if not trade:
            logger.warning("on_tp2_hit: no open trade for %s", symbol)
            return

        pnl_tp1 = _calc_pnl(trade, trade.tp1_price, trade.tp1_qty)
        pnl_tp2 = _calc_pnl(trade, trade.tp2_price, trade.tp2_qty)
        total_pnl = pnl_tp1 + pnl_tp2

        trade.status = "closed"
        trade.close_price = trade.tp2_price
        trade.close_time = time.time()
        trade.pnl = total_pnl

        logger.info(
            "TRADE COMPLETE: %s %s tp1_pnl=%.4f tp2_pnl=%.4f total=%.4f",
            symbol, trade.side, pnl_tp1, pnl_tp2, total_pnl,
        )

        await notifier.send(
            user_id=TELEGRAM_CHAT_ID,
            event=notifier.TP2_HIT,
            data={"symbol": symbol, "price": trade.tp2_price, "pnl": total_pnl},
        )

    # ------------------------------------------------------------------
    # TA10 — on_body_close_sl: close position, log trade
    # ------------------------------------------------------------------

    async def on_body_close_sl(self, symbol: str, body_close_price: float) -> None:
        trade = self._trades.pop(symbol, None)
        if not trade:
            logger.warning("on_body_close_sl: no open trade for %s", symbol)
            return

        logger.info(
            "Body-close SL triggered for %s — body_close=%.4f sl=%.4f, closing position",
            symbol, body_close_price, trade.sl_price,
        )

        await self._exchange.close_position(symbol=symbol)

        remaining_qty = trade.tp2_qty if trade.status == "tp1_hit" else trade.size
        pnl = _calc_pnl(trade, body_close_price, remaining_qty)

        trade.status = "closed"
        trade.close_price = body_close_price
        trade.close_time = time.time()
        trade.pnl = pnl

        logger.info(
            "Position closed (body-SL): %s %s entry=%.4f close=%.4f pnl=%.4f",
            symbol, trade.side, trade.entry_price, body_close_price, pnl,
        )

        await notifier.send(
            user_id=TELEGRAM_CHAT_ID,
            event=notifier.SL_HIT,
            data={"symbol": symbol, "price": body_close_price, "pnl": pnl},
        )

    # ------------------------------------------------------------------
    # TA11 — get_open_trades
    # ------------------------------------------------------------------

    def get_open_trades(self) -> list[Trade]:
        return list(self._trades.values())


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _calc_pnl(trade: Trade, exit_price: float, qty: float) -> float:
    """Unrealised/realised PnL in USDT for a given exit price and quantity."""
    if trade.side == "long":
        return (exit_price - trade.entry_price) * qty
    else:
        return (trade.entry_price - exit_price) * qty
