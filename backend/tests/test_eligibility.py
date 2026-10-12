"""Deterministic eligibility engine tests."""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.eligibility_service import evaluate_rule_operator

client = TestClient(app)


def test_rule_operator_unit_evaluations():
    """Unit test individual rule operator logic and boundary cases."""
    # 1. Boolean operator
    assert evaluate_rule_operator(True, "boolean_is", "true")[0] is True
    assert evaluate_rule_operator(False, "boolean_is", "true")[0] is False
    assert evaluate_rule_operator(False, "boolean_is", "false")[0] is True

    # 2. String equality (case-insensitive)
    assert evaluate_rule_operator("West Bengal", "eq", "west bengal")[0] is True
    assert evaluate_rule_operator("Bihar", "eq", "West Bengal")[0] is False
    assert evaluate_rule_operator("Trading", "neq", "manufacturing")[0] is True

    # 3. Inclusion ('in')
    assert evaluate_rule_operator("manufacturing", "in", "manufacturing,services")[0] is True
    assert evaluate_rule_operator("retail", "in", "manufacturing,services")[0] is False

    # 4. Numeric comparisons
    assert evaluate_rule_operator(500000, "lte", "10000000")[0] is True
    assert evaluate_rule_operator(15000000, "lte", "10000000")[0] is False
    assert evaluate_rule_operator(10, "gte", "10")[0] is True
    assert evaluate_rule_operator(5, "gt", "10")[0] is False

    # 5. Missing / None values
    assert evaluate_rule_operator(None, "eq", "West Bengal")[0] is False


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
