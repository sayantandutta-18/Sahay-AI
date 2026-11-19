"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { VerificationBadge } from "@/components/ui/VerificationBadge";
import { SchemeMissingActionList } from "@/components/ui/SchemeMissingActionList";
import { CardSkeleton } from "@/components/ui/Loading";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { Empty } from "@/components/ui/Empty";
import {
  checkEligibility,
  getMyMatches,
  createApplication,
  getSchemeById,
  ensureAuthenticatedSession,
} from "@/lib/api";
import { EligibilitySummaryResponse, SchemeMatchResult, Scheme } from "@/types";
import {
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  ShieldAlert,
  RefreshCw,
  Eye,
  FileText,
  ExternalLink,
  ListChecks,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function MatchesPage() {
  const [data, setData] = useState<EligibilitySummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [startingSchemeId, setStartingSchemeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // User onboarding profile & acquired documents state
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [expandedChecklists, setExpandedChecklists] = useState<Record<string, boolean>>({});

  // Scheme Detail Modal state (Checkpoint 1, 3, 4, 5)
  const [selectedMatch, setSelectedMatch] = useState<SchemeMatchResult | null>(null);
  const [detailedScheme, setDetailedScheme] = useState<Scheme | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);

  const loadMatches = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let answers: Record<string, any> = {};
      if (typeof window !== "undefined") {
        try {
          const raw = sessionStorage.getItem("sahay_onboarding_answers");
          if (raw) answers = JSON.parse(raw);
        } catch {
          // ignore parsing error
        }
      }
      setUserAnswers(answers);

      let result: EligibilitySummaryResponse;
      try {
        result = await getMyMatches();
      } catch {
        // Fallback to evaluating against user's onboarding answers or standard defaults
        result = await checkEligibility({
          state: answers.state || "West Bengal",
          business_type: answers.businessType || "manufacturing",
          category: answers.category || "micro",
          annual_turnover: parseFloat(answers.annualTurnover) || 850000.0,
          gender: answers.gender || "female",
          has_udyam: answers.hasUdyam ?? true,
          has_pan: answers.hasPan ?? true,
          has_bank_account: answers.hasBankAccount ?? true,
        });
      }
      setData(result);
    } catch (err) {
      setError(
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Could not evaluate scheme eligibility against backend engine."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenSchemeDetails = async (match: SchemeMatchResult) => {
    setSelectedMatch(match);
    setIsDetailLoading(true);
    try {
      const fullScheme = await getSchemeById(match.scheme_id);
      setDetailedScheme(fullScheme);
    } catch {
      setDetailedScheme(null);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleStartApplication = async (schemeId: string) => {
    setStartingSchemeId(schemeId);
    try {
      // Ensure session exists
      await ensureAuthenticatedSession();
      const app = await createApplication(schemeId);
      window.location.href = `/applications?scheme_id=${schemeId}&app_id=${app.id}`;
    } catch {
      // Direct navigation with scheme_id parameter
      window.location.href = `/applications?scheme_id=${schemeId}`;
    } finally {
      setStartingSchemeId(null);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Deterministic Scheme Matches
            </h1>
            <p className="text-xs text-slate-500">
              Evaluated strictly against verified eligibility rules. Rules versioned and auditable.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadMatches}
              disabled={isLoading}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
            >
              Re-evaluate
            </Button>
            <Link href="/schemes">
              <Button size="sm">Browse Full Library</Button>
            </Link>
          </div>
        </div>

        {/* Warning banner */}
        <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 p-3.5 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Compliance Note:</span> A high eligibility match indicates qualification under formal scheme criteria, but does not constitute an unconditional guarantee of bank sanction. Sanction depends on final lender underwriting.
          </div>
        </div>

        {error && (
          <ErrorBanner
            title="Eligibility Evaluation Error"
            message={error}
            onRetry={loadMatches}
          />
        )}

        {isLoading ? (
          <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : !data || data.matches.length === 0 ? (
          <Empty
            title="No Scheme Rules Available"
            description="The system could not locate any active verified scheme rule sets."
            actionLabel="Try Again"
            onAction={loadMatches}
          />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-1 flex-wrap gap-2">
              <span>
                Found <strong className="text-slate-800 dark:text-slate-200">{data.eligible_count} Eligible</strong>
                {data.more_info_needed_count ? (
                  <span>, <strong className="text-sky-700 dark:text-sky-300">{data.more_info_needed_count} Info Needed</strong></span>
                ) : null}
                {" "}and <strong className="text-slate-800 dark:text-slate-200">{data.near_match_count} Near Matches</strong> across {data.evaluated_schemes_count} verified schemes
              </span>
              <span className="font-mono text-[11px] text-emerald-600">{data.rule_authority}</span>
            </div>

            {data.matches.map((m) => (
              <Card key={m.scheme_id} hover>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{m.scheme_name}</CardTitle>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {m.provider} • Rule Version {m.rule_version}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant={
                          m.eligibility_verdict === "eligible"
                            ? "success"
                            : m.eligibility_verdict === "more_information_needed"
                            ? "info"
                            : "warning"
                        }
                        size="md"
                      >
                        {m.eligibility_verdict === "eligible"
                          ? `Eligible (${m.match_score}% Fit)`
                          : m.eligibility_verdict === "more_information_needed"
                          ? `Info Needed (${m.match_score}%)`
                          : `Not Eligible (${m.match_score}%)`}
                      </Badge>
                      <VerificationBadge
                        status={m.verification_status}
                        lastVerifiedAt={m.last_verified_at}
                        officialUrl={m.official_url}
                        verifier={m.verifier}
                        schemeName={m.scheme_name}
                        size="sm"
                      />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Passed criteria */}
                  {m.passed_hard_rules && m.passed_hard_rules.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600" /> Met Criteria ({m.passed_hard_rules.length})
                      </p>
                      <ul className="space-y-1 pl-5 list-disc text-xs text-slate-600 dark:text-slate-400">
                        {m.passed_hard_rules.map((rule, idx) => (
                          <li key={idx}>{rule}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Failed criteria */}
                  {m.failed_hard_rules && m.failed_hard_rules.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-semibold text-rose-700 dark:text-rose-400 mb-2 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-600" /> Unmet Criteria ({m.failed_hard_rules.length})
                      </p>
                      <ul className="space-y-1 pl-5 list-disc text-xs text-slate-600 dark:text-slate-400">
                        {m.failed_hard_rules.map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Missing information criteria */}
                  {m.missing_info_rules && m.missing_info_rules.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-semibold text-sky-700 dark:text-sky-400 mb-2 flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-sky-600" /> More Information Needed ({m.missing_info_rules.length})
                      </p>
                      <ul className="space-y-1 pl-5 list-disc text-xs text-slate-600 dark:text-slate-400">
                        {m.missing_info_rules.map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Near miss / unlock path */}
                  {m.near_miss_unlock_path && (
                    <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-xs">
                      <p className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-1">
                        <Lightbulb className="w-4 h-4 text-emerald-600" /> Action to Unlock / Enhance Fit
                      </p>
                      <p className="text-slate-600 dark:text-slate-400">{m.near_miss_unlock_path}</p>
                    </div>
                  )}

                  {/* Interactive Checklist & What's Still Missing Toggle (Checkpoint 5) */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedChecklists((prev) => ({
                          ...prev,
                          [m.scheme_id]: !prev[m.scheme_id],
                        }))
                      }
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      <ListChecks className="w-4 h-4" />
                      {expandedChecklists[m.scheme_id]
                        ? "Hide Action Checklist"
                        : "What's Still Missing & Action Checklist"}
                      {expandedChecklists[m.scheme_id] ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {expandedChecklists[m.scheme_id] && (
                      <div className="mt-3">
                        <SchemeMissingActionList
                          schemeId={m.scheme_id}
                          schemeName={m.scheme_name}
                          officialUrl={m.official_url}
                          documents={m.documents}
                          failedHardRules={m.failed_hard_rules}
                          missingInfoRules={m.missing_info_rules}
                          nearMissUnlockPath={m.near_miss_unlock_path}
                          initialAcquiredDocs={userAnswers}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                      onClick={() => handleOpenSchemeDetails(m)}
                    >
                      View Scheme Details
                    </Button>
                    <a
                      href={m.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-500 hover:text-emerald-600 underline flex items-center gap-1"
                    >
                      Official Portal <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <Button
                    size="sm"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    onClick={() => handleStartApplication(m.scheme_id)}
                    isLoading={startingSchemeId === m.scheme_id}
                  >
                    Add to Tracker
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Scheme Detail Modal (Checkpoint 1, 3, 4, 5) */}
        {selectedMatch && (
          <Modal
            isOpen={Boolean(selectedMatch)}
            onClose={() => {
              setSelectedMatch(null);
              setDetailedScheme(null);
            }}
            title={selectedMatch.scheme_name}
            footer={
              <div className="flex items-center justify-between w-full">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedMatch(null);
                    setDetailedScheme(null);
                  }}
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => handleStartApplication(selectedMatch.scheme_id)}
                >
                  Add to Tracker
                </Button>
              </div>
            }
          >
            <div className="space-y-4">
              {/* Match Fit & Key Stats */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">
                    Eligibility Status
                  </span>
                  <Badge
                    variant={
                      selectedMatch.eligibility_verdict === "eligible"
                        ? "success"
                        : selectedMatch.eligibility_verdict === "more_information_needed"
                        ? "info"
                        : "warning"
                    }
                    size="md"
                    className="mt-1"
                  >
                    {selectedMatch.eligibility_verdict === "eligible"
                      ? `Eligible (${selectedMatch.match_score}% Fit)`
                      : selectedMatch.eligibility_verdict === "more_information_needed"
                      ? `Info Needed (${selectedMatch.match_score}% Fit)`
                      : `Not Eligible (${selectedMatch.match_score}% Fit)`}
                  </Badge>
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">
                    Verification
                  </span>
                  <VerificationBadge
                    status={detailedScheme?.verification_status || selectedMatch.verification_status}
                    lastVerifiedAt={detailedScheme?.last_verified_at || selectedMatch.last_verified_at}
                    officialUrl={detailedScheme?.official_url || selectedMatch.official_url}
                    verifier={detailedScheme?.verifier || selectedMatch.verifier}
                    schemeName={detailedScheme?.name || selectedMatch.scheme_name}
                    size="sm"
                    className="mt-1"
                  />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">
                    Maximum Assistance / Benefit
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {detailedScheme?.max_amount
                      ? `₹${detailedScheme.max_amount.toLocaleString("en-IN")}`
                      : selectedMatch.max_amount
                      ? `₹${selectedMatch.max_amount.toLocaleString("en-IN")}`
                      : "Assistance & Subsidy"}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">
                    Scheme Category
                  </span>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 capitalize">
                    {detailedScheme?.scheme_type || selectedMatch.scheme_type || "Government Scheme"}
                  </span>
                </div>
              </div>

              {/* Short description and benefits if available */}
              {detailedScheme?.short_description && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Overview
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {detailedScheme.short_description}
                  </p>
                </div>
              )}

              {detailedScheme?.detailed_benefits && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Key Benefits
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-line">
                    {detailedScheme.detailed_benefits}
                  </p>
                </div>
              )}

              {/* Met criteria */}
              {selectedMatch.passed_hard_rules && selectedMatch.passed_hard_rules.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" /> Met Criteria ({selectedMatch.passed_hard_rules.length})
                  </h4>
                  <ul className="space-y-1 pl-5 list-disc text-xs text-slate-600 dark:text-slate-400">
                    {selectedMatch.passed_hard_rules.map((rule, idx) => (
                      <li key={idx}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Unmet criteria */}
              {selectedMatch.failed_hard_rules && selectedMatch.failed_hard_rules.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-rose-700 dark:text-rose-400 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" /> Unmet Criteria ({selectedMatch.failed_hard_rules.length})
                  </h4>
                  <ul className="space-y-1 pl-5 list-disc text-xs text-slate-600 dark:text-slate-400">
                    {selectedMatch.failed_hard_rules.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Missing criteria */}
              {selectedMatch.missing_info_rules && selectedMatch.missing_info_rules.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-sky-700 dark:text-sky-400 mb-2 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-sky-600" /> More Information Needed ({selectedMatch.missing_info_rules.length})
                  </h4>
                  <ul className="space-y-1 pl-5 list-disc text-xs text-slate-600 dark:text-slate-400">
                    {selectedMatch.missing_info_rules.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Interactive What's Still Missing & Action Checklist (Checkpoint 5) */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                <SchemeMissingActionList
                  schemeId={selectedMatch.scheme_id}
                  schemeName={selectedMatch.scheme_name}
                  officialUrl={selectedMatch.official_url}
                  documents={detailedScheme?.documents || selectedMatch.documents}
                  failedHardRules={selectedMatch.failed_hard_rules}
                  missingInfoRules={selectedMatch.missing_info_rules}
                  nearMissUnlockPath={selectedMatch.near_miss_unlock_path}
                  initialAcquiredDocs={userAnswers}
                />
              </div>

              {/* Source verification info */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>
                  Source:{" "}
                  <a
                    href={detailedScheme?.official_url || selectedMatch.official_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    Official Government Portal <ExternalLink className="w-3 h-3" />
                  </a>
                </span>
                {(detailedScheme?.last_verified_at || selectedMatch.last_verified_at) && (
                  <span>
                    Verified: {(detailedScheme?.last_verified_at || selectedMatch.last_verified_at)?.slice(0, 10)}
                  </span>
                )}
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppLayout>
  );
}
