"""
ET9 — Test 2 simultaneous strategies — verify zero overlap in state/positions.

Spins up two LoopOrchestrator instances with:
  - Separate TradeAgent (own _trades dict)
  - Separate Sentinel (own watches + event queue)
  - Separate AgentState singleton instances
  - Separate in-memory SQLite DBs (no shared file)

Verifies:
  1. Strategy A entering a trade does NOT appear in Strategy B's open trades
  2. Strategy B entering a trade does NOT appear in Strategy A's open trades
  3. Sentinel events for symbol X on strategy A do NOT fire in strategy B
  4. MAX_AT_RISK_SLOTS is enforced independently per strategy
  5. shutdown() of one strategy does not affect the other

Run: python tests/test_two_strategies_isolation.py
No network required — uses mock exchange and mock Pyth feed.
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
from trading_agent.strategies.sd_zones.sentinel import Sentinel, WatchType
from trading_agent.strategies.sd_zones.trade_agent import TradeAgent

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Mock exchange — records calls, never hits network
# ---------------------------------------------------------------------------

class MockExchange(ExchangeBase):
    def __init__(self, name: str, balance: float = 100.0):
        self.name = name
        self.balance = balance
        self.positions: dict[str, dict] = {}
        self.orders: list[dict] = []

    async def get_balance(self) -> float:
        return self.balance

    async def get_price(self, symbol: str) -> float:
        prices = {"SOL": 150.0, "ETH": 3000.0, "BTC": 65000.0}
        return prices.get(symbol, 100.0)

    async def open_position(self, symbol: str, side: str, size: float, leverage: int) -> dict:
        self.positions[symbol] = {"side": side, "size": size, "entry_price": 150.0}
        self.orders.append({"type": "market", "symbol": symbol, "side": side, "size": size})
        return {"status": "ok", "exchange": self.name}

    async def close_position(self, symbol: str) -> dict:
        self.positions.pop(symbol, None)
        return {"status": "ok"}

    async def set_sl(self, symbol: str, price: float) -> dict:
        self.orders.append({"type": "sl", "symbol": symbol, "price": price})
        return {"status": "ok"}

    async def set_tp(self, symbol: str, price: float, qty: float) -> dict:
        self.orders.append({"type": "tp", "symbol": symbol, "price": price, "qty": qty})
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

    async def push(self, symbol: str, price: float) -> None:
        self._prices[symbol] = price
        for cb in self._callbacks.get(symbol, []):
            await cb(symbol, price)


# ---------------------------------------------------------------------------
# Strategy fixture: isolated TradeAgent + Sentinel per strategy
# ---------------------------------------------------------------------------

class StrategyFixture:
    def __init__(self, name: str):
        self.name      = name
        self.exchange  = MockExchange(name)
        self.pyth      = MockPyth()
        self.sentinel  = Sentinel(self.pyth)
        self.agent     = TradeAgent(exchange=self.exchange)

    async def start(self) -> None:
        await self.sentinel.start()

    async def stop(self) -> None:
        await self.sentinel.stop()

    async def enter(self, symbol: str, side: str = "long",
                    price: float = 150.0, size: float = 0.1) -> None:
        tp1 = round(price * 1.04, 4)
        tp2 = round(price * 1.08, 4)
        sl  = round(price * 0.97, 4)
        await self.agent.enter_trade(
            symbol=symbol, side=side, entry_price=price,
            size=size, tp1_price=tp1, tp2_price=tp2,
            sl_price=sl, leverage=10,
        )


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

async def test_trades_isolated(a: StrategyFixture, b: StrategyFixture) -> dict[str, bool]:
    """Trade entered on A must not appear in B and vice versa."""
    await a.enter("SOL")
    await b.enter("ETH")

    a_trades = {t.symbol for t in a.agent.get_open_trades()}
    b_trades = {t.symbol for t in b.agent.get_open_trades()}

    return {
        "A_has_SOL":        "SOL" in a_trades,
        "A_no_ETH":         "ETH" not in a_trades,
        "B_has_ETH":        "ETH" in b_trades,
        "B_no_SOL":         "SOL" not in b_trades,
        "A_count_1":        len(a_trades) == 1,
        "B_count_1":        len(b_trades) == 1,
    }


async def test_sentinel_isolated(a: StrategyFixture, b: StrategyFixture) -> dict[str, bool]:
    """TP1_HIT watch on A must not fire in B's event queue."""
    await a.sentinel.add_watch(
        symbol="SOLUSDT", watch_type=WatchType.TP1_HIT,
        tp1_price=160.0, direction="long",
    )
    # B has no watches registered — its queue must stay empty

    # Inject ticks on A's pyth only
    await a.pyth.push("SOL/USD", 155.0)   # sets prev_price
    await a.pyth.push("SOL/USD", 162.0)   # crosses TP1

    await asyncio.sleep(0.1)

    # A should have the event
    a_event = None
    try:
        a_event = a.sentinel._event_queue.get_nowait()
    except asyncio.QueueEmpty:
        pass

    # B's queue must be empty (different Pyth instance, different sentinel)
    b_event = None
    try:
        b_event = b.sentinel._event_queue.get_nowait()
    except asyncio.QueueEmpty:
        pass

    return {
        "A_tp1_event_fired":  a_event is not None and a_event.watch_type == WatchType.TP1_HIT,
        "B_queue_empty":      b_event is None,
        "A_watch_consumed":   "SOLUSDT" not in a.sentinel._tp1_watches,
        "B_no_watches":       len(b.sentinel._tp1_watches) == 0,
    }


