from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.models.base import get_db
from backend.models.strategy import Strategy

router = APIRouter(prefix="/strategies", tags=["strategies"])


class StrategyOut(BaseModel):
    id: UUID
    name: str
    tier: str
    win_rate: float
    monthly_return: float
    status: str

    class Config:
        from_attributes = True


@router.get("", response_model=list[StrategyOut])
def list_strategies(db: Session = Depends(get_db)):
    return db.query(Strategy).all()


@router.get("/{strategy_id}", response_model=StrategyOut)
def get_strategy(strategy_id: UUID, db: Session = Depends(get_db)):
    strategy = db.query(Strategy).filter(Strategy.id == strategy_id).first()
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    return strategy
