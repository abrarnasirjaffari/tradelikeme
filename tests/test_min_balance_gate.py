"""
ET10 — Test MIN_BALANCE gate — trading stops below threshold.

Verifies:
  1. Balance above MIN_BALANCE_USD ($35) → entry gate open
  2. Balance exactly at MIN_BALANCE_USD → entry gate open (boundary)
  3. Balance below MIN_BALANCE_USD → entry gate closed, enter_trade NOT called
  4. Balance drops mid-session (compound cycle refresh) → gate closes
  5. Balance recovers above threshold → gate re-opens
  6. MAX_AT_RISK_SLOTS still enforced independently of balance gate

Run: python tests/test_min_balance_gate.py
No network required — uses mock exchange.
"""
import asyncio
import logging
import os
import sys
from typing import Callable

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from trading_agent.base.exchange_base import ExchangeBase
from trading_agent.exchanges.solana.pyth_ws import PythPriceFeed
from trading_agent.strategies.sd_zones.loop import LoopOrchestrator, MIN_BALANCE_USD, MAX_AT_RISK_SLOTS
from trading_agent.strategies.sd_zones.sentinel import Sentinel
from trading_agent.strategies.sd_zones.trade_agent import TradeAgent

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Mock exchange — balance is settable at runtime
# ---------------------------------------------------------------------------

class MockExchange(ExchangeBase):
    def __init__(self, balance: float = 100.0):
        self._balance = balance
        self.positions: dict[str, dict] = {}
        self.orders: list[dict] = []
        self.enter_trade_calls: list[str] = []   # symbols that were entered

    def set_balance(self, value: float) -> None:
        self._balance = value

    async def get_balance(self) -> float:
        return self._balance

    async def get_price(self, symbol: str) -> float:
        return 150.0

    async def open_position(self, symbol: str, side: str, size: float, leverage: int) -> dict:
        self.enter_trade_calls.append(symbol)
        self.positions[symbol] = {"side": side, "size": size, "entry_price": 150.0}
        return {"status": "ok"}

    async def close_position(self, symbol: str) -> dict:
        self.positions.pop(symbol, None)
        return {"status": "ok"}

    async def set_sl(self, symbol: str, price: float) -> dict:
        return {"status": "ok"}

    async def set_tp(self, symbol: str, price: float, qty: float) -> dict:
        return {"status": "ok"}

    async def get_position(self, symbol: str) -> dict | None:
        return self.positions.get(symbol)

    async def initialise(self) -> None:
        pass

    async def close(self) -> None:
        pass


# ---------------------------------------------------------------------------
# Mock Pyth feed
# ---------------------------------------------------------------------------

class MockPyth:
    def __init__(self):
        self._callbacks: dict[str, list[Callable]] = {}
        self._prices: dict[str, float] = {}

    async def connect(self) -> None:
        pass

    async def disconnect(self) -> None:
        pass

    async def subscribe(self, symbol: str, callback: Callable | None = None) -> None:
        if callback:
            self._callbacks.setdefault(symbol, []).append(callback)

    def get_price(self, symbol: str) -> float | None:
        return self._prices.get(symbol)

    async def get_price_rest(self, symbol: str) -> float | None:
        return 150.0


# ---------------------------------------------------------------------------
# Helper: build a minimal LoopOrchestrator with scan_complete pre-set
# ---------------------------------------------------------------------------

def _make_loop(exchange: MockExchange, balance: float) -> LoopOrchestrator:
    pyth = MockPyth()
    loop = LoopOrchestrator(exchange=exchange, pyth=pyth)
    loop._balance = balance
    loop._scan_complete = True   # skip zone scan for gate tests
    return loop


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

async def test_above_threshold() -> dict[str, bool]:
    """Balance well above $35 → gate open."""
    ex = MockExchange(balance=100.0)
    loop = _make_loop(ex, balance=100.0)

    gate_open = loop._entry_gate_open()
    log.info("balance=$100 gate=%s (expect True)", gate_open)
    return {"above_threshold_gate_open": gate_open is True}


