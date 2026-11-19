"""Integration test for Checkpoint 1: Core User Flow.

Flow verified:
Step 1: Answer questions -> evaluate eligibility against deterministic rules (/api/v1/eligibility/check)
Step 2: See eligible schemes -> inspect scheme details & required documents (/api/v1/schemes/{id})
Step 3: Open scheme -> Add to Application Tracker (/api/v1/applications)
Step 4: Application tracking -> verify seeded document checklist & status transitions
"""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_checkpoint_1_core_user_flow():
    # -------------------------------------------------------------
    # Step 1: Answer questionnaire & evaluate deterministic eligibility
    # -------------------------------------------------------------
    questionnaire_payload = {
        "state": "West Bengal",
        "business_type": "manufacturing",
        "category": "micro",
        "annual_turnover": 850000.0,
        "gender": "female",
        "has_udyam": True,
        "has_pan": True,
        "has_bank_account": True,
        "has_gst": False,
        "months_in_operation": 18,
    }

    elig_res = client.post("/api/v1/eligibility/check", json=questionnaire_payload)
    assert elig_res.status_code == 200, f"Eligibility check failed: {elig_res.text}"
    elig_data = elig_res.json()
    assert "matches" in elig_data
    assert elig_data["evaluated_schemes_count"] > 0
    assert elig_data["eligible_count"] > 0

    # Pick the top eligible scheme
    eligible_matches = [m for m in elig_data["matches"] if m["is_eligible"]]
    assert len(eligible_matches) > 0, "Expected at least one eligible scheme match"
    target_match = eligible_matches[0]
    target_scheme_id = target_match["scheme_id"]
    assert target_scheme_id, "Matched scheme must have a valid scheme_id"

    # -------------------------------------------------------------
    # Step 2: See eligible schemes & Open scheme details
    # -------------------------------------------------------------
    scheme_res = client.get(f"/api/v1/schemes/{target_scheme_id}")
    assert scheme_res.status_code == 200, f"Scheme retrieval failed: {scheme_res.text}"
    scheme_data = scheme_res.json()
    assert scheme_data["id"] == target_scheme_id
    assert "name" in scheme_data
    assert "documents" in scheme_data
    assert scheme_data["official_url"], "Scheme must have an official portal URL"

    # -------------------------------------------------------------
    # Step 3: Add scheme to Tracker (Create Application)
    # -------------------------------------------------------------
    phone = "9876543210"
    login_res = client.post("/api/v1/auth/login", json={"phone": phone, "password": "Password123!"})
    if login_res.status_code != 200:
        reg_res = client.post("/api/v1/auth/register", json={"phone": phone, "name": "Demo Entrepreneur", "password": "Password123!"})
        token = reg_res.json()["access_token"]
    else:
        token = login_res.json()["access_token"]
    auth_headers = {"Authorization": f"Bearer {token}"}

    app_create_payload = {
        "scheme_id": target_scheme_id,
        "notes": "Added from deterministic match core flow",
    }
    create_res = client.post("/api/v1/applications", json=app_create_payload, headers=auth_headers)
    assert create_res.status_code == 201, f"Application creation failed: {create_res.text}"
    app_data = create_res.json()
    created_app_id = app_data["id"]
    assert created_app_id
    assert app_data["scheme_id"] == target_scheme_id
    assert app_data["status"] in ["draft", "documents_needed", "ready_to_submit"]

    # -------------------------------------------------------------
    # Step 4: Verify application in tracker with seeded checklist
    # -------------------------------------------------------------
    list_res = client.get("/api/v1/applications", headers=auth_headers)
    assert list_res.status_code == 200
    apps_list = list_res.json()
    matched_in_list = [a for a in apps_list if a["id"] == created_app_id]
    assert len(matched_in_list) == 1, "Created application must appear in user's tracker"

    # Check checklist items
    chk_res = client.get(f"/api/v1/applications/{created_app_id}/checklist", headers=auth_headers)
    assert chk_res.status_code == 200
    chk_items = chk_res.json()
    assert isinstance(chk_items, list)
    if len(scheme_data["documents"]) > 0:
        assert len(chk_items) == len(scheme_data["documents"]), "Checklist items must match scheme requirements"

    # If checklist items exist, toggle the first item
    if chk_items:
        first_item_id = chk_items[0]["id"]
        update_chk_res = client.patch(
            f"/api/v1/applications/{created_app_id}/checklist/{first_item_id}",
            json={"is_completed": True, "notes": "Verified by entrepreneur"},
            headers=auth_headers,
        )
        assert update_chk_res.status_code == 200
        assert update_chk_res.json()["is_completed"] is True
