import asyncio
import json
import logging
import os
from typing import Callable

import websockets
from websockets.connection import State as WsState
import httpx

logger = logging.getLogger(__name__)

# Feed IDs loaded from env — same on devnet and mainnet
FEED_IDS: dict[str, str] = {
    # Canonical IDs from https://pyth.network/developers/price-feed-ids
    "SOL/USD":  os.getenv("PYTH_FEED_SOL_USD",  "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d"),
    "BTC/USD":  os.getenv("PYTH_FEED_BTC_USD",  "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43"),
    "ETH/USD":  os.getenv("PYTH_FEED_ETH_USD",  "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace"),
    "USDC/USD": os.getenv("PYTH_FEED_USDC_USD", "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a"),
    "USDT/USD": os.getenv("PYTH_FEED_USDT_USD", "0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688d2e53b"),
}


def _parse_price(raw: dict) -> float:
    """Convert Pyth raw price (int + expo) to a float."""
    # raw["price"] may be a nested {"price": str, "expo": int} or a plain str/int
    if isinstance(raw, dict) and "price" in raw and "expo" in raw:
        return int(raw["price"]) * (10 ** int(raw["expo"]))
    raise ValueError(f"Unrecognised price format: {raw}")


class PythPriceFeed:
    """
    Streams real-time prices from Pyth Hermes WebSocket.
    Falls back to Hermes REST if the WS is unavailable.
    """

    def __init__(self, network: str = "devnet"):
        network = network.lower()
        # hermes-beta.pyth.network is retired — Pyth uses the same endpoint for devnet/mainnet
        if network == "mainnet":
            self._ws_url   = os.getenv("PYTH_WS_URL_MAINNET",   "wss://hermes.pyth.network/ws")
            self._rest_url = os.getenv("PYTH_REST_URL_MAINNET",  "https://hermes.pyth.network")
        else:
            self._ws_url   = os.getenv("PYTH_WS_URL_DEVNET",    "wss://hermes.pyth.network/ws")
            self._rest_url = os.getenv("PYTH_REST_URL_DEVNET",   "https://hermes.pyth.network")

        # symbol -> latest float price
        self._prices: dict[str, float] = {}
        # symbol -> set of async callbacks(symbol, price)
        self._callbacks: dict[str, list[Callable]] = {}
        # feed_id -> symbol (reverse lookup for incoming messages)
        self._feed_to_symbol: dict[str, str] = {}

        self._ws = None
        self._listen_task: asyncio.Task | None = None
        self._running = False

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def connect(self) -> None:
        """Open WebSocket connection to Pyth Hermes."""
        self._running = True
        await self._open_ws()
        self._listen_task = asyncio.create_task(self._listen_loop())
        logger.info("PythPriceFeed connected to %s", self._ws_url)

    async def subscribe(self, symbol: str, callback: Callable | None = None) -> None:
        """
        Subscribe to a price feed by symbol (e.g. 'SOL/USD').
        Optional async callback(symbol, price) fired on every tick.
        """
        feed_id = FEED_IDS.get(symbol)
        if not feed_id:
            raise ValueError(f"No Pyth feed ID for symbol '{symbol}'. Add it to FEED_IDS.")

        self._feed_to_symbol[feed_id] = symbol
        if callback:
            self._callbacks.setdefault(symbol, []).append(callback)

        # websockets ≥14 uses .state instead of .closed
        ws_open = self._ws and getattr(self._ws, "state", None) is WsState.OPEN
        if ws_open:
            await self._ws.send(json.dumps({"type": "subscribe", "ids": [feed_id]}))
            logger.debug("Subscribed to %s (%s)", symbol, feed_id)
        else:
            logger.warning("subscribe() called before connect() — will auto-subscribe on reconnect")

    def get_price(self, symbol: str) -> float | None:
        """Return the latest cached price for a symbol, or None if not yet received."""
        return self._prices.get(symbol)

    async def disconnect(self) -> None:
        """Gracefully shut down the WebSocket connection and listener task."""
        self._running = False
        if self._listen_task:
            self._listen_task.cancel()
            try:
                await self._listen_task
            except asyncio.CancelledError:
                pass
        if self._ws:
            await self._ws.close()
            self._ws = None
        logger.info("PythPriceFeed disconnected")

    async def get_price_rest(self, symbol: str) -> float | None:
        """
        Fallback: fetch latest price via Hermes REST API.
        Used when WebSocket is down or as a one-off check.
        """
        feed_id = FEED_IDS.get(symbol)
        if not feed_id:
            raise ValueError(f"No Pyth feed ID for symbol '{symbol}'.")
        # Hermes v2 endpoint: /v2/updates/price/latest?ids[]=<feed_id>
        url = f"{self._rest_url}/v2/updates/price/latest"
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                resp = await client.get(url, params={"ids[]": feed_id, "encoding": "hex", "parsed": "true"})
                resp.raise_for_status()
                data = resp.json()
                # Response: {"parsed": [{"price": {"price": str, "expo": int, ...}, ...}]}
                parsed = data.get("parsed") or []
                if parsed:
                    price = _parse_price(parsed[0]["price"])
                    self._prices[symbol] = price
                    return price
        except Exception as exc:
            logger.error("REST fallback failed for %s: %s", symbol, exc)
        return None

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    async def _open_ws(self) -> None:
        self._ws = await websockets.connect(self._ws_url, ping_interval=20, ping_timeout=10)

    async def _resubscribe_all(self) -> None:
        """Re-send subscribe messages after a reconnect."""
        for feed_id, symbol in self._feed_to_symbol.items():
            await self._ws.send(json.dumps({"type": "subscribe", "ids": [feed_id]}))
            logger.debug("Re-subscribed to %s after reconnect", symbol)

    async def _listen_loop(self) -> None:
        """Receive price updates with exponential-backoff reconnection."""
        backoff = 1
        while self._running:
            try:
                async for raw in self._ws:
                    backoff = 1  # reset on successful message
                    await self._handle_message(raw)
            except (websockets.ConnectionClosed, OSError) as exc:
                if not self._running:
                    break
                logger.warning("Pyth WS disconnected (%s) — reconnecting in %ds", exc, backoff)
                await asyncio.sleep(backoff)
                backoff = min(backoff * 2, 60)
                try:
                    await self._open_ws()
                    await self._resubscribe_all()
                except Exception as conn_err:
                    logger.error("Reconnect failed: %s", conn_err)

    async def _handle_message(self, raw: str) -> None:
        try:
            msg = json.loads(raw)
        except json.JSONDecodeError:
            return

        if msg.get("type") != "price_update":
            return

        # Hermes v2: {"type":"price_update","price_feed":{"id":"0x...","price":{...}}}
        feed_obj = msg.get("price_feed") or {}
        raw_id = feed_obj.get("id", "")
        # Normalise: Hermes may omit the "0x" prefix
        feed_id = raw_id if raw_id.startswith("0x") else f"0x{raw_id}"
        symbol = self._feed_to_symbol.get(feed_id)
        if not symbol:
            return

        price_data = feed_obj.get("price")
        if not price_data:
            return

        price = _parse_price(price_data)
        self._prices[symbol] = price
        logger.debug("%s = %.6f", symbol, price)

        for cb in self._callbacks.get(symbol, []):
            try:
                await cb(symbol, price)
            except Exception as exc:
                logger.error("Callback error for %s: %s", symbol, exc)
