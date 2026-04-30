"""
Sentinel — zero-token WebSocket price watcher.

Watches for three events without burning any AI tokens:
  1. Zone touch  — price enters a watched zone → fire ZONE_TOUCH
  2. TP1 hit     — price reaches TP1 level    → fire TP1_HIT
  3. 30m body-close SL — every 30-min candle close, check if candle BODY closed
                         below (long) or above (short) the SL level. Wicks past
                         SL are intentionally ignored (Sonum's edge).

External code (loop.py / trade_agent.py) registers watches and subscribes to
events via asyncio.Queue. The sentinel never places orders or calls AI.
"""
import asyncio
import logging
import time
from dataclasses import dataclass, field
from enum import Enum
from typing import Callable, Literal

from trading_agent.exchanges.solana.pyth_ws import PythPriceFeed

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Event types
# ---------------------------------------------------------------------------

class WatchType(str, Enum):
    ZONE_TOUCH = "ZONE_TOUCH"
    TP1_HIT    = "TP1_HIT"
    BODY_SL    = "BODY_SL"   # 30-min body-close SL check


@dataclass
class SentinelEvent:
    watch_type: WatchType
    symbol: str
    price: float          # price that triggered the event
    timestamp: float = field(default_factory=time.time)


# ---------------------------------------------------------------------------
# Watch descriptors
# ---------------------------------------------------------------------------

@dataclass
class ZoneWatch:
    """Fires ZONE_TOUCH when price enters [zone_bottom, zone_top]."""
    symbol: str
    zone_top: float
    zone_bottom: float
    direction: Literal["long", "short"]   # expected trade direction


@dataclass
class TP1Watch:
    """Fires TP1_HIT when price crosses tp1_price in the trade direction."""
    symbol: str
    tp1_price: float
    direction: Literal["long", "short"]   # long = price falls to tp1, short = price rises to tp1


@dataclass
class BodySLWatch:
    """Fires BODY_SL if the 30-min candle BODY closes beyond sl_price."""
    symbol: str
    sl_price: float
    direction: Literal["long", "short"]   # long = body close below sl, short = body close above sl
    # Rolling 30-min candle state (updated on every tick)
    candle_open: float = 0.0
    candle_open_time: float = field(default_factory=time.time)
    candle_high: float = 0.0
    candle_low: float = float("inf")
    candle_close: float = 0.0


# ---------------------------------------------------------------------------
# Sentinel
# ---------------------------------------------------------------------------

_30M_SECONDS = 30 * 60


