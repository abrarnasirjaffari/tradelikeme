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
