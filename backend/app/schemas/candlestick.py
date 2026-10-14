"""Pydantic schemas for Candlestick Pattern Analysis and Technical Intelligence."""

from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel, Field


class CandleBar(BaseModel):
    """Single OHLCV candlestick bar."""
    timestamp: str = Field(..., description="Date or ISO timestamp of the bar, e.g. '2026-03-31'")
    open: float = Field(..., description="Opening price")
    high: float = Field(..., description="Session highest price")
    low: float = Field(..., description="Session lowest price")
    close: float = Field(..., description="Closing price")
    volume: float = Field(default=0.0, description="Trading volume")
    change: float = Field(default=0.0, description="Price change from open to close")
    change_percent: float = Field(default=0.0, description="Percentage change from open to close")
    color: str = Field(default="green", description="'green' (bullish), 'red' (bearish), or 'neutral'")


class CandlestickPatternMatch(BaseModel):
    """Detailed metadata for a detected candlestick pattern."""
    pattern_id: str = Field(..., description="Unique pattern identifier, e.g. 'hammer', 'morning_star'")
    pattern_name: str = Field(..., description="Human-readable pattern title")
    japanese_name: Optional[str] = Field(default=None, description="Traditional Japanese candlestick terminology")
    pattern_type: str = Field(
        ...,
        description="'bullish_reversal' | 'bearish_reversal' | 'bullish_continuation' | 'bearish_continuation' | 'indecision'",
    )
    sentiment: str = Field(..., description="'bullish' | 'bearish' | 'neutral'")
    reliability: str = Field(..., description="'High' | 'Moderate' | 'Low'")
    reliability_score: int = Field(..., ge=0, le=100, description="Reliability score from 0 to 100")
    trigger_candle_index: int = Field(..., description="Index of the final confirmation candle in the series")
    trigger_candle_date: str = Field(..., description="Timestamp of the trigger candle")
    description: str = Field(..., description="Plain-language anatomical explanation of the pattern")
    implication: str = Field(..., description="Actionable market insight and buyer/seller dynamics")
    confirmation_needed: bool = Field(default=True, description="Whether subsequent candle confirmation is advised")
    suggested_stop_loss: Optional[float] = Field(default=None, description="Recommended technical stop-loss level")
    suggested_target: Optional[float] = Field(default=None, description="Projected upside/downside target price")


class TechnicalIndicators(BaseModel):
    """Key supporting technical indicators."""
    current_price: float
    sma_20: Optional[float] = None
    sma_50: Optional[float] = None
    rsi_14: Optional[float] = None
    atr_14: Optional[float] = None
    trend: str = Field(default="sideways", description="'uptrend' | 'downtrend' | 'sideways'")
    trend_strength: str = Field(default="moderate", description="'strong' | 'moderate' | 'weak'")
    nearest_support: float = 0.0
    nearest_resistance: float = 0.0


class SentimentSummary(BaseModel):
    """Aggregated technical sentiment and pattern score."""
    overall: str = Field(
        ...,
        description="'strongly_bullish' | 'mildly_bullish' | 'neutral' | 'mildly_bearish' | 'strongly_bearish'",
    )
    score: int = Field(..., ge=-100, le=100, description="Net sentiment score from -100 (max bearish) to +100 (max bullish)")
    bullish_pattern_count: int = 0
    bearish_pattern_count: int = 0
    neutral_pattern_count: int = 0
    actionable_signal: str = Field(
        ...,
        description="'ACCUMULATE / WATCH BUY' | 'REDUCE / CAUTION' | 'WAIT FOR CONFIRMATION' | 'NEUTRAL RANGE'",
    )


class CandlestickAnalysisResponse(BaseModel):
    """Comprehensive candlestick analysis report for an instrument."""
    ticker: str
    instrument_name: str
    exchange: str = "NSE"
    timeframe: str = "1D"
    candles: List[CandleBar]
    detected_patterns: List[CandlestickPatternMatch]
    recent_patterns: List[CandlestickPatternMatch]
    technical_indicators: TechnicalIndicators
    sentiment: SentimentSummary
    educational_takeaway: str
    disclaimer: str = (
        "Educational candlestick analysis for technical decision-support only. "
        "Compliant with SEBI research analyst guidelines. No guaranteed returns or execution orders."
    )


class CustomCandleAnalysisRequest(BaseModel):
    """Request payload for analyzing client-provided custom OHLC candle series."""
    ticker: Optional[str] = "CUSTOM_SERIES"
    instrument_name: Optional[str] = "Custom OHLC Dataset"
    candles: List[CandleBar]


class InstrumentCandleSummary(BaseModel):
    """Summary item for available market instruments in the candlestick analyzer."""
    ticker: str
    name: str
    exchange: str
    current_price: float
    change_24h_percent: float
    latest_pattern: Optional[str] = None
    sentiment: str = "neutral"
