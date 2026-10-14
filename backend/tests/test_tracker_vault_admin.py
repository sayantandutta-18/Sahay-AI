"""Tests for Application Tracker, Checklist, Document Vault Object Storage, and Admin Redaction."""

import io
from fastapi.testclient import TestClient
from app.main import app
from app.database.session import SessionLocal
from app.services.user_service import get_user_by_phone, promote_user_to_admin

client = TestClient(app)


def get_auth_token(phone: str = "9811122233", role: str = "entrepreneur") -> tuple[str, dict]:
    """Helper to register/login user and return token and auth headers."""
    # Ensure user exists
    client.post(
        "/api/v1/auth/register",
        json={"phone": phone, "name": f"User {phone}", "password": "dev_pass"},
    )
    if role == "admin":
        db = SessionLocal()
        try:
            u = get_user_by_phone(db, phone)
            if u:
                promote_user_to_admin(db, u.id)
        finally:
            db.close()

    res = client.post("/api/v1/auth/login", json={"phone": phone, "password": "dev_pass", "otp": "123456"})
    token = res.json()["access_token"]
    return token, {"Authorization": f"Bearer {token}"}


def test_application_checklist_and_status_transitions():
    """Verify that scheme document requirements seed checklist items, and invalid transitions fail."""
    token, headers = get_auth_token("9811100001", "entrepreneur")

    schemes = client.get("/api/v1/schemes").json()
    scheme_id = schemes[0]["id"]

    # 1. Create application
    res = client.post(
        "/api/v1/applications",
        json={"scheme_id": scheme_id, "notes": "Checklist test"},
        headers=headers,
    )
    assert res.status_code == 201
    app = res.json()
    app_id = app["id"]
    assert app["status"] in ["documents_needed", "ready_to_submit"]

    # 2. Get checklist items
    chk_res = client.get(f"/api/v1/applications/{app_id}/checklist", headers=headers)
    assert chk_res.status_code == 200
    checklist = chk_res.json()
    assert len(checklist) >= 1
    first_item = checklist[0]
    assert first_item["is_completed"] is False

    # 3. Toggle checklist item
    item_id = first_item["id"]
    update_chk_res = client.patch(
        f"/api/v1/applications/{app_id}/checklist/{item_id}",
        json={"is_completed": True, "validation_message": "Manually verified physical document"},
        headers=headers,
    )
    assert update_chk_res.status_code == 200
    assert update_chk_res.json()["is_completed"] is True
    assert update_chk_res.json()["validation_message"] == "Manually verified physical document"

    # 4. Valid status transition: to ready_to_submit
    patch_status = client.patch(
        f"/api/v1/applications/{app_id}/status",
        json={"status": "ready_to_submit", "change_reason": "All documents ready"},
        headers=headers,
    )
    assert patch_status.status_code == 200
    assert patch_status.json()["status"] == "ready_to_submit"

    # 5. Invalid status transition: ready_to_submit -> approved directly (must fail with 400)
    invalid_patch = client.patch(
        f"/api/v1/applications/{app_id}/status",
        json={"status": "approved", "change_reason": "Skipping review"},
        headers=headers,
    )
    assert invalid_patch.status_code == 400
    assert "Invalid status transition" in invalid_patch.json()["detail"]

    # 6. Verify status history audit
    hist_res = client.get(f"/api/v1/applications/{app_id}/history", headers=headers)
    assert hist_res.status_code == 200
    history = hist_res.json()
    assert len(history) >= 2  # created + ready_to_submit
    assert any(h["to_status"] == "ready_to_submit" for h in history)


def test_document_vault_binary_upload_download_and_isolation():
    """Verify object storage binary upload, magic-byte validation, download streaming, and isolation."""
    user1_token, user1_headers = get_auth_token("9811100002", "entrepreneur")
    user2_token, user2_headers = get_auth_token("9811100003", "entrepreneur")

    # Valid PDF magic bytes: b"%PDF-1.4\n..."
    pdf_bytes = b"%PDF-1.4 simulated pdf document content for verification testing"
    files = {"file": ("business_pan.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
    data = {
        "document_type": "pan",
        "display_label": "Proprietor PAN Card",
        "purpose": "identity_verification",
    }

    # 1. Upload valid document
    upload_res = client.post(
        "/api/v1/documents/upload",
        files=files,
        data=data,
        headers=user1_headers,
    )
    assert upload_res.status_code == 201
    doc_data = upload_res.json()
    doc_id = doc_data["id"]
    assert doc_data["display_label"] == "Proprietor PAN Card"
    assert doc_data["mime_type"] == "application/pdf"
    assert doc_data["file_size_bytes"] == len(pdf_bytes)
    assert len(doc_data["checksum_sha256"]) == 64

    # 2. Reject invalid MIME / raw executable bytes
    bad_bytes = b"\x4d\x5a\x90\x00\x03\x00\x00\x00"  # MZ DOS executable header
    bad_files = {"file": ("malicious.exe", io.BytesIO(bad_bytes), "application/octet-stream")}
    bad_res = client.post(
        "/api/v1/documents/upload",
        files=bad_files,
        data=data,
        headers=user1_headers,
    )
    assert bad_res.status_code == 400
    assert "Invalid file format" in bad_res.json()["detail"]

    # 3. Authorized download by owner
    download_res = client.get(f"/api/v1/documents/{doc_id}/download", headers=user1_headers)
    assert download_res.status_code == 200
    assert download_res.content == pdf_bytes

    # 4. Cross-user download denial
    cross_res = client.get(f"/api/v1/documents/{doc_id}/download", headers=user2_headers)
    assert cross_res.status_code in [403, 404]

    # 5. Metadata patch (update label)
    patch_doc = client.patch(
        f"/api/v1/documents/{doc_id}",
        json={"display_label": "Updated PAN Document", "purpose": "kyc_update"},
        headers=user1_headers,
    )
    assert patch_doc.status_code == 200
    assert patch_doc.json()["display_label"] == "Updated PAN Document"

    # 6. Safe deletion
    del_res = client.delete(f"/api/v1/documents/{doc_id}", headers=user1_headers)
    assert del_res.status_code == 204

    # Deleted document cannot be downloaded anymore
    re_download = client.get(f"/api/v1/documents/{doc_id}/download", headers=user1_headers)
    assert re_download.status_code == 404


def test_admin_rbac_and_audit_redaction():
    """Verify non-admin denial, admin scheme publication updates, and audit redaction."""
    user_token, user_headers = get_auth_token("9811100004", "entrepreneur")
    admin_token, admin_headers = get_auth_token("9811100005", "admin")

    # 1. Non-admin denied from admin routes
    denied_res = client.get("/api/v1/admin/stats", headers=user_headers)
    assert denied_res.status_code == 403

    # 2. Admin authorized
    stats_res = client.get("/api/v1/admin/stats", headers=admin_headers)
    assert stats_res.status_code == 200

    # 3. Admin update scheme publication status
    schemes = client.get("/api/v1/schemes").json()
    scheme_id = schemes[0]["id"]
    patch_scheme_res = client.patch(
        f"/api/v1/admin/schemes/{scheme_id}",
        json={"publication_status": "archived", "language_coverage": "en,hi,bn,te"},
        headers=admin_headers,
    )
    assert patch_scheme_res.status_code == 200
    assert patch_scheme_res.json()["publication_status"] == "archived"
    assert patch_scheme_res.json()["language_coverage"] == "en,hi,bn,te"

    # 4. Verify audit redaction
    from app.services.audit_service import redact_sensitive_data
    sample_text = "User logged in with password='MySecretPassword123' and token Bearer eyJhbGciOiJIUzI1NiIsIn... Aadhaar 1234 5678 9012 PAN ABCDE1234F"
    scrubbed = redact_sensitive_data(sample_text)
    assert "MySecretPassword123" not in scrubbed
    assert "eyJhbGciOiJIUzI1NiIsIn" not in scrubbed
    assert "1234 5678 9012" not in scrubbed
    assert "ABCDE1234F" not in scrubbed
    assert "XXXXXX234F" in scrubbed


def test_auto_fulfill_checklist_and_delete_application():
    """Verify that uploading a document with application_id auto-fulfills matching checklist requirement, and draft application can be deleted."""
    token, headers = get_auth_token("9811100006", "entrepreneur")

    schemes = client.get("/api/v1/schemes").json()
    scheme_id = schemes[0]["id"]

    # 1. Create draft application
    create_res = client.post(
        "/api/v1/applications",
        json={"scheme_id": scheme_id, "notes": "Auto-fulfill test"},
        headers=headers,
    )
    assert create_res.status_code == 201
    app_id = create_res.json()["id"]

    # 2. Get initial checklist
    chk_res = client.get(f"/api/v1/applications/{app_id}/checklist", headers=headers)
    assert chk_res.status_code == 200
    items = chk_res.json()
    assert len(items) >= 1
    target_item = items[0]
    target_doc_type = target_item["document_type"]

    # 3. Upload document matching target_doc_type linked to application_id
    pdf_bytes = b"%PDF-1.4 test auto-fulfill pdf document content"
    files = {"file": (f"{target_doc_type}_proof.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
    upload_res = client.post(
        "/api/v1/documents/upload",
        files=files,
        data={
            "document_type": target_doc_type,
            "application_id": app_id,
            "display_label": f"Uploaded {target_doc_type}",
        },
        headers=headers,
    )
    assert upload_res.status_code == 201
    doc_id = upload_res.json()["id"]

    # 4. Verify checklist item was auto-fulfilled
    chk_after = client.get(f"/api/v1/applications/{app_id}/checklist", headers=headers).json()
    updated_item = next(i for i in chk_after if i["id"] == target_item["id"])
    assert updated_item["is_completed"] is True
    assert updated_item["user_document_id"] == doc_id

    # 5. Delete draft application
    del_res = client.delete(f"/api/v1/applications/{app_id}", headers=headers)
    assert del_res.status_code == 204

    # 6. Verify application is gone
    get_res = client.get(f"/api/v1/applications/{app_id}", headers=headers)
    assert get_res.status_code == 404
