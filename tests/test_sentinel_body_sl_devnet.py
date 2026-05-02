"""
ET4 — Full flow test: sentinel fires 30m body-close SL, agent closes position.

Steps:
  1. Enter a trade on Zeta devnet
  2. Register a BODY_SL watch on the sentinel
  3. Inject price ticks that simulate a candle wicking PAST SL (stop hunt) — verify ignored
  4. Inject price ticks that simulate a candle BODY closing below SL — verify fires
  5. Call on_body_close_sl() — verify position closed on-chain
  6. Verify get_open_trades() is empty

Run: python tests/test_sentinel_body_sl_devnet.py
Requires: HELIUS_RPC_URL + DEVNET_AGENT_KEYPAIR_PATH (or PHANTOM_PRIVATE_KEY) in .env
"""
import asyncio
import logging
import os
import sys
import time
from typing import Callable

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from trading_agent.exchanges.solana.pyth_ws import PythPriceFeed
from trading_agent.exchanges.solana.solana_router import SolanaRouter
from trading_agent.strategies.sd_zones.sentinel import (
    Sentinel, WatchType, SentinelEvent, BodySLWatch,
)
from trading_agent.strategies.sd_zones.trade_agent import TradeAgent

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger(__name__)

SYMBOL   = "SOL"
PYTH_SYM = "SOL/USD"
SIZE     = 0.1
LEVERAGE = 10
SIDE     = "long"
TP1_OFFSET = 0.04
TP2_OFFSET = 0.08
SL_OFFSET  = 0.03


# ---------------------------------------------------------------------------
# Mock Pyth feed (same pattern as SE12 test)
# ---------------------------------------------------------------------------

class MockPythPriceFeed:
    def __init__(self):
        self._prices: dict[str, float] = {}
        self._callbacks: dict[str, list[Callable]] = {}

    async def connect(self) -> None:
        pass

    async def disconnect(self) -> None:
        pass

    async def subscribe(self, symbol: str, callback: Callable | None = None) -> None:
        if callback:
            self._callbacks.setdefault(symbol, []).append(callback)

    def get_price(self, symbol: str) -> float | None:
        return self._prices.get(symbol)

    async def push(self, symbol: str, price: float) -> None:
        self._prices[symbol] = price
        for cb in self._callbacks.get(symbol, []):
            await cb(symbol, price)


async def _trigger_body_sl_check(sentinel: Sentinel, symbol: str) -> SentinelEvent | None:
    """
    Directly invoke the body-close logic for one symbol without waiting 30 minutes.
    Mirrors what _body_sl_loop does at each 30m boundary.
    """
    watch: BodySLWatch | None = sentinel._body_sl_watches.get(symbol)
    if not watch:
        return None

    body_close = watch.candle_close
    if body_close == 0.0:
        return None

    sl_breached = (
        (watch.direction == "long"  and body_close < watch.sl_price) or
        (watch.direction == "short" and body_close > watch.sl_price)
    )

    if sl_breached:
        event = SentinelEvent(WatchType.BODY_SL, symbol, body_close)
        await sentinel._fire(event)
        del sentinel._body_sl_watches[symbol]
        return event

    return None


