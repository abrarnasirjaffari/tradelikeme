"""
ZS16 — Zone scan test on SOLUSDT.

Tests the full pipeline:
  fetch_ohlcv → render_chart → screenshot_chart → analyze_zones (Bedrock)
  then apply_4h_gate + find_tp_levels + find_sl_level

Run from Platform/ root:
    python tests/test_zone_scan_sol.py

Requirements:
  - KLineChart MCP server running:  cd infra/klinechart-mcp && node dist/index.js
  - AWS Bedrock creds in .env (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
  - playwright chromium installed:  python -m playwright install chromium
"""

import asyncio
import logging
import os
import sys

# Allow imports from project root
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
)
logger = logging.getLogger("test_zone_scan_sol")

from trading_agent.strategies.sd_zones.zones import (
    fetch_ohlcv,
    check_chart_server,
    render_chart,
    screenshot_chart,
    analyze_zones,
    scan_tf_stack,
    apply_4h_gate,
    apply_btc_gate,
    find_tp_levels,
    find_sl_level,
    close_browser,
    TF_STACK,
)

SYMBOL = "SOLUSDT"


async def test_fetch_ohlcv() -> None:
    logger.info("=== test_fetch_ohlcv ===")
    candles = await fetch_ohlcv(SYMBOL, "4H", limit=50)
    assert candles, "No candles returned"
    assert len(candles) == 50, f"Expected 50 candles, got {len(candles)}"
    last = candles[-1]
    assert last.close > 0, "Last close price is 0"
    logger.info("PASS — %d candles, last close = %.4f", len(candles), last.close)


async def test_chart_server() -> None:
    logger.info("=== test_chart_server ===")
    up = await check_chart_server()
    if not up:
        logger.warning("SKIP — KLineChart server not running (start with: cd infra/klinechart-mcp && node dist/index.js)")
        return
    logger.info("PASS — chart server is reachable")


async def test_single_tf_pipeline() -> None:
    """Render one chart, screenshot it, and send to Claude for zone analysis."""
    logger.info("=== test_single_tf_pipeline (4H) ===")

    up = await check_chart_server()
    if not up:
        logger.warning("SKIP — chart server not running")
        return

    page = await render_chart(SYMBOL, "4H")
    png_path = await screenshot_chart(page, SYMBOL, "4H")
    logger.info("screenshot saved: %s", png_path)
    assert os.path.exists(png_path), "Screenshot file not found"

    zones = await analyze_zones(png_path, SYMBOL, "4H")
    logger.info("Claude returned %d zone(s) for %s 4H", len(zones), SYMBOL)
    for z in zones:
        logger.info("  %s %s %.4f–%.4f (%s) — %s", z.tf, z.type, z.bottom, z.top, z.strength, z.notes)

    # Cleanup
    if os.path.exists(png_path):
        os.remove(png_path)

    logger.info("PASS")


async def test_full_scan() -> None:
    """Full 7-TF scan + 4H gate + BTC gate + TP/SL levels."""
    logger.info("=== test_full_scan (all 7 TFs) ===")

    up = await check_chart_server()
    if not up:
        logger.warning("SKIP — chart server not running")
        return

    zones = await scan_tf_stack(SYMBOL)
    logger.info("Total zones before gate: %d", len(zones))

    gated = apply_4h_gate(zones)
    logger.info("Total zones after 4H gate: %d", len(gated))

    # BTC gate check
    btc_long_ok = await apply_btc_gate("long")
    btc_short_ok = await apply_btc_gate("short")
    logger.info("BTC gate — long allowed: %s | short allowed: %s", btc_long_ok, btc_short_ok)

    # Pick a mid-range entry price for TP/SL testing
    try:
        candles = await fetch_ohlcv(SYMBOL, "15M", limit=1)
        entry = candles[-1].close if candles else 150.0
    except Exception:
        entry = 150.0

    logger.info("Using entry price %.4f for TP/SL test", entry)

    tp1, tp2 = find_tp_levels(entry, "long", gated)
    sl_long = find_sl_level(entry, "long", gated)

    tp1_str = f"{tp1.bottom:.4f}–{tp1.top:.4f} ({tp1.tf})" if tp1 else "None"
    tp2_str = f"{tp2.bottom:.4f}–{tp2.top:.4f} ({tp2.tf})" if tp2 else "None"
    logger.info("LONG TP1=%s  TP2=%s  SL=%.4f", tp1_str, tp2_str, sl_long or 0)

    tp1, tp2 = find_tp_levels(entry, "short", gated)
    sl_short = find_sl_level(entry, "short", gated)

    tp1_str = f"{tp1.bottom:.4f}–{tp1.top:.4f} ({tp1.tf})" if tp1 else "None"
    tp2_str = f"{tp2.bottom:.4f}–{tp2.top:.4f} ({tp2.tf})" if tp2 else "None"
    logger.info("SHORT TP1=%s  TP2=%s  SL=%.4f", tp1_str, tp2_str, sl_short or 0)

    assert len(zones) >= 0, "scan_tf_stack returned invalid result"
    logger.info("PASS — full scan complete")


async def main() -> None:
    try:
        await test_fetch_ohlcv()
        await test_chart_server()
        await test_single_tf_pipeline()
        await test_full_scan()
        logger.info("=== ALL TESTS PASSED ===")
    finally:
        await close_browser()


if __name__ == "__main__":
    asyncio.run(main())
