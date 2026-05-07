"""
TradeLikeMe — Devnet Demo Script

Runs the full agent pipeline on Solana devnet for a 2-coin demo watchlist
(SOLUSDT, BTCUSDT).  Instead of waiting hours for price to enter a zone,
the script injects a synthetic ZONE_TOUCH event immediately after the zone
scan completes so the trade flow can be recorded for the demo video.

Usage:
    # Full devnet run (places real orders on devnet):
    DEVNET_MODE=1 python trading_agent/devnet_demo.py

    # Dry-run (skips actual Zeta order placement, logs everything):
    DRY_RUN=1 DEVNET_MODE=1 python trading_agent/devnet_demo.py

Flags:
    DRY_RUN=1    — Skip real exchange calls; mock balances/orders/prices.
    DEVNET_MODE=1 — Use devnet endpoints (always set for this script).
"""
import asyncio
import logging
import os
import sys
import time

# L6 fix: load_dotenv() is called once in trading_agent.base.config — no need here.

# ---------------------------------------------------------------------------
# Logging setup — timestamps + INFO level
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("devnet_demo")

# ---------------------------------------------------------------------------
# Imports (after logging so early failures are visible)
# ---------------------------------------------------------------------------

from trading_agent.exchanges.solana.zeta_client import ZetaClient
from trading_agent.exchanges.solana.pyth_ws import PythPriceFeed
from trading_agent.strategies.sd_zones.loop import LoopOrchestrator, LEVERAGE, MARGIN_PCT
from trading_agent.strategies.sd_zones.zones import scan_tf_stack, find_tp_levels, find_sl_level, Zone
from trading_agent.base.exchange_base import ExchangeBase

# ---------------------------------------------------------------------------
# Demo constants
# ---------------------------------------------------------------------------

DEMO_WATCHLIST = ["SOLUSDT", "BTCUSDT"]
DEMO_NETWORK   = "devnet"
DRY_RUN        = os.getenv("DRY_RUN", "0") == "1"

# ---------------------------------------------------------------------------
# Mock exchange client (used when DRY_RUN=1)
# ---------------------------------------------------------------------------


class MockExchange(ExchangeBase):
    """
    Fake exchange that logs every call without touching Zeta Markets.
    Used when DRY_RUN=1 so the demo can run without devnet funds or
    a live RPC connection.
    """

    async def get_balance(self) -> float:
        logger.info("[DRY_RUN] get_balance → $100.00 (mock)")
        return 100.0

    async def get_price(self, symbol: str) -> float:
        # Return plausible prices so position sizing maths work
        prices = {"SOL": 180.0, "BTC": 65000.0, "ETH": 3500.0}
        base = symbol.removesuffix("USDT").removesuffix("USD")
        price = prices.get(base, 1.0)
        logger.info("[DRY_RUN] get_price(%s) → %.2f (mock)", symbol, price)
        return price

    async def open_position(self, symbol: str, side: str, size: float, leverage: float) -> str:
        tx = f"MOCK_TX_OPEN_{symbol}_{side}_{int(time.time())}"
        logger.info("[DRY_RUN] open_position %s %s size=%.4f leverage=%dx → %s", side, symbol, size, leverage, tx)
        return tx

    async def close_position(self, symbol: str) -> str:
        tx = f"MOCK_TX_CLOSE_{symbol}_{int(time.time())}"
        logger.info("[DRY_RUN] close_position %s → %s", symbol, tx)
        return tx

    async def set_sl(self, symbol: str, price: float) -> str:
        tx = f"MOCK_TX_SL_{symbol}_{int(time.time())}"
        logger.info("[DRY_RUN] set_sl %s @ %.4f → %s", symbol, price, tx)
        return tx

    async def cancel_sl(self, symbol: str) -> str:
        tx = f"MOCK_TX_CANCEL_SL_{symbol}_{int(time.time())}"
        logger.info("[DRY_RUN] cancel_sl %s → %s", symbol, tx)
        return tx

    async def set_tp(self, symbol: str, price: float, qty: float) -> str:
        tx = f"MOCK_TX_TP_{symbol}_{int(time.time())}"
        logger.info("[DRY_RUN] set_tp %s @ %.4f qty=%.4f → %s", symbol, price, qty, tx)
        return tx

    async def cancel_tp(self, symbol: str) -> str:
        tx = f"MOCK_TX_CANCEL_TP_{symbol}_{int(time.time())}"
        logger.info("[DRY_RUN] cancel_tp %s → %s", symbol, tx)
        return tx

    async def get_position(self, symbol: str):
        logger.info("[DRY_RUN] get_position(%s) → None (no open position)", symbol)
        return None


# ---------------------------------------------------------------------------
# Mock Pyth feed (used when DRY_RUN=1)
# ---------------------------------------------------------------------------


