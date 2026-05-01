"""
LO10 — Test loop startup + zone scan on devnet.

Two test layers:
  1. Unit tests (always run) — mock exchange + mock Pyth. Verify startup/shutdown
     machinery, gate logic, slot enforcement, and balance checks without any
     network calls.
  2. Integration test (skipped if chart server is not running) — real zone scan
     on SOLUSDT across all 7 TFs via KLineChart + Bedrock.

Run from Platform/ root:
    python tests/test_loop_startup.py

For the integration test also start the chart server:
    cd infra/klinechart-mcp && node dist/index.js
"""
import asyncio
import logging
import os
import sys
from typing import Callable

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
)
log = logging.getLogger("test_loop_startup")

from trading_agent.base.exchange_base import ExchangeBase
from trading_agent.strategies.sd_zones.loop import (
    LoopOrchestrator,
    MAX_AT_RISK_SLOTS,
    MIN_BALANCE_USD,
)


# ---------------------------------------------------------------------------
# Mocks
# ---------------------------------------------------------------------------

class MockExchange(ExchangeBase):
    """Minimal ExchangeBase that returns configurable balance and no-ops orders."""

    def __init__(self, balance: float = 100.0):
        self._balance = balance

    async def get_balance(self) -> float:
        return self._balance

    async def get_price(self, symbol: str) -> float:
        return 100.0

    async def open_position(self, symbol: str, side: str, size: float, leverage: int) -> dict:
        return {"order_id": "mock-open"}

    async def close_position(self, symbol: str) -> dict:
        return {"order_id": "mock-close"}

    async def set_sl(self, symbol: str, price: float) -> dict:
        return {"order_id": "mock-sl"}

    async def set_tp(self, symbol: str, price: float, qty: float) -> dict:
        return {"order_id": "mock-tp"}

    async def get_position(self, symbol: str) -> dict | None:
        return None


class MockPythPriceFeed:
    """No-network Pyth stand-in."""

    def __init__(self):
        self._prices: dict[str, float] = {}
        self._callbacks: dict[str, list[Callable]] = {}

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
        return self._prices.get(symbol)

    async def push(self, symbol: str, price: float) -> None:
        self._prices[symbol] = price
        for cb in self._callbacks.get(symbol, []):
            await cb(symbol, price)


def _assert(condition: bool, msg: str) -> None:
    if not condition:
        log.error("FAIL: %s", msg)
        sys.exit(1)
    log.info("PASS: %s", msg)


# ---------------------------------------------------------------------------
# Patch scan_tf_stack to return stub zones (avoids Playwright + Bedrock)
# ---------------------------------------------------------------------------

_STUB_ZONES = [
    {"type": "demand", "top": 155.0, "bottom": 150.0, "tf": "4H", "strength": "strong",
     "direction": "long", "notes": "stub demand zone"},
    {"type": "supply", "top": 170.0, "bottom": 165.0, "tf": "4H", "strength": "strong",
     "direction": "short", "notes": "stub supply zone"},
]


async def _stub_scan_tf_stack(symbol: str):
    """Returns stub zones immediately — no chart server or Bedrock needed."""
    return _STUB_ZONES


def _patch_scan(monkeypatch_target: str = "trading_agent.strategies.sd_zones.loop") -> None:
    import trading_agent.strategies.sd_zones.loop as loop_mod
    loop_mod.scan_tf_stack = _stub_scan_tf_stack


async def _stub_apply_btc_gate(direction: str) -> bool:
    return True


def _patch_btc_gate() -> None:
    import trading_agent.strategies.sd_zones.loop as loop_mod
    loop_mod.apply_btc_gate = _stub_apply_btc_gate


# ---------------------------------------------------------------------------
# Test 1 — startup sets _scan_complete = True and spawns background tasks
# ---------------------------------------------------------------------------

async def test_startup_sets_scan_complete() -> None:
    log.info("--- Test 1: startup sets _scan_complete and spawns tasks ---")
    _patch_scan()
    _patch_btc_gate()

    loop = LoopOrchestrator(MockExchange(balance=100.0), MockPythPriceFeed())
    _assert(not loop._scan_complete, "_scan_complete starts False")

    await loop.startup()

    _assert(loop._scan_complete, "_scan_complete is True after startup")
    _assert(loop._running,       "_running is True after startup")
    _assert(len(loop._tasks) == 3, "3 background tasks spawned (refresh, compound, events)")

    await loop.shutdown()
    _assert(not loop._running, "_running is False after shutdown")
    _assert(len(loop._tasks) == 0, "tasks list cleared after shutdown")


# ---------------------------------------------------------------------------
# Test 2 — balance loaded at startup and MIN_BALANCE gate works
# ---------------------------------------------------------------------------

async def test_balance_loaded_at_startup() -> None:
    log.info("--- Test 2: balance loaded at startup ---")
    _patch_scan()

    loop = LoopOrchestrator(MockExchange(balance=50.0), MockPythPriceFeed())
    await loop.startup()

    _assert(abs(loop._balance - 50.0) < 0.01, f"balance is 50.0, got {loop._balance}")
    _assert(loop._balance >= MIN_BALANCE_USD, "balance above MIN_BALANCE_USD (50 > 35)")

    await loop.shutdown()


async def test_low_balance_blocks_entry_gate() -> None:
    log.info("--- Test 3: low balance blocks entry gate ---")
    _patch_scan()

    loop = LoopOrchestrator(MockExchange(balance=20.0), MockPythPriceFeed())
    await loop.startup()

    _assert(abs(loop._balance - 20.0) < 0.01, "balance is 20.0")
    _assert(not loop._entry_gate_open(), "entry gate BLOCKED when balance < MIN_BALANCE_USD")

    await loop.shutdown()


