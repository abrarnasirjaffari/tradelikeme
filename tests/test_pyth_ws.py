"""
PY8 — Test pyth_ws.py on devnet
Confirms SOL/BTC/ETH prices stream via WebSocket and REST fallback works.
Run: python tests/test_pyth_ws.py
"""
import asyncio
import logging
import sys
import os

# Allow running from repo root
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from trading_agent.exchanges.solana.pyth_ws import PythPriceFeed

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger(__name__)

SYMBOLS = ["SOL/USD", "BTC/USD", "ETH/USD"]
TIMEOUT_SECONDS = 15


async def test_rest_fallback(feed: PythPriceFeed) -> dict[str, float]:
    """PY9 — REST fallback: fetch price without WebSocket."""
    log.info("--- REST fallback ---")
    prices = {}
    for sym in SYMBOLS:
        price = await feed.get_price_rest(sym)
        if price is None:
            log.error("FAIL REST %s: got None", sym)
        else:
            log.info("OK   REST %s = %.4f", sym, price)
            prices[sym] = price
    return prices


async def test_ws_streaming(feed: PythPriceFeed) -> dict[str, float]:
    """PY3-PY7 — WebSocket: connect, subscribe, receive ticks."""
    log.info("--- WebSocket streaming ---")
    received: dict[str, float] = {}

    async def on_tick(symbol: str, price: float) -> None:
        if symbol not in received:
            log.info("OK   WS   %s = %.4f  (first tick)", symbol, price)
        received[symbol] = price

    await feed.connect()
    for sym in SYMBOLS:
        await feed.subscribe(sym, callback=on_tick)

    deadline = asyncio.get_event_loop().time() + TIMEOUT_SECONDS
    while len(received) < len(SYMBOLS):
        if asyncio.get_event_loop().time() > deadline:
            missing = [s for s in SYMBOLS if s not in received]
            log.error("TIMEOUT — no tick received for: %s", missing)
            break
        await asyncio.sleep(0.2)

    await feed.disconnect()
    return received


async def main() -> None:
    feed = PythPriceFeed(network="devnet")

    rest_prices = await test_rest_fallback(feed)

    ws_prices = await test_ws_streaming(feed)

    print()
    print("=" * 50)
    print("SUMMARY")
    print("=" * 50)
    all_pass = True
    for sym in SYMBOLS:
        rest_ok = sym in rest_prices
        ws_ok = sym in ws_prices
        status = "PASS" if (rest_ok and ws_ok) else "FAIL"
        if status == "FAIL":
            all_pass = False
        rest_val = f"{rest_prices[sym]:.4f}" if rest_ok else "MISSING"
        ws_val   = f"{ws_prices[sym]:.4f}"   if ws_ok   else "MISSING"
        print(f"  {status}  {sym:<12}  REST={rest_val}  WS={ws_val}")

    print()
    if all_pass:
        print("ALL CHECKS PASSED — PY8 done")
    else:
        print("SOME CHECKS FAILED — see logs above")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
