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
import {
  getApplications,
  grantConsent,
  updateApplicationStatus,
  getApplicationChecklist,
  updateChecklistItem,
  getApplicationHistory,
} from "@/lib/api";
import { ApplicationResponse, ApplicationChecklistItem, ApplicationStatusHistory } from "@/types";
import { useLanguage } from "@/lib/i18n";
import {
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Lock,
  ShieldCheck,
  Share2,
  History,
  ListChecks,
  AlertCircle,
  ArrowRight,
  FileText,
} from "lucide-react";

const ALLOWED_STATUS_MAP: Record<string, string[]> = {
  draft: ["documents_needed", "withdrawn"],
  documents_needed: ["ready_to_submit", "submitted", "withdrawn"],
  in_progress: ["documents_needed", "submitted", "withdrawn"],
  ready_to_submit: ["submitted", "withdrawn"],
  submitted: ["under_review", "withdrawn"],
  under_review: ["approved", "rejected", "action_required"],
  action_required: ["under_review", "withdrawn"],
  approved: [],
  rejected: [],
  withdrawn: [],
};

export default function ApplicationsPage() {
  const { t } = useLanguage();
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Checklists by application ID
  const [checklists, setChecklists] = useState<Record<string, ApplicationChecklistItem[]>>({});
  const [expandedChecklistAppId, setExpandedChecklistAppId] = useState<string | null>(null);
  const [checklistLoading, setChecklistLoading] = useState<Record<string, boolean>>({});

  // History modal state
  const [historyModalApp, setHistoryModalApp] = useState<ApplicationResponse | null>(null);
  const [historyItems, setHistoryItems] = useState<ApplicationStatusHistory[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  // Consent modal state
  const [consentModalApp, setConsentModalApp] = useState<ApplicationResponse | null>(null);
  const [partnerName, setPartnerName] = useState("State Bank of India (MSME Hub)");
  const [sharedFields, setSharedFields] = useState("name,phone,business_type,annual_turnover,has_udyam");
  const [isSubmittingConsent, setIsSubmittingConsent] = useState(false);

  // Status transition state
  const [transitioningAppId, setTransitioningAppId] = useState<string | null>(null);

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

  const toggleChecklist = async (appId: string) => {
    if (expandedChecklistAppId === appId) {
      setExpandedChecklistAppId(null);
      return;
    }
    setExpandedChecklistAppId(appId);
    if (!checklists[appId]) {
      setChecklistLoading((prev) => ({ ...prev, [appId]: true }));
      try {
        const items = await getApplicationChecklist(appId);
        setChecklists((prev) => ({ ...prev, [appId]: items }));
      } catch (err) {
        console.error("Failed to load checklist", err);
      } finally {
        setChecklistLoading((prev) => ({ ...prev, [appId]: false }));
      }
    }
  };

  const handleToggleChecklistItem = async (appId: string, item: ApplicationChecklistItem) => {
    try {
      const updated = await updateChecklistItem(appId, item.id, {
        is_completed: !item.is_completed,
      });
      setChecklists((prev) => ({
        ...prev,
        [appId]: (prev[appId] || []).map((ci) => (ci.id === item.id ? updated : ci)),
      }));
      // Refresh applications to reflect progress %
      await loadApplications();
    } catch (err) {
      alert("Failed to update checklist item: " + String(err));
    }
  };

  const openHistoryModal = async (app: ApplicationResponse) => {
    setHistoryModalApp(app);
    setIsHistoryLoading(true);
    try {
      const history = await getApplicationHistory(app.id);
      setHistoryItems(history);
    } catch (err) {
      alert("Failed to fetch history: " + String(err));
      setHistoryItems([]);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleStatusTransition = async (appId: string, newStatus: string) => {
    setTransitioningAppId(appId);
    try {
      await updateApplicationStatus(appId, newStatus, `Transitioned to ${newStatus} from portal`);
      await loadApplications();
      if (expandedChecklistAppId === appId) {
        const items = await getApplicationChecklist(appId);
        setChecklists((prev) => ({ ...prev, [appId]: items }));
      }
    } catch (err) {
      alert("Status transition failed: " + String(err));
    } finally {
      setTransitioningAppId(null);
    }
  };

  const handleGrantConsent = async () => {
    if (!consentModalApp) return;
    setIsSubmittingConsent(true);
    try {
      await grantConsent(consentModalApp.id, partnerName, sharedFields);
      await updateApplicationStatus(consentModalApp.id, "submitted", "Dossier forwarded to lender with digital consent");
      setConsentModalApp(null);
      await loadApplications();
    } catch (err) {
      alert("Failed to record consent: " + String(err));
    } finally {
      setIsSubmittingConsent(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === "approved") return <Badge variant="success">Approved</Badge>;
    if (s === "submitted" || s === "under_review") return <Badge variant="info">Submitted</Badge>;
    if (s === "rejected" || s === "withdrawn") return <Badge variant="neutral">Closed</Badge>;
    return <Badge variant="warning">In Progress</Badge>;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <ListChecks className="w-6 h-6 text-emerald-600" />
              {t.applications.title}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.applications.subtitle}
            </p>
          </div>
          <Link href="/matches">
            <Button size="sm">{t.applications.newApplication}</Button>
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
            title={t.applications.noApplications}
            description="You have not started any scheme applications yet. Match schemes against your profile to begin."
            actionLabel={t.applications.newApplication}
            onAction={() => (window.location.href = "/matches")}
          />
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const allowedNext = ALLOWED_STATUS_MAP[app.status] || [];
              const items = checklists[app.id] || [];
              const isExpanded = expandedChecklistAppId === app.id;

              return (
                <Card key={app.id}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <CardTitle className="text-base">{app.scheme_name || "Scheme Application"}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-0.5 text-xs">
                          <Clock className="w-3.5 h-3.5" /> Created: {new Date(app.created_at).toLocaleDateString()}
                          {app.submitted_at && (
                            <span>• Submitted: {new Date(app.submitted_at).toLocaleDateString()}</span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(app.status)}
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          {app.progress_percentage}%
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                      <div
                        className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(5, app.progress_percentage)}%` }}
                      />
                    </div>

                    {/* Stage status indicators */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                      <div className="p-2.5 rounded-lg border bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>1. Criteria Match</span>
                      </div>
                      <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                        app.progress_percentage >= 25
                          ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                          : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400"
                      }`}>
                        <CheckCircle2 className={`w-4 h-4 shrink-0 ${app.progress_percentage >= 25 ? "text-emerald-600" : "text-slate-300"}`} />
                        <span>2. Checklist</span>
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
                        app.status === "submitted" || app.status === "approved" || app.status === "under_review"
                          ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                          : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400"
                      }`}>
                        <CheckCircle2 className={`w-4 h-4 shrink-0 ${app.status === "submitted" || app.status === "approved" || app.status === "under_review" ? "text-emerald-600" : "text-slate-300"}`} />
                        <span>4. Submission</span>
                      </div>
                    </div>

                    {/* Expandable Checklist Section */}
                    {isExpanded && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                            {t.applications.checklistTitle} ({items.filter((i) => i.is_completed).length}/{items.length})
                          </h4>
                          <Link href="/documents" className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" /> Go to Vault
                          </Link>
                        </div>

                        {checklistLoading[app.id] ? (
                          <p className="text-xs text-slate-400 py-2">Loading required documents...</p>
                        ) : items.length === 0 ? (
                          <p className="text-xs text-slate-400 py-2">No specific documents registered for this scheme.</p>
                        ) : (
                          <div className="space-y-1.5 divide-y divide-slate-100 dark:divide-slate-800">
                            {items.map((item) => (
                              <div
                                key={item.id}
                                className="pt-2 flex items-start justify-between gap-3 text-xs"
                              >
                                <div className="flex items-start gap-2.5">
                                  <input
                                    type="checkbox"
                                    checked={item.is_completed}
                                    onChange={() => handleToggleChecklistItem(app.id, item)}
                                    className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                                  />
                                  <div>
                                    <span className={`font-semibold ${item.is_completed ? "line-through text-slate-400" : "text-slate-900 dark:text-white"}`}>
                                      {item.title}
                                    </span>
                                    {item.mandatory ? (
                                      <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-rose-50 text-rose-600 border border-rose-200">
                                        Mandatory
                                      </span>
                                    ) : (
                                      <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600">
                                        Optional
                                      </span>
                                    )}
                                    {item.description && (
                                      <p className="text-slate-500 text-[11px] mt-0.5">{item.description}</p>
                                    )}
                                  </div>
                                </div>
                                <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                                  {item.is_completed ? "Completed" : "Pending"}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Next Action & Status Progression Bar */}
                    {allowedNext.length > 0 && (
                      <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                        <span className="text-slate-600 dark:text-slate-400">
                          Next Available Status Actions:
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          {allowedNext.map((statusKey) => (
                            <Button
                              key={statusKey}
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusTransition(app.id, statusKey)}
                              isLoading={transitioningAppId === app.id}
                              className="text-xs h-7 px-2.5"
                            >
                              <ArrowRight className="w-3 h-3 mr-1" />
                              Move to {statusKey.replace(/_/g, " ")}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleChecklist(app.id)}
                        className="text-xs"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5 mr-1" /> Hide Checklist
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3.5 h-3.5 mr-1" /> View Checklist ({items.length || app.documents.length})
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openHistoryModal(app)}
                        className="text-xs"
                      >
                        <History className="w-3.5 h-3.5 mr-1" /> Status History
                      </Button>
                    </div>

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
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {/* Status Lifecycle Audit History Modal */}
        {historyModalApp && (
          <Modal
            isOpen={Boolean(historyModalApp)}
            onClose={() => setHistoryModalApp(null)}
            title={`Application History: ${historyModalApp.scheme_name || "Scheme"}`}
            description="Immutable audit trail of status progression and administrative verification events."
            footer={
              <Button onClick={() => setHistoryModalApp(null)}>
                Close
              </Button>
            }
          >
            {isHistoryLoading ? (
              <p className="text-xs text-slate-400 py-4">Loading status lifecycle trail...</p>
            ) : historyItems.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No status transitions logged yet.</p>
            ) : (
              <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800">
                {historyItems.map((h) => (
                  <div key={h.id} className="pt-2.5 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-white uppercase">
                          {h.new_status.replace(/_/g, " ")}
                        </span>
                        {h.previous_status && (
                          <span className="text-slate-400 text-[10px]">
                            (from {h.previous_status.replace(/_/g, " ")})
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(h.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      Actor: <span className="font-semibold">{h.actor_role}</span> {h.notes && `• ${h.notes}`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Modal>
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
                  {t.common.cancel}
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