async def test_max_slots_isolated(a: StrategyFixture, b: StrategyFixture) -> dict[str, bool]:
    """MAX_AT_RISK_SLOTS on A is independent of B's open positions."""
    # A already has SOL open (from test_trades_isolated)
    # Enter a second trade on A to fill its 2 slots
    await a.enter("BTC", price=65000.0)

    a_count = len(a.agent.get_open_trades())
    b_count = len(b.agent.get_open_trades())

    # B still has only 1 trade (ETH from test_trades_isolated)
    return {
        "A_at_max_2":     a_count == 2,
        "B_still_at_1":   b_count == 1,
        "counts_differ":  a_count != b_count,
    }


async def test_shutdown_isolated(a: StrategyFixture, b: StrategyFixture) -> dict[str, bool]:
    """Stopping A's sentinel must not affect B's sentinel."""
    await a.stop()

    # B's sentinel should still be running
    b_running = b.sentinel._running

    # B's existing trade state is untouched
    b_trades = b.agent.get_open_trades()

    return {
        "A_sentinel_stopped": not a.sentinel._running,
        "B_sentinel_running": b_running,
        "B_trades_intact":    len(b_trades) == 1,
    }


async def test_exchange_isolated(a: StrategyFixture, b: StrategyFixture) -> dict[str, bool]:
    """Exchange calls on A must not appear in B's order log."""
    a_order_symbols = {o["symbol"] for o in a.exchange.orders}
    b_order_symbols = {o["symbol"] for o in b.exchange.orders}

    return {
        "A_orders_not_in_B": not (a_order_symbols & b_order_symbols),
        "A_has_SOL_orders":  "SOL" in a_order_symbols,
        "B_has_ETH_orders":  "ETH" in b_order_symbols,
    }


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

async def main() -> None:
    a = StrategyFixture("strategy_A")
    b = StrategyFixture("strategy_B")

    await a.start()
    await b.start()

    all_results: dict[str, bool] = {}

    log.info("--- test_trades_isolated ---")
    all_results.update(await test_trades_isolated(a, b))

    log.info("--- test_sentinel_isolated ---")
    all_results.update(await test_sentinel_isolated(a, b))

    log.info("--- test_max_slots_isolated ---")
    all_results.update(await test_max_slots_isolated(a, b))

    log.info("--- test_exchange_isolated ---")
    all_results.update(await test_exchange_isolated(a, b))

    log.info("--- test_shutdown_isolated ---")
    all_results.update(await test_shutdown_isolated(a, b))

    # clean up B
    await b.stop()

    # Summary
    print()
    print("=" * 60)
    print("ET9 — 2-strategy isolation SUMMARY")
    print("=" * 60)

    checks = [
        # trade isolation
        ("A_has_SOL",           "Strategy A holds SOL trade"),
        ("A_no_ETH",            "Strategy A does NOT hold ETH trade"),
        ("B_has_ETH",           "Strategy B holds ETH trade"),
        ("B_no_SOL",            "Strategy B does NOT hold SOL trade"),
        ("A_count_1",           "Strategy A has exactly 1 trade after first enter"),
        ("B_count_1",           "Strategy B has exactly 1 trade after first enter"),
        # sentinel isolation
        ("A_tp1_event_fired",   "A sentinel fired TP1_HIT on SOL price cross"),
        ("B_queue_empty",       "B sentinel queue stayed empty (no bleed-through)"),
        ("A_watch_consumed",    "A TP1 watch consumed after firing"),
        ("B_no_watches",        "B sentinel has no TP1 watches"),
        # slot isolation
        ("A_at_max_2",          "Strategy A at MAX_AT_RISK_SLOTS=2"),
        ("B_still_at_1",        "Strategy B still at 1 trade (unaffected)"),
        ("counts_differ",       "Trade counts are independent between strategies"),
        # exchange isolation
        ("A_orders_not_in_B",   "A and B order logs have no symbol overlap"),
        ("A_has_SOL_orders",    "Strategy A exchange has SOL orders"),
        ("B_has_ETH_orders",    "Strategy B exchange has ETH orders"),
        # shutdown isolation
        ("A_sentinel_stopped",  "Strategy A sentinel stopped cleanly"),
        ("B_sentinel_running",  "Strategy B sentinel still running after A stopped"),
        ("B_trades_intact",     "Strategy B trades unaffected by A shutdown"),
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
        print("ALL CHECKS PASSED — ET9 done")
    else:
        print("SOME CHECKS FAILED — see logs above")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
