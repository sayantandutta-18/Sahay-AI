"""User profile and business parameters routes."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.routes.auth import get_current_user
from app.models.user import User
from app.schemas.user import UserResponse
from app.schemas.business_profile import (
    BusinessProfileResponse,
    BusinessProfileUpdate,
)
from app.services.profile_service import (
    get_profile_by_user_id,
    update_business_profile,
)

router = APIRouter(tags=["Profiles"])


@router.get("/profile", response_model=UserResponse)
def get_user_profile(current_user: User = Depends(get_current_user)):
    """Retrieve personal and regional details of authenticated user."""
    return UserResponse.model_validate(current_user)


@router.put("/profile", response_model=UserResponse)
def update_user_profile(
    state: str = None,
    district: str = None,
    language: str = None,
    name: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update personal demographic parameters."""
    if state is not None:
        current_user.state = state
    if district is not None:
        current_user.district = district
    if language is not None:
        current_user.language = language
    if name is not None:
        current_user.name = name

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)


@router.get("/business-profile", response_model=BusinessProfileResponse)
def get_business_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve micro-enterprise operational parameters and completion percentage."""
    profile = get_profile_by_user_id(db, current_user.id)
    return BusinessProfileResponse.model_validate(profile)


@router.put("/business-profile", response_model=BusinessProfileResponse)
def modify_business_profile(
    profile_in: BusinessProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update enterprise parameters and recalculate completion score."""
    updated = update_business_profile(db, current_user.id, profile_in)
    return BusinessProfileResponse.model_validate(updated)
