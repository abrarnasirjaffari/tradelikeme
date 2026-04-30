"""
Zone scanner for S/D zone strategy.
Uses KLineChart MCP server (primary) or TradingView MCP (fallback).
"""
import base64
import json
import logging
import os
from dataclasses import dataclass, field
from typing import Literal

import boto3
import httpx
from playwright.async_api import async_playwright, Browser, Page

logger = logging.getLogger(__name__)

# Binance Futures public REST — no API key needed
BINANCE_BASE = "https://fapi.binance.com/fapi/v1"

# Pyth benchmarks TradingView shim — fallback OHLCV source
PYTH_BASE = "https://benchmarks.pyth.network/v1/shims/tradingview"

# TF string (as used throughout this codebase) → Binance kline interval
_TF_TO_BINANCE: dict[str, str] = {
    "1M":  "1M",
    "1W":  "1w",
    "1D":  "1d",
    "4H":  "4h",
    "1H":  "1h",
    "30M": "30m",
    "15M": "15m",
    "5M":  "5m",
}

# TF string → resolution in minutes (for Pyth benchmarks API)
_TF_TO_MINUTES: dict[str, int] = {
    "1M":  43200,
    "1W":  10080,
    "1D":  1440,
    "4H":  240,
    "1H":  60,
    "30M": 30,
    "15M": 15,
    "5M":  5,
}

# Number of candles to fetch per TF
CANDLE_LIMIT = 200


@dataclass
class Candle:
    timestamp: int   # Unix ms
    open: float
    high: float
    low: float
    close: float
    volume: float


async def fetch_ohlcv(symbol: str, tf: str, limit: int = CANDLE_LIMIT) -> list[Candle]:
    """
    Fetch OHLCV candles for *symbol* on *tf* timeframe.

    Primary source: Binance Futures public REST (no key required).
    Fallback: Pyth benchmarks TradingView shim.

    Args:
        symbol: e.g. "SOLUSDT", "BTCUSDT"
        tf: e.g. "4H", "1D", "15M" — must be a key in _TF_TO_BINANCE
        limit: number of candles to fetch (default 200)

    Returns:
        List of Candle objects sorted oldest → newest.

    Raises:
        ValueError: if tf is not recognised
        RuntimeError: if both primary and fallback sources fail
    """
    if tf not in _TF_TO_BINANCE:
        raise ValueError(f"Unknown timeframe '{tf}'. Valid: {list(_TF_TO_BINANCE)}")

    candles = await _fetch_binance(symbol, tf, limit)
    if candles:
        return candles

    logger.warning("Binance fetch failed for %s %s — trying Pyth fallback", symbol, tf)
    candles = await _fetch_pyth(symbol, tf, limit)
    if candles:
        return candles

    raise RuntimeError(f"fetch_ohlcv: both sources failed for {symbol} {tf}")


async def _fetch_binance(symbol: str, tf: str, limit: int) -> list[Candle]:
    interval = _TF_TO_BINANCE[tf]
    url = f"{BINANCE_BASE}/klines"
    params = {"symbol": symbol.upper(), "interval": interval, "limit": limit}
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            rows = resp.json()
            return [
                Candle(
                    timestamp=int(row[0]),
                    open=float(row[1]),
                    high=float(row[2]),
                    low=float(row[3]),
                    close=float(row[4]),
                    volume=float(row[5]),
                )
                for row in rows
            ]
    except Exception as exc:
        logger.error("Binance OHLCV error (%s %s): %s", symbol, tf, exc)
        return []


