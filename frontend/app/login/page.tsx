"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail, Lock } from "lucide-react";
import { FormEvent } from "react";

export default function Login() {
  const router = useRouter();
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    router.push("/app");
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

      <div className="flex flex-col justify-center px-8 sm:px-16 py-12">
        <div className="max-w-md w-full mx-auto">
          <div className="lg:hidden mb-8">
            <Link href="/" className="font-display text-xl font-semibold">Real customer App</Link>
          </div>
          <div className="label-eyebrow">Sign in</div>
          <h1 className="font-display text-4xl font-semibold mt-3 text-foreground">Welcome back</h1>
          <p className="text-muted-foreground mt-3">New here? <Link href="/signup" className="text-primary font-semibold hover:underline">Create an organization</Link></p>

          <form onSubmit={onSubmit} className="mt-10 space-y-5">
            <Field icon={Mail} label="Email" placeholder="jane@acme.com" type="email" />
            <Field icon={Lock} label="Password" placeholder="••••••••" type="password" />
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground"><input type="checkbox" className="rounded border-border" /> Remember me</label>
              <a className="text-primary font-semibold hover:underline cursor-pointer">Forgot password?</a>
            </div>
            <button type="submit" className="w-full bg-primary text-primary-foreground rounded-xl py-3.5 font-semibold flex items-center justify-center gap-2 shadow-deep hover:bg-primary-glow transition">
              Sign in <ArrowRight className="h-4 w-4" />
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