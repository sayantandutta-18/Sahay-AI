"""Admin console, RBAC authorization, and audit log tests."""

from fastapi.testclient import TestClient
from app.main import app
from app.database.session import SessionLocal
from app.services.user_service import get_user_by_phone, promote_user_to_admin

client = TestClient(app)


def test_admin_rbac_authorization():
    """Verify that non-admin users are strictly denied admin endpoints with 403."""
    # 1. Register normal entrepreneur
    phone = "9888888888"
    client.post(
        "/api/v1/auth/register",
        json={"phone": phone, "name": "Normal User", "password": "dev_pass"},
    )
    normal_token = client.post(
        "/api/v1/auth/login", json={"phone": phone, "password": "dev_pass", "otp": "123456"}
    ).json()["access_token"]

    res_normal = client.get(
        "/api/v1/admin/stats",
        headers={"Authorization": f"Bearer {normal_token}"},
    )
    assert res_normal.status_code == 403
    assert "Administrative privileges required" in res_normal.json()["detail"]


def test_admin_create_scheme_and_audit_trail():
    """Verify that an admin can create schemes and an immutable audit entry is written."""
    # Register user then promote server-side (as client cannot self-assign admin)
    phone = "9899999999"
    client.post(
        "/api/v1/auth/register",
        json={
            "phone": phone,
            "name": "Super Admin",
            "password": "admin_secure_pass",
            "language": "en",
        },
    )
    db = SessionLocal()
    try:
        user = get_user_by_phone(db, phone)
        if user:
            promote_user_to_admin(db, user.id)
    finally:
        db.close()

    admin_login = client.post(
        "/api/v1/auth/login",
        json={"phone": phone, "password": "admin_secure_pass", "otp": "123456"},
    )
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Admin fetches stats
    stats_res = client.get("/api/v1/admin/stats", headers=admin_headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total_schemes"] >= 3

    # Admin creates a new verified scheme
    new_scheme_payload = {
        "name": "National Micro Equipment Modernization Grant",
        "slug": "micro-equipment-grant",
        "provider": "Ministry of MSME",
        "scheme_type": "grant",
        "short_description": "Capital grant for high-efficiency tooling.",
        "detailed_benefits": "Up to 50% grant on CNC machinery.",
        "max_amount": 2500000.0,
        "interest_subsidy_pct": 0.0,
        "states_served": "ALL",
        "target_sectors": "manufacturing",
        "official_url": "https://msme.gov.in/tools",
        "last_verified_at": "2026-03-12",
        "is_active": True,
    }
    create_res = client.post(
        "/api/v1/admin/schemes",
        json=new_scheme_payload,
        headers=admin_headers,
    )
    assert create_res.status_code == 201

    # Check that audit log has been recorded
    audit_res = client.get("/api/v1/admin/audit-logs", headers=admin_headers)
    assert audit_res.status_code == 200
    logs = audit_res.json()
    assert len(logs) > 0
    assert any(l["action"] == "SCHEME_CREATED" for l in logs)
