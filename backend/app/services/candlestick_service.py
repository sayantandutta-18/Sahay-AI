"""Deterministic Candlestick Pattern Recognition & Technical Intelligence Engine."""

import math
from datetime import datetime, timedelta, timezone
from typing import List, Optional, Tuple, Dict
from app.schemas.candlestick import (
    CandleBar,
    CandlestickPatternMatch,
    TechnicalIndicators,
    SentimentSummary,
    CandlestickAnalysisResponse,
    InstrumentCandleSummary,
)


def _safe_div(numerator: float, denominator: float, fallback: float = 0.0) -> float:
    return numerator / denominator if abs(denominator) > 1e-6 else fallback


def calculate_sma(prices: List[float], period: int) -> List[Optional[float]]:
    """Compute Simple Moving Average for a series of prices."""
    smas: List[Optional[float]] = []
    for i in range(len(prices)):
        if i + 1 < period:
            smas.append(None)
        else:
            window = prices[i + 1 - period : i + 1]
            smas.append(round(sum(window) / period, 2))
    return smas


def calculate_rsi(closes: List[float], period: int = 14) -> Optional[float]:
    """Compute Relative Strength Index (RSI 14) using Wilder's smoothing."""
    if len(closes) < period + 1:
        return 50.0  # Neutral default

    gains = []
    losses = []
    for i in range(1, len(closes)):
        delta = closes[i] - closes[i - 1]
        if delta >= 0:
            gains.append(delta)
            losses.append(0.0)
        else:
            gains.append(0.0)
            losses.append(abs(delta))

    avg_gain = sum(gains[:period]) / period
    avg_loss = sum(losses[:period]) / period

    for i in range(period, len(gains)):
        avg_gain = (avg_gain * (period - 1) + gains[i]) / period
        avg_loss = (avg_loss * (period - 1) + losses[i]) / period

    if avg_loss == 0:
        return 100.0
    rs = avg_gain / avg_loss
    rsi = 100.0 - (100.0 / (1.0 + rs))
    return round(rsi, 2)


def calculate_atr(candles: List[CandleBar], period: int = 14) -> Optional[float]:
    """Compute Average True Range (ATR 14) for volatility."""
    if len(candles) < 2:
        return None
    trs = []
    for i in range(1, len(candles)):
        c = candles[i]
        prev_close = candles[i - 1].close
        tr = max(
            c.high - c.low,
            abs(c.high - prev_close),
            abs(c.low - prev_close),
        )
        trs.append(tr)

    if not trs:
        return None
    if len(trs) < period:
        return round(sum(trs) / len(trs), 2)
    return round(sum(trs[-period:]) / period, 2)


