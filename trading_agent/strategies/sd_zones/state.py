from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class TradeState:
    trade_id: int
    symbol: str
    side: str
    entry: float
    sl: float
    tp1: float
    tp2: float
    size: float
    open_time: str


@dataclass
class WatchState:
    symbol: str
    zone_top: float
    zone_bottom: float
    watch_type: str  # "zone_touch" | "tp1" | "sl"


class AgentState:
    def __init__(self) -> None:
        self.open_trades: dict[str, TradeState] = {}   # symbol -> TradeState
        self.watchlist: dict[str, WatchState] = {}     # symbol -> WatchState
        self.last_scan_time: datetime | None = None
        self.scan_complete: bool = False


# Module-level singleton — import and use directly
state = AgentState()
