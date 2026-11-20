"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { findGlossaryTerm, GlossaryDefinition } from "@/lib/glossary";
import { useLanguage } from "@/lib/i18n";
import { Badge } from "@/components/ui/Badge";
import { Info, X, HelpCircle } from "lucide-react";

export interface GlossaryTooltipProps {
  term: string;
  children?: React.ReactNode;
  className?: string;
  showIcon?: boolean;
}

export const GlossaryTooltip: React.FC<GlossaryTooltipProps> = ({
  term,
  children,
  className = "",
  showIcon = false,
}) => {
  const { lang, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; placeAbove: boolean }>({
    top: 0,
    left: 0,
    placeAbove: false,
  });

  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const definition: GlossaryDefinition | null = findGlossaryTerm(term);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = 320;
    const tooltipHeight = 180;
    const padding = 12;

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Check if place above or below
    const spaceBelow = screenHeight - rect.bottom;
    const spaceAbove = rect.top;
    const placeAbove = spaceBelow < tooltipHeight + padding && spaceAbove > tooltipHeight + padding;

    // Center horizontally on trigger, clamp to viewport edges
    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    if (left < padding) left = padding;
    if (left + tooltipWidth > screenWidth - padding) {
      left = screenWidth - tooltipWidth - padding;
    }

    const top = placeAbove
      ? rect.top - padding
      : rect.bottom + padding;

    setCoords({ top, left, placeAbove });
  };

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      updatePosition();
      setIsOpen(true);
    }, 150);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    updatePosition();
    setIsOpen((prev) => !prev);
  };

  // Keyboard navigation & dismissal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("scroll", updatePosition, { passive: true });
      window.addEventListener("resize", updatePosition);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  if (!definition) {
    return <span className={className}>{children || term}</span>;
  }

  const getLocalizedTitle = () => {
    if (lang === "bn") return definition.titleBn;
    if (lang === "hi") return definition.titleHi;
    return definition.titleEn;
  };

  const getLocalizedDef = () => {
    if (lang === "bn") return definition.defBn;
    if (lang === "hi") return definition.defHi;
    return definition.defEn;
  };

  const getLocalizedExample = () => {
    if (lang === "bn") return definition.exampleBn;
    if (lang === "hi") return definition.exampleHi;
    return definition.exampleEn;
  };

  const categoryVariant =
    definition.category === "subsidy"
      ? "success"
      : definition.category === "loan"
      ? "info"
      : definition.category === "compliance"
      ? "brand"
      : "warning";

  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  return (
    <>
      <span
        ref={triggerRef}
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={`Definition for ${definition.term}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            updatePosition();
            setIsOpen((prev) => !prev);
          }
        }}
        className={`inline-flex items-center gap-0.5 cursor-help border-b-2 border-dotted border-emerald-500/80 hover:border-emerald-600 dark:border-emerald-400 font-medium text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-emerald-100 transition-colors ${className}`}
      >
        <span>{children || definition.term}</span>
        {showIcon && <HelpCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400 opacity-75 shrink-0" />}
      </span>

      {/* Popover Portal */}
      {mounted &&
        isOpen &&
        createPortal(
          isMobile ? (
            /* Mobile Bottom Sheet Modal */
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
              <div
                ref={tooltipRef}
                className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-3 animate-in slide-in-from-bottom-4"
              >
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {getLocalizedTitle()}
                    </span>
                    <Badge variant={categoryVariant} size="sm">
                      {definition.category.toUpperCase()}
                    </Badge>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                    aria-label="Close explanation"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {getLocalizedDef()}
                </p>

                {getLocalizedExample() && (
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    {getLocalizedExample()}
                  </p>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold cursor-pointer"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Desktop Floating Popover */
            <div
              ref={tooltipRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              style={{
                position: "fixed",
                top: coords.placeAbove ? undefined : `${coords.top}px`,
                bottom: coords.placeAbove ? `${window.innerHeight - coords.top}px` : undefined,
                left: `${coords.left}px`,
                width: "320px",
                zIndex: 60,
              }}
              className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-xl space-y-2.5 animate-in fade-in zoom-in-95 pointer-events-auto"
            >
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                      {getLocalizedTitle()}
                    </span>
                  </div>
                  <Badge variant={categoryVariant} size="sm">
                    {definition.category.toUpperCase()}
                  </Badge>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5"
                  aria-label="Close tooltip"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {getLocalizedDef()}
              </p>

              {getLocalizedExample() && (
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-md border border-emerald-200 dark:border-emerald-800">
                  {getLocalizedExample()}
                </p>
              )}

              <div className="text-[10px] text-slate-400 dark:text-slate-500 pt-1 flex items-center justify-between">
                <span>{t.tour.tooltipHelp}</span>
                <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[9px] border border-slate-200 dark:border-slate-700">
                  Esc
                </kbd>
              </div>
            </div>
          ),
          document.body
        )}
    </>
  );
};

/**
 * Text parser component that automatically scans raw text and replaces known
 * glossary keywords with interactive GlossaryTooltip elements.
 */
export const HighlightGlossaryTerms: React.FC<{ text: string; className?: string }> = ({
  text,
  className = "",
}) => {
  if (!text) return null;

  // Regex targeting all key terms and their common aliases
  const termRegex = /\b(MSME|CGTMSE|MUDRA|PMEGP|Margin Money|Collateral-Free|Interest Subvention|Udyam|DPR|EDP|Banglashree|Greenfield|বাংলাশ্রী|মুদ্রা|ভর্তুকি|ক্ষুদ্র উদ্যোগ|উদ্যম)\b/gi;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = termRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const matchedTerm = match[0];
    parts.push(
      <GlossaryTooltip key={`${match.index}-${matchedTerm}`} term={matchedTerm}>
        {matchedTerm}
      </GlossaryTooltip>
    );
    lastIndex = match.index + matchedTerm.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <span className={className}>{parts}</span>;
};
