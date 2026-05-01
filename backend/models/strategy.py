from sqlalchemy import Column, String, Float, Enum, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from backend.models.base import Base


class Strategy(Base):
    __tablename__ = "strategies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    tier = Column(Enum("S", "A", "B", "C", name="strategy_tier_enum"), nullable=False)
    win_rate = Column(Float, nullable=False)
    monthly_return = Column(Float, nullable=False)
    status = Column(Enum("active", "paused", "pending", name="strategy_status_enum"), nullable=False, default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
