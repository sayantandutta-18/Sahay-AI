"""Investment profile and market reference routes."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.routes.auth import get_current_user
from app.models.user import User
from app.schemas.investment import (
    FinancialProfileCreate,
    FinancialProfileResponse,
)
from app.schemas.portfolio import MarketQuoteResponse
from app.services.investment_service import (
    get_financial_profile_by_user_id,
    save_financial_profile,
)
from app.services.market_service import get_benchmark_quotes, get_market_quote

router = APIRouter(prefix="/investment", tags=["Investment Profile & Market Data"])


@router.get("/profile", response_model=FinancialProfileResponse)
def get_user_investment_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve financial risk profile and calculated score for authenticated user."""
    profile = get_financial_profile_by_user_id(db, current_user.id)
    if not profile:
        # Return default balanced profile
        default_create = FinancialProfileCreate(
            investment_goal="wealth_accumulation",
            monthly_investible_surplus=5000.0,
            time_horizon_years=5,
            risk_tolerance="moderate",
            market_experience="beginner",
            liquidity_needs="medium",
        )
        profile = save_financial_profile(db, current_user.id, default_create)
    return FinancialProfileResponse.model_validate(profile)


@router.post("/profile", response_model=FinancialProfileResponse)
def update_user_investment_profile(
    profile_in: FinancialProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Save risk questionnaire answers and recalculate deterministic risk score."""
    profile = save_financial_profile(db, current_user.id, profile_in)
    return FinancialProfileResponse.model_validate(profile)


@router.get("/benchmarks", response_model=List[MarketQuoteResponse])
def list_benchmark_indices():
    """Retrieve verified benchmark instrument quotes with exchange timestamps."""
    return get_benchmark_quotes()


@router.get("/quote/{ticker}", response_model=MarketQuoteResponse)
def get_quote_for_ticker(ticker: str):
    """Retrieve single verified quote with timestamp and provider error handling."""
    quote = get_market_quote(ticker)
    if not quote:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticker '{ticker}' not found in verified market data adapter",
        )
    return quote
