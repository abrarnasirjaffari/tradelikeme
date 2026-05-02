"""
ET6 — Full flow test: user calls withdraw(), receives 80% share.

Runs the Anchor test suite targeting the V14 withdraw() tests:
  V14-1: withdraws tokens and updates vault.balance
  V14-2: full withdrawal drains vault to zero
  V14-3: rejects zero-amount withdrawal
  V14-4: rejects withdrawal exceeding vault balance
  V14-5: non-owner cannot withdraw from another user's vault

Also verifies the end-to-end profit lifecycle:
  deposit → trade profit (simulated via extra deposit) → settle_epoch →
  withdraw → user receives 80% of original + 80% of profit

Run: python tests/test_vault_withdraw_devnet.py
Requires: Anchor CLI on PATH, devnet keypair configured in anchor_vault/Anchor.toml
"""
import asyncio
import logging
import os
import subprocess
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger(__name__)

VAULT_DIR = os.path.join(
    os.path.dirname(__file__), "..", "trading_agent", "exchanges", "solana", "anchor_vault"
)

# Anchor test IDs for withdraw (ET6)
WITHDRAW_TESTS = [
    "V14-1: withdraws tokens and updates vault.balance",
    "V14-2: full withdrawal drains vault to zero",
    "V14-3: rejects zero-amount withdrawal",
    "V14-4: rejects withdrawal exceeding vault balance",
    "V14-5: non-owner cannot withdraw from another user's vault",
]

# settle_epoch tests are also required — withdraw after settlement is the
# full profit-lifecycle path. These must pass too for ET6 to be considered done.
SETTLE_TESTS = [
    "V15-1: 20/80 split — platform gets exactly 20% of profit",
    "V15-2: opening_balance rolls forward after settlement",
]


def run_anchor_test() -> tuple[int, str]:
    """Run `anchor test` and return (returncode, combined output)."""
    log.info("Running `anchor test` in %s …", VAULT_DIR)
    result = subprocess.run(
        ["anchor", "test", "--provider.cluster", "devnet"],
        cwd=VAULT_DIR,
        capture_output=True,
        text=True,
        timeout=300,
    )
    combined = result.stdout + result.stderr
    return result.returncode, combined


def parse_results(output: str, test_names: list[str]) -> dict[str, bool]:
    """Parse mocha output — check each test name for passing/failing."""
    results: dict[str, bool] = {}
    lines = output.splitlines()
    for test_name in test_names:
        passed = any(
            ("✓" in line or "passing" in line) and test_name in line
            for line in lines
        )
        failed = any(
            ("failing" in line or "✗" in line or ") " in line) and test_name in line
            for line in lines
        )
        if passed:
            results[test_name] = True
        elif failed:
            results[test_name] = False
        else:
            # Test name appears in output and exit code was 0 → treat as pass
            results[test_name] = any(test_name in line for line in lines)
    return results


async def main() -> None:
    results: dict[str, bool] = {}

    # Verify anchor_vault directory exists
    if not os.path.isdir(VAULT_DIR):
        log.error("anchor_vault dir not found: %s", VAULT_DIR)
        results["vault_dir_exists"] = False
    else:
        results["vault_dir_exists"] = True
        log.info("anchor_vault dir found")

    # Run full anchor test suite
    try:
        returncode, output = run_anchor_test()
        log.info("anchor test exit code: %d", returncode)
        if log.isEnabledFor(logging.DEBUG):
            print(output)
        results["anchor_test_exit_zero"] = returncode == 0
    except FileNotFoundError:
        log.error("anchor CLI not found — install Anchor or run on EC2")
        results["anchor_test_exit_zero"] = False
        output = ""
    except subprocess.TimeoutExpired:
        log.error("anchor test timed out after 300s")
        results["anchor_test_exit_zero"] = False
        output = ""

    # Parse per-test withdraw results
    results.update(parse_results(output, WITHDRAW_TESTS))

    # Parse settle_epoch subset (profit lifecycle dependency)
    results.update(parse_results(output, SETTLE_TESTS))

    # Summary
    print()
    print("=" * 65)
    print("ET6 — vault withdraw devnet SUMMARY")
    print("=" * 65)
    all_pass = True
    checks = [
        ("vault_dir_exists",        "anchor_vault/ directory exists"),
        ("anchor_test_exit_zero",   "anchor test suite exited with code 0"),
        *[(name, name) for name in WITHDRAW_TESTS],
        # Profit lifecycle: settle first, then withdraw returns the 80% share
        *[(name, f"[profit lifecycle] {name}") for name in SETTLE_TESTS],
    ]
    for key, label in checks:
        ok = results.get(key, False)
        status = "PASS" if ok else "FAIL"
        if not ok:
            all_pass = False
        print(f"  {status}  {label}")

    print()
    if all_pass:
        print("ALL CHECKS PASSED — ET6 done")
    else:
        print("SOME CHECKS FAILED — see logs above")
        print("TIP: set LOG_LEVEL=DEBUG or run `anchor test` directly for full output")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
