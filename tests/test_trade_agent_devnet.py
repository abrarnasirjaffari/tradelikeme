"""
TA12 — Test enter_trade on devnet — verify all 4 orders placed correctly.

Steps:
  1. Init SolanaRouter (ZetaClient primary)
  2. Fetch live SOL price from devnet
  3. Call enter_trade() — market + TP1 + TP2 + disaster SL
  4. Verify position opened on-chain
  5. Call on_tp1_hit() — verify SL moved to break-even
  6. Call on_body_close_sl() — verify position closed cleanly
  7. Verify get_open_trades() is empty after close

Run: python tests/test_trade_agent_devnet.py
Requires: HELIUS_RPC_URL + DEVNET_AGENT_KEYPAIR_PATH (or PHANTOM_PRIVATE_KEY) in .env
"""
import asyncio
import logging
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from trading_agent.exchanges.solana.solana_router import SolanaRouter
from trading_agent.strategies.sd_zones.trade_agent import TradeAgent

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger(__name__)

SYMBOL   = "SOL"
SIZE     = 0.1      # smallest practical devnet lot
SIDE     = "long"
LEVERAGE = 10       # low leverage for devnet test

# Offsets from live price — not real zones, just valid order levels
TP1_OFFSET       = 0.04    # +4%
TP2_OFFSET       = 0.08    # +8%
SL_OFFSET        = 0.03    # -3%  structural SL
# Disaster SL = structural - 3% buffer → computed by TradeAgent automatically


