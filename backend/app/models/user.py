"""User database model."""

from datetime import datetime, timezone
import uuid
from sqlalchemy import String, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base


class User(Base):
    """User account entity for entrepreneurs, admins, and empanelled partners."""

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    phone: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=True)
    role: Mapped[str] = mapped_column(String(20), default="entrepreneur", nullable=False)
    language: Mapped[str] = mapped_column(String(10), default="en", nullable=False)
    state: Mapped[str] = mapped_column(String(60), default="", nullable=False)
    district: Mapped[str] = mapped_column(String(60), default="", nullable=False)
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
    business_profile: Mapped["BusinessProfile"] = relationship(
        "BusinessProfile", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
