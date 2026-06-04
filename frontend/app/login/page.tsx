"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail, Lock } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem("token", data.data.token);
        toast.success("Welcome back!");
        
        // Check onboarding status
        const { onboardingStatus, isVerified, email } = data.data.user;
        
        if (!isVerified) {
          router.push(`/verify-email?email=${encodeURIComponent(email)}`);
          return;
        }

        if (onboardingStatus !== "COMPLETED") {
          router.push("/onboarding");
          return;
        }

        router.push("/app");
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen grid lg:grid-cols-2 bg-background overflow-hidden">
      <div className="hidden lg:flex flex-col justify-between p-12 text-primary-foreground relative overflow-hidden" style={{ background: "var(--gradient-deep)" }}>
        <Link href="/" className="font-display text-xl font-semibold">Real customer App</Link>
        <div>
          <div className="label-eyebrow text-primary-foreground/70">Welcome back</div>
          <h2 className="font-display text-5xl font-semibold mt-4 leading-[1.05]">
            Continue<br />orchestrating<br />conversations.
          </h2>
        </div>
        <div aria-hidden className="absolute -right-24 -bottom-24 h-96 w-96 rounded-full border border-primary-foreground/10" />
      </div>

      {/* Right — form */}
      <div className="flex flex-col px-8 sm:px-16 py-6 overflow-y-auto">
        <div className="max-w-md w-full mx-auto my-auto py-8">
          <div className="lg:hidden mb-6">
            <Link href="/" className="font-display text-xl font-semibold">Real customer App</Link>
          </div>
          <div className="label-eyebrow">Sign in</div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold mt-2 text-foreground">Welcome back</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">New here? <Link href="/signup" className="text-primary font-semibold hover:underline">Create an organization</Link></p>

          <form onSubmit={onSubmit} className="mt-6 sm:mt-8 space-y-4">
            <Field 
              icon={Mail} 
              label="Email" 
              placeholder="jane@acme.com" 
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Field 
              icon={Lock} 
              label="Password" 
              placeholder="••••••••" 
              type="password" 
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground"><input type="checkbox" className="rounded border-border" /> Remember me</label>
              <Link href="/forgot-password" data-ignore className="text-primary font-semibold hover:underline cursor-pointer">Forgot password?</Link>
            </div>
            
            {/* Removed inline error display in favor of toast */}

            <button 
              disabled={loading}
              type="submit" 
              className="w-full bg-primary text-primary-foreground rounded-xl py-3.5 font-semibold flex items-center justify-center gap-2 shadow-deep hover:bg-primary-glow transition disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"} <ArrowRight className="h-4 w-4" />
            </button>
          </form>
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