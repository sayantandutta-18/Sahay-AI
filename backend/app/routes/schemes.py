"""Government scheme library routes."""

import time
from typing import Any, Dict, List, Optional, Tuple
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.scheme import SchemeResponse
from app.services.scheme_service import (
    get_all_schemes,
    get_scheme_by_id,
    get_scheme_by_slug,
)


class SchemeCache:
    """Thread-safe in-memory cache with 60-second TTL for scheme queries."""

    def __init__(self, ttl_seconds: int = 60):
        self.ttl = ttl_seconds
        self._cache: Dict[str, Tuple[float, Any]] = {}

    def get(self, key: str) -> Optional[Any]:
        if key in self._cache:
            ts, val = self._cache[key]
            if time.time() - ts < self.ttl:
                return val
            del self._cache[key]
        return None

    def set(self, key: str, val: Any) -> None:
        self._cache[key] = (time.time(), val)

    def invalidate(self) -> None:
        """Clear all cached scheme query results."""
        self._cache.clear()


schemes_cache = SchemeCache(ttl_seconds=60)

router = APIRouter(prefix="/schemes", tags=["Schemes"])


@router.get("", response_model=List[SchemeResponse])
def list_schemes(
    scheme_type: Optional[str] = Query(None, description="subsidy, loan, grant"),
    state: Optional[str] = Query(None, description="State name filter e.g. 'West Bengal'"),
    search: Optional[str] = Query(None, description="Search keyword in scheme name or description"),
    db: Session = Depends(get_db),
):
    """Retrieve verified government schemes matching optional filters with 60s in-memory caching."""
    cache_key = f"{scheme_type}:{state}:{search}"
    cached = schemes_cache.get(cache_key)
    if cached is not None:
        return cached

    schemes = get_all_schemes(db, scheme_type=scheme_type, state=state, search=search)
    result = [SchemeResponse.model_validate(s) for s in schemes]
    schemes_cache.set(cache_key, result)
    return result


@router.get("/{scheme_id}", response_model=SchemeResponse)
def get_scheme(scheme_id: str, db: Session = Depends(get_db)):
    """Retrieve details, official URL, and document checklist for a specific scheme."""
    scheme = get_scheme_by_id(db, scheme_id)
    if not scheme:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scheme with ID '{scheme_id}' not found",
        )
    return SchemeResponse.model_validate(scheme)


@router.get("/slug/{slug}", response_model=SchemeResponse)
def get_scheme_by_unique_slug(slug: str, db: Session = Depends(get_db)):
    """Retrieve scheme by unique URL slug."""
    scheme = get_scheme_by_slug(db, slug)
    if not scheme:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scheme with slug '{slug}' not found",
        )
    return SchemeResponse.model_validate(scheme)
