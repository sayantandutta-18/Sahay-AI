"""Watchlist and Paper Portfolio services with deterministic P&L and allocation math."""

from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.portfolio import WatchlistItem, PaperPortfolioHolding, PaperTransaction
from app.schemas.portfolio import (
    WatchlistAddRequest,
    WatchlistItemResponse,
    PaperHoldingResponse,
    PaperPortfolioSummaryResponse,
    PaperOrderRequest,
)
from app.services.market_service import get_market_quote


def get_user_watchlist(db: Session, user_id: str) -> List[WatchlistItemResponse]:
    """Retrieve all watchlisted items for user with real-time quote attached."""
    items = db.query(WatchlistItem).filter(WatchlistItem.user_id == user_id).all()
    results = []
    for item in items:
        quote = get_market_quote(item.ticker)
        current_price = quote.current_price if quote else 0.0
        results.append(
            WatchlistItemResponse(
                id=item.id,
                ticker=item.ticker,
                name=item.name,
                asset_class=item.asset_class,
                exchange=item.exchange,
                current_price=current_price,
                created_at=item.created_at,
            )
        )
    return results


def add_to_watchlist(db: Session, user_id: str, request: WatchlistAddRequest) -> WatchlistItem:
    """Add a ticker to user's watchlist."""
    ticker = request.ticker.upper().strip()
    existing = (
        db.query(WatchlistItem)
        .filter(WatchlistItem.user_id == user_id, WatchlistItem.ticker == ticker)
        .first()
    )
    if existing:
        return existing

    quote = get_market_quote(ticker)
    name = request.name or (quote.name if quote else ticker)
    asset_class = quote.asset_class if quote else request.asset_class

    item = WatchlistItem(
        user_id=user_id,
        ticker=ticker,
        name=name,
        asset_class=asset_class,
        exchange=request.exchange or "NSE",
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def remove_from_watchlist(db: Session, user_id: str, ticker: str) -> bool:
    """Remove a ticker from user's watchlist."""
    symbol = ticker.upper().strip()
    item = (
        db.query(WatchlistItem)
        .filter(WatchlistItem.user_id == user_id, WatchlistItem.ticker == symbol)
        .first()
    )
    if not item:
        return False
    db.delete(item)
    db.commit()
    return True


def execute_paper_order(
    db: Session, user_id: str, order: PaperOrderRequest
) -> PaperHoldingResponse:
    """Execute a simulated buy or sell order using verified market prices."""
    symbol = order.ticker.upper().strip()
    quote = get_market_quote(symbol)
    if not quote:
        raise ValueError(f"Ticker '{symbol}' not found in verified market data adapter")

    current_price = quote.current_price
    holding = (
        db.query(PaperPortfolioHolding)
        .filter(PaperPortfolioHolding.user_id == user_id, PaperPortfolioHolding.ticker == symbol)
        .first()
    )

    if order.transaction_type.upper() == "BUY":
        if not holding:
            holding = PaperPortfolioHolding(
                user_id=user_id,
                ticker=symbol,
                name=quote.name,
                asset_class=quote.asset_class,
                quantity=order.quantity,
                average_buy_price=current_price,
            )
            db.add(holding)
        else:
            # Weighted average price update: ((old_qty * old_avg) + (new_qty * new_price)) / total_qty
            total_qty = holding.quantity + order.quantity
            total_cost = (holding.quantity * holding.average_buy_price) + (order.quantity * current_price)
            holding.average_buy_price = round(total_cost / total_qty, 2)
            holding.quantity = total_qty
            db.add(holding)

    elif order.transaction_type.upper() == "SELL":
        if not holding or holding.quantity < order.quantity:
            raise ValueError(
                f"Insufficient holding quantity. Current: {holding.quantity if holding else 0}, Requested: {order.quantity}"
            )
        holding.quantity -= order.quantity
        if holding.quantity == 0:
            db.delete(holding)
        else:
            db.add(holding)
    else:
        raise ValueError(f"Invalid transaction type: '{order.transaction_type}'")

    # Record simulated audit transaction
    tx = PaperTransaction(
        user_id=user_id,
        ticker=symbol,
        transaction_type=order.transaction_type.upper(),
        quantity=order.quantity,
        executed_price=current_price,
        total_amount=round(order.quantity * current_price, 2),
    )
    db.add(tx)
    db.commit()

    if holding and holding.quantity > 0:
        db.refresh(holding)
        total_inv = round(holding.quantity * holding.average_buy_price, 2)
        curr_val = round(holding.quantity * current_price, 2)
        pnl = round(curr_val - total_inv, 2)
        pnl_pct = round((pnl / total_inv) * 100.0, 2) if total_inv > 0 else 0.0

        return PaperHoldingResponse(
            id=holding.id,
            ticker=holding.ticker,
            name=holding.name,
            asset_class=holding.asset_class,
            quantity=holding.quantity,
            average_buy_price=holding.average_buy_price,
            current_price=current_price,
            total_invested=total_inv,
            current_value=curr_val,
            unrealized_pnl=pnl,
            pnl_percentage=pnl_pct,
            allocation_percentage=100.0,
        )
    else:
        # Zero position after full sell
        return PaperHoldingResponse(
            id="closed",
            ticker=symbol,
            name=quote.name,
            asset_class=quote.asset_class,
            quantity=0,
            average_buy_price=0.0,
            current_price=current_price,
            total_invested=0.0,
            current_value=0.0,
            unrealized_pnl=0.0,
            pnl_percentage=0.0,
            allocation_percentage=0.0,
        )


def get_user_paper_portfolio(db: Session, user_id: str) -> PaperPortfolioSummaryResponse:
    """Calculate deterministic portfolio summary with P&L and asset allocation weights."""
    holdings = (
        db.query(PaperPortfolioHolding)
        .filter(PaperPortfolioHolding.user_id == user_id, PaperPortfolioHolding.quantity > 0)
        .all()
    )

    items_res: List[PaperHoldingResponse] = []
    total_portfolio_invested = 0.0
    total_portfolio_current = 0.0

    for h in holdings:
        quote = get_market_quote(h.ticker)
        current_price = quote.current_price if quote else h.average_buy_price
        holding_invested = round(h.quantity * h.average_buy_price, 2)
        holding_current = round(h.quantity * current_price, 2)
        holding_pnl = round(holding_current - holding_invested, 2)
        holding_pnl_pct = round((holding_pnl / holding_invested) * 100.0, 2) if holding_invested > 0 else 0.0

        total_portfolio_invested += holding_invested
        total_portfolio_current += holding_current

        items_res.append(
            PaperHoldingResponse(
                id=h.id,
                ticker=h.ticker,
                name=h.name,
                asset_class=h.asset_class,
                quantity=h.quantity,
                average_buy_price=h.average_buy_price,
                current_price=current_price,
                total_invested=holding_invested,
                current_value=holding_current,
                unrealized_pnl=holding_pnl,
                pnl_percentage=holding_pnl_pct,
                allocation_percentage=0.0,  # Will compute below
            )
        )

    # Compute percentage asset allocations
    total_pnl = round(total_portfolio_current - total_portfolio_invested, 2)
    pnl_pct = round((total_pnl / total_portfolio_invested) * 100.0, 2) if total_portfolio_invested > 0 else 0.0

    for item in items_res:
        if total_portfolio_current > 0:
            item.allocation_percentage = round((item.current_value / total_portfolio_current) * 100.0, 1)

    return PaperPortfolioSummaryResponse(
        total_invested=round(total_portfolio_invested, 2),
        current_value=round(total_portfolio_current, 2),
        total_pnl=total_pnl,
        pnl_percentage=pnl_pct,
        holdings_count=len(items_res),
        as_of_timestamp=datetime.now(timezone.utc).isoformat(),
        holdings=items_res,
    )
