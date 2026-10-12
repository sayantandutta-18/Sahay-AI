"""Application, User Document, and Granular Consent database models."""

from datetime import datetime, timezone
import uuid
from typing import List, Optional
from sqlalchemy import String, Integer, Float, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base


class Application(Base):
    """Scheme application tracker record for entrepreneur."""

    __tablename__ = "applications"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    scheme_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("schemes.id", ondelete="CASCADE"), index=True, nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(30), default="in_progress", nullable=False
    )  # not_started, in_progress, submitted, under_review, approved, rejected
    progress_percentage: Mapped[int] = mapped_column(Integer, default=25, nullable=False)
    lender_consent_granted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    consent_granted_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    submitted_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    notes: Mapped[str] = mapped_column(Text, default="", nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    user: Mapped["User"] = relationship("User")
    scheme: Mapped["Scheme"] = relationship("Scheme", lazy="selectin")
    documents: Mapped[List["UserDocument"]] = relationship(
        "UserDocument", back_populates="application", cascade="all, delete-orphan", lazy="selectin"
    )
    consents: Mapped[List["DataSharingConsent"]] = relationship(
        "DataSharingConsent", back_populates="application", cascade="all, delete-orphan", lazy="selectin"
    )


class UserDocument(Base):
    """User-uploaded document metadata and verification state."""

    __tablename__ = "user_documents"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    application_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("applications.id", ondelete="SET NULL"), index=True, nullable=True
    )
    document_type: Mapped[str] = mapped_column(
        String(60), nullable=False
    )  # pan, udyam, bank_statement, project_report, trade_license
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    storage_path: Mapped[str] = mapped_column(String(500), default="", nullable=False)
    verification_status: Mapped[str] = mapped_column(
        String(30), default="verified", nullable=False
    )  # pending, verified, rejected
    rejection_reason: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    expiry_date: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    application: Mapped[Optional["Application"]] = relationship(
        "Application", back_populates="documents"
    )


class DataSharingConsent(Base):
    """Granular and revocable data sharing consent records."""

    __tablename__ = "consents"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    application_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("applications.id", ondelete="CASCADE"), index=True, nullable=False
    )
    partner_name: Mapped[str] = mapped_column(String(160), nullable=False)  # e.g. State Bank of India
    shared_fields: Mapped[str] = mapped_column(
        Text, nullable=False
    )  # Comma-separated list: "name,phone,annual_turnover,udyam_number"
    is_revoked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    granted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    revoked_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    application: Mapped["Application"] = relationship("Application", back_populates="consents")