class Sentinel:
    """
    Zero-token price watcher.  Uses PythPriceFeed WebSocket internally.
    All public methods are coroutine-safe and can be called from any asyncio task.
    """

    def __init__(
        self,
        pyth: PythPriceFeed,
        watchlist: list[dict] | None = None,
    ):
        """
        Args:
            pyth: connected (or not-yet-connected) PythPriceFeed instance.
            watchlist: optional list of watch descriptors to load on startup,
                       used to resume watches after a restart.  Each entry is a
                       dict with keys matching add_watch() kwargs, e.g.:
                         {"symbol": "SOLUSDT", "watch_type": "ZONE_TOUCH",
                          "zone_top": 150.0, "zone_bottom": 145.0, "direction": "long"}
        """
        self._pyth = pyth
        self._initial_watchlist: list[dict] = watchlist or []

        # Active watches keyed by symbol
        self._zone_watches:    dict[str, ZoneWatch]    = {}
        self._tp1_watches:     dict[str, TP1Watch]     = {}
        self._body_sl_watches: dict[str, BodySLWatch]  = {}

        # All callers share one event queue
        self._event_queue: asyncio.Queue[SentinelEvent] = asyncio.Queue()

        self._running = False
        self._tasks: list[asyncio.Task] = []
        self._event_callbacks: list[Callable[[SentinelEvent], None]] = []

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    async def start(self) -> None:
        """
        Connect Pyth WebSocket, load the initial watchlist, then launch
        all background watcher tasks.
        """
        if self._running:
            logger.warning("Sentinel already running")
            return

        # 1. Open Pyth WebSocket connection
        await self._pyth.connect()
        logger.info("Sentinel: Pyth WebSocket connected")

        self._running = True

        # 2. Restore any pre-loaded watches (e.g. after a restart)
        for entry in self._initial_watchlist:
            try:
                watch_type = WatchType(entry["watch_type"])
                await self.add_watch(
                    symbol=entry["symbol"],
                    watch_type=watch_type,
                    zone_top=float(entry.get("zone_top", 0.0)),
                    zone_bottom=float(entry.get("zone_bottom", 0.0)),
                    tp1_price=float(entry.get("tp1_price", 0.0)),
                    sl_price=float(entry.get("sl_price", 0.0)),
                    direction=entry.get("direction", "long"),
                )
            except Exception as exc:
                logger.error("Failed to restore watchlist entry %s: %s", entry, exc)

        if self._initial_watchlist:
            logger.info("Sentinel: restored %d watch(es) from watchlist", len(self._initial_watchlist))

        # 3. Launch background tasks
        # Zone-touch and TP1 watchers are driven by Pyth WS callbacks — no polling needed.
        # Body-close SL needs its own 30-min boundary task.
        self._tasks.append(asyncio.create_task(self._body_sl_loop(), name="sentinel-body-sl"))
        logger.info("Sentinel started")

    async def stop(self) -> None:
        """Gracefully cancel all watcher tasks and disconnect Pyth WebSocket."""
        self._running = False
        for t in self._tasks:
            t.cancel()
            try:
                await t
            except asyncio.CancelledError:
                pass
        self._tasks.clear()
        await self._pyth.disconnect()
        logger.info("Sentinel stopped")

    # ------------------------------------------------------------------
    # Watch management
    # ------------------------------------------------------------------

    async def add_watch(
        self,
        symbol: str,
        watch_type: WatchType,
        *,
        zone_top: float = 0.0,
        zone_bottom: float = 0.0,
        tp1_price: float = 0.0,
        sl_price: float = 0.0,
        direction: Literal["long", "short"] = "long",
    ) -> None:
        """
        Register a watch for *symbol*.

        Depending on *watch_type*, supply the relevant keyword args:
          ZONE_TOUCH → zone_top, zone_bottom, direction
          TP1_HIT    → tp1_price, direction
          BODY_SL    → sl_price, direction
        """
        pyth_symbol = _to_pyth_symbol(symbol)

        if watch_type == WatchType.ZONE_TOUCH:
            self._zone_watches[symbol] = ZoneWatch(
                symbol=symbol,
                zone_top=zone_top,
                zone_bottom=zone_bottom,
                direction=direction,
            )
            await self._pyth.subscribe(pyth_symbol, self._on_price_tick)
            logger.info("Zone watch added: %s top=%.4f bottom=%.4f", symbol, zone_top, zone_bottom)

        elif watch_type == WatchType.TP1_HIT:
            self._tp1_watches[symbol] = TP1Watch(
                symbol=symbol,
                tp1_price=tp1_price,
                direction=direction,
            )
            await self._pyth.subscribe(pyth_symbol, self._on_price_tick)
            logger.info("TP1 watch added: %s tp1=%.4f dir=%s", symbol, tp1_price, direction)

        elif watch_type == WatchType.BODY_SL:
            now = time.time()
            # Align candle open time to the nearest 30-min boundary
            candle_start = now - (now % _30M_SECONDS)
            current_price = self._pyth.get_price(pyth_symbol) or 0.0
            self._body_sl_watches[symbol] = BodySLWatch(
                symbol=symbol,
                sl_price=sl_price,
                direction=direction,
                candle_open=current_price,
                candle_open_time=candle_start,
                candle_high=current_price,
                candle_low=current_price if current_price > 0 else float("inf"),
                candle_close=current_price,
            )
            await self._pyth.subscribe(pyth_symbol, self._on_price_tick)
            logger.info("Body-SL watch added: %s sl=%.4f dir=%s", symbol, sl_price, direction)

        else:
            raise ValueError(f"Unknown WatchType: {watch_type}")

    async def remove_watch(self, symbol: str) -> None:
        """Remove all watches for *symbol*."""
        removed = []
        if symbol in self._zone_watches:
            del self._zone_watches[symbol]
            removed.append("ZONE_TOUCH")
        if symbol in self._tp1_watches:
            del self._tp1_watches[symbol]
            removed.append("TP1_HIT")
        if symbol in self._body_sl_watches:
            del self._body_sl_watches[symbol]
            removed.append("BODY_SL")
        if removed:
            logger.info("Removed watches for %s: %s", symbol, removed)
        else:
            logger.warning("remove_watch: no watches found for %s", symbol)

    # ------------------------------------------------------------------
    # Event consumption
    # ------------------------------------------------------------------

    async def get_event(self) -> SentinelEvent:
        """Block until the next sentinel event is available."""
        return await self._event_queue.get()

    def subscribe_events(self, callback: Callable[[SentinelEvent], None]) -> None:
        """
        Alternative to polling get_event().
        Registers a synchronous callback invoked whenever an event is fired.
        Callbacks run inside _fire_event — keep them fast and non-blocking.
        """
        self._event_callbacks.append(callback)

    # ------------------------------------------------------------------
    # Internal: price tick handler (called by PythPriceFeed on every update)
    # ------------------------------------------------------------------

    async def _on_price_tick(self, pyth_symbol: str, price: float) -> None:
        symbol = _from_pyth_symbol(pyth_symbol)

        # --- Zone touch check ---
        watch = self._zone_watches.get(symbol)
        if watch and watch.zone_bottom <= price <= watch.zone_top:
            logger.info("ZONE_TOUCH fired: %s @ %.4f (zone %.4f–%.4f)",
                        symbol, price, watch.zone_bottom, watch.zone_top)
            await self._fire(SentinelEvent(WatchType.ZONE_TOUCH, symbol, price))
            # Remove watch so it doesn't fire again on the same touch
            del self._zone_watches[symbol]

        # --- TP1 hit check ---
        tp_watch = self._tp1_watches.get(symbol)
        if tp_watch:
            hit = (
                (tp_watch.direction == "long"  and price >= tp_watch.tp1_price) or
                (tp_watch.direction == "short" and price <= tp_watch.tp1_price)
            )
            if hit:
                logger.info("TP1_HIT fired: %s @ %.4f (tp1=%.4f)",
                            symbol, price, tp_watch.tp1_price)
                await self._fire(SentinelEvent(WatchType.TP1_HIT, symbol, price))
                del self._tp1_watches[symbol]

        # --- Update rolling 30-min candle for body-SL watch ---
        sl_watch = self._body_sl_watches.get(symbol)
        if sl_watch:
            sl_watch.candle_high  = max(sl_watch.candle_high, price)
            sl_watch.candle_low   = min(sl_watch.candle_low,  price)
            sl_watch.candle_close = price

    # ------------------------------------------------------------------
    # Internal: 30-min body-close SL loop
    # ------------------------------------------------------------------

    async def _body_sl_loop(self) -> None:
        """
        Fires every 30 minutes (aligned to wall-clock boundaries).
        For each BodySLWatch, checks if the candle BODY closed beyond sl_price.
        Wicks past SL are intentionally ignored.
        """
        while self._running:
            await self._sleep_until_next_30m()
            now = time.time()

            for symbol, watch in list(self._body_sl_watches.items()):
                body_open  = watch.candle_open
                body_close = watch.candle_close

                # BODY is the min/max of open+close — wicks are high/low
                body_low  = min(body_open, body_close)
                body_high = max(body_open, body_close)

                sl_breached = (
                    (watch.direction == "long"  and body_close < watch.sl_price) or
                    (watch.direction == "short" and body_close > watch.sl_price)
                )

                if sl_breached:
                    logger.info(
                        "BODY_SL fired: %s body_close=%.4f sl=%.4f dir=%s "
                        "(wick_low=%.4f wick_high=%.4f — ignored)",
                        symbol, body_close, watch.sl_price, watch.direction,
                        watch.candle_low, watch.candle_high,
                    )
                    await self._fire(SentinelEvent(WatchType.BODY_SL, symbol, body_close))
                    del self._body_sl_watches[symbol]
                else:
                    # Reset candle for next 30-min window
                    watch.candle_open      = body_close
                    watch.candle_open_time = now
                    watch.candle_high      = body_close
                    watch.candle_low       = body_close
                    watch.candle_close     = body_close

    @staticmethod
    async def _sleep_until_next_30m() -> None:
        """Sleep until the next 30-minute wall-clock boundary."""
        now = time.time()
        next_boundary = (now // _30M_SECONDS + 1) * _30M_SECONDS
        sleep_for = next_boundary - now
        logger.debug("Body-SL loop sleeping %.1fs until next 30m boundary", sleep_for)
        await asyncio.sleep(sleep_for)

    async def _fire(self, event: SentinelEvent) -> None:
        await self._event_queue.put(event)


# ---------------------------------------------------------------------------
# Symbol helpers
# ---------------------------------------------------------------------------
# Pyth feed symbols use "SOL/USD" format; strategy uses "SOLUSDT" format.

_SYMBOL_MAP: dict[str, str] = {
    "SOLUSDT":    "SOL/USD",
    "BTCUSDT":    "BTC/USD",
    "ETHUSDT":    "ETH/USD",
    "APTUSDT":    "APT/USD",
    "ARBUSDT":    "ARB/USD",
    "USDCUSDT":   "USDC/USD",
    "USDTUSDT":   "USDT/USD",
}
_REVERSE_MAP: dict[str, str] = {v: k for k, v in _SYMBOL_MAP.items()}


def _to_pyth_symbol(symbol: str) -> str:
    mapped = _SYMBOL_MAP.get(symbol.upper())
    if not mapped:
        raise ValueError(
            f"No Pyth feed mapping for '{symbol}'. Add it to _SYMBOL_MAP in sentinel.py."
        )
    return mapped


def _from_pyth_symbol(pyth_symbol: str) -> str:
    return _REVERSE_MAP.get(pyth_symbol, pyth_symbol)
