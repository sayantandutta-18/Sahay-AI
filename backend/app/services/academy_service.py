"""Stock Market Academy educational content and progress service."""

from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.academy import Course, Lesson, UserCourseProgress
from app.schemas.academy import CourseResponse, LessonResponse, QuizSubmissionResponse


def seed_academy_content_if_empty(db: Session) -> None:
    """Seed structured educational tracks covering beginner to advanced concepts."""
    if db.query(Course).count() > 0:
        return

    # Track 1: Beginner
    c1 = Course(
        title="Foundations of Financial Markets & Inflation",
        slug="foundations-financial-markets",
        level="beginner",
        description="Understand inflation impact on business savings, difference between debt vs equity, and the compounding advantage.",
        order_index=1,
    )
    db.add(c1)
    db.flush()

    db.add_all([
        Lesson(
            course_id=c1.id,
            title="Why Savings in Cash Lose Value: Inflation Explained",
            slug="inflation-and-purchasing-power",
            content="Inflation is the general rise in prices over time, reducing the real purchasing power of cash. To protect personal and enterprise capital, investments must generate returns higher than inflation.",
            quiz_question="If annual inflation is 6% and a fixed savings deposit yields 5%, what is the real return?",
            quiz_options="Positive 1%,Negative 1% (Loss in purchasing power),Zero return,Positive 11%",
            correct_option_index=1,
            order_index=1,
        ),
        Lesson(
            course_id=c1.id,
            title="Equity Shares vs Debt: Ownership vs Loan",
            slug="shares-vs-debt",
            content="When you buy equity shares, you own a fractional piece of a company. When you lend or invest in debt, you are a creditor earning fixed interest without ownership upside.",
            quiz_question="What distinguishes an equity shareholder from a bondholder?",
            quiz_options="Shareholders are guaranteed fixed interest,Shareholders have partial ownership in company profits and assets,Bondholders vote at company annual meetings,Shareholders never take risk",
            correct_option_index=1,
            order_index=2,
        ),
    ])

    # Track 2: Intermediate
    c2 = Course(
        title="Index Investing & Company Financial Statements",
        slug="index-investing-and-financials",
        level="intermediate",
        description="Learn low-cost ETF investing (Nifty 50), understanding P/E ratio, EPS, and reading a company's balance sheet.",
        order_index=2,
    )
    db.add(c2)
    db.flush()

    db.add(
        Lesson(
            course_id=c2.id,
            title="The P/E Ratio (Price to Earnings) & Valuation",
            slug="price-to-earnings-pe-ratio",
            content="The P/E ratio divides the market price per share by earnings per share (EPS). It indicates how many rupees investors are willing to pay for one rupee of current earnings.",
            quiz_question="A company stock trades at ₹200 and has EPS of ₹10. What is its P/E ratio?",
            quiz_options="20x,2x,0.05x,2000x",
            correct_option_index=0,
            order_index=1,
        )
    )

    db.commit()


def get_all_courses(db: Session, user_id: Optional[str] = None) -> List[CourseResponse]:
    """Retrieve all courses with lesson count and user progress."""
    seed_academy_content_if_empty(db)
    courses = db.query(Course).filter(Course.is_active.is_(True)).order_by(Course.order_index).all()
    results = []

    for c in courses:
        total_lessons = len(c.lessons)
        completed_lessons = 0
        if user_id:
            lesson_ids = [l.id for l in c.lessons]
            completed_lessons = (
                db.query(UserCourseProgress)
                .filter(
                    UserCourseProgress.user_id == user_id,
                    UserCourseProgress.lesson_id.in_(lesson_ids),
                    UserCourseProgress.completed.is_(True),
                )
                .count()
            )

        results.append(
            CourseResponse(
                id=c.id,
                title=c.title,
                slug=c.slug,
                level=c.level,
                description=c.description,
                order_index=c.order_index,
                lessons_count=total_lessons,
                completed_lessons_count=completed_lessons,
                is_locked=False,
            )
        )
    return results


def get_course_lessons(db: Session, course_id: str, user_id: Optional[str] = None) -> List[LessonResponse]:
    """Retrieve all lessons and quiz options for a course."""
    seed_academy_content_if_empty(db)
    lessons = db.query(Lesson).filter(Lesson.course_id == course_id).order_by(Lesson.order_index).all()
    results = []

    for l in lessons:
        is_completed = False
        score = 0
        if user_id:
            prog = (
                db.query(UserCourseProgress)
                .filter(UserCourseProgress.user_id == user_id, UserCourseProgress.lesson_id == l.id)
                .first()
            )
            if prog:
                is_completed = prog.completed
                score = prog.quiz_score

        options_list = [opt.strip() for opt in l.quiz_options.split(",") if opt.strip()]
        results.append(
            LessonResponse(
                id=l.id,
                course_id=l.course_id,
                title=l.title,
                slug=l.slug,
                content=l.content,
                quiz_question=l.quiz_question,
                quiz_options=options_list,
                order_index=l.order_index,
                is_completed=is_completed,
                score=score,
            )
        )
    return results


def submit_quiz_answer(
    db: Session, user_id: str, lesson_id: str, selected_option_index: int
) -> QuizSubmissionResponse:
    """Grade quiz deterministically and record user learning progression."""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise ValueError(f"Lesson with ID '{lesson_id}' not found")

    is_correct = selected_option_index == lesson.correct_option_index
    score_awarded = 100 if is_correct else 0
    options = [opt.strip() for opt in lesson.quiz_options.split(",")]
    correct_text = options[lesson.correct_option_index] if lesson.correct_option_index < len(options) else ""

    explanation = (
        f"Correct! '{correct_text}' is the right answer."
        if is_correct
        else f"Incorrect. The correct answer was: '{correct_text}'."
    )

    # Persist progress
    progress = (
        db.query(UserCourseProgress)
        .filter(UserCourseProgress.user_id == user_id, UserCourseProgress.lesson_id == lesson_id)
        .first()
    )
    if not progress:
        progress = UserCourseProgress(
            user_id=user_id,
            lesson_id=lesson_id,
            completed=is_correct,
            quiz_score=score_awarded,
            completed_at=datetime.now(timezone.utc) if is_correct else None,
        )
        db.add(progress)
    else:
        if is_correct:
            progress.completed = True
            progress.quiz_score = max(progress.quiz_score, score_awarded)
            progress.completed_at = datetime.now(timezone.utc)
        db.add(progress)

    db.commit()

    return QuizSubmissionResponse(
        lesson_id=lesson_id,
        is_correct=is_correct,
        correct_option_index=lesson.correct_option_index,
        explanation=explanation,
        score_awarded=score_awarded,
    )
