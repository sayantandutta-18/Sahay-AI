"use client";

import React from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

const evaluatedMatches = [
  {
    schemeId: "pmegp",
    schemeName: "Prime Minister Employment Generation Programme (PMEGP)",
    isEligible: true,
    matchScore: 94,
    passedRules: [
      "Age >= 18 years",
      "Sector: Manufacturing / Agro-Handicrafts is covered",
      "Location: West Bengal (eligible state)",
      "Project cost within ₹50 Lakhs limit",
    ],
    missingRequirements: [
      "EDP (Entrepreneurship Development Programme) 10-day training certificate",
      "Detailed Project Appraisal Report (DPR)",
    ],
    nearMissPath:
      "Complete the free 10-day online EDP training at msmetraining.gov.in to unlock instant bank forwarding.",
    ruleVersion: "v1.4.2",
  },
  {
    schemeId: "mudra-tarun",
    schemeName: "Pradhan Mantri MUDRA Yojana (Tarun)",
    isEligible: true,
    matchScore: 88,
    passedRules: [
      "Micro-enterprise classification confirmed via Udyam",
      "Active bank savings/current account verified",
      "No default recorded on existing formal credit",
    ],
    missingRequirements: [
      "Latest 6-month continuous bank statement with GST reconciliations",
    ],
    nearMissPath: "Upload bank statement with verifiable digital stamp or DigiLocker pull.",
    ruleVersion: "v1.2.0",
  },
  {
    schemeId: "cgtmse",
    schemeName: "CGTMSE Guarantee Fund",
    isEligible: false,
    matchScore: 62,
    passedRules: [
      "Manufacturing micro enterprise",
      "Proprietor PAN verified",
    ],
    failedRules: [
      "Requires audited financials or 12-month commercial operations (currently 9 months)",
    ],
    missingRequirements: [
      "3 more months of registered business operational history",
    ],
    nearMissPath:
      "Wait 90 days or apply for MUDRA Kishor / Tarun first which requires zero previous operational duration.",
    ruleVersion: "v2.1.0",
  },
];

export default function MatchesPage() {
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
          <Link href="/schemes">
            <Button variant="outline" size="sm">Browse Full Library</Button>
          </Link>
        </div>

        {/* Warning banner */}
        <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 p-3.5 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Compliance Note:</span> A high eligibility match indicates qualification under formal scheme criteria, but does not constitute an unconditional guarantee of bank sanction. Sanction depends on final lender underwriting.
          </div>
        </div>

        {/* Match cards */}
        <div className="space-y-4">
          {evaluatedMatches.map((m) => (
            <Card key={m.schemeId} hover>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{m.schemeName}</CardTitle>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Evaluated by Rule Set {m.ruleVersion}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={m.isEligible ? "success" : "warning"} size="md">
                      {m.isEligible ? `Eligible (${m.matchScore}% Match)` : `Near Match (${m.matchScore}%)`}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Passed criteria */}
                <div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" /> Met Criteria ({m.passedRules.length})
                  </p>
                  <ul className="space-y-1 pl-5 list-disc text-xs text-slate-600 dark:text-slate-400">
                    {m.passedRules.map((rule, idx) => (
                      <li key={idx}>{rule}</li>
                    ))}
                  </ul>
                </div>

                {/* Missing requirements */}
                {m.missingRequirements.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-semibold text-rose-700 dark:text-rose-400 mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600" /> Pending Requirements ({m.missingRequirements.length})
                    </p>
                    <ul className="space-y-1 pl-5 list-disc text-xs text-slate-600 dark:text-slate-400">
                      {m.missingRequirements.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Near miss / unlock path */}
                {m.nearMissPath && (
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-xs">
                    <p className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-1">
                      <Lightbulb className="w-4 h-4 text-emerald-600" /> Recommended Action to Unlock
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">{m.nearMissPath}</p>
                  </div>
                )}
              </CardContent>

              <CardFooter>
                <div className="text-xs text-slate-400">
                  Authority: Sahay Deterministic Engine
                </div>
                <Link href="/applications">
                  <Button size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Start Application Checklist
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
