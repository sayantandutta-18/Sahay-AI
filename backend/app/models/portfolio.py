"""Watchlist, paper trading portfolio, and simulated transactions models."""

from datetime import datetime, timezone
import uuid
from typing import List, Optional
from sqlalchemy import String, Float, Integer, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base


class WatchlistItem(Base):
    """Assets added to user's observation watchlist."""

    __tablename__ = "watchlist_items"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    ticker: Mapped[str] = mapped_column(String(30), nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    asset_class: Mapped[str] = mapped_column(
        String(30), default="equity", nullable=False
    )  # equity, etf, mutual_fund, commodity
    exchange: Mapped[str] = mapped_column(String(20), default="NSE", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )


class PaperPortfolioHolding(Base):
    """Virtual holding in user's risk-free paper trading account."""

    __tablename__ = "paper_portfolio_holdings"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    ticker: Mapped[str] = mapped_column(String(30), nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    asset_class: Mapped[str] = mapped_column(String(30), default="etf", nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    average_buy_price: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class PaperTransaction(Base):
    """Audit log of virtual buy and sell executions."""

    __tablename__ = "paper_transactions"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    ticker: Mapped[str] = mapped_column(String(30), nullable=False)
    transaction_type: Mapped[str] = mapped_column(String(10), nullable=False)  # BUY, SELL
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    executed_price: Mapped[float] = mapped_column(Float, nullable=False)
    total_amount: Mapped[float] = mapped_column(Float, nullable=False)
    executed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