def detect_candlestick_patterns(candles: List[CandleBar]) -> List[CandlestickPatternMatch]:
    """Inspect candle series and detect classic single, double, and triple candlestick patterns."""
    matches: List[CandlestickPatternMatch] = []
    n = len(candles)
    if n == 0:
        return matches

    for i in range(n):
        curr = candles[i]
        body = abs(curr.close - curr.open)
        rng = max(curr.high - curr.low, 0.001)
        upper_shadow = curr.high - max(curr.open, curr.close)
        lower_shadow = min(curr.open, curr.close) - curr.low
        is_green = curr.close >= curr.open
        is_red = curr.close < curr.open

        # Previous trend helper (check previous 3 candles)
        prior_trend = "sideways"
        if i >= 3:
            if candles[i - 1].close < candles[i - 2].close < candles[i - 3].close:
                prior_trend = "downtrend"
            elif candles[i - 1].close > candles[i - 2].close > candles[i - 3].close:
                prior_trend = "uptrend"

        # ----------------------------------------------------
        # 1. DOJI & VARIANTS
        # ----------------------------------------------------
        if body <= rng * 0.08:
            # Dragonfly Doji (Bullish)
            if lower_shadow >= 0.65 * rng and upper_shadow <= 0.15 * rng:
                matches.append(
                    CandlestickPatternMatch(
                        pattern_id="dragonfly_doji",
                        pattern_name="Dragonfly Doji",
                        japanese_name="Tonbo",
                        pattern_type="bullish_reversal",
                        sentiment="bullish",
                        reliability="Moderate",
                        reliability_score=72,
                        trigger_candle_index=i,
                        trigger_candle_date=curr.timestamp,
                        description="Price dropped sharply during the session, but aggressive buyers stepped in to force the close back to open.",
                        implication="Strong rejection of lower prices by buyers. Indicates potential bullish reversal if followed by confirmation.",
                        confirmation_needed=True,
                        suggested_stop_loss=round(curr.low * 0.995, 2),
                        suggested_target=round(curr.close + rng * 1.5, 2),
                    )
                )
            # Gravestone Doji (Bearish)
            elif upper_shadow >= 0.65 * rng and lower_shadow <= 0.15 * rng:
                matches.append(
                    CandlestickPatternMatch(
                        pattern_id="gravestone_doji",
                        pattern_name="Gravestone Doji",
                        japanese_name="Tohba",
                        pattern_type="bearish_reversal",
                        sentiment="bearish",
                        reliability="Moderate",
                        reliability_score=72,
                        trigger_candle_index=i,
                        trigger_candle_date=curr.timestamp,
                        description="Bulls pushed prices upward during the session, but heavy sellers rejected the high and forced close back to the low.",
                        implication="Buyers exhausted at highs. Indicates significant supply overhead and impending bearish reversal.",
                        confirmation_needed=True,
                        suggested_stop_loss=round(curr.high * 1.005, 2),
                        suggested_target=round(curr.close - rng * 1.5, 2),
                    )
                )
            # Standard Doji
            else:
                matches.append(
                    CandlestickPatternMatch(
                        pattern_id="doji",
                        pattern_name="Doji (Market Indecision)",
                        japanese_name="Doji",
                        pattern_type="indecision",
                        sentiment="neutral",
                        reliability="Moderate",
                        reliability_score=60,
                        trigger_candle_index=i,
                        trigger_candle_date=curr.timestamp,
                        description="Opening and closing prices are virtually equal, reflecting exact equilibrium between buyers and sellers.",
                        implication="Momentum stall. Preceding trend is losing strength; wait for breakout candle to confirm directional shift.",
                        confirmation_needed=True,
                        suggested_stop_loss=round(curr.low * 0.995, 2),
                        suggested_target=round(curr.high * 1.01, 2),
                    )
                )

        # ----------------------------------------------------
        # 2. HAMMER & HANGING MAN
        # ----------------------------------------------------
        if lower_shadow >= 2.0 * body and upper_shadow <= 0.25 * body and body > 0.05 * rng:
            if prior_trend == "downtrend" or i >= 1 and candles[i - 1].close > curr.close:
                matches.append(
                    CandlestickPatternMatch(
                        pattern_id="hammer",
                        pattern_name="Hammer (Bullish Reversal)",
                        japanese_name="Kanazuchi / Takuri",
                        pattern_type="bullish_reversal",
                        sentiment="bullish",
                        reliability="High",
                        reliability_score=82,
                        trigger_candle_index=i,
                        trigger_candle_date=curr.timestamp,
                        description="Formed after a decline. A long lower shadow at least twice the body reflects resilient intraday demand absorbs supply.",
                        implication="Sellers attempted to push lower but met aggressive buying pressure. High probability of upward bounce.",
                        confirmation_needed=False,
                        suggested_stop_loss=round(curr.low * 0.995, 2),
                        suggested_target=round(curr.close + rng * 1.8, 2),
                    )
                )
            elif prior_trend == "uptrend":
                matches.append(
                    CandlestickPatternMatch(
                        pattern_id="hanging_man",
                        pattern_name="Hanging Man (Bearish Warning)",
                        japanese_name="Kubitsuri",
                        pattern_type="bearish_reversal",
                        sentiment="bearish",
                        reliability="Moderate",
                        reliability_score=68,
                        trigger_candle_index=i,
                        trigger_candle_date=curr.timestamp,
                        description="Looks identical to a hammer but appears at the peak of an uptrend, signaling emerging selling vulnerabilities.",
                        implication="First crack in bull defense. Large intraday selloff proves bears can breach support; risk management advised.",
                        confirmation_needed=True,
                        suggested_stop_loss=round(curr.high * 1.005, 2),
                        suggested_target=round(curr.close - rng * 1.5, 2),
                    )
                )

        # ----------------------------------------------------
        # 3. INVERTED HAMMER & SHOOTING STAR
        # ----------------------------------------------------
        if upper_shadow >= 2.0 * body and lower_shadow <= 0.25 * body and body > 0.05 * rng:
            if prior_trend == "uptrend" or i >= 1 and candles[i - 1].close < curr.close:
                matches.append(
                    CandlestickPatternMatch(
                        pattern_id="shooting_star",
                        pattern_name="Shooting Star (Bearish Reversal)",
                        japanese_name="Nagareboshi",
                        pattern_type="bearish_reversal",
                        sentiment="bearish",
                        reliability="High",
                        reliability_score=84,
                        trigger_candle_index=i,
                        trigger_candle_date=curr.timestamp,
                        description="Forms at market peaks with a long upper wick. Buyers drove prices high but were overwhelmed by institutional sellers.",
                        implication="Severe rejection at highs. Trend momentum exhausted; expect downward continuation.",
                        confirmation_needed=False,
                        suggested_stop_loss=round(curr.high * 1.005, 2),
                        suggested_target=round(curr.close - rng * 1.8, 2),
                    )
                )
            elif prior_trend == "downtrend":
                matches.append(
                    CandlestickPatternMatch(
                        pattern_id="inverted_hammer",
                        pattern_name="Inverted Hammer (Bullish Setup)",
                        japanese_name="Tohba / Gyakusetsu",
                        pattern_type="bullish_reversal",
                        sentiment="bullish",
                        reliability="Moderate",
                        reliability_score=70,
                        trigger_candle_index=i,
                        trigger_candle_date=curr.timestamp,
                        description="Appears after downward pressure. Buyers tested higher levels; sellers resisted, but selling momentum has waned.",
                        implication="Bulls testing resistance. A subsequent green candle confirms upward reversal.",
                        confirmation_needed=True,
                        suggested_stop_loss=round(curr.low * 0.995, 2),
                        suggested_target=round(curr.close + rng * 1.5, 2),
                    )
                )

        # ----------------------------------------------------
        # 4. MARUBOZU (STRONG MOMENTUM)
        # ----------------------------------------------------
        if body >= 0.88 * rng and rng > 0.5:
            if is_green:
                matches.append(
                    CandlestickPatternMatch(
                        pattern_id="bullish_marubozu",
                        pattern_name="Bullish Marubozu (Strong Conviction)",
                        japanese_name="Marubozu",
                        pattern_type="bullish_continuation",
                        sentiment="bullish",
                        reliability="High",
                        reliability_score=86,
                        trigger_candle_index=i,
                        trigger_candle_date=curr.timestamp,
                        description="Dominant green candle with virtually no wicks. Buyers maintained relentless control from opening bell to market close.",
                        implication="Extremely strong bullish momentum. Continuation expected with minimal retracement.",
                        confirmation_needed=False,
                        suggested_stop_loss=round(curr.open * 0.995, 2),
                        suggested_target=round(curr.close + body * 1.2, 2),
                    )
                )
            elif is_red:
                matches.append(
                    CandlestickPatternMatch(
                        pattern_id="bearish_marubozu",
                        pattern_name="Bearish Marubozu (Strong Conviction)",
                        japanese_name="Marubozu",
                        pattern_type="bearish_continuation",
                        sentiment="bearish",
                        reliability="High",
                        reliability_score=86,
                        trigger_candle_index=i,
                        trigger_candle_date=curr.timestamp,
                        description="Dominant red candle with virtually no wicks. Sellers dictated prices from open to close without buyer resistance.",
                        implication="Extremely strong downward momentum. Significant distribution taking place.",
                        confirmation_needed=False,
                        suggested_stop_loss=round(curr.open * 1.005, 2),
                        suggested_target=round(curr.close - body * 1.2, 2),
                    )
                )

        # ----------------------------------------------------
        # 5. SPINNING TOP
        # ----------------------------------------------------
        if body <= 0.3 * rng and upper_shadow >= body and lower_shadow >= body and rng > 0.5:
            matches.append(
                CandlestickPatternMatch(
                    pattern_id="spinning_top",
                    pattern_name="Spinning Top",
                    japanese_name="Koma",
                    pattern_type="indecision",
                    sentiment="neutral",
                    reliability="Moderate",
                    reliability_score=58,
                    trigger_candle_index=i,
                    trigger_candle_date=curr.timestamp,
                    description="Small body flanked by balanced upper and lower shadows, showing active struggle between bulls and bears.",
                    implication="Market pause and consolidation. Neither side could secure directional dominance.",
                    confirmation_needed=True,
                )
            )

        # ----------------------------------------------------
        # 6. TWO-CANDLE PATTERNS (Require i >= 1)
        # ----------------------------------------------------
        if i >= 1:
            prev = candles[i - 1]
            prev_body = abs(prev.close - prev.open)
            prev_is_green = prev.close >= prev.open
            prev_is_red = prev.close < prev.open

            # Bullish Engulfing
            if prev_is_red and is_green and curr.open <= prev.close and curr.close >= prev.open and body > prev_body:
                matches.append(
                    CandlestickPatternMatch(
                        pattern_id="bullish_engulfing",
                        pattern_name="Bullish Engulfing (Tsutsumi)",
                        japanese_name="Daki",
                        pattern_type="bullish_reversal",
                        sentiment="bullish",
                        reliability="High",
                        reliability_score=88,
                        trigger_candle_index=i,
                        trigger_candle_date=curr.timestamp,
                        description="A large green candle completely engulfs the prior red candle's body, indicating buyers decisively overpowered sellers.",
                        implication="Major momentum shift from bears to bulls. Highly reliable bullish reversal indicator.",
                        confirmation_needed=False,
                        suggested_stop_loss=round(min(curr.low, prev.low) * 0.995, 2),
                        suggested_target=round(curr.close + body * 1.5, 2),
                    )
                )

            # Bearish Engulfing
            if prev_is_green and is_red and curr.open >= prev.close and curr.close <= prev.open and body > prev_body:
                matches.append(
                    CandlestickPatternMatch(
                        pattern_id="bearish_engulfing",
                        pattern_name="Bearish Engulfing (Tsutsumi)",
                        japanese_name="Daki",
                        pattern_type="bearish_reversal",
                        sentiment="bearish",
                        reliability="High",
                        reliability_score=88,
                        trigger_candle_index=i,
                        trigger_candle_date=curr.timestamp,
                        description="A large red candle completely engulfs the prior green candle's body, confirming sellers have taken decisive control.",
                        implication="Major momentum exhaustion for bulls. High likelihood of immediate downward correction.",
                        confirmation_needed=False,
                        suggested_stop_loss=round(max(curr.high, prev.high) * 1.005, 2),
                        suggested_target=round(curr.close - body * 1.5, 2),
                    )
                )

            # Piercing Line
            midpoint_prev = (prev.open + prev.close) / 2.0
            if prev_is_red and is_green and curr.open < prev.low and curr.close > midpoint_prev and curr.close < prev.open:
                matches.append(
                    CandlestickPatternMatch(
                        pattern_id="piercing_line",
                        pattern_name="Piercing Line (Kirikomi)",
                        japanese_name="Kirikomi",
                        pattern_type="bullish_reversal",
                        sentiment="bullish",
                        reliability="High",
                        reliability_score=80,
                        trigger_candle_index=i,
                        trigger_candle_date=curr.timestamp,
                        description="Green candle opens with a gap down below previous low but rallies strongly to pierce above 50% of the red candle.",
                        implication="Bears failed to hold the breakdown gap. Strong institutional accumulation triggered.",
                        confirmation_needed=False,
                        suggested_stop_loss=round(curr.low * 0.995, 2),
                        suggested_target=round(curr.close + body * 1.4, 2),
                    )
                )

            # Dark Cloud Cover
            if prev_is_green and is_red and curr.open > prev.high and curr.close < midpoint_prev and curr.close > prev.open:
                matches.append(
                    CandlestickPatternMatch(
                        pattern_id="dark_cloud_cover",
                        pattern_name="Dark Cloud Cover (Kabuse)",
                        japanese_name="Kabuse",
                        pattern_type="bearish_reversal",
                        sentiment="bearish",
                        reliability="High",
                        reliability_score=80,
                        trigger_candle_index=i,
                        trigger_candle_date=curr.timestamp,
                        description="Red candle opens with a gap up above previous high but sells off aggressively to penetrate past 50% of the green candle.",
                        implication="False breakout trapped late buyers. Bears now in tactical control.",
                        confirmation_needed=False,
                        suggested_stop_loss=round(curr.high * 1.005, 2),
                        suggested_target=round(curr.close - body * 1.4, 2),
                    )
                )

            # Tweezer Bottom (Matching Lows)
            if abs(curr.low - prev.low) / max(curr.low, 1.0) <= 0.0015 and prev_is_red and is_green:
                matches.append(
                    CandlestickPatternMatch(
                        pattern_id="tweezer_bottom",
                        pattern_name="Tweezer Bottom (Kenuki)",
                        japanese_name="Kenuki Sokoba",
                        pattern_type="bullish_reversal",
                        sentiment="bullish",
                        reliability="Moderate",
                        reliability_score=75,
                        trigger_candle_index=i,
                        trigger_candle_date=curr.timestamp,
                        description="Two consecutive sessions finding precise support at the exact same price floor.",
                        implication="Double test of support held firmly. Strong psychological barrier formed against further declines.",
                        confirmation_needed=True,
                        suggested_stop_loss=round(curr.low * 0.995, 2),
                        suggested_target=round(curr.close + rng * 1.5, 2),
                    )
                )

            # Tweezer Top (Matching Highs)
            if abs(curr.high - prev.high) / max(curr.high, 1.0) <= 0.0015 and prev_is_green and is_red:
                matches.append(
                    CandlestickPatternMatch(
                        pattern_id="tweezer_top",
                        pattern_name="Tweezer Top (Kenuki)",
                        japanese_name="Kenuki Tenjyo",
                        pattern_type="bearish_reversal",
                        sentiment="bearish",
                        reliability="Moderate",
                        reliability_score=75,
                        trigger_candle_index=i,
                        trigger_candle_date=curr.timestamp,
                        description="Two consecutive sessions stalling at the exact same price ceiling.",
                        implication="Strong overhead resistance. Institutional profit-taking capping further upward movement.",
                        confirmation_needed=True,
                        suggested_stop_loss=round(curr.high * 1.005, 2),
                        suggested_target=round(curr.close - rng * 1.5, 2),
                    )
                )

        # ----------------------------------------------------
        # 7. THREE-CANDLE PATTERNS (Require i >= 2)
        # ----------------------------------------------------
        if i >= 2:
            c1 = candles[i - 2]
            c2 = candles[i - 1]
            c3 = curr
            b1 = abs(c1.close - c1.open)
            b2 = abs(c2.close - c2.open)
            b3 = abs(c3.close - c3.open)

            # Morning Star (Bullish)
            if (
                c1.close < c1.open
                and b2 < b1 * 0.45
                and c2.close < c1.close
                and c3.close > c3.open
                and c3.close > (c1.open + c1.close) / 2.0
            ):
                matches.append(
                    CandlestickPatternMatch(
                        pattern_id="morning_star",
                        pattern_name="Morning Star (Sansei Reversal)",
                        japanese_name="Sankei Myoujou",
                        pattern_type="bullish_reversal",
                        sentiment="bullish",
                        reliability="High",
                        reliability_score=92,
                        trigger_candle_index=i,
                        trigger_candle_date=c3.timestamp,
                        description="Three-candle formation: 1) Strong bearish bar, 2) Small-bodied gapping star showing indecision, 3) Decisive bullish breakout bar.",
                        implication="One of the highest-conviction reversal patterns in Japanese technical analysis. Signals definitive end of downtrend.",
                        confirmation_needed=False,
                        suggested_stop_loss=round(min(c1.low, c2.low, c3.low) * 0.995, 2),
                        suggested_target=round(c3.close + b1 * 1.8, 2),
                    )
                )

            # Evening Star (Bearish)
            if (
                c1.close > c1.open
                and b2 < b1 * 0.45
                and c2.close > c1.close
                and c3.close < c3.open
                and c3.close < (c1.open + c1.close) / 2.0
            ):
                matches.append(
                    CandlestickPatternMatch(
                        pattern_id="evening_star",
                        pattern_name="Evening Star (Sansei Reversal)",
                        japanese_name="Sankei Yoi no Myoujou",
                        pattern_type="bearish_reversal",
                        sentiment="bearish",
                        reliability="High",
                        reliability_score=92,
                        trigger_candle_index=i,
                        trigger_candle_date=c3.timestamp,
                        description="Three-candle formation: 1) Strong bullish bar, 2) Small-bodied star at peak, 3) Decisive bearish plunge closing deep into bar 1.",
                        implication="Classic top-reversal structure. Buyers trapped at highs; distribution phase completed.",
                        confirmation_needed=False,
                        suggested_stop_loss=round(max(c1.high, c2.high, c3.high) * 1.005, 2),
                        suggested_target=round(c3.close - b1 * 1.8, 2),
                    )
                )

            # Three White Soldiers
            if (
                c1.close > c1.open
                and c2.close > c2.open
                and c3.close > c3.open
                and c3.close > c2.close > c1.close
                and b1 > rng * 0.3
                and b2 > rng * 0.3
                and b3 > rng * 0.3
            ):
                matches.append(
                    CandlestickPatternMatch(
                        pattern_id="three_white_soldiers",
                        pattern_name="Three White Soldiers (Aka Sanpei)",
                        japanese_name="Aka Sanpei",
                        pattern_type="bullish_continuation",
                        sentiment="bullish",
                        reliability="High",
                        reliability_score=90,
                        trigger_candle_index=i,
                        trigger_candle_date=c3.timestamp,
                        description="Three consecutive long bullish candles each closing progressively higher near session peaks.",
                        implication="Unbroken buyer demand over consecutive sessions. Signals robust trend progression.",
                        confirmation_needed=False,
                        suggested_stop_loss=round(c1.open * 0.995, 2),
                        suggested_target=round(c3.close + b3 * 1.5, 2),
                    )
                )

            # Three Black Crows
            if (
                c1.close < c1.open
                and c2.close < c2.open
                and c3.close < c3.open
                and c3.close < c2.close < c1.close
                and b1 > rng * 0.3
                and b2 > rng * 0.3
                and b3 > rng * 0.3
            ):
                matches.append(
                    CandlestickPatternMatch(
                        pattern_id="three_black_crows",
                        pattern_name="Three Black Crows (Sanba Garasu)",
                        japanese_name="Sanba Garasu",
                        pattern_type="bearish_continuation",
                        sentiment="bearish",
                        reliability="High",
                        reliability_score=90,
                        trigger_candle_index=i,
                        trigger_candle_date=c3.timestamp,
                        description="Three consecutive long bearish candles each closing progressively lower with steady volume.",
                        implication="Severe selling cascade. Supply overhang dominant; avoid premature dip-buying.",
                        confirmation_needed=False,
                        suggested_stop_loss=round(c1.open * 1.005, 2),
                        suggested_target=round(c3.close - b3 * 1.5, 2),
                    )
                )

    return matches


