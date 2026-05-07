"""
Vault routes — deposit/withdraw via Anchor vault program on Solana devnet.

Flow:
  1. POST /vaults/{id}/deposit          → returns unsigned base64 tx for Phantom to sign
  2. POST /vaults/{id}/deposit/confirm  → stores tx_signature after Phantom submits
  3. POST /vaults/{id}/withdraw         → returns unsigned base64 tx for Phantom to sign
  4. POST /vaults/{id}/withdraw/confirm → stores tx_signature after Phantom submits
  5. GET  /vaults/{id}/history          → vault transaction history
  6. GET  /users/{id}/vaults            → list active vaults for a user
"""

import os
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from backend.auth import CurrentUser, require_auth
from backend.models.base import get_db
from backend.models.subscription import Subscription
from backend.models.user import User
from backend.models.vault_transaction import VaultTransaction
from trading_agent.exchanges.solana.anchor_vault_client import (
    AnchorVaultClient,
    USDC_DECIMALS,
)

router = APIRouter(tags=["vaults"])

# One shared client — RPC connection is managed internally by AsyncClient.
vault_client = AnchorVaultClient(
    rpc_url=os.getenv("HELIUS_RPC_URL", "https://api.devnet.solana.com")
)


# ── Pydantic models ────────────────────────────────────────────────────────────

class VaultOut(BaseModel):
    subscription_id: UUID
    strategy_id: UUID
    vault_address: str | None
    status: str

    class Config:
        from_attributes = True


class DepositRequest(BaseModel):
    amount_usdc: float = Field(..., gt=0, description="Amount in USDC (e.g. 100.0)")
    user_wallet_pubkey: str = Field(..., description="User's Solana wallet public key (base58)")


class DepositTxResponse(BaseModel):
    serialized_tx: str        # base64 unsigned tx — pass to Phantom signAndSendTransaction
    vault_address: str        # vault PDA (base58)
    requires_vault_init: bool  # True if create_vault was prepended


class WithdrawRequest(BaseModel):
    amount_usdc: float = Field(..., gt=0, description="Amount in USDC (e.g. 50.0)")
    user_wallet_pubkey: str = Field(..., description="User's Solana wallet public key (base58)")


class WithdrawTxResponse(BaseModel):
    serialized_tx: str  # base64 unsigned tx
    vault_address: str  # vault PDA (base58)


class ConfirmRequest(BaseModel):
    tx_signature: str
    amount_usdc: float = Field(..., gt=0)


class ConfirmResponse(BaseModel):
    success: bool
    tx_signature: str


class VaultTxOut(BaseModel):
    id: UUID
    subscription_id: UUID
    type: str
    amount_usdc: float
    tx_signature: str | None
    status: str
    created_at: str

    class Config:
        from_attributes = True


# ── Helpers ────────────────────────────────────────────────────────────────────

def _usdc_to_lamports(amount_usdc: float) -> int:
    """Convert USDC float to integer micro-USDC (6 decimals)."""
    return int(round(amount_usdc * (10 ** USDC_DECIMALS)))


