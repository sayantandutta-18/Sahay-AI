"""Investment profile, risk assessment, and regulatory disclosure models."""

from datetime import datetime, timezone
import uuid
from typing import Optional
from sqlalchemy import String, Float, Integer, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base


class FinancialProfile(Base):
    """User financial and investment risk profile."""

    __tablename__ = "financial_profiles"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False
    )
    investment_goal: Mapped[str] = mapped_column(
        String(50), default="wealth_accumulation", nullable=False
    )  # wealth_accumulation, emergency_fund, retirement, business_cushion
    monthly_investible_surplus: Mapped[float] = mapped_column(Float, default=5000.0, nullable=False)
    time_horizon_years: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    risk_tolerance: Mapped[str] = mapped_column(
        String(30), default="moderate", nullable=False
    )  # conservative, moderate, aggressive, capital_preservation
    market_experience: Mapped[str] = mapped_column(
        String(30), default="beginner", nullable=False
    )  # beginner, intermediate, advanced
    liquidity_needs: Mapped[str] = mapped_column(
        String(30), default="medium", nullable=False
    )  # high, medium, low
    calculated_risk_score: Mapped[int] = mapped_column(Integer, default=50, nullable=False)  # 0 to 100
    risk_category: Mapped[str] = mapped_column(String(50), default="Balanced Growth", nullable=False)
    disclosures_acknowledged: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

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
