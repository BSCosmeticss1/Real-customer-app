"use client";

import Link from "next/link";
import { MessageCircle, Camera, GitBranch, ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
        <Link href="/" className="font-display text-xl font-semibold">Real customer App</Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a className="text-primary border-b-2 border-primary pb-1">Solutions</a>
          <a className="text-muted-foreground">How it works</a>
          <a className="text-muted-foreground">Enterprise</a>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold">Login</Link>
          <Link href="/signup" className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold shadow-deep hover:bg-primary-glow transition">Get Started</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-8 pt-12 pb-20 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="label-eyebrow">The Real customer App Framework</div>
          <h1 className="font-display text-7xl font-semibold mt-4 leading-[0.95]">
            Precision <br />Messaging <br />
            <span className="text-muted-foreground">Engineered for</span> <br />Scale.
          </h1>
          <p className="text-muted-foreground mt-6 max-w-md leading-relaxed">
            Beyond basic chat. Orchestrate complex customer journeys with structural integrity and tonal depth across every major platform.
          </p>
          <div className="flex gap-3 mt-8">
            <Link href="/app" className="bg-primary text-primary-foreground px-6 py-3.5 rounded-xl font-semibold flex items-center gap-2 shadow-deep">Start Building Now <ArrowRight className="h-4 w-4" /></Link>
            <button className="bg-card px-6 py-3.5 rounded-xl font-semibold border border-border">Request Demo</button>
          </div>
        </div>
        <div className="relative">
          <div className="bg-card rounded-3xl shadow-deep p-6 mx-auto max-w-sm">
            <div className="space-y-3">
              {[80,60,75,50].map((w,i) => (
                <div key={i} className="space-y-1.5">
                  <div className="h-2 rounded bg-secondary" style={{width: `${w}%`}} />
                  <div className="h-2 rounded bg-secondary" style={{width: `${w-15}%`}} />
                </div>
              ))}
              <div className="border-t border-border my-4" />
              <div className="grid grid-cols-3 gap-2">
                {[1,2,3].map(i => <div key={i} className="h-12 rounded-lg bg-secondary" />)}
              </div>
              <div className="space-y-1.5 pt-2">
                {[70,55,65].map((w,i) => <div key={i} className="h-2 rounded bg-secondary" style={{width: `${w}%`}} />)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Channels */}
      <section className="max-w-7xl mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl font-semibold">One Command Center, Every Channel.</h2>
          <p className="text-muted-foreground mt-3">Centralize your architectural communications without losing platform-specific nuances.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-card rounded-2xl p-7 shadow-card md:col-span-1">
            <MessageCircle className="h-7 w-7 text-success" />
            <h3 className="font-display text-2xl font-semibold mt-4">WhatsApp Business</h3>
            <p className="text-muted-foreground text-sm mt-2">Deploy automated workflows on the world's most popular messaging app with enterprise-grade security and full API support.</p>
            <div className="mt-5 flex items-center gap-3">
              <div className="flex -space-x-2">
                {["bg-primary","bg-accent","bg-success"].map((c,i) => <div key={i} className={`h-7 w-7 rounded-full border-2 border-card ${c}`} />)}
              </div>
              <span className="text-xs font-semibold text-muted-foreground">75k+ Active Automations</span>
            </div>
          </div>
          <div className="bg-gradient-deep text-primary-foreground rounded-2xl p-7 shadow-deep">
            <Camera className="h-7 w-7" />
            <h3 className="font-display text-2xl font-semibold mt-4">Instagram Direct</h3>
            <p className="text-primary-foreground/75 text-sm mt-2">Convert visual engagement into meaningful architectural data via automated DM triggers.</p>
            <button className="mt-5 text-xs font-bold tracking-wider flex items-center gap-2">EXPLORE INTEGRATIONS <ArrowRight className="h-3 w-3" /></button>
          </div>
          <div className="bg-card rounded-2xl p-7 shadow-card md:col-span-2">
            <div className="flex items-start gap-4 mb-6">
              <GitBranch className="h-7 w-7 text-primary" />
              <div>
                <h3 className="font-display text-2xl font-semibold">Cross-Platform Analytics</h3>
                <p className="text-muted-foreground text-sm mt-1">Real-time sentiment and volume tracking.</p>
              </div>
              <span className="ml-auto text-[11px] font-bold bg-success-soft text-success px-3 py-1 rounded-full">LIVE</span>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {[
                { l: "Daily Messages", v: "852k" },
                { l: "Sentiment", v: "94%" },
                { l: "Avg. Latency", v: "0.4s" },
              ].map(m => (
                <div key={m.l}>
                  <div className="font-display text-4xl font-semibold">{m.v}</div>
                  <div className="label-eyebrow mt-1">{m.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Three phases */}
      <section className="max-w-7xl mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl font-semibold">Constructed in Three Phases</h2>
          <p className="text-muted-foreground mt-3">Our methodology treats every messaging automation as a structural project.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { n: "01", t: "Blueprints", d: "Define your communication flows using our visual drag-and-drop architect. Map nodes to specific intent outcomes." },
            { n: "02", t: "Foundation", d: "Integrate your existing CRM and data layers. Our system forms the structural bridge between your stack and the user." },
            { n: "03", t: "Deployment", d: "Launch across all selected channels. Monitor performance with architectural precision and real-time adjustments." },
          ].map(p => (
            <div key={p.n}>
              <div className="h-12 w-12 rounded-xl bg-secondary text-primary grid place-items-center font-display text-xl font-semibold mb-5">{p.n.slice(1)}</div>
              <h3 className="font-display text-xl font-semibold">{p.n}. {p.t}</h3>
              <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <div className="label-eyebrow">The Workflow</div>
          <h2 className="font-display text-4xl font-semibold mt-3">How It Works</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">From contact import to multi-platform delivery — three steps to orchestrate every conversation.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { step: "01", title: "Connect Your Channels", body: "Link WhatsApp Business, Instagram, and Facebook accounts in minutes. Unified inbox, single dashboard." },
            { step: "02", title: "Import Your Contacts", body: "Upload CSVs, sync from your CRM, or build segments by tag, region, or engagement history.", highlight: true },
            { step: "03", title: "Compose & Automate", body: "Send broadcasts with one click or design recurring journeys with our visual automation builder." },
          ].map(p => (
            <div key={p.step} className={`rounded-3xl p-8 ${p.highlight ? "bg-gradient-deep text-primary-foreground shadow-deep" : "bg-card shadow-card"}`}>
              <div className="font-display text-6xl font-semibold opacity-30">{p.step}</div>
              <h3 className="font-display text-2xl font-semibold mt-4">{p.title}</h3>
              <p className={`mt-3 text-sm leading-relaxed ${p.highlight ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-8 pb-16">
        <div className="bg-gradient-deep text-primary-foreground rounded-3xl p-16 text-center shadow-deep">
          <h2 className="font-display text-5xl font-semibold leading-tight">Ready to blueprint your <br />communication?</h2>
          <p className="text-primary-foreground/75 mt-4">Join over 500 enterprises building the future of automated messaging on the Real customer App platform.</p>
          <div className="flex justify-center gap-3 mt-8">
            <Link href="/app" className="bg-card text-foreground px-6 py-3.5 rounded-xl font-semibold">Build Your First Bot</Link>
            <button className="bg-primary-glow/40 border border-primary-foreground/20 px-6 py-3.5 rounded-xl font-semibold">View API Documentation</button>
          </div>
        </div>
      </section>

      <footer className="max-w-7xl mx-auto px-8 py-10 border-t border-border flex flex-wrap justify-between gap-4 text-sm text-muted-foreground">
        <div>
          <div className="font-display text-foreground font-semibold">Real customer App</div>
          <div className="text-xs mt-1">© 2024 Real customer App. All rights reserved.</div>
        </div>
        <div className="flex gap-6">
          <a>Privacy Policy</a><a>Terms of Service</a><a>Security</a><a>Status</a>
        </div>
      </footer>
    </div>
  );
}