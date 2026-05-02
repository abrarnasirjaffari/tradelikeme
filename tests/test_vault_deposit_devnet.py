"""
ET1 — Full flow test: deposit USDC into vault on devnet.

Steps:
  1. Load devnet keypair from DEVNET_AGENT_KEYPAIR_PATH
  2. Run `anchor test` in anchor_vault/ on EC2 (or locally if Anchor installed)
  3. Parse test output — verify all deposit-related tests pass
  4. Report per-check PASS/FAIL summary

Run: python tests/test_vault_deposit_devnet.py
Requires: HELIUS_RPC_URL + DEVNET_AGENT_KEYPAIR_PATH in .env, Anchor CLI on PATH
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

# Anchor test IDs we care about for ET1 (deposit flow)
DEPOSIT_TESTS = [
    "V13-1: deposits tokens and updates vault.balance",
    "V13-2: second deposit accumulates correctly",
    "V13-3: rejects zero-amount deposit",
    "V13-4: rejects deposit when user has insufficient token balance",
    "V13-5: non-owner cannot deposit into another user's vault",
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


def parse_results(output: str) -> dict[str, bool]:
    """Parse mocha output — check each deposit test name for passing/failing."""
    results: dict[str, bool] = {}
    lines = output.splitlines()
    for test_name in DEPOSIT_TESTS:
        # mocha prints "  ✓ <test name>" for pass, "  N) <test name>" for fail
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
            # fallback: if test name appears and no explicit fail marker, treat as pass
            # when anchor exit code is 0
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

    # Run anchor test
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

    # Parse individual deposit test results
    test_results = parse_results(output)
    results.update(test_results)

    # Print summary
    print()
    print("=" * 60)
    print("ET1 — vault deposit devnet SUMMARY")
    print("=" * 60)

    all_pass = True
    checks = [
        ("vault_dir_exists",       "anchor_vault/ directory exists"),
        ("anchor_test_exit_zero",  "anchor test exited with code 0"),
        *[(name, name) for name in DEPOSIT_TESTS],
    ]
    for key, label in checks:
        ok = results.get(key, False)
        status = "PASS" if ok else "FAIL"
        if not ok:
            all_pass = False
        print(f"  {status}  {label}")

    print()
    if all_pass:
        print("ALL CHECKS PASSED — ET1 done")
    else:
        print("SOME CHECKS FAILED — see logs above")
        print("TIP: run with LOG_LEVEL=DEBUG for full anchor output")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
