import sqlite3
import os
from pathlib import Path

DB_PATH = Path(__file__).parent.parent.parent.parent / "strategy_sd.db"


def _get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with _get_conn() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS trades (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id     TEXT,
                symbol      TEXT    NOT NULL,
                side        TEXT    NOT NULL,
                entry       REAL    NOT NULL,
                sl          REAL    NOT NULL,
                tp1         REAL    NOT NULL,
                tp2         REAL    NOT NULL,
                status      TEXT    NOT NULL DEFAULT 'open',
                open_time   TEXT    NOT NULL,
                close_time  TEXT,
                pnl         REAL
            );

            CREATE TABLE IF NOT EXISTS positions (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol      TEXT    NOT NULL,
                side        TEXT    NOT NULL,
                size        REAL    NOT NULL,
                entry       REAL    NOT NULL,
                current_sl  REAL    NOT NULL,
                tp1         REAL    NOT NULL,
                tp2         REAL    NOT NULL,
                strategy_id TEXT    NOT NULL
            );

            CREATE TABLE IF NOT EXISTS epochs (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                strategy_id   TEXT    NOT NULL,
                user_id       TEXT    NOT NULL,
                open_balance  REAL    NOT NULL,
                close_balance REAL    NOT NULL,
                profit        REAL    NOT NULL,
                platform_fee  REAL    NOT NULL,
                timestamp     TEXT    NOT NULL
            );
        """)


def log_trade_open(symbol: str, side: str, entry: float, sl: float,
                   tp1: float, tp2: float, open_time: str,
                   user_id: str | None = None) -> int:
    with _get_conn() as conn:
        cur = conn.execute(
            "INSERT INTO trades (user_id, symbol, side, entry, sl, tp1, tp2, open_time) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (user_id, symbol, side, entry, sl, tp1, tp2, open_time),
        )
        return cur.lastrowid


def log_trade_close(trade_id: int, exit_price: float, pnl: float,
                    close_time: str, status: str = "closed") -> None:
    with _get_conn() as conn:
        conn.execute(
            "UPDATE trades SET status=?, close_time=?, pnl=? WHERE id=?",
            (status, close_time, pnl, trade_id),
        )


def get_open_trades() -> list[sqlite3.Row]:
    with _get_conn() as conn:
        return conn.execute(
            "SELECT * FROM trades WHERE status='open'"
        ).fetchall()


def log_epoch(strategy_id: str, user_id: str, open_balance: float,
              close_balance: float, profit: float, platform_fee: float,
              timestamp: str) -> int:
    with _get_conn() as conn:
        cur = conn.execute(
            "INSERT INTO epochs (strategy_id, user_id, open_balance, close_balance, profit, platform_fee, timestamp) "
            "VALUES (?, ?, ?, ?, ?, ?, ?)",
            (strategy_id, user_id, open_balance, close_balance, profit, platform_fee, timestamp),
        )
        return cur.lastrowid
