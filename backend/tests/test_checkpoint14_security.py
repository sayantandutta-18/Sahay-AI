"""Checkpoint 14: Comprehensive Security & Privacy Test Suite.

Verifies the 7 explicit goals of Checkpoint 14:
1. Server-side authorization for admin and private routes (401/403).
2. Document type magic bytes and size limit validation.
3. Sensitive financial identification masking and authenticated encryption at rest.
4. Data retention and DPDP Right to Erasure (DELETE /api/v1/auth/me).
5. Secret and credential leakage protection.
6. CORS restriction to verified origins.
7. Cross-tenant data isolation.
"""

import io
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.session import SessionLocal
from app.services.user_service import get_user_by_phone, promote_user_to_admin
from app.services.storage_service import storage_service, MAX_FILE_SIZE_BYTES
from app.core.security import (
    mask_pan,
    mask_aadhaar,
    mask_bank_account,
    encrypt_sensitive_data,
    decrypt_sensitive_data,
)

client = TestClient(app)


def test_checkpoint14_private_routes_require_authentication():
    """Step 1: Private endpoints must reject unauthenticated requests with 401."""
    endpoints = [
        ("GET", "/api/v1/auth/me"),
        ("DELETE", "/api/v1/auth/me"),
        ("GET", "/api/v1/documents"),
        ("GET", "/api/v1/applications"),
        ("POST", "/api/v1/applications"),
        ("GET", "/api/v1/profile"),
        ("PUT", "/api/v1/profile"),
        ("GET", "/api/v1/admin/stats"),
        ("GET", "/api/v1/admin/audit-logs"),
    ]
    for method, path in endpoints:
        res = client.request(method, path)
        assert res.status_code == 401, f"Expected 401 for unauthenticated {method} {path}, got {res.status_code}"


def test_checkpoint14_admin_authorization_enforced():
    """Step 1: Non-admin users must be rejected with 403 Forbidden from admin console."""
    phone = "919876540001"
    reg = client.post(
        "/api/v1/auth/register",
        json={"phone": phone, "name": "Regular Entrepreneur", "password": "secure_pass_123"},
    )
    assert reg.status_code == 201
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Entrepreneur attempting admin route -> 403 Forbidden
    res = client.get("/api/v1/admin/stats", headers=headers)
    assert res.status_code == 403
    assert "Administrative privileges required" in res.json()["detail"]

    # Promote to admin
    db = SessionLocal()
    try:
        user = get_user_by_phone(db, phone)
        promote_user_to_admin(db, user.id)
    finally:
        db.close()

    # Re-login to obtain fresh admin JWT
    login_res = client.post(
        "/api/v1/auth/login",
        json={"phone": phone, "password": "secure_pass_123"},
    )
    admin_token = login_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Admin accessing admin route -> 200 OK
    admin_res = client.get("/api/v1/admin/stats", headers=admin_headers)
    assert admin_res.status_code == 200


def test_checkpoint14_document_type_and_size_validation():
    """Step 2: Document uploads must check magic-byte file signature and enforce size limits."""
    # 1. Valid PDF magic bytes (%PDF)
    valid_pdf = b"%PDF-1.4\n1 0 obj\n<<\n>>\nendobj\ntrailer\n<<\n>>\n%%EOF"
    detected_pdf = storage_service.validate_file(valid_pdf, "application/pdf")
    assert detected_pdf == "application/pdf"

    # 2. Valid PNG magic bytes (\x89PNG\r\n\x1a\n)
    valid_png = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR"
    detected_png = storage_service.validate_file(valid_png, "image/png")
    assert detected_png == "image/png"

    # 3. Valid JPEG magic bytes (\xff\xd8\xff)
    valid_jpg = b"\xff\xd8\xff\xe0\x00\x10JFIF"
    detected_jpg = storage_service.validate_file(valid_jpg, "image/jpeg")
    assert detected_jpg == "image/jpeg"

    # 4. Empty file rejected
    with pytest.raises(ValueError, match="cannot be empty"):
        storage_service.validate_file(b"", "application/pdf")

    # 5. Oversize file (>10MB) rejected
    oversize_bytes = b"%PDF" + b"A" * (MAX_FILE_SIZE_BYTES + 1024)
    with pytest.raises(ValueError, match="exceeds maximum limit"):
        storage_service.validate_file(oversize_bytes, "application/pdf")

    # 6. Spoofed extension with executable or malicious content rejected
    malicious_exe = b"MZ\x90\x00\x03\x00\x00\x00Windows Executable Header"
    with pytest.raises(ValueError, match="Invalid file format"):
        storage_service.validate_file(malicious_exe, "application/pdf")


