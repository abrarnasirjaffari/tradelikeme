from sqlalchemy import Column, Boolean, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from backend.models.base import Base


class NotificationConfig(Base):
    __tablename__ = "notification_configs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True, index=True)
    telegram_enabled = Column(Boolean, nullable=False, default=True)
    telegram_chat_id = Column(String, nullable=True)
    whatsapp_enabled = Column(Boolean, nullable=False, default=False)
    whatsapp_phone = Column(String, nullable=True)
    zone_touch = Column(Boolean, nullable=False, default=True)
    trade_entered = Column(Boolean, nullable=False, default=True)
    tp1_hit = Column(Boolean, nullable=False, default=True)
    tp2_hit = Column(Boolean, nullable=False, default=True)
    sl_hit = Column(Boolean, nullable=False, default=True)
    balance_low = Column(Boolean, nullable=False, default=True)
    agent_down = Column(Boolean, nullable=False, default=True)
    daily_summary = Column(Boolean, nullable=False, default=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
