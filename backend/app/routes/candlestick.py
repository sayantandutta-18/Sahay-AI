"""FastAPI endpoints for Candlestick Pattern Recognition and Market Technical Intelligence."""

from typing import List, Optional
from fastapi import APIRouter, Query, HTTPException, status
from app.schemas.candlestick import (
    CandlestickAnalysisResponse,
    CustomCandleAnalysisRequest,
    InstrumentCandleSummary,
)
from app.services.candlestick_service import (
    analyze_instrument_candlesticks,
    list_available_candlestick_instruments,
)

router = APIRouter(prefix="/candlestick", tags=["Candlestick Intelligence"])


@router.get(
    "/instruments",
    response_model=List[InstrumentCandleSummary],
    summary="List Benchmark Instruments for Candlestick Analysis",
)
def get_candlestick_instruments() -> List[InstrumentCandleSummary]:
    """Retrieve list of verified NSE benchmark ETFs with recent technical sentiments."""
    return list_available_candlestick_instruments()


@router.get(
    "/analysis/{ticker}",
    response_model=CandlestickAnalysisResponse,
    summary="Get Candlestick Pattern Analysis for an Instrument",
)
def get_candlestick_analysis(
    ticker: str,
    timeframe: str = Query("1D", pattern="^(1D|1W|1M)$", description="Candle bar aggregation timeframe"),
) -> CandlestickAnalysisResponse:
    """Perform deterministic candlestick pattern recognition on verified benchmark OHLC data.
    
    Identifies 16+ classical formations (Hammer, Morning Star, Engulfing, Doji, Marubozu, etc.),
    calculates SMA 20/50, RSI 14, ATR volatility, support/resistance, and aggregates net technical sentiment.
    """
    clean_ticker = ticker.upper().strip()
    try:
        return analyze_instrument_candlesticks(clean_ticker, timeframe=timeframe)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Candlestick analysis failed for {clean_ticker}: {str(exc)}",
        )


@router.post(
    "/analyze-custom",
    response_model=CandlestickAnalysisResponse,
    summary="Analyze Custom OHLC Candle Series",
)
def analyze_custom_candles(
    payload: CustomCandleAnalysisRequest,
) -> CandlestickAnalysisResponse:
    """Run deterministic pattern detection on caller-supplied OHLC series for testing and learning."""
    if len(payload.candles) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least 1 candle bar is required for analysis.",
        )

    try:
        return analyze_instrument_candlesticks(
            ticker=payload.ticker or "CUSTOM",
            custom_candles=payload.candles,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Custom candle analysis failed: {str(exc)}",
        )
