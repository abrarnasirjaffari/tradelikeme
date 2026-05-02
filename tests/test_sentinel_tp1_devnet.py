"""
ET3 — Full flow test: sentinel fires TP1 hit, agent moves SL to entry.

Steps:
  1. Enter a trade on Zeta devnet (market order)
  2. Register a TP1_HIT watch on the sentinel
  3. Inject a simulated price tick that crosses TP1 (directly calls _on_price_tick)
  4. Verify sentinel queued a TP1_HIT event
  5. Call on_tp1_hit() — verify SL moves to entry (break-even)
  6. Verify trade.status == "tp1_hit" and trade.sl_price == entry_price
  7. Cleanup: close position

Run: python tests/test_sentinel_tp1_devnet.py
Requires: HELIUS_RPC_URL + DEVNET_AGENT_KEYPAIR_PATH (or PHANTOM_PRIVATE_KEY) in .env
"""
import asyncio
import logging
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from trading_agent.exchanges.solana.pyth_ws import PythPriceFeed
from trading_agent.exchanges.solana.solana_router import SolanaRouter
from trading_agent.strategies.sd_zones.sentinel import Sentinel, WatchType, SentinelEvent
from trading_agent.strategies.sd_zones.trade_agent import TradeAgent

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger(__name__)

SYMBOL    = "SOL"
PYTH_SYM  = "SOL/USD"
SIZE      = 0.1
LEVERAGE  = 10
SIDE      = "long"
TP1_OFFSET = 0.04   # +4%
TP2_OFFSET = 0.08   # +8%
SL_OFFSET  = 0.03   # -3%


