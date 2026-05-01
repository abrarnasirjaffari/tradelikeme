from abc import ABC, abstractmethod
from typing import Any


class BaseStrategy(ABC):

    @abstractmethod
    async def scan_zones(self, symbol: str) -> list[dict]:
        """Scan all TFs for S/D zones. Returns [{type, top, bottom, tf, strength}]."""

    @abstractmethod
    async def check_entry(self, symbol: str, zones: list[dict]) -> dict | None:
        """Validate setup against all gates. Returns entry dict or None if no trade."""

    @abstractmethod
    def get_config(self) -> dict[str, Any]:
        """Return strategy params (coins, leverage, risk mode thresholds, etc.)."""

    @abstractmethod
    async def on_event(self, event_type: str, data: dict) -> None:
        """Handle sentinel events: ZONE_TOUCH, TP1_HIT, SL_HIT, etc."""

    def load_params(self, strategy_id: str) -> dict[str, Any]:
        """Read strategy params row from strategy DB. Override to customise."""
        import sqlite3
        db_path = f"strategy_{strategy_id}.db"
        try:
            con = sqlite3.connect(db_path)
            row = con.execute(
                "SELECT key, value FROM strategy_params"
            ).fetchall()
            con.close()
            return {k: v for k, v in row}
        except sqlite3.OperationalError:
            return {}