async def _fetch_pyth(symbol: str, tf: str, limit: int) -> list[Candle]:
    # Convert "SOLUSDT" → "Crypto.SOL/USD"
    base = symbol.upper().removesuffix("USDT").removesuffix("BUSD")
    pyth_symbol = f"Crypto.{base}/USD"

    resolution = str(_TF_TO_MINUTES[tf])
    import time
    to_ts = int(time.time())
    from_ts = to_ts - limit * _TF_TO_MINUTES[tf] * 60

    url = f"{PYTH_BASE}/history"
    params = {
        "symbol": pyth_symbol,
        "resolution": resolution,
        "from": from_ts,
        "to": to_ts,
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
            if data.get("s") != "ok" or not isinstance(data.get("t"), list):
                logger.error("Pyth bad response for %s %s: %s", symbol, tf, data.get("s"))
                return []
            return [
                Candle(
                    timestamp=int(data["t"][i]) * 1000,
                    open=float(data["o"][i]),
                    high=float(data["h"][i]),
                    low=float(data["l"][i]),
                    close=float(data["c"][i]),
                    volume=float(data["v"][i]) if data.get("v") else 0.0,
                )
                for i in range(len(data["t"]))
            ]
    except Exception as exc:
        logger.error("Pyth OHLCV error (%s %s): %s", symbol, tf, exc)
        return []


# ---------------------------------------------------------------------------
# Chart rendering (ZS3)
# ---------------------------------------------------------------------------

# KLineChart MCP server serves the chart page on this port
CHART_SERVER_URL = "http://localhost:8765/klinechart-mcp/chart/index.html"
DATA_READY_TIMEOUT_MS = 20_000

# Module-level browser singleton — reused across multiple render_chart calls
_browser: Browser | None = None
_page: Page | None = None


async def _get_page() -> Page:
    """Return the shared Playwright page, launching the browser if needed."""
    global _browser, _page
    if _browser is None:
        pw = await async_playwright().start()
        _browser = await pw.chromium.launch(headless=True)
        context = await _browser.new_context(viewport={"width": 1400, "height": 700})
        _page = await context.new_page()
    return _page  # type: ignore[return-value]


async def render_chart(symbol: str, tf: str) -> Page:
    """
    Open the KLineChart chart page for *symbol* / *tf* in a headless browser
    and wait until candles have fully loaded (data-ready attribute set).

    Args:
        symbol: e.g. "SOLUSDT"
        tf:     e.g. "4H" — must be a key in _TF_TO_BINANCE

    Returns:
        The live Playwright Page (use screenshot_chart to capture it).

    Raises:
        ValueError: unknown timeframe
        TimeoutError: chart did not become ready within DATA_READY_TIMEOUT_MS
    """
    if tf not in _TF_TO_BINANCE:
        raise ValueError(f"Unknown timeframe '{tf}'. Valid: {list(_TF_TO_BINANCE)}")

    url = f"{CHART_SERVER_URL}?symbol={symbol}&tf={tf}"
    page = await _get_page()

    await page.goto(url, wait_until="domcontentloaded")
    try:
        await page.wait_for_selector(
            "#chart[data-ready='true']",
            state="attached",
            timeout=DATA_READY_TIMEOUT_MS,
        )
    except Exception as exc:
        raise TimeoutError(
            f"render_chart: chart did not become ready for {symbol} {tf} "
            f"within {DATA_READY_TIMEOUT_MS}ms"
        ) from exc

    logger.debug("render_chart: %s %s ready", symbol, tf)
    return page


async def close_browser() -> None:
    """Shut down the shared Playwright browser (call on agent shutdown)."""
    global _browser, _page
    if _browser:
        await _browser.close()
        _browser = None
        _page = None


# ---------------------------------------------------------------------------
# Chart server health check (ZS4)
# ---------------------------------------------------------------------------

CHART_SERVER_HEALTH_URL = "http://localhost:8765/klinechart-mcp/chart/index.html"
_HEALTH_CHECK_TIMEOUT = 5.0  # seconds


async def check_chart_server() -> bool:
    """
    Return True if the KLineChart MCP chart server is reachable, False otherwise.
    Called by scan_tf_stack before starting a zone scan.
    """
    try:
        async with httpx.AsyncClient(timeout=_HEALTH_CHECK_TIMEOUT) as client:
            resp = await client.get(CHART_SERVER_HEALTH_URL)
            return resp.status_code == 200
    except Exception:
        return False


async def screenshot_chart(page: Page, symbol: str, tf: str) -> str:
    """
    Capture a PNG screenshot of *page* and save it to a temp file.

    Args:
        page:   Live Playwright Page returned by render_chart()
        symbol: e.g. "SOLUSDT" — used in the filename for traceability
        tf:     e.g. "4H" — used in the filename

    Returns:
        Absolute path to the saved PNG file.
    """
    import tempfile, os
    fname = f"zone_{symbol}_{tf}.png"
    path = os.path.join(tempfile.gettempdir(), fname)
    await page.screenshot(path=path, type="png")
    logger.debug("screenshot_chart: saved %s", path)
    return path


# ---------------------------------------------------------------------------
# Zone analysis via Claude Opus 4.6 on AWS Bedrock (ZS7 + ZS8 + ZS9)
# ---------------------------------------------------------------------------

BEDROCK_MODEL_ID = "us.anthropic.claude-opus-4-7"
BEDROCK_REGION   = os.getenv("AWS_REGION", "us-east-1")

# Prompt sent to Claude with each chart screenshot (ZS8)
_ZONE_PROMPT = """You are an expert Supply & Demand zone trader analyzing a {tf} chart for {symbol}.

Identify ALL significant Supply and Demand zones visible on this chart.

Rules:
- A DEMAND zone is a price area where buying pressure absorbed selling (accumulation base, V-bottom, W-bottom, flat base). Price should have left this zone impulsively.
- A SUPPLY zone is a price area where selling pressure absorbed buying. Price should have left this zone impulsively.
- Only mark zones with clear impulsive moves AWAY from them (proof of absorption).
- Count candle BODIES to confirm zone TF — a 1D zone needs 3+ daily candle bodies at that level.
- Note any Fair Value Gaps (FVG) — 3-candle gaps where middle candle doesn't overlap the others.
- Note volume at zone if visible — high volume at zone = stronger confirmation.
- Classify strength: STRONG (fresh, never retested), MODERATE (tested once, held), WEAK (tested 2+ times).

Respond with a JSON array only. No explanation, no markdown. Example:
[
  {{"type": "demand", "top": 185.50, "bottom": 182.00, "strength": "strong", "notes": "V-bottom base, high volume"}},
  {{"type": "supply", "top": 210.00, "bottom": 207.50, "strength": "moderate", "notes": "FVG present"}},
  {{"type": "fvg", "top": 195.00, "bottom": 193.50, "strength": "strong", "notes": "bullish FVG, untested"}}
]

If no clear zones are visible, return an empty array: []
"""


@dataclass
class Zone:
    type: Literal["demand", "supply", "fvg"]
    top: float
    bottom: float
    strength: Literal["strong", "moderate", "weak"]
    tf: str
    symbol: str
    notes: str = field(default="")


def _bedrock_client():
    return boto3.client(
        "bedrock-runtime",
        region_name=BEDROCK_REGION,
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    )


async def analyze_zones(png_path: str, symbol: str, tf: str) -> list[Zone]:
    """
    Send a chart screenshot to Claude Opus 4.6 via AWS Bedrock and parse
    the returned S/D zone list.

    Args:
        png_path: absolute path to a PNG screenshot from screenshot_chart()
        symbol:   e.g. "SOLUSDT"
        tf:       e.g. "4H"

    Returns:
        List of Zone objects. Empty list if Claude finds no zones or on error.
    """
    import asyncio

    with open(png_path, "rb") as f:
        image_b64 = base64.standard_b64encode(f.read()).decode()

    prompt = _ZONE_PROMPT.format(symbol=symbol, tf=tf)

    body = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 2048,
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/png",
                            "data": image_b64,
                        },
                    },
                    {"type": "text", "text": prompt},
                ],
            }
        ],
    }

    try:
        client = _bedrock_client()
        # boto3 is synchronous — run in thread pool to avoid blocking the event loop
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: client.invoke_model(
                modelId=BEDROCK_MODEL_ID,
                body=json.dumps(body),
                contentType="application/json",
                accept="application/json",
            ),
        )
        raw = json.loads(response["body"].read())
        text = raw["content"][0]["text"].strip()
        return _parse_zones(text, symbol, tf)
    except Exception as exc:
        logger.error("analyze_zones failed for %s %s: %s", symbol, tf, exc)
        return []