# ---------------------------------------------------------------------------
# Test 3 — MAX_AT_RISK_SLOTS enforcement via _slots_available
# ---------------------------------------------------------------------------

async def test_slots_available() -> None:
    log.info("--- Test 4: MAX_AT_RISK_SLOTS slot enforcement ---")
    _patch_scan()

    loop = LoopOrchestrator(MockExchange(balance=100.0), MockPythPriceFeed())
    await loop.startup()

    # With no open trades, slots should be available
    _assert(loop._slots_available(), "slots available with 0 open trades")

    # Inject fake open trades into trade_agent to simulate full slots
    original_get = loop._trade_agent.get_open_trades
    loop._trade_agent.get_open_trades = lambda: ["trade1", "trade2"]  # MAX_AT_RISK_SLOTS = 2
    _assert(not loop._slots_available(), "slots full with 2 open trades")
    _assert(not loop._entry_gate_open(), "entry gate BLOCKED when slots full")

    loop._trade_agent.get_open_trades = original_get
    await loop.shutdown()


# ---------------------------------------------------------------------------
# Test 4 — check_min_balance refreshes self._balance from exchange
# ---------------------------------------------------------------------------

async def test_check_min_balance_refresh() -> None:
    log.info("--- Test 5: _check_min_balance refreshes balance from exchange ---")
    _patch_scan()

    exchange = MockExchange(balance=100.0)
    loop = LoopOrchestrator(exchange, MockPythPriceFeed())
    await loop.startup()

    _assert(abs(loop._balance - 100.0) < 0.01, "balance starts at 100.0")

    # Simulate exchange balance changing (e.g. profit accrued)
    exchange._balance = 150.0
    result = await loop._check_min_balance()
    _assert(result, "_check_min_balance returns True for 150.0 >= 35.0")
    _assert(abs(loop._balance - 150.0) < 0.01, "balance updated to 150.0 after refresh")

    # Simulate balance dropping below floor
    exchange._balance = 20.0
    result = await loop._check_min_balance()
    _assert(not result, "_check_min_balance returns False for 20.0 < 35.0")
    _assert(abs(loop._balance - 20.0) < 0.01, "balance updated to 20.0")

    await loop.shutdown()


# ---------------------------------------------------------------------------
# Test 5 — shutdown is idempotent (safe to call twice)
# ---------------------------------------------------------------------------

async def test_shutdown_idempotent() -> None:
    log.info("--- Test 6: shutdown is idempotent ---")
    _patch_scan()

    loop = LoopOrchestrator(MockExchange(balance=100.0), MockPythPriceFeed())
    await loop.startup()
    await loop.shutdown()
    await loop.shutdown()  # second call should be a no-op
    _assert(not loop._running, "_running still False after double shutdown")
    log.info("PASS: double shutdown did not raise")


# ---------------------------------------------------------------------------
# Test 6 — startup is idempotent (second call is a no-op)
# ---------------------------------------------------------------------------

async def test_startup_idempotent() -> None:
    log.info("--- Test 7: duplicate startup is a no-op ---")
    _patch_scan()

    loop = LoopOrchestrator(MockExchange(balance=100.0), MockPythPriceFeed())
    await loop.startup()
    task_count_after_first = len(loop._tasks)

    await loop.startup()  # should log a warning and return immediately
    _assert(len(loop._tasks) == task_count_after_first, "no extra tasks spawned on duplicate startup")

    await loop.shutdown()


# ---------------------------------------------------------------------------
# Integration test — real zone scan on SOLUSDT (skipped if server not running)
# ---------------------------------------------------------------------------

async def test_integration_zone_scan() -> None:
    log.info("--- Integration: real zone scan on SOLUSDT (7 TFs) ---")

    # Re-import without patches so real scan_tf_stack is used
    import importlib
    import trading_agent.strategies.sd_zones.loop as loop_mod
    import trading_agent.strategies.sd_zones.zones as zones_mod
    importlib.reload(loop_mod)

    from trading_agent.strategies.sd_zones.zones import check_chart_server, close_browser

    up = await check_chart_server()
    if not up:
        log.warning("SKIP — KLineChart server not running (start: cd infra/klinechart-mcp && node dist/index.js)")
        return

    # Only scan one coin to keep runtime short
    original_watchlist = loop_mod.WATCHLIST
    loop_mod.WATCHLIST = ["SOLUSDT"]

    try:
        loop = loop_mod.LoopOrchestrator(MockExchange(balance=100.0), MockPythPriceFeed())
        await loop.startup()

        _assert(loop._scan_complete, "scan_complete True after real scan")
        sol_zones = loop._zones.get("SOLUSDT", [])
        log.info("SOLUSDT zones from real scan: %d", len(sol_zones))
        for z in sol_zones:
            top = z.top if hasattr(z, "top") else z.get("top", "?")
            bot = z.bottom if hasattr(z, "bottom") else z.get("bottom", "?")
            tf  = z.tf if hasattr(z, "tf") else z.get("tf", "?")
            log.info("  zone %s %.4f–%.4f", tf, bot, top)

        await loop.shutdown()
        log.info("PASS — integration zone scan complete")
    finally:
        loop_mod.WATCHLIST = original_watchlist
        await close_browser()


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

async def main() -> None:
    await test_startup_sets_scan_complete()
    await test_balance_loaded_at_startup()
    await test_low_balance_blocks_entry_gate()
    await test_slots_available()
    await test_check_min_balance_refresh()
    await test_shutdown_idempotent()
    await test_startup_idempotent()
    await test_integration_zone_scan()

    print()
    print("=" * 55)
    print("ALL LOOP STARTUP TESTS PASSED — LO10 done")
    print("=" * 55)


if __name__ == "__main__":
    asyncio.run(main())
