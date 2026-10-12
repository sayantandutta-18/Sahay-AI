"""Financial Intelligence & Digital Twin database models."""

from datetime import datetime, timezone
import uuid
from typing import Optional, Dict, Any
from sqlalchemy import String, Float, Integer, Boolean, ForeignKey, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base


class FinancialRecord(Base):
    """User baseline financial snapshot for deterministic intelligence."""

    __tablename__ = "financial_records"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False
    )
    monthly_income: Mapped[float] = mapped_column(Float, default=60000.0, nullable=False)
    essential_expenses: Mapped[float] = mapped_column(Float, default=28000.0, nullable=False)
    discretionary_expenses: Mapped[float] = mapped_column(Float, default=12000.0, nullable=False)
    monthly_debt_emi: Mapped[float] = mapped_column(Float, default=5000.0, nullable=False)
    liquid_savings: Mapped[float] = mapped_column(Float, default=95000.0, nullable=False)
    estimated_credit_score: Mapped[int] = mapped_column(Integer, default=735, nullable=False)
    credit_utilization_pct: Mapped[float] = mapped_column(Float, default=25.0, nullable=False)
    on_time_payment_pct: Mapped[float] = mapped_column(Float, default=98.5, nullable=False)
    credit_history_months: Mapped[int] = mapped_column(Integer, default=36, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user = relationship("User")


class FinancialTransaction(Base):
    """Ledger transaction for smart expense tracking and fraud detection."""

    __tablename__ = "financial_transactions"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)  # raw_materials, rent, utilities, marketing, personal, general
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    transaction_type: Mapped[str] = mapped_column(String(20), default="expense", nullable=False)  # income, expense
    is_essential: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    vendor_name: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    is_flagged_fraud: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    fraud_reason: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    transaction_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    user = relationship("User")


class FinancialTwinScenario(Base):
    """Digital twin hypothetical scenario sandbox."""

    __tablename__ = "financial_twin_scenarios"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    scenario_name: Mapped[str] = mapped_column(String(120), nullable=False)
    scenario_type: Mapped[str] = mapped_column(String(50), nullable=False)  # new_loan, revenue_shock, expense_inflation, custom
    parameters: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    projected_metrics: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    risk_score: Mapped[float] = mapped_column(Float, default=30.0, nullable=False)
    verdict: Mapped[str] = mapped_column(String(30), default="safe", nullable=False)  # safe, caution, critical

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    user = relationship("User")
