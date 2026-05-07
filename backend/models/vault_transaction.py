from datetime import datetime, timezone

from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid

from backend.models.base import Base


def _utcnow():
    return datetime.now(timezone.utc)


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
    amount_usdc = Column(Numeric(precision=18, scale=6), nullable=False)
    tx_signature = Column(String, nullable=True)   # set on /confirm
    status = Column(String, nullable=False, default="pending")  # pending / confirmed / failed
    created_at = Column(DateTime, nullable=False, default=_utcnow)