def _parse_zones(text: str, symbol: str, tf: str) -> list[Zone]:
    """Parse Claude's JSON response into Zone objects. Returns [] on bad JSON."""
    # Strip accidental markdown fences if present
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]

    try:
        items = json.loads(text.strip())
    except json.JSONDecodeError as exc:
        logger.error("_parse_zones: JSON decode error: %s — raw: %s", exc, text[:200])
        return []

    zones = []
    for item in items:
        try:
            zones.append(
                Zone(
                    type=item["type"],
                    top=float(item["top"]),
                    bottom=float(item["bottom"]),
                    strength=item.get("strength", "moderate"),
                    tf=tf,
                    symbol=symbol,
                    notes=item.get("notes", ""),
                )
            )
        except (KeyError, ValueError) as exc:
            logger.warning("_parse_zones: skipping malformed zone %s: %s", item, exc)

    logger.debug("analyze_zones: %s %s → %d zones", symbol, tf, len(zones))
    return zones


async def assert_chart_server() -> None:
    """
    Raise RuntimeError if the chart server is not reachable.
    scan_tf_stack calls this before opening any charts so the caller
    gets a clear error rather than a per-TF timeout cascade.
    """
    if not await check_chart_server():
        raise RuntimeError(
            "KLineChart chart server is not running on localhost:8765. "
            "Start it with: cd infra/klinechart-mcp && node dist/index.js"
        )


