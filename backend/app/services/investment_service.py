"""Investment financial profile and deterministic risk assessment service."""

from typing import Optional
from sqlalchemy.orm import Session
from app.models.investment import FinancialProfile
from app.schemas.investment import FinancialProfileCreate, calculate_risk_profile


def get_financial_profile_by_user_id(db: Session, user_id: str) -> Optional[FinancialProfile]:
    """Retrieve financial risk profile for authenticated user."""
    return db.query(FinancialProfile).filter(FinancialProfile.user_id == user_id).first()


def save_financial_profile(
    db: Session, user_id: str, profile_in: FinancialProfileCreate
) -> FinancialProfile:
    """Save user financial parameters and calculate deterministic risk score."""
    score, category = calculate_risk_profile(
        risk_tolerance=profile_in.risk_tolerance,
        time_horizon_years=profile_in.time_horizon_years,
        market_experience=profile_in.market_experience,
        liquidity_needs=profile_in.liquidity_needs,
    )

    profile = get_financial_profile_by_user_id(db, user_id)
    if not profile:
        profile = FinancialProfile(
            user_id=user_id,
            investment_goal=profile_in.investment_goal,
            monthly_investible_surplus=profile_in.monthly_investible_surplus,
            time_horizon_years=profile_in.time_horizon_years,
            risk_tolerance=profile_in.risk_tolerance,
            market_experience=profile_in.market_experience,
            liquidity_needs=profile_in.liquidity_needs,
            calculated_risk_score=score,
            risk_category=category,
            disclosures_acknowledged=profile_in.disclosures_acknowledged,
        )
        db.add(profile)
    else:
        profile.investment_goal = profile_in.investment_goal
        profile.monthly_investible_surplus = profile_in.monthly_investible_surplus
        profile.time_horizon_years = profile_in.time_horizon_years
        profile.risk_tolerance = profile_in.risk_tolerance
        profile.market_experience = profile_in.market_experience
        profile.liquidity_needs = profile_in.liquidity_needs
        profile.calculated_risk_score = score
        profile.risk_category = category
        profile.disclosures_acknowledged = profile_in.disclosures_acknowledged
        db.add(profile)

    db.commit()
    db.refresh(profile)
    return profile
