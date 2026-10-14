"use client";

import React from "react";
import { SentimentSummary, TechnicalIndicators } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Gauge,
  Activity,
  Layers,
  ArrowUpCircle,
  ArrowDownCircle,
  Shield,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

interface SentimentMeterProps {
  sentiment: SentimentSummary;
  indicators: TechnicalIndicators;
}

export const SentimentMeter: React.FC<SentimentMeterProps> = ({
  sentiment,
  indicators,
}) => {
  // Map sentiment score (-100 to +100) to percentage (0% to 100%) for gauge positioning
  const percentage = Math.min(Math.max((sentiment.score + 100) / 2, 0), 100);

  const getSentimentColor = () => {
    if (sentiment.score >= 40) return "text-emerald-600 dark:text-emerald-400";
    if (sentiment.score >= 15) return "text-teal-600 dark:text-teal-400";
    if (sentiment.score <= -40) return "text-rose-600 dark:text-rose-400";
    if (sentiment.score <= -15) return "text-amber-600 dark:text-amber-400";
    return "text-slate-600 dark:text-slate-400";
  };

  const getRsiColor = (rsi?: number) => {
    if (!rsi) return "text-slate-500";
    if (rsi < 35) return "text-emerald-600 dark:text-emerald-400 font-bold"; // Oversold (Bullish setup)
    if (rsi > 68) return "text-rose-600 dark:text-rose-400 font-bold"; // Overbought (Bearish setup)
    return "text-slate-700 dark:text-slate-300";
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Gauge className="w-4 h-4 text-emerald-600" /> Technical Sentiment Scorecard
          </CardTitle>
          <Badge
            variant={
              sentiment.score > 20
                ? "success"
                : sentiment.score < -20
                ? "danger"
                : "neutral"
            }
            size="sm"
          >
            {sentiment.actionable_signal}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 text-xs">
        {/* Score Dial & Bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-slate-500 font-medium">Aggregated Sentiment</span>
            <span className={`text-base font-extrabold font-mono ${getSentimentColor()}`}>
              {sentiment.score > 0 ? `+${sentiment.score}` : sentiment.score} / 100
            </span>
          </div>

          <div className="relative w-full h-3 bg-gradient-to-r from-rose-500 via-amber-400 via-slate-300 via-teal-400 to-emerald-500 rounded-full overflow-hidden shadow-inner">
            <div
              className="absolute top-0 bottom-0 w-2.5 bg-slate-900 dark:bg-white rounded-full shadow-md border border-white dark:border-slate-900 transition-all duration-500"
              style={{ left: `calc(${percentage}% - 5px)` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
            <span>-100 (Bearish)</span>
            <span>0 (Neutral)</span>
            <span>+100 (Bullish)</span>
          </div>
        </div>

        {/* Pattern Tally Counters */}
        <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 dark:border-slate-800 text-center">
          <div className="p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30">
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">
              Bullish Signals
            </p>
            <p className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-300">
              {sentiment.bullish_pattern_count}
            </p>
          </div>

          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
            <p className="text-[10px] text-slate-500 font-semibold uppercase">
              Indecision Bars
            </p>
            <p className="text-lg font-bold font-mono text-slate-700 dark:text-slate-300">
              {sentiment.neutral_pattern_count}
            </p>
          </div>

          <div className="p-2 rounded-lg bg-rose-50/60 dark:bg-rose-950/30">
            <p className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold uppercase">
              Bearish Signals
            </p>
            <p className="text-lg font-bold font-mono text-rose-700 dark:text-rose-300">
              {sentiment.bearish_pattern_count}
            </p>
          </div>
        </div>

        {/* Technical Indicators Matrix */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
              <Activity className="w-3 h-3 text-indigo-500" /> Momentum & Volatility
            </span>
            <div className="flex justify-between items-center pt-1 font-mono">
              <span className="text-slate-500">RSI (14):</span>
              <span className={getRsiColor(indicators.rsi_14)}>
                {indicators.rsi_14 ?? "---"}
                {indicators.rsi_14 && indicators.rsi_14 < 35 && " (Oversold)"}
                {indicators.rsi_14 && indicators.rsi_14 > 68 && " (Overbought)"}
              </span>
            </div>
            <div className="flex justify-between items-center font-mono">
              <span className="text-slate-500">ATR Volatility:</span>
              <span className="text-slate-800 dark:text-slate-200">
                ₹{indicators.atr_14?.toFixed(2) ?? "---"}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
              <Layers className="w-3 h-3 text-emerald-500" /> Key Price Floors & Ceilings
            </span>
            <div className="flex justify-between items-center pt-1 font-mono">
              <span className="text-slate-500">Nearest Support:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                ₹{indicators.nearest_support.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center font-mono">
              <span className="text-slate-500">Nearest Resistance:</span>
              <span className="text-rose-600 dark:text-rose-400 font-semibold">
                ₹{indicators.nearest_resistance.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
