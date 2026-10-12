"""Administrative and security audit logging model."""

from datetime import datetime, timezone
import uuid
from typing import Optional
from sqlalchemy import String, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.database.base import Base


class AuditLog(Base):
    """Immutable ledger recording administrative changes, security events, and sensitive access."""

    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(String(36), index=True, nullable=False)
    user_email: Mapped[str] = mapped_column(String(120), default="", nullable=False)
    actor_role: Mapped[str] = mapped_column(String(30), default="user", nullable=False)
    action: Mapped[str] = mapped_column(
        String(80), index=True, nullable=False
    )  # SCHEME_CREATED, SCHEME_UPDATED, RULE_CHANGED, CONSENT_REVOKED, DOCUMENT_ACCESSED, STATUS_TRANSITION
    resource_type: Mapped[str] = mapped_column(String(60), nullable=False)  # scheme, rule, application, document
    resource_id: Mapped[str] = mapped_column(String(36), nullable=False)
    outcome: Mapped[str] = mapped_column(String(20), default="SUCCESS", nullable=False)  # SUCCESS, FAILURE, DENIED
    details: Mapped[str] = mapped_column(Text, default="", nullable=False)
    ip_address: Mapped[str] = mapped_column(String(45), default="127.0.0.1", nullable=False)
    correlation_id: Mapped[str] = mapped_column(String(64), default="", nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
