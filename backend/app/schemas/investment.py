"""Pydantic schemas for Investment and Risk Profile."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class FinancialProfileBase(BaseModel):
    investment_goal: str = Field(
        default="wealth_accumulation",
        description="wealth_accumulation, emergency_fund, retirement, business_cushion",
    )
    monthly_investible_surplus: float = Field(default=5000.0, ge=0.0)
    time_horizon_years: int = Field(default=5, ge=1, le=50)
    risk_tolerance: str = Field(
        default="moderate",
        description="conservative, moderate, aggressive, capital_preservation",
    )
    market_experience: str = Field(
        default="beginner", description="beginner, intermediate, advanced"
    )
    liquidity_needs: str = Field(default="medium", description="high, medium, low")
    disclosures_acknowledged: bool = Field(default=True)


class FinancialProfileCreate(FinancialProfileBase):
    pass


class FinancialProfileResponse(FinancialProfileBase):
    id: str
    user_id: str
    calculated_risk_score: int
    risk_category: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


def calculate_risk_profile(
    risk_tolerance: str,
    time_horizon_years: int,
    market_experience: str,
    liquidity_needs: str,
) -> tuple[int, str]:
    """Deterministic formula calculating investor risk score (0-100) and profile classification."""
    score = 0

    # Risk tolerance component (0-40)
    if risk_tolerance == "aggressive":
        score += 40
    elif risk_tolerance == "moderate":
        score += 25
    elif risk_tolerance == "conservative":
        score += 15
    else:  # capital_preservation
        score += 5

    # Horizon component (0-30)
    if time_horizon_years >= 10:
        score += 30
    elif time_horizon_years >= 5:
        score += 20
    elif time_horizon_years >= 3:
        score += 12
    else:
        score += 5

    # Experience component (0-20)
    if market_experience == "advanced":
        score += 20
    elif market_experience == "intermediate":
        score += 12
    else:
        score += 5

    # Liquidity needs component (0-10)
    if liquidity_needs == "low":
        score += 10
    elif liquidity_needs == "medium":
        score += 5
    else:
        score += 2

    # Classification
    if score >= 75:
        category = "High Growth / Dynamic"
    elif score >= 50:
        category = "Balanced Growth"
    elif score >= 30:
        category = "Conservative Income"
    else:
        category = "Capital Preservation"

    return score, category
