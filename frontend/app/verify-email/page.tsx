"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Mail, CheckCircle2 } from "lucide-react";

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!email) {
      router.push("/signup");
    }
  }, [email, router]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/onboarding");
        }, 2000);
      } else {
        setError(data.message || "Invalid verification code");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      alert("Verification code resent!");
    } catch (err) {
      alert("Failed to resend code");
    }
  };

  if (success) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>
        <h1 className="font-display text-3xl font-semibold mb-2">Email Verified!</h1>
        <p className="text-muted-foreground mb-8">Redirecting you to onboarding...</p>
      </div>
    );
  }

  return (
    <div className="h-screen grid lg:grid-cols-2 bg-background overflow-hidden">
      <div className="hidden lg:flex flex-col justify-between p-12 text-primary-foreground relative overflow-hidden" style={{ background: "var(--gradient-deep)" }}>
        <Link href="/" className="font-display text-xl font-semibold">Real customer App</Link>
        <div>
          <h2 className="font-display text-5xl font-semibold mt-4 leading-[1.05]">Verify your<br />identity.</h2>
          <p className="text-primary-foreground/75 mt-6 max-w-sm leading-relaxed">
            We've sent a 6-digit code to <strong>{email}</strong>. Enter it below to continue setting up your organization.
          </p>
        </div>
      </div>

      <div className="flex flex-col px-8 sm:px-16 py-6 overflow-y-auto">
        <div className="max-w-md w-full mx-auto my-auto py-8">
          <div className="lg:hidden mb-6">
            <Link href="/" className="font-display text-xl font-semibold">Real customer App</Link>
          </div>
          <div className="label-eyebrow">Step 1 of 3</div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold mt-2 text-foreground">Check your email</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">Enter the code we sent to your inbox.</p>

          <form onSubmit={onSubmit} className="mt-6 sm:mt-8 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Verification Code</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  required
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="000000"
                  className="w-full bg-card border border-border rounded-xl pl-11 pr-4 py-3.5 text-2xl tracking-[0.5em] font-mono placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
              </div>
              {error && <p className="text-destructive text-sm mt-2">{error}</p>}
            </div>

            <button
              disabled={loading || otp.length < 6}
              type="submit"
              className="w-full bg-primary text-primary-foreground rounded-xl py-3.5 font-semibold flex items-center justify-center gap-2 shadow-deep hover:bg-primary-glow transition disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify email"} <ArrowRight className="h-4 w-4" />
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={resendOtp}
                className="text-sm text-primary font-semibold hover:underline"
              >
                Didn't receive a code? Resend
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
