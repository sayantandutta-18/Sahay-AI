"""Watchlist and Paper Portfolio routes with deterministic calculations."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.routes.auth import get_current_user
from app.models.user import User
from app.schemas.portfolio import (
    WatchlistAddRequest,
    WatchlistItemResponse,
    PaperOrderRequest,
    PaperHoldingResponse,
    PaperPortfolioSummaryResponse,
)
from app.services.portfolio_service import (
    get_user_watchlist,
    add_to_watchlist,
    remove_from_watchlist,
    execute_paper_order,
    get_user_paper_portfolio,
)

router = APIRouter(prefix="/portfolio", tags=["Watchlist & Paper Portfolio"])


@router.get("/watchlist", response_model=List[WatchlistItemResponse])
def get_watchlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve all watchlisted assets for user."""
    return get_user_watchlist(db, current_user.id)


@router.post("/watchlist", response_model=WatchlistItemResponse, status_code=status.HTTP_201_CREATED)
def add_item_to_watchlist(
    request: WatchlistAddRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add a new ticker to user's observation watchlist."""
    item = add_to_watchlist(db, current_user.id, request)
    return WatchlistItemResponse.model_validate(item)


@router.delete("/watchlist/{ticker}", status_code=status.HTTP_204_NO_CONTENT)
def delete_from_watchlist(
    ticker: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Remove asset from watchlist."""
    removed = remove_from_watchlist(db, current_user.id, ticker)
    if not removed:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Ticker '{ticker}' not on watchlist")
    return None


@router.get("", response_model=PaperPortfolioSummaryResponse)
def get_paper_portfolio(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve user paper portfolio with deterministic P&L and asset allocation percentages."""
    return get_user_paper_portfolio(db, current_user.id)


@router.post("/order", response_model=PaperHoldingResponse)
def place_paper_order(
    order: PaperOrderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Simulate execution of buy or sell trade at verified current market price."""
    try:
        return execute_paper_order(db, current_user.id, order)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
