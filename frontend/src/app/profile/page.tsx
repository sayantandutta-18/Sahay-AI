"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { UserCircle, Save, CheckCircle2 } from "lucide-react";

export default function ProfilePage() {
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    name: "Ramesh Sharma",
    phone: "9876543210",
    role: "entrepreneur",
    language: "en",
    state: "West Bengal",
    district: "Kolkata",
    businessName: "Sharma Agro Handicrafts",
    businessType: "manufacturing",
    category: "micro",
    annualTurnover: 850000,
    monthlyRevenue: 75000,
    monthlyExpense: 48000,
    existingLoans: 0,
    hasUdyam: true,
    hasGst: false,
    hasPan: true,
    hasBankAccount: true,
    completionPercentage: 88,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Profile & Enterprise Data
            </h1>
            <p className="text-xs text-slate-500">
              Manage your personal and business credentials for scheme matching.
            </p>
          </div>
          <Badge variant="success" size="md">
            Profile {profile.completionPercentage}% Complete
          </Badge>
        </div>

        {saved && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <UserCircle className="w-5 h-5 text-emerald-600" />
                Personal Profile
              </CardTitle>
              <CardDescription>Demographic criteria for state/central initiatives</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
              <Input
                label="Phone Number"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
              <Input
                label="State"
                value={profile.state}
                onChange={(e) => setProfile({ ...profile, state: e.target.value })}
              />
              <Input
                label="District"
                value={profile.district}
                onChange={(e) => setProfile({ ...profile, district: e.target.value })}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Business Metrics</CardTitle>
              <CardDescription>Financial turnover and operational scope</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Business Enterprise Name"
                value={profile.businessName}
                onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
              />
              <Input
                label="Annual Turnover (₹)"
                type="number"
                value={profile.annualTurnover}
                onChange={(e) => setProfile({ ...profile, annualTurnover: Number(e.target.value) })}
              />
              <Input
                label="Monthly Revenue (₹)"
                type="number"
                value={profile.monthlyRevenue}
                onChange={(e) => setProfile({ ...profile, monthlyRevenue: Number(e.target.value) })}
              />
              <Input
                label="Monthly Expenses (₹)"
                type="number"
                value={profile.monthlyExpense}
                onChange={(e) => setProfile({ ...profile, monthlyExpense: Number(e.target.value) })}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" leftIcon={<Save className="w-4 h-4" />}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
