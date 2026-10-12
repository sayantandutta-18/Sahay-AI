"""Business profile and onboarding tests."""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_profile_lifecycle_and_completion_percentage():
    """Test getting, updating profile and verifying deterministic completion score."""
    # Register test user
    client.post("/api/v1/auth/register", json={"phone": "9811111111", "name": "Profile Owner", "password": "dev_pass"})
    login_res = client.post(
        "/api/v1/auth/login",
        json={"phone": "9811111111", "password": "dev_pass"},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch initial business profile
    get_res = client.get("/api/v1/business-profile", headers=headers)
    assert get_res.status_code == 200
    initial_profile = get_res.json()
    assert initial_profile["completion_percentage"] >= 0

    # Update with comprehensive enterprise data
    update_res = client.put(
        "/api/v1/business-profile",
        json={
            "business_name": "Kolkata Jute Handloom Works",
            "business_type": "manufacturing",
            "category": "micro",
            "annual_turnover": 1200000.0,
            "monthly_revenue": 100000.0,
            "monthly_expense": 65000.0,
            "gender": "female",
            "has_pan": True,
            "has_bank_account": True,
            "has_udyam": True,
        },
        headers=headers,
    )
    assert update_res.status_code == 200
    updated_profile = update_res.json()
    assert updated_profile["business_name"] == "Kolkata Jute Handloom Works"
    assert updated_profile["has_udyam"] is True
    assert updated_profile["completion_percentage"] == 100  # All 10 fields filled!


def test_user_data_isolation():
    """Verify that User A cannot read or overwrite User B's data."""
    # User A
    client.post("/api/v1/auth/register", json={"phone": "9822222222", "name": "User Alpha", "password": "dev_pass"})
    token_a = client.post(
        "/api/v1/auth/login", json={"phone": "9822222222", "password": "dev_pass"}
    ).json()["access_token"]

    # User B
    client.post("/api/v1/auth/register", json={"phone": "9833333333", "name": "User Beta", "password": "dev_pass"})
    token_b = client.post(
        "/api/v1/auth/login", json={"phone": "9833333333", "password": "dev_pass"}
    ).json()["access_token"]

    # User A sets their business name
    client.put(
        "/api/v1/business-profile",
        json={"business_name": "Alpha Enterprise"},
        headers={"Authorization": f"Bearer {token_a}"},
    )

    # User B checks their profile
    res_b = client.get(
        "/api/v1/business-profile",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    profile_b = res_b.json()
    assert profile_b["business_name"] != "Alpha Enterprise"
