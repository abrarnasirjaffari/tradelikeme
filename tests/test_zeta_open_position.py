"""
ZC12 — Test open_position on devnet
Opens a minimum-size SOL long, verifies tx signature + position, then cleans up.
Run: python tests/test_zeta_open_position.py
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
SIZE = 0.1      # 0.1 SOL — smallest practical devnet lot
SIDE = "long"


async def main() -> None:
    results: dict[str, bool] = {}
    client = ZetaClient("devnet")

    log.info("Initialising ZetaClient on devnet …")
    await client.initialise()

    try:
        # --- Step 1: get price before opening ---
        price_before = await client.get_price(SYMBOL)
        log.info("Current %s price: %.4f", SYMBOL, price_before)

        # --- Step 2: open position ---
        log.info("Opening %s %s, size=%.2f …", SIDE, SYMBOL, SIZE)
        tx_sig = await client.open_position(SYMBOL, SIDE, SIZE, leverage=10)

        results["tx_sig_returned"] = bool(tx_sig)
        results["tx_sig_non_empty"] = len(tx_sig) > 10
        log.info("open_position tx: %s", tx_sig)

        # Give the chain a moment to process
        await asyncio.sleep(3)

        # --- Step 3: verify position exists ---
        position = await client.get_position(SYMBOL)
        if position is None:
            log.error("get_position returned None after open — position not confirmed on-chain yet")
            results["position_exists"] = False
            results["position_side_correct"] = False
            results["position_size_positive"] = False
        else:
            log.info("Position: side=%s size=%.4f entry=%.4f unrealised_pnl=%.4f",
                     position["side"], position["size"],
                     position["entry_price"], position["unrealised_pnl"])
            results["position_exists"] = True
            results["position_side_correct"] = position["side"] == SIDE
            results["position_size_positive"] = position["size"] > 0

    finally:
        # --- Cleanup: close the position so devnet state is clean ---
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
    print("ZC12 — open_position devnet SUMMARY")
    print("=" * 50)
    all_pass = True
    checks = [
        ("tx_sig_returned",       "open_position returned a tx signature"),
        ("tx_sig_non_empty",      "tx signature is non-empty string"),
        ("position_exists",       "get_position() shows position after open"),
        ("position_side_correct", f"position side == '{SIDE}'"),
        ("position_size_positive","position size > 0"),
    ]
    for key, label in checks:
        ok = results.get(key, False)
        status = "PASS" if ok else "FAIL"
        if not ok:
            all_pass = False
        print(f"  {status}  {label}")

    print()
    if all_pass:
        print("ALL CHECKS PASSED — ZC12 done")
    else:
        print("SOME CHECKS FAILED — see logs above")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