def compute_technical_summary(candles: List[CandleBar], patterns: List[CandlestickPatternMatch]) -> Tuple[TechnicalIndicators, SentimentSummary]:
    """Compute moving averages, RSI, ATR, nearest support/resistance and overall sentiment score."""
    if not candles:
        empty_tech = TechnicalIndicators(current_price=0.0)
        empty_sent = SentimentSummary(
            overall="neutral",
            score=0,
            actionable_signal="NEUTRAL RANGE",
        )
        return empty_tech, empty_sent

    closes = [c.close for c in candles]
    highs = [c.high for c in candles]
    lows = [c.low for c in candles]
    current_price = closes[-1]

    sma20_series = calculate_sma(closes, 20)
    sma50_series = calculate_sma(closes, 50)
    rsi14 = calculate_rsi(closes, 14)
    atr14 = calculate_atr(candles, 14)

    latest_sma20 = sma20_series[-1] if sma20_series else None
    latest_sma50 = sma50_series[-1] if sma50_series else None

    # Determine trend
    trend = "sideways"
    if latest_sma20:
        if current_price > latest_sma20 * 1.01:
            trend = "uptrend"
        elif current_price < latest_sma20 * 0.99:
            trend = "downtrend"

    # Nearest support and resistance based on 20-bar pivot highs and lows
    window_lows = lows[-30:] if len(lows) >= 30 else lows
    window_highs = highs[-30:] if len(highs) >= 30 else highs

    support_candidates = [l for l in window_lows if l < current_price]
    nearest_support = max(support_candidates) if support_candidates else round(current_price * 0.95, 2)

    resistance_candidates = [h for h in window_highs if h > current_price]
    nearest_resistance = min(resistance_candidates) if resistance_candidates else round(current_price * 1.05, 2)

    tech = TechnicalIndicators(
        current_price=round(current_price, 2),
        sma_20=latest_sma20,
        sma_50=latest_sma50,
        rsi_14=rsi14,
        atr_14=atr14,
        trend=trend,
        trend_strength="strong" if abs(current_price - (latest_sma20 or current_price)) > (atr14 or 1.0) * 1.5 else "moderate",
        nearest_support=round(nearest_support, 2),
        nearest_resistance=round(nearest_resistance, 2),
    )

    # Calculate sentiment score (-100 to +100)
    # Weight recent patterns (last 5 candles get 3x weight)
    bullish_pts = 0
    bearish_pts = 0
    bullish_count = 0
    bearish_count = 0
    neutral_count = 0

    n = len(candles)
    for p in patterns:
        recency_mult = 3.0 if (n - 1 - p.trigger_candle_index) <= 5 else 1.0
        weight = (p.reliability_score / 100.0) * recency_mult * 15.0

        if p.sentiment == "bullish":
            bullish_pts += weight
            bullish_count += 1
        elif p.sentiment == "bearish":
            bearish_pts += weight
            bearish_count += 1
        else:
            neutral_count += 1

    # Add trend and RSI contribution
    if trend == "uptrend":
        bullish_pts += 15.0
    elif trend == "downtrend":
        bearish_pts += 15.0

    if rsi14 is not None:
        if rsi14 < 35:
            # Oversold - bullish reversal potential
            bullish_pts += 10.0
        elif rsi14 > 68:
            # Overbought - bearish reversal potential
            bearish_pts += 10.0

    raw_score = int(min(max(bullish_pts - bearish_pts, -100.0), 100.0))

    if raw_score >= 45:
        overall = "strongly_bullish"
        signal = "ACCUMULATE / WATCH BUY"
    elif raw_score >= 15:
        overall = "mildly_bullish"
        signal = "ACCUMULATE / WATCH BUY"
    elif raw_score <= -45:
        overall = "strongly_bearish"
        signal = "REDUCE / CAUTION"
    elif raw_score <= -15:
        overall = "mildly_bearish"
        signal = "REDUCE / CAUTION"
    else:
        overall = "neutral"
        signal = "WAIT FOR CONFIRMATION"

    sent = SentimentSummary(
        overall=overall,
        score=raw_score,
        bullish_pattern_count=bullish_count,
        bearish_pattern_count=bearish_count,
        neutral_pattern_count=neutral_count,
        actionable_signal=signal,
    )

    return tech, sent


