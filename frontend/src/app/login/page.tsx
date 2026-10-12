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
  const [phone, setPhone] = useState("9876543210");
  const [otp, setOtp] = useState("123456");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length >= 10) {
      setError(null);
      setStep("otp");
    } else {
      setError("Please enter a valid 10-digit mobile number.");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await authLogin(phone, undefined, otp);
      router.push("/dashboard");
    } catch (err) {
      setError(
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Authentication failed. Ensure backend is running."
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

            {step === "phone" ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <Input
                  label="Phone Number"
                  placeholder="e.g. 9876543210"
                  leftIcon={<Phone className="w-4 h-4" />}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  helperText="Development bypass: any 10-digit phone number works."
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
                  placeholder="123456"
                  leftIcon={<Lock className="w-4 h-4" />}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  helperText={`Test passcode 123456 sent to +91 ${phone}`}
                  required
                />
                <Button type="submit" className="w-full" isLoading={isLoading}>
                  Verify & Enter Dashboard
                </Button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep("phone")}
                    className="text-xs text-emerald-600 hover:underline cursor-pointer"
                  >
                    Change phone number
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
