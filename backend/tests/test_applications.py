"""Application lifecycle, document vault, and consent tests."""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_application_lifecycle_and_consent():
    """Test full application flow: start, checklist update, document attach, and consent."""
    # 1. Login user
    phone = "9855555555"
    token = client.post("/api/v1/auth/login", json={"phone": phone, "otp": "123456"}).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get verified scheme ID
    schemes = client.get("/api/v1/schemes").json()
    scheme_id = schemes[0]["id"]

    # 3. Start application
    start_res = client.post(
        "/api/v1/applications",
        json={"scheme_id": scheme_id, "notes": "Initial loan inquiry"},
        headers={**headers, "Content-Type": "application/json"},
    )
    assert start_res.status_code == 201
    app_data = start_res.json()
    app_id = app_data["id"]
    assert app_data["status"] in ["documents_needed", "in_progress"]
    assert app_data["progress_percentage"] >= 20

    # 4. Record document in vault attached to application
    doc_res = client.post(
        "/api/v1/documents",
        json={
            "application_id": app_id,
            "document_type": "pan",
            "file_name": "proprietor_pan.pdf",
            "file_size_bytes": 1048576,
        },
        headers={**headers, "Content-Type": "application/json"},
    )
    assert doc_res.status_code == 201
    assert doc_res.json()["file_name"] == "proprietor_pan.pdf"

    # 5. Grant granular consent for lender forwarding
    consent_res = client.post(
        "/api/v1/applications/consent",
        json={
            "application_id": app_id,
            "partner_name": "State Bank of India",
            "shared_fields": "name,phone,annual_turnover,pan_number",
        },
        headers={**headers, "Content-Type": "application/json"},
    )
    assert consent_res.status_code == 200
    consent_data = consent_res.json()
    consent_id = consent_data["id"]
    assert consent_data["is_revoked"] is False
    assert consent_data["partner_name"] == "State Bank of India"

    # 6. Update application status to submitted
    patch_res = client.patch(
        f"/api/v1/applications/{app_id}/status",
        json={"status": "submitted", "notes": "Submitted with bank consent"},
        headers={**headers, "Content-Type": "application/json"},
    )
    assert patch_res.status_code == 200
    updated_app = patch_res.json()
    assert updated_app["status"] == "submitted"
    assert updated_app["submitted_at"] is not None
    assert updated_app["progress_percentage"] == 80

    # 7. Revoke consent
    revoke_res = client.post(
        f"/api/v1/applications/consent/{consent_id}/revoke",
        headers=headers,
    )
    assert revoke_res.status_code == 200
    assert revoke_res.json()["is_revoked"] is True


def test_application_tenant_isolation():
    """Ensure User A cannot view User B's applications."""
    token_a = client.post("/api/v1/auth/login", json={"phone": "9866666666", "otp": "123456"}).json()["access_token"]
    token_b = client.post("/api/v1/auth/login", json={"phone": "9877777777", "otp": "123456"}).json()["access_token"]

    schemes = client.get("/api/v1/schemes").json()
    scheme_id = schemes[0]["id"]

    # User A creates application
    app_a = client.post(
        "/api/v1/applications",
        json={"scheme_id": scheme_id},
        headers={"Authorization": f"Bearer {token_a}"},
    ).json()

    # User B tries to fetch User A's application
    res_b = client.get(
        f"/api/v1/applications/{app_a['id']}",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert res_b.status_code == 404
