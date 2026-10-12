"""Government scheme and deterministic rule models."""

from datetime import datetime, timezone
import uuid
from typing import List
from sqlalchemy import String, Text, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base


class Scheme(Base):
    """Verified Government Scheme record."""

    __tablename__ = "schemes"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(200), unique=True, index=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(200), unique=True, index=True, nullable=False)
    provider: Mapped[str] = mapped_column(String(160), nullable=False)  # e.g. Ministry of MSME
    scheme_type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # subsidy, loan, grant, training, equity_support
    short_description: Mapped[str] = mapped_column(Text, nullable=False)
    detailed_benefits: Mapped[str] = mapped_column(Text, nullable=False)
    max_amount: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    interest_subsidy_pct: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    states_served: Mapped[str] = mapped_column(
        String(255), default="ALL", nullable=False
    )  # Comma-separated: "ALL" or "West Bengal,Odisha"
    target_sectors: Mapped[str] = mapped_column(
        String(255), default="ALL", nullable=False
    )  # Comma-separated: "manufacturing,services"
    official_url: Mapped[str] = mapped_column(String(500), nullable=False)
    last_verified_at: Mapped[str] = mapped_column(String(30), nullable=False)  # ISO Date YYYY-MM-DD
    language_coverage: Mapped[str] = mapped_column(
        String(100), default="en,hi,bn", nullable=False
    )
    publication_status: Mapped[str] = mapped_column(
        String(30), default="published", nullable=False
    )  # draft, published, archived
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

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
    documents: Mapped[List["SchemeDocumentRequirement"]] = relationship(
        "SchemeDocumentRequirement", back_populates="scheme", cascade="all, delete-orphan", lazy="selectin"
    )
    rules: Mapped[List["SchemeRule"]] = relationship(
        "SchemeRule", back_populates="scheme", cascade="all, delete-orphan", lazy="selectin"
    )


class SchemeDocumentRequirement(Base):
    """Document criteria checklist for a scheme."""

    __tablename__ = "scheme_documents"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    scheme_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("schemes.id", ondelete="CASCADE"), index=True, nullable=False
    )
    document_type: Mapped[str] = mapped_column(String(60), nullable=False)
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)
    mandatory: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    how_to_get_url: Mapped[str] = mapped_column(String(500), default="", nullable=False)

    # Relationships
    scheme: Mapped["Scheme"] = relationship("Scheme", back_populates="documents")


class SchemeRule(Base):
    """Auditable deterministic rule evaluated by the eligibility engine."""

    __tablename__ = "scheme_rules"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    scheme_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("schemes.id", ondelete="CASCADE"), index=True, nullable=False
    )
    field: Mapped[str] = mapped_column(
        String(60), nullable=False
    )  # e.g. state, business_type, annual_turnover, has_udyam, gender
    operator: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  # eq, neq, in, lte, gte, lt, gt, boolean_is
    value: Mapped[str] = mapped_column(
        String(255), nullable=False
    )  # string representation: "5000000", "true", "manufacturing,services"
    weight: Mapped[float] = mapped_column(
        Float, default=10.0, nullable=False
    )  # scoring weight for soft rules
    explanation: Mapped[str] = mapped_column(Text, nullable=False)
    is_hard_rule: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False
    )  # If True, must pass; if False, adds points to match score
    rule_version: Mapped[str] = mapped_column(String(20), default="1.0.0", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    scheme: Mapped["Scheme"] = relationship("Scheme", back_populates="rules")
