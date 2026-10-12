"""Business profile database model."""

from datetime import datetime, timezone
import uuid
from sqlalchemy import String, Float, Boolean, Integer, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base


class BusinessProfile(Base):
    """Micro-enterprise operational parameters and documentation indicators."""

    __tablename__ = "business_profiles"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False
    )
    business_name: Mapped[str] = mapped_column(String(160), default="", nullable=False)
    business_type: Mapped[str] = mapped_column(
        String(50), default="manufacturing", nullable=False
    )  # manufacturing, services, trading, agriculture_allied
    category: Mapped[str] = mapped_column(
        String(20), default="micro", nullable=False
    )  # micro, small, medium
    annual_turnover: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    monthly_revenue: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    monthly_expense: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    existing_loans: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    gender: Mapped[str] = mapped_column(String(20), default="unspecified", nullable=False)
    caste_category: Mapped[str] = mapped_column(String(20), default="general", nullable=False)

    # Documentation readiness flags
    has_udyam: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    has_gst: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    has_pan: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    has_bank_account: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Operational history
    months_in_operation: Mapped[int] = mapped_column(Integer, default=12, nullable=False)
    completion_percentage: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

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
    user: Mapped["User"] = relationship("User", back_populates="business_profile")
