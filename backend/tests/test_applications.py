"""Application lifecycle, document vault, and consent tests."""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_application_lifecycle_and_consent():
    """Test full application flow: start, checklist update, document attach, and consent."""
    # 1. Register and login user
    phone = "9855555555"
    client.post("/api/v1/auth/register", json={"phone": phone, "name": "App User", "password": "dev_pass"})
    token = client.post("/api/v1/auth/login", json={"phone": phone, "password": "dev_pass"}).json()["access_token"]
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
    client.post("/api/v1/auth/register", json={"phone": "9866666666", "name": "App A", "password": "dev_pass"})
    client.post("/api/v1/auth/register", json={"phone": "9877777777", "name": "App B", "password": "dev_pass"})
    token_a = client.post("/api/v1/auth/login", json={"phone": "9866666666", "password": "dev_pass"}).json()["access_token"]
    token_b = client.post("/api/v1/auth/login", json={"phone": "9877777777", "password": "dev_pass"}).json()["access_token"]

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


def test_checkpoint7_status_transitions_and_database_persistence():
    """Verify Checkpoint 7 status changes (draft, submitted, under review, approved, withdrawn) and DB persistence."""
    phone = "9812345678"
    client.post("/api/v1/auth/register", json={"phone": phone, "name": "Status User", "password": "dev_pass"})
    token = client.post("/api/v1/auth/login", json={"phone": phone, "password": "dev_pass"}).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    schemes = client.get("/api/v1/schemes").json()
    scheme_id = schemes[0]["id"]

    # 1. Create initial application
    create_res = client.post("/api/v1/applications", json={"scheme_id": scheme_id}, headers=headers)
    assert create_res.status_code == 201
    app_id = create_res.json()["id"]

    # 2. Transition through the 5 core statuses: draft, submitted, in_review, approved, withdrawn
    test_statuses = ["draft", "submitted", "in_review", "approved", "withdrawn"]
    for target_status in test_statuses:
        patch_res = client.patch(
            f"/api/v1/applications/{app_id}/status",
            json={"status": target_status, "change_reason": f"Testing transition to {target_status}"},
            headers=headers,
        )
        assert patch_res.status_code == 200
        data = patch_res.json()
        assert data["status"] == target_status

        # Verify DB persistence by querying single record
        get_res = client.get(f"/api/v1/applications/{app_id}", headers=headers)
        assert get_res.status_code == 200
        persisted = get_res.json()
        assert persisted["status"] == target_status

    # Also test 'under_review' alias normalization to 'in_review'
    patch_ur = client.patch(
        f"/api/v1/applications/{app_id}/status",
        json={"status": "under_review", "change_reason": "Testing under_review alias"},
        headers=headers,
    )
    assert patch_ur.status_code == 200
    assert patch_ur.json()["status"] == "in_review"

    # Verify status history audit trail captures transitions
    history_res = client.get(f"/api/v1/applications/{app_id}/history", headers=headers)
    assert history_res.status_code == 200
    history = history_res.json()
    assert len(history) >= 6


def test_checkpoint7_watchlist_sorting_by_deadline():
    """Verify Checkpoint 7 sorting by deadline ascending (nearest deadlines first)."""
    from datetime import datetime, timezone, timedelta

    phone = "9823456789"
    client.post("/api/v1/auth/register", json={"phone": phone, "name": "Watchlist User", "password": "dev_pass"})
    token = client.post("/api/v1/auth/login", json={"phone": phone, "password": "dev_pass"}).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    schemes = client.get("/api/v1/schemes").json()
    now = datetime.now(timezone.utc)

    # Scheme 0 with deadline in 10 days
    due_10d = (now + timedelta(days=10)).isoformat()
    app1 = client.post(
        "/api/v1/applications",
        json={"scheme_id": schemes[0]["id"], "due_date": due_10d},
        headers=headers,
    ).json()

    # Scheme 1 with urgent deadline in 2 days
    due_2d = (now + timedelta(days=2)).isoformat()
    app2 = client.post(
        "/api/v1/applications",
        json={"scheme_id": schemes[1]["id"], "due_date": due_2d},
        headers=headers,
    ).json()

    # Scheme 2 with deadline in 30 days
    due_30d = (now + timedelta(days=30)).isoformat()
    app3 = client.post(
        "/api/v1/applications",
        json={"scheme_id": schemes[2]["id"], "due_date": due_30d},
        headers=headers,
    ).json()

    # Query with sort_by=deadline
    list_res = client.get("/api/v1/applications?sort_by=deadline", headers=headers)
    assert list_res.status_code == 200
    sorted_apps = list_res.json()
    sorted_ids = [a["id"] for a in sorted_apps]

    # Nearest deadline (2 days) must appear before 10 days, which must appear before 30 days
    assert sorted_ids.index(app2["id"]) < sorted_ids.index(app1["id"])
    assert sorted_ids.index(app1["id"]) < sorted_ids.index(app3["id"])


def test_checkpoint7_access_isolation_for_another_users_data():
    """Verify Checkpoint 7 strict data isolation: User B cannot see or modify User A's data."""
    # User A setup
    phone_a = "9834567890"
    client.post("/api/v1/auth/register", json={"phone": phone_a, "name": "Owner User A", "password": "dev_pass"})
    token_a = client.post("/api/v1/auth/login", json={"phone": phone_a, "password": "dev_pass"}).json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # User B setup
    phone_b = "9845678901"
    client.post("/api/v1/auth/register", json={"phone": phone_b, "name": "Attacker User B", "password": "dev_pass"})
    token_b = client.post("/api/v1/auth/login", json={"phone": phone_b, "password": "dev_pass"}).json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    schemes = client.get("/api/v1/schemes").json()

    # User A creates application
    app_a = client.post(
        "/api/v1/applications",
        json={"scheme_id": schemes[0]["id"]},
        headers={**headers_a, "Content-Type": "application/json"},
    ).json()
    app_a_id = app_a["id"]

    # 1. User B lists applications: User A's application must NOT be present
    list_b = client.get("/api/v1/applications", headers=headers_b).json()
    b_app_ids = [a["id"] for a in list_b]
    assert app_a_id not in b_app_ids

    # 2. User B tries to fetch User A's application directly
    get_b = client.get(f"/api/v1/applications/{app_a_id}", headers=headers_b)
    assert get_b.status_code == 404

    # 3. User B tries to mutate User A's application status
    patch_b = client.patch(
        f"/api/v1/applications/{app_a_id}/status",
        json={"status": "approved"},
        headers={**headers_b, "Content-Type": "application/json"},
    )
    assert patch_b.status_code == 404

    # 4. User B tries to delete User A's application
    delete_b = client.delete(f"/api/v1/applications/{app_a_id}", headers=headers_b)
    assert delete_b.status_code == 404