class MockPyth:
    """Minimal Pyth stub that returns static prices without a WS connection."""

    _PRICES = {"SOL/USD": 180.0, "BTC/USD": 65000.0, "ETH/USD": 3500.0}

    async def connect(self) -> None:
        logger.info("[DRY_RUN] MockPyth.connect() — no WS needed")

    async def subscribe(self, symbol: str, callback=None) -> None:
        logger.info("[DRY_RUN] MockPyth.subscribe(%s)", symbol)

    def get_price(self, symbol: str) -> float | None:
        return self._PRICES.get(symbol)

    async def get_price_rest(self, symbol: str) -> float | None:
        return self._PRICES.get(symbol)

    async def disconnect(self) -> None:
        logger.info("[DRY_RUN] MockPyth.disconnect()")


# ---------------------------------------------------------------------------
# Zone scan with fallback synthetic zones
# ---------------------------------------------------------------------------


async def scan_zones_for_demo(symbol: str) -> list[Zone]:
    """
    Scan zones for *symbol*.  If the KLineChart server is not running or the
    scan times out, fall back to a set of synthetic zones so the demo flow
    can continue.  The synthetic zones are labelled clearly in the logs.
    """
    try:
        logger.info("Scanning zones for %s (full TF stack)…", symbol)
        zones = await scan_tf_stack(symbol)
        logger.info("Zone scan complete for %s — %d zone(s) found", symbol, len(zones))
        return zones
    except Exception as exc:
        logger.warning(
            "Zone scan failed for %s (%s) — using synthetic zones for demo", symbol, exc
        )
        return _synthetic_zones(symbol)


def _synthetic_zones(symbol: str) -> list[Zone]:
    """
    Return a minimal set of plausible synthetic zones for the demo video.
    These are used only when the chart server is unavailable.
    """
    prices = {
        "SOLUSDT": 180.0,
        "BTCUSDT": 65000.0,
    }
    base_price = prices.get(symbol, 100.0)

    # A demand zone ~2% below current price + a supply zone ~3% above
    demand_top    = round(base_price * 0.985, 2)
    demand_bottom = round(base_price * 0.975, 2)
    supply_bottom = round(base_price * 1.025, 2)
    supply_top    = round(base_price * 1.035, 2)

    logger.info(
        "Synthetic zones for %s: demand %.2f–%.2f | supply %.2f–%.2f",
        symbol, demand_bottom, demand_top, supply_bottom, supply_top,
    )

    return [
        Zone(type="demand", top=demand_top, bottom=demand_bottom,
             strength="strong", tf="4H", symbol=symbol,
             notes="[SYNTHETIC — demo fallback]"),
        Zone(type="supply", top=supply_top, bottom=supply_bottom,
             strength="moderate", tf="4H", symbol=symbol,
             notes="[SYNTHETIC — demo fallback]"),
    ]


# ---------------------------------------------------------------------------
# Demo entry injection
# ---------------------------------------------------------------------------


async def inject_zone_touch(
    loop: LoopOrchestrator,
    symbol: str,
    zones: list[Zone],
    pyth: "PythPriceFeed | MockPyth",
) -> bool:
    """
    Find the first demand zone for *symbol*, compute entry price as zone midpoint,
    and call loop._on_zone_touch() directly to simulate a sentinel ZONE_TOUCH event.

    Returns True if the injection succeeded (zone found + entry attempted).
    """
    demand_zones = [z for z in zones if z.type == "demand"]
    if not demand_zones:
        logger.warning("inject_zone_touch: no demand zones found for %s", symbol)
        return False

    zone = demand_zones[0]
    entry_price = (zone.top + zone.bottom) / 2.0

    logger.info(
        "Injecting synthetic ZONE_TOUCH for %s @ %.4f "
        "(demand zone %.4f–%.4f tf=%s strength=%s)",
        symbol, entry_price, zone.bottom, zone.top, zone.tf, zone.strength,
    )

    # Store zones in loop state so _on_zone_touch can find the touching zone
    loop._zones[symbol] = [
        {
            "type":     z.type,
            "top":      z.top,
            "bottom":   z.bottom,
            "strength": z.strength,
            "tf":       z.tf,
            "direction": "long" if z.type == "demand" else "short",
        }
        for z in zones
    ]

    # Set loop state to allow entry (bypass startup gate for demo purposes)
    loop._scan_complete = True

    try:
        await loop._on_zone_touch(symbol, entry_price, loop._zones[symbol])
        return True
    except Exception as exc:
        logger.error("inject_zone_touch: _on_zone_touch failed for %s: %s", symbol, exc)
        return False


# ---------------------------------------------------------------------------
# Main demo flow
# ---------------------------------------------------------------------------


