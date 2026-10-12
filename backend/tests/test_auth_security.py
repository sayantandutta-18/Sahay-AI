"""Comprehensive Security Regression Tests.

Validates the fixes for all findings in the Sahay-AI Code Review:
1. Critical: Rejection of silent auto-registration on login for unknown phone numbers.
2. Critical: Rejection of invalid credentials / wrong password on login.
3. Critical: Prevention of client role escalation ("role": "admin") on registration.
4. Critical: Prevention of insecure default JWT secret in production.
5. High: File upload validation requires real magic bytes; spoofed MIME rejected.
6. High: Object storage path traversal attacks blocked via Path.is_relative_to.
7. High: Document ownership enforced when attaching documents to checklist items.
8. High: Application ownership enforced during document uploads.
9. High: Revoking all data sharing consents sets application.lender_consent_granted to False.
10. Medium: Admin audit log limit bounded to a maximum of 200.
11. Medium: Rate limiting active on sensitive endpoints.
"""

import io
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.session import SessionLocal
from app.services.user_service import get_user_by_phone, promote_user_to_admin
from app.services.storage_service import storage_service
from app.core.config import Settings

client = TestClient(app)


def test_no_silent_auto_registration_on_login():
    """Unregistered phone numbers must return 401 instead of being auto-created."""
    unknown_phone = "9199999991"
    res = client.post(
        "/api/v1/auth/login",
        json={"phone": unknown_phone, "password": "any_password"},
    )
    assert res.status_code == 401
    assert "Invalid authentication credentials" in res.json()["detail"]


def test_invalid_password_rejected():
    """Valid user with incorrect password must be rejected."""
    phone = "9199999992"
    reg_res = client.post(
        "/api/v1/auth/register",
        json={"phone": phone, "name": "Auth Test User", "password": "correct_password_1"},
    )
    assert reg_res.status_code == 201

    wrong_login = client.post(
        "/api/v1/auth/login",
        json={"phone": phone, "password": "wrong_password_999"},
    )
    assert wrong_login.status_code == 401
    assert "Invalid authentication credentials" in wrong_login.json()["detail"]


def test_client_cannot_self_assign_admin_role():
    """Client sending 'role': 'admin' on registration must be forced to 'entrepreneur'."""
    phone = "9199999993"
    reg_res = client.post(
        "/api/v1/auth/register",
        json={
            "phone": phone,
            "name": "Attacker Trying Admin",
            "password": "dev_pass",
            "role": "admin",
        },
    )
    assert reg_res.status_code == 201
    user_data = reg_res.json()["user"]
    assert user_data["role"] == "entrepreneur"

    # Verify directly in DB
    db = SessionLocal()
    try:
        user = get_user_by_phone(db, phone)
        assert user is not None
        assert user.role == "entrepreneur"
    finally:
        db.close()


def test_jwt_secret_validation_in_production():
    """Production settings must reject the default development secret."""
    with pytest.raises(ValueError, match="JWT_SECRET_KEY must be securely set"):
        Settings(
            ENVIRONMENT="production",
            DEBUG=False,
            JWT_SECRET_KEY="sahay_development_secret_key_at_least_32_characters_long",
        )


def test_magic_bytes_enforcement_rejects_spoofed_mime():
    """Files with mismatched or absent magic bytes must be rejected even with spoofed content_type."""
    fake_pdf = b"Plain text file claiming to be a PDF document."
    with pytest.raises(ValueError, match="Invalid file format"):
        storage_service.validate_file(fake_pdf, "application/pdf")


def test_path_traversal_blocked_by_storage_path():
    """Relative traversal path attacks must resolve to None and be blocked."""
    assert storage_service.get_file_path("../../../etc/passwd") is None
    assert storage_service.get_file_path("..\\..\\windows\\system32\\cmd.exe") is None


def test_cross_user_document_checklist_attachment_denied():
    """User cannot attach another user's vault document to their application checklist item."""
    # 1. Register User A and User B
    phone_a = "9199999994"
    phone_b = "9199999995"
    client.post("/api/v1/auth/register", json={"phone": phone_a, "name": "User A", "password": "dev_pass"})
    client.post("/api/v1/auth/register", json={"phone": phone_b, "name": "User B", "password": "dev_pass"})

    token_a = client.post("/api/v1/auth/login", json={"phone": phone_a, "password": "dev_pass"}).json()["access_token"]
    token_b = client.post("/api/v1/auth/login", json={"phone": phone_b, "password": "dev_pass"}).json()["access_token"]

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 2. User A uploads a real PDF document to vault
    pdf_bytes = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"
    upload_res = client.post(
        "/api/v1/documents/upload",
        files={"file": ("kyc.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
        data={"document_type": "pan_card"},
        headers=headers_a,
    )
    assert upload_res.status_code in [200, 201]
    doc_id_a = upload_res.json()["id"]

    # 3. User B creates an application
    schemes = client.get("/api/v1/schemes").json()
    scheme_id = schemes[0]["id"]
    app_b = client.post(
        "/api/v1/applications",
        json={"scheme_id": scheme_id, "notes": "User B App"},
        headers=headers_b,
    ).json()
    app_b_id = app_b["id"]

    checklist = client.get(f"/api/v1/applications/{app_b_id}/checklist", headers=headers_b).json()
    item_id = checklist[0]["id"]

    # 4. User B attempts to attach User A's document to User B's checklist item
    steal_res = client.patch(
        f"/api/v1/applications/{app_b_id}/checklist/{item_id}",
        json={"vault_document_id": doc_id_a, "is_completed": True},
        headers=headers_b,
    )
    assert steal_res.status_code == 400
    assert "Attached document not found or unauthorized" in steal_res.json()["detail"]


def test_cross_user_application_upload_denied():
    """User cannot upload a document linked to another user's application_id."""
    phone_c = "9199999996"
    phone_d = "9199999997"
    client.post("/api/v1/auth/register", json={"phone": phone_c, "name": "User C", "password": "dev_pass"})
    client.post("/api/v1/auth/register", json={"phone": phone_d, "name": "User D", "password": "dev_pass"})

    token_c = client.post("/api/v1/auth/login", json={"phone": phone_c, "password": "dev_pass"}).json()["access_token"]
    token_d = client.post("/api/v1/auth/login", json={"phone": phone_d, "password": "dev_pass"}).json()["access_token"]

    headers_c = {"Authorization": f"Bearer {token_c}"}
    headers_d = {"Authorization": f"Bearer {token_d}"}

    # User C creates application
    schemes = client.get("/api/v1/schemes").json()
    app_c = client.post(
        "/api/v1/applications",
        json={"scheme_id": schemes[0]["id"]},
        headers=headers_c,
    ).json()

    # User D tries to upload document tied to User C's application
    pdf_bytes = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"
    upload_res = client.post(
        "/api/v1/documents/upload",
        files={"file": ("tamper.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
        data={"document_type": "udyam_certificate", "application_id": app_c["id"]},
        headers=headers_d,
    )
    assert upload_res.status_code == 400
    assert "Application" in upload_res.json()["detail"]


def test_revoke_consent_resets_application_flag():
    """Revoking all data sharing consents on an application resets lender_consent_granted to False."""
    phone = "9199999998"
    client.post("/api/v1/auth/register", json={"phone": phone, "name": "Consent User", "password": "dev_pass"})
    token = client.post("/api/v1/auth/login", json={"phone": phone, "password": "dev_pass"}).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    schemes = client.get("/api/v1/schemes").json()
    app_data = client.post(
        "/api/v1/applications",
        json={"scheme_id": schemes[0]["id"]},
        headers=headers,
    ).json()
    app_id = app_data["id"]

    # Grant consent
    consent_res = client.post(
        "/api/v1/applications/consent",
        json={
            "application_id": app_id,
            "partner_name": "State Bank of India",
            "shared_fields": "name,pan,turnover",
        },
        headers=headers,
    )
    assert consent_res.status_code in [200, 201]
    consent_id = consent_res.json()["id"]

    # Verify application has consent granted
    apps_after_grant = client.get("/api/v1/applications", headers=headers).json()
    target_app = next(a for a in apps_after_grant if a["id"] == app_id)
    assert target_app["lender_consent_granted"] is True

    # Revoke consent
    revoke_res = client.post(
        f"/api/v1/applications/consent/{consent_id}/revoke",
        headers=headers,
    )
    assert revoke_res.status_code == 200

    # Verify application flag is reset
    apps_after_revoke = client.get("/api/v1/applications", headers=headers).json()
    target_app_revoked = next(a for a in apps_after_revoke if a["id"] == app_id)
    assert target_app_revoked["lender_consent_granted"] is False


def test_admin_audit_logs_limit_bounded_to_200():
    """Audit logs query limit must be bounded to 200 to protect against DoS."""
    phone = "9199999999"
    client.post("/api/v1/auth/register", json={"phone": phone, "name": "Admin Tester", "password": "dev_pass"})
    db = SessionLocal()
    try:
        user = get_user_by_phone(db, phone)
        if user:
            promote_user_to_admin(db, user.id)
    finally:
        db.close()

    token = client.post("/api/v1/auth/login", json={"phone": phone, "password": "dev_pass"}).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Request limit=1000
    res = client.get("/api/v1/admin/audit-logs?limit=1000", headers=headers)
    assert res.status_code == 200
    assert len(res.json()) <= 200


def test_rate_limiter_blocks_burst_traffic():
    """Rate limiter raises 429 when request threshold is exceeded."""
    import asyncio
    from unittest.mock import MagicMock
    from fastapi import HTTPException
    from app.core.rate_limit import InMemoryRateLimiter

    limiter = InMemoryRateLimiter(times=2, seconds=60)
    mock_req = MagicMock()
    mock_req.headers = {}
    mock_req.client.host = "203.0.113.195"

    async def run():
        await limiter(mock_req)
        await limiter(mock_req)
        with pytest.raises(HTTPException) as exc_info:
            await limiter(mock_req)
        assert exc_info.value.status_code == 429

    asyncio.run(run())
