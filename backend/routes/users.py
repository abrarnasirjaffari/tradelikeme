from uuid import UUID
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.auth import CurrentUser, require_auth
from backend.models.base import get_db
from backend.models.user import User

router = APIRouter(tags=["users"])

RiskMode = Literal["conservative", "medium", "aggressive"]


class RiskModeOut(BaseModel):
    user_id: UUID
    risk_mode: str


class RiskModeUpdate(BaseModel):
    risk_mode: RiskMode


def _enforce_ownership(user_id: UUID, current_user: CurrentUser) -> None:
    """Raise 403 if the authenticated user does not own this resource."""
    if str(user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Forbidden")


@router.get("/users/{user_id}/risk-mode", response_model=RiskModeOut)
def get_risk_mode(user_id: UUID, db: Session = Depends(get_db), current_user: CurrentUser = Depends(require_auth)):
    _enforce_ownership(user_id, current_user)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return RiskModeOut(user_id=user.id, risk_mode=user.risk_mode)


@router.post("/users/{user_id}/risk-mode", response_model=RiskModeOut)
def set_risk_mode(user_id: UUID, body: RiskModeUpdate, db: Session = Depends(get_db), current_user: CurrentUser = Depends(require_auth)):
    _enforce_ownership(user_id, current_user)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.risk_mode = body.risk_mode
    db.commit()
    db.refresh(user)
    return RiskModeOut(user_id=user.id, risk_mode=user.risk_mode)
