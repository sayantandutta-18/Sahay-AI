"use client";

import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { UploadCloud, CheckCircle2, AlertCircle, FileText, Download } from "lucide-react";

const userDocs = [
  {
    type: "Udyam MSME Certificate",
    fileName: "UDYAM-WB-14-0019284.pdf",
    verified: true,
    uploadedAt: "10 Feb 2026",
    status: "Verified",
  },
  {
    type: "Permanent Account Number (PAN)",
    fileName: "PROPRIETOR_PAN_CARD.pdf",
    verified: true,
    uploadedAt: "08 Feb 2026",
    status: "Verified",
  },
  {
    type: "Bank Statement (Last 6 Months)",
    fileName: "SBI_CURRENT_ACC_OCT_MAR.pdf",
    verified: true,
    uploadedAt: "15 Feb 2026",
    status: "Verified",
  },
  {
    type: "Project Appraisal Report (DPR)",
    fileName: "Not Uploaded",
    verified: false,
    uploadedAt: "---",
    status: "Missing",
  },
];

export default function DocumentsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Document Vault
            </h1>
            <p className="text-xs text-slate-500">
              Encrypted storage for business certificates and KYC documentation.
            </p>
          </div>
          <Button size="sm" leftIcon={<UploadCloud className="w-4 h-4" />}>
            Upload Document
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Document Verification Status</CardTitle>
            <CardDescription>
              Documents are scanned for validity dates and metadata before scheme submission.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {userDocs.map((doc, idx) => (
                <div key={idx} className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      doc.verified ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600" : "bg-rose-50 dark:bg-rose-950 text-rose-500"
                    }`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {doc.type}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono">
                        {doc.fileName} • {doc.uploadedAt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={doc.verified ? "success" : "danger"} size="sm">
                      {doc.verified ? (
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {doc.status}</span>
                      ) : (
                        <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {doc.status}</span>
                      )}
                    </Badge>
                    {doc.verified ? (
                      <Button size="sm" variant="ghost" className="p-1 h-8 w-8">
                        <Download className="w-4 h-4 text-slate-500" />
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline">
                        Upload
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
