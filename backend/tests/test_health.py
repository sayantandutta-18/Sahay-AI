"""Tests for system health endpoints, CORS, and core utilities."""

from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token, decode_access_token

client = TestClient(app)


def test_root_endpoint():
    """Verify that root endpoint returns service information and docs link."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["project"] == "Sahay-AI"
    assert data["status"] == "online"
    assert "docs" in data


def test_health_endpoint():
    """Verify that GET /health returns valid schema and healthy status."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["project"] == "Sahay-AI"
    assert data["status"] == "healthy"
    assert data["database"]["status"] == "connected"
    assert "timestamp" in data
    assert "version" in data


def test_api_v1_health_endpoint():
    """Verify that GET /api/v1/health returns valid schema matching /health."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"]["status"] == "connected"


def test_cors_headers():
    """Verify that CORS middleware respects configured origins."""
    headers = {"Origin": "http://localhost:3000"}
    response = client.get("/health", headers=headers)
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"


def test_security_jwt_roundtrip():
    """Verify JWT access token creation and decoding."""
    token = create_access_token("user_123", claims={"role": "entrepreneur"})
    payload = decode_access_token(token)
    assert payload is not None
    assert payload["sub"] == "user_123"
    assert payload["role"] == "entrepreneur"
    assert "exp" in payload
