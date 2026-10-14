"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CardSkeleton } from "@/components/ui/Loading";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { Empty } from "@/components/ui/Empty";
import { checkEligibility, getMyMatches, createApplication } from "@/lib/api";
import { EligibilitySummaryResponse } from "@/types";
import {
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";

export default function MatchesPage() {
  const [data, setData] = useState<EligibilitySummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [startingSchemeId, setStartingSchemeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadMatches = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Attempt to load personalized matches if logged in, otherwise default criteria
      let result: EligibilitySummaryResponse;
      try {
        result = await getMyMatches();
      } catch {
        // Fallback to evaluating against standard entrepreneur parameters
        result = await checkEligibility({
          state: "West Bengal",
          business_type: "manufacturing",
          category: "micro",
          annual_turnover: 850000.0,
          gender: "female",
          has_udyam: true,
          has_pan: true,
          has_bank_account: true,
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

  const handleStartApplication = async (schemeId: string) => {
    setStartingSchemeId(schemeId);
    try {
      const app = await createApplication(schemeId);
      window.location.href = `/applications?scheme_id=${schemeId}&app_id=${app.id}`;
    } catch {
      // Fallback navigation with scheme_id parameter so applications page can handle creation or sign-in
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
            <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
              <span>
                Found <strong className="text-slate-800 dark:text-slate-200">{data.eligible_count} Eligible</strong> and{" "}
                <strong className="text-slate-800 dark:text-slate-200">{data.near_match_count} Near Matches</strong> across {data.evaluated_schemes_count} verified schemes
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
                    <div className="flex items-center gap-2">
                      <Badge variant={m.is_eligible ? "success" : "warning"} size="md">
                        {m.is_eligible ? `Eligible (${m.match_score}% Fit)` : `Near Match (${m.match_score}%)`}
                      </Badge>
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

                  {/* Near miss / unlock path */}
                  {m.near_miss_unlock_path && (
                    <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-xs">
                      <p className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-1">
                        <Lightbulb className="w-4 h-4 text-emerald-600" /> Action to Unlock / Enhance Fit
                      </p>
                      <p className="text-slate-600 dark:text-slate-400">{m.near_miss_unlock_path}</p>
                    </div>
                  )}
                </CardContent>

                <CardFooter>
                  <a
                    href={m.official_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-500 hover:text-emerald-600 underline"
                  >
                    Official Portal
                  </a>
                  <Button
                    size="sm"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    onClick={() => handleStartApplication(m.scheme_id)}
                    isLoading={startingSchemeId === m.scheme_id}
                  >
                    Start Application Checklist
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
