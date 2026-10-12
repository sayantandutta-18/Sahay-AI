"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { CardSkeleton } from "@/components/ui/Loading";
import { Empty } from "@/components/ui/Empty";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { getApplications, grantConsent, updateApplicationStatus } from "@/lib/api";
import { ApplicationResponse } from "@/types";
import { Clock, CheckCircle2, ChevronRight, Lock, ShieldCheck, Share2 } from "lucide-react";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Consent modal state
  const [consentModalApp, setConsentModalApp] = useState<ApplicationResponse | null>(null);
  const [partnerName, setPartnerName] = useState("State Bank of India (MSME Hub)");
  const [sharedFields, setSharedFields] = useState("name,phone,business_type,annual_turnover,has_udyam");
  const [isSubmittingConsent, setIsSubmittingConsent] = useState(false);

  const loadApplications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getApplications();
      setApplications(data);
    } catch (err) {
      setError(
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Could not load applications. Please verify login state."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleGrantConsent = async () => {
    if (!consentModalApp) return;
    setIsSubmittingConsent(true);
    try {
      await grantConsent(consentModalApp.id, partnerName, sharedFields);
      await updateApplicationStatus(consentModalApp.id, "submitted", "Dossier forwarded to lender with consent");
      setConsentModalApp(null);
      await loadApplications();
    } catch (err) {
      alert("Failed to record consent: " + String(err));
    } finally {
      setIsSubmittingConsent(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Application Tracker & Checklist
            </h1>
            <p className="text-xs text-slate-500">
              Track multi-stage scheme submissions, verification checklists, and empanelled lender consent.
            </p>
          </div>
          <Link href="/matches">
            <Button size="sm">Apply for New Scheme</Button>
          </Link>
        </div>

        {/* Consent Transparency Notice */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
          <Lock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-900 dark:text-white">
              Granular & Revocable Data Sharing Consent:
            </span>{" "}
            Before any scheme dossier or profile data is transmitted to an empanelled lender, Sahay requires your explicit digital consent showing the exact data fields transmitted.
          </div>
        </div>

        {error && (
          <ErrorBanner
            title="Unable to Retrieve Applications"
            message={error}
            onRetry={loadApplications}
          />
        )}

        {isLoading ? (
          <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : applications.length === 0 ? (
          <Empty
            title="No Active Applications"
            description="You have not started any scheme applications yet. Match schemes against your profile to begin."
            actionLabel="Discover Schemes"
            onAction={() => (window.location.href = "/matches")}
          />
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.id}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="text-base">{app.scheme_name || "Scheme Application"}</CardTitle>
                    <Badge
                      variant={
                        app.status === "approved"
                          ? "success"
                          : app.status === "submitted"
                          ? "info"
                          : "warning"
                      }
                      size="md"
                    >
                      {app.status.toUpperCase()} ({app.progress_percentage}%)
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3.5 h-3.5" /> Created: {new Date(app.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${app.progress_percentage}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1 text-xs">
                    <div className="p-2.5 rounded-lg border bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>1. Criteria Match</span>
                    </div>
                    <div className="p-2.5 rounded-lg border bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>2. Checklist Started</span>
                    </div>
                    <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                      app.lender_consent_granted
                        ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                        : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400"
                    }`}>
                      <ShieldCheck className={`w-4 h-4 shrink-0 ${app.lender_consent_granted ? "text-emerald-600" : "text-slate-300"}`} />
                      <span>3. Lender Consent</span>
                    </div>
                    <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                      app.status === "submitted" || app.status === "approved"
                        ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                        : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400"
                    }`}>
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${app.status === "submitted" || app.status === "approved" ? "text-emerald-600" : "text-slate-300"}`} />
                      <span>4. Final Submission</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <Link href="/documents" className="text-xs text-emerald-600 hover:underline">
                    Manage Uploaded Documents ({app.documents.length})
                  </Link>

                  <div className="flex gap-2">
                    {!app.lender_consent_granted && (
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<Share2 className="w-3.5 h-3.5" />}
                        onClick={() => setConsentModalApp(app)}
                      >
                        Grant Bank Consent
                      </Button>
                    )}
                    <Button size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                      Continue Checklist
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Granular Consent Modal */}
        {consentModalApp && (
          <Modal
            isOpen={Boolean(consentModalApp)}
            onClose={() => setConsentModalApp(null)}
            title="Granular Lender Consent"
            description="Specify exactly which profile parameters you authorize Sahay to share with the lending partner."
            footer={
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setConsentModalApp(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleGrantConsent}
                  isLoading={isSubmittingConsent}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Confirm & Share Dossier
                </Button>
              </div>
            }
          >
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
                You retain the right to revoke this consent at any point prior to final credit disbursement.
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Empanelled Financial Institution
                </label>
                <input
                  type="text"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Authorized Data Fields
                </label>
                <textarea
                  rows={3}
                  value={sharedFields}
                  onChange={(e) => setSharedFields(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppLayout>
  );
}
