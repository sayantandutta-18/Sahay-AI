"use client";

import React from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { HealthIndicator } from "@/components/ui/HealthIndicator";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Sparkles,
  ScrollText,
  CheckCircle2,
  FileCheck2,
  MessageSquare,
  Calculator,
  GraduationCap,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export default function Home() {
  return (
    <AppLayout showSidebar={false}>
      <div className="max-w-5xl mx-auto space-y-10 py-6">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SAHAY (सहाय) — Multilingual AI Platform for Indian Micro-Entrepreneurs</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Democratizing Capital, Schemes & Knowledge for Small Business
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Grounded government-scheme discovery, deterministic eligibility evaluation, document readiness, practical business tools, and stock market education.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/onboarding">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 shadow-md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Start Onboarding
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline">
                Open Dashboard
              </Button>
            </Link>
            <Link href="/schemes">
              <Button size="lg" variant="ghost">
                Browse Schemes
              </Button>
            </Link>
          </div>
        </div>

        {/* Live Health & Connectivity Connection Card (Checkpoint 5) */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              System Health & Backend Connection
            </h2>
            <span className="text-xs text-slate-400 font-mono">FastAPI ↔ Next.js Bridge</span>
          </div>
          <HealthIndicator />
        </div>

        {/* Core Capabilities Grid */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Platform Capabilities & Modules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <Card hover>
              <CardHeader>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                  <ScrollText className="w-5 h-5" />
                </div>
                <CardTitle className="text-base">Government Schemes</CardTitle>
                <CardDescription>
                  Verified central & state initiatives (PMEGP, MUDRA, CGTMSE). Zero hallucinations.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Link href="/schemes" className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1">
                  Explore Schemes <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </CardFooter>
            </Card>

            <Card hover>
              <CardHeader>
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <CardTitle className="text-base">Deterministic Eligibility</CardTitle>
                <CardDescription>
                  Auditable rule engine evaluates hard requirements, weighted scoring, and unlock paths.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Link href="/matches" className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1">
                  View Matches <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </CardFooter>
            </Card>

            <Card hover>
              <CardHeader>
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-2">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <CardTitle className="text-base">Document Vault & Tracking</CardTitle>
                <CardDescription>
                  Checklists, metadata verification, and granular consent before any lender handoff.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Link href="/documents" className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1">
                  View Vault <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </CardFooter>
            </Card>

            <Card hover>
              <CardHeader>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <CardTitle className="text-base">AI Assistant (RAG)</CardTitle>
                <CardDescription>
                  Multilingual grounded assistant in English, Hindi, and Bengali with source attribution.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Link href="/chat" className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1">
                  Chat with AI <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </CardFooter>
            </Card>

            <Card hover>
              <CardHeader>
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2">
                  <Calculator className="w-5 h-5" />
                </div>
                <CardTitle className="text-base">Business Advisor</CardTitle>
                <CardDescription>
                  Deterministic EMI loan calculators, cost-plus margin pricing, and bookkeeping.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Link href="/business" className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1">
                  Business Tools <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </CardFooter>
            </Card>

            <Card hover>
              <CardHeader>
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <CardTitle className="text-base">Stock Market Academy</CardTitle>
                <CardDescription>
                  Beginner to advanced modules and simulated paper portfolio with zero real money risk.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Link href="/academy" className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1">
                  Start Learning <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Architectural Principles Banner */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Core Architectural & Safety Guarantees
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-400">
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">1. Deterministic Authority</p>
              <p className="mt-0.5">Calculations and eligibility rules reside in Python backend services; AI explains but never overrides.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">2. No Invented Data</p>
              <p className="mt-0.5">Schemes, subsidies, rates, and stock metrics are sourced from verified documents and provider adapters.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">3. Compliance Gate</p>
              <p className="mt-0.5">No real-money broker trading or automated orders. All advisor features are non-advisory educational tools.</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
