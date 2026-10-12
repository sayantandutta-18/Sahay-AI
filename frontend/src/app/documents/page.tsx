"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { CardSkeleton } from "@/components/ui/Loading";
import { Empty } from "@/components/ui/Empty";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { getUserDocuments, recordDocumentUpload } from "@/lib/api";
import { UserDocumentResponse } from "@/types";
import { UploadCloud, CheckCircle2, AlertCircle, FileText, Download } from "lucide-react";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<UserDocumentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [docType, setDocType] = useState("udyam");
  const [fileName, setFileName] = useState("UDYAM-WB-02-0049281.pdf");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadDocuments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getUserDocuments();
      setDocuments(data);
    } catch (err) {
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
    loadDocuments();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await recordDocumentUpload({
        document_type: docType,
        file_name: fileName,
        file_size_bytes: 1024 * 512,
      });
      setIsUploadModalOpen(false);
      await loadDocuments();
    } catch (err) {
      alert("Upload failed: " + String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Document Vault & Metadata Store
            </h1>
            <p className="text-xs text-slate-500">
              Encrypted metadata storage for enterprise KYC and certificates.
            </p>
          </div>
          <Button
            size="sm"
            leftIcon={<UploadCloud className="w-4 h-4" />}
            onClick={() => setIsUploadModalOpen(true)}
          >
            Upload Document
          </Button>
        </div>

        {error && (
          <ErrorBanner
            title="Vault Loading Error"
            message={error}
            onRetry={loadDocuments}
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Document Vault Checklist</CardTitle>
            <CardDescription>
              Documents are indexed by cryptographic digest and attached to scheme applications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : documents.length === 0 ? (
              <Empty
                title="Vault is Empty"
                description="Upload your Udyam, PAN, or Bank Statements to automatically fulfill scheme checklists."
                actionLabel="Upload First Document"
                onAction={() => setIsUploadModalOpen(true)}
              />
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          doc.verification_status === "verified"
                            ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600"
                            : "bg-amber-50 dark:bg-amber-950 text-amber-500"
                        }`}
                      >
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                          {doc.document_type.replace("_", " ").toUpperCase()}
                        </h4>
                        <p className="text-xs text-slate-400 font-mono">
                          {doc.file_name} • {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge
                        variant={doc.verification_status === "verified" ? "success" : "warning"}
                        size="sm"
                      >
                        <span className="flex items-center gap-1">
                          {doc.verification_status === "verified" ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          {doc.verification_status.toUpperCase()}
                        </span>
                      </Badge>
                      <Button size="sm" variant="ghost" className="p-1 h-8 w-8">
                        <Download className="w-4 h-4 text-slate-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upload Metadata Modal */}
        <Modal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          title="Upload Document to Vault"
          description="Register your business registration or banking documents for eligibility verification."
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsUploadModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUploadSubmit} isLoading={isSubmitting}>
                Save to Vault
              </Button>
            </div>
          }
        >
          <form onSubmit={handleUploadSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Document Category
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white"
              >
                <option value="udyam">Udyam MSME Certificate</option>
                <option value="pan">Proprietor / Company PAN</option>
                <option value="bank_statement">Bank Statement (Last 6 Months)</option>
                <option value="project_report">Detailed Project Report (DPR)</option>
                <option value="trade_license">Municipal Trade License</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                File Name
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white"
                required
              />
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
