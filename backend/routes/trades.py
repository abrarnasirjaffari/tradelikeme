from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.auth import CurrentUser, require_auth
from backend.models.base import get_db
from backend.models.user import User
from trading_agent.strategies.sd_zones.journal import (
    DB_PATH,
    _get_conn,
)

router = APIRouter(tags=["trades"])


class TradeOut(BaseModel):
    id: int
    symbol: str
    side: str
    entry: float
    sl: float
    tp1: float
    tp2: float
    status: str
    open_time: str
    close_time: str | None
    pnl: float | None


class PnlSummary(BaseModel):
    total_trades: int
    open_trades: int
    closed_trades: int
    wins: int
    losses: int
    win_rate: float
    total_pnl: float
    avg_winner: float
    avg_loser: float


def _enforce_ownership(user_id: UUID, current_user: CurrentUser) -> None:
    """Raise 403 if the authenticated user does not own this resource."""
    if str(user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Forbidden")


def _require_user(user_id: UUID, db: Session):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")


@router.get("/users/{user_id}/trades", response_model=list[TradeOut])
def list_trades(user_id: UUID, db: Session = Depends(get_db), current_user: CurrentUser = Depends(require_auth)):
    _enforce_ownership(user_id, current_user)
    _require_user(user_id, db)

    if not DB_PATH.exists():
        return []

    conn = _get_conn()
    rows = conn.execute(
        "SELECT * FROM trades WHERE user_id = ? ORDER BY open_time DESC",
        (str(user_id),),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


@router.get("/users/{user_id}/pnl", response_model=PnlSummary)
def get_pnl(user_id: UUID, db: Session = Depends(get_db), current_user: CurrentUser = Depends(require_auth)):
    _enforce_ownership(user_id, current_user)
    _require_user(user_id, db)

    if not DB_PATH.exists():
        return PnlSummary(
            total_trades=0, open_trades=0, closed_trades=0,
            wins=0, losses=0, win_rate=0.0,
            total_pnl=0.0, avg_winner=0.0, avg_loser=0.0,
        )

    conn = _get_conn()
    rows = conn.execute("SELECT * FROM trades WHERE user_id = ?", (str(user_id),)).fetchall()
    conn.close()

    trades = [dict(r) for r in rows]
    open_trades = [t for t in trades if t["status"] == "open"]
    closed = [t for t in trades if t["status"] != "open" and t["pnl"] is not None]
    wins = [t for t in closed if t["pnl"] > 0]
    losses = [t for t in closed if t["pnl"] <= 0]

    total_pnl = sum(t["pnl"] for t in closed)
    avg_winner = sum(t["pnl"] for t in wins) / len(wins) if wins else 0.0
    avg_loser = sum(t["pnl"] for t in losses) / len(losses) if losses else 0.0
    win_rate = len(wins) / len(closed) if closed else 0.0

    return PnlSummary(
        total_trades=len(trades),
        open_trades=len(open_trades),
        closed_trades=len(closed),
        wins=len(wins),
        losses=len(losses),
        win_rate=round(win_rate, 4),
        total_pnl=round(total_pnl, 4),
        avg_winner=round(avg_winner, 4),
        avg_loser=round(avg_loser, 4),
    )