def _get_active_sub(subscription_id: UUID, db: Session) -> Subscription:
    sub = db.query(Subscription).filter(Subscription.id == subscription_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    if sub.status != "active":
        raise HTTPException(status_code=409, detail="Subscription is not active")
    return sub


# ── List user vaults ───────────────────────────────────────────────────────────

@router.get("/users/{user_id}/vaults", response_model=list[VaultOut])
def list_user_vaults(
    user_id: UUID,
    db: Session = Depends(get_db),
    _: CurrentUser = Depends(require_auth),
):
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


# ── Deposit ────────────────────────────────────────────────────────────────────

@router.post("/vaults/{subscription_id}/deposit", response_model=DepositTxResponse)
async def deposit(
    subscription_id: UUID,
    body: DepositRequest,
    db: Session = Depends(get_db),
    _: CurrentUser = Depends(require_auth),
):
    """
    Build an unsigned deposit transaction.

    Returns a base64 serialized transaction.  The frontend calls
    `wallet.signAndSendTransaction(deserialize(serialized_tx))` via Phantom,
    then POSTs the resulting signature to /deposit/confirm.

    If the vault PDA doesn't exist yet, create_vault is automatically prepended.
    If the vault token account doesn't exist yet, create_associated_token_account
    is prepended so that all three instructions land in a single atomic tx.
    """
    sub = _get_active_sub(subscription_id, db)
    strategy_id = str(sub.strategy_id)
    amount_lamports = _usdc_to_lamports(body.amount_usdc)

    try:
        result = await vault_client.build_deposit_tx(
            user_pubkey=body.user_wallet_pubkey,
            strategy_id=strategy_id,
            amount_lamports=amount_lamports,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to build deposit tx: {exc}") from exc

    # Persist vault_address on first deposit if not already stored
    if not sub.vault_address:
        sub.vault_address = result["vault_address"]
        db.commit()

    return DepositTxResponse(
        serialized_tx=result["serialized_tx"],
        vault_address=result["vault_address"],
        requires_vault_init=result["requires_vault_init"],
    )


@router.post("/vaults/{subscription_id}/deposit/confirm", response_model=ConfirmResponse)
def confirm_deposit(
    subscription_id: UUID,
    req: ConfirmRequest,
    db: Session = Depends(get_db),
    _: CurrentUser = Depends(require_auth),
):
    """
    Record a confirmed deposit after Phantom signs and submits the transaction.

    The frontend calls this with the tx signature returned by Phantom.
    """
    sub = _get_active_sub(subscription_id, db)

    tx_record = VaultTransaction(
        subscription_id=sub.id,
        type="deposit",
        amount_usdc=req.amount_usdc,
        tx_signature=req.tx_signature,
        status="confirmed",
    )
    db.add(tx_record)
    db.commit()

    return ConfirmResponse(success=True, tx_signature=req.tx_signature)


# ── Withdraw ───────────────────────────────────────────────────────────────────

@router.post("/vaults/{subscription_id}/withdraw", response_model=WithdrawTxResponse)
async def withdraw(
    subscription_id: UUID,
    body: WithdrawRequest,
    db: Session = Depends(get_db),
    _: CurrentUser = Depends(require_auth),
):
    """
    Build an unsigned withdraw transaction.

    The vault PDA must already exist (the user must have deposited before).
    Returns a base64 serialized transaction for Phantom to sign and submit.
    """
    sub = _get_active_sub(subscription_id, db)

    if not sub.vault_address:
        raise HTTPException(
            status_code=409,
            detail="No vault found for this subscription — deposit first",
        )

    strategy_id = str(sub.strategy_id)
    amount_lamports = _usdc_to_lamports(body.amount_usdc)

    try:
        result = await vault_client.build_withdraw_tx(
            user_pubkey=body.user_wallet_pubkey,
            strategy_id=strategy_id,
            amount_lamports=amount_lamports,
        )
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to build withdraw tx: {exc}") from exc

    return WithdrawTxResponse(
        serialized_tx=result["serialized_tx"],
        vault_address=result["vault_address"],
    )


@router.post("/vaults/{subscription_id}/withdraw/confirm", response_model=ConfirmResponse)
def confirm_withdraw(
    subscription_id: UUID,
    req: ConfirmRequest,
    db: Session = Depends(get_db),
    _: CurrentUser = Depends(require_auth),
):
    """
    Record a confirmed withdrawal after Phantom signs and submits the transaction.
    """
    sub = _get_active_sub(subscription_id, db)

    tx_record = VaultTransaction(
        subscription_id=sub.id,
        type="withdraw",
        amount_usdc=req.amount_usdc,
        tx_signature=req.tx_signature,
        status="confirmed",
    )
    db.add(tx_record)
    db.commit()

    return ConfirmResponse(success=True, tx_signature=req.tx_signature)


# ── Transaction history ────────────────────────────────────────────────────────

@router.get("/vaults/{subscription_id}/history", response_model=list[VaultTxOut])
def vault_history(
    subscription_id: UUID,
    db: Session = Depends(get_db),
    _: CurrentUser = Depends(require_auth),
):
    """Return all vault transactions (deposits + withdrawals) for a subscription."""
    sub = db.query(Subscription).filter(Subscription.id == subscription_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")

    txs = (
        db.query(VaultTransaction)
        .filter(VaultTransaction.subscription_id == subscription_id)
        .order_by(VaultTransaction.created_at.desc())
        .all()
    )
    return [
        VaultTxOut(
            id=tx.id,
            subscription_id=tx.subscription_id,
            type=tx.type,
            amount_usdc=tx.amount_usdc,
            tx_signature=tx.tx_signature,
            status=tx.status,
            created_at=tx.created_at.isoformat() if tx.created_at else "",
        )
        for tx in txs
    ]
