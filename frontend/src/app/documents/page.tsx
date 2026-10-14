"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { CardSkeleton } from "@/components/ui/Loading";
import { Empty } from "@/components/ui/Empty";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import {
  getUserDocuments,
  uploadDocument,
  downloadDocument,
  deleteDocument,
  getApplications,
  authDemoLogin,
} from "@/lib/api";
import { UserDocumentResponse, ApplicationResponse } from "@/types";
import { useLanguage } from "@/lib/i18n";
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Trash2,
  ShieldCheck,
  FileCheck2,
  ExternalLink,
  Info,
  Copy,
  Check,
  UserCheck,
  Filter,
} from "lucide-react";

export default function DocumentsPage() {
  const { t } = useLanguage();
  const [documents, setDocuments] = useState<UserDocumentResponse[]>([]);
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterType, setFilterType] = useState<string>("all");
  const [filterAppId, setFilterAppId] = useState<string>("all");

  // Inspect Modal state
  const [inspectedDoc, setInspectedDoc] = useState<UserDocumentResponse | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("udyam");
  const [displayLabel, setDisplayLabel] = useState("");
  const [selectedAppId, setSelectedAppId] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const [docs, apps] = await Promise.all([
        getUserDocuments(),
        getApplications().catch(() => []),
      ]);
      setDocuments(docs);
      setApplications(apps);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "statusCode" in err && (err as { statusCode: number }).statusCode === 401) {
        try {
          await authDemoLogin();
          const [docs, apps] = await Promise.all([
            getUserDocuments(),
            getApplications().catch(() => []),
          ]);
          setDocuments(docs);
          setApplications(apps);
          return;
        } catch {
          // Fall through to error setting
        }
      }
      setError(
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to load document vault."
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
    } catch {
      setError("Demo sign in failed. Please try logging in manually.");
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setUploadError("File size exceeds 10MB limit. Please upload a smaller file.");
        setSelectedFile(null);
        return;
      }
      const allowed = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
      if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|png|jpg|jpeg)$/i)) {
        setUploadError("Invalid format. Please upload PDF, PNG, or JPEG documents.");
        setSelectedFile(null);
        return;
      }
      setUploadError(null);
      setSelectedFile(file);
      if (!displayLabel) {
        setDisplayLabel(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError("Please select a file to upload.");
      return;
    }
    setIsUploading(true);
    setUploadError(null);
    try {
      await uploadDocument(
        selectedFile,
        docType,
        selectedAppId.trim() ? selectedAppId : undefined
      );
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setDisplayLabel("");
      setSelectedAppId("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadData();
    } catch (err) {
      setUploadError(
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Upload failed. Please verify format and size."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (doc: UserDocumentResponse) => {
    setDownloadingId(doc.id);
    try {
      await downloadDocument(doc.id, doc.file_name);
    } catch (err) {
      alert("Download failed: " + String(err));
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (doc: UserDocumentResponse) => {
    if (!confirm(`${t.vault.deleteConfirm} (${doc.file_name})`)) return;
    setDeletingId(doc.id);
    try {
      await deleteDocument(doc.id);
      await loadData();
    } catch (err) {
      alert("Delete failed: " + String(err));
    } finally {
      setDeletingId(null);
    }
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes <= 0) return "0 KB";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const filteredDocuments = documents.filter((doc) => {
    if (filterType !== "all" && doc.document_type !== filterType) {
      return false;
    }
    if (filterAppId === "unlinked" && doc.application_id) {
      return false;
    }
    if (filterAppId !== "all" && filterAppId !== "unlinked" && doc.application_id !== filterAppId) {
      return false;
    }
    return true;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
              {t.vault.title}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.vault.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              leftIcon={<UploadCloud className="w-4 h-4" />}
              onClick={() => {
                setSelectedFile(null);
                setDisplayLabel("");
                setUploadError(null);
                setIsUploadModalOpen(true);
              }}
            >
              {t.vault.uploadButton}
            </Button>
            <Link href="/applications">
              <Button size="sm" variant="outline">
                View Applications
              </Button>
            </Link>
          </div>
        </div>

        {/* Security & Verification Banner */}
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/20 p-4 text-xs text-emerald-900 dark:text-emerald-300 flex items-start gap-3">
          <FileCheck2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold">{t.vault.maxSizeNotice}</span> —{" "}
            {t.vault.allowedTypesNotice}
            <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
              Files are verified by magic byte signatures, isolated per tenant, and registered with SHA-256 integrity checksums.
            </div>
          </div>
        </div>

        {error && (
          <div className="space-y-2">
            <ErrorBanner
              title={
                error.toLowerCase().includes("token") || error.toLowerCase().includes("auth") || error.toLowerCase().includes("login")
                  ? "Authentication Required"
                  : "Vault Loading Error"
              }
              message={
                error.toLowerCase().includes("token") || error.toLowerCase().includes("auth") || error.toLowerCase().includes("login")
                  ? "Please sign in to view and manage your encrypted enterprise documents."
                  : error
              }
              onRetry={loadData}
              actionLabel="Sign In"
              onAction={() => { window.location.href = "/login"; }}
            />
            {(error.toLowerCase().includes("token") || error.toLowerCase().includes("auth") || error.toLowerCase().includes("login")) && (
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

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-base">{t.vault.title}</CardTitle>
                <CardDescription>
                  {documents.length} verified documents in metadata vault. Linked documents automatically fulfill scheme application checklists.
                </CardDescription>
              </div>
              {/* Filter controls */}
              {documents.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Filter className="w-3.5 h-3.5" /> Filter:
                  </div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-slate-800 dark:text-slate-200"
                  >
                    <option value="all">All Document Types</option>
                    <option value="udyam">Udyam Registration</option>
                    <option value="pan">PAN Card</option>
                    <option value="bank_statement">Bank Statement</option>
                    <option value="project_report">Project Report</option>
                    <option value="trade_license">Trade License</option>
                    <option value="gst_certificate">GST Certificate</option>
                    <option value="other">Other</option>
                  </select>
                  <select
                    value={filterAppId}
                    onChange={(e) => setFilterAppId(e.target.value)}
                    className="text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-slate-800 dark:text-slate-200"
                  >
                    <option value="all">All Applications</option>
                    <option value="unlinked">Unlinked (General)</option>
                    {applications.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.scheme_name || "Scheme"}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : filteredDocuments.length === 0 ? (
              <Empty
                title={documents.length === 0 ? t.vault.emptyVault : "No Matching Documents"}
                description={
                  documents.length === 0
                    ? "Upload your Udyam, PAN, GST, or Bank Statements to automatically satisfy scheme document checklists."
                    : "No documents found matching the selected type or application filters."
                }
                actionLabel={documents.length === 0 ? t.vault.uploadButton : "Clear Filters"}
                onAction={() => {
                  if (documents.length === 0) {
                    setSelectedFile(null);
                    setUploadError(null);
                    setIsUploadModalOpen(true);
                  } else {
                    setFilterType("all");
                    setFilterAppId("all");
                  }
                }}
              />
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredDocuments.map((doc) => {
                  const linkedApp = applications.find((a) => a.id === doc.application_id);

                  return (
                    <div
                      key={doc.id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                            doc.verification_status === "verified"
                              ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border border-emerald-200 dark:border-emerald-800"
                              : "bg-amber-50 dark:bg-amber-950 text-amber-500 border border-amber-200 dark:border-amber-800"
                          }`}
                        >
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                              {doc.display_label || doc.document_type.replace(/_/g, " ").toUpperCase()}
                            </h4>
                            <Badge
                              variant={doc.verification_status === "verified" ? "success" : "warning"}
                              size="sm"
                            >
                              <span className="flex items-center gap-1 text-[10px]">
                                {doc.verification_status === "verified" ? (
                                  <CheckCircle2 className="w-3 h-3" />
                                ) : (
                                  <AlertCircle className="w-3 h-3" />
                                )}
                                {doc.verification_status === "verified" ? t.vault.verified : t.vault.pending}
                              </span>
                            </Badge>
                            {linkedApp && (
                              <Link
                                href={`/applications?app_id=${linkedApp.id}`}
                                className="text-[11px] px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1 hover:underline"
                              >
                                <ExternalLink className="w-3 h-3" /> {linkedApp.scheme_name || "Application Linked"}
                              </Link>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-mono mt-1">
                            {doc.file_name} • {formatFileSize(doc.file_size_bytes)} • {new Date(doc.created_at).toLocaleDateString()}
                          </p>
                          {doc.rejection_reason && (
                            <p className="text-xs text-rose-600 mt-1 font-medium">
                              Reason: {doc.rejection_reason}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                        <Button
                          size="sm"
                          variant="ghost"
                          leftIcon={<Info className="w-3.5 h-3.5" />}
                          onClick={() => setInspectedDoc(doc)}
                          className="text-xs"
                        >
                          Inspect
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<Download className="w-3.5 h-3.5" />}
                          onClick={() => handleDownload(doc)}
                          isLoading={downloadingId === doc.id}
                        >
                          {t.vault.download}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 p-2"
                          onClick={() => handleDelete(doc)}
                          isLoading={deletingId === doc.id}
                          title={t.vault.delete}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inspect Metadata Modal */}
        {inspectedDoc && (
          <Modal
            isOpen={Boolean(inspectedDoc)}
            onClose={() => setInspectedDoc(null)}
            title="Document Metadata & Cryptographic Integrity"
            description="Verified cryptographic checksum and storage parameters stored in the metadata catalog."
            footer={
              <Button onClick={() => setInspectedDoc(null)}>
                Close
              </Button>
            }
          >
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg space-y-2 font-mono">
                <div>
                  <span className="text-slate-400">File Name:</span>{" "}
                  <span className="font-semibold text-slate-900 dark:text-white">{inspectedDoc.file_name}</span>
                </div>
                <div>
                  <span className="text-slate-400">Document Type:</span>{" "}
                  <span className="font-semibold text-slate-900 dark:text-white">{inspectedDoc.document_type}</span>
                </div>
                <div>
                  <span className="text-slate-400">File Size:</span>{" "}
                  <span className="text-slate-900 dark:text-white">{formatFileSize(inspectedDoc.file_size_bytes)} ({inspectedDoc.file_size_bytes} bytes)</span>
                </div>
                <div>
                  <span className="text-slate-400">Verification State:</span>{" "}
                  <Badge variant={inspectedDoc.verification_status === "verified" ? "success" : "warning"} size="sm">
                    {inspectedDoc.verification_status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  SHA-256 Cryptographic Checksum
                </label>
                <div className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[11px] text-slate-700 dark:text-slate-300 break-all">
                  <span className="flex-1">{inspectedDoc.checksum_sha256 || "Pending computation"}</span>
                  {inspectedDoc.checksum_sha256 && (
                    <button
                      type="button"
                      onClick={() => copyHash(inspectedDoc.checksum_sha256!)}
                      className="p-1 text-slate-500 hover:text-emerald-600 cursor-pointer"
                      title="Copy Checksum"
                    >
                      {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Modal>
        )}

        {/* Upload Modal with File Selection and Application Linkage */}
        <Modal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          title={t.vault.uploadTitle}
          description="Upload an official certificate or banking record (PDF, PNG, JPG up to 10MB)."
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsUploadModalOpen(false)}>
                {t.common.cancel}
              </Button>
              <Button onClick={handleUploadSubmit} isLoading={isUploading}>
                {isUploading ? t.vault.uploading : t.vault.uploadButton}
              </Button>
            </div>
          }
        >
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            {uploadError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                {uploadError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.vault.docType}
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white"
              >
                <option value="udyam">Udyam Registration Certificate</option>
                <option value="pan">Proprietor / Entity PAN Card</option>
                <option value="bank_statement">Bank Statement (Last 6 Months)</option>
                <option value="project_report">Detailed Project Report (DPR)</option>
                <option value="trade_license">Municipal Trade License</option>
                <option value="gst_certificate">GST Registration Certificate</option>
                <option value="caste_certificate">Caste / Category Certificate (if applicable)</option>
                <option value="other">Other Supporting Verification Document</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Display Label (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Udyam Certificate - West Bengal Unit"
                value={displayLabel}
                onChange={(e) => setDisplayLabel(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Attach to Application (Optional)
              </label>
              <select
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white"
              >
                <option value="">-- General Vault Storage (No specific scheme) --</option>
                {applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.scheme_name || "Application"} ({app.status})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                If selected, matching checklist requirements in this application will automatically be marked fulfilled.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select File (PDF, PNG, JPG - Max 10MB)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                required
              />
              {selectedFile && (
                <p className="text-xs text-emerald-600 mt-1 font-mono">
                  Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              )}
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
