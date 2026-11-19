"""Deterministic eligibility engine tests."""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.eligibility_service import evaluate_rule_operator

client = TestClient(app)


def test_rule_operator_unit_evaluations():
    """Unit test individual rule operator logic and 3-state boundary cases (Checkpoint 4)."""
    # 1. Boolean operator
    assert evaluate_rule_operator(True, "boolean_is", "true")[0] == "met"
    assert evaluate_rule_operator(False, "boolean_is", "true")[0] == "not_met"
    assert evaluate_rule_operator(False, "boolean_is", "false")[0] == "met"

    # 2. String equality (case-insensitive)
    assert evaluate_rule_operator("West Bengal", "eq", "west bengal")[0] == "met"
    assert evaluate_rule_operator("Bihar", "eq", "West Bengal")[0] == "not_met"
    assert evaluate_rule_operator("Trading", "neq", "manufacturing")[0] == "met"

    # 3. Inclusion ('in')
    assert evaluate_rule_operator("manufacturing", "in", "manufacturing,services")[0] == "met"
    assert evaluate_rule_operator("retail", "in", "manufacturing,services")[0] == "not_met"

    # 4. Numeric comparisons
    assert evaluate_rule_operator(500000, "lte", "10000000")[0] == "met"
    assert evaluate_rule_operator(15000000, "lte", "10000000")[0] == "not_met"
    assert evaluate_rule_operator(10, "gte", "10")[0] == "met"
    assert evaluate_rule_operator(5, "gt", "10")[0] == "not_met"

    # 5. Missing / None values return 'missing_information'
    assert evaluate_rule_operator(None, "eq", "West Bengal")[0] == "missing_information"
    assert evaluate_rule_operator("", "gte", "18")[0] == "missing_information"
    assert evaluate_rule_operator(None, "boolean_is", "true")[0] == "missing_information"


