"""Stock Market Academy endpoints."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.routes.auth import security_scheme, get_current_user
from app.models.user import User
from app.schemas.academy import (
    CourseResponse,
    LessonResponse,
    QuizSubmissionRequest,
    QuizSubmissionResponse,
)
from app.services.academy_service import (
    get_all_courses,
    get_course_lessons,
    submit_quiz_answer,
)
from app.core.security import decode_access_token
from app.services.user_service import get_user_by_id

router = APIRouter(prefix="/academy", tags=["Stock Market Academy"])


@router.get("/courses", response_model=List[CourseResponse])
def list_courses(credentials=Depends(security_scheme), db: Session = Depends(get_db)):
    """Retrieve all structured academy courses."""
    user_id = None
    if credentials:
        payload = decode_access_token(credentials.credentials)
        if payload and "sub" in payload:
            user_id = payload["sub"]
    return get_all_courses(db, user_id=user_id)


@router.get("/courses/{course_id}/lessons", response_model=List[LessonResponse])
def list_lessons(
    course_id: str,
    credentials=Depends(security_scheme),
    db: Session = Depends(get_db),
):
    """Retrieve all educational lessons and quiz questions in a course."""
    user_id = None
    if credentials:
        payload = decode_access_token(credentials.credentials)
        if payload and "sub" in payload:
            user_id = payload["sub"]
    return get_course_lessons(db, course_id, user_id=user_id)


@router.post("/quiz", response_model=QuizSubmissionResponse)
def submit_quiz(
    submission: QuizSubmissionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Deterministically grade quiz answer and record user learning progression."""
    try:
        return submit_quiz_answer(
            db, current_user.id, submission.lesson_id, submission.selected_option_index
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
