"""
Loop Orchestrator — top-level coordinator for the S/D zone strategy.

Responsibilities:
  - startup(): init exchange, sentinel, trade agent; block entries until
    the first full zone scan completes across all coins (entry gate).
  - Zone refresh cycle: rescan all watchlist coins every 4H.
  - Entry gate: validate each candidate setup through all mandatory gates
    (4H zone gate, BTC 1D gate, MAX_AT_RISK_SLOTS, MIN_BALANCE).
  - Sentinel event routing: zone touch → enter_trade, TP1 hit → on_tp1_hit,
    body-close SL → on_body_close_sl.
  - Compound cycle: every 72H recalculate position sizing from current balance.
  - shutdown(): graceful stop — cancel all tasks, close sentinel, close exchange.

Usage:
    loop = LoopOrchestrator(exchange, pyth)
    await loop.startup()
    # runs indefinitely until loop.shutdown() is called
"""
import asyncio
import logging
import os
from typing import Literal

from trading_agent.base.exchange_base import ExchangeBase
from trading_agent.base.config import TELEGRAM_CHAT_ID
from trading_agent.exchanges.solana.pyth_ws import PythPriceFeed
import trading_agent.base.notifier as notifier
from trading_agent.strategies.sd_zones.sentinel import Sentinel, SentinelEvent, WatchType
from trading_agent.strategies.sd_zones.trade_agent import TradeAgent
from trading_agent.strategies.sd_zones.zones import scan_tf_stack, find_tp_levels, find_sl_level, apply_btc_gate

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants (overridable from config.py once CF tasks are done)
# ---------------------------------------------------------------------------

MAX_AT_RISK_SLOTS: int = 2          # max concurrent open positions
MIN_BALANCE_USD: float = 35.0       # hard floor — stop all entries below this
ZONE_REFRESH_SECS: int = 4 * 3600  # 4H zone rescan interval
COMPOUND_SECS: int = 72 * 3600     # 72H position-size recalculation interval
LEVERAGE: int = 200                 # default leverage (200x CROSS)
MARGIN_PCT: float = 0.005           # 0.5% margin per trade

# Coins to scan on every zone refresh cycle.
# Any coin with a valid S/D setup + BTC macro alignment qualifies.
WATCHLIST: list[str] = [
    "SOLUSDT", "BTCUSDT", "ETHUSDT", "TAOUSDT", "SUIUSDT",
    "XRPUSDT", "LINKUSDT", "DOTUSDT", "LTCUSDT", "DOGEUSDT",
    "ADAUSDT", "UNIUSDT", "ENAUSDT", "AAVEUSDT",
]

# Devnet watchlist — restricted to Zeta Markets supported coins only
DEVNET_WATCHLIST: list[str] = ["SOLUSDT", "BTCUSDT", "ETHUSDT"]

# Active watchlist: devnet mode uses the restricted list, mainnet uses the full list.
_ACTIVE_WATCHLIST: list[str] = (
    DEVNET_WATCHLIST if os.getenv("DEVNET_MODE") == "1" else WATCHLIST
)


