from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.auth import CurrentUser, require_auth
from backend.models.base import get_db
from backend.models.subscription import Subscription
from backend.models.user import User
from backend.models.strategy import Strategy

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


class SubscriptionCreate(BaseModel):
    user_id: UUID
    strategy_id: UUID
    vault_address: str | None = None


class SubscriptionOut(BaseModel):
    id: UUID
    user_id: UUID
    strategy_id: UUID
    vault_address: str | None
    status: str

    class Config:
        from_attributes = True


@router.post("", response_model=SubscriptionOut, status_code=201)
def create_subscription(body: SubscriptionCreate, db: Session = Depends(get_db), _: CurrentUser = Depends(require_auth)):
    user = db.query(User).filter(User.id == body.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    strategy = db.query(Strategy).filter(Strategy.id == body.strategy_id).first()
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")

    existing = (
        db.query(Subscription)
        .filter(
            Subscription.user_id == body.user_id,
            Subscription.strategy_id == body.strategy_id,
            Subscription.status == "active",
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Already subscribed to this strategy")

    sub = Subscription(
        user_id=body.user_id,
        strategy_id=body.strategy_id,
        vault_address=body.vault_address,
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub


@router.delete("/{subscription_id}", status_code=204)
def cancel_subscription(subscription_id: UUID, db: Session = Depends(get_db), _: CurrentUser = Depends(require_auth)):
    sub = db.query(Subscription).filter(Subscription.id == subscription_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    if sub.status == "cancelled":
        raise HTTPException(status_code=409, detail="Subscription already cancelled")

    sub.status = "cancelled"
    db.commit()
