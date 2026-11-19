"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  computeReadinessScores,
  calculateRadarCoordinates,
  RADAR_DIMENSIONS,
} from "@/lib/readiness";
import { BusinessReadinessInput, BusinessReadinessReport } from "@/types";
import { useLanguage, translations } from "@/lib/i18n";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  FileCheck2,
  Calendar,
  IndianRupee,
  BookOpenCheck,
  Sliders,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export interface ReadinessRadarProps {
  initialInput?: Partial<BusinessReadinessInput>;
  onReportChange?: (report: BusinessReadinessReport) => void;
  showControls?: boolean;
  className?: string;
}

const DEFAULT_INPUT: BusinessReadinessInput = {
  annual_turnover: 650000,
  monthly_revenue: 65000,
  monthly_expense: 40000,
  existing_loans: 5000,
  months_in_operation: 18,
  has_udyam: true,
  has_pan: true,
  has_gst: false,
  has_bank_account: true,
  has_aadhaar: true,
  record_keeping_type: "bank_recorded",
};

export const ReadinessRadar: React.FC<ReadinessRadarProps> = ({
  initialInput,
  onReportChange,
  showControls = true,
  className = "",
}) => {
  const { t, formatCurrency } = useLanguage();
  const r = t.readiness || translations.en.readiness;

  const [formData, setFormData] = useState<BusinessReadinessInput>(() => ({
    ...DEFAULT_INPUT,
    ...initialInput,
  }));

  const [isControlsExpanded, setIsControlsExpanded] = useState<boolean>(showControls);

  // Compute deterministic scores
  const report = useMemo(() => computeReadinessScores(formData), [formData]);

  // Extract scores matching RADAR_DIMENSIONS order
  const scores = useMemo(() => {
    const dimMap = new Map(report.dimensions.map((d) => [d.dimension_key, d.score]));
    return RADAR_DIMENSIONS.map((d) => dimMap.get(d.key) ?? 0);
  }, [report]);

  // SVG Radar geometry
  const geometry = useMemo(() => {
    return calculateRadarCoordinates(scores, 160, 160, 110);
  }, [scores]);

  useEffect(() => {
    if (onReportChange) {
      onReportChange(report);
    }
  }, [report, onReportChange]);

  const getDimensionIcon = (key: string) => {
    switch (key) {
      case "capital":
        return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case "documents":
        return <FileCheck2 className="w-4 h-4 text-indigo-600" />;
      case "vintage":
        return <Calendar className="w-4 h-4 text-amber-600" />;
      case "income":
        return <IndianRupee className="w-4 h-4 text-blue-600" />;
      case "record_keeping":
        return <BookOpenCheck className="w-4 h-4 text-purple-600" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 45) return "text-amber-600 dark:text-amber-400";
    return "text-rose-600 dark:text-rose-400";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 75) return "brand";
    if (score >= 45) return "warning";
    return "danger";
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Prominent Mandatory Checkpoint Warning Banner */}
      <div
        role="alert"
        className="flex items-start gap-3 p-4 rounded-xl border border-amber-300 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200"
      >
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-semibold">{r.estimatedWarning}</p>
          <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
            {report.authority} • Formulaic calculations are fully auditable and independent of AI speculation.
          </p>
        </div>
      </div>

      {/* Main Grid: Radar on Left, Dimension Breakdown Cards on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Radar Graphic Card */}
        <Card className="lg:col-span-5 flex flex-col items-center">
          <CardHeader className="w-full text-center pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {r.title}
              </span>
              <Badge variant={getScoreBadgeVariant(report.overall_readiness_score)} size="sm">
                {report.overall_readiness_score} / 100
              </Badge>
            </div>
            <CardTitle className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              <span className={getScoreColor(report.overall_readiness_score)}>
                {report.overall_readiness_score}
              </span>
              <span className="text-sm font-medium text-slate-500 ml-1.5">
                {r.outOf100}
              </span>
            </CardTitle>
            <CardDescription className="text-xs">
              {r.overallScore}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col items-center p-2 sm:p-4 w-full">
            {/* SVG Radar */}
            <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center">
              <svg
                viewBox="0 0 320 320"
                className="w-full h-full overflow-visible"
                aria-label="5-Dimension Readiness Radar Chart"
              >
                {/* Concentric grid webs */}
                {geometry.webPolygons.map((pts, idx) => (
                  <polygon
                    key={`web-${idx}`}
                    points={pts}
                    fill={idx === 3 ? "rgba(16, 185, 129, 0.03)" : "none"}
                    stroke="currentColor"
                    strokeWidth={idx === 3 ? "1.5" : "1"}
                    strokeDasharray={idx === 3 ? undefined : "3 3"}
                    className="text-slate-200 dark:text-slate-800"
                  />
                ))}

                {/* Concentric web level labels (25, 50, 75, 100) */}
                {[25, 50, 75, 100].map((level) => {
                  const y = 160 - 110 * (level / 100);
                  return (
                    <text
                      key={`lvl-${level}`}
                      x="164"
                      y={y + 3}
                      fontSize="9"
                      fill="currentColor"
                      className="text-slate-400 dark:text-slate-600 select-none font-mono"
                    >
                      {level}
                    </text>
                  );
                })}

                {/* 5 Spoke Axis lines */}
                {geometry.axisLines.map((axis, i) => (
                  <g key={`axis-${i}`}>
                    <line
                      x1={axis.x1}
                      y1={axis.y1}
                      x2={axis.x2}
                      y2={axis.y2}
                      stroke="currentColor"
                      strokeWidth="1.2"
                      className="text-slate-300 dark:text-slate-700"
                    />
                    {/* Dimension Name Label */}
                    <text
                      x={axis.labelX}
                      y={axis.labelY}
                      fontSize="11"
                      fontWeight="600"
                      fill="currentColor"
                      textAnchor={
                        Math.abs(axis.labelX - 160) < 5
                          ? "middle"
                          : axis.labelX > 160
                          ? "start"
                          : "end"
                      }
                      className="text-slate-700 dark:text-slate-300 select-none"
                    >
                      {RADAR_DIMENSIONS[i].shortName}
                    </text>
                  </g>
                ))}

                {/* Data Polygon */}
                <polygon
                  points={geometry.pointsString}
                  fill="rgba(16, 185, 129, 0.28)"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  className="transition-all duration-300 ease-out"
                />

                {/* Score vertex points */}
                {geometry.points.map((pt, i) => (
                  <g key={`point-${i}`} className="transition-all duration-300 ease-out">
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="5.5"
                      fill="#10b981"
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="cursor-pointer hover:r-7 transition-all"
                    >
                      <title>{`${RADAR_DIMENSIONS[i].name}: ${scores[i]}/100`}</title>
                    </circle>
                  </g>
                ))}
              </svg>
            </div>

            {/* Quick Toggle Controls Button */}
            <div className="w-full mt-4 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">Live dynamic calculation</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsControlsExpanded(!isControlsExpanded)}
                leftIcon={<Sliders className="w-3.5 h-3.5" />}
              >
                {isControlsExpanded ? "Hide Controls" : "Adjust Form"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Dimension Breakdown Cards */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {r.dimensionsTitle}
            </h3>
            <span className="text-xs text-slate-500">5 Auditable Pillars</span>
          </div>

          <div className="space-y-3">
            {report.dimensions.map((dim) => (
              <div
                key={dim.dimension_key}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getDimensionIcon(dim.dimension_key)}
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {dim.dimension_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {dim.assessment_tier}
                    </span>
                    <span className={`text-sm font-extrabold ${getScoreColor(dim.score)}`}>
                      {dim.score}/100
                    </span>
                  </div>
                </div>

                {/* Score Progress Bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      dim.score >= 75
                        ? "bg-emerald-500"
                        : dim.score >= 45
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                    style={{ width: `${dim.score}%` }}
                  />
                </div>

                {/* Formula Explanation */}
                <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 mr-1">
                    {r.formulaLabel}:
                  </span>
                  {dim.formula_explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Form Controls for Adjusting Parameters */}
      {isControlsExpanded && (
        <Card className="border-emerald-200 dark:border-emerald-950/80 bg-emerald-50/20 dark:bg-emerald-950/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                {r.adjustParameters}
              </CardTitle>
              <Badge variant="neutral" size="sm">
                Instant Reactive Updates
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Modify operational values below to observe real-time score and radar polygon recalculations.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Numeric Sliders / Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {r.monthlyRevenue}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="500000"
                    step="5000"
                    value={formData.monthly_revenue}
                    onChange={(e) =>
                      setFormData({ ...formData, monthly_revenue: Number(e.target.value) })
                    }
                    className="w-full accent-emerald-600"
                  />
                  <span className="text-xs font-mono font-semibold w-24 text-right">
                    {formatCurrency(formData.monthly_revenue)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {r.monthlyExpense}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="400000"
                    step="5000"
                    value={formData.monthly_expense}
                    onChange={(e) =>
                      setFormData({ ...formData, monthly_expense: Number(e.target.value) })
                    }
                    className="w-full accent-emerald-600"
                  />
                  <span className="text-xs font-mono font-semibold w-24 text-right">
                    {formatCurrency(formData.monthly_expense)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {r.existingDebt}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="1000"
                    value={formData.existing_loans}
                    onChange={(e) =>
                      setFormData({ ...formData, existing_loans: Number(e.target.value) })
                    }
                    className="w-full accent-emerald-600"
                  />
                  <span className="text-xs font-mono font-semibold w-24 text-right">
                    {formatCurrency(formData.existing_loans)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {r.turnover}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="5000000"
                    step="50000"
                    value={formData.annual_turnover}
                    onChange={(e) =>
                      setFormData({ ...formData, annual_turnover: Number(e.target.value) })
                    }
                    className="w-full accent-emerald-600"
                  />
                  <span className="text-xs font-mono font-semibold w-24 text-right">
                    {formatCurrency(formData.annual_turnover)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {r.vintageMonths}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="48"
                    step="1"
                    value={formData.months_in_operation}
                    onChange={(e) =>
                      setFormData({ ...formData, months_in_operation: Number(e.target.value) })
                    }
                    className="w-full accent-emerald-600"
                  />
                  <span className="text-xs font-mono font-semibold w-16 text-right">
                    {formData.months_in_operation}m
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {r.recordKeeping}
                </label>
                <select
                  value={formData.record_keeping_type}
                  onChange={(e) =>
                    setFormData({ ...formData, record_keeping_type: e.target.value })
                  }
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white"
                >
                  <option value="informal">{r.informal}</option>
                  <option value="bank_recorded">{r.bankRecorded}</option>
                  <option value="formal_accounting">{r.formalBooks}</option>
                </select>
              </div>
            </div>

            {/* Checkboxes for Credentials */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {r.credentialsTitle} (+20 pts each)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { key: "has_aadhaar", label: "Aadhaar Card" },
                  { key: "has_pan", label: "PAN Card" },
                  { key: "has_bank_account", label: "Bank Account" },
                  { key: "has_udyam", label: "Udyam MSME" },
                  { key: "has_gst", label: "GSTIN Certificate" },
                ].map((item) => {
                  const isChecked = Boolean(formData[item.key as keyof BusinessReadinessInput]);
                  return (
                    <button
                      type="button"
                      key={item.key}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          [item.key]: !isChecked,
                        })
                      }
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-left text-xs font-medium transition-all ${
                        isChecked
                          ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <span>{item.label}</span>
                      {isChecked ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
