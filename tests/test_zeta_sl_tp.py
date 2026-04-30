"""
ZC14 — Test set_sl + set_tp on devnet
Opens a SOL long, places SL below entry and TP above entry, verifies tx sigs,
then tests cancel_sl + cancel_tp, then cleans up.
Run: python tests/test_zeta_sl_tp.py
Requires: HELIUS_RPC_URL + DEVNET_AGENT_KEYPAIR_PATH (or PHANTOM_PRIVATE_KEY) in .env
"""
import asyncio
import logging
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from trading_agent.exchanges.solana.zeta_client import ZetaClient

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger(__name__)

SYMBOL = "SOL"
SIZE = 0.1
SIDE = "long"
# SL 3% below entry, TP 4% above entry — computed dynamically from live price
SL_OFFSET = 0.03
TP_OFFSET = 0.04


async def main() -> None:
    results: dict[str, bool] = {}
    client = ZetaClient("devnet")

    log.info("Initialising ZetaClient on devnet …")
    await client.initialise()

    try:
        # --- Step 1: open position ---
        price = await client.get_price(SYMBOL)
        sl_price = round(price * (1 - SL_OFFSET), 4)
        tp_price = round(price * (1 + TP_OFFSET), 4)
        log.info("Live price=%.4f  SL=%.4f  TP=%.4f", price, sl_price, tp_price)

        log.info("Opening %s %s size=%.2f (setup) …", SIDE, SYMBOL, SIZE)
        open_sig = await client.open_position(SYMBOL, SIDE, SIZE, leverage=10)
        log.info("Setup open tx: %s", open_sig)
        await asyncio.sleep(3)

        pos = await client.get_position(SYMBOL)
        if pos is None:
            log.error("Position not found after open — aborting test")
            results["position_open"] = False
            return
        results["position_open"] = True

        # --- Step 2: set SL ---
        log.info("Setting SL at %.4f …", sl_price)
        sl_sig = await client.set_sl(SYMBOL, sl_price)
        results["sl_tx_returned"] = bool(sl_sig)
        results["sl_tx_non_empty"] = len(sl_sig) > 10
        log.info("set_sl tx: %s", sl_sig)
        await asyncio.sleep(2)

        # --- Step 3: set TP (50% qty) ---
        tp_qty = SIZE / 2
        log.info("Setting TP at %.4f qty=%.2f …", tp_price, tp_qty)
        tp_sig = await client.set_tp(SYMBOL, tp_price, tp_qty)
        results["tp_tx_returned"] = bool(tp_sig)
        results["tp_tx_non_empty"] = len(tp_sig) > 10
        log.info("set_tp tx: %s", tp_sig)
        await asyncio.sleep(2)

        # --- Step 4: set_sl raises when no position ---
        # Test by calling on a symbol with no open position
        log.info("Testing set_sl raises when no position …")
        try:
            await client.set_sl("BTC", sl_price)
            results["sl_raises_when_flat"] = False
            log.error("Expected RuntimeError from set_sl on flat BTC but no exception raised")
        except RuntimeError as e:
            results["sl_raises_when_flat"] = True
            log.info("Correctly raised RuntimeError: %s", e)

        # --- Step 5: set_tp raises when no position ---
        log.info("Testing set_tp raises when no position …")
        try:
            await client.set_tp("BTC", tp_price, tp_qty)
            results["tp_raises_when_flat"] = False
            log.error("Expected RuntimeError from set_tp on flat BTC but no exception raised")
        except RuntimeError as e:
            results["tp_raises_when_flat"] = True
            log.info("Correctly raised RuntimeError: %s", e)

        # --- Step 6: cancel SL ---
        log.info("Cancelling SL …")
        cancel_sl_sig = await client.cancel_sl(SYMBOL)
        results["cancel_sl_tx_returned"] = bool(cancel_sl_sig)
        log.info("cancel_sl tx: %s", cancel_sl_sig)
        await asyncio.sleep(2)

        # --- Step 7: cancel TP ---
        log.info("Cancelling TP …")
        cancel_tp_sig = await client.cancel_tp(SYMBOL)
        results["cancel_tp_tx_returned"] = bool(cancel_tp_sig)
        log.info("cancel_tp tx: %s", cancel_tp_sig)
        await asyncio.sleep(2)

    finally:
        # Cleanup: close the position
        log.info("Cleanup: closing position …")
        try:
            close_sig = await client.close_position(SYMBOL)
            log.info("Cleanup close tx: %s", close_sig)
        except Exception as e:
            log.warning("Cleanup close failed (may already be closed): %s", e)
        await client.close()

    # --- Summary ---
    print()
    print("=" * 50)
    print("ZC14 — set_sl + set_tp devnet SUMMARY")
    print("=" * 50)
    all_pass = True
    checks = [
        ("position_open",           "position opened successfully (setup)"),
        ("sl_tx_returned",          "set_sl returned a tx signature"),
        ("sl_tx_non_empty",         "SL tx signature is non-empty"),
        ("tp_tx_returned",          "set_tp returned a tx signature"),
        ("tp_tx_non_empty",         "TP tx signature is non-empty"),
        ("sl_raises_when_flat",     "set_sl raises RuntimeError when no position"),
        ("tp_raises_when_flat",     "set_tp raises RuntimeError when no position"),
        ("cancel_sl_tx_returned",   "cancel_sl returned a tx signature"),
        ("cancel_tp_tx_returned",   "cancel_tp returned a tx signature"),
    ]
    for key, label in checks:
        ok = results.get(key, False)
        status = "PASS" if ok else "FAIL"
        if not ok:
            all_pass = False
        print(f"  {status}  {label}")

    print()
    if all_pass:
        print("ALL CHECKS PASSED — ZC14 done")
    else:
        print("SOME CHECKS FAILED — see logs above")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
