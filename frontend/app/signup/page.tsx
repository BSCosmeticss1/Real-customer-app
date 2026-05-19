"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, Mail, Lock, User } from "lucide-react";
import { FormEvent } from "react";

export default function Signup() {
  const router = useRouter();
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    router.push("/app");
  };

  return (
    <div className="h-screen grid lg:grid-cols-2 bg-background overflow-hidden">
      {/* Left — brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 text-primary-foreground relative overflow-hidden" style={{ background: "var(--gradient-deep)" }}>
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
      <div className="flex flex-col justify-center px-8 sm:px-16 py-12">
        <div className="max-w-md w-full mx-auto">
          <div className="lg:hidden mb-8">
            <Link href="/" className="font-display text-xl font-semibold">Real customer App</Link>
          </div>
          <div className="label-eyebrow">Create account</div>
          <h1 className="font-display text-4xl font-semibold mt-3 text-foreground">Start your organization</h1>
          <p className="text-muted-foreground mt-3">Already have one? <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link></p>

          <form onSubmit={onSubmit} className="mt-10 space-y-5">
            <Field icon={User} label="Your name" placeholder="Jane Doe" />
            <Field icon={Building2} label="Organization name" placeholder="Acme Corp" />
            <Field icon={Mail} label="Work email" placeholder="jane@acme.com" type="email" />
            <Field icon={Lock} label="Password" placeholder="••••••••" type="password" />

            <button type="submit" className="w-full bg-primary text-primary-foreground rounded-xl py-3.5 font-semibold flex items-center justify-center gap-2 shadow-deep hover:bg-primary-glow transition">
              Create organization <ArrowRight className="h-4 w-4" />
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