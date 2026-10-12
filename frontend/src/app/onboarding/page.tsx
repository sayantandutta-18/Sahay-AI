"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { User, Building2, FileCheck2, ArrowRight, ArrowLeft } from "lucide-react";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "Ramesh Sharma",
    phone: "9876543210",
    language: "en",
    state: "West Bengal",
    district: "Kolkata",
    businessName: "Sharma Agro Handicrafts",
    businessType: "manufacturing",
    category: "micro",
    annualTurnover: "850000",
    gender: "male",
    hasUdyam: true,
    hasGst: false,
    hasPan: true,
    hasBankAccount: true,
  });

  const totalSteps = 3;
  const progressPercent = Math.round((step / totalSteps) * 100);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Progress header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Step {step} of {totalSteps}: {step === 1 ? "Personal Profile" : step === 2 ? "Business Profile" : "Registrations & Banking"}</span>
            <span>{progressPercent}% Complete</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              {step === 1 && <User className="w-5 h-5 text-emerald-600" />}
              {step === 2 && <Building2 className="w-5 h-5 text-emerald-600" />}
              {step === 3 && <FileCheck2 className="w-5 h-5 text-emerald-600" />}
              <CardTitle>
                {step === 1 && "Personal & Location Information"}
                {step === 2 && "Micro-Enterprise Information"}
                {step === 3 && "Documents & Financial Readiness"}
              </CardTitle>
            </div>
            <CardDescription>
              {step === 1 && "Basic details used for regional and demographic scheme eligibility."}
              {step === 2 && "Turnover and sector parameters evaluated by government scheme rules."}
              {step === 3 && "Verified documentation status for automated checklist matching."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {step === 1 && (
              <>
                <Input
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Input
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="State"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                  <Input
                    label="District"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <Input
                  label="Business Enterprise Name"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Business Type
                    </label>
                    <select
                      value={formData.businessType}
                      onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white"
                    >
                      <option value="manufacturing">Manufacturing / Production</option>
                      <option value="services">Services</option>
                      <option value="trading">Retail / Trading</option>
                      <option value="agriculture_allied">Agro / Allied</option>
                    </select>
                  </div>

                  <Input
                    label="Annual Turnover (₹)"
                    value={formData.annualTurnover}
                    onChange={(e) => setFormData({ ...formData, annualTurnover: e.target.value })}
                  />
                </div>
              </>
            )}

            {step === 3 && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Select available business document credentials:
                </p>
                {[
                  { key: "hasUdyam", label: "Udyam MSME Registration Certificate" },
                  { key: "hasPan", label: "PAN Card (Business or Proprietor)" },
                  { key: "hasBankAccount", label: "Active Bank Current/Savings Account" },
                  { key: "hasGst", label: "GSTIN Certificate" },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(formData[item.key as keyof typeof formData])}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [item.key]: e.target.checked,
                        })
                      }
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </CardContent>

          <CardFooter>
            {step > 1 ? (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
            ) : <div />}

            {step < totalSteps ? (
              <Button
                onClick={() => setStep(step + 1)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Next Step
              </Button>
            ) : (
              <Button
                onClick={() => {
                  window.location.href = "/matches";
                }}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Complete & Check Eligibility
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
}
