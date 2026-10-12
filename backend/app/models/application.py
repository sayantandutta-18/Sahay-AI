"""Application, Checklist, User Document Vault, and Granular Consent database models."""

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
    # Statuses: draft, documents_needed, ready_to_submit, submitted, in_review, action_required, approved, rejected, withdrawn
    status: Mapped[str] = mapped_column(
        String(30), default="documents_needed", nullable=False
    )
    progress_percentage: Mapped[int] = mapped_column(Integer, default=20, nullable=False)
    due_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    next_action: Mapped[str] = mapped_column(
        String(255), default="Upload mandatory documentation", nullable=False
    )
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
    status_history: Mapped[List["ApplicationStatusHistory"]] = relationship(
        "ApplicationStatusHistory",
        back_populates="application",
        cascade="all, delete-orphan",
        order_by="ApplicationStatusHistory.created_at.desc()",
        lazy="selectin",
    )
    checklist_items: Mapped[List["ApplicationChecklistItem"]] = relationship(
        "ApplicationChecklistItem",
        back_populates="application",
        cascade="all, delete-orphan",
        order_by="ApplicationChecklistItem.created_at.asc()",
        lazy="selectin",
    )


class ApplicationStatusHistory(Base):
    """Immutable audit trail for application lifecycle changes."""

    __tablename__ = "application_status_history"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    application_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("applications.id", ondelete="CASCADE"), index=True, nullable=False
    )
    from_status: Mapped[str] = mapped_column(String(30), nullable=False)
    to_status: Mapped[str] = mapped_column(String(30), nullable=False)
    actor_id: Mapped[str] = mapped_column(String(36), nullable=False)
    actor_role: Mapped[str] = mapped_column(String(30), default="entrepreneur", nullable=False)
    change_reason: Mapped[str] = mapped_column(Text, default="", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    application: Mapped["Application"] = relationship("Application", back_populates="status_history")


class ApplicationChecklistItem(Base):
    """Checklist item required or optional for completing an application."""

    __tablename__ = "application_checklist_items"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    application_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("applications.id", ondelete="CASCADE"), index=True, nullable=False
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    document_type: Mapped[str] = mapped_column(String(60), nullable=False)
    is_mandatory: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    user_document_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("user_documents.id", ondelete="SET NULL"), nullable=True
    )
    validation_message: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    application: Mapped["Application"] = relationship("Application", back_populates="checklist_items")


class UserDocument(Base):
    """User-uploaded document metadata and verification state in secure vault."""

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
    display_label: Mapped[str] = mapped_column(String(200), default="", nullable=False)
    document_type: Mapped[str] = mapped_column(
        String(60), nullable=False
    )  # pan, udyam, bank_statement, project_report, trade_license, electricity_bill, aadhar_masked
    purpose: Mapped[str] = mapped_column(String(100), default="scheme_verification", nullable=False)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), default="application/pdf", nullable=False)
    checksum_sha256: Mapped[str] = mapped_column(String(64), default="", nullable=False)
    storage_path: Mapped[str] = mapped_column(String(500), default="", nullable=False)
    storage_key: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    verification_status: Mapped[str] = mapped_column(
        String(30), default="pending", nullable=False
    )  # pending, verified, rejected
    rejection_reason: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    expiry_date: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

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
