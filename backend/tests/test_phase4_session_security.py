"""Phase 4 Session Security & Token Expiry Tests."""

from datetime import datetime, timedelta, timezone
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token, decode_access_token
from app.models.user import User
from app.core.security import get_password_hash


client = TestClient(app)


def test_token_expiry_differentials():
    """Verify admin tokens expire in 60 minutes, while standard user tokens expire in 120 minutes."""
    now = datetime.now(timezone.utc)

    # Standard user token
    user_token = create_access_token("regular_user_1", claims={"role": "user"})
    payload_user = decode_access_token(user_token)
    assert payload_user is not None
    user_duration_secs = payload_user["exp"] - payload_user["iat"]
    # 120 minutes = 7200 seconds
    assert user_duration_secs == 120 * 60

    # Admin token
    admin_token = create_access_token("admin_user_1", claims={"role": "admin"})
    payload_admin = decode_access_token(admin_token)
    assert payload_admin is not None
    admin_duration_secs = payload_admin["exp"] - payload_admin["iat"]
    # 60 minutes = 3600 seconds
    assert admin_duration_secs == 60 * 60

    # Super admin token
    super_admin_token = create_access_token("super_admin_1", claims={"role": "super_admin"})
    payload_sa = decode_access_token(super_admin_token)
    assert payload_sa is not None
    sa_duration_secs = payload_sa["exp"] - payload_sa["iat"]
    # 60 minutes = 3600 seconds
    assert sa_duration_secs == 60 * 60


def test_auth_logout_endpoints():
    """Verify both GET and POST /api/v1/auth/logout return 200 with expected response."""
    get_res = client.get("/api/v1/auth/logout")
    assert get_res.status_code == 200
    get_data = get_res.json()
    assert get_data.get("status") == "success"
    assert "logged out" in get_data.get("message", "").lower()

    post_res = client.post("/api/v1/auth/logout")
    assert post_res.status_code == 200
    post_data = post_res.json()
    assert post_data.get("status") == "success"
    assert "logged out" in post_data.get("message", "").lower()


def test_expired_token_rejected_with_401():
    """Verify that an expired token is rejected with 401 on protected endpoint."""
    expired_delta = timedelta(minutes=-10)
    expired_token = create_access_token(
        subject="test_expired_user",
        claims={"role": "user"},
        expires_delta=expired_delta,
    )

    res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {expired_token}"},
    )
    assert res.status_code == 401
    assert "Invalid or expired authentication token" in res.json().get("detail", "")