# ---------------------------------------------------------------------------
# Full TF stack scan (ZS10)
# ---------------------------------------------------------------------------

# Strategy TF stack — ordered from highest to lowest timeframe
TF_STACK = ["1M", "1W", "1D", "4H", "1H", "30M", "15M"]


async def scan_tf_stack(symbol: str) -> list[Zone]:
    """
    Scan all 7 timeframes for *symbol* and return every S/D zone found.

    Pipeline per TF:
        render_chart → screenshot_chart → analyze_zones (Claude Opus via Bedrock)

    A failure on a single TF is logged and skipped — the scan continues.
    The chart server health check runs first; raises RuntimeError if not up.

    Args:
        symbol: e.g. "SOLUSDT", "BTCUSDT"

    Returns:
        All Zone objects found across all TFs, ordered TF-stack top → bottom.
    """
    import os

    await assert_chart_server()

    all_zones: list[Zone] = []

    for tf in TF_STACK:
        logger.info("scan_tf_stack: %s %s — rendering chart", symbol, tf)
        png_path: str | None = None
        try:
            page = await render_chart(symbol, tf)
            png_path = await screenshot_chart(page, symbol, tf)
            zones = await analyze_zones(png_path, symbol, tf)
            logger.info(
                "scan_tf_stack: %s %s — %d zone(s) found", symbol, tf, len(zones)
            )
            all_zones.extend(zones)
        except TimeoutError as exc:
            logger.warning("scan_tf_stack: %s %s — chart timeout, skipping: %s", symbol, tf, exc)
        except Exception as exc:
            logger.error("scan_tf_stack: %s %s — unexpected error, skipping: %s", symbol, tf, exc)
        finally:
            if png_path and os.path.exists(png_path):
                try:
                    os.remove(png_path)
                except OSError:
                    pass

    logger.info(
        "scan_tf_stack: %s complete — %d total zone(s) across %d TFs",
        symbol,
        len(all_zones),
        len(TF_STACK),
    )
    return all_zones


# ---------------------------------------------------------------------------
# 4H zone gate (ZS11)
# ---------------------------------------------------------------------------

ZONE_GATE_PCT = 0.05  # lower-TF zone must have a 4H zone within ±5%

# TFs considered "lower" than 4H — these require a 4H zone nearby to be valid
_LOWER_TFS = {"1H", "30M", "15M", "5M"}


def _zones_overlap(a: Zone, b: Zone, pct: float) -> bool:
    """
    Return True if zone *a* and zone *b* are within *pct* of each other.
    Uses midpoint distance relative to the 4H zone midpoint.
    """
    mid_a = (a.top + a.bottom) / 2
    mid_b = (b.top + b.bottom) / 2
    return abs(mid_a - mid_b) / mid_b <= pct


def apply_4h_gate(zones: list[Zone]) -> list[Zone]:
    """
    Filter out lower-TF zones (1H / 30M / 15M / 5M) that have no 4H zone
    within ±ZONE_GATE_PCT (5%) of their midpoint.

    Higher-TF zones (1M / 1W / 1D / 4H) are always kept.

    Args:
        zones: full list returned by scan_tf_stack()

    Returns:
        Filtered list — only zones that pass the 4H gate.
    """
    four_h_zones = [z for z in zones if z.tf == "4H"]

    passed: list[Zone] = []
    for zone in zones:
        if zone.tf not in _LOWER_TFS:
            passed.append(zone)
            continue

        has_nearby_4h = any(_zones_overlap(zone, z4h, ZONE_GATE_PCT) for z4h in four_h_zones)
        if has_nearby_4h:
            passed.append(zone)
        else:
            logger.debug(
                "apply_4h_gate: dropped %s %s zone %.4f–%.4f (no 4H zone within %.0f%%)",
                zone.symbol, zone.tf, zone.bottom, zone.top, ZONE_GATE_PCT * 100,
            )

    logger.info(
        "apply_4h_gate: %d → %d zones (dropped %d lower-TF orphans)",
        len(zones), len(passed), len(zones) - len(passed),
    )
    return passed


