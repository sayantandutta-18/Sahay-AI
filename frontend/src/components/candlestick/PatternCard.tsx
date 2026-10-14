"use client";

import React from "react";
import { CandlestickPatternMatch } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  TrendingUp,
  TrendingDown,
  HelpCircle,
  ShieldCheck,
  Target,
  ArrowRight,
  Info,
} from "lucide-react";

interface PatternCardProps {
  pattern: CandlestickPatternMatch;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const PatternCard: React.FC<PatternCardProps> = ({
  pattern,
  isSelected,
  onSelect,
}) => {
  const isBullish = pattern.sentiment === "bullish";
  const isBearish = pattern.sentiment === "bearish";

  return (
    <Card
      hover
      className={`transition-all cursor-pointer ${
        isSelected
          ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/10 dark:bg-emerald-950/20"
          : "border-slate-200 dark:border-slate-800"
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-base font-bold text-slate-900 dark:text-white">
                {pattern.pattern_name}
              </span>
              {pattern.japanese_name && (
                <span className="text-xs font-serif italic text-slate-400">
                  ({pattern.japanese_name})
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Detected on {pattern.trigger_candle_date}
            </p>
          </div>

          <Badge
            variant={isBullish ? "success" : isBearish ? "danger" : "neutral"}
            size="sm"
          >
            {isBullish ? (
              <TrendingUp className="w-3 h-3 mr-1 inline" />
            ) : isBearish ? (
              <TrendingDown className="w-3 h-3 mr-1 inline" />
            ) : (
              <HelpCircle className="w-3 h-3 mr-1 inline" />
            )}
            {pattern.sentiment.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 text-xs">
        {/* Reliability Bar */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span>Historical Reliability</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {pattern.reliability} ({pattern.reliability_score}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                pattern.reliability_score >= 85
                  ? "bg-emerald-500"
                  : pattern.reliability_score >= 70
                  ? "bg-teal-500"
                  : "bg-amber-500"
              }`}
              style={{ width: `${pattern.reliability_score}%` }}
            />
          </div>
        </div>

        {/* Anatomical Explanation */}
        <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
          {pattern.description}
        </p>

        {/* Actionable Implication */}
        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px]">
          <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mb-0.5">
            <Info className="w-3 h-3 text-emerald-600" /> Market Dynamics:
          </span>
          <p className="text-slate-600 dark:text-slate-400">{pattern.implication}</p>
        </div>

        {/* Technical Risk Levels if available */}
        {(pattern.suggested_stop_loss || pattern.suggested_target) && (
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
            {pattern.suggested_stop_loss && (
              <div className="p-1.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-mono">
                <span className="text-[10px] text-rose-500 block">Stop-Loss (Risk)</span>
                ₹{pattern.suggested_stop_loss.toFixed(2)}
              </div>
            )}
            {pattern.suggested_target && (
              <div className="p-1.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-mono">
                <span className="text-[10px] text-emerald-500 block">Technical Target</span>
                ₹{pattern.suggested_target.toFixed(2)}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
