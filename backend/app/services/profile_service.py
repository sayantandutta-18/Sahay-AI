"""Business profile operations."""

from typing import Optional
from sqlalchemy.orm import Session
from app.models.business_profile import BusinessProfile
from app.schemas.business_profile import BusinessProfileUpdate, calculate_profile_completion


def get_profile_by_user_id(db: Session, user_id: str) -> Optional[BusinessProfile]:
    """Retrieve business profile for given user."""
    profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == user_id).first()
    if not profile:
        profile = BusinessProfile(user_id=user_id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


def update_business_profile(
    db: Session, user_id: str, profile_update: BusinessProfileUpdate
) -> BusinessProfile:
    """Update profile attributes and recalculate completion percentage."""
    profile = get_profile_by_user_id(db, user_id)
    update_data = profile_update.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(profile, field, value)

    # Convert current profile into dict to compute completion percentage
    current_data = {
        "business_name": profile.business_name,
        "business_type": profile.business_type,
        "category": profile.category,
        "annual_turnover": profile.annual_turnover,
        "monthly_revenue": profile.monthly_revenue,
        "monthly_expense": profile.monthly_expense,
        "gender": profile.gender,
        "has_pan": profile.has_pan,
        "has_bank_account": profile.has_bank_account,
        "has_udyam": profile.has_udyam,
    }
    profile.completion_percentage = calculate_profile_completion(current_data)

    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile
