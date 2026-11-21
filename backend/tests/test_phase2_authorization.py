"""Phase 2 Authorization & Resource Ownership Isolation Tests.

Verifies:
1. Unauthenticated requests on protected routes return 401.
2. Entrepreneur tokens on /api/v1/admin/* return 403.
3. Admin tokens on /api/v1/admin/* return 200.
4. Token claim spoofing is rejected because require_admin() verifies the DB record.
5. User A cannot read, update, or delete User B's applications (returns 404).
6. User A cannot read, download, update, or delete User B's documents (returns 404).
"""

import io
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.session import SessionLocal
from app.services.user_service import get_user_by_phone, promote_user_to_admin
from app.core.security import create_access_token
from app.models.scheme import Scheme

client = TestClient(app)


def test_no_token_returns_401_on_protected_routes():
    """Verify missing authentication token triggers 401 across protected routes."""
    protected_routes = [
        ("GET", "/api/v1/auth/me"),
        ("GET", "/api/v1/profile"),
        ("GET", "/api/v1/business-profile"),
        ("GET", "/api/v1/applications"),
        ("POST", "/api/v1/applications"),
        ("GET", "/api/v1/documents"),
        ("POST", "/api/v1/documents/upload"),
        ("GET", "/api/v1/portfolio"),
        ("GET", "/api/v1/portfolio/watchlist"),
        ("GET", "/api/v1/financial/transactions"),
        ("GET", "/api/v1/admin/stats"),
        ("GET", "/api/v1/admin/audit-logs"),
    ]
    for method, path in protected_routes:
        if method == "GET":
            res = client.get(path)
        elif method == "POST":
            res = client.post(path, json={})
        assert res.status_code == 401, f"Expected 401 on {method} {path}, got {res.status_code}"
        assert "authentication token" in res.json().get("detail", "").lower()


def test_invalid_token_returns_401():
    """Verify malformed or invalid signatures trigger 401."""
    bad_headers = {"Authorization": "Bearer not-a-valid-jwt-token"}
    res = client.get("/api/v1/auth/me", headers=bad_headers)
    assert res.status_code == 401