async def main() -> None:
    results: dict[str, bool] = {}

    router = SolanaRouter("devnet")
    log.info("Initialising SolanaRouter on devnet …")
    await router.initialise()

    agent = TradeAgent(exchange=router)

    try:
        # ----------------------------------------------------------------
        # Step 1 — fetch live price to set realistic order levels
        # ----------------------------------------------------------------
        price = await router.get_price(SYMBOL)
        log.info("Live %s price: %.4f", SYMBOL, price)

        tp1_price = round(price * (1 + TP1_OFFSET), 4)
        tp2_price = round(price * (1 + TP2_OFFSET), 4)
        sl_price  = round(price * (1 - SL_OFFSET),  4)
        log.info("Order levels — TP1=%.4f  TP2=%.4f  SL=%.4f", tp1_price, tp2_price, sl_price)

        # ----------------------------------------------------------------
        # Step 2 — enter_trade: places all 4 orders
        # ----------------------------------------------------------------
        log.info("Calling enter_trade …")
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

        results["trade_returned"]   = trade is not None
        results["trade_size_match"] = abs(trade.size - SIZE) < 1e-6
        results["tp1_qty_half"]     = abs(trade.tp1_qty - SIZE * 0.5) < 1e-6
        results["tp2_qty_half"]     = abs(trade.tp2_qty - SIZE * 0.5) < 1e-6
        results["disaster_sl_set"]  = trade.disaster_sl_price < sl_price  # buffer applied
        results["trade_status_open"] = trade.status == "open"
        log.info(
            "Trade object: size=%.4f tp1_qty=%.4f tp2_qty=%.4f "
            "disaster_sl=%.4f status=%s",
            trade.size, trade.tp1_qty, trade.tp2_qty,
            trade.disaster_sl_price, trade.status,
        )

        # Give chain a moment to process
        await asyncio.sleep(3)

        # ----------------------------------------------------------------
        # Step 3 — verify position opened on-chain
        # ----------------------------------------------------------------
        position = await router.get_position(SYMBOL)
        if position is None:
            log.error("get_position returned None after enter_trade")
            results["position_exists"]       = False
            results["position_side_correct"] = False
        else:
            log.info(
                "On-chain position: side=%s size=%.4f entry=%.4f",
                position["side"], position["size"], position["entry_price"],
            )
            results["position_exists"]       = True
            results["position_side_correct"] = position["side"] == SIDE

        # ----------------------------------------------------------------
        # Step 4 — get_open_trades returns our trade
        # ----------------------------------------------------------------
        open_trades = agent.get_open_trades()
        results["open_trades_has_one"]      = len(open_trades) == 1
        results["open_trades_symbol_match"] = (
            len(open_trades) > 0 and open_trades[0].symbol == SYMBOL
        )

        # ----------------------------------------------------------------
        # Step 5 — simulate TP1 hit: SL must move to break-even
        # ----------------------------------------------------------------
        log.info("Simulating TP1 hit …")
        await agent.on_tp1_hit(SYMBOL)

        trade_after_tp1 = next(
            (t for t in agent.get_open_trades() if t.symbol == SYMBOL), None
        )
        results["tp1_hit_status"]     = trade_after_tp1 is not None and trade_after_tp1.status == "tp1_hit"
        results["sl_moved_to_entry"]  = (
            trade_after_tp1 is not None and
            abs(trade_after_tp1.sl_price - price) < 1.0  # within $1 of entry (rounding)
        )
        log.info(
            "After on_tp1_hit — status=%s new_sl=%.4f",
            trade_after_tp1.status if trade_after_tp1 else "N/A",
            trade_after_tp1.sl_price if trade_after_tp1 else 0.0,
        )

        # ----------------------------------------------------------------
        # Step 6 — simulate body-close SL: position must close and be removed
        # ----------------------------------------------------------------
        log.info("Simulating body-close SL …")
        fake_close_price = round(price * 0.97, 4)   # pretend body closed 3% below entry
        await agent.on_body_close_sl(SYMBOL, fake_close_price)

        results["position_removed_after_close"] = len(agent.get_open_trades()) == 0

        # Brief pause then verify exchange position is gone
        await asyncio.sleep(3)
        position_after_close = await router.get_position(SYMBOL)
        results["exchange_position_closed"] = position_after_close is None

    except Exception as exc:
        log.exception("Test failed with exception: %s", exc)
        results["no_exception"] = False
    else:
        results["no_exception"] = True

    finally:
        # Belt-and-braces cleanup in case a step above failed mid-way
        log.info("Cleanup: ensuring position is closed …")
        try:
            await router.close_position(SYMBOL)
        except Exception as e:
            log.debug("Cleanup close (expected if already closed): %s", e)
        await router.close()

    # ----------------------------------------------------------------
    # Summary
    # ----------------------------------------------------------------
    print()
    print("=" * 55)
    print("TA12 — enter_trade devnet SUMMARY")
    print("=" * 55)
    all_pass = True
    checks = [
        ("no_exception",                 "no unexpected exception during test"),
        ("trade_returned",               "enter_trade returned a Trade object"),
        ("trade_size_match",             f"trade.size == {SIZE}"),
        ("tp1_qty_half",                 "tp1_qty is 50% of size"),
        ("tp2_qty_half",                 "tp2_qty is 50% of size"),
        ("disaster_sl_set",              "disaster SL is below structural SL (3% buffer)"),
        ("trade_status_open",            "trade.status == 'open' after entry"),
        ("position_exists",              "on-chain position exists after entry"),
        ("position_side_correct",        f"on-chain side == '{SIDE}'"),
        ("open_trades_has_one",          "get_open_trades() returns 1 trade"),
        ("open_trades_symbol_match",     f"open trade symbol == '{SYMBOL}'"),
        ("tp1_hit_status",               "trade.status == 'tp1_hit' after on_tp1_hit()"),
        ("sl_moved_to_entry",            "SL moved to entry price after TP1 hit"),
        ("position_removed_after_close", "get_open_trades() empty after on_body_close_sl()"),
        ("exchange_position_closed",     "exchange position is None after close"),
    ]
    for key, label in checks:
        ok = results.get(key, False)
        status = "PASS" if ok else "FAIL"
        if not ok:
            all_pass = False
        print(f"  {status}  {label}")

    print()
    if all_pass:
        print("ALL CHECKS PASSED — TA12 done")
    else:
        print("SOME CHECKS FAILED — see logs above")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
