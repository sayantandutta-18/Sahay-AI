"""Tests for Candlestick Pattern Recognition, Technical Indicators, and Endpoints."""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.schemas.candlestick import CandleBar
from app.services.candlestick_service import (
    detect_candlestick_patterns,
    calculate_sma,
    calculate_rsi,
    calculate_atr,
    analyze_instrument_candlesticks,
    list_available_candlestick_instruments,
)

client = TestClient(app)


def test_hammer_detection():
    """Verify that a candle with a small body and long lower shadow after a downtrend is detected as a Hammer."""
    candles = [
        CandleBar(timestamp="2026-03-01", open=100.0, high=101.0, low=98.0, close=98.5),
        CandleBar(timestamp="2026-03-02", open=98.5, high=99.0, low=96.0, close=96.5),
        CandleBar(timestamp="2026-03-03", open=96.5, high=97.0, low=94.0, close=94.5),
        # Hammer: open=94.5, close=95.0 (body=0.5), high=95.1 (upper shadow=0.1), low=92.5 (lower shadow=2.0)
        CandleBar(timestamp="2026-03-04", open=94.5, high=95.1, low=92.5, close=95.0),
    ]
    patterns = detect_candlestick_patterns(candles)
    hammer_matches = [p for p in patterns if p.pattern_id == "hammer"]
    assert len(hammer_matches) >= 1
    assert hammer_matches[0].sentiment == "bullish"
    assert hammer_matches[0].reliability == "High"


def test_shooting_star_detection():
    """Verify that a candle with small body and long upper shadow after an uptrend is detected as a Shooting Star."""
    candles = [
        CandleBar(timestamp="2026-03-01", open=100.0, high=102.0, low=99.5, close=101.5),
        CandleBar(timestamp="2026-03-02", open=101.5, high=104.0, low=101.0, close=103.5),
        CandleBar(timestamp="2026-03-03", open=103.5, high=106.0, low=103.0, close=105.5),
        # Shooting Star: open=105.5, close=105.0 (body=0.5), low=104.9 (lower shadow=0.1), high=108.0 (upper shadow=2.5)
        CandleBar(timestamp="2026-03-04", open=105.5, high=108.0, low=104.9, close=105.0),
    ]
    patterns = detect_candlestick_patterns(candles)
    star_matches = [p for p in patterns if p.pattern_id == "shooting_star"]
    assert len(star_matches) >= 1
    assert star_matches[0].sentiment == "bearish"
    assert star_matches[0].pattern_type == "bearish_reversal"


def test_bullish_engulfing_detection():
    """Verify that a large green candle engulfing a prior red candle is detected as Bullish Engulfing."""
    candles = [
        CandleBar(timestamp="2026-03-01", open=100.0, high=100.5, low=97.0, close=97.5),
        # Bullish Engulfing: open=97.0, close=101.0 (body=4.0 > 2.5, engulfs [97.5, 100.0])
        CandleBar(timestamp="2026-03-02", open=97.0, high=101.5, low=96.5, close=101.0),
    ]
    patterns = detect_candlestick_patterns(candles)
    engulfing = [p for p in patterns if p.pattern_id == "bullish_engulfing"]
    assert len(engulfing) == 1
    assert engulfing[0].sentiment == "bullish"
    assert engulfing[0].reliability_score >= 85


def test_morning_star_detection():
    """Verify 3-candle Morning Star reversal pattern."""
    candles = [
        CandleBar(timestamp="2026-03-01", open=100.0, high=100.5, low=94.0, close=94.5),  # Long red
        CandleBar(timestamp="2026-03-02", open=93.5, high=94.0, low=92.5, close=93.8),   # Small gapping star
        CandleBar(timestamp="2026-03-03", open=94.0, high=99.0, low=93.8, close=98.5),   # Long green piercing past 50%
    ]
    patterns = detect_candlestick_patterns(candles)
    morning = [p for p in patterns if p.pattern_id == "morning_star"]
    assert len(morning) == 1
    assert morning[0].sentiment == "bullish"
    assert morning[0].reliability_score >= 90


def test_doji_detection():
    """Verify standard Doji indecision candle detection."""
    candles = [
        CandleBar(timestamp="2026-03-01", open=100.0, high=103.0, low=97.0, close=100.05),
    ]
    patterns = detect_candlestick_patterns(candles)
    doji_matches = [p for p in patterns if "doji" in p.pattern_id]
    assert len(doji_matches) >= 1
    assert doji_matches[0].pattern_type == "indecision"


def test_technical_indicators_calculation():
    """Verify SMA, RSI, and ATR calculations."""
    prices = [100 + i for i in range(25)]
    sma20 = calculate_sma(prices, 20)
    assert len(sma20) == 25
    assert sma20[19] == sum(prices[:20]) / 20.0

    rsi = calculate_rsi(prices, 14)
    assert rsi is not None
    assert rsi > 70.0  # Steady upward series should be strongly overbought

    candles = [
        CandleBar(timestamp=f"2026-03-{i+1:02d}", open=100.0 + i, high=102.0 + i, low=99.0 + i, close=101.0 + i)
        for i in range(20)
    ]
    atr = calculate_atr(candles, 14)
    assert atr is not None
    assert atr > 0


def test_candlestick_api_endpoints():
    """Verify FastAPI candlestick analysis endpoints."""
    # 1. List instruments
    res_inst = client.get("/api/v1/candlestick/instruments")
    assert res_inst.status_code == 200
    instruments = res_inst.json()
    assert len(instruments) >= 4
    assert any(i["ticker"] == "NIFTYBEES" for i in instruments)

    # 2. Get specific instrument analysis
    res_analysis = client.get("/api/v1/candlestick/analysis/NIFTYBEES?timeframe=1D")
    assert res_analysis.status_code == 200
    data = res_analysis.json()
    assert data["ticker"] == "NIFTYBEES"
    assert len(data["candles"]) >= 30
    assert "technical_indicators" in data
    assert "sentiment" in data
    assert data["sentiment"]["score"] is not None

    # 3. Analyze custom candles
    custom_payload = {
        "ticker": "TEST_HAMMER",
        "candles": [
            {"timestamp": "2026-03-01", "open": 100.0, "high": 101.0, "low": 98.0, "close": 98.5},
            {"timestamp": "2026-03-02", "open": 98.5, "high": 99.0, "low": 96.0, "close": 96.5},
            {"timestamp": "2026-03-03", "open": 96.5, "high": 97.0, "low": 94.0, "close": 94.5},
            {"timestamp": "2026-03-04", "open": 94.5, "high": 95.1, "low": 92.5, "close": 95.0},
        ],
    }
    res_custom = client.post("/api/v1/candlestick/analyze-custom", json=custom_payload)
    assert res_custom.status_code == 200
    custom_data = res_custom.json()
    assert custom_data["ticker"] == "TEST_HAMMER"
    assert len(custom_data["detected_patterns"]) >= 1
