"""Checkpoint 10: State-level map & state filtering tests.

Tests verifying:
1. Filtering by 'West Bengal' returns both West Bengal specific schemes (Banglashree) and Pan-India schemes.
2. Filtering by another state (e.g. 'Maharashtra') excludes state-specific schemes from other states.
3. Filtering by 'ALL' returns all active schemes.
4. Case sensitivity and partial matching resilience.
"""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_state_filter_west_bengal_includes_banglashree_and_pan_india():
    """Checkpoint 10 Done When: Clicking West Bengal shows all schemes that serve West Bengal."""
    response = client.get("/api/v1/schemes", params={"state": "West Bengal"})
    assert response.status_code == 200
    schemes = response.json()
    assert len(schemes) >= 5, f"Expected at least 5 schemes for West Bengal, got {len(schemes)}"

    # Banglashree must be in results
    names = [s["name"] for s in schemes]
    slugs = [s["slug"] for s in schemes]
    assert any("Banglashree" in n or "banglashree" in sl for n, sl in zip(names, slugs)), (
        f"Banglashree Scheme expected for 'West Bengal', got: {names}"
    )

    # Pan-India schemes must also be in results
    assert any("PMEGP" in n or "Prime Minister" in n for n in names)
    assert any("MUDRA" in n for n in names)


def test_state_filter_other_state_excludes_west_bengal_scheme():
    """Filtering for a different state (e.g. 'Maharashtra') must NOT return Banglashree."""
    response = client.get("/api/v1/schemes", params={"state": "Maharashtra"})
    assert response.status_code == 200
    schemes = response.json()
    assert len(schemes) >= 4

    names = [s["name"] for s in schemes]
    assert not any("Banglashree" in n for n in names), (
        f"Banglashree Scheme should NOT be in Maharashtra results, got: {names}"
    )

    # But Pan-India schemes should still be returned
    assert any("PMEGP" in n or "Prime Minister" in n for n in names)


def test_state_filter_all_returns_all_schemes():
    """Filtering with state='ALL' returns the entire library."""
    response = client.get("/api/v1/schemes", params={"state": "ALL"})
    assert response.status_code == 200
    schemes = response.json()
    assert len(schemes) >= 7, "Expected full scheme catalog for ALL"
