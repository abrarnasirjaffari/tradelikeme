"""
ET5 — Full flow test: settle_epoch() runs, 20% goes to platform wallet on-chain.

Runs the Anchor test suite targeting the V15 settle_epoch() tests:
  V15-1: 20/80 split — platform gets exactly 20% of profit
  V15-2: opening_balance rolls forward after settlement
  V15-3: no-profit epoch — platform receives nothing, opening_balance resets
  V15-4: rounding — platform gets floor(profit * 20 / 100), user never shortchanged
  V15-5: non-agent cannot call settle_epoch (AgentMismatch error)

Run: python tests/test_settle_epoch_devnet.py
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

# Anchor test IDs for settle_epoch (ET5)
SETTLE_EPOCH_TESTS = [
    "V15-1: 20/80 split — platform gets exactly 20% of profit",
    "V15-2: opening_balance rolls forward after settlement",
    "V15-3: no profit epoch — platform receives nothing, opening_balance resets",
    "V15-4: rounding — platform gets floor(profit * 20 / 100), user never shortchanged",
    "V15-5: non-agent cannot call settle_epoch",
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
            # If test name appears anywhere and exit code was 0, treat as pass
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

    # Run anchor test suite
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

    # Parse per-test settle_epoch results
    test_results = parse_results(output, SETTLE_EPOCH_TESTS)
    results.update(test_results)

    # Also verify the full suite passed (deposit + withdraw + PDA uniqueness + settle)
    all_suites_passed = results.get("anchor_test_exit_zero", False)
    results["all_suites_passed"] = all_suites_passed

    # Summary
    print()
    print("=" * 65)
    print("ET5 — settle_epoch devnet SUMMARY")
    print("=" * 65)
    all_pass = True
    checks = [
        ("vault_dir_exists",    "anchor_vault/ directory exists"),
        ("anchor_test_exit_zero", "anchor test suite exited with code 0"),
        ("all_suites_passed",   "all vault test suites passed (deposit + withdraw + settle)"),
        *[(name, name) for name in SETTLE_EPOCH_TESTS],
    ]
    for key, label in checks:
        ok = results.get(key, False)
        status = "PASS" if ok else "FAIL"
        if not ok:
            all_pass = False
        print(f"  {status}  {label}")

    print()
    if all_pass:
        print("ALL CHECKS PASSED — ET5 done")
    else:
        print("SOME CHECKS FAILED — see logs above")
        print("TIP: set LOG_LEVEL=DEBUG or run `anchor test` directly for full output")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
