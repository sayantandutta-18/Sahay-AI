"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { CandleBar, CandlestickPatternMatch } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Play, Pause, Zap, RefreshCw, Sparkles, BellRing, ArrowUpRight, ArrowDownRight, Radio } from "lucide-react";

interface CandlestickChartProps {
  candles: CandleBar[];
  patterns: CandlestickPatternMatch[];
  sma20?: number[];
  supportLevel?: number;
  resistanceLevel?: number;
  onSelectPattern?: (pattern: CandlestickPatternMatch) => void;
  selectedPatternId?: string | null;
}

interface LivePatternAlert {
  pattern_name: string;
  japanese_name?: string;
  sentiment: "bullish" | "bearish" | "neutral";
  reliability: "High" | "Moderate" | "Low";
  price: number;
  implication: string;
  suggested_stop_loss?: number;
  suggested_target?: number;
  timestamp: string;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  candles: initialCandles,
  patterns: initialPatterns,
  supportLevel,
  resistanceLevel,
  onSelectPattern,
  selectedPatternId,
}) => {
  const [candles, setCandles] = useState<CandleBar[]>(initialCandles);
  const [patterns, setPatterns] = useState<CandlestickPatternMatch[]>(initialPatterns);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [viewCount, setViewCount] = useState<number>(30);

  // Live simulation states
  const [isLiveActive, setIsLiveActive] = useState<boolean>(false);
  const [liveSpeed, setLiveSpeed] = useState<number>(1200); // ms per tick
  const [tickCounter, setTickCounter] = useState<number>(0);
  const [liveAlert, setLiveAlert] = useState<LivePatternAlert | null>(null);
  const [lastTickDirection, setLastTickDirection] = useState<"up" | "down" | "flat">("flat");

  // Sync when initialCandles change externally (e.g. user selected another ticker)
  useEffect(() => {
    setCandles(initialCandles);
    setPatterns(initialPatterns);
    setLiveAlert(null);
  }, [initialCandles, initialPatterns]);

  // Pattern detection evaluator on current candles array
  const evaluateCandlePattern = (candleList: CandleBar[], idx: number): CandlestickPatternMatch | null => {
    if (idx < 1 || idx >= candleList.length) return null;
    const curr = candleList[idx];
    const prev = candleList[idx - 1];

    const body = Math.abs(curr.close - curr.open);
    const range = curr.high - curr.low || 0.01;
    const upperShadow = curr.high - Math.max(curr.open, curr.close);
    const lowerShadow = Math.min(curr.open, curr.close) - curr.low;

    // 1. Hammer (bullish reversal)
    if (lowerShadow >= 1.8 * body && upperShadow <= 0.3 * body && curr.close >= curr.open) {
      return {
        pattern_id: `live-hammer-${Date.now()}`,
        pattern_name: "Hammer",
        japanese_name: "Kanazuchi",
        pattern_type: "bullish_reversal",
        sentiment: "bullish",
        reliability: "High",
        reliability_score: 84,
        trigger_candle_index: idx,
        trigger_candle_date: curr.timestamp,
        description: "Bullish pin bar with extended lower shadow rejecting lower prices.",
        implication: "Buyers absorbed aggressive selling; potential upward reversal.",
        confirmation_needed: true,
        suggested_stop_loss: Number((curr.low * 0.995).toFixed(2)),
        suggested_target: Number((curr.close + range * 1.5).toFixed(2)),
      };
    }

    // 2. Shooting Star (bearish reversal)
    if (upperShadow >= 1.8 * body && lowerShadow <= 0.3 * body && curr.close <= curr.open) {
      return {
        pattern_id: `live-star-${Date.now()}`,
        pattern_name: "Shooting Star",
        japanese_name: "Nagareboshi",
        pattern_type: "bearish_reversal",
        sentiment: "bearish",
        reliability: "High",
        reliability_score: 82,
        trigger_candle_index: idx,
        trigger_candle_date: curr.timestamp,
        description: "Bearish rejection pin bar with long upper wick after upward rally.",
        implication: "Bulls failed to hold higher levels; bears taking control.",
        confirmation_needed: true,
        suggested_stop_loss: Number((curr.high * 1.005).toFixed(2)),
        suggested_target: Number((curr.close - range * 1.5).toFixed(2)),
      };
    }

    // 3. Bullish Engulfing
    const prevBody = Math.abs(prev.close - prev.open);
    if (
      prev.close < prev.open && // prev was red
      curr.close > curr.open && // curr is green
      curr.open <= prev.close &&
      curr.close >= prev.open &&
      body > prevBody
    ) {
      return {
        pattern_id: `live-engulf-bull-${Date.now()}`,
        pattern_name: "Bullish Engulfing",
        japanese_name: "Tsutsumi",
        pattern_type: "bullish_reversal",
        sentiment: "bullish",
        reliability: "High",
        reliability_score: 88,
        trigger_candle_index: idx,
        trigger_candle_date: curr.timestamp,
        description: "Large bullish body completely engulfs prior bearish body.",
        implication: "Decisive shift in market control from bears to aggressive bulls.",
        confirmation_needed: false,
        suggested_stop_loss: Number((curr.low * 0.995).toFixed(2)),
        suggested_target: Number((curr.close + body * 1.6).toFixed(2)),
      };
    }

    // 4. Bearish Engulfing
    if (
      prev.close > prev.open && // prev was green
      curr.close < curr.open && // curr is red
      curr.open >= prev.close &&
      curr.close <= prev.open &&
      body > prevBody
    ) {
      return {
        pattern_id: `live-engulf-bear-${Date.now()}`,
        pattern_name: "Bearish Engulfing",
        japanese_name: "Tsutsumi",
        pattern_type: "bearish_reversal",
        sentiment: "bearish",
        reliability: "High",
        reliability_score: 86,
        trigger_candle_index: idx,
        trigger_candle_date: curr.timestamp,
        description: "Large bearish body completely engulfs prior bullish body.",
        implication: "Sellers overpowered buyers decisively.",
        confirmation_needed: false,
        suggested_stop_loss: Number((curr.high * 1.005).toFixed(2)),
        suggested_target: Number((curr.close - body * 1.6).toFixed(2)),
      };
    }

    // 5. Doji Indecision
    if (body <= 0.08 * range) {
      return {
        pattern_id: `live-doji-${Date.now()}`,
        pattern_name: "Doji Indecision",
        japanese_name: "Doji",
        pattern_type: "indecision",
        sentiment: "neutral",
        reliability: "Moderate",
        reliability_score: 72,
        trigger_candle_index: idx,
        trigger_candle_date: curr.timestamp,
        description: "Open and close are virtually identical, indicating equilibrium.",
        implication: "Buyers and sellers reached temporary stalemate; wait for next candle breakout.",
        confirmation_needed: true,
      };
    }

    // 6. Morning Star (3-candle sequence)
    if (idx >= 2) {
      const pprev = candleList[idx - 2];
      const pprevBody = Math.abs(pprev.close - pprev.open);
      if (
        pprev.close < pprev.open &&
        prevBody <= 0.35 * pprevBody &&
        curr.close > curr.open &&
        curr.close >= pprev.open - pprevBody * 0.5
      ) {
        return {
          pattern_id: `live-morning-star-${Date.now()}`,
          pattern_name: "Morning Star",
          japanese_name: "Sansei Morning Star",
          pattern_type: "bullish_reversal",
          sentiment: "bullish",
          reliability: "High",
          reliability_score: 91,
          trigger_candle_index: idx,
          trigger_candle_date: curr.timestamp,
          description: "Three-candle bottom reversal: deep red bar, pause doji, decisive green rebound.",
          implication: "Major turning point signaling strong upward momentum.",
          confirmation_needed: false,
          suggested_stop_loss: Number((Math.min(pprev.low, prev.low, curr.low) * 0.995).toFixed(2)),
          suggested_target: Number((curr.close + pprevBody * 1.5).toFixed(2)),
        };
      }
    }

    return null;
  };

  // Live Ticking Interval
  useEffect(() => {
    if (!isLiveActive || candles.length === 0) return;

    const interval = setInterval(() => {
      setCandles((prevCandles) => {
        if (prevCandles.length === 0) return prevCandles;
        const lastIdx = prevCandles.length - 1;
        const activeBar = { ...prevCandles[lastIdx] };

        // Generate dynamic price tick (-0.35% to +0.38%)
        const drift = (Math.random() - 0.48) * (activeBar.close * 0.0035);
        const newClose = Number(Math.max(1, activeBar.close + drift).toFixed(2));
        const newHigh = Number(Math.max(activeBar.high, newClose).toFixed(2));
        const newLow = Number(Math.min(activeBar.low, newClose).toFixed(2));
        const newVol = activeBar.volume + Math.floor(Math.random() * 40) + 10;
        const change = Number((newClose - activeBar.open).toFixed(2));
        const change_pct = Number(((change / activeBar.open) * 100).toFixed(2));

        setLastTickDirection(drift > 0 ? "up" : drift < 0 ? "down" : "flat");

        const updatedBar: CandleBar = {
          ...activeBar,
          close: newClose,
          high: newHigh,
          low: newLow,
          volume: newVol,
          change: change,
          change_percent: change_pct,
          color: newClose >= activeBar.open ? "green" : "red",
        };

        const nextTicks = tickCounter + 1;
        setTickCounter(nextTicks);

        // Every 8 ticks, complete the candle and start a new live candle
        if (nextTicks >= 8) {
          setTickCounter(0);
          const completedList = [...prevCandles.slice(0, lastIdx), updatedBar];

          // Check if a pattern formed on the completed bar
          const foundPattern = evaluateCandlePattern(completedList, lastIdx);
          if (foundPattern) {
            setPatterns((curPats) => [...curPats, foundPattern]);
            setLiveAlert({
              pattern_name: foundPattern.pattern_name,
              japanese_name: foundPattern.japanese_name,
              sentiment: foundPattern.sentiment,
              reliability: foundPattern.reliability,
              price: newClose,
              implication: foundPattern.implication,
              suggested_stop_loss: foundPattern.suggested_stop_loss,
              suggested_target: foundPattern.suggested_target,
              timestamp: new Date().toLocaleTimeString(),
            });
            if (onSelectPattern) onSelectPattern(foundPattern);
          }

          // Create new active candle
          const now = new Date();
          const timeStr = now.toTimeString().slice(0, 8);
          const newBar: CandleBar = {
            timestamp: timeStr,
            open: newClose,
            high: newClose,
            low: newClose,
            close: newClose,
            volume: 100,
            change: 0,
            change_percent: 0,
            color: "neutral",
          };
          return [...completedList, newBar];
        }

        return [...prevCandles.slice(0, lastIdx), updatedBar];
      });
    }, liveSpeed);

    return () => clearInterval(interval);
  }, [isLiveActive, liveSpeed, tickCounter, candles.length, onSelectPattern]);

  // Inject classical pattern formation manually for real-time live demonstration
  const injectLivePattern = (type: "hammer" | "bullish_engulfing" | "shooting_star" | "morning_star" | "doji") => {
    setCandles((prev) => {
      if (prev.length === 0) return prev;
      const baseClose = prev[prev.length - 1].close;
      const now = new Date();
      const timeStr = (offsetSec: number) => {
        const d = new Date(now.getTime() + offsetSec * 1000);
        return d.toTimeString().slice(0, 8);
      };

      let newBars: CandleBar[] = [];
      let detected: CandlestickPatternMatch | null = null;

      if (type === "hammer") {
        const bar: CandleBar = {
          timestamp: timeStr(0),
          open: baseClose * 0.998,
          high: baseClose * 1.002,
          low: baseClose * 0.985, // Deep lower shadow
          close: baseClose * 1.001,
          volume: 2500,
          change: baseClose * 0.003,
          change_percent: 0.3,
          color: "green",
        };
        newBars = [bar];
      } else if (type === "bullish_engulfing") {
        const bar1: CandleBar = {
          timestamp: timeStr(-10),
          open: baseClose * 1.005,
          high: baseClose * 1.007,
          low: baseClose * 0.997,
          close: baseClose * 0.998, // Small red
          volume: 1200,
          change: -baseClose * 0.007,
          change_percent: -0.7,
          color: "red",
        };
        const bar2: CandleBar = {
          timestamp: timeStr(0),
          open: baseClose * 0.996, // Gaps lower
          high: baseClose * 1.018,
          low: baseClose * 0.995,
          close: baseClose * 1.015, // Huge green engulfing
          volume: 4800,
          change: baseClose * 0.019,
          change_percent: 1.9,
          color: "green",
        };
        newBars = [bar1, bar2];
      } else if (type === "shooting_star") {
        const bar: CandleBar = {
          timestamp: timeStr(0),
          open: baseClose * 1.002,
          high: baseClose * 1.025, // Long upper wick
          low: baseClose * 0.999,
          close: baseClose * 1.001,
          volume: 3100,
          change: -baseClose * 0.001,
          change_percent: -0.1,
          color: "red",
        };
        newBars = [bar];
      } else if (type === "morning_star") {
        const bar1: CandleBar = {
          timestamp: timeStr(-20),
          open: baseClose * 1.02,
          high: baseClose * 1.022,
          low: baseClose * 0.992,
          close: baseClose * 0.995, // Long red
          volume: 2100,
          change: -baseClose * 0.025,
          change_percent: -2.5,
          color: "red",
        };
        const bar2: CandleBar = {
          timestamp: timeStr(-10),
          open: baseClose * 0.992,
          high: baseClose * 0.994,
          low: baseClose * 0.989,
          close: baseClose * 0.991, // Tiny star
          volume: 800,
          change: -baseClose * 0.001,
          change_percent: -0.1,
          color: "neutral",
        };
        const bar3: CandleBar = {
          timestamp: timeStr(0),
          open: baseClose * 0.993,
          high: baseClose * 1.018,
          low: baseClose * 0.992,
          close: baseClose * 1.015, // Strong green
          volume: 4200,
          change: baseClose * 0.022,
          change_percent: 2.2,
          color: "green",
        };
        newBars = [bar1, bar2, bar3];
      } else {
        // Doji
        const bar: CandleBar = {
          timestamp: timeStr(0),
          open: baseClose,
          high: baseClose * 1.008,
          low: baseClose * 0.992,
          close: baseClose, // Open equals close
          volume: 1500,
          change: 0,
          change_percent: 0,
          color: "neutral",
        };
        newBars = [bar];
      }

      const mergedCandles = [...prev, ...newBars];
      const triggerIdx = mergedCandles.length - 1;
      detected = evaluateCandlePattern(mergedCandles, triggerIdx);

      if (detected) {
        setPatterns((cur) => [...cur, detected!]);
        setLiveAlert({
          pattern_name: detected.pattern_name,
          japanese_name: detected.japanese_name,
          sentiment: detected.sentiment,
          reliability: detected.reliability,
          price: mergedCandles[triggerIdx].close,
          implication: detected.implication,
          suggested_stop_loss: detected.suggested_stop_loss,
          suggested_target: detected.suggested_target,
          timestamp: new Date().toLocaleTimeString(),
        });
        if (onSelectPattern) onSelectPattern(detected);
      }

      return mergedCandles;
    });
  };

  // Visible slice
  const visibleCandles = useMemo(() => {
    if (!candles || candles.length === 0) return [];
    return candles.slice(-viewCount);
  }, [candles, viewCount]);

  const startIndex = Math.max(0, candles.length - viewCount);
  const visiblePatterns = useMemo(() => {
    return patterns.filter((p) => p.trigger_candle_index >= startIndex);
  }, [patterns, startIndex]);

  // Dimensions
  const width = 800;
  const height = 400;
  const padding = { top: 25, right: 65, bottom: 65, left: 20 };
  const chartWidth = width - padding.left - padding.right;
  const priceChartHeight = height - padding.top - padding.bottom - 60;
  const volumeChartHeight = 50;
  const volumeTop = height - padding.bottom - volumeChartHeight;

  // Scale ranges
  const { minPrice, maxPrice, maxVolume } = useMemo(() => {
    if (visibleCandles.length === 0) {
      return { minPrice: 0, maxPrice: 100, maxVolume: 1000 };
    }
    let minP = Math.min(...visibleCandles.map((c) => c.low));
    let maxP = Math.max(...visibleCandles.map((c) => c.high));
    if (supportLevel && supportLevel < minP) minP = supportLevel * 0.995;
    if (resistanceLevel && resistanceLevel > maxP) maxP = resistanceLevel * 1.005;
    const paddingRange = (maxP - minP) * 0.08 || 1;
    const maxV = Math.max(...visibleCandles.map((c) => c.volume), 1);
    return {
      minPrice: minP - paddingRange,
      maxPrice: maxP + paddingRange,
      maxVolume: maxV,
    };
  }, [visibleCandles, supportLevel, resistanceLevel]);

  const priceToY = (price: number) => {
    if (maxPrice === minPrice) return priceChartHeight / 2 + padding.top;
    return padding.top + ((maxPrice - price) / (maxPrice - minPrice)) * priceChartHeight;
  };

  const volumeToHeight = (vol: number) => {
    return (vol / maxVolume) * volumeChartHeight;
  };

  const barStep = visibleCandles.length > 0 ? chartWidth / visibleCandles.length : 10;
  const candleBodyWidth = Math.max(Math.min(barStep * 0.65, 14), 3);

  // Moving average
  const smaLinePoints = useMemo(() => {
    if (visibleCandles.length < 5) return "";
    const points: string[] = [];
    visibleCandles.forEach((_, idx) => {
      const globalIdx = startIndex + idx;
      if (globalIdx >= 19) {
        const slice = candles.slice(globalIdx - 19, globalIdx + 1);
        const avg = slice.reduce((acc, c) => acc + c.close, 0) / 20;
        const x = padding.left + idx * barStep + barStep / 2;
        const y = priceToY(avg);
        points.push(`${x},${y}`);
      }
    });
    return points.join(" ");
  }, [visibleCandles, candles, startIndex, barStep, maxPrice, minPrice]);

  const activeCandle = hoveredIndex !== null ? visibleCandles[hoveredIndex] : visibleCandles[visibleCandles.length - 1];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-3">
      {/* Live Simulation Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsLiveActive((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
              isLiveActive
                ? "bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            }`}
          >
            {isLiveActive ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Live Feed</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Live Market Feed</span>
              </>
            )}
          </button>

          {isLiveActive ? (
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                LIVE STREAMING (Tick {tickCounter}/8)
              </span>
              {lastTickDirection === "up" && (
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
              )}
              {lastTickDirection === "down" && (
                <ArrowDownRight className="w-3.5 h-3.5 text-rose-600 animate-bounce" />
              )}
            </div>
          ) : (
            <span className="text-slate-400 text-[11px] flex items-center gap-1">
              <Radio className="w-3 h-3 text-slate-400" /> Simulator Paused
            </span>
          )}
        </div>

        {/* Speed & Quick Injectors */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-400">Speed:</span>
            {[
              { ms: 2000, label: "2s" },
              { ms: 1200, label: "1.2s" },
              { ms: 600, label: "0.6s" },
            ].map((s) => (
              <button
                key={s.ms}
                type="button"
                onClick={() => setLiveSpeed(s.ms)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
                  liveSpeed === s.ms
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          {/* Quick Pattern Injections */}
          <span className="text-[11px] text-slate-400 font-medium">Inject Live Pattern:</span>
          <button
            type="button"
            onClick={() => injectLivePattern("hammer")}
            className="px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 font-medium text-[11px] transition-colors"
          >
            🔨 Hammer
          </button>
          <button
            type="button"
            onClick={() => injectLivePattern("bullish_engulfing")}
            className="px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 font-medium text-[11px] transition-colors"
          >
            🟢 Engulfing
          </button>
          <button
            type="button"
            onClick={() => injectLivePattern("shooting_star")}
            className="px-2 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 hover:bg-rose-200 font-medium text-[11px] transition-colors"
          >
            🔴 Shooting Star
          </button>
          <button
            type="button"
            onClick={() => injectLivePattern("morning_star")}
            className="px-2 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 hover:bg-indigo-200 font-medium text-[11px] transition-colors"
          >
            ⭐ Morning Star
          </button>
          <button
            type="button"
            onClick={() => injectLivePattern("doji")}
            className="px-2 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-200 font-medium text-[11px] transition-colors"
          >
            ⚖ Doji
          </button>
        </div>
      </div>

      {/* Live Pattern Detection Banner */}
      {liveAlert && (
        <div
          className={`rounded-xl p-3 border animate-in fade-in slide-in-from-top duration-300 flex items-start justify-between gap-3 text-xs ${
            liveAlert.sentiment === "bullish"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
              : liveAlert.sentiment === "bearish"
              ? "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200"
              : "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200"
          }`}
        >
          <div className="flex items-start gap-2.5">
            <div
              className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                liveAlert.sentiment === "bullish"
                  ? "bg-emerald-600 text-white"
                  : liveAlert.sentiment === "bearish"
                  ? "bg-rose-600 text-white"
                  : "bg-amber-600 text-white"
              }`}
            >
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight">
                  ⚡ LIVE PATTERN DETECTED: {liveAlert.pattern_name}
                  {liveAlert.japanese_name && ` (${liveAlert.japanese_name})`}
                </span>
                <Badge
                  variant={
                    liveAlert.sentiment === "bullish"
                      ? "success"
                      : liveAlert.sentiment === "bearish"
                      ? "danger"
                      : "neutral"
                  }
                  size="sm"
                >
                  {liveAlert.sentiment.toUpperCase()} • {liveAlert.reliability} Reliability
                </Badge>
                <span className="text-[10px] opacity-75 font-mono">{liveAlert.timestamp}</span>
              </div>
              <p className="mt-0.5 text-slate-700 dark:text-slate-300 leading-snug">
                {liveAlert.implication} Formed at{" "}
                <span className="font-mono font-bold">₹{liveAlert.price.toFixed(2)}</span>
                {liveAlert.suggested_target && (
                  <span className="ml-2 font-mono">
                    • Target: <span className="font-bold text-emerald-600">₹{liveAlert.suggested_target}</span>
                  </span>
                )}
                {liveAlert.suggested_stop_loss && (
                  <span className="ml-2 font-mono">
                    • Stop Loss: <span className="font-bold text-rose-600">₹{liveAlert.suggested_stop_loss}</span>
                  </span>
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setLiveAlert(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Chart Top Controls & Live Candle Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {activeCandle && (
            <>
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                {activeCandle.timestamp}
              </span>
              <span className="text-slate-500">
                O: <span className="font-mono text-slate-800 dark:text-slate-200">₹{activeCandle.open.toFixed(2)}</span>
              </span>
              <span className="text-slate-500">
                H: <span className="font-mono text-slate-800 dark:text-slate-200">₹{activeCandle.high.toFixed(2)}</span>
              </span>
              <span className="text-slate-500">
                L: <span className="font-mono text-slate-800 dark:text-slate-200">₹{activeCandle.low.toFixed(2)}</span>
              </span>
              <span className="text-slate-500">
                C: <span className="font-mono font-bold text-slate-900 dark:text-white">₹{activeCandle.close.toFixed(2)}</span>
              </span>
              <span
                className={`font-mono font-semibold px-1.5 py-0.5 rounded text-[11px] ${
                  activeCandle.change >= 0
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
                }`}
              >
                {activeCandle.change >= 0 ? "+" : ""}
                {activeCandle.change.toFixed(2)} ({activeCandle.change_percent.toFixed(2)}%)
              </span>
            </>
          )}
        </div>

        {/* View Slice Controls & Reset */}
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => {
              setCandles(initialCandles);
              setPatterns(initialPatterns);
              setLiveAlert(null);
            }}
            className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors mr-2"
          >
            <RefreshCw className="w-3 h-3" /> Reset Chart
          </button>

          <span className="text-slate-400 text-[11px] mr-1">Zoom:</span>
          {[15, 30, 45].map((cnt) => (
            <button
              key={cnt}
              type="button"
              onClick={() => setViewCount(cnt)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                viewCount === cnt
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {cnt}D
            </button>
          ))}
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="supportGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="resistGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
            const y = padding.top + pct * priceChartHeight;
            const price = maxPrice - pct * (maxPrice - minPrice);
            return (
              <g key={pct}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="currentColor"
                  strokeDasharray="3 3"
                  className="text-slate-100 dark:text-slate-800/80"
                />
                <text
                  x={width - padding.right + 6}
                  y={y + 3}
                  className="fill-slate-400 dark:fill-slate-500 font-mono text-[9px]"
                >
                  ₹{price.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Support Line */}
          {supportLevel && (
            <g>
              <line
                x1={padding.left}
                y1={priceToY(supportLevel)}
                x2={width - padding.right}
                y2={priceToY(supportLevel)}
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
              <text
                x={padding.left + 8}
                y={priceToY(supportLevel) - 4}
                fill="#10b981"
                className="font-mono text-[9px] font-semibold"
              >
                Support ₹{supportLevel.toFixed(1)}
              </text>
            </g>
          )}

          {/* Resistance Line */}
          {resistanceLevel && (
            <g>
              <line
                x1={padding.left}
                y1={priceToY(resistanceLevel)}
                x2={width - padding.right}
                y2={priceToY(resistanceLevel)}
                stroke="#f43f5e"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
              <text
                x={padding.left + 8}
                y={priceToY(resistanceLevel) - 4}
                fill="#f43f5e"
                className="font-mono text-[9px] font-semibold"
              >
                Resistance ₹{resistanceLevel.toFixed(1)}
              </text>
            </g>
          )}

          {/* SMA 20 Line Overlay */}
          {smaLinePoints && (
            <polyline
              points={smaLinePoints}
              fill="none"
              stroke="#6366f1"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.85"
            />
          )}

          {/* Volume Separator */}
          <line
            x1={padding.left}
            y1={volumeTop - 5}
            x2={width - padding.right}
            y2={volumeTop - 5}
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-800"
          />
          <text
            x={padding.left}
            y={volumeTop + 10}
            className="fill-slate-400 font-sans text-[8px] uppercase tracking-wider"
          >
            Volume
          </text>

          {/* Candlestick & Volume Bars */}
          {visibleCandles.map((c, idx) => {
            const x = padding.left + idx * barStep + barStep / 2;
            const isGreen = c.close >= c.open;
            const colorClass = isGreen
              ? "fill-emerald-500 stroke-emerald-500"
              : "fill-rose-500 stroke-rose-500";
            const bodyTop = priceToY(Math.max(c.open, c.close));
            const bodyBottom = priceToY(Math.min(c.open, c.close));
            const bodyHeight = Math.max(bodyBottom - bodyTop, 1.5);
            const highY = priceToY(c.high);
            const lowY = priceToY(c.low);

            const vHeight = volumeToHeight(c.volume);
            const vY = height - padding.bottom - vHeight;

            const isHovered = hoveredIndex === idx;
            const isLatestLiveBar = isLiveActive && idx === visibleCandles.length - 1;

            return (
              <g
                key={`${c.timestamp}-${idx}`}
                className="cursor-pointer transition-opacity"
                onMouseEnter={() => setHoveredIndex(idx)}
              >
                {/* Hover vertical crosshair */}
                {isHovered && (
                  <rect
                    x={x - barStep / 2}
                    y={padding.top}
                    width={barStep}
                    height={height - padding.top - padding.bottom}
                    className="fill-slate-100/50 dark:fill-slate-800/40 pointer-events-none"
                  />
                )}

                {/* Live pulsing highlight halo for latest active bar */}
                {isLatestLiveBar && (
                  <rect
                    x={x - barStep / 2}
                    y={padding.top}
                    width={barStep}
                    height={height - padding.top - padding.bottom}
                    className="fill-emerald-400/10 dark:fill-emerald-400/15 animate-pulse pointer-events-none"
                  />
                )}

                {/* Volume bar */}
                <rect
                  x={x - candleBodyWidth / 2}
                  y={vY}
                  width={candleBodyWidth}
                  height={vHeight}
                  className={isGreen ? "fill-emerald-500/40" : "fill-rose-500/40"}
                />

                {/* Candle Wick */}
                <line
                  x1={x}
                  y1={highY}
                  x2={x}
                  y2={lowY}
                  strokeWidth="1.2"
                  className={colorClass}
                />

                {/* Candle Real Body */}
                <rect
                  x={x - candleBodyWidth / 2}
                  y={bodyTop}
                  width={candleBodyWidth}
                  height={bodyHeight}
                  rx="1"
                  className={colorClass}
                />

                {/* Active live dot on current bar */}
                {isLatestLiveBar && (
                  <circle
                    cx={x}
                    cy={priceToY(c.close)}
                    r="3.5"
                    fill={isGreen ? "#10b981" : "#f43f5e"}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="animate-ping"
                  />
                )}

                {/* X-axis date stamp (every 5 bars) */}
                {idx % 5 === 0 && (
                  <text
                    x={x}
                    y={height - padding.bottom + 16}
                    textAnchor="middle"
                    className="fill-slate-400 dark:fill-slate-500 font-mono text-[9px]"
                  >
                    {c.timestamp.slice(0, 5)}
                  </text>
                )}
              </g>
            );
          })}

          {/* Pattern Recognition Markers Placed Directly on Trigger Bars */}
          {visiblePatterns.map((pat) => {
            const visibleIdx = pat.trigger_candle_index - startIndex;
            if (visibleIdx < 0 || visibleIdx >= visibleCandles.length) return null;
            const candle = visibleCandles[visibleIdx];
            const x = padding.left + visibleIdx * barStep + barStep / 2;
            const isBullish = pat.sentiment === "bullish";
            const markerY = isBullish ? priceToY(candle.low) + 16 : priceToY(candle.high) - 14;
            const isSelected = selectedPatternId === pat.pattern_id;

            return (
              <g
                key={`${pat.pattern_id}-${pat.trigger_candle_index}`}
                className="cursor-pointer group"
                onClick={() => onSelectPattern && onSelectPattern(pat)}
              >
                <circle
                  cx={x}
                  cy={markerY}
                  r={isSelected ? "9" : "7"}
                  fill={isBullish ? "#10b981" : pat.sentiment === "bearish" ? "#f43f5e" : "#8b5cf6"}
                  stroke="#ffffff"
                  strokeWidth={isSelected ? "2.5" : "1.5"}
                  className="transition-transform group-hover:scale-125"
                />
                <text
                  x={x}
                  y={markerY + 3.5}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="8"
                  fontWeight="bold"
                >
                  {isBullish ? "▲" : pat.sentiment === "bearish" ? "▼" : "•"}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Interactive Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Bullish Candle / ▲ Pattern</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Bearish Candle / ▼ Pattern</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-indigo-500 rounded" />
            <span>20-Day SMA</span>
          </div>
        </div>

        <span className="text-slate-400 text-[10px]">
          Hover candles for OHLC details • Click ▲ / ▼ marker tags to inspect pattern • Click [Start Live] for ticking simulator
        </span>
      </div>
    </div>
  );
};
