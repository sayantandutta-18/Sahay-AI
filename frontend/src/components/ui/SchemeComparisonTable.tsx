"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Scheme } from "@/types";
import { VerificationBadge } from "@/components/ui/VerificationBadge";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { HighlightGlossaryTerms } from "@/components/ui/GlossaryTooltip";
import { useLanguage, formatCurrencyINR } from "@/lib/i18n";
import {
  X,
  ExternalLink,
  Calendar,
  Globe,
  FileText,
  Building,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  PlusCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export interface SchemeComparisonTableProps {
  schemes: Scheme[];
  onRemoveScheme: (schemeId: string) => void;
  onClearAll: () => void;
  onClose?: () => void;
  warningMessage?: string | null;
  onDismissWarning?: () => void;
  onAddMore?: () => void;
}

export const SchemeComparisonTable: React.FC<SchemeComparisonTableProps> = ({
  schemes,
  onRemoveScheme,
  onClearAll,
  onClose,
  warningMessage,
  onDismissWarning,
  onAddMore,
}) => {
  const { lang, t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (schemes.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {t.comparison.emptyTitle}
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
            {t.comparison.emptyDesc}
          </p>
        </div>
        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose}>
            {t.comparison.closeComparison}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Warning Notice if user tried to select > 6 schemes */}
      {warningMessage && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 rounded-xl flex items-center justify-between text-xs text-amber-800 dark:text-amber-200 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-medium">{warningMessage}</span>
          </div>
          {onDismissWarning && (
            <button
              onClick={onDismissWarning}
              className="text-amber-700 hover:text-amber-900 dark:text-amber-300 font-bold ml-2 p-1 rounded"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Comparison Container */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg overflow-hidden">
        {/* Top Control Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                {t.comparison.title}
              </h2>
              <Badge variant="brand" size="sm">
                {t.comparison.selectedCount.replace("{count}", String(schemes.length))}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.comparison.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap justify-between sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyShareLink}
              leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            >
              {copied ? t.comparison.linkCopied : t.comparison.shareLink}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-rose-600 hover:text-rose-700 dark:text-rose-400"
            >
              {t.comparison.clearAll}
            </Button>
            {onClose && (
              <Button variant="primary" size="sm" onClick={onClose}>
                {t.comparison.closeComparison}
              </Button>
            )}
          </div>
        </div>

        {/* Scrollable Side-by-Side Comparison Matrix */}
        <div className="overflow-x-auto relative scrollbar-thin">
          <table className="w-full border-collapse text-left min-w-[700px]">
            <tbody>
              {/* Row 1: Scheme Header & Remove Action */}
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90">
                <th
                  scope="row"
                  className="sticky left-0 z-20 bg-slate-100/90 dark:bg-slate-900 p-3 sm:p-4 text-xs font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 w-44 sm:w-56 shrink-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]"
                >
                  {t.comparison.stickyParameter}
                </th>
                {schemes.map((s) => (
                  <td
                    key={s.id}
                    className="p-3 sm:p-4 align-top min-w-[240px] sm:min-w-[280px] max-w-[320px] border-r last:border-r-0 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className="font-bold text-sm text-slate-900 dark:text-white leading-snug line-clamp-2"
                        title={s.name}
                      >
                        <HighlightGlossaryTerms text={s.name} />
                      </span>
                      <button
                        onClick={() => onRemoveScheme(s.id)}
                        className="p-1 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0 focus:outline-hidden focus:ring-1 focus:ring-rose-400"
                        title={t.comparison.remove}
                        aria-label={`${t.comparison.remove} ${s.name}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div
                      className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1.5 line-clamp-1"
                      title={s.provider}
                    >
                      <Building className="w-3.5 h-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                      <span>{s.provider}</span>
                    </div>
                  </td>
                ))}
                {/* Placeholder if fewer than 6 schemes are selected */}
                {schemes.length < 6 && (
                  <td className="p-3 sm:p-4 align-middle text-center min-w-[180px] border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 border-dashed border-2 m-2">
                    <button
                      onClick={onAddMore || onClose}
                      className="inline-flex flex-col items-center justify-center text-xs font-semibold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 p-3 rounded-lg transition-colors w-full"
                    >
                      <PlusCircle className="w-5 h-5 mb-1.5 text-emerald-600" />
                      <span>Add Scheme ({6 - schemes.length} remaining)</span>
                    </button>
                  </td>
                )}
              </tr>

              {/* Row 2: Verification Status (VerificationBadge) */}
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th
                  scope="row"
                  className="sticky left-0 z-20 bg-slate-50 dark:bg-slate-900 p-3 sm:p-4 text-xs font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]"
                >
                  {t.comparison.verification}
                </th>
                {schemes.map((s) => (
                  <td
                    key={s.id}
                    className="p-3 sm:p-4 align-top border-r last:border-r-0 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                  >
                    <VerificationBadge
                      status={s.verification_status}
                      lastVerifiedAt={s.last_verified_at}
                      officialUrl={s.official_url}
                      verifier={s.verifier}
                      schemeName={s.name}
                      size="sm"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      {s.last_verified_at ? `Verified: ${s.last_verified_at}` : "Unverified"}
                    </p>
                  </td>
                ))}
                {schemes.length < 6 && <td className="bg-slate-50/20 dark:bg-slate-800/10" />}
              </tr>

              {/* Row 3: Support Type */}
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
                <th
                  scope="row"
                  className="sticky left-0 z-20 bg-slate-50 dark:bg-slate-900 p-3 sm:p-4 text-xs font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]"
                >
                  {t.comparison.schemeType}
                </th>
                {schemes.map((s) => (
                  <td
                    key={s.id}
                    className="p-3 sm:p-4 align-top border-r last:border-r-0 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                  >
                    <Badge
                      variant={
                        s.scheme_type === "subsidy"
                          ? "success"
                          : s.scheme_type === "loan"
                          ? "info"
                          : "neutral"
                      }
                      size="sm"
                    >
                      {s.scheme_type.toUpperCase()}
                    </Badge>
                  </td>
                ))}
                {schemes.length < 6 && <td className="bg-slate-50/20 dark:bg-slate-800/10" />}
              </tr>

              {/* Row 4: Maximum Financial Amount */}
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th
                  scope="row"
                  className="sticky left-0 z-20 bg-slate-50 dark:bg-slate-900 p-3 sm:p-4 text-xs font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]"
                >
                  {t.comparison.maxLimit}
                </th>
                {schemes.map((s) => (
                  <td
                    key={s.id}
                    className="p-3 sm:p-4 align-top border-r last:border-r-0 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                  >
                    <span className="font-bold text-sm sm:text-base text-emerald-600 dark:text-emerald-400">
                      {formatCurrencyINR(s.max_amount, lang)}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {s.scheme_type === "subsidy" ? "Direct Capital Grant/Margin Subsidy" : "Maximum Credit Ceiling"}
                    </p>
                  </td>
                ))}
                {schemes.length < 6 && <td className="bg-slate-50/20 dark:bg-slate-800/10" />}
              </tr>

              {/* Row 5: Interest Subsidy */}
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
                <th
                  scope="row"
                  className="sticky left-0 z-20 bg-slate-50 dark:bg-slate-900 p-3 sm:p-4 text-xs font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]"
                >
                  {t.comparison.interestSubsidy}
                </th>
                {schemes.map((s) => (
                  <td
                    key={s.id}
                    className="p-3 sm:p-4 align-top border-r last:border-r-0 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                  >
                    {s.interest_subsidy_pct > 0 ? (
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {s.interest_subsidy_pct}% p.a. subvention
                      </span>
                    ) : (
                      <span className="text-slate-400">
                        {s.scheme_type === "subsidy" ? "100% Grant / Capital Subsidy" : "Commercial Bank Rates"}
                      </span>
                    )}
                  </td>
                ))}
                {schemes.length < 6 && <td className="bg-slate-50/20 dark:bg-slate-800/10" />}
              </tr>

              {/* Row 6: State Coverage */}
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th
                  scope="row"
                  className="sticky left-0 z-20 bg-slate-50 dark:bg-slate-900 p-3 sm:p-4 text-xs font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]"
                >
                  {t.comparison.stateCoverage}
                </th>
                {schemes.map((s) => (
                  <td
                    key={s.id}
                    className="p-3 sm:p-4 align-top border-r last:border-r-0 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                  >
                    <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                      <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>
                        {s.states_served?.toUpperCase() === "ALL"
                          ? "Pan-India (All 28 States & 8 UTs)"
                          : s.states_served || "All States"}
                      </span>
                    </div>
                  </td>
                ))}
                {schemes.length < 6 && <td className="bg-slate-50/20 dark:bg-slate-800/10" />}
              </tr>

              {/* Row 7: Application Deadline */}
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
                <th
                  scope="row"
                  className="sticky left-0 z-20 bg-slate-50 dark:bg-slate-900 p-3 sm:p-4 text-xs font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]"
                >
                  {t.comparison.deadline}
                </th>
                {schemes.map((s) => (
                  <td
                    key={s.id}
                    className="p-3 sm:p-4 align-top border-r last:border-r-0 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                  >
                    <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{s.deadline || "Ongoing (Open year-round)"}</span>
                    </div>
                  </td>
                ))}
                {schemes.length < 6 && <td className="bg-slate-50/20 dark:bg-slate-800/10" />}
              </tr>

              {/* Row 8: Required Documents */}
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th
                  scope="row"
                  className="sticky left-0 z-20 bg-slate-50 dark:bg-slate-900 p-3 sm:p-4 text-xs font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]"
                >
                  {t.comparison.documents}
                </th>
                {schemes.map((s) => (
                  <td
                    key={s.id}
                    className="p-3 sm:p-4 align-top border-r last:border-r-0 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs space-y-2"
                  >
                    <div className="text-[11px] font-semibold text-slate-500">
                      {s.documents ? `${s.documents.length} verified requirements` : "No specific documents listed"}
                    </div>
                    {s.documents && s.documents.length > 0 ? (
                      <ul className="space-y-1.5">
                        {s.documents.map((doc, idx) => (
                          <li
                            key={doc.id || idx}
                            className="text-[11px] bg-slate-50 dark:bg-slate-800/80 p-1.5 rounded border border-slate-100 dark:border-slate-700 flex flex-col gap-0.5"
                          >
                            <div className="flex items-start gap-1 font-medium text-slate-800 dark:text-slate-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" />
                              <span><HighlightGlossaryTerms text={doc.title} /></span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] pl-4">
                              <span className={doc.mandatory ? "text-rose-600 font-semibold" : "text-slate-400"}>
                                {doc.mandatory ? "Mandatory" : "Optional"}
                              </span>
                              {doc.how_to_get_url && (
                                <a
                                  href={doc.how_to_get_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-600 hover:underline flex items-center gap-0.5"
                                >
                                  Get Guide <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </td>
                ))}
                {schemes.length < 6 && <td className="bg-slate-50/20 dark:bg-slate-800/10" />}
              </tr>

              {/* Row 9: Benefits Overview */}
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
                <th
                  scope="row"
                  className="sticky left-0 z-20 bg-slate-50 dark:bg-slate-900 p-3 sm:p-4 text-xs font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]"
                >
                  Key Highlights
                </th>
                {schemes.map((s) => (
                  <td
                    key={s.id}
                    className="p-3 sm:p-4 align-top border-r last:border-r-0 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300 leading-relaxed"
                  >
                    <p className="line-clamp-4">{s.detailed_benefits || s.short_description}</p>
                  </td>
                ))}
                {schemes.length < 6 && <td className="bg-slate-50/20 dark:bg-slate-800/10" />}
              </tr>

              {/* Row 10: Official Portal & Actions */}
              <tr className="bg-slate-50 dark:bg-slate-800/40">
                <th
                  scope="row"
                  className="sticky left-0 z-20 bg-slate-100 dark:bg-slate-900 p-3 sm:p-4 text-xs font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]"
                >
                  {t.comparison.officialPortal}
                </th>
                {schemes.map((s) => (
                  <td
                    key={s.id}
                    className="p-3 sm:p-4 align-middle border-r last:border-r-0 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2"
                  >
                    <a
                      href={s.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm"
                    >
                      <span>{t.comparison.openInPortal}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <Link
                      href={`/applications?scheme=${encodeURIComponent(s.slug || s.id)}`}
                      className="w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 text-[11px] font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      Track Application <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                ))}
                {schemes.length < 6 && <td className="bg-slate-50/20 dark:bg-slate-800/10" />}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
