from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from backend.auth import CurrentUser, require_admin
from backend.models.base import get_db
from backend.models.strategy import Strategy
from backend.models.subscription import Subscription

router = APIRouter(prefix="/admin", tags=["admin"])

# Fee rates per tier (platform's 30% of the tier fee)
_TIER_FEES = {"S": 0.045, "A": 0.036, "B": 0.030, "C": 0.024}

# Our own strategy earns 20% profit share directly
_OWN_STRATEGY_SHARE = 0.20


class StrategyCreate(BaseModel):
    name: str
    tier: Literal["S", "A", "B", "C"]
    win_rate: float = Field(ge=0.0, le=1.0)
    monthly_return: float = Field(ge=0.0)
    status: Literal["active", "paused", "pending"] = "pending"


class StrategyOut(BaseModel):
    id: UUID
    name: str
    tier: str
    win_rate: float
    monthly_return: float
    status: str

    class Config:
        from_attributes = True


class StrategyRevenueRow(BaseModel):
    strategy_id: UUID
    strategy_name: str
    tier: str
    active_subscriptions: int
    monthly_return_pct: float
    platform_fee_pct: float


class RevenueOut(BaseModel):
    strategies: list[StrategyRevenueRow]
    total_active_subscriptions: int


@router.post("/strategies", response_model=StrategyOut, status_code=201)
def add_strategy(body: StrategyCreate, db: Session = Depends(get_db), _: CurrentUser = Depends(require_admin)):
    existing = db.query(Strategy).filter(Strategy.name == body.name).first()
    if existing:
        raise HTTPException(status_code=409, detail="Strategy with this name already exists")

    strategy = Strategy(
        name=body.name,
        tier=body.tier,
        win_rate=body.win_rate,
        monthly_return=body.monthly_return,
        status=body.status,
    )
    db.add(strategy)
    db.commit()
    db.refresh(strategy)
    return strategy


@router.get("/revenue", response_model=RevenueOut)
def get_revenue(db: Session = Depends(get_db), _: CurrentUser = Depends(require_admin)):
    strategies = db.query(Strategy).all()

    rows: list[StrategyRevenueRow] = []
    total_active = 0

    for s in strategies:
        active_count = (
            db.query(Subscription)
            .filter(
                Subscription.strategy_id == s.id,
                Subscription.status == "active",
            )
            .count()
        )
        total_active += active_count

        platform_fee_pct = _TIER_FEES.get(s.tier, _OWN_STRATEGY_SHARE)

        rows.append(
            StrategyRevenueRow(
                strategy_id=s.id,
                strategy_name=s.name,
                tier=s.tier,
                active_subscriptions=active_count,
                monthly_return_pct=s.monthly_return,
                platform_fee_pct=platform_fee_pct,
            )
        )

    return RevenueOut(strategies=rows, total_active_subscriptions=total_active)
