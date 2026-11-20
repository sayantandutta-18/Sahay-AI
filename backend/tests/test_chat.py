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


# =========================================================================
# Checkpoint 12: Demo / Live AI mode, rate limits, and fallback test suite
# =========================================================================


def test_chat_demo_mode_serves_prewritten_explanations():
    """Step 1: In Demo mode, show pre-written explanations. No network call is made."""
    res = client.post(
        "/api/v1/chat",
        json={"message": "Tell me about MUDRA loans", "mode": "demo"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["mode_used"] == "demo"
    assert data["fallback_reason"] is None
    assert "MUDRA" in data["reply"] or "Shishu" in data["reply"]
    assert "legal_disclaimer" in data
    assert "credit approval" in data["legal_disclaimer"]


def test_chat_live_mode_without_api_key_serves_fallback(monkeypatch):
    """Step 2 & 6: In Live mode without API key, show the demo answer and explain why."""
    from app.core.config import settings

    monkeypatch.setattr(settings, "LLM_API_KEY", None)
    monkeypatch.setattr(settings, "GEMINI_API_KEY", None)
    monkeypatch.setattr(settings, "OPENAI_API_KEY", None)

    res = client.post(
        "/api/v1/chat",
        json={"message": "Tell me about PMEGP subsidy", "mode": "live"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["mode_used"] == "fallback"
    assert "No external AI API key configured" in data["fallback_reason"]
    # Verified demo answer is returned seamlessly
    assert "PMEGP" in data["reply"]
    assert len(data["sources"]) > 0


def test_chat_live_mode_api_failure_serves_fallback(monkeypatch):
    """Step 2 & 6: In Live mode when API fails/times out, show demo answer and explain why."""
    import app.services.ai_service as ai_service
    from app.core.config import settings

    # Simulate presence of API key but API network call fails
    monkeypatch.setattr(settings, "LLM_PROVIDER", "gemini")
    monkeypatch.setattr(settings, "LLM_API_KEY", "dummy_test_key_12345")
    monkeypatch.setattr(
        ai_service,
        "call_llm_service",
        lambda prompt, system_prompt="": (None, "HTTP 503: Service Temporarily Unavailable"),
    )

    res = client.post(
        "/api/v1/chat",
        json={"message": "Explain Banglashree MSME scheme", "mode": "live"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["mode_used"] == "fallback"
    assert "HTTP 503" in data["fallback_reason"]
    assert "Banglashree" in data["reply"]


def test_chat_rate_limit_reached_serves_fallback_no_raw_error():
    """Step 4 & 6: When rate limit is reached, show fallback. No route shows a raw error."""
    from app.routes.chat import chat_rate_limiter

    chat_rate_limiter.reset()
    headers = {"X-RateLimit-Test": "1"}

    # Exhaust rate limiter allowance
    limit = chat_rate_limiter.times
    for _ in range(limit):
        res = client.post(
            "/api/v1/chat",
            json={"message": "Rate limit test message", "mode": "demo"},
            headers=headers,
        )
        assert res.status_code == 200

    # Next request exceeds rate limit: MUST RETURN 200 with fallback, NEVER a raw 429
    res_exceeded = client.post(
        "/api/v1/chat",
        json={"message": "One request too many", "mode": "demo"},
        headers=headers,
    )
    assert res_exceeded.status_code == 200
    data = res_exceeded.json()
    assert data["mode_used"] == "fallback"
    assert "Rate limit reached" in data["fallback_reason"]
    assert len(data["reply"]) > 0

    # Cleanup rate limiter
    chat_rate_limiter.reset()


def test_chat_legal_disclaimer_present_on_all_responses():
    """Step 5: Add a disclaimer if AI answers could be wrong or mistaken for legal advice."""
    res = client.post(
        "/api/v1/chat",
        json={"message": "Can I get an instant ₹10 Lakh sanction?"},
    )
    assert res.status_code == 200
    data = res.json()
    assert "legal_disclaimer" in data
    assert "Disclaimer:" in data["legal_disclaimer"]
    assert "legal, tax, or formal credit approval" in data["legal_disclaimer"]