async def main() -> None:
    results: dict[str, bool] = {}

    router = SolanaRouter("devnet")
    pyth   = PythPriceFeed("devnet")
    agent  = TradeAgent(exchange=router)

    log.info("Initialising SolanaRouter on devnet…")
    await router.initialise()

    sentinel = Sentinel(pyth)

    try:
        # ----------------------------------------------------------------
        # Step 1 — fetch live price
        # ----------------------------------------------------------------
        price = await router.get_price(SYMBOL)
        log.info("Live SOL price: %.4f", price)
        results["price_fetched"] = price > 0

        tp1_price = round(price * (1 + TP1_OFFSET), 4)
        tp2_price = round(price * (1 + TP2_OFFSET), 4)
        sl_price  = round(price * (1 - SL_OFFSET),  4)
        log.info("Levels — TP1=%.4f  TP2=%.4f  SL=%.4f", tp1_price, tp2_price, sl_price)

        # ----------------------------------------------------------------
        # Step 2 — enter trade on devnet (4 orders)
        # ----------------------------------------------------------------
        log.info("Entering trade on Zeta devnet…")
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
        results["trade_entered"]     = trade is not None
        results["trade_status_open"] = trade is not None and trade.status == "open"
        log.info("Trade entered: status=%s entry=%.4f", trade.status, trade.entry_price)

        # ----------------------------------------------------------------
        # Step 3 — start sentinel (connects Pyth WS) and register TP1 watch
        # ----------------------------------------------------------------
        log.info("Starting sentinel…")
        await sentinel.start()
        results["sentinel_started"] = True

        await sentinel.add_watch(
            symbol="SOLUSDT",
            watch_type=WatchType.TP1_HIT,
            tp1_price=tp1_price,
            direction=SIDE,
        )
        results["tp1_watch_registered"] = "SOLUSDT" in sentinel._tp1_watches
        log.info("TP1 watch registered: tp1=%.4f dir=%s", tp1_price, SIDE)

        # ----------------------------------------------------------------
        # Step 4 — simulate price crossing TP1 by injecting two ticks:
        #   tick 1: price just below TP1 (sets prev_price)
        #   tick 2: price at/above TP1 (triggers the cross detection)
        # ----------------------------------------------------------------
        log.info("Injecting simulated price ticks to trigger TP1…")
        below_tp1 = round(tp1_price * 0.999, 4)
        above_tp1 = round(tp1_price * 1.001, 4)

        await sentinel._on_price_tick(PYTH_SYM, below_tp1)
        await sentinel._on_price_tick(PYTH_SYM, above_tp1)

        # Give the event queue a moment to be populated
        await asyncio.sleep(0.1)

        # ----------------------------------------------------------------
        # Step 5 — verify sentinel queued a TP1_HIT event
        # ----------------------------------------------------------------
        event: SentinelEvent | None = None
        try:
            event = sentinel._event_queue.get_nowait()
        except asyncio.QueueEmpty:
            pass

        results["tp1_event_fired"]      = event is not None and event.watch_type == WatchType.TP1_HIT
        results["tp1_event_symbol"]     = event is not None and event.symbol == "SOLUSDT"
        results["tp1_watch_consumed"]   = "SOLUSDT" not in sentinel._tp1_watches
        log.info(
            "TP1 event: %s  symbol=%s  watch_consumed=%s",
            event.watch_type if event else "None",
            event.symbol if event else "None",
            "SOLUSDT" not in sentinel._tp1_watches,
        )

        # ----------------------------------------------------------------
        # Step 6 — call on_tp1_hit: SL should move to entry (break-even)
        # ----------------------------------------------------------------
        log.info("Calling on_tp1_hit…")
        await agent.on_tp1_hit(SYMBOL)

        open_trades = agent.get_open_trades()
        updated_trade = next((t for t in open_trades if t.symbol == SYMBOL), None)

        results["trade_still_open"]   = updated_trade is not None
        results["status_tp1_hit"]     = updated_trade is not None and updated_trade.status == "tp1_hit"
        results["sl_at_entry"]        = (
            updated_trade is not None and
            abs(updated_trade.sl_price - price) < 1.0  # within $1 of entry (rounding)
        )
        results["disaster_sl_at_entry"] = (
            updated_trade is not None and
            abs(updated_trade.disaster_sl_price - price) < 1.0
        )
        log.info(
            "After on_tp1_hit — status=%s sl=%.4f disaster_sl=%.4f entry=%.4f",
            updated_trade.status if updated_trade else "N/A",
            updated_trade.sl_price if updated_trade else 0,
            updated_trade.disaster_sl_price if updated_trade else 0,
            price,
        )

        # ----------------------------------------------------------------
        # Step 7 — verify exchange updated SL (get_position still has the trade)
        # ----------------------------------------------------------------
        await asyncio.sleep(2)
        position = await router.get_position(SYMBOL)
        results["position_still_open"] = position is not None
        if position:
            log.info(
                "Exchange position still open: side=%s size=%.4f",
                position["side"], position["size"],
            )

    except Exception as exc:
        log.exception("Test raised unexpected exception: %s", exc)
        results["no_exception"] = False
    else:
        results["no_exception"] = True

    finally:
        log.info("Cleanup: stopping sentinel and closing position…")
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
    print("ET3 — sentinel TP1 hit + SL move devnet SUMMARY")
    print("=" * 60)
    all_pass = True
    checks = [
        ("no_exception",           "no unexpected exception during test"),
        ("price_fetched",          "live SOL price fetched from devnet"),
        ("trade_entered",          "enter_trade() returned a Trade object"),
        ("trade_status_open",      "trade.status == 'open' after entry"),
        ("sentinel_started",       "sentinel started without error"),
        ("tp1_watch_registered",   "TP1_HIT watch registered in sentinel"),
        ("tp1_event_fired",        "sentinel fired TP1_HIT event on price cross"),
        ("tp1_event_symbol",       "TP1_HIT event has correct symbol"),
        ("tp1_watch_consumed",     "TP1 watch removed after firing (no repeat)"),
        ("trade_still_open",       "trade still in get_open_trades() after TP1"),
        ("status_tp1_hit",         "trade.status == 'tp1_hit' after on_tp1_hit()"),
        ("sl_at_entry",            "trade.sl_price moved to entry price"),
        ("disaster_sl_at_entry",   "trade.disaster_sl_price moved to entry price"),
        ("position_still_open",    "on-chain position still open after TP1 hit"),
    ]
    for key, label in checks:
        ok = results.get(key, False)
        status = "PASS" if ok else "FAIL"
        if not ok:
            all_pass = False
        print(f"  {status}  {label}")

    print()
    if all_pass:
        print("ALL CHECKS PASSED — ET3 done")
    else:
        print("SOME CHECKS FAILED — see logs above")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
