"""Phase 3 Rate Limiting & Brute-Force Protection Tests.

Verifies:
1. Burst requests to /api/v1/auth/login from a client IP are throttled with 429 Too Many Requests.
2. 429 response includes Retry-After header.
3. Account-level brute-force lockout triggers after repeated failed login attempts on a phone number.
4. Successful authentication resets the failed attempts counter.
5. Rate limiters and lockout managers can be reset cleanly.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.routes.auth import login_rate_limiter, brute_force_protector

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_limiters():
    """Reset rate limiting and lockout state before each test."""
    login_rate_limiter.reset()
    brute_force_protector.reset()
    yield
    login_rate_limiter.reset()
    brute_force_protector.reset()


def test_login_rate_limiting_throttles_burst_traffic():
    """Verify exceeding IP request threshold on /login returns 429 with Retry-After."""
    # Use dedicated test IP with X-RateLimit-Test header
    test_ip = "198.51.100.99"
    headers = {
        "X-Forwarded-For": test_ip,
        "X-RateLimit-Test": "1",
    }

    # Temporarily set a tight threshold for testing
    original_times = login_rate_limiter.times
    login_rate_limiter.times = 3

    try:
        # 3 requests within threshold
        for _ in range(3):
            res = client.post(
                "/api/v1/auth/login",
                json={"phone": "9990001111", "password": "wrong_password"},
                headers=headers,
            )
            # Should fail auth (401), not throttled yet
            assert res.status_code == 401

        # 4th request must be throttled with 429
        throttled_res = client.post(
            "/api/v1/auth/login",
            json={"phone": "9990001111", "password": "wrong_password"},
            headers=headers,
        )
        assert throttled_res.status_code == 429
        assert "Rate limit exceeded" in throttled_res.json()["detail"]
        assert "Retry-After" in throttled_res.headers
        assert int(throttled_res.headers["Retry-After"]) >= 1

    finally:
        login_rate_limiter.times = original_times


def test_account_lockout_after_repeated_failed_attempts():
    """Verify consecutive failed attempts on an account trigger 429 lockout."""
    phone = "9777777771"
    # Register genuine user
    client.post(
        "/api/v1/auth/register",
        json={"phone": phone, "name": "Target Account", "password": "CorrectPassword123!"},
    )

    # Use rotating IPs to simulate distributed attack against one phone number
    original_max = brute_force_protector.max_attempts
    brute_force_protector.max_attempts = 4

    try:
        for i in range(4):
            headers = {
                "X-Forwarded-For": f"192.0.2.{i + 1}",
                "X-RateLimit-Test": "1",
            }
            res = client.post(
                "/api/v1/auth/login",
                json={"phone": phone, "password": "wrong_password"},
                headers=headers,
            )
            assert res.status_code == 401

        # 5th attempt with another IP must be locked out at the account level
        headers_attack = {
            "X-Forwarded-For": "192.0.2.100",
            "X-RateLimit-Test": "1",
        }
        lock_res = client.post(
            "/api/v1/auth/login",
            json={"phone": phone, "password": "wrong_password"},
            headers=headers_attack,
        )
        assert lock_res.status_code == 429
        assert "Account temporarily locked" in lock_res.json()["detail"]
        assert "Retry-After" in lock_res.headers

    finally:
        brute_force_protector.max_attempts = original_max


def test_successful_login_resets_failed_attempt_counter():
    """Verify successful login resets failure counter before lockout threshold is reached."""
    phone = "9777777772"
    client.post(
        "/api/v1/auth/register",
        json={"phone": phone, "name": "Cautious User", "password": "CorrectPassword123!"},
    )

    original_max = brute_force_protector.max_attempts
    brute_force_protector.max_attempts = 4

    try:
        # 2 failed attempts
        for i in range(2):
            headers = {"X-Forwarded-For": f"192.0.2.{10 + i}", "X-RateLimit-Test": "1"}
            res = client.post(
                "/api/v1/auth/login",
                json={"phone": phone, "password": "wrong_password"},
                headers=headers,
            )
            assert res.status_code == 401

        # Successful login resets the counter
        succ_res = client.post(
            "/api/v1/auth/login",
            json={"phone": phone, "password": "CorrectPassword123!"},
            headers={"X-Forwarded-For": "192.0.2.50", "X-RateLimit-Test": "1"},
        )
        assert succ_res.status_code == 200
        assert "access_token" in succ_res.json()

        # 2 more failed attempts should not trigger lockout because counter was reset
        for i in range(2):
            headers = {"X-Forwarded-For": f"192.0.2.{20 + i}", "X-RateLimit-Test": "1"}
            res = client.post(
                "/api/v1/auth/login",
                json={"phone": phone, "password": "wrong_password"},
                headers=headers,
            )
            assert res.status_code == 401

    finally:
        brute_force_protector.max_attempts = original_max
