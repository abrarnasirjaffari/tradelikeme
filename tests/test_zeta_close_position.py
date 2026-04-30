"""
ZC13 — Test close_position on devnet
Opens a SOL long, then closes it, verifies position is gone.
Run: python tests/test_zeta_close_position.py
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


async def main() -> None:
    results: dict[str, bool] = {}
    client = ZetaClient("devnet")

    log.info("Initialising ZetaClient on devnet …")
    await client.initialise()

    try:
        # --- Step 1: open a position to close ---
        log.info("Opening %s %s size=%.2f (setup) …", SIDE, SYMBOL, SIZE)
        open_sig = await client.open_position(SYMBOL, SIDE, SIZE, leverage=10)
        log.info("Setup open tx: %s", open_sig)
        await asyncio.sleep(3)

        pos_after_open = await client.get_position(SYMBOL)
        if pos_after_open is None:
            log.error("Position not found after open — aborting test")
            results["position_open_before_close"] = False
            return
        results["position_open_before_close"] = True
        log.info("Position before close: side=%s size=%.4f", pos_after_open["side"], pos_after_open["size"])

        # --- Step 2: close the position ---
        log.info("Closing position …")
        close_sig = await client.close_position(SYMBOL)

        results["tx_sig_returned"] = bool(close_sig)
        results["tx_sig_non_empty"] = len(close_sig) > 10
        log.info("close_position tx: %s", close_sig)

        await asyncio.sleep(3)

        # --- Step 3: verify position is gone ---
        pos_after_close = await client.get_position(SYMBOL)
        results["position_gone"] = pos_after_close is None
        if pos_after_close is None:
            log.info("Position is None after close — confirmed flat")
        else:
            log.error("Position still exists after close: %s", pos_after_close)

        # --- Step 4: verify close_position raises on no open position ---
        log.info("Testing close_position raises when already flat …")
        try:
            await client.close_position(SYMBOL)
            results["raises_when_flat"] = False
            log.error("Expected RuntimeError but no exception raised")
        except RuntimeError as e:
            results["raises_when_flat"] = True
            log.info("Correctly raised RuntimeError: %s", e)

    finally:
        await client.close()

    # --- Summary ---
    print()
    print("=" * 50)
    print("ZC13 — close_position devnet SUMMARY")
    print("=" * 50)
    all_pass = True
    checks = [
        ("position_open_before_close", "position exists after setup open"),
        ("tx_sig_returned",            "close_position returned a tx signature"),
        ("tx_sig_non_empty",           "tx signature is non-empty string"),
        ("position_gone",              "get_position() returns None after close"),
        ("raises_when_flat",           "close_position raises RuntimeError when already flat"),
    ]
    for key, label in checks:
        ok = results.get(key, False)
        status = "PASS" if ok else "FAIL"
        if not ok:
            all_pass = False
        print(f"  {status}  {label}")

    print()
    if all_pass:
        print("ALL CHECKS PASSED — ZC13 done")
    else:
        print("SOME CHECKS FAILED — see logs above")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
