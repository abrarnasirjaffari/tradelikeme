from sqlalchemy import Column, String, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from backend.models.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    wallet_pubkey = Column(String, unique=True, nullable=True)
    risk_mode = Column(Enum("conservative", "medium", "aggressive", name="risk_mode_enum"), nullable=False, default="medium")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
