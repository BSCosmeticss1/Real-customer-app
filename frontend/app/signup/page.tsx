"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { FormEvent, useState } from "react";

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.email.split('@')[0], // Default name from email prefix
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Store token for later (though we'll need it after verification)
        localStorage.setItem("token", data.data.token);
        router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
      } else {
        setError(data.message || "Signup failed");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen grid lg:grid-cols-2 bg-background overflow-hidden">
      {/* Left — brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 text-primary-foreground relative overflow-hidden shrink-0" style={{ background: "var(--gradient-deep)" }}>
        <Link href="/" className="font-display text-xl font-semibold">Real customer App</Link>
        <div>
          <div className="label-eyebrow text-primary-foreground/70">Multi-Tenant Engine</div>
          <h2 className="font-display text-5xl font-semibold mt-4 leading-[1.05]">
            Spin up your<br />organization in<br />under 60 seconds.
          </h2>
          <p className="text-primary-foreground/75 mt-6 max-w-sm leading-relaxed">
            Each workspace is fully isolated with its own contacts, automations, and team members.
          </p>
        </div>
        <div aria-hidden className="absolute -right-24 -bottom-24 h-96 w-96 rounded-full border border-primary-foreground/10" />
        <div aria-hidden className="absolute right-12 bottom-12 h-56 w-56 rounded-full border border-primary-foreground/10" />
      </div>

      {/* Right — form */}
      <div className="flex flex-col px-8 sm:px-16 py-6 overflow-y-auto">
        <div className="max-w-md w-full mx-auto my-auto py-8">
          <div className="lg:hidden mb-6">
            <Link href="/" className="font-display text-xl font-semibold">Real customer App</Link>
          </div>
          <div className="label-eyebrow">Create account</div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold mt-2 text-foreground">Start your organization</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">Already have one? <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link></p>

          <form onSubmit={onSubmit} className="mt-6 sm:mt-8 space-y-4">
            <Field 
              icon={Mail} 
              label="Work email" 
              placeholder="jane@acme.com" 
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <PasswordField 
              icon={Lock} 
              label="Password" 
              placeholder="••••••••" 
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <PasswordField 
              icon={Lock} 
              label="Confirm Password" 
              placeholder="••••••••" 
              showPassword={showConfirmPassword}
              setShowPassword={setShowConfirmPassword}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />

            {error && <p className="text-destructive text-sm">{error}</p>}

            <button 
              disabled={loading}
              type="submit" 
              className="w-full bg-primary text-primary-foreground rounded-xl py-3.5 font-semibold flex items-center justify-center gap-2 shadow-deep hover:bg-primary-glow transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create organization"} <ArrowRight className="h-4 w-4" />
            </button>
            <p className="text-xs text-muted-foreground text-center">By signing up you agree to our Terms & Privacy Policy.</p>
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

function PasswordField({ icon: Icon, label, showPassword, setShowPassword, ...props }: { icon: any; label: string; showPassword: boolean; setShowPassword: (show: boolean) => void } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="relative mt-2">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input 
          {...props} 
          type={showPassword ? "text" : "password"} 
          className="w-full bg-card border border-border rounded-xl pl-11 pr-12 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" 
        />
        <button 
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </label>
  );
}