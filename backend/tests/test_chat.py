"""Grounded AI Assistant /chat endpoint tests."""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_chat_scheme_inquiry_grounded_response():
    """Verify chat retrieves verified scheme details and cites official source."""
    res = client.post(
        "/api/v1/chat",
        json={"message": "Can you tell me about the PMEGP scheme?"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["intent_detected"] == "SCHEME_INQUIRY"
    assert "PMEGP" in data["reply"] or "Prime Minister" in data["reply"]
    assert len(data["sources"]) > 0
    assert data["sources"][0]["url"].startswith("http")
    assert "compliance_disclaimer" in data


def test_chat_eligibility_intent_routes_to_deterministic_engine():
    """Verify that asking about eligibility routes to deterministic engine and cites match results."""
    res = client.post(
        "/api/v1/chat",
        json={"message": "Am I eligible for any subsidies as a micro manufacturing unit?"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["intent_detected"] == "ELIGIBILITY_CHECK"
    assert data["deterministic_action_taken"] == "EVALUATED_BY_DETERMINISTIC_RULES_ENGINE"
    assert "deterministic eligibility rules" in data["reply"].lower()
    assert len(data["sources"]) > 0


def test_chat_document_guidance():
    """Verify document inquiry returns checklist guidance and official links."""
    res = client.post(
        "/api/v1/chat",
        json={"message": "What documents do I need to prepare for MSME loan verification?"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["intent_detected"] == "DOCUMENT_GUIDANCE"
    assert "Udyam" in data["reply"]
    assert "PAN" in data["reply"]


def test_chat_uncertainty_and_safe_refusal():
    """Verify that off-topic or unverified inquiries trigger uncertainty disclaimer."""
    res = client.post(
        "/api/v1/chat",
        json={"message": "What is the secret recipe for baking croissants in Paris?"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["intent_detected"] == "GENERAL"
    assert data["confidence_level"] == "medium"
    assert "grounded in verified" in data["reply"].lower()
