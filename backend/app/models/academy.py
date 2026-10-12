"""Stock Market Academy database models."""

from datetime import datetime, timezone
import uuid
from typing import List, Optional
from sqlalchemy import String, Integer, Text, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base


class Course(Base):
    """Educational course track (e.g. Beginner, Intermediate, Advanced)."""

    __tablename__ = "academy_courses"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    slug: Mapped[str] = mapped_column(String(160), unique=True, index=True, nullable=False)
    level: Mapped[str] = mapped_column(
        String(30), default="beginner", nullable=False
    )  # beginner, intermediate, advanced
    description: Mapped[str] = mapped_column(Text, nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    lessons: Mapped[List["Lesson"]] = relationship(
        "Lesson", back_populates="course", cascade="all, delete-orphan", lazy="selectin"
    )


class Lesson(Base):
    """Individual educational lesson with content and quiz."""

    __tablename__ = "academy_lessons"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    course_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("academy_courses.id", ondelete="CASCADE"), index=True, nullable=False
    )
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    slug: Mapped[str] = mapped_column(String(160), index=True, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    quiz_question: Mapped[str] = mapped_column(Text, nullable=False)
    quiz_options: Mapped[str] = mapped_column(
        Text, nullable=False
    )  # JSON or comma-separated options: "A,B,C,D"
    correct_option_index: Mapped[int] = mapped_column(Integer, nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    # Relationships
    course: Mapped["Course"] = relationship("Course", back_populates="lessons")


class UserCourseProgress(Base):
    """User learning and quiz completion tracker."""

    __tablename__ = "user_course_progress"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    lesson_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("academy_lessons.id", ondelete="CASCADE"), index=True, nullable=False
    )
    completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    quiz_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
