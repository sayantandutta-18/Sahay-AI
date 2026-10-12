"""Authentication and user management tests."""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_register_new_user():
    """Test user registration generates token and business profile."""
    phone = "9800000001"
    response = client.post(
        "/api/v1/auth/register",
        json={
            "phone": phone,
            "name": "Sunita Devi",
            "role": "entrepreneur",
            "language": "hi",
            "state": "Bihar",
            "district": "Patna",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["phone"] == phone
    assert data["user"]["name"] == "Sunita Devi"


def test_register_duplicate_phone():
    """Test that duplicate phone registration is rejected."""
    phone = "9800000002"
    client.post(
        "/api/v1/auth/register",
        json={"phone": phone, "name": "First User", "role": "entrepreneur"},
    )
    duplicate_res = client.post(
        "/api/v1/auth/register",
        json={"phone": phone, "name": "Second User", "role": "entrepreneur"},
    )
    assert duplicate_res.status_code == 400
    assert "already registered" in duplicate_res.json()["detail"]


def test_login_and_access_protected_me():
    """Test login flow and protected /auth/me verification."""
    phone = "9800000003"
    login_res = client.post(
        "/api/v1/auth/login",
        json={"phone": phone, "otp": "123456"},
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    # Access /api/v1/auth/me with valid Bearer token
    me_res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_res.status_code == 200
    assert me_res.json()["phone"] == phone


def test_protected_endpoint_rejects_unauthenticated():
    """Test that missing or invalid auth token returns 401."""
    # Missing token
    res1 = client.get("/api/v1/auth/me")
    assert res1.status_code == 401

    # Invalid token
    res2 = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer invalid.token.value"})
    assert res2.status_code == 401