# ---------------------------------------------------------------------------
# BTC 1D macro gate (ZS12)
# ---------------------------------------------------------------------------

# How many recent 1D candles to inspect for BTC structure
_BTC_LOOKBACK = 10
# Minimum consecutive higher closes to call BTC bullish
_BULL_STREAK = 3


def _btc_direction(candles: list[Candle]) -> Literal["bullish", "bearish", "neutral"]:
    """
    Classify recent BTC 1D structure from raw candles.

    Bullish  : last N closes are making higher lows AND 3+ consecutive green closes
    Bearish  : last N closes are making lower highs AND 3+ consecutive red closes
    Neutral  : mixed / unclear
    """
    if len(candles) < _BTC_LOOKBACK:
        return "neutral"

    recent = candles[-_BTC_LOOKBACK:]
    closes = [c.close for c in recent]
    highs  = [c.high  for c in recent]
    lows   = [c.low   for c in recent]

    # Count consecutive green / red closes from the most recent candle backwards
    green_streak = 0
    for i in range(len(closes) - 1, 0, -1):
        if closes[i] > closes[i - 1]:
            green_streak += 1
        else:
            break

    red_streak = 0
    for i in range(len(closes) - 1, 0, -1):
        if closes[i] < closes[i - 1]:
            red_streak += 1
        else:
            break

    # Higher highs + higher lows over the lookback window
    higher_highs = highs[-1] > highs[0]
    higher_lows  = lows[-1]  > lows[0]
    lower_highs  = highs[-1] < highs[0]
    lower_lows   = lows[-1]  < lows[0]

    if higher_highs and higher_lows and green_streak >= _BULL_STREAK:
        return "bullish"
    if lower_highs and lower_lows and red_streak >= _BULL_STREAK:
        return "bearish"
    return "neutral"


async def apply_btc_gate(direction: Literal["long", "short"]) -> bool:
    """
    Check BTC 1D macro structure and return whether a trade in *direction*
    is allowed.

    Rule (from strategy lesson 9 + Rule A):
    - LONG  entries blocked when BTC is bearish (lower highs + lower lows + 3 red closes)
    - SHORT entries blocked when BTC is bullish (higher highs + higher lows + 3 green closes)
    - Neutral BTC → both directions allowed

    Args:
        direction: "long" or "short" — the intended trade direction

    Returns:
        True  → gate passes, entry allowed
        False → gate blocks, skip this setup
    """
    try:
        candles = await fetch_ohlcv("BTCUSDT", "1D", limit=_BTC_LOOKBACK + 5)
    except Exception as exc:
        # If BTC data is unavailable, fail open with a warning rather than
        # blocking all trades indefinitely.
        logger.warning("apply_btc_gate: BTC 1D fetch failed (%s) — gate passing by default", exc)
        return True

    btc_bias = _btc_direction(candles)
    logger.info("apply_btc_gate: BTC 1D structure = %s, requested direction = %s", btc_bias, direction)

    if direction == "long" and btc_bias == "bearish":
        logger.info("apply_btc_gate: BLOCKED long — BTC 1D is bearish")
        return False
    if direction == "short" and btc_bias == "bullish":
        logger.info("apply_btc_gate: BLOCKED short — BTC 1D is bullish")
        return False

    return True


# ---------------------------------------------------------------------------
# TP level finder (ZS13)
# ---------------------------------------------------------------------------

