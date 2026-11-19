"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  FileCheck2,
  Lightbulb,
  ShieldAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { SchemeDocumentRequirement } from "@/types";
import { useLanguage, translations } from "@/lib/i18n";

export interface SchemeMissingActionListProps {
  schemeId: string;
  schemeName: string;
  officialUrl: string;
  documents?: SchemeDocumentRequirement[];
  failedHardRules?: string[];
  missingInfoRules?: string[];
  nearMissUnlockPath?: string | null;
  initialAcquiredDocs?: Record<string, boolean>;
  className?: string;
}

export const SchemeMissingActionList: React.FC<SchemeMissingActionListProps> = ({
  schemeId,
  schemeName,
  officialUrl,
  documents = [],
  failedHardRules = [],
  missingInfoRules = [],
  nearMissUnlockPath,
  initialAcquiredDocs = {},
  className = "",
}) => {
  const { t } = useLanguage();
  const cl = t.checklist || translations.en.checklist;

  const storageKey = `sahay_checklist_${schemeId}`;
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});
  const [isClient, setIsClient] = useState(false);

  // Initialize and load saved state from browser localStorage on mount
  useEffect(() => {
    setIsClient(true);
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setCheckedMap(JSON.parse(saved));
      } else {
        // Initialize default acquired status based on user onboarding profile
        const initial: Record<string, boolean> = {};
        documents.forEach((doc) => {
          const docType = doc.document_type.toLowerCase();
          const docKey = `doc_${doc.id || docType}`;
          const isAcquired =
            Boolean(initialAcquiredDocs[docType]) ||
            Boolean(initialAcquiredDocs[`has_${docType}`]) ||
            Boolean(initialAcquiredDocs[`has${docType.charAt(0).toUpperCase() + docType.slice(1)}`]);
          if (isAcquired) {
            initial[docKey] = true;
          }
        });
        setCheckedMap(initial);
      }
    } catch {
      // Fallback if localStorage is inaccessible
    }
  }, [storageKey, documents, initialAcquiredDocs]);

  const toggleItem = (itemId: string) => {
    setCheckedMap((prev) => {
      const updated = { ...prev, [itemId]: !prev[itemId] };
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {
        // Ignore storage write error
      }
      return updated;
    });
  };

  // Build total actionable checklist items
  const docItems = documents.map((doc) => ({
    id: `doc_${doc.id || doc.document_type}`,
    title: doc.title,
    description: doc.description,
    link: doc.how_to_get_url || officialUrl,
    mandatory: doc.mandatory,
    type: "document" as const,
  }));

  const unmetItems = failedHardRules.map((rule, idx) => ({
    id: `unmet_${idx}_${rule.slice(0, 15)}`,
    title: rule,
    description: "Criteria parameter must be met to qualify under ministry rules.",
    link: officialUrl,
    mandatory: true,
    type: "unmet" as const,
  }));

  const missingInfoItems = missingInfoRules.map((rule, idx) => ({
    id: `missing_${idx}_${rule.slice(0, 15)}`,
    title: rule,
    description: "Questionnaire parameter required to evaluate complete qualification.",
    link: officialUrl,
    mandatory: true,
    type: "missing_info" as const,
  }));

  const allItems = [...docItems, ...unmetItems, ...missingInfoItems];
  const totalCount = allItems.length;
  const completedCount = allItems.filter((item) => Boolean(checkedMap[item.id])).length;
  const isFullyComplete = totalCount > 0 && completedCount === totalCount;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header and Progress Bar */}
      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <FileCheck2 className="w-4 h-4 text-emerald-600" />
            {cl.title}
          </span>
          <span className="font-semibold text-slate-600 dark:text-slate-400">
            {completedCount} / {totalCount} {cl.completed} ({progressPct}%)
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${
              isFullyComplete ? "bg-emerald-600" : "bg-sky-600"
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Completion Banner */}
      {isFullyComplete && (
        <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{cl.allCompleted}</span>
          </div>
          <a
            href={officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shrink-0 transition-colors"
          >
            {cl.applyPortal} <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* 1. Required Documents List */}
      {docItems.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <FileCheck2 className="w-4 h-4 text-slate-500" />
            {cl.requiredDocs} ({docItems.length})
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {docItems.map((item) => {
              const isChecked = Boolean(checkedMap[item.id]);
              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border transition-all text-xs flex items-start justify-between gap-3 ${
                    isChecked
                      ? "border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20"
                      : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/80"
                  }`}
                >
                  <label className="flex items-start gap-2.5 cursor-pointer select-none grow">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleItem(item.id)}
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                    />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`font-semibold ${
                            isChecked
                              ? "line-through text-slate-500 dark:text-slate-400"
                              : "text-slate-900 dark:text-white"
                          }`}
                        >
                          {item.title}
                        </span>
                        <Badge variant={item.mandatory ? "neutral" : "neutral"} size="sm">
                          {item.mandatory ? cl.mandatory : cl.optional}
                        </Badge>
                        <Badge variant={isChecked ? "success" : "warning"} size="sm">
                          {isChecked ? cl.acquired : cl.missing}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.description}
                      </p>
                    </div>
                  </label>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline shrink-0 pt-0.5"
                    title={`Open ${cl.getDoc}`}
                  >
                    {cl.getDoc} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Unmet Eligibility Conditions */}
      {unmetItems.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            {cl.unmetRules} ({unmetItems.length})
          </h4>
          <div className="space-y-2">
            {unmetItems.map((item) => {
              const isChecked = Boolean(checkedMap[item.id]);
              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border transition-all text-xs flex items-start justify-between gap-3 ${
                    isChecked
                      ? "border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20"
                      : "border-rose-200 bg-rose-50/30 dark:border-rose-900/40 dark:bg-rose-950/20"
                  }`}
                >
                  <label className="flex items-start gap-2.5 cursor-pointer select-none grow">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleItem(item.id)}
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                    />
                    <div>
                      <span
                        className={`font-semibold ${
                          isChecked
                            ? "line-through text-slate-500 dark:text-slate-400"
                            : "text-rose-900 dark:text-rose-300"
                        }`}
                      >
                        {item.title}
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </label>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 dark:text-rose-400 hover:underline shrink-0 pt-0.5"
                  >
                    Guidelines <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Missing Profile Parameters */}
      {missingInfoItems.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-sky-600" />
            {cl.missingParams} ({missingInfoItems.length})
          </h4>
          <div className="space-y-2">
            {missingInfoItems.map((item) => {
              const isChecked = Boolean(checkedMap[item.id]);
              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border transition-all text-xs flex items-start justify-between gap-3 ${
                    isChecked
                      ? "border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20"
                      : "border-sky-200 bg-sky-50/30 dark:border-sky-900/40 dark:bg-sky-950/20"
                  }`}
                >
                  <label className="flex items-start gap-2.5 cursor-pointer select-none grow">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleItem(item.id)}
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                    />
                    <div>
                      <span
                        className={`font-semibold ${
                          isChecked
                            ? "line-through text-slate-500 dark:text-slate-400"
                            : "text-sky-900 dark:text-sky-300"
                        }`}
                      >
                        {item.title}
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </label>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 dark:text-sky-400 hover:underline shrink-0 pt-0.5"
                  >
                    Details <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Concrete Next Step Action */}
      {nearMissUnlockPath && (
        <div className="p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/30 text-xs space-y-1.5">
          <p className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-emerald-600 shrink-0" />
            {cl.nextStepAction}
          </p>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            {nearMissUnlockPath}
          </p>
          <div className="pt-1 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={Boolean(checkedMap["action_next_step"])}
                onChange={() => toggleItem("action_next_step")}
                className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
              />
              Mark Next Step Action Completed
            </label>
            <a
              href={officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Official Portal <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
