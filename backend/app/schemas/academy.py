"""Pydantic schemas for Stock Market Academy."""

from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class LessonResponse(BaseModel):
    id: str
    course_id: str
    title: str
    slug: str
    content: str
    quiz_question: str
    quiz_options: List[str]
    order_index: int
    is_completed: bool = False
    score: int = 0

    model_config = ConfigDict(from_attributes=True)


class CourseResponse(BaseModel):
    id: str
    title: str
    slug: str
    level: str
    description: str
    order_index: int
    lessons_count: int = 0
    completed_lessons_count: int = 0
    is_locked: bool = False

    model_config = ConfigDict(from_attributes=True)


class QuizSubmissionRequest(BaseModel):
    lesson_id: str
    selected_option_index: int = Field(..., ge=0, le=5)


class QuizSubmissionResponse(BaseModel):
    lesson_id: str
    is_correct: bool
    correct_option_index: int
    explanation: str
    score_awarded: int
