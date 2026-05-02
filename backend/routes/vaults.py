from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from backend.auth import CurrentUser, require_auth
from backend.models.base import get_db
from backend.models.subscription import Subscription
from backend.models.user import User

router = APIRouter(tags=["vaults"])


class VaultOut(BaseModel):
    subscription_id: UUID
    strategy_id: UUID
    vault_address: str | None
    status: str

    class Config:
        from_attributes = True


class DepositRequest(BaseModel):
    amount_usdc: float = Field(..., gt=0)


class WithdrawRequest(BaseModel):
    amount_usdc: float = Field(..., gt=0)


class TxResponse(BaseModel):
    subscription_id: UUID
    vault_address: str
    amount_usdc: float
    message: str


@router.get("/users/{user_id}/vaults", response_model=list[VaultOut])
def list_user_vaults(user_id: UUID, db: Session = Depends(get_db), _: CurrentUser = Depends(require_auth)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    subs = (
        db.query(Subscription)
        .filter(Subscription.user_id == user_id, Subscription.status == "active")
        .all()
    )
    return [
        VaultOut(
            subscription_id=s.id,
            strategy_id=s.strategy_id,
            vault_address=s.vault_address,
            status=s.status,
        )
        for s in subs
    ]


@router.post("/vaults/{subscription_id}/deposit", response_model=TxResponse)
def deposit(subscription_id: UUID, body: DepositRequest, db: Session = Depends(get_db), _: CurrentUser = Depends(require_auth)):
    sub = db.query(Subscription).filter(Subscription.id == subscription_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    if sub.status != "active":
        raise HTTPException(status_code=409, detail="Subscription is not active")
    if not sub.vault_address:
        raise HTTPException(status_code=409, detail="Vault address not set — delegate first")

    # TODO: call anchor_vault_client.deposit(sub.vault_address, body.amount_usdc)
    # Returns serialized transaction for frontend to sign via Phantom

    return TxResponse(
        subscription_id=sub.id,
        vault_address=sub.vault_address,
        amount_usdc=body.amount_usdc,
        message="deposit_queued",
    )


@router.post("/vaults/{subscription_id}/withdraw", response_model=TxResponse)
def withdraw(subscription_id: UUID, body: WithdrawRequest, db: Session = Depends(get_db), _: CurrentUser = Depends(require_auth)):
    sub = db.query(Subscription).filter(Subscription.id == subscription_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    if sub.status != "active":
        raise HTTPException(status_code=409, detail="Subscription is not active")
    if not sub.vault_address:
        raise HTTPException(status_code=409, detail="Vault address not set")

    # TODO: call anchor_vault_client.withdraw(sub.vault_address, body.amount_usdc)
    # Returns serialized transaction for frontend to sign via Phantom

    return TxResponse(
        subscription_id=sub.id,
        vault_address=sub.vault_address,
        amount_usdc=body.amount_usdc,
        message="withdrawal_queued",
    )
