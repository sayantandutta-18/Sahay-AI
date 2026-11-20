"use client";

import React, { useEffect, useState, Suspense } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { VerificationBadge } from "@/components/ui/VerificationBadge";
import { CardSkeleton } from "@/components/ui/Loading";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { SchemeComparisonTable } from "@/components/ui/SchemeComparisonTable";
import { getSchemes } from "@/lib/api";
import { Scheme } from "@/types";
import { useLanguage, formatCurrencyINR } from "@/lib/i18n";
import { SCHEME_PRESETS } from "@/lib/search";
import {
  Search,
  ExternalLink,
  Calendar,
  Building,
  CheckCircle2,
  CheckSquare,
  Square,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  X,
  Layers,
  Sparkles,
  Landmark,
  Store,
  RotateCcw,
  Tag,
} from "lucide-react";

function SchemesContent() {
  const { lang, t } = useLanguage();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [activePreset, setActivePreset] = useState<string>("all");

  // Checkpoint 8: Scheme comparison up to 6
  const [selectedSchemeIds, setSelectedSchemeIds] = useState<string[]>([]);
  const [isComparisonView, setIsComparisonView] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [hasInitializedFromUrl, setHasInitializedFromUrl] = useState<boolean>(false);

  const loadSchemes = async (overrideSearch?: string, overrideType?: string) => {
    setIsLoading(true);
    setError(null);
    const searchParam = overrideSearch !== undefined ? overrideSearch : searchTerm;
    const typeParam = overrideType !== undefined ? overrideType : typeFilter;
    try {
      const data = await getSchemes({
        scheme_type: typeParam,
        search: searchParam,
      });
      setSchemes(data);
    } catch (err) {
      setError(
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to load government scheme library."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSchemes();
  }, [typeFilter]);

  // Sync comparison URL search params on mount & reload
  useEffect(() => {
    if (typeof window === "undefined" || schemes.length === 0 || hasInitializedFromUrl) return;

    try {
      const searchParams = new URLSearchParams(window.location.search);
      const compareParam = searchParams.get("compare");
      if (compareParam) {
        const slugs = compareParam
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean);

        const matchedIds: string[] = [];
        for (const slug of slugs) {
          if (matchedIds.length >= 6) break;
          const found = schemes.find(
            (s) => s.slug?.toLowerCase() === slug || s.id?.toLowerCase() === slug
          );
          if (found && !matchedIds.includes(found.id)) {
            matchedIds.push(found.id);
          }
        }

        if (matchedIds.length > 0) {
          setSelectedSchemeIds(matchedIds);
          setIsComparisonView(true);
        }
      }

      // Checkpoint 9: handle initial search or preset query params
      const searchQ = searchParams.get("search");
      const presetQ = searchParams.get("preset");
      if (presetQ) {
        handlePresetClick(presetQ);
      } else if (searchQ) {
        setSearchTerm(searchQ);
        loadSchemes(searchQ, typeFilter);
      }
    } catch {
      // URL parsing fallback
    } finally {
      setHasInitializedFromUrl(true);
    }
  }, [schemes, hasInitializedFromUrl]);

  // Update URL search parameters when selection changes
  const updateUrlParam = (ids: string[]) => {
    if (typeof window === "undefined") return;
    try {
      const url = new URL(window.location.href);
      if (ids.length > 0) {
        const selectedSlugs = ids
          .map((id) => {
            const found = schemes.find((s) => s.id === id);
            return found?.slug || id;
          })
          .join(",");
        url.searchParams.set("compare", selectedSlugs);
      } else {
        url.searchParams.delete("compare");
      }
      window.history.replaceState(null, "", url.toString());
    } catch {
      // Silently catch any history state error
    }
  };

  const handleToggleSelectScheme = (schemeId: string) => {
    if (selectedSchemeIds.includes(schemeId)) {
      // Deselect
      const updated = selectedSchemeIds.filter((id) => id !== schemeId);
      setSelectedSchemeIds(updated);
      setWarningMessage(null);
      updateUrlParam(updated);
    } else {
      // Check maximum 6 limit
      if (selectedSchemeIds.length >= 6) {
        setWarningMessage(t.comparison.maxLimitAlert);
        return;
      }
      const updated = [...selectedSchemeIds, schemeId];
      setSelectedSchemeIds(updated);
      setWarningMessage(null);
      updateUrlParam(updated);
    }
  };

  const handleRemoveFromComparison = (schemeId: string) => {
    const updated = selectedSchemeIds.filter((id) => id !== schemeId);
    setSelectedSchemeIds(updated);
    setWarningMessage(null);
    updateUrlParam(updated);
    if (updated.length === 0) {
      setIsComparisonView(false);
    }
  };

  const handleClearAllComparison = () => {
    setSelectedSchemeIds([]);
    setWarningMessage(null);
    updateUrlParam([]);
    setIsComparisonView(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActivePreset("custom");
    loadSchemes(searchTerm, typeFilter);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setActivePreset("all");
    loadSchemes("", "all");
  };

  const handlePresetClick = (presetId: string) => {
    if (activePreset === presetId && presetId !== "all") {
      // Deselect preset and reset to All
      handleClearSearch();
      return;
    }

    setActivePreset(presetId);
    const preset = SCHEME_PRESETS.find((p) => p.id === presetId);
    if (!preset || presetId === "all") {
      handleClearSearch();
      return;
    }

    if (preset.schemeType) {
      setSearchTerm("");
      setTypeFilter(preset.schemeType);
      loadSchemes("", preset.schemeType);
    } else if (preset.searchKeyword) {
      setSearchTerm(preset.searchKeyword);
      setTypeFilter("all");
      loadSchemes(preset.searchKeyword, "all");
    }
  };

  const comparedSchemes = schemes.filter((s) => selectedSchemeIds.includes(s.id));

  const getPresetIcon = (presetId: string) => {
    switch (presetId) {
      case "women":
        return <Sparkles className="w-3.5 h-3.5 text-pink-500" />;
      case "startup":
        return <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />;
      case "subsidies":
        return <Tag className="w-3.5 h-3.5 text-emerald-500" />;
      case "mudra":
        return <Landmark className="w-3.5 h-3.5 text-blue-500" />;
      case "svanidhi":
        return <Store className="w-3.5 h-3.5 text-amber-500" />;
      case "collateral":
        return <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            {t.nav.schemes}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Verified official schemes from Central & State ministries. No AI hallucinations.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsComparisonView(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              !isComparisonView
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Library ({schemes.length})</span>
          </button>

          <button
            onClick={() => setIsComparisonView(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 relative ${
              isComparisonView
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>{t.comparison.title}</span>
            {selectedSchemeIds.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-emerald-500 text-white text-[10px] font-bold rounded-full">
                {selectedSchemeIds.length}/6
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Warning Alert if Max 6 Exceeded */}
      {warningMessage && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 rounded-xl flex items-center justify-between text-xs text-amber-800 dark:text-amber-200 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-medium">{warningMessage}</span>
          </div>
          <button
            onClick={() => setWarningMessage(null)}
            className="text-amber-700 hover:text-amber-900 dark:text-amber-300 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Content: Comparison View vs Library List View */}
      {isComparisonView ? (
        <SchemeComparisonTable
          schemes={comparedSchemes}
          onRemoveScheme={handleRemoveFromComparison}
          onClearAll={handleClearAllComparison}
          onClose={() => setIsComparisonView(false)}
          warningMessage={warningMessage}
          onDismissWarning={() => setWarningMessage(null)}
          onAddMore={() => setIsComparisonView(false)}
        />
      ) : (
        <div className="space-y-4">
          {/* Checkpoint 9: Multilingual Search Form */}
          <form onSubmit={handleSearchSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-3 relative">
                <Input
                  placeholder={t.search.placeholder}
                  leftIcon={<Search className="w-4 h-4" />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  rightIcon={
                    searchTerm ? (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title="Clear search"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    ) : undefined
                  }
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setActivePreset("custom");
                }}
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white"
              >
                <option value="all">All Support Types</option>
                <option value="subsidy">Subsidies</option>
                <option value="loan">Loans & Credit</option>
              </select>
            </div>

            {/* Checkpoint 9: Preset Filter Chips Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
              <span className="text-[11px] font-semibold text-slate-500 shrink-0">
                {t.search.presetsLabel}
              </span>
              {SCHEME_PRESETS.map((preset) => {
                const isActive = activePreset === preset.id;
                const label = t.search[preset.key];
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePresetClick(preset.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? "bg-emerald-600 text-white shadow-xs font-semibold"
                        : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {getPresetIcon(preset.id)}
                    <span>{label}</span>
                  </button>
                );
              })}

              {(searchTerm || typeFilter !== "all" || activePreset !== "all") && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 px-2 py-1 transition-colors shrink-0"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </form>

          {/* Results Summary Status */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>
              {searchTerm || typeFilter !== "all" || activePreset !== "all"
                ? t.search.resultsFound.replace("{count}", String(schemes.length))
                : t.search.showingAll}
            </span>
            {searchTerm && (
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                Keyword: &ldquo;{searchTerm}&rdquo;
              </span>
            )}
          </div>

          {error && (
            <ErrorBanner
              title="Failed to Load Schemes"
              message={error}
              onRetry={() => loadSchemes()}
            />
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : schemes.length === 0 ? (
            /* Checkpoint 9: Clear message with suggestions when no results */
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-12 text-center space-y-6 shadow-sm">
              <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <Search className="w-7 h-7" />
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t.search.noResultsTitle}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {searchTerm
                    ? t.search.noResultsMessage.replace("{query}", searchTerm)
                    : "No verified government schemes match the selected filters."}
                </p>
              </div>

              {/* Suggestions Box */}
              <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-left space-y-3">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.search.suggestionsTitle}
                </p>
                <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handlePresetClick("women")}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-800 dark:text-slate-200 transition-colors text-left flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                    <span>{t.search.suggestionWomen}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetClick("subsidies")}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-800 dark:text-slate-200 transition-colors text-left flex items-center gap-1.5"
                  >
                    <Tag className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{t.search.suggestionSubsidies}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetClick("mudra")}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-800 dark:text-slate-200 transition-colors text-left flex items-center gap-1.5"
                  >
                    <Landmark className="w-3.5 h-3.5 text-blue-500" />
                    <span>{t.search.suggestionLoans}</span>
                  </button>
                </div>
              </div>

              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearSearch}
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  {t.search.clearSearch}
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {schemes.map((s) => {
                const isSelected = selectedSchemeIds.includes(s.id);
                return (
                  <Card
                    key={s.id}
                    hover
                    className={`flex flex-col justify-between transition-all ${
                      isSelected
                        ? "ring-2 ring-emerald-500 border-emerald-500/50 bg-emerald-50/10 dark:bg-emerald-950/10"
                        : ""
                    }`}
                  >
                    <div>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base font-semibold leading-tight">
                            {s.name}
                          </CardTitle>
                          <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                            <Badge
                              variant={s.scheme_type === "subsidy" ? "success" : "info"}
                              size="sm"
                            >
                              {s.scheme_type.toUpperCase()}
                            </Badge>
                            <VerificationBadge
                              status={s.verification_status}
                              lastVerifiedAt={s.last_verified_at}
                              officialUrl={s.official_url}
                              verifier={s.verifier}
                              schemeName={s.name}
                              size="sm"
                            />
                          </div>
                        </div>
                        <CardDescription className="flex items-center gap-1.5 mt-1">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          {s.provider}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          {s.short_description}
                        </p>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-slate-500 font-medium">{t.comparison.maxLimit}:</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {formatCurrencyINR(s.max_amount, lang)}
                          </span>
                        </div>

                        {s.documents && s.documents.length > 0 && (
                          <div>
                            <p className="text-[11px] font-semibold text-slate-500 mb-1.5">
                              {t.comparison.documents}:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {s.documents.slice(0, 3).map((doc) => (
                                <span
                                  key={doc.id}
                                  className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md flex items-center gap-1"
                                >
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {doc.title}
                                </span>
                              ))}
                              {s.documents.length > 3 && (
                                <span className="text-[10px] text-slate-400 self-center">
                                  +{s.documents.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </div>

                    <CardFooter className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                      {/* Checkbox / Compare Selector */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSelectScheme(s.id);
                        }}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <CheckSquare className="w-3.5 h-3.5 text-white" />
                            <span>{t.comparison.selectedToCompare}</span>
                          </>
                        ) : (
                          <>
                            <Square className="w-3.5 h-3.5 text-slate-400" />
                            <span>{t.comparison.selectToCompare}</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{s.last_verified_at}</span>
                        </div>
                        <a
                          href={s.official_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                        >
                          Portal <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Floating Bottom Comparison Dock (When schemes are selected) */}
      {selectedSchemeIds.length > 0 && !isComparisonView && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-4xl bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-3 sm:p-4 shadow-2xl border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="px-2.5 py-1 bg-emerald-600 rounded-lg text-xs font-bold shrink-0">
              {t.comparison.selectedCount.replace("{count}", String(selectedSchemeIds.length))}
            </div>

            {/* Scheme Names Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-[280px] sm:max-w-md py-0.5">
              {comparedSchemes.map((s) => (
                <span
                  key={s.id}
                  className="text-[11px] bg-slate-800 text-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0"
                >
                  <span className="truncate max-w-[90px]">{s.name}</span>
                  <button
                    onClick={() => handleRemoveFromComparison(s.id)}
                    className="hover:text-rose-400"
                    title={t.comparison.remove}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleClearAllComparison}
              className="px-2.5 py-1 text-xs text-slate-400 hover:text-rose-400 transition-colors"
            >
              {t.comparison.clearAll}
            </button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsComparisonView(true)}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              {t.comparison.viewComparison}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SchemesPage() {
  return (
    <AppLayout>
      <Suspense fallback={<CardSkeleton />}>
        <SchemesContent />
      </Suspense>
    </AppLayout>
  );
}
