"""Pytest configuration and test database fixtures."""

import pytest
from app.database.session import engine, SessionLocal
from app.database.base import Base
import app.models  # Register models
from app.services.scheme_service import seed_verified_schemes_if_empty
from app.services.academy_service import seed_academy_content_if_empty


@pytest.fixture(autouse=True, scope="session")
def setup_test_database():
    """Ensure clean tables and verified initial scheme records exist before running tests."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_verified_schemes_if_empty(db)
        seed_academy_content_if_empty(db)
    yield
    # Teardown
    Base.metadata.drop_all(bind=engine)