class LoopOrchestrator:
    """
    Top-level S/D zone strategy orchestrator.

    Wire-up:
        exchange  — concrete ExchangeBase implementation (ZetaClient or JupiterClient)
        pyth      — PythPriceFeed instance (connected or not yet connected)

    All long-running work runs as asyncio tasks managed by this class.
    """

    def __init__(self, exchange: ExchangeBase, pyth: PythPriceFeed) -> None:
        self._exchange = exchange
        self._pyth = pyth
        self._sentinel = Sentinel(pyth)
        self._trade_agent = TradeAgent(exchange)

        # Runtime state
        self._scan_complete: bool = False      # entry gate: True after first full scan
        self._running: bool = False
        self._tasks: list[asyncio.Task] = []

        # Latest zones per coin from the most recent scan.
        # Keyed by symbol, value is the raw zone list from scan_tf_stack().
        self._zones: dict[str, list[dict]] = {}

        # Current balance — updated at startup and on every compound cycle.
        self._balance: float = 0.0
        # Initial balance captured at first successful fetch — used to set the
        # BALANCE_LOW threshold at 50% of starting equity.
        self._initial_balance: float = 0.0

    # ------------------------------------------------------------------
    # LO2 — startup()
    # ------------------------------------------------------------------

    async def startup(self) -> None:
        """
        Boot sequence:
          1. Fetch initial balance from exchange.
          2. Start sentinel (which opens the Pyth WS internally).
          3. Run the first full zone scan across all WATCHLIST coins and
             register ZONE_TOUCH watches — entries are blocked until this
             completes (_scan_complete stays False the whole time).
          4. Set _scan_complete = True to unblock entries.
          5. Spawn background tasks: zone refresh, compound cycle, event loop.
        """
        if self._running:
            logger.warning("LoopOrchestrator already running — ignoring duplicate startup()")
            return

        logger.info("LoopOrchestrator starting up…")
        self._running = True

        # 1. Fetch initial balance — needed for position sizing before first compound cycle.
        await self._check_min_balance()

        # 2. Start sentinel — this calls pyth.connect() internally.
        await self._sentinel.start()

        # 3. Initial zone scan — runs sequentially across all coins.
        #    Entries remain blocked (scan_complete == False) until this finishes.
        logger.info(
            "Running initial zone scan across %d coins — entries blocked until complete",
            len(_ACTIVE_WATCHLIST),
        )
        await self._run_zone_scan()

        # 4. Unblock entries now that we have fresh zones for every coin.
        self._scan_complete = True
        logger.info("Initial zone scan complete — entries unblocked")

        # 5. Spawn long-running background tasks.
        self._tasks.append(
            asyncio.create_task(self._zone_refresh_loop(), name="loop-zone-refresh")
        )
        self._tasks.append(
            asyncio.create_task(self._compound_loop(), name="loop-compound")
        )
        self._tasks.append(
            asyncio.create_task(self._event_loop(), name="loop-events")
        )
        logger.info(
            "LoopOrchestrator running — %d background tasks active", len(self._tasks)
        )

    async def _run_zone_scan(self) -> None:
        """
        Scan every coin in WATCHLIST, store the resulting zones, and register a
        ZONE_TOUCH sentinel watch for each zone found.

        Called at startup and by _zone_refresh_loop every 4H.
        Errors on individual coins are logged and skipped so one bad symbol
        never aborts the whole scan.
        """
        scanned = 0
        for symbol in _ACTIVE_WATCHLIST:
            try:
                zones = await scan_tf_stack(symbol)
                self._zones[symbol] = zones

                # Remove any stale zone watches for this symbol before re-adding.
                await self._sentinel.remove_watch(symbol)

                for zone in zones:
                    direction: Literal["long", "short"] = (
                        "long" if zone.type == "demand" else "short"
                    )
                    try:
                        await self._sentinel.add_watch(
                            symbol=symbol,
                            watch_type=WatchType.ZONE_TOUCH,
                            zone_top=float(zone.top),
                            zone_bottom=float(zone.bottom),
                            direction=direction,
                        )
                    except Exception:
                        logger.exception(
                            "Failed to register zone watch for %s zone=%s", symbol, zone
                        )

                logger.info("Scanned %s — %d zone(s), watches registered", symbol, len(zones))
                scanned += 1

            except Exception:
                logger.exception("Zone scan failed for %s — skipping", symbol)

        logger.info("Zone scan pass complete: %d/%d coins scanned", scanned, len(_ACTIVE_WATCHLIST))

    # ------------------------------------------------------------------
    # LO3 — zone refresh cycle
    # ------------------------------------------------------------------

    async def _zone_refresh_loop(self) -> None:
        """
        Rescan all WATCHLIST coins every 4H.

        Sleeps for ZONE_REFRESH_SECS, then calls _run_zone_scan().
        The initial scan at startup is NOT repeated here immediately —
        this loop always sleeps first so the first refresh happens 4H
        after boot, not at boot.

        Any exception from _run_zone_scan is caught so a single bad
        scan never kills the loop.
        """
        while self._running:
            await asyncio.sleep(ZONE_REFRESH_SECS)
            if not self._running:
                break
            logger.info("4H zone refresh starting…")
            try:
                await self._run_zone_scan()
            except Exception:
                logger.exception("Zone refresh cycle failed — will retry in %dH", ZONE_REFRESH_SECS // 3600)

    # ------------------------------------------------------------------
    # LO4 — entry gate
    # ------------------------------------------------------------------

    def _entry_gate_open(self) -> bool:
        """
        Returns True only when all three conditions hold:
          1. First full zone scan has completed (_scan_complete).
          2. Open positions < MAX_AT_RISK_SLOTS.
          3. Cached balance >= MIN_BALANCE_USD.

        Balance is read from self._balance (set at startup, refreshed every 72H
        by the compound cycle) — no exchange call is made here so this is safe
        to call on every price tick.
        """
        if not self._scan_complete:
            logger.debug("Entry gate: BLOCKED — initial scan not complete")
            return False

        if not self._slots_available():
            logger.debug("Entry gate: BLOCKED — MAX_AT_RISK_SLOTS reached")
            return False

        low_threshold = max(self._initial_balance * 0.5, MIN_BALANCE_USD) if self._initial_balance > 0 else MIN_BALANCE_USD
        if self._balance < low_threshold:
            logger.debug(
                "Entry gate: BLOCKED — balance $%.2f below threshold $%.2f",
                self._balance, low_threshold,
            )
            return False

        return True

    # ------------------------------------------------------------------
    # LO5 — check_entry()
    # ------------------------------------------------------------------

    async def check_entry(
        self,
        symbol: str,
        zones: list[dict],
        direction: Literal["long", "short"],
    ) -> bool:
        """
        Validate a candidate entry through all mandatory gates in order:
          1. Entry gate open  — scan complete, slots available, balance above floor
          2. BTC 1D gate      — no alt entry against BTC macro direction
          3. 4H zone gate     — lower-TF zones filtered to only those backed by a 4H zone
          4. TP levels exist  — at least TP1 must be identifiable (TP2 is best-effort)
          5. SL level exists  — structural SL must be identifiable

        Returns True only when every gate passes.
        """
        # Gate 1 — entry gate (sync, cheap)
        if not self._entry_gate_open():
            logger.info("check_entry: %s BLOCKED at entry gate", symbol)
            return False

        # Gate 2 — BTC 1D macro gate (async — fetches BTC candles)
        btc_ok = await apply_btc_gate(direction)
        if not btc_ok:
            logger.info("check_entry: %s BLOCKED by BTC 1D gate (direction=%s)", symbol, direction)
            return False

        # Gate 3 — 4H zone gate (sync filter on the zone list)
        from trading_agent.strategies.sd_zones.zones import apply_4h_gate, Zone
        # zones may be Zone objects (from scan_tf_stack) or plain dicts — handle both
        filtered = apply_4h_gate(zones) if zones and isinstance(zones[0], Zone) else zones
        if not filtered:
            logger.info("check_entry: %s BLOCKED — no zones survive 4H gate", symbol)
            return False

        # Gate 4 — TP levels
        # Use current price as a proxy for entry (sentinel fires at zone touch price,
        # but check_entry doesn't receive the exact tick price — direction is enough
        # to find candidates; the actual entry price is used in _on_zone_touch).
        # We look for at least one TP candidate in the correct direction.
        tp1, _tp2 = find_tp_levels(0.0, direction, filtered)
        # find_tp_levels with entry=0 returns all zones in the direction for longs
        # (bottom > 0 always true) — for shorts (top < 0 never true) so we need the
        # real entry price.  Re-query using the live Pyth price as the entry proxy.
        if tp1 is None:
            try:
                from trading_agent.strategies.sd_zones.sentinel import _to_pyth_symbol
                pyth_sym = _to_pyth_symbol(symbol)
                if pyth_sym:
                    live_price = self._pyth.get_price(pyth_sym) or await self._pyth.get_price_rest(pyth_sym)
                    if live_price:
                        tp1, _tp2 = find_tp_levels(live_price, direction, filtered)
            except Exception:
                logger.debug("check_entry: %s — could not fetch live price for TP check", symbol)

        if tp1 is None:
            logger.info("check_entry: %s BLOCKED — no TP1 level found (direction=%s)", symbol, direction)
            return False

        # Gate 5 — SL level (same live-price fallback)
        sl: float | None = None
        try:
            from trading_agent.strategies.sd_zones.sentinel import _to_pyth_symbol
            pyth_sym = _to_pyth_symbol(symbol)
            if pyth_sym:
                live_price = self._pyth.get_price(pyth_sym) or await self._pyth.get_price_rest(pyth_sym)
                if live_price:
                    sl = find_sl_level(live_price, direction, filtered)
        except Exception:
            logger.debug("check_entry: %s — could not fetch live price for SL check", symbol)

        if sl is None:
            logger.info("check_entry: %s BLOCKED — no structural SL found (direction=%s)", symbol, direction)
            return False

        logger.info(
            "check_entry: %s PASSED all gates (direction=%s tp1=%.4f sl=%.4f)",
            symbol, direction, tp1.top if direction == "long" else tp1.bottom, sl,
        )
        return True

    # ------------------------------------------------------------------
    # LO6 — MAX_AT_RISK_SLOTS enforcement
    # ------------------------------------------------------------------

    def _slots_available(self) -> bool:
        """Return True if open positions < MAX_AT_RISK_SLOTS."""
        open_count = len(self._trade_agent.get_open_trades())
        if open_count >= MAX_AT_RISK_SLOTS:
            logger.debug(
                "Slots full: %d/%d positions open", open_count, MAX_AT_RISK_SLOTS
            )
            return False
        return True

    # ------------------------------------------------------------------
    # LO7 — MIN_BALANCE check
    # ------------------------------------------------------------------

    async def _check_min_balance(self) -> bool:
        """
        Fetch live balance from exchange, update self._balance, and return
        True if it is at or above MIN_BALANCE_USD.

        Used at startup and by the compound cycle.  The entry gate uses the
        cached self._balance for tick-safe sync checks — this method is the
        authoritative live refresh.
        """
        try:
            self._balance = await self._exchange.get_balance()
            logger.info("Balance check: $%.2f USDC", self._balance)
        except Exception:
            logger.exception("_check_min_balance: exchange call failed — keeping cached $%.2f", self._balance)

        # Capture initial balance on first successful fetch
        if self._initial_balance == 0.0 and self._balance > 0.0:
            self._initial_balance = self._balance
            logger.info("Initial balance recorded: $%.2f USDC", self._initial_balance)

        # BALANCE_LOW threshold = 50% of initial balance (floor: MIN_BALANCE_USD)
        low_threshold = max(self._initial_balance * 0.5, MIN_BALANCE_USD)

        if self._balance < low_threshold:
            logger.warning(
                "Balance $%.2f below low threshold $%.2f (50%% of initial $%.2f) — entries blocked",
                self._balance, low_threshold, self._initial_balance,
            )
            await notifier.send(
                user_id=TELEGRAM_CHAT_ID,
                event=notifier.BALANCE_LOW,
                data={"balance": self._balance},
            )
            return False
        return True

    # ------------------------------------------------------------------
    # LO8 — compound cycle
    # ------------------------------------------------------------------

    async def _compound_loop(self) -> None:
        """
        Every 72H: fetch live balance, update self._balance so that the next
        position size calculation (in _on_zone_touch via _calc_position_size)
        uses the current account equity rather than the stale startup value.

        Sleeps first so the first recalculation happens 72H after boot, not
        immediately (startup already calls _check_min_balance at boot).
        """
        while self._running:
            await asyncio.sleep(COMPOUND_SECS)
            if not self._running:
                break
            logger.info("Compound cycle: refreshing balance and position sizing…")
            try:
                await self._check_min_balance()
                logger.info(
                    "Compound cycle complete — new position size basis: $%.2f × %.1f%% × %dx leverage",
                    self._balance, MARGIN_PCT * 100, LEVERAGE,
                )
            except Exception:
                logger.exception("Compound cycle failed — retrying in %dH", COMPOUND_SECS // 3600)

    # ------------------------------------------------------------------
    # LO9 — shutdown()
    # ------------------------------------------------------------------

    async def shutdown(self) -> None:
        """
        Graceful stop:
          1. Set _running = False so all loops exit on their next iteration.
          2. Cancel and await all background asyncio tasks.
          3. Stop the sentinel (closes Pyth WS).
        """
        if not self._running:
            return

        logger.info("LoopOrchestrator shutting down…")
        self._running = False

        # Cancel all background tasks and wait for them to finish.
        for task in self._tasks:
            task.cancel()
        if self._tasks:
            await asyncio.gather(*self._tasks, return_exceptions=True)
        self._tasks.clear()

        # Stop sentinel — closes the Pyth WebSocket connection.
        try:
            await self._sentinel.stop()
        except Exception:
            logger.exception("Error stopping sentinel during shutdown")

        logger.info("LoopOrchestrator stopped")

    # ------------------------------------------------------------------
    # Sentinel event router (internal)
    # ------------------------------------------------------------------

    async def _event_loop(self) -> None:
        """
        Pull events from sentinel and route to the correct trade agent handler.

        ZONE_TOUCH → check_entry() → enter_trade()
        TP1_HIT    → on_tp1_hit()
        BODY_SL    → on_body_close_sl()
        """
        while self._running:
            try:
                event: SentinelEvent = await asyncio.wait_for(
                    self._sentinel.get_event(), timeout=60.0
                )
            except asyncio.TimeoutError:
                continue

            try:
                await self._handle_event(event)
            except Exception:
                logger.exception("Unhandled error processing event %s", event)

    async def _handle_event(self, event: SentinelEvent) -> None:
        if event.watch_type == WatchType.ZONE_TOUCH:
            zones = self._zones.get(event.symbol, [])
            # direction is stored per zone — infer from the watch that fired
            # (loop.py sets direction when registering the zone watch)
            await self._on_zone_touch(event.symbol, event.price, zones)

        elif event.watch_type == WatchType.TP1_HIT:
            await self._trade_agent.on_tp1_hit(event.symbol)

        elif event.watch_type == WatchType.BODY_SL:
            await self._trade_agent.on_body_close_sl(event.symbol, event.price)

        else:
            logger.warning("Unknown sentinel event type: %s", event.watch_type)

    async def _on_zone_touch(
        self, symbol: str, price: float, zones: list[dict]
    ) -> None:
        """Called when sentinel fires ZONE_TOUCH. Validates and enters the trade."""
        # direction is embedded in the zone that was touched — find it
        touching_zone = _find_touched_zone(price, zones)
        if not touching_zone:
            logger.warning("ZONE_TOUCH for %s @ %.4f but no matching zone found", symbol, price)
            return

        direction: Literal["long", "short"] = touching_zone.get("direction", "long")

        await notifier.send(
            user_id=TELEGRAM_CHAT_ID,
            event=notifier.ZONE_TOUCH,
            data={"symbol": symbol, "price": price},
        )

        should_enter = await self.check_entry(symbol, zones, direction)
        if not should_enter:
            logger.info("Entry gate blocked for %s — skipping", symbol)
            return

        tp_levels = find_tp_levels(price, direction, zones)
        sl_level = find_sl_level(price, direction, zones)

        if not tp_levels or not sl_level:
            logger.warning("Cannot compute TP/SL for %s — skipping entry", symbol)
            return

        tp1_zone, tp2_zone = tp_levels

        if tp1_zone is None:
            logger.warning("No TP1 zone found for %s — skipping entry", symbol)
            return

        # Extract float price from Zone dataclass.
        # For longs: target is the TOP of a supply zone (resistance ceiling).
        # For shorts: target is the BOTTOM of a demand zone (support floor).
        tp1_price = _zone_to_tp_price(tp1_zone, direction)
        tp2_price = _zone_to_tp_price(tp2_zone, direction) if tp2_zone is not None else tp1_price

        balance = self._balance
        size = _calc_position_size(balance, price, MARGIN_PCT, LEVERAGE)

        await self._trade_agent.enter_trade(
            symbol=symbol,
            side=direction,
            entry_price=price,
            size=size,
            tp1_price=tp1_price,
            tp2_price=tp2_price,
            sl_price=sl_level,
            leverage=LEVERAGE,
        )

        # After entering, register TP1 and body-SL watches in sentinel
        await self._sentinel.add_watch(
            symbol=symbol,
            watch_type=WatchType.TP1_HIT,
            tp1_price=tp1_price,
            direction=direction,
        )
        await self._sentinel.add_watch(
            symbol=symbol,
            watch_type=WatchType.BODY_SL,
            sl_price=sl_level,
            direction=direction,
        )


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _find_touched_zone(price: float, zones: list) -> dict | None:
    """Return the first zone whose range contains *price*, or None.

    Handles both Zone dataclass objects (from scan_tf_stack) and plain dicts.
    Always returns a plain dict with keys: bottom, top, direction, type.
    """
    for zone in zones:
        if hasattr(zone, "bottom"):
            # Zone dataclass
            bottom = zone.bottom
            top = zone.top
            direction = "long" if zone.type == "demand" else "short"
        else:
            # plain dict fallback
            bottom = zone.get("bottom", 0)
            top = zone.get("top", 0)
            direction = zone.get("direction", "long")

        if bottom <= price <= top:
            if hasattr(zone, "bottom"):
                return {"bottom": bottom, "top": top, "direction": direction, "type": zone.type}
            return zone
    return None


def _zone_to_tp_price(zone, direction: str) -> float:
    """
    Extract the TP float price from a Zone dataclass (or dict).

    Strategy rules:
    - LONG trade: price rises into supply zone → TP is the zone's TOP (resistance ceiling).
    - SHORT trade: price falls into demand zone → TP is the zone's BOTTOM (support floor).
    """
    if hasattr(zone, "top"):
        # Zone dataclass
        return zone.top if direction == "long" else zone.bottom
    else:
        # plain dict fallback
        return zone.get("top", 0.0) if direction == "long" else zone.get("bottom", 0.0)


def _calc_position_size(
    balance: float,
    price: float,
    margin_pct: float,
    leverage: int,
) -> float:
    """
    Calculate position size in base units.
      margin_usd = balance * margin_pct     (e.g. 0.5% of balance)
      notional   = margin_usd * leverage
      size       = notional / price
    """
    margin_usd = balance * margin_pct
    notional = margin_usd * leverage
    return notional / price
