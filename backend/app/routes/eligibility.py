"""Deterministic Eligibility Engine endpoints."""

from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.routes.auth import get_current_user
from app.models.user import User
from app.schemas.eligibility import (
    EligibilityCheckRequest,
    EligibilitySummaryResponse,
)
from app.services.profile_service import get_profile_by_user_id
from app.services.eligibility_service import evaluate_all_schemes_for_profile

from app.core.rate_limit import InMemoryRateLimiter

router = APIRouter(prefix="/eligibility", tags=["Eligibility Engine"])
eligibility_rate_limiter = InMemoryRateLimiter(times=60, seconds=60)


@router.post(
    "/check",
    response_model=EligibilitySummaryResponse,
    dependencies=[Depends(eligibility_rate_limiter)],
)
def check_eligibility_criteria(
    criteria: Optional[EligibilityCheckRequest] = None,
    db: Session = Depends(get_db),
):
    """Evaluate eligibility against provided criteria without requiring login."""
    profile_dict = criteria.model_dump(exclude_unset=True) if criteria else {}
    return evaluate_all_schemes_for_profile(db, profile_dict)


@router.get("/my-matches", response_model=EligibilitySummaryResponse)
def get_user_matches(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Evaluate eligibility using the authenticated entrepreneur's profile."""
    business_profile = get_profile_by_user_id(db, current_user.id)

    profile_dict = {
        "state": current_user.state,
        "district": current_user.district,
        "business_name": business_profile.business_name,
        "business_type": business_profile.business_type,
        "category": business_profile.category,
        "annual_turnover": business_profile.annual_turnover,
        "monthly_revenue": business_profile.monthly_revenue,
        "monthly_expense": business_profile.monthly_expense,
        "gender": business_profile.gender,
        "caste_category": business_profile.caste_category,
        "has_udyam": business_profile.has_udyam,
        "has_gst": business_profile.has_gst,
        "has_pan": business_profile.has_pan,
        "has_bank_account": business_profile.has_bank_account,
        "months_in_operation": business_profile.months_in_operation,
    }

    return evaluate_all_schemes_for_profile(db, profile_dict)