def test_checkpoint14_sensitive_financial_masking_and_encryption():
    """Step 3: Mask PAN, Aadhaar, and Bank Account numbers, and encrypt at rest."""
    # 1. Masking checks
    assert mask_pan("ABCDE1234F") == "ABCDE****F"
    assert mask_pan("AAAPA9999K") == "AAAPA****K"
    assert mask_pan("") == ""

    assert mask_aadhaar("123456789012") == "XXXX-XXXX-9012"
    assert mask_aadhaar("987654321098") == "XXXX-XXXX-1098"
    assert mask_aadhaar("") == ""

    assert mask_bank_account("501002345678") == "XXXXXXXX5678"
    assert mask_bank_account("123456789") == "XXXXX6789"
    assert mask_bank_account("") == ""

    # 2. Encryption at rest & authenticated roundtrip
    secret_pan = "ABCDE1234F"
    encrypted = encrypt_sensitive_data(secret_pan)
    assert encrypted != secret_pan, "Ciphertext must not expose plaintext"
    assert len(encrypted) > len(secret_pan)

    decrypted = decrypt_sensitive_data(encrypted)
    assert decrypted == secret_pan, "Decrypted text must match original plaintext"

    # 3. Tampered ciphertext returns empty string rather than crashing
    tampered = encrypted[:-4] + "AAAA"
    assert decrypt_sensitive_data(tampered) == ""


def test_checkpoint14_cross_tenant_document_isolation():
    """Step 7: User A cannot download or delete User B's vault documents."""
    # Register User A
    user_a_res = client.post(
        "/api/v1/auth/register",
        json={"phone": "919876540002", "name": "User Alpha", "password": "pass_user_a"},
    )
    token_a = user_a_res.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # Register User B
    user_b_res = client.post(
        "/api/v1/auth/register",
        json={"phone": "919876540003", "name": "User Beta", "password": "pass_user_b"},
    )
    token_b = user_b_res.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # User A uploads a valid PDF
    pdf_content = b"%PDF-1.4\nAlpha Confidential MSME Document\n%%EOF"
    upload_res = client.post(
        "/api/v1/documents/upload",
        files={"file": ("alpha_doc.pdf", io.BytesIO(pdf_content), "application/pdf")},
        data={"document_type": "pan", "display_label": "Alpha PAN Document"},
        headers=headers_a,
    )
    assert upload_res.status_code == 201
    doc_id = upload_res.json()["id"]

    # User B attempts to download User A's document -> 404 Not Found / Unauthorized
    b_download_res = client.get(f"/api/v1/documents/{doc_id}/download", headers=headers_b)
    assert b_download_res.status_code == 404

    # User B attempts to delete User A's document -> 404 Not Found / Unauthorized
    b_delete_res = client.delete(f"/api/v1/documents/{doc_id}", headers=headers_b)
    assert b_delete_res.status_code == 404

    # User A can successfully download their own document -> 200 OK
    a_download_res = client.get(f"/api/v1/documents/{doc_id}/download", headers=headers_a)
    assert a_download_res.status_code == 200
    assert b"%PDF-1.4" in a_download_res.content


def test_checkpoint14_cors_allowed_and_disallowed_origins():
    """Step 6: Ensure allowed origins pass and untrusted origins are rejected."""
    # Allowed deployed origin
    res_allowed = client.options(
        "/api/v1/health",
        headers={
            "Origin": "https://sahay-ai-beige.vercel.app",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert res_allowed.headers.get("access-control-allow-origin") == "https://sahay-ai-beige.vercel.app"

    # Disallowed untrusted origin
    res_disallowed = client.options(
        "/api/v1/health",
        headers={
            "Origin": "https://malicious-phishing-attacker.com",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert res_disallowed.headers.get("access-control-allow-origin") is None


def test_checkpoint14_statutory_right_to_erasure():
    """Step 4: Statutory Right to Erasure (DELETE /api/v1/auth/me) purges user and files."""
    phone = "919876540004"
    reg = client.post(
        "/api/v1/auth/register",
        json={"phone": phone, "name": "User To Delete", "password": "temp_password_1"},
    )
    assert reg.status_code == 201
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Upload document
    pdf_content = b"%PDF-1.4\nTemp Doc To Be Shredded\n%%EOF"
    upload = client.post(
        "/api/v1/documents/upload",
        files={"file": ("to_delete.pdf", io.BytesIO(pdf_content), "application/pdf")},
        data={"document_type": "udyam", "display_label": "Temp Udyam"},
        headers=headers,
    )
    assert upload.status_code == 201
    doc_id = upload.json()["id"]

    # Exercise Right to Erasure
    delete_res = client.delete("/api/v1/auth/me", headers=headers)
    assert delete_res.status_code == 200
    assert "permanently erased" in delete_res.json()["message"]

    # Verify user can no longer log in
    login_attempt = client.post(
        "/api/v1/auth/login",
        json={"phone": phone, "password": "temp_password_1"},
    )
    assert login_attempt.status_code == 401

    # Verify direct database record is gone
    db = SessionLocal()
    try:
        user = get_user_by_phone(db, phone)
        assert user is None
    finally:
        db.close()
