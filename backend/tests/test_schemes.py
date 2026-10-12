"""Government scheme library tests."""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_list_schemes_seed_data():
    """Verify that verified official schemes exist with valid metadata."""
    response = client.get("/api/v1/schemes")
    assert response.status_code == 200
    schemes = response.json()
    assert len(schemes) >= 3

    # Check that official URLs and verified dates exist on all schemes
    for s in schemes:
        assert s["official_url"].startswith("http")
        assert s["last_verified_at"] is not None

    # Check that seeded core schemes have documents
    pmegp = next(s for s in schemes if s["slug"] == "pmegp")
    assert len(pmegp["documents"]) > 0
    assert len(pmegp["rules"]) > 0


def test_filter_schemes_by_type():
    """Verify filtering schemes by type (subsidy vs loan)."""
    subsidy_res = client.get("/api/v1/schemes?scheme_type=subsidy")
    assert subsidy_res.status_code == 200
    subsidies = subsidy_res.json()
    assert all(s["scheme_type"] == "subsidy" for s in subsidies)

    loan_res = client.get("/api/v1/schemes?scheme_type=loan")
    assert loan_res.status_code == 200
    loans = loan_res.json()
    assert all(s["scheme_type"] == "loan" for s in loans)


def test_get_scheme_by_slug():
    """Verify retrieving specific scheme by unique slug."""
    response = client.get("/api/v1/schemes/slug/pmegp")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Prime Minister Employment Generation Programme (PMEGP)"
    assert data["provider"] == "Ministry of MSME, Govt of India"
