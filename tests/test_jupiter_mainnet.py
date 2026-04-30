"""
JC10 — Test all JupiterClient methods on mainnet with minimal real funds.

Jupiter Perps has NO devnet deployment — this runs on mainnet only.

IMPORTANT: This test opens a real position with real USDC.
  - Minimum cost: ~$0.50 USDC collateral + ~$0.001 SOL gas
  - The position is closed in the finally block regardless of outcome.
  - Set JUPITER_MAINNET_TEST=1 in your env to confirm you intend to run this.

Requires in .env:
  HELIUS_RPC_URL          — mainnet Helius RPC
  PHANTOM_PRIVATE_KEY     — base58 keypair with USDC + SOL for gas
  JUPITER_PERPS_IDL_PATH  — path to infra/jupiter_perps_idl.json (optional, has default)

Run: python tests/test_jupiter_mainnet.py
"""
import asyncio
import logging
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from trading_agent.exchanges.solana.jupiter_client import JupiterClient

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger(__name__)

SYMBOL = "SOL"
SIZE_USD = 10.0      # $10 notional — Jupiter minimum is ~$10
LEVERAGE = 10        # $1.00 collateral
SIDE = "long"
SL_OFFSET = 0.03     # 3% below entry
TP_OFFSET = 0.04     # 4% above entry

MIN_BALANCE_USD = 2.0  # skip test if wallet has less than this


async def main() -> None:
    if not os.getenv("JUPITER_MAINNET_TEST"):
        print("SKIP — set JUPITER_MAINNET_TEST=1 to run this mainnet test with real funds.")
        sys.exit(0)

    results: dict[str, bool] = {}
    client = JupiterClient()

    log.info("Initialising JupiterClient on mainnet …")
    await client.initialise()

    try:
        # --- Step 1: get_balance ---
        balance = await client.get_balance()
        log.info("USDC balance: %.4f", balance)
        results["get_balance_returns_float"] = isinstance(balance, float)

        if balance < MIN_BALANCE_USD:
            log.error(
                "Insufficient USDC balance (%.4f < %.1f) — fund the wallet and retry.",
                balance, MIN_BALANCE_USD,
            )
            results["sufficient_balance"] = False
            return
        results["sufficient_balance"] = True

        # --- Step 2: open_position ---
        log.info("Opening %s %s size=$%.2f leverage=%dx …", SIDE, SYMBOL, SIZE_USD, LEVERAGE)
        open_sig = await client.open_position(SYMBOL, SIDE, SIZE_USD, LEVERAGE)
        results["open_tx_returned"] = bool(open_sig)
        results["open_tx_non_empty"] = len(open_sig) > 10
        log.info("open_position tx: %s", open_sig)

        await asyncio.sleep(5)

        # --- Step 3: get_position ---
        position = await client.get_position(SYMBOL)
        if position is None:
            log.warning("get_position returned None — position may not be confirmed yet, retrying …")
            await asyncio.sleep(5)
            position = await client.get_position(SYMBOL)

        if position is None:
            log.error("get_position still None after retry")
            results["position_exists"] = False
            results["position_side_correct"] = False
            results["position_size_positive"] = False
            results["position_has_entry_price"] = False
        else:
            log.info(
                "Position: side=%s size_usd=%.4f collateral=%.4f entry=%.4f",
                position["side"], position["size_usd"],
                position["collateral_usd"], position["entry_price"],
            )
            results["position_exists"] = True
            results["position_side_correct"] = position["side"] == SIDE
            results["position_size_positive"] = position["size_usd"] > 0
            results["position_has_entry_price"] = position["entry_price"] > 0

            entry_price = position["entry_price"]
            sl_price = round(entry_price * (1 - SL_OFFSET), 4)
            tp_price = round(entry_price * (1 + TP_OFFSET), 4)
            tp_qty = SIZE_USD / 2

            log.info("entry=%.4f  SL=%.4f  TP=%.4f  TP_qty=$%.2f",
                     entry_price, sl_price, tp_price, tp_qty)

            # --- Step 4: set_sl ---
            log.info("Setting SL at %.4f …", sl_price)
            sl_sig = await client.set_sl(SYMBOL, sl_price)
            results["sl_tx_returned"] = bool(sl_sig)
            results["sl_tx_non_empty"] = len(sl_sig) > 10
            log.info("set_sl tx: %s", sl_sig)
            await asyncio.sleep(3)

            # --- Step 5: set_tp ---
            log.info("Setting TP at %.4f qty=$%.2f …", tp_price, tp_qty)
            tp_sig = await client.set_tp(SYMBOL, tp_price, tp_qty)
            results["tp_tx_returned"] = bool(tp_sig)
            results["tp_tx_non_empty"] = len(tp_sig) > 10
            log.info("set_tp tx: %s", tp_sig)
            await asyncio.sleep(3)

            # --- Step 6: get_position raises when flat (wrong symbol) ---
            no_pos = await client.get_position("BTC")
            results["get_position_none_when_flat"] = (no_pos is None)
            log.info("get_position(BTC) = %s (expected None)", no_pos)

    finally:
        # --- Cleanup: always close the position ---
        log.info("Cleanup: closing %s position …", SYMBOL)
        try:
            close_sig = await client.close_position(SYMBOL)
            results["close_tx_returned"] = bool(close_sig)
            results["close_tx_non_empty"] = len(close_sig) > 10
            log.info("close_position tx: %s", close_sig)
        except RuntimeError as e:
            log.warning("close_position skipped (no open position): %s", e)
            results["close_tx_returned"] = True   # acceptable — nothing to close
            results["close_tx_non_empty"] = True
        except Exception as e:
            log.error("Cleanup close failed: %s", e)
            results["close_tx_returned"] = False
            results["close_tx_non_empty"] = False

        await client.close()

    # --- Summary ---
    print()
    print("=" * 55)
    print("JC10 — JupiterClient mainnet SUMMARY")
    print("=" * 55)
    all_pass = True
    checks = [
        ("get_balance_returns_float",   "get_balance() returns a float"),
        ("sufficient_balance",          f"USDC balance >= ${MIN_BALANCE_USD:.1f}"),
        ("open_tx_returned",            "open_position returned a tx signature"),
        ("open_tx_non_empty",           "open tx signature is non-empty"),
        ("position_exists",             "get_position() shows position after open"),
        ("position_side_correct",       f"position side == '{SIDE}'"),
        ("position_size_positive",      "position size_usd > 0"),
        ("position_has_entry_price",    "position entry_price > 0"),
        ("sl_tx_returned",              "set_sl returned a tx signature"),
        ("sl_tx_non_empty",             "SL tx signature is non-empty"),
        ("tp_tx_returned",              "set_tp returned a tx signature"),
        ("tp_tx_non_empty",             "TP tx signature is non-empty"),
        ("get_position_none_when_flat", "get_position returns None for flat symbol"),
        ("close_tx_returned",           "close_position returned a tx signature"),
        ("close_tx_non_empty",          "close tx signature is non-empty"),
    ]
    for key, label in checks:
        ok = results.get(key)
        if ok is None:
            status = "SKIP"
        else:
            status = "PASS" if ok else "FAIL"
            if not ok:
                all_pass = False
        print(f"  {status}  {label}")

    print()
    if all_pass:
        print("ALL CHECKS PASSED — JC10 done")
    else:
        print("SOME CHECKS FAILED — see logs above")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