async def test_at_threshold() -> dict[str, bool]:
    """Balance exactly at MIN_BALANCE_USD → gate open (boundary inclusive)."""
    ex = MockExchange(balance=MIN_BALANCE_USD)
    loop = _make_loop(ex, balance=MIN_BALANCE_USD)

    gate_open = loop._entry_gate_open()
    log.info("balance=$%.2f (=MIN) gate=%s (expect True)", MIN_BALANCE_USD, gate_open)
    return {"at_threshold_gate_open": gate_open is True}


async def test_below_threshold() -> dict[str, bool]:
    """Balance below $35 → gate closed, enter_trade never called."""
    ex = MockExchange(balance=MIN_BALANCE_USD - 0.01)
    loop = _make_loop(ex, balance=MIN_BALANCE_USD - 0.01)

    gate_open = loop._entry_gate_open()
    log.info("balance=$%.2f (<MIN) gate=%s (expect False)", MIN_BALANCE_USD - 0.01, gate_open)

    # Confirm check_entry also returns False (gate is first check)
    entry_ok = await loop.check_entry("SOLUSDT", [], "long")
    log.info("check_entry=%s (expect False)", entry_ok)

    return {
        "below_threshold_gate_closed":    gate_open is False,
        "below_threshold_entry_blocked":  entry_ok is False,
    }


async def test_balance_drop_mid_session() -> dict[str, bool]:
    """Balance starts above threshold, drops below, gate closes."""
    ex = MockExchange(balance=50.0)
    loop = _make_loop(ex, balance=50.0)

    gate_before = loop._entry_gate_open()

    # Simulate exchange balance dropping below threshold
    ex.set_balance(20.0)
    await loop._check_min_balance()   # refreshes loop._balance from exchange

    gate_after = loop._entry_gate_open()
    log.info("balance drop: $50→$20  gate_before=%s gate_after=%s", gate_before, gate_after)

    return {
        "gate_open_before_drop":  gate_before is True,
        "gate_closed_after_drop": gate_after is False,
        "balance_cached_updated": abs(loop._balance - 20.0) < 0.01,
    }


async def test_balance_recovery() -> dict[str, bool]:
    """Balance recovers above threshold → gate re-opens."""
    ex = MockExchange(balance=20.0)
    loop = _make_loop(ex, balance=20.0)

    gate_low = loop._entry_gate_open()

    # Balance tops up above threshold
    ex.set_balance(60.0)
    await loop._check_min_balance()

    gate_recovered = loop._entry_gate_open()
    log.info("balance recovery: $20→$60  gate_low=%s gate_recovered=%s", gate_low, gate_recovered)

    return {
        "gate_closed_when_low":      gate_low is False,
        "gate_open_after_recovery":  gate_recovered is True,
    }


async def test_zero_balance() -> dict[str, bool]:
    """Zero balance → gate closed and entry blocked."""
    ex = MockExchange(balance=0.0)
    loop = _make_loop(ex, balance=0.0)

    gate_open  = loop._entry_gate_open()
    entry_ok   = await loop.check_entry("SOLUSDT", [], "long")
    log.info("balance=$0 gate=%s entry=%s", gate_open, entry_ok)

    return {
        "zero_balance_gate_closed":   gate_open is False,
        "zero_balance_entry_blocked": entry_ok is False,
    }


