"""Stock Market Academy educational courses and quiz tests."""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_list_academy_courses_and_lessons():
    """Verify courses and lessons are seeded and queryable."""
    res = client.get("/api/v1/academy/courses")
    assert res.status_code == 200
    courses = res.json()
    assert len(courses) >= 2
    assert courses[0]["level"] == "beginner"

    course_id = courses[0]["id"]
    lessons_res = client.get(f"/api/v1/academy/courses/{course_id}/lessons")
    assert lessons_res.status_code == 200
    lessons = lessons_res.json()
    assert len(lessons) >= 2
    assert len(lessons[0]["quiz_options"]) >= 2


def test_quiz_grading_and_progress_tracking():
    """Verify deterministic quiz scoring and user progress persistence."""
    # Register test user
    client.post("/api/v1/auth/register", json={"phone": "9812345678", "name": "Student", "password": "dev_pass"})
    login_res = client.post("/api/v1/auth/login", json={"phone": "9812345678", "password": "dev_pass"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    courses = client.get("/api/v1/academy/courses").json()
    lessons = client.get(f"/api/v1/academy/courses/{courses[0]['id']}/lessons").json()
    lesson = lessons[0]

    # Submit correct answer (Option 1)
    quiz_res_correct = client.post(
        "/api/v1/academy/quiz",
        json={"lesson_id": lesson["id"], "selected_option_index": 1},
        headers=headers,
    )
    assert quiz_res_correct.status_code == 200
    data_correct = quiz_res_correct.json()
    assert data_correct["is_correct"] is True
    assert data_correct["score_awarded"] == 100

    # Submit incorrect answer (Option 0)
    quiz_res_wrong = client.post(
        "/api/v1/academy/quiz",
        json={"lesson_id": lesson["id"], "selected_option_index": 0},
        headers=headers,
    )
    assert quiz_res_wrong.status_code == 200
    data_wrong = quiz_res_wrong.json()
    assert data_wrong["is_correct"] is False
    assert data_wrong["score_awarded"] == 0
