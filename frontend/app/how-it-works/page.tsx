"use client";

import Link from "next/link";
import { ArrowRight, MessageSquare, Users, Send, BarChart3, CheckCircle2 } from "lucide-react";

const steps = [
  {
    num: "01",
    title: "Connect Your Channels",
    description: "Link WhatsApp Business, Instagram, and Facebook accounts in minutes. Our unified setup wizard guides you through each platform connection with verified API integration.",
    icon: MessageSquare,
    details: ["WhatsApp Business API", "Instagram Direct", "Facebook Messenger", "Unified inbox"],
  },
  {
    num: "02",
    title: "Import Your Contacts",
    description: "Upload CSVs, sync from your CRM, or build segments by tag, region, or engagement history. Your contacts are automatically enriched and deduplicated.",
    icon: Users,
    details: ["CSV/Excel import", "CRM sync", "Smart deduplication", "Auto-enrichment"],
  },
  {
    num: "03",
    title: "Compose & Automate",
    description: "Send broadcasts with one click or design recurring journeys with our visual automation builder. Schedule messages, set triggers, and track performance in real-time.",
    icon: Send,
    details: ["Visual workflow builder", "Recurring schedules", "Trigger-based sends", "A/B testing"],
  },
  {
    num: "04",
    title: "Track & Optimize",
    description: "Monitor delivery rates, engagement metrics, and conversion data across all channels. Use actionable insights to refine your messaging strategy.",
    icon: BarChart3,
    details: ["Real-time analytics", "Delivery tracking", "Engagement metrics", "Performance reports"],
  },
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
        <Link href="/" className="font-display text-xl font-semibold">Real customer App</Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/how-it-works" className="text-primary border-b-2 border-primary pb-1">How it works</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold">Login</Link>
          <Link href="/signup" className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold shadow-deep hover:bg-primary-glow transition">Get Started</Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-secondary rounded-full px-4 py-2 text-xs font-semibold text-primary mb-6">
          <CheckCircle2 className="h-4 w-4" />
          Simple 4-Step Process
        </div>
        <h1 className="font-display text-5xl sm:text-6xl font-semibold mt-4 leading-tight">
          How It Works
        </h1>
        <p className="text-muted-foreground mt-6 max-w-2xl mx-auto text-lg leading-relaxed">
          Get started in minutes. Our streamlined process gets you from signup to sending messages across all your channels in four simple steps.
        </p>
      </section>

      {/* Steps Section */}
      <section className="max-w-7xl mx-auto px-8 py-16">
        <div className="space-y-12">
          {steps.map((step, index) => (
            <div
              key={step.num}
              className={`relative rounded-3xl p-8 md:p-12 ${
                index % 2 === 0
                  ? "bg-card shadow-card"
                  : "bg-gradient-deep text-primary-foreground shadow-deep"
              }`}
            >
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className={index % 2 === 1 ? "md:order-2" : ""}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`h-16 w-16 rounded-2xl flex items-center justify-center ${
                      index % 2 === 0
                        ? "bg-primary/10 text-primary"
                        : "bg-white/20 text-white"
                    }`}>
                      <step.icon className="h-8 w-8" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest opacity-60">Step {step.num}</div>
                      <h3 className="font-display text-2xl sm:text-3xl font-semibold">{step.title}</h3>
                    </div>
                  </div>
                  <p className={`text-base leading-relaxed ${
                    index % 2 === 0 ? "text-muted-foreground" : "text-primary-foreground/80"
                  }`}>
                    {step.description}
                  </p>
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {step.details.map((detail) => (
                      <div key={detail} className="flex items-center gap-2">
                        <CheckCircle2 className={`h-4 w-4 flex-shrink-0 ${
                          index % 2 === 0 ? "text-success" : "text-white"
                        }`} />
                        <span className={`text-sm ${
                          index % 2 === 0 ? "text-foreground" : "text-primary-foreground"
                        }`}>
                          {detail}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={index % 2 === 1 ? "md:order-1" : ""}>
                  <div className={`rounded-2xl p-6 ${
                    index % 2 === 0
                      ? "bg-secondary/50"
                      : "bg-white/10 backdrop-blur-sm"
                  }`}>
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((item) => (
                        <div key={item} className="flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                            index % 2 === 0
                              ? "bg-primary/10 text-primary"
                              : "bg-white/20 text-white"
                          }`}>
                            <span className="font-display font-semibold">{item}</span>
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className={`h-2 rounded ${
                              index % 2 === 0 ? "bg-primary/20" : "bg-white/20"
                            }`} style={{ width: `${60 + item * 10}%` }} />
                            <div className={`h-2 rounded ${
                              index % 2 === 0 ? "bg-secondary" : "bg-white/10"
                            }`} style={{ width: `${40 + item * 8}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-8 pb-20">
        <div className="bg-gradient-deep text-primary-foreground rounded-3xl p-12 md:p-20 text-center shadow-deep">
          <h2 className="font-display text-4xl sm:text-5xl font-semibold leading-tight">
            Ready to get started?
          </h2>
          <p className="text-primary-foreground/75 mt-6 max-w-xl mx-auto text-lg">
            Join thousands of businesses already using Real customer App to automate their messaging workflows.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
            <Link
              href="/signup"
              className="bg-card text-foreground px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-card/90 transition"
            >
              Start Free Trial <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="bg-primary-glow/40 border border-primary-foreground/20 px-8 py-4 rounded-xl font-semibold hover:bg-primary-glow/60 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-8 py-10 border-t border-border">
        <div className="flex flex-wrap justify-between gap-4 text-sm text-muted-foreground">
          <div>
            <div className="font-display text-foreground font-semibold">Real customer App</div>
            <div className="text-xs mt-1">© 2024 Real customer App. All rights reserved.</div>
          </div>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-primary transition">Privacy Policy</Link>
            <Link href="/" className="hover:text-primary transition">Terms of Service</Link>
            <Link href="/" className="hover:text-primary transition">Security</Link>
            <Link href="/" className="hover:text-primary transition">Status</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