def test_entrepreneur_token_returns_403_on_admin_stats():
    """Verify entrepreneur token on /api/v1/admin/* returns 403 Forbidden."""
    phone = "9111111111"
    client.post(
        "/api/v1/auth/register",
        json={"phone": phone, "name": "Entrepreneur Test", "password": "dev_pass"},
    )
    login_res = client.post(
        "/api/v1/auth/login",
        json={"phone": phone, "password": "dev_pass", "otp": "123456"},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # /api/v1/admin/stats -> 403
    res_stats = client.get("/api/v1/admin/stats", headers=headers)
    assert res_stats.status_code == 403
    assert "Administrative privileges required" in res_stats.json()["detail"]

    # /api/v1/admin/audit-logs -> 403
    res_audit = client.get("/api/v1/admin/audit-logs", headers=headers)
    assert res_audit.status_code == 403


def test_admin_token_returns_200_on_admin_stats():
    """Verify genuine admin token on /api/v1/admin/stats returns 200 OK."""
    phone = "9222222222"
    client.post(
        "/api/v1/auth/register",
        json={"phone": phone, "name": "Admin Phase 2 Test", "password": "admin_secure_pass"},
    )
    with SessionLocal() as db:
        user = get_user_by_phone(db, phone)
        assert user is not None
        promote_user_to_admin(db, user.id)

    login_res = client.post(
        "/api/v1/auth/login",
        json={"phone": phone, "password": "admin_secure_pass", "otp": "123456"},
    )
    admin_token = login_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    res_stats = client.get("/api/v1/admin/stats", headers=admin_headers)
    assert res_stats.status_code == 200
    assert "total_applications" in res_stats.json()
    assert "total_schemes" in res_stats.json()


def test_spoofed_admin_token_claim_rejected_by_db_check():
    """Verify that a forged JWT claiming role='admin' for a non-admin user is rejected with 403.
    
    This verifies requirement 1: 'It must read the role from the database user record,
    not trust the token claim alone.'
    """
    phone = "9333333333"
    client.post(
        "/api/v1/auth/register",
        json={"phone": phone, "name": "Honest Entrepreneur", "password": "dev_pass"},
    )
    with SessionLocal() as db:
        user = get_user_by_phone(db, phone)
        assert user.role == "entrepreneur"
        user_id = user.id

    # Forge a token with claims={'role': 'admin'} pointing to the entrepreneur's user_id
    spoofed_token = create_access_token(user_id, claims={"role": "admin"})
    spoofed_headers = {"Authorization": f"Bearer {spoofed_token}"}

    # require_admin() checks the DB record where role=='entrepreneur', rejecting the request
    res = client.get("/api/v1/admin/stats", headers=spoofed_headers)
    assert res.status_code == 403
    assert "Administrative privileges required" in res.json()["detail"]


def test_user_a_cannot_read_or_mutate_user_b_application():
    """Verify User A cannot read, update, or delete User B's application (returns 404)."""
    # 1. Register User A
    phone_a = "9444444441"
    client.post("/api/v1/auth/register", json={"phone": phone_a, "name": "User A", "password": "dev_pass"})
    token_a = client.post("/api/v1/auth/login", json={"phone": phone_a, "password": "dev_pass", "otp": "123456"}).json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # 2. Register User B
    phone_b = "9444444442"
    client.post("/api/v1/auth/register", json={"phone": phone_b, "name": "User B", "password": "dev_pass"})
    token_b = client.post("/api/v1/auth/login", json={"phone": phone_b, "password": "dev_pass", "otp": "123456"}).json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # Find a verified scheme id
    with SessionLocal() as db:
        scheme = db.query(Scheme).first()
        assert scheme is not None
        scheme_id = scheme.id

    # User B creates an application
    app_b = client.post(
        "/api/v1/applications",
        json={"scheme_id": scheme_id, "notes": "Private application of User B"},
        headers=headers_b,
    ).json()
    app_b_id = app_b["id"]

    # User B can view their application
    res_b = client.get(f"/api/v1/applications/{app_b_id}", headers=headers_b)
    assert res_b.status_code == 200

    # User A tries to read User B's application -> 404
    res_read = client.get(f"/api/v1/applications/{app_b_id}", headers=headers_a)
    assert res_read.status_code == 404, f"Expected 404, got {res_read.status_code}"

    # User A tries to update status of User B's application -> 404
    res_status = client.patch(
        f"/api/v1/applications/{app_b_id}/status",
        json={"status": "submitted", "notes": "Hacked status"},
        headers=headers_a,
    )
    assert res_status.status_code == 404

    # User A tries to view checklist of User B's application -> 404
    res_chk = client.get(f"/api/v1/applications/{app_b_id}/checklist", headers=headers_a)
    assert res_chk.status_code == 404

    # User A tries to delete User B's application -> 404
    res_del = client.delete(f"/api/v1/applications/{app_b_id}", headers=headers_a)
    assert res_del.status_code == 404


def test_user_a_cannot_read_or_download_user_b_document():
    """Verify User A cannot read metadata, download, update, or delete User B's document (returns 404)."""
    # 1. Register User A
    phone_a = "9555555551"
    client.post("/api/v1/auth/register", json={"phone": phone_a, "name": "User Doc A", "password": "dev_pass"})
    token_a = client.post("/api/v1/auth/login", json={"phone": phone_a, "password": "dev_pass", "otp": "123456"}).json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # 2. Register User B
    phone_b = "9555555552"
    client.post("/api/v1/auth/register", json={"phone": phone_b, "name": "User Doc B", "password": "dev_pass"})
    token_b = client.post("/api/v1/auth/login", json={"phone": phone_b, "password": "dev_pass", "otp": "123456"}).json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # User B uploads a document
    fake_pdf = b"%PDF-1.4 test document content for ownership verification"
    upload_res = client.post(
        "/api/v1/documents/upload",
        files={"file": ("tax_return.pdf", io.BytesIO(fake_pdf), "application/pdf")},
        data={"document_type": "tax_return", "display_label": "User B Tax Return"},
        headers=headers_b,
    )
    assert upload_res.status_code == 201
    doc_b_id = upload_res.json()["id"]

    # User B can read their document
    res_doc_b = client.get(f"/api/v1/documents/{doc_b_id}", headers=headers_b)
    assert res_doc_b.status_code == 200

    # User A tries to read User B's document metadata -> 404
    res_meta_a = client.get(f"/api/v1/documents/{doc_b_id}", headers=headers_a)
    assert res_meta_a.status_code == 404

    # User A tries to download User B's document binary -> 404
    res_down_a = client.get(f"/api/v1/documents/{doc_b_id}/download", headers=headers_a)
    assert res_down_a.status_code == 404

    # User A tries to modify User B's document -> 404
    res_patch_a = client.patch(
        f"/api/v1/documents/{doc_b_id}",
        json={"display_label": "Tampered label"},
        headers=headers_a,
    )
    assert res_patch_a.status_code == 404

    # User A tries to delete User B's document -> 404
    res_del_a = client.delete(f"/api/v1/documents/{doc_b_id}", headers=headers_a)
    assert res_del_a.status_code == 404
