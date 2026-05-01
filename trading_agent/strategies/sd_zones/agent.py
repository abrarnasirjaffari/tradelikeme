"""
SDZoneStrategy — BaseStrategy implementation for the S/D zone strategy.

Thin facade over the existing modules:
  - scan_zones()   → zones.scan_tf_stack()
  - check_entry()  → loop.LoopOrchestrator.check_entry()
  - get_config()   → returns strategy constants
  - on_event()     → routes to trade_agent / loop handlers

Usage:
    strategy = SDZoneStrategy(exchange, pyth)
    await strategy.run()          # blocks until shutdown() is called
    await strategy.shutdown()
"""
import asyncio
import logging
from typing import Any, Literal

from trading_agent.base.base_strategy import BaseStrategy
from trading_agent.base.exchange_base import ExchangeBase
from trading_agent.exchanges.solana.pyth_ws import PythPriceFeed
from trading_agent.strategies.sd_zones.loop import (
    LoopOrchestrator,
    WATCHLIST,
    MAX_AT_RISK_SLOTS,
    MIN_BALANCE_USD,
    LEVERAGE,
    MARGIN_PCT,
    ZONE_REFRESH_SECS,
    COMPOUND_SECS,
)
from trading_agent.strategies.sd_zones.zones import scan_tf_stack

logger = logging.getLogger(__name__)

STRATEGY_ID = "sd_zones"


class SDZoneStrategy(BaseStrategy):
    """
    S/D zone strategy — wraps LoopOrchestrator to satisfy BaseStrategy interface.

    All heavy lifting (zone scan, entry gates, event routing, sentinel management)
    lives in the underlying modules; this class is purely the integration seam.
    """

    def __init__(self, exchange: ExchangeBase, pyth: PythPriceFeed) -> None:
        self._exchange = exchange
        self._pyth = pyth
        self._loop = LoopOrchestrator(exchange, pyth)

    # ------------------------------------------------------------------
    # BaseStrategy — abstract method implementations
    # ------------------------------------------------------------------

    async def scan_zones(self, symbol: str) -> list[dict]:
        """Scan all 7 TFs for S/D zones. Returns [{type, top, bottom, tf, strength}]."""
        return await scan_tf_stack(symbol)

    async def check_entry(self, symbol: str, zones: list[dict]) -> dict | None:
        """
        Validate setup against all gates (entry gate, BTC 1D, 4H zone, TP/SL exist).

        Returns an entry dict {direction, tp1, tp2, sl} if all gates pass, else None.
        Direction is inferred from the first zone in the list.
        """
        if not zones:
            return None

        direction: Literal["long", "short"] = (
            "long" if zones[0].get("type") == "demand" else "short"
        )

        passed = await self._loop.check_entry(symbol, zones, direction)
        if not passed:
            return None

        # Compute TP/SL levels for the caller
        from trading_agent.strategies.sd_zones.zones import find_tp_levels, find_sl_level
        try:
            price = (
                self._pyth.get_price(symbol)
                or await self._pyth.get_price_rest(symbol)
            )
        except Exception:
            price = None

        if not price:
            return {"direction": direction, "tp1": None, "tp2": None, "sl": None}

        tp1, tp2 = find_tp_levels(price, direction, zones)
        sl = find_sl_level(price, direction, zones)

        return {
            "direction": direction,
            "tp1": tp1,
            "tp2": tp2,
            "sl": sl,
        }

    def get_config(self) -> dict[str, Any]:
        """Return current strategy parameters."""
        return {
            "strategy_id": STRATEGY_ID,
            "watchlist": WATCHLIST,
            "leverage": LEVERAGE,
            "margin_pct": MARGIN_PCT,
            "max_at_risk_slots": MAX_AT_RISK_SLOTS,
            "min_balance_usd": MIN_BALANCE_USD,
            "zone_refresh_secs": ZONE_REFRESH_SECS,
            "compound_secs": COMPOUND_SECS,
        }

    async def on_event(self, event_type: str, data: dict) -> None:
        """
        Route external events into the loop/trade-agent.

        Supported event_type values (match notifier.py constants):
          ZONE_TOUCH, TP1_HIT, SL_HIT, BALANCE_LOW, AGENT_DOWN, DAILY_SUMMARY
        """
        symbol = data.get("symbol", "")

        if event_type == "ZONE_TOUCH":
            zones = self._loop._zones.get(symbol, [])
            price = data.get("price", 0.0)
            await self._loop._on_zone_touch(symbol, price, zones)

        elif event_type == "TP1_HIT":
            await self._loop._trade_agent.on_tp1_hit(symbol)

        elif event_type == "SL_HIT":
            price = data.get("price", 0.0)
            await self._loop._trade_agent.on_body_close_sl(symbol, price)

        elif event_type in ("BALANCE_LOW", "AGENT_DOWN", "DAILY_SUMMARY"):
            logger.info("on_event: %s — %s", event_type, data)

        else:
            logger.warning("on_event: unknown event_type=%s", event_type)

    # ------------------------------------------------------------------
    # Lifecycle helpers (not part of BaseStrategy — convenience only)
    # ------------------------------------------------------------------

    async def run(self) -> None:
        """Start the strategy and block until shutdown() is called."""
        await self._loop.startup()
        # startup() spawns background tasks; wait here so the process stays alive
        while self._loop._running:
            await asyncio.sleep(60)

    async def shutdown(self) -> None:
        """Graceful stop — delegates to LoopOrchestrator."""
        await self._loop.shutdown()
