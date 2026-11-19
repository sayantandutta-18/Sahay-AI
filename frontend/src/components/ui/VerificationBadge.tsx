"use client";

import React, { useState, useRef, useEffect } from "react";
import { ShieldCheck, AlertTriangle, HelpCircle, ExternalLink, Calendar, Building, X, Info } from "lucide-react";
import { useLanguage, translations } from "@/lib/i18n";
import { getVerificationState, type VerificationState } from "@/lib/verification";

export { getVerificationState, type VerificationState };

export interface VerificationBadgeProps {
  status?: string;
  lastVerifiedAt?: string | null;
  officialUrl?: string | null;
  verifier?: string | null;
  schemeName?: string;
  size?: "sm" | "md";
  className?: string;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  status,
  lastVerifiedAt,
  officialUrl,
  verifier,
  schemeName,
  size = "md",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const v = t.verification || translations.en.verification;

  const [resolvedState, setResolvedState] = useState<VerificationState>(() =>
    getVerificationState(status, lastVerifiedAt, officialUrl, 180, null)
  );

  useEffect(() => {
    setResolvedState(getVerificationState(status, lastVerifiedAt, officialUrl, 180, Date.now()));
  }, [status, lastVerifiedAt, officialUrl]);

  // Close modal/popover on click outside or Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Color-blind accessible configurations: text + icons + explicit symbols alongside color
  const stateConfig = {
    verified: {
      label: `[✓ ${v.verifiedBadge}]`,
      badgeClass:
        "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/80",
      icon: <ShieldCheck className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} aria-hidden="true" />,
      title: v.verified,
      desc: v.verifiedDesc,
      pillColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 border-emerald-300",
    },
    outdated: {
      label: `[⚠ ${v.outdatedBadge}]`,
      badgeClass:
        "bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-700 hover:bg-rose-100 dark:hover:bg-rose-900/80",
      icon: <AlertTriangle className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} aria-hidden="true" />,
      title: v.outdated,
      desc: v.outdatedDesc,
      pillColor: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200 border-rose-300",
    },
    unverified: {
      label: `[? ${v.unverifiedBadge}]`,
      badgeClass:
        "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/80",
      icon: <HelpCircle className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} aria-hidden="true" />,
      title: v.unverified,
      desc: v.unverifiedDesc,
      pillColor: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border-amber-300",
    },
  }[resolvedState];

  const sizeClasses =
    size === "sm"
      ? "px-2 py-0.5 text-[10px] gap-1 font-semibold tracking-wide"
      : "px-2.5 py-1 text-xs gap-1.5 font-bold tracking-wide";

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      {/* Interactive Badge Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        title={`${v.dialogTitle}: ${stateConfig.title}. Click to view official source and verification audit.`}
        className={`inline-flex items-center rounded-full border cursor-pointer transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-500 ${sizeClasses} ${stateConfig.badgeClass}`}
      >
        {stateConfig.icon}
        <span>{stateConfig.label}</span>
      </button>

      {/* Popover / Dialog showing official source link and verified date */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={v.dialogTitle}
          className="absolute z-50 left-0 sm:left-auto sm:right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xl text-xs text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-100"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-3">
            <div className="flex items-center gap-1.5">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${stateConfig.pillColor}`}>
                {stateConfig.icon}
                {stateConfig.title}
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {v.dialogTitle}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
              aria-label={v.close}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scheme Name if supplied */}
          {schemeName && (
            <div className="font-semibold text-slate-900 dark:text-white mb-2 leading-snug">
              {schemeName}
            </div>
          )}

          {/* Explanation note */}
          <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
            {stateConfig.desc}
          </p>

          {/* Verification Details Table / List */}
          <div className="space-y-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg p-2.5 border border-slate-100 dark:border-slate-800">
            {/* Last Verified Date */}
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> {v.lastVerifiedDate}:
              </span>
              <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                {lastVerifiedAt ? lastVerifiedAt.slice(0, 10) : "Not recorded"}
              </span>
            </div>

            {/* Verifying Authority */}
            {verifier && (
              <div className="flex items-start justify-between text-[11px] gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 shrink-0">
                  <Building className="w-3.5 h-3.5 text-slate-400" /> {v.verifiedBy}:
                </span>
                <span className="font-medium text-slate-700 dark:text-slate-300 text-right">
                  {verifier}
                </span>
              </div>
            )}

            {/* Official Source Link */}
            <div className="flex items-start justify-between text-[11px] gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 shrink-0">
                <Info className="w-3.5 h-3.5 text-slate-400" /> {v.officialSource}:
              </span>
              {officialUrl ? (
                <a
                  href={officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline break-all flex items-center gap-0.5 text-right"
                >
                  <span className="max-w-[150px] truncate">{officialUrl.replace(/^https?:\/\//, "")}</span>
                  <ExternalLink className="w-3 h-3 shrink-0 inline" />
                </a>
              ) : (
                <span className="italic text-rose-500 dark:text-rose-400">No official link provided</span>
              )}
            </div>
          </div>

          {/* Action Footer */}
          {officialUrl && (
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <a
                href={officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
              >
                {v.openPortal} <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
