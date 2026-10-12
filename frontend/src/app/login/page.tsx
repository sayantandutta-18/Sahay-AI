"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { authLogin } from "@/lib/api";
import { Sparkles, Phone, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [mode, setMode] = useState<"password" | "otp">("password");
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await authLogin(phone, password);
      router.push("/dashboard");
    } catch (err) {
      setError(
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Authentication failed. Please verify your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length >= 10) {
      setError(null);
      setOtpSent(true);
    } else {
      setError("Please enter a valid 10-digit mobile number.");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError("Please enter the verification code.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await authLogin(phone, undefined, otp);
      router.push("/dashboard");
    } catch (err) {
      setError(
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "OTP verification failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout showSidebar={false}>
      <div className="max-w-md mx-auto my-12">
        <Card className="shadow-lg border-slate-200 dark:border-slate-800">
          <CardHeader className="text-center items-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md mb-2">
              <Sparkles className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl">Sign In to SAHAY</CardTitle>
            <CardDescription>
              Multilingual intelligence for Indian micro-entrepreneurs
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <ErrorBanner
                title="Authentication Issue"
                message={error}
                onRetry={() => setError(null)}
              />
            )}

            <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 mb-4 text-xs font-medium">
              <button
                type="button"
                onClick={() => { setMode("password"); setOtpSent(false); setError(null); }}
                className={`flex-1 py-1.5 rounded-md transition-colors ${
                  mode === "password"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Password Login
              </button>
              <button
                type="button"
                onClick={() => { setMode("otp"); setError(null); }}
                className={`flex-1 py-1.5 rounded-md transition-colors ${
                  mode === "otp"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                OTP Login
              </button>
            </div>

            {mode === "password" ? (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <Input
                  label="Mobile Number"
                  placeholder="Enter 10-digit mobile number"
                  leftIcon={<Phone className="w-4 h-4" />}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  leftIcon={<Lock className="w-4 h-4" />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button type="submit" className="w-full" isLoading={isLoading} rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Sign In
                </Button>
              </form>
            ) : !otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <Input
                  label="Mobile Number"
                  placeholder="Enter 10-digit mobile number"
                  leftIcon={<Phone className="w-4 h-4" />}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <Button type="submit" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Send Verification Code
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <Input
                  label="Enter 6-Digit OTP"
                  placeholder="Enter received OTP"
                  leftIcon={<Lock className="w-4 h-4" />}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  helperText={`Passcode verification for +91 ${phone}`}
                  required
                />
                <Button type="submit" className="w-full" isLoading={isLoading}>
                  Verify & Enter Dashboard
                </Button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtp(""); }}
                    className="text-xs text-emerald-600 hover:underline cursor-pointer"
                  >
                    Change mobile number
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-500">
                New micro-entrepreneur?{" "}
                <Link href="/onboarding" className="text-emerald-600 font-semibold hover:underline">
                  Start Onboarding
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
