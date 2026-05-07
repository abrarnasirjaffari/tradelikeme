from datetime import datetime

from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid

from backend.models.base import Base


class VaultTransaction(Base):
    __tablename__ = "vault_transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subscription_id = Column(
        UUID(as_uuid=True),
        ForeignKey("subscriptions.id"),
        nullable=False,
        index=True,
    )
    type = Column(String, nullable=False)          # "deposit" or "withdraw"
    amount_usdc = Column(Float, nullable=False)
    tx_signature = Column(String, nullable=True)   # set on /confirm
    status = Column(String, nullable=False, default="pending")  # pending / confirmed / failed
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