async def run_demo() -> None:
    print()
    print("=" * 60)
    print("  TradeLikeMe Devnet Demo")
    print(f"  Network : {DEMO_NETWORK}")
    print(f"  DRY_RUN : {DRY_RUN}")
    print(f"  Coins   : {', '.join(DEMO_WATCHLIST)}")
    print("=" * 60)
    print()

    # --- Initialise exchange and Pyth ---
    if DRY_RUN:
        logger.info("DRY_RUN mode — using mock exchange and Pyth feed")
        client: ExchangeBase = MockExchange()
        pyth = MockPyth()
    else:
        logger.info("Connecting to Zeta Markets devnet…")
        client = ZetaClient(DEMO_NETWORK)
        pyth = PythPriceFeed(DEMO_NETWORK)

        try:
            await client.initialise()
            logger.info("ZetaClient initialised successfully")
        except Exception as exc:
            logger.error("ZetaClient.initialise() failed: %s", exc)
            logger.warning("Falling back to DRY_RUN mode for demo")
            client = MockExchange()
            pyth = MockPyth()

    # --- Connect Pyth ---
    try:
        await pyth.connect()
    except Exception as exc:
        logger.warning("Pyth connect failed (%s) — continuing without live prices", exc)

    # --- Build the loop orchestrator directly (so we control it) ---
    loop = LoopOrchestrator(client, pyth)

    # Pre-load balance so entry gate maths work without a live exchange call
    try:
        loop._balance = await client.get_balance()
        loop._initial_balance = loop._balance
        logger.info("Balance: $%.2f USDC", loop._balance)
    except Exception as exc:
        logger.warning("get_balance failed (%s) — using $100 placeholder", exc)
        loop._balance = 100.0
        loop._initial_balance = 100.0

    # --- Zone scan for each demo coin ---
    all_zones: dict[str, list[Zone]] = {}
    for symbol in DEMO_WATCHLIST:
        zones = await scan_zones_for_demo(symbol)
        all_zones[symbol] = zones

    # --- Inject synthetic ZONE_TOUCH for the first coin that has a demand zone ---
    injected = False
    for symbol in DEMO_WATCHLIST:
        zones = all_zones[symbol]
        if not zones:
            logger.info("No zones found for %s — skipping injection", symbol)
            continue

        logger.info("")
        logger.info("Zone scan complete for all demo coins.")
        logger.info("Injecting synthetic ZONE_TOUCH for %s to demonstrate trade flow…", symbol)

        success = await inject_zone_touch(loop, symbol, zones, pyth)
        if success:
            injected = True
            logger.info("ZONE_TOUCH injection complete for %s", symbol)
            break
        else:
            logger.warning("Injection failed for %s — trying next coin", symbol)

    if not injected:
        logger.warning("Could not inject ZONE_TOUCH for any demo coin — no demand zones found")

    # --- Wait 5 seconds, then print trade summary ---
    logger.info("Waiting 5 seconds for order flow to settle…")
    await asyncio.sleep(5)

    open_trades = loop._trade_agent.get_open_trades()
    print()
    print("=" * 60)
    print(f"  Open trades after demo injection: {len(open_trades)}")
    print("=" * 60)
    if open_trades:
        for trade in open_trades:
            print(f"  Symbol    : {trade.symbol}")
            print(f"  Side      : {trade.side.upper()}")
            print(f"  Entry     : {trade.entry_price:.4f}")
            print(f"  Size      : {trade.size:.4f}")
            print(f"  TP1       : {trade.tp1_price:.4f}")
            print(f"  TP2       : {trade.tp2_price:.4f}")
            print(f"  SL        : {trade.sl_price:.4f}")
            print(f"  Disaster SL: {trade.disaster_sl_price:.4f}")
            print(f"  Status    : {trade.status}")
            print()
    else:
        print("  (No trades entered — check logs for gate rejections)")
    print("=" * 60)
    print()

    # --- Run for 30 seconds then shut down ---
    logger.info("Demo running for 30 seconds. Press Ctrl+C to stop early.")
    try:
        await asyncio.sleep(30)
    except asyncio.CancelledError:
        pass
    except KeyboardInterrupt:
        pass

    logger.info("Demo complete — shutting down…")

    # Graceful cleanup
    try:
        await loop.shutdown()
    except Exception as exc:
        logger.warning("loop.shutdown() error (non-fatal): %s", exc)

    if not DRY_RUN:
        try:
            await client.close()
        except Exception as exc:
            logger.warning("client.close() error (non-fatal): %s", exc)

    logger.info("Demo finished.")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    # Force DEVNET_MODE for safety
    os.environ.setdefault("DEVNET_MODE", "1")
    os.environ.setdefault("NETWORK", "devnet")

    try:
        asyncio.run(run_demo())
    except KeyboardInterrupt:
        print("\nDemo stopped by user.")
        sys.exit(0)
