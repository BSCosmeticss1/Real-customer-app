"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Mail, Lock, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSendOTP = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("OTP sent to your email");
        setStep(2);
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("OTP verified");
        setStep(3);
      } else {
        toast.error(data.message || "Invalid or expired OTP");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Password reset successfully");
        setStep(4); // Success screen
      } else {
        toast.error(data.message || "Failed to reset password");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (step === 4) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>
        <h1 className="font-display text-3xl font-semibold mb-2">Password Reset Successful!</h1>
        <p className="text-muted-foreground mb-8">You can now sign in with your new password.</p>
        <Link href="/login" className="bg-primary text-primary-foreground rounded-xl px-8 py-3.5 font-semibold shadow-deep hover:bg-primary-glow transition">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen grid lg:grid-cols-2 bg-background overflow-hidden">
      <div className="hidden lg:flex flex-col justify-between p-12 text-primary-foreground relative overflow-hidden shrink-0" style={{ background: "var(--gradient-deep)" }}>
        <Link href="/" className="font-display text-xl font-semibold">Real customer App</Link>
        <div>
          <div className="label-eyebrow text-primary-foreground/70">Account Security</div>
          <h2 className="font-display text-5xl font-semibold mt-4 leading-[1.05]">
            Secure your<br />workspace with<br />ease.
          </h2>
        </div>
      </div>

      <div className="flex flex-col px-8 sm:px-16 py-6 overflow-y-auto">
        <div className="max-w-md w-full mx-auto my-auto py-8">
          <div className="lg:hidden mb-6">
            <Link href="/" className="font-display text-xl font-semibold">Real customer App</Link>
          </div>
          
          <Link href="/login" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition mb-8 group w-fit">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition" />
            Back to login
          </Link>

          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="font-display text-3xl sm:text-4xl font-semibold text-foreground">Forgot password?</h1>
              <p className="text-muted-foreground mt-2">No worries, we'll send you reset instructions.</p>
              <form onSubmit={handleSendOTP} className="mt-8 space-y-5">
                <Field 
                  icon={Mail} 
                  label="Work email" 
                  placeholder="jane@acme.com" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                {/* Removed inline error display in favor of toast */}
                <button disabled={loading} type="submit" className="w-full bg-primary text-primary-foreground rounded-xl py-3.5 font-semibold flex items-center justify-center gap-2 shadow-deep hover:bg-primary-glow transition disabled:opacity-50">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Send reset code
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="font-display text-3xl sm:text-4xl font-semibold text-foreground">Verify OTP</h1>
              <p className="text-muted-foreground mt-2">Enter the 6-digit code sent to <strong>{email}</strong>.</p>
              <form onSubmit={handleVerifyOTP} className="mt-8 space-y-5">
                <Field 
                  icon={Lock} 
                  label="Reset Code" 
                  placeholder="000000" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
                {/* Removed inline error display in favor of toast */}
                <button disabled={loading} type="submit" className="w-full bg-primary text-primary-foreground rounded-xl py-3.5 font-semibold flex items-center justify-center gap-2 shadow-deep hover:bg-primary-glow transition disabled:opacity-50">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Verify code
                </button>
              </form>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="font-display text-3xl sm:text-4xl font-semibold text-foreground">Set new password</h1>
              <p className="text-muted-foreground mt-2">Must be at least 6 characters.</p>
              <form onSubmit={handleResetPassword} className="mt-8 space-y-5">
                <Field 
                  icon={Lock} 
                  label="New Password" 
                  type="password"
                  placeholder="••••••••" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <Field 
                  icon={Lock} 
                  label="Confirm New Password" 
                  type="password"
                  placeholder="••••••••" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                {/* Removed inline error display in favor of toast */}
                <button disabled={loading} type="submit" className="w-full bg-primary text-primary-foreground rounded-xl py-3.5 font-semibold flex items-center justify-center gap-2 shadow-deep hover:bg-primary-glow transition disabled:opacity-50">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Reset password
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, ...props }: { icon: any; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="relative mt-2">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input {...props} className="w-full bg-card border border-border rounded-xl pl-11 pr-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" />
      </div>
    </label>
  );
}