def find_tp_levels(
    entry: float,
    direction: Literal["long", "short"],
    zones: list[Zone],
) -> tuple[Zone | None, Zone | None]:
    """
    Find TP1 (nearest zone) and TP2 (second zone) in the trade direction.

    Rules (from strategy):
    - For LONG: look for supply zones ABOVE entry, ordered nearest → furthest
    - For SHORT: look for demand zones BELOW entry, ordered nearest → furthest
    - TP1 = zone 1 (closest), TP2 = zone 2 (next closest)
    - NEVER use zone 3-4 for TP2 (verified: misses on 2/3 trades)
    - FVG zones count as valid TP targets

    Args:
        entry:     entry price
        direction: "long" or "short"
        zones:     filtered zone list (post apply_4h_gate)

    Returns:
        (tp1_zone, tp2_zone) — either may be None if fewer than 2 zones found
    """
    if direction == "long":
        # Supply zones (resistance) above entry — price targets them on the way up
        # FVGs above entry also act as TP magnets
        candidates = [
            z for z in zones
            if z.bottom > entry and z.type in ("supply", "fvg")
        ]
        # Sort nearest first (lowest bottom)
        candidates.sort(key=lambda z: z.bottom)
    else:
        # Demand zones (support) below entry — price targets them on the way down
        # FVGs below entry also act as TP magnets
        candidates = [
            z for z in zones
            if z.top < entry and z.type in ("demand", "fvg")
        ]
        # Sort nearest first (highest top)
        candidates.sort(key=lambda z: z.top, reverse=True)

    tp1 = candidates[0] if len(candidates) >= 1 else None
    tp2 = candidates[1] if len(candidates) >= 2 else None

    if tp1:
        logger.info(
            "find_tp_levels: %s TP1 = %.4f–%.4f (%s %s)",
            direction, tp1.bottom, tp1.top, tp1.tf, tp1.type,
        )
    else:
        logger.warning("find_tp_levels: no TP1 found for %s entry %.4f", direction, entry)

    if tp2:
        logger.info(
            "find_tp_levels: %s TP2 = %.4f–%.4f (%s %s)",
            direction, tp2.bottom, tp2.top, tp2.tf, tp2.type,
        )
    else:
        logger.info("find_tp_levels: no TP2 found for %s entry %.4f", direction, entry)

    return tp1, tp2


# ---------------------------------------------------------------------------
# SL level finder (ZS14)
# ---------------------------------------------------------------------------

def find_sl_level(
    entry: float,
    direction: Literal["long", "short"],
    zones: list[Zone],
) -> float | None:
    """
    Find the structural stop-loss price for a trade.

    Rules (from strategy):
    - For LONG:  SL goes just below the demand zone the trade is entering FROM.
                 Use zone.bottom — that is the structural low of the demand zone.
    - For SHORT: SL goes just above the supply zone the trade is entering FROM.
                 Use zone.top — that is the structural high of the supply zone.
    - "Structural" means body-close only — wicks past SL are stop hunts and ignored.
      The exchange disaster SL (structural + 3% buffer) is set separately by trade_agent.
    - If no entry zone is found, fall back to the nearest opposing zone beyond entry.

    Args:
        entry:     entry price
        direction: "long" or "short"
        zones:     filtered zone list (post apply_4h_gate)

    Returns:
        SL price, or None if no structural level can be identified.
    """
    if direction == "long":
        # Entry zone = the demand zone we are buying into (price is inside or just above it)
        # Candidates: demand zones whose range overlaps or is just below entry
        entry_zones = [
            z for z in zones
            if z.type == "demand" and z.bottom <= entry <= z.top * 1.02
        ]
        if entry_zones:
            # Use the one whose top is closest to entry (most relevant zone)
            entry_zones.sort(key=lambda z: abs(z.top - entry))
            sl_price = entry_zones[0].bottom
            logger.info(
                "find_sl_level: LONG SL = %.4f (demand zone bottom %s %s)",
                sl_price, entry_zones[0].tf, entry_zones[0].strength,
            )
            return sl_price

        # Fallback: nearest demand zone below entry
        below = [z for z in zones if z.type == "demand" and z.top < entry]
        if below:
            below.sort(key=lambda z: z.top, reverse=True)
            sl_price = below[0].bottom
            logger.info(
                "find_sl_level: LONG SL = %.4f (nearest demand zone below, fallback)",
                sl_price,
            )
            return sl_price

    else:  # short
        # Entry zone = the supply zone we are selling into
        entry_zones = [
            z for z in zones
            if z.type == "supply" and z.bottom * 0.98 <= entry <= z.top
        ]
        if entry_zones:
            entry_zones.sort(key=lambda z: abs(z.bottom - entry))
            sl_price = entry_zones[0].top
            logger.info(
                "find_sl_level: SHORT SL = %.4f (supply zone top %s %s)",
                sl_price, entry_zones[0].tf, entry_zones[0].strength,
            )
            return sl_price

        # Fallback: nearest supply zone above entry
        above = [z for z in zones if z.type == "supply" and z.bottom > entry]
        if above:
            above.sort(key=lambda z: z.bottom)
            sl_price = above[0].top
            logger.info(
                "find_sl_level: SHORT SL = %.4f (nearest supply zone above, fallback)",
                sl_price,
            )
            return sl_price

    logger.warning(
        "find_sl_level: no structural SL found for %s entry %.4f", direction, entry
    )
    return None
