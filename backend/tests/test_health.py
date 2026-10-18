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


def test_cors_deployed_vercel_origin():
    """Verify that deployed Vercel frontend origin receives valid CORS headers on GET and OPTIONS."""
    vercel_origin = "https://sahay-ai-git-main-sayantandutta444-6280.vercel.app"
    
    # Preflight OPTIONS
    options_res = client.options(
        "/health",
        headers={
            "Origin": vercel_origin,
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "authorization,content-type",
        },
    )
    assert options_res.status_code == 200
    assert options_res.headers.get("access-control-allow-origin") == vercel_origin
    assert "GET" in options_res.headers.get("access-control-allow-methods", "")

    # Actual GET
    get_res = client.get("/health", headers={"Origin": vercel_origin})
    assert get_res.status_code == 200
    assert get_res.headers.get("access-control-allow-origin") == vercel_origin


def test_cors_vercel_preview_regex():
    """Verify that dynamic Vercel branch/preview deployments match CORS regex."""
    preview_origin = "https://sahay-ai-preview-feature-42.vercel.app"
    options_res = client.options(
        "/health",
        headers={
            "Origin": preview_origin,
            "Access-Control-Request-Method": "GET",
        },
    )
    assert options_res.status_code == 200
    assert options_res.headers.get("access-control-allow-origin") == preview_origin


def test_cors_disallowed_origin_rejected():
    """Verify that untrusted origins are strictly blocked with 400 without allow-origin header."""
    untrusted_origin = "https://malicious-phishing-site.example.com"
    options_res = client.options(
        "/health",
        headers={
            "Origin": untrusted_origin,
            "Access-Control-Request-Method": "GET",
        },
    )
    assert options_res.status_code == 400
    assert "access-control-allow-origin" not in options_res.headers


def test_database_health_fields():
    """Verify that health endpoint reports separated database metadata."""
    response = client.get("/health")
    assert response.status_code == 200
    db_data = response.json().get("database", {})
    assert "status" in db_data
    assert "dialect" in db_data
    assert "table_count" in db_data
    assert "latency_ms" in db_data
    assert isinstance(db_data["table_count"], int)
    assert db_data["table_count"] > 0


def test_database_disconnected_degraded_status(monkeypatch):
    """Verify that when database is disconnected, API reports degraded status gracefully without crashing."""
    from app.routes import health as health_route_module

    def mock_broken_db():
        return {
            "status": "disconnected",
            "error": "OperationalError: connection to server lost",
            "dialect": "postgresql",
        }

    monkeypatch.setattr(health_route_module, "check_db_health", mock_broken_db)
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "degraded"
    assert data["database"]["status"] == "disconnected"
    assert "connection to server lost" in data["database"]["error"]


def test_security_jwt_roundtrip():
    """Verify JWT access token creation and decoding."""
    token = create_access_token("user_123", claims={"role": "entrepreneur"})
    payload = decode_access_token(token)
    assert payload is not None
    assert payload["sub"] == "user_123"
    assert payload["role"] == "entrepreneur"
    assert "exp" in payload
