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
  getSchemes,
  createApplication,
  deleteApplication,
  grantConsent,
  updateApplicationStatus,
  getApplicationChecklist,
  updateChecklistItem,
  getApplicationHistory,
  getUserDocuments,
  attachDocumentToChecklist,
  authDemoLogin,
} from "@/lib/api";
import {
  ApplicationResponse,
  ApplicationChecklistItem,
  ApplicationStatusHistory,
  Scheme,
  UserDocumentResponse,
} from "@/types";
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
  Plus,
  Trash2,
  Paperclip,
  UserCheck,
  Check,
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
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [vaultDocs, setVaultDocs] = useState<UserDocumentResponse[]>([]);
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

  // New Application Modal state
  const [isNewAppModalOpen, setIsNewAppModalOpen] = useState(false);
  const [selectedSchemeId, setSelectedSchemeId] = useState("");
  const [applicationNotes, setApplicationNotes] = useState("");
  const [isCreatingApp, setIsCreatingApp] = useState(false);

  // Attach Document from Vault Modal state
  const [attachModalItem, setAttachModalItem] = useState<{ appId: string; item: ApplicationChecklistItem } | null>(null);
  const [selectedDocIdToAttach, setSelectedDocIdToAttach] = useState("");
  const [isAttaching, setIsAttaching] = useState(false);

  // Transition & delete states
  const [transitioningAppId, setTransitioningAppId] = useState<string | null>(null);
  const [deletingAppId, setDeletingAppId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"deadline" | "created">("deadline");
  const [currentTimestamp, setCurrentTimestamp] = useState<number | null>(null);

  useEffect(() => {
    setCurrentTimestamp(Date.now());
  }, []);

  const getDeadlineUrgency = (dueDateStr?: string | null) => {
    if (!dueDateStr) {
      return { isUrgent: false, isOverdue: false, daysRemaining: null, displayText: "No deadline specified" };
    }
    const due = new Date(dueDateStr).getTime();
    if (isNaN(due)) {
      return { isUrgent: false, isOverdue: false, daysRemaining: null, displayText: dueDateStr };
    }
    // Defer dynamic date difference during SSR prerender
    if (currentTimestamp === null) {
      return {
        isUrgent: false,
        isOverdue: false,
        daysRemaining: null,
        displayText: `Due: ${dueDateStr.slice(0, 10)}`,
      };
    }
    const diffDays = Math.ceil((due - currentTimestamp) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      return { isUrgent: true, isOverdue: true, daysRemaining: diffDays, displayText: t.applications.overdue };
    }
    if (diffDays === 0) {
      return { isUrgent: true, isOverdue: false, daysRemaining: 0, displayText: t.applications.dueToday };
    }
    if (diffDays <= 7) {
      return {
        isUrgent: true,
        isOverdue: false,
        daysRemaining: diffDays,
        displayText: t.applications.dueInDays.replace("{days}", String(diffDays)),
      };
    }
    return {
      isUrgent: false,
      isOverdue: false,
      daysRemaining: diffDays,
      displayText: `Due: ${new Date(dueDateStr).toLocaleDateString()}`,
    };
  };

  const sortedApplications = React.useMemo(() => {
    if (sortBy === "created") {
      return [...applications].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    // Default: sort by deadline ascending (nearest first, nulls at bottom)
    return [...applications].sort((a, b) => {
      if (!a.due_date && !b.due_date) {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });
  }, [applications, sortBy]);

  const urgentAppsCount = React.useMemo(() => {
    if (currentTimestamp === null) return 0;
    return applications.filter((app) => {
      if (!app.due_date || app.status === "approved" || app.status === "withdrawn") return false;
      const due = new Date(app.due_date).getTime();
      if (isNaN(due)) return false;
      const diffDays = Math.ceil((due - currentTimestamp) / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }).length;
  }, [applications, currentTimestamp]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (typeof window !== "undefined" && !localStorage.getItem("sahay_access_token")) {
        try {
          await authDemoLogin();
        } catch {
          // Continue to attempt fetch
        }
      }
      let [apps, allSchemes, docs] = await Promise.all([
        getApplications(),
        getSchemes().catch(() => []),
        getUserDocuments().catch(() => []),
      ]);
      setApplications(apps);
      setSchemes(allSchemes);
      setVaultDocs(docs);

      // Check query param for auto-opening or pre-selecting scheme
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const schemeIdParam = params.get("scheme_id");
        if (schemeIdParam) {
          setSelectedSchemeId(schemeIdParam);
          let targetApp = apps.find((a) => a.scheme_id === schemeIdParam);
          if (!targetApp) {
            try {
              targetApp = await createApplication(schemeIdParam);
              apps = [targetApp, ...apps.filter((a) => a.id !== targetApp!.id)];
              setApplications(apps);
            } catch {
              setIsNewAppModalOpen(true);
            }
          }
          if (targetApp) {
            setExpandedChecklistAppId(targetApp.id);
            try {
              const items = await getApplicationChecklist(targetApp.id);
              setChecklists((prev) => ({ ...prev, [targetApp!.id]: items }));
            } catch {
              // Ignore checklist prefetch error
            }
          }
        }
      }
    } catch (err: unknown) {
      if (err && typeof err === "object" && "statusCode" in err && (err as { statusCode: number }).statusCode === 401) {
        try {
          await authDemoLogin();
          let [apps, allSchemes, docs] = await Promise.all([
            getApplications(),
            getSchemes().catch(() => []),
            getUserDocuments().catch(() => []),
          ]);
          setApplications(apps);
          setSchemes(allSchemes);
          setVaultDocs(docs);

          if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const schemeIdParam = params.get("scheme_id");
            if (schemeIdParam) {
              setSelectedSchemeId(schemeIdParam);
              let targetApp = apps.find((a) => a.scheme_id === schemeIdParam);
              if (!targetApp) {
                try {
                  targetApp = await createApplication(schemeIdParam);
                  apps = [targetApp, ...apps.filter((a) => a.id !== targetApp!.id)];
                  setApplications(apps);
                } catch {
                  setIsNewAppModalOpen(true);
                }
              }
              if (targetApp) {
                setExpandedChecklistAppId(targetApp.id);
                try {
                  const items = await getApplicationChecklist(targetApp.id);
                  setChecklists((prev) => ({ ...prev, [targetApp!.id]: items }));
                } catch {
                  // Ignore checklist prefetch error
                }
              }
            }
          }
          return;
        } catch {
          // Fall through
        }
      }
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
    loadData();
  }, []);

  const handleDemoSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authDemoLogin();
      await loadData();
    } catch (err) {
      setError("Demo sign in failed. Please try logging in manually.");
      setIsLoading(false);
    }
  };

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
      const refreshedApps = await getApplications();
      setApplications(refreshedApps);
    } catch (err) {
      alert("Failed to update checklist item: " + String(err));
    }
  };

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchemeId) {
      alert("Please select a verified government scheme.");
      return;
    }
    setIsCreatingApp(true);
    try {
      const newApp = await createApplication(selectedSchemeId, applicationNotes);
      setIsNewAppModalOpen(false);
      setSelectedSchemeId("");
      setApplicationNotes("");
      await loadData();
      setExpandedChecklistAppId(newApp.id);
      const items = await getApplicationChecklist(newApp.id);
      setChecklists((prev) => ({ ...prev, [newApp.id]: items }));
    } catch (err) {
      alert("Failed to create application: " + String(err));
    } finally {
      setIsCreatingApp(false);
    }
  };

  const handleDeleteApplication = async (appId: string) => {
    if (!confirm("Are you sure you want to discard this application draft?")) return;
    setDeletingAppId(appId);
    try {
      await deleteApplication(appId);
      await loadData();
    } catch (err) {
      alert("Failed to delete application: " + String(err));
    } finally {
      setDeletingAppId(null);
    }
  };

  const handleAttachVaultDocument = async () => {
    if (!attachModalItem || !selectedDocIdToAttach) {
      alert("Please select a document from your vault.");
      return;
    }
    setIsAttaching(true);
    try {
      const updated = await attachDocumentToChecklist(
        attachModalItem.appId,
        attachModalItem.item.id,
        selectedDocIdToAttach
      );
      setChecklists((prev) => ({
        ...prev,
        [attachModalItem.appId]: (prev[attachModalItem.appId] || []).map((ci) =>
          ci.id === attachModalItem.item.id ? updated : ci
        ),
      }));
      setAttachModalItem(null);
      setSelectedDocIdToAttach("");
      const refreshedApps = await getApplications();
      setApplications(refreshedApps);
    } catch (err) {
      alert("Failed to attach document: " + String(err));
    } finally {
      setIsAttaching(false);
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
      await loadData();
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
      await loadData();
    } catch (err) {
      alert("Failed to record consent: " + String(err));
    } finally {
      setIsSubmittingConsent(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === "approved") {
      return (
        <Badge variant="success">
          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-700 dark:text-emerald-300 shrink-0" aria-hidden="true" />
          {t.statuses.approved}
        </Badge>
      );
    }
    if (s === "submitted") {
      return (
        <Badge variant="info">
          <ArrowRight className="w-3 h-3 mr-1 text-sky-700 dark:text-sky-300 shrink-0" aria-hidden="true" />
          {t.statuses.submitted}
        </Badge>
      );
    }
    if (s === "in_review" || s === "under_review") {
      return (
        <Badge variant="brand">
          <Clock className="w-3 h-3 mr-1 text-emerald-800 dark:text-emerald-200 shrink-0" aria-hidden="true" />
          {t.statuses.in_review}
        </Badge>
      );
    }
    if (s === "draft") {
      return (
        <Badge variant="neutral">
          <FileText className="w-3 h-3 mr-1 text-slate-600 dark:text-slate-400 shrink-0" aria-hidden="true" />
          {t.statuses.draft}
        </Badge>
      );
    }
    if (s === "withdrawn") {
      return (
        <Badge variant="neutral">
          <Trash2 className="w-3 h-3 mr-1 text-slate-500 dark:text-slate-400 shrink-0" aria-hidden="true" />
          {t.statuses.withdrawn}
        </Badge>
      );
    }
    if (s === "rejected") {
      return (
        <Badge variant="danger">
          <AlertCircle className="w-3 h-3 mr-1 text-rose-700 dark:text-rose-300 shrink-0" aria-hidden="true" />
          {t.statuses.rejected}
        </Badge>
      );
    }
    return (
      <Badge variant="warning">
        <AlertCircle className="w-3 h-3 mr-1 text-amber-700 dark:text-amber-300 shrink-0" aria-hidden="true" />
        {t.statuses.in_progress}
      </Badge>
    );
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
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsNewAppModalOpen(true)}
            >
              {t.applications.newApplication}
            </Button>
            <Link href="/matches">
              <Button size="sm" variant="outline">
                Evaluate Matches
              </Button>
            </Link>
          </div>
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
          <div className="space-y-2">
            <ErrorBanner
              title={
                error.toLowerCase().includes("token") || error.toLowerCase().includes("login") || error.toLowerCase().includes("auth")
                  ? "Authentication Required"
                  : "Unable to Retrieve Applications"
              }
              message={
                error.toLowerCase().includes("token") || error.toLowerCase().includes("login") || error.toLowerCase().includes("auth")
                  ? "Please sign in to view, create, and track your verified scheme applications."
                  : error
              }
              onRetry={loadData}
              actionLabel="Sign In"
              onAction={() => { window.location.href = "/login"; }}
            />
            {(error.toLowerCase().includes("token") || error.toLowerCase().includes("login") || error.toLowerCase().includes("auth")) && (
              <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800 text-xs">
                <span className="text-emerald-800 dark:text-emerald-300">
                  Exploring Sahay as a reviewer or entrepreneur?
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-emerald-400 text-emerald-700 dark:text-emerald-300"
                  onClick={handleDemoSignIn}
                  leftIcon={<UserCheck className="w-3.5 h-3.5 text-emerald-600" />}
                >
                  1-Click Demo Sign-In
                </Button>
              </div>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : applications.length === 0 ? (
          <Empty
            title={t.applications.noApplications}
            description="You have not started any scheme applications yet. Start an application directly or match schemes against your profile to begin."
            actionLabel={t.applications.newApplication}
            onAction={() => setIsNewAppModalOpen(true)}
          />
        ) : (
          <div className="space-y-4">
            {/* Watchlist & Deadline Sorting Controls (Checkpoint 7) */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  {t.applications.watchlistTitle}:
                </span>
                <Badge variant="brand" size="sm">
                  {applications.length} Total
                </Badge>
                {urgentAppsCount > 0 && (
                  <Badge variant="warning" size="sm" className="font-bold">
                    ⚡ {urgentAppsCount} Urgent (≤ 7 Days)
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Order:</span>
                <Button
                  size="sm"
                  variant={sortBy === "deadline" ? "primary" : "outline"}
                  onClick={() => setSortBy("deadline")}
                  className="text-xs h-7 px-2.5"
                >
                  {t.applications.sortByDeadline}
                </Button>
                <Button
                  size="sm"
                  variant={sortBy === "created" ? "primary" : "outline"}
                  onClick={() => setSortBy("created")}
                  className="text-xs h-7 px-2.5"
                >
                  {t.applications.sortByCreated}
                </Button>
              </div>
            </div>

            {sortedApplications.map((app) => {
              const allowedNext = ALLOWED_STATUS_MAP[app.status] || [];
              const items = checklists[app.id] || [];
              const isExpanded = expandedChecklistAppId === app.id;
              const completedCount = items.filter((i) => i.is_completed).length;

              return (
                <Card key={app.id}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div>
                        <CardTitle className="text-base">{app.scheme_name || "Scheme Application"}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-0.5 text-xs">
                          <Clock className="w-3.5 h-3.5" /> Created: {new Date(app.created_at).toLocaleDateString()}
                          {app.submitted_at && (
                            <span>• Submitted: {new Date(app.submitted_at).toLocaleDateString()}</span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {app.due_date && (() => {
                          const urgency = getDeadlineUrgency(app.due_date);
                          return (
                            <div
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                                urgency.isOverdue
                                  ? "bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800"
                                  : urgency.isUrgent
                                  ? "bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                                  : "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300"
                              }`}
                            >
                              <Clock className="w-3.5 h-3.5 shrink-0" />
                              <span>{urgency.displayText}</span>
                              {urgency.isUrgent && (
                                <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] uppercase font-bold bg-amber-500 text-white">
                                  {t.applications.urgentBadge}
                                </span>
                              )}
                            </div>
                          );
                        })()}
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
                            {t.applications.checklistTitle} ({completedCount}/{items.length})
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
                          <div className="space-y-2 divide-y divide-slate-100 dark:divide-slate-800">
                            {items.map((item) => {
                              const isMandatory = item.is_mandatory ?? item.mandatory;
                              const attachedDoc = item.user_document_id
                                ? vaultDocs.find((d) => d.id === item.user_document_id)
                                : null;

                              return (
                                <div
                                  key={item.id}
                                  className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs"
                                >
                                  <div className="flex items-start gap-2.5">
                                    <input
                                      type="checkbox"
                                      checked={item.is_completed}
                                      onChange={() => handleToggleChecklistItem(app.id, item)}
                                      className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                                    />
                                    <div>
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className={`font-semibold ${item.is_completed ? "text-emerald-900 dark:text-emerald-300" : "text-slate-900 dark:text-white"}`}>
                                          {item.title}
                                        </span>
                                        {isMandatory ? (
                                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-50 text-rose-600 border border-rose-200">
                                            Mandatory
                                          </span>
                                        ) : (
                                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-600">
                                            Optional
                                          </span>
                                        )}
                                      </div>
                                      {item.validation_message ? (
                                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1 font-medium">
                                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                                          {item.validation_message}
                                        </p>
                                      ) : attachedDoc ? (
                                        <p className="text-[11px] text-slate-500 mt-0.5">
                                          Attached: {attachedDoc.file_name} ({attachedDoc.verification_status})
                                        </p>
                                      ) : null}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                                    {!item.is_completed && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-[11px] h-7 px-2"
                                        onClick={() => {
                                          setAttachModalItem({ appId: app.id, item });
                                          setSelectedDocIdToAttach("");
                                        }}
                                      >
                                        <Paperclip className="w-3 h-3 mr-1" /> Attach from Vault
                                      </Button>
                                    )}
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                                      item.is_completed
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                        : "bg-slate-100 text-slate-500"
                                    }`}>
                                      {item.is_completed ? "Completed" : "Pending"}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Interactive 5-Status Switcher (Checkpoint 7) */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs border border-slate-100 dark:border-slate-800">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {t.applications.changeStatus}:
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {[
                          { key: "draft", label: t.statuses.draft },
                          { key: "submitted", label: t.statuses.submitted },
                          { key: "in_review", label: t.statuses.in_review },
                          { key: "approved", label: t.statuses.approved },
                          { key: "withdrawn", label: t.statuses.withdrawn },
                        ].map((s) => {
                          const isCurrent =
                            app.status === s.key ||
                            (s.key === "in_review" && (app.status === "under_review" || app.status === "in_review"));
                          return (
                            <button
                              key={s.key}
                              type="button"
                              disabled={isCurrent || transitioningAppId === app.id}
                              onClick={() => handleStatusTransition(app.id, s.key)}
                              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                                isCurrent
                                  ? "bg-emerald-600 text-white font-bold cursor-default shadow-xs"
                                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600 cursor-pointer"
                              }`}
                            >
                              {s.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
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

                    <div className="flex items-center gap-2 flex-wrap">
                      {["draft", "documents_needed", "withdrawn"].includes(app.status) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs"
                          onClick={() => handleDeleteApplication(app.id)}
                          isLoading={deletingAppId === app.id}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" /> Discard
                        </Button>
                      )}
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

        {/* Start New Application Modal */}
        <Modal
          isOpen={isNewAppModalOpen}
          onClose={() => setIsNewAppModalOpen(false)}
          title="Start Scheme Application Checklist"
          description="Select a verified government scheme to initialize a formal application checklist and tracking timeline."
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsNewAppModalOpen(false)}>
                {t.common.cancel}
              </Button>
              <Button onClick={handleCreateApplication} isLoading={isCreatingApp} disabled={!selectedSchemeId}>
                Initialize Application
              </Button>
            </div>
          }
        >
          <form onSubmit={handleCreateApplication} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Scheme
              </label>
              <select
                value={selectedSchemeId}
                onChange={(e) => setSelectedSchemeId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white"
                required
              >
                <option value="">-- Choose a verified scheme --</option>
                {schemes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.provider})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Application Notes / Project Purpose (Optional)
              </label>
              <textarea
                value={applicationNotes}
                onChange={(e) => setApplicationNotes(e.target.value)}
                rows={3}
                placeholder="e.g. Financing for machinery expansion in textile workshop"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white"
              />
            </div>
          </form>
        </Modal>

        {/* Attach Document from Vault Modal */}
        {attachModalItem && (
          <Modal
            isOpen={Boolean(attachModalItem)}
            onClose={() => setAttachModalItem(null)}
            title={`Attach Document: ${attachModalItem.item.title}`}
            description="Select an encrypted document from your vault to fulfill this application checklist requirement."
            footer={
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setAttachModalItem(null)}>
                  {t.common.cancel}
                </Button>
                <Button
                  onClick={handleAttachVaultDocument}
                  isLoading={isAttaching}
                  disabled={!selectedDocIdToAttach}
                >
                  Confirm Attachment
                </Button>
              </div>
            }
          >
            <div className="space-y-4">
              {vaultDocs.length === 0 ? (
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg text-center text-xs text-slate-500 space-y-2">
                  <p>Your Document Vault is currently empty.</p>
                  <Link href="/documents">
                    <Button size="sm">Go to Vault & Upload Document</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Select Vault Document
                  </label>
                  <select
                    value={selectedDocIdToAttach}
                    onChange={(e) => setSelectedDocIdToAttach(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white"
                  >
                    <option value="">-- Choose document from vault --</option>
                    {vaultDocs.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.display_label || doc.file_name} ({doc.document_type.replace(/_/g, " ").toUpperCase()} • {doc.verification_status})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </Modal>
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
                {historyItems.map((h) => {
                  const targetStatus = h.to_status || h.new_status || "STATUS_UPDATED";
                  const originStatus = h.from_status || h.previous_status;
                  const reason = h.change_reason || h.notes;

                  return (
                    <div key={h.id} className="pt-2.5 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-white uppercase">
                            {targetStatus.replace(/_/g, " ")}
                          </span>
                          {originStatus && (
                            <span className="text-slate-400 text-[10px]">
                              (from {originStatus.replace(/_/g, " ")})
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(h.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px]">
                        Actor: <span className="font-semibold">{h.actor_role}</span> {reason && `• ${reason}`}
                      </p>
                    </div>
                  );
                })}
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
                  Authorized Data Fields (Comma Separated)
                </label>
                <textarea
                  value={sharedFields}
                  onChange={(e) => setSharedFields(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white font-mono text-xs"
                />
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppLayout>
  );
}