async def test_slots_and_balance_independent() -> dict[str, bool]:
    """
    MAX_AT_RISK_SLOTS and MIN_BALANCE are independent gates.
    Full slots blocks entry even when balance is fine.
    Low balance blocks entry even when slots are free.
    """
    # Case 1: slots full, balance fine → blocked by slots
    ex1 = MockExchange(balance=100.0)
    loop1 = _make_loop(ex1, balance=100.0)
    # Manually fill slots
    for sym in ["SOL", "ETH"]:
        await ex1.open_position(sym, "long", 0.1, 10)
        loop1._trade_agent._trades[sym] = object()  # type: ignore[assignment]

    slots_full_gate = loop1._entry_gate_open()
    log.info("slots_full balance=$100 gate=%s (expect False)", slots_full_gate)

    # Case 2: slots free, balance low → blocked by balance
    ex2 = MockExchange(balance=10.0)
    loop2 = _make_loop(ex2, balance=10.0)

    balance_low_gate = loop2._entry_gate_open()
    log.info("slots_free balance=$10 gate=%s (expect False)", balance_low_gate)

    # Case 3: slots free, balance fine → open
    ex3 = MockExchange(balance=100.0)
    loop3 = _make_loop(ex3, balance=100.0)

    both_ok_gate = loop3._entry_gate_open()
    log.info("slots_free balance=$100 gate=%s (expect True)", both_ok_gate)

    return {
        "full_slots_blocks_entry":   slots_full_gate is False,
        "low_balance_blocks_entry":  balance_low_gate is False,
        "both_ok_gate_open":         both_ok_gate is True,
    }


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

async def main() -> None:
    all_results: dict[str, bool] = {}

    log.info("MIN_BALANCE_USD = $%.2f", MIN_BALANCE_USD)

    log.info("--- test_above_threshold ---")
    all_results.update(await test_above_threshold())

    log.info("--- test_at_threshold ---")
    all_results.update(await test_at_threshold())

    log.info("--- test_below_threshold ---")
    all_results.update(await test_below_threshold())

    log.info("--- test_balance_drop_mid_session ---")
    all_results.update(await test_balance_drop_mid_session())

    log.info("--- test_balance_recovery ---")
    all_results.update(await test_balance_recovery())

    log.info("--- test_zero_balance ---")
    all_results.update(await test_zero_balance())

    log.info("--- test_slots_and_balance_independent ---")
    all_results.update(await test_slots_and_balance_independent())

    # Summary
    print()
    print("=" * 60)
    print("ET10 — MIN_BALANCE gate SUMMARY")
    print("=" * 60)

    checks = [
        ("above_threshold_gate_open",    f"balance $100 (above ${MIN_BALANCE_USD}) → gate open"),
        ("at_threshold_gate_open",       f"balance ${MIN_BALANCE_USD} (exactly at min) → gate open"),
        ("below_threshold_gate_closed",  f"balance ${MIN_BALANCE_USD - 0.01:.2f} (below min) → gate closed"),
        ("below_threshold_entry_blocked", "check_entry() returns False when balance below min"),
        ("gate_open_before_drop",        "gate open before balance drops"),
        ("gate_closed_after_drop",       "gate closes after balance drops to $20"),
        ("balance_cached_updated",       "_check_min_balance() updates cached balance"),
        ("gate_closed_when_low",         "gate closed when balance $20"),
        ("gate_open_after_recovery",     "gate re-opens after balance recovers to $60"),
        ("zero_balance_gate_closed",     "balance $0 → gate closed"),
        ("zero_balance_entry_blocked",   "balance $0 → check_entry() blocked"),
        ("full_slots_blocks_entry",      "MAX_AT_RISK_SLOTS full → gate closed (independent of balance)"),
        ("low_balance_blocks_entry",     "low balance → gate closed (independent of slots)"),
        ("both_ok_gate_open",            "slots free + balance fine → gate open"),
    ]

    all_pass = True
    for key, label in checks:
        ok = all_results.get(key, False)
        status = "PASS" if ok else "FAIL"
        if not ok:
            all_pass = False
        print(f"  {status}  {label}")

    print()
    if all_pass:
        print("ALL CHECKS PASSED — ET10 done")
    else:
        print("SOME CHECKS FAILED — see logs above")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
