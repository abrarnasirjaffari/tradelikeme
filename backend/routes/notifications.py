from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.auth import CurrentUser, require_auth
from backend.limiter import limiter
from backend.models.base import get_db
from backend.models.notification_config import NotificationConfig
from backend.models.user import User
from trading_agent.channels.telegram import send_telegram

router = APIRouter(tags=["notifications"])


class NotificationConfigOut(BaseModel):
    id: UUID
    user_id: UUID
    telegram_enabled: bool
    telegram_chat_id: str | None
    whatsapp_enabled: bool
    whatsapp_phone: str | None
    zone_touch: bool
    trade_entered: bool
    tp1_hit: bool
    tp2_hit: bool
    sl_hit: bool
    balance_low: bool
    agent_down: bool
    daily_summary: bool

    class Config:
        from_attributes = True


class NotificationConfigUpdate(BaseModel):
    telegram_enabled: bool | None = None
    telegram_chat_id: str | None = None
    whatsapp_enabled: bool | None = None
    whatsapp_phone: str | None = None
    zone_touch: bool | None = None
    trade_entered: bool | None = None
    tp1_hit: bool | None = None
    tp2_hit: bool | None = None
    sl_hit: bool | None = None
    balance_low: bool | None = None
    agent_down: bool | None = None
    daily_summary: bool | None = None


class TestNotificationRequest(BaseModel):
    channel: str = "telegram"


def _enforce_ownership(user_id: UUID, current_user: CurrentUser) -> None:
    """Raise 403 if the authenticated user does not own this resource."""
    if str(user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Forbidden")


def _require_user(user_id: UUID, db: Session) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def _get_or_create_config(user_id: UUID, db: Session) -> NotificationConfig:
    config = db.query(NotificationConfig).filter(NotificationConfig.user_id == user_id).first()
    if not config:
        config = NotificationConfig(user_id=user_id)
        db.add(config)
        db.commit()
        db.refresh(config)
    return config


@router.get("/notifications/config", response_model=NotificationConfigOut)
def get_notification_config(user_id: UUID, db: Session = Depends(get_db), current_user: CurrentUser = Depends(require_auth)):
    _enforce_ownership(user_id, current_user)
    _require_user(user_id, db)
    return _get_or_create_config(user_id, db)


@router.post("/notifications/config", response_model=NotificationConfigOut)
def update_notification_config(
    user_id: UUID,
    body: NotificationConfigUpdate,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth),
):
    _enforce_ownership(user_id, current_user)
    _require_user(user_id, db)
    config = _get_or_create_config(user_id, db)

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(config, field, value)

    db.commit()
    db.refresh(config)
    return config


@router.post("/notifications/test", status_code=200)
@limiter.limit("10/minute")
async def test_notification(
    request: Request,
    user_id: UUID,
    body: TestNotificationRequest,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth),
):
    _enforce_ownership(user_id, current_user)
    _require_user(user_id, db)
    config = _get_or_create_config(user_id, db)

    if body.channel == "telegram":
        if not config.telegram_enabled:
            raise HTTPException(status_code=400, detail="Telegram notifications are disabled")
        if not config.telegram_chat_id:
            raise HTTPException(status_code=400, detail="No Telegram chat ID configured")
        await send_telegram(
            config.telegram_chat_id,
            "✅ <b>TradeLikeMe</b> — test notification working.",
        )
        return {"sent": True, "channel": "telegram", "chat_id": config.telegram_chat_id}

    raise HTTPException(status_code=400, detail=f"Unsupported channel: {body.channel}")