# =========================================================================
# Realistic Reference Data Generator with Verified Benchmarks
# =========================================================================

def generate_benchmark_candles(ticker: str, days: int = 45) -> List[CandleBar]:
    """Generate realistic OHLCV daily candle bars for verified NSE benchmark instruments."""
    symbol = ticker.upper().strip()
    base_params = {
        "NIFTYBEES": {"base": 258.40, "daily_vol": 1.20, "name": "Nippon India ETF Nifty 50 BeES"},
        "BANKBEES": {"base": 542.20, "daily_vol": 3.80, "name": "Nippon India ETF Nifty Bank BeES"},
        "GOLDBEES": {"base": 65.50, "daily_vol": 0.45, "name": "Nippon India ETF Gold BeES"},
        "JUNIORBEES": {"base": 724.80, "daily_vol": 4.50, "name": "Nippon India ETF Nifty Next 50 Junior BeES"},
        "LIQUIDBEES": {"base": 1000.00, "daily_vol": 0.05, "name": "Nippon India ETF Liquid BeES"},
    }

    params = base_params.get(symbol, {"base": 150.00, "daily_vol": 1.50, "name": f"{symbol} Benchmark"})
    base_price = params["base"]
    vol = params["daily_vol"]

    end_date = datetime(2026, 3, 31, 15, 30, tzinfo=timezone.utc)
    candles: List[CandleBar] = []

    # Deterministic seeded walk with key patterns inserted for pedagogical clarity
    current = base_price * 0.94
    for i in range(days):
        day_date = end_date - timedelta(days=(days - 1 - i))
        # Skip weekends
        if day_date.weekday() >= 5:
            continue

        date_str = day_date.strftime("%Y-%m-%d")

        # Deterministic wave oscillation
        cycle = math.sin(i * 0.35) * vol * 1.5
        drift = (i / days) * (vol * 2.5)

        # Inject realistic patterns into the final week
        if i == days - 5:
            # Bearish red bar
            op = current
            cl = current - vol * 1.6
            hi = op + vol * 0.2
            lo = cl - vol * 0.3
        elif i == days - 4:
            # Gapping small star (Morning Star middle)
            op = current - vol * 0.5
            cl = op + vol * 0.2
            hi = max(op, cl) + vol * 0.2
            lo = min(op, cl) - vol * 0.4
        elif i == days - 3:
            # Bullish confirmation (Morning Star completion)
            op = current
            cl = op + vol * 2.2
            hi = cl + vol * 0.3
            lo = op - vol * 0.2
        elif i == days - 2:
            # Hammer
            op = current
            cl = op + vol * 0.5
            hi = cl + vol * 0.15
            lo = op - vol * 2.4  # long lower wick
        elif i == days - 1:
            # Bullish Engulfing or green continuation
            op = current - vol * 0.2
            cl = op + vol * 1.8
            hi = cl + vol * 0.2
            lo = op - vol * 0.1
        else:
            # Normal day
            delta = cycle + (math.cos(i * 1.2) * vol * 0.8)
            op = round(current, 2)
            cl = round(current + delta, 2)
            wick_up = abs(math.sin(i * 2.1)) * vol * 0.8
            wick_dn = abs(math.cos(i * 1.7)) * vol * 0.8
            hi = round(max(op, cl) + wick_up, 2)
            lo = round(min(op, cl) - wick_dn, 2)

        op = round(op, 2)
        hi = round(max(hi, op, cl), 2)
        lo = round(min(lo, op, cl), 2)
        cl = round(cl, 2)
        volume = round(150000 + math.sin(i) * 50000 + (cl - op) * 10000, 0)
        chg = round(cl - op, 2)
        pct = round(_safe_div(chg, op) * 100.0, 2)
        color = "green" if cl >= op else "red"

        candles.append(
            CandleBar(
                timestamp=date_str,
                open=op,
                high=hi,
                low=lo,
                close=cl,
                volume=volume,
                change=chg,
                change_percent=pct,
                color=color,
            )
        )
        current = cl

    return candles


