"""Pydantic schemas for Market Data and Paper Portfolio."""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class MarketQuoteResponse(BaseModel):
    ticker: str
    name: str
    current_price: float
    currency: str = "INR"
    exchange: str = "NSE"
    asset_class: str = "etf"
    last_updated_at: str
    is_stale: bool = False
    provider: str = "Sahay Verified Benchmark Adapter"


class WatchlistAddRequest(BaseModel):
    ticker: str = Field(..., max_length=30)
    name: Optional[str] = None
    asset_class: Optional[str] = "etf"
    exchange: Optional[str] = "NSE"


class WatchlistItemResponse(BaseModel):
    id: str
    ticker: str
    name: str
    asset_class: str
    exchange: str
    current_price: float = 0.0
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaperOrderRequest(BaseModel):
    ticker: str = Field(..., max_length=30)
    transaction_type: str = Field(..., description="BUY or SELL")
    quantity: int = Field(..., gt=0, le=100000)


class PaperHoldingResponse(BaseModel):
    id: str
    ticker: str
    name: str
    asset_class: str
    quantity: int
    average_buy_price: float
    current_price: float
    total_invested: float
    current_value: float
    unrealized_pnl: float
    pnl_percentage: float
    allocation_percentage: float


class PaperPortfolioSummaryResponse(BaseModel):
    total_invested: float
    current_value: float
    total_pnl: float
    pnl_percentage: float
    holdings_count: int
    as_of_timestamp: str
    holdings: List[PaperHoldingResponse] = []
    compliance_notice: str = (
        "Virtual paper portfolio simulation for educational risk-free practice. ₹0 real money involved."
    )
