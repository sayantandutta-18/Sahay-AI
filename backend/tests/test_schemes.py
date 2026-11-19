"""Government scheme foundation and data validation tests (Checkpoint 2)."""

import pytest
from pydantic import ValidationError
from fastapi.testclient import TestClient
from app.main import app
from app.schemas.scheme import SchemeDataValidationRecord
from app.services.scheme_service import compute_verification_status
from datetime import date, timedelta

client = TestClient(app)


def test_every_scheme_has_source_date_and_non_empty_documents():
    """Verify Checkpoint 2 requirement: every scheme has an official source URL, date, and document list."""
    response = client.get("/api/v1/schemes")
    assert response.status_code == 200
    schemes = response.json()
    assert len(schemes) >= 5, f"Expected 5 to 10 verified schemes, found {len(schemes)}"

    for s in schemes:
        # Checkpoint 2 criteria:
        assert s["name"], "Scheme name cannot be empty"
        assert s["provider"], "Agency/ministry cannot be empty"
        assert s["official_url"], f"Scheme '{s['name']}' must have an official source URL"
        assert s["official_url"].startswith("http://") or s["official_url"].startswith("https://"), (
            f"Scheme '{s['name']}' official_url must start with http:// or https://"
        )
        assert s["last_verified_at"], f"Scheme '{s['name']}' must have a last_verified_at date"
        assert len(s["last_verified_at"]) == 10, f"Date '{s['last_verified_at']}' must be YYYY-MM-DD"
        assert s.get("verifier"), f"Scheme '{s['name']}' must state the verifier"
        assert s.get("deadline"), f"Scheme '{s['name']}' must specify an application deadline"
        assert len(s["documents"]) > 0, f"Scheme '{s['name']}' must have at least one required document"


def test_schema_validation_rejects_missing_or_invalid_source_url():
    """Checkpoint 2 Step 4: Pydantic rejects schemes with missing or invalid source URLs."""
    valid_payload = {
        "name": "Test Micro Grant",
        "slug": "test-micro-grant",
        "provider": "Ministry of Skill Development",
        "scheme_type": "grant",
        "short_description": "Grant for rural micro enterprises to purchase equipment.",
        "detailed_benefits": "100% grant assistance up to ₹50,000 for verified tools.",
        "max_amount": 50000.0,
        "official_url": "https://msde.gov.in",
        "last_verified_at": "2026-03-01",
        "verifier": "Sahay Test Verifier",
        "deadline": "2026-12-31",
        "documents": [
            {"document_type": "aadhaar", "title": "Aadhaar Card", "mandatory": True}
        ],
    }

    # Should succeed with valid URL
    record = SchemeDataValidationRecord.model_validate(valid_payload)
    assert record.official_url == "https://msde.gov.in"

    # Should fail if empty URL
    with pytest.raises(ValidationError):
        bad_payload = dict(valid_payload, official_url="")
        SchemeDataValidationRecord.model_validate(bad_payload)

    # Should fail if not http/https
    with pytest.raises(ValidationError):
        bad_payload = dict(valid_payload, official_url="ftp://invalid-server.org")
        SchemeDataValidationRecord.model_validate(bad_payload)


def test_schema_validation_rejects_empty_documents_list():
    """Checkpoint 2 Step 4 & 5: Schemes must not load if document list is empty."""
    payload_no_docs = {
        "name": "Scheme Without Documents",
        "slug": "scheme-no-docs",
        "provider": "Ministry of MSME",
        "scheme_type": "loan",
        "short_description": "Loan scheme with missing document requirements.",
        "detailed_benefits": "Benefits description here.",
        "max_amount": 100000.0,
        "official_url": "https://msme.gov.in",
        "last_verified_at": "2026-03-01",
        "verifier": "Sahay Audit",
        "documents": [],
    }

    with pytest.raises(ValidationError):
        SchemeDataValidationRecord.model_validate(payload_no_docs)