def test_eligibility_check_hard_rule_failure():
    """Test that a hard rule failure correctly disqualifies and produces unlock guidance."""
    # State is Maharashtra -> Banglashree (requires West Bengal) must fail
    response = client.post(
        "/api/v1/eligibility/check",
        json={
            "state": "Maharashtra",
            "business_type": "manufacturing",
            "annual_turnover": 500000.0,
            "has_bank_account": True,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["evaluated_schemes_count"] >= 3

    banglashree_match = next((m for m in data["matches"] if m["slug"] == "banglashree"), None)
    assert banglashree_match is not None
    assert banglashree_match["is_eligible"] is False
    assert banglashree_match["match_score"] < 50
    assert any("State" in rule for rule in banglashree_match["failed_hard_rules"])
    assert banglashree_match["near_miss_unlock_path"] is not None


def test_eligibility_check_eligible_with_soft_bonus():
    """Test that passing all hard rules plus soft bonus attributes achieves high match score."""
    response = client.post(
        "/api/v1/eligibility/check",
        json={
            "state": "West Bengal",
            "business_type": "manufacturing",
            "category": "micro",
            "annual_turnover": 800000.0,
            "gender": "female",
            "has_udyam": True,
            "has_pan": True,
            "has_bank_account": True,
        },
    )
    assert response.status_code == 200
    data = response.json()

    pmegp_match = next((m for m in data["matches"] if m["slug"] == "pmegp"), None)
    assert pmegp_match is not None
    assert pmegp_match["is_eligible"] is True
    assert pmegp_match["match_score"] >= 90  # Benefited from female + udyam soft bonuses!
    assert len(pmegp_match["failed_hard_rules"]) == 0
    assert "1.4.2" in pmegp_match["rule_version"]


def test_user_matches_endpoint_integration():
    """Test authenticated /eligibility/my-matches endpoint using profile."""
    # 1. Register and login user
    phone = "9844444444"
    client.post("/api/v1/auth/register", json={"phone": phone, "name": "Matches User", "password": "dev_pass"})
    login_res = client.post("/api/v1/auth/login", json={"phone": phone, "password": "dev_pass"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Update user state to West Bengal
    client.put("/api/v1/profile?state=West Bengal", headers=headers)

    # 3. Update business profile
    client.put(
        "/api/v1/business-profile",
        json={
            "business_type": "manufacturing",
            "category": "micro",
            "annual_turnover": 750000.0,
            "has_bank_account": True,
            "has_udyam": True,
        },
        headers=headers,
    )

    # 4. Get matches
    matches_res = client.get("/api/v1/eligibility/my-matches", headers=headers)
    assert matches_res.status_code == 200
    summary = matches_res.json()
    assert summary["eligible_count"] >= 2
    assert summary["rule_authority"].startswith("Sahay")


def test_checkpoint4_rule_three_state_evaluation_unit_tests():
    """Verify Checkpoint 4 Step 1, 2, 4: Each rule returns 'met', 'not_met', or 'missing_information'."""
    # Rule A: Age >= 18
    assert evaluate_rule_operator(25, "gte", "18")[0] == "met"
    assert evaluate_rule_operator(17, "gte", "18")[0] == "not_met"
    assert evaluate_rule_operator(None, "gte", "18")[0] == "missing_information"

    # Rule B: Business age / months_in_operation >= 6
    assert evaluate_rule_operator(12, "gte", "6")[0] == "met"
    assert evaluate_rule_operator(3, "gte", "6")[0] == "not_met"
    assert evaluate_rule_operator(None, "gte", "6")[0] == "missing_information"

    # Rule C: State = West Bengal
    assert evaluate_rule_operator("West Bengal", "eq", "West Bengal")[0] == "met"
    assert evaluate_rule_operator("Maharashtra", "eq", "West Bengal")[0] == "not_met"
    assert evaluate_rule_operator(None, "eq", "West Bengal")[0] == "missing_information"
    assert evaluate_rule_operator("   ", "eq", "West Bengal")[0] == "missing_information"

    # Rule D: Annual turnover <= 10,000,000 (1 Crore)
    assert evaluate_rule_operator(500000.0, "lte", "10000000")[0] == "met"
    assert evaluate_rule_operator(15000000.0, "lte", "10000000")[0] == "not_met"
    assert evaluate_rule_operator(None, "lte", "10000000")[0] == "missing_information"

    # Rule E: Has bank account boolean_is true
    assert evaluate_rule_operator(True, "boolean_is", "true")[0] == "met"
    assert evaluate_rule_operator(False, "boolean_is", "true")[0] == "not_met"
    assert evaluate_rule_operator(None, "boolean_is", "true")[0] == "missing_information"

    # Rule F: Business type in manufacturing,services
    assert evaluate_rule_operator("manufacturing", "in", "manufacturing,services")[0] == "met"
    assert evaluate_rule_operator("mining", "in", "manufacturing,services")[0] == "not_met"
    assert evaluate_rule_operator(None, "in", "manufacturing,services")[0] == "missing_information"


def test_checkpoint4_scheme_verdicts_three_outcomes():
    """Verify Checkpoint 4 Step 3: Scheme returns 'eligible', 'not_eligible', or 'more_information_needed'."""
    # 1. Eligible Case (Banglashree with all criteria satisfied)
    eligible_res = client.post(
        "/api/v1/eligibility/check",
        json={
            "state": "West Bengal",
            "business_type": "manufacturing",
            "has_bank_account": True,
            "has_udyam": True,
        },
    )
    assert eligible_res.status_code == 200
    eligible_data = eligible_res.json()
    bangla_eligible = next((m for m in eligible_data["matches"] if m["slug"] == "banglashree"), None)
    assert bangla_eligible is not None
    assert bangla_eligible["eligibility_verdict"] == "eligible"
    assert bangla_eligible["is_eligible"] is True
    assert len(bangla_eligible["passed_hard_rules"]) >= 2
    assert len(bangla_eligible["failed_hard_rules"]) == 0
    assert len(bangla_eligible["missing_info_rules"]) == 0

    # 2. Not Eligible Case (Banglashree with state = Bihar)
    not_eligible_res = client.post(
        "/api/v1/eligibility/check",
        json={
            "state": "Bihar",
            "business_type": "manufacturing",
            "has_bank_account": True,
        },
    )
    assert not_eligible_res.status_code == 200
    not_eligible_data = not_eligible_res.json()
    bangla_not_eligible = next((m for m in not_eligible_data["matches"] if m["slug"] == "banglashree"), None)
    assert bangla_not_eligible is not None
    assert bangla_not_eligible["eligibility_verdict"] == "not_eligible"
    assert bangla_not_eligible["is_eligible"] is False
    assert len(bangla_not_eligible["failed_hard_rules"]) >= 1

    # 3. More Information Needed Case (state is omitted/None for Banglashree)
    more_info_res = client.post(
        "/api/v1/eligibility/check",
        json={
            "business_type": "manufacturing",
            # state is intentionally omitted
        },
    )
    assert more_info_res.status_code == 200
    more_info_data = more_info_res.json()
    bangla_more_info = next((m for m in more_info_data["matches"] if m["slug"] == "banglashree"), None)
    assert bangla_more_info is not None
    assert bangla_more_info["eligibility_verdict"] == "more_information_needed"
    assert bangla_more_info["is_eligible"] is False
    assert len(bangla_more_info["missing_info_rules"]) >= 1
    assert any("State" in r for r in bangla_more_info["missing_info_rules"])
    assert "Please specify" in bangla_more_info["near_miss_unlock_path"]


def test_checkpoint4_deterministic_idempotency():
    """Verify Checkpoint 4 Step 5: The same input always gives the identical result."""
    payload = {
        "state": "West Bengal",
        "business_type": "services",
        "annual_turnover": 450000.0,
        "months_in_operation": 18,
        "has_bank_account": True,
        "has_udyam": False,
    }

    run1 = client.post("/api/v1/eligibility/check", json=payload).json()
    run2 = client.post("/api/v1/eligibility/check", json=payload).json()
    run3 = client.post("/api/v1/eligibility/check", json=payload).json()

    # Assert exact match across all matches, verdicts, and scores
    assert len(run1["matches"]) == len(run2["matches"]) == len(run3["matches"])
    for i in range(len(run1["matches"])):
        m1 = run1["matches"][i]
        m2 = run2["matches"][i]
        m3 = run3["matches"][i]

        assert m1["scheme_id"] == m2["scheme_id"] == m3["scheme_id"]
        assert m1["eligibility_verdict"] == m2["eligibility_verdict"] == m3["eligibility_verdict"]
        assert m1["is_eligible"] == m2["is_eligible"] == m3["is_eligible"]
        assert m1["match_score"] == m2["match_score"] == m3["match_score"]
        assert m1["passed_hard_rules"] == m2["passed_hard_rules"] == m3["passed_hard_rules"]
        assert m1["failed_hard_rules"] == m2["failed_hard_rules"] == m3["failed_hard_rules"]
        assert m1["missing_info_rules"] == m2["missing_info_rules"] == m3["missing_info_rules"]


def test_checkpoint5_scheme_documents_and_missing_requirements_matching():
    """Verify Checkpoint 5: Matches include required document checklists with official sources."""
    res = client.post(
        "/api/v1/eligibility/check",
        json={
            "state": "West Bengal",
            "business_type": "manufacturing",
            "annual_turnover": 500000.0,
            "has_bank_account": True,
            "has_udyam": True,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert len(data["matches"]) > 0

    for match in data["matches"]:
        # Verify required document checklist is populated
        assert "documents" in match
        assert len(match["documents"]) > 0, f"Scheme {match['scheme_name']} must provide required document checklist"
        for doc in match["documents"]:
            assert doc["title"]
            assert doc["document_type"]
            assert "mandatory" in doc
            assert doc.get("how_to_get_url"), f"Document {doc['title']} must have official source link"
            assert doc["how_to_get_url"].startswith("http")


