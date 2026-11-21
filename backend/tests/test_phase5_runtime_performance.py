"""Phase 5 Production Runtime & Performance Tests."""

from pathlib import Path
from unittest.mock import patch
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.routes.schemes import schemes_cache, SchemeCache

client = TestClient(app)


def test_requirements_includes_gunicorn():
    """Verify that gunicorn is included in backend/requirements.txt for Linux production multi-worker deployment."""
    req_path = Path(__file__).resolve().parent.parent / "requirements.txt"
    assert req_path.exists()
    content = req_path.read_text(encoding="utf-8")
    assert "gunicorn" in content


def test_render_yaml_runtime_configuration():
    """Verify that render.yaml uses gunicorn with uvicorn workers and 120min token expiry."""
    render_path = Path(__file__).resolve().parent.parent.parent / "render.yaml"
    assert render_path.exists()
    content = render_path.read_text(encoding="utf-8")
    assert "gunicorn app.main:app -k uvicorn.workers.UvicornWorker" in content
    assert 'value: "120"' in content


def test_health_check_status_code_on_database_failure():
    """Verify /health returns 200 when database is healthy, and 503 when disconnected."""
    # Healthy case
    res_healthy = client.get("/health")
    assert res_healthy.status_code == 200
    assert res_healthy.json()["status"] == "healthy"

    # Degraded/disconnected case
    with patch("app.routes.health.check_db_health", return_value={"status": "disconnected", "error": "Connection refused"}):
        res_unhealthy = client.get("/health")
        assert res_unhealthy.status_code == 503
        data = res_unhealthy.json()
        assert data["status"] == "degraded"
        assert data["database"]["status"] == "disconnected"


def test_schemes_in_memory_caching_and_invalidation():
    """Verify schemes endpoint caches results with 60s TTL and cache can be invalidated."""
    schemes_cache.invalidate()

    res1 = client.get("/api/v1/schemes")
    assert res1.status_code == 200
    data1 = res1.json()

    # Second request should be returned from cache
    cache_key = "None:None:None"
    cached_val = schemes_cache.get(cache_key)
    assert cached_val is not None
    assert len(cached_val) == len(data1)

    # Invalidate cache
    schemes_cache.invalidate()
    assert schemes_cache.get(cache_key) is None