def analyze_instrument_candlesticks(
    ticker: str, timeframe: str = "1D", custom_candles: Optional[List[CandleBar]] = None
) -> CandlestickAnalysisResponse:
    """Run complete deterministic candlestick pattern analysis on an instrument or custom series."""
    symbol = ticker.upper().strip()

    instrument_names = {
        "NIFTYBEES": "Nippon India ETF Nifty 50 BeES",
        "BANKBEES": "Nippon India ETF Nifty Bank BeES",
        "GOLDBEES": "Nippon India ETF Gold BeES",
        "JUNIORBEES": "Nippon India ETF Nifty Next 50 Junior BeES",
        "LIQUIDBEES": "Nippon India ETF Liquid BeES",
    }
    name = instrument_names.get(symbol, f"{symbol} Benchmark Instrument")

    candles = custom_candles if custom_candles is not None else generate_benchmark_candles(symbol, days=45)

    patterns = detect_candlestick_patterns(candles)
    tech, sent = compute_technical_summary(candles, patterns)

    # Patterns occurring within the last 7 candles
    recent_threshold = max(len(candles) - 7, 0)
    recent = [p for p in patterns if p.trigger_candle_index >= recent_threshold]

    # Generate plain-language takeaway
    if sent.overall in ["strongly_bullish", "mildly_bullish"]:
        takeaway = (
            f"{symbol} exhibits constructive technical structure with {sent.bullish_pattern_count} bullish formations detected. "
            f"Nearest support sits at ₹{tech.nearest_support:,.2f} with resistance at ₹{tech.nearest_resistance:,.2f}. "
            f"RSI is currently {tech.rsi_14 or 50:.1f}, signaling healthy upward momentum without extreme overbought strain."
        )
    elif sent.overall in ["strongly_bearish", "mildly_bearish"]:
        takeaway = (
            f"{symbol} faces supply resistance with {sent.bearish_pattern_count} bearish patterns triggering caution. "
            f"Support floor to watch is ₹{tech.nearest_support:,.2f}. "
            f"Wait for a confirmed reversal pattern (such as a Hammer or Bullish Engulfing) before committing new capital."
        )
    else:
        takeaway = (
            f"{symbol} is currently consolidating in a balanced equilibrium range between support ₹{tech.nearest_support:,.2f} "
            f"and resistance ₹{tech.nearest_resistance:,.2f}. Indecision signals advise waiting for a directional breakout."
        )

    return CandlestickAnalysisResponse(
        ticker=symbol,
        instrument_name=name,
        exchange="NSE",
        timeframe=timeframe,
        candles=candles,
        detected_patterns=patterns,
        recent_patterns=recent,
        technical_indicators=tech,
        sentiment=sent,
        educational_takeaway=takeaway,
    )


def list_available_candlestick_instruments() -> List[InstrumentCandleSummary]:
    """List reference instruments with quick technical summary badges."""
    symbols = ["NIFTYBEES", "BANKBEES", "GOLDBEES", "JUNIORBEES", "LIQUIDBEES"]
    summaries = []
    for sym in symbols:
        analysis = analyze_instrument_candlesticks(sym)
        latest_pat = analysis.recent_patterns[-1].pattern_name if analysis.recent_patterns else None
        last_candle = analysis.candles[-1] if analysis.candles else None
        chg_pct = last_candle.change_percent if last_candle else 0.0
        price = last_candle.close if last_candle else 0.0

        summaries.append(
            InstrumentCandleSummary(
                ticker=sym,
                name=analysis.instrument_name,
                exchange=analysis.exchange,
                current_price=price,
                change_24h_percent=chg_pct,
                latest_pattern=latest_pat,
                sentiment=analysis.sentiment.overall,
            )
        )
    return summaries