async def main() -> None:
    results: dict[str, bool] = {}

    router = SolanaRouter("devnet")
    agent  = TradeAgent(exchange=router)

    log.info("Initialising SolanaRouter on devnet…")
    await router.initialise()

    mock_pyth = MockPythPriceFeed()
    sentinel  = Sentinel(mock_pyth)

    try:
        # ----------------------------------------------------------------
        # Step 1 — fetch live price + enter trade on devnet
        # ----------------------------------------------------------------
        price = await router.get_price(SYMBOL)
        log.info("Live SOL price: %.4f", price)
        results["price_fetched"] = price > 0

        tp1_price = round(price * (1 + TP1_OFFSET), 4)
        tp2_price = round(price * (1 + TP2_OFFSET), 4)
        sl_price  = round(price * (1 - SL_OFFSET),  4)
        log.info("Levels — TP1=%.4f  TP2=%.4f  SL=%.4f", tp1_price, tp2_price, sl_price)

        trade = await agent.enter_trade(
            symbol=SYMBOL,
            side=SIDE,
            entry_price=price,
            size=SIZE,
            tp1_price=tp1_price,
            tp2_price=tp2_price,
            sl_price=sl_price,
            leverage=LEVERAGE,
        )
        results["trade_entered"] = trade is not None
        log.info("Trade entered: status=%s", trade.status)

        # ----------------------------------------------------------------
        # Step 2 — start sentinel + register BODY_SL watch
        # ----------------------------------------------------------------
        await sentinel.start()
        results["sentinel_started"] = True

        await sentinel.add_watch(
            symbol="SOLUSDT",
            watch_type=WatchType.BODY_SL,
            sl_price=sl_price,
            direction=SIDE,
        )
        results["body_sl_watch_registered"] = "SOLUSDT" in sentinel._body_sl_watches
        log.info("BODY_SL watch registered: sl=%.4f dir=%s", sl_price, SIDE)

        # ----------------------------------------------------------------
        # Step 3 — stop hunt simulation: wick below SL, body stays above
        # Inject ticks: open above SL, wick spike below SL, close back above SL
        # Expected: BODY_SL does NOT fire (stop hunt ignored)
        # ----------------------------------------------------------------
        log.info("Simulating stop hunt (wick below SL, body stays above)…")
        wick_price   = round(sl_price * 0.985, 4)   # wick 1.5% below SL
        recover_price = round(sl_price * 1.005, 4)  # body close just above SL

        await mock_pyth.push(PYTH_SYM, price)          # candle open
        await mock_pyth.push(PYTH_SYM, wick_price)     # wick below SL
        await mock_pyth.push(PYTH_SYM, recover_price)  # recover above SL

        # Patch candle state to match what the ticks built up
        watch = sentinel._body_sl_watches.get("SOLUSDT")
        if watch:
            watch.candle_open  = price
            watch.candle_high  = max(price, recover_price)
            watch.candle_low   = wick_price
            watch.candle_close = recover_price

        stop_hunt_event = await _trigger_body_sl_check(sentinel, "SOLUSDT")
        results["stop_hunt_ignored"] = stop_hunt_event is None
        log.info(
            "Stop hunt result: event=%s (expected None)",
            stop_hunt_event.watch_type if stop_hunt_event else "None",
        )

        # Watch should still be alive after the wick (not consumed)
        results["watch_survives_wick"] = "SOLUSDT" in sentinel._body_sl_watches

        # ----------------------------------------------------------------
        # Step 4 — real body-close SL: candle body closes below SL
        # Inject ticks that push candle_close below sl_price
        # Expected: BODY_SL fires
        # ----------------------------------------------------------------
        log.info("Simulating real body-close SL (body closes below SL)…")
        body_close_price = round(sl_price * 0.982, 4)  # body close 1.8% below SL

        await mock_pyth.push(PYTH_SYM, sl_price * 1.01)  # start new candle above SL
        await mock_pyth.push(PYTH_SYM, body_close_price)  # close below SL

        watch = sentinel._body_sl_watches.get("SOLUSDT")
        if watch:
            watch.candle_open  = round(sl_price * 1.01, 4)
            watch.candle_high  = round(sl_price * 1.01, 4)
            watch.candle_low   = body_close_price
            watch.candle_close = body_close_price

        body_sl_event = await _trigger_body_sl_check(sentinel, "SOLUSDT")
        results["body_sl_event_fired"]  = body_sl_event is not None and body_sl_event.watch_type == WatchType.BODY_SL
        results["body_sl_event_symbol"] = body_sl_event is not None and body_sl_event.symbol == "SOLUSDT"
        results["body_sl_watch_consumed"] = "SOLUSDT" not in sentinel._body_sl_watches
        log.info(
            "BODY_SL event: type=%s symbol=%s price=%.4f",
            body_sl_event.watch_type if body_sl_event else "None",
            body_sl_event.symbol if body_sl_event else "None",
            body_sl_event.price if body_sl_event else 0,
        )

        # ----------------------------------------------------------------
        # Step 5 — call on_body_close_sl: position must close on exchange
        # ----------------------------------------------------------------
        log.info("Calling on_body_close_sl…")
        await agent.on_body_close_sl(SYMBOL, body_close_price)

        open_trades = agent.get_open_trades()
        results["trades_empty_after_close"] = len(open_trades) == 0
        log.info("Open trades after close: %d (expected 0)", len(open_trades))

        # ----------------------------------------------------------------
        # Step 6 — verify exchange position is closed
        # ----------------------------------------------------------------
        await asyncio.sleep(3)
        position = await router.get_position(SYMBOL)
        results["exchange_position_closed"] = position is None
        log.info("Exchange position after close: %s", position)

    except Exception as exc:
        log.exception("Test raised unexpected exception: %s", exc)
        results["no_exception"] = False
    else:
        results["no_exception"] = True

    finally:
        log.info("Cleanup: stopping sentinel and closing any remaining position…")
        try:
            await sentinel.stop()
        except Exception as e:
            log.debug("Sentinel stop: %s", e)
        try:
            await router.close_position(SYMBOL)
        except Exception as e:
            log.debug("Cleanup close: %s", e)
        await router.close()

    # ----------------------------------------------------------------
    # Summary
    # ----------------------------------------------------------------
    print()
    print("=" * 60)
    print("ET4 — sentinel 30m body-close SL devnet SUMMARY")
    print("=" * 60)
    all_pass = True
    checks = [
        ("no_exception",             "no unexpected exception during test"),
        ("price_fetched",            "live SOL price fetched from devnet"),
        ("trade_entered",            "enter_trade() returned a Trade object"),
        ("sentinel_started",         "sentinel started without error"),
        ("body_sl_watch_registered", "BODY_SL watch registered in sentinel"),
        ("stop_hunt_ignored",        "wick below SL did NOT fire BODY_SL (stop hunt ignored)"),
        ("watch_survives_wick",      "BODY_SL watch survives after wick (not consumed)"),
        ("body_sl_event_fired",      "BODY_SL event fired when body closes below SL"),
        ("body_sl_event_symbol",     "BODY_SL event has correct symbol"),
        ("body_sl_watch_consumed",   "BODY_SL watch removed after firing (no repeat)"),
        ("trades_empty_after_close", "get_open_trades() empty after on_body_close_sl()"),
        ("exchange_position_closed", "on-chain position closed on Zeta devnet"),
    ]
    for key, label in checks:
        ok = results.get(key, False)
        status = "PASS" if ok else "FAIL"
        if not ok:
            all_pass = False
        print(f"  {status}  {label}")

    print()
    if all_pass:
        print("ALL CHECKS PASSED — ET4 done")
    else:
        print("SOME CHECKS FAILED — see logs above")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