def test_schema_validation_rejects_invalid_date_format():
    """Checkpoint 2: last_verified_at must conform to YYYY-MM-DD."""
    payload_bad_date = {
        "name": "Scheme Bad Date",
        "slug": "scheme-bad-date",
        "provider": "Ministry of MSME",
        "scheme_type": "subsidy",
        "short_description": "Subsidy program description.",
        "detailed_benefits": "Benefits description.",
        "max_amount": 100000.0,
        "official_url": "https://msme.gov.in",
        "last_verified_at": "01-03-2026",  # wrong format
        "verifier": "Sahay Audit",
        "documents": [{"document_type": "pan", "title": "PAN Card", "mandatory": True}],
    }

    with pytest.raises(ValidationError):
        SchemeDataValidationRecord.model_validate(payload_bad_date)


def test_filter_schemes_by_type():
    """Verify filtering schemes by type (subsidy vs loan)."""
    subsidy_res = client.get("/api/v1/schemes?scheme_type=subsidy")
    assert subsidy_res.status_code == 200
    subsidies = subsidy_res.json()
    assert len(subsidies) >= 2
    assert all(s["scheme_type"] == "subsidy" for s in subsidies)

    loan_res = client.get("/api/v1/schemes?scheme_type=loan")
    assert loan_res.status_code == 200
    loans = loan_res.json()
    assert len(loans) >= 3
    assert all(s["scheme_type"] == "loan" for s in loans)


def test_get_scheme_by_slug():
    """Verify retrieving specific scheme by unique slug."""
    response = client.get("/api/v1/schemes/slug/pmegp")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Prime Minister Employment Generation Programme (PMEGP)"
    assert data["provider"] == "Ministry of MSME, Govt of India"
    assert data["deadline"]
    assert data["verifier"]
    assert len(data["documents"]) > 0


def test_checkpoint3_verification_status_classification():
    """Verify Checkpoint 3 three-state rules: verified, outdated (>180 days), unverified."""
    today = date(2026, 4, 1)

    # 1. Verified: Valid official source within 180 days
    recent_date = (today - timedelta(days=30)).isoformat()
    status_verified = compute_verification_status(
        official_url="https://msme.gov.in",
        last_verified_at=recent_date,
        reference_date=today,
    )
    assert status_verified == "verified"

    # 2. Outdated: Valid official source but checked >180 days ago
    old_date = (today - timedelta(days=200)).isoformat()
    status_outdated = compute_verification_status(
        official_url="https://msme.gov.in",
        last_verified_at=old_date,
        reference_date=today,
    )
    assert status_outdated == "outdated"

    # 3. Explicitly outdated status flag
    status_explicit_outdated = compute_verification_status(
        official_url="https://msme.gov.in",
        last_verified_at=recent_date,
        verification_status="outdated",
        reference_date=today,
    )
    assert status_explicit_outdated == "outdated"

    # 4. Unverified: Missing official URL
    status_no_url = compute_verification_status(
        official_url="",
        last_verified_at=recent_date,
        reference_date=today,
    )
    assert status_no_url == "unverified"

    # 5. Unverified: Missing verification date
    status_no_date = compute_verification_status(
        official_url="https://msme.gov.in",
        last_verified_at=None,
        reference_date=today,
    )
    assert status_no_date == "unverified"

    # 6. Unverified: Explicitly marked unverified
    status_explicit_unverified = compute_verification_status(
        official_url="https://msme.gov.in",
        last_verified_at=recent_date,
        verification_status="unverified",
        reference_date=today,
    )
    assert status_explicit_unverified == "unverified"


def test_scheme_match_results_carry_verification_metadata():
    """Verify that SchemeMatchResult preserves verification status, last_verified_at, and verifier."""
    payload = {
        "state": "West Bengal",
        "business_type": "manufacturing",
        "annual_turnover": 500000.0,
        "months_in_operation": 12,
        "has_bank_account": True,
        "has_aadhaar": True,
        "has_pan": True,
    }
    response = client.post("/api/v1/eligibility/check", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "matches" in data
    assert len(data["matches"]) > 0

    for match in data["matches"]:
        assert "verification_status" in match
        assert match["verification_status"] in ["verified", "unverified", "outdated"]
        assert match.get("official_url") and match["official_url"].startswith("http")
        assert match.get("last_verified_at")
        assert match.get("verifier")
