"use client";

import Link from "next/link";
import { ArrowRight, MessageSquare, Users, Send, BarChart3, CheckCircle2, Shield, Zap, Globe, Headphones } from "lucide-react";

const steps = [
  {
    num: "01",
    title: "Connect Your Channels",
    description: "Link WhatsApp Business, Instagram, and Facebook accounts in minutes. Our unified setup wizard guides you through each platform connection with verified API integration.",
    icon: MessageSquare,
    details: ["WhatsApp Business API", "Instagram Direct", "Facebook Messenger", "Unified inbox"],
    img: "https://images.unsplash.com/photo-1611746872915-64382b5c763a?w=800&h=500&fit=crop&auto=format",
  },
  {
    num: "02",
    title: "Import Your Contacts",
    description: "Upload CSVs, sync from your CRM, or build segments by tag, region, or engagement history. Your contacts are automatically enriched and deduplicated with enterprise-grade data hygiene.",
    icon: Users,
    details: ["CSV/Excel import", "CRM sync", "Smart deduplication", "Auto-enrichment"],
    img: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop&auto=format",
  },
  {
    num: "03",
    title: "Compose & Automate",
    description: "Send broadcasts with one click or design recurring journeys with our visual automation builder. Schedule messages, set triggers, and track performance in real-time across all connected channels.",
    icon: Send,
    details: ["Visual workflow builder", "Recurring schedules", "Trigger-based sends", "A/B testing"],
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop&auto=format",
  },
  {
    num: "04",
    title: "Track & Optimize",
    description: "Monitor delivery rates, engagement metrics, and conversion data across all channels. Use actionable insights to refine your messaging strategy and maximize ROI with detailed reporting.",
    icon: BarChart3,
    details: ["Real-time analytics", "Delivery tracking", "Engagement metrics", "Performance reports"],
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop&auto=format",
  },
];

const enterpriseFeatures = [
  { icon: Shield, title: "Enterprise Security", desc: "SOC 2 Type II compliant with end-to-end encryption, SSO, and role-based access controls." },
  { icon: Zap, title: "Dedicated Infrastructure", desc: "Private deployment options with 99.99% uptime SLA and dedicated support channels." },
  { icon: Globe, title: "Global Scale", desc: "Multi-region support with local data residency compliance for GDPR, HIPAA, and more." },
  { icon: Headphones, title: "White-Glove Support", desc: "24/7 priority support with a named customer success manager and onboarding team." },
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
        <Link href="/" className="font-display text-xl font-semibold">My Real Customer App</Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/how-it-works" className="text-primary border-b-2 border-primary pb-1">How it works</Link>
          <Link href="/enterprise" className="hover:text-primary transition">Enterprise</Link>
          <Link href="/contact" className="hover:text-primary transition">Contact</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold">Login</Link>
          <Link href="/signup" className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold shadow-deep hover:bg-primary-glow transition">Get Started</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1521737711867-e3b97375f052?w=1600&h=800&fit=crop&auto=format"
            alt="How it works"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70" />
        </div>
        <div className="relative max-w-7xl mx-auto px-8 py-24 md:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-xs font-semibold text-white mb-6">
              <CheckCircle2 className="h-4 w-4" />
              Simple 4-Step Process
            </div>
            <h1 className="font-display text-5xl sm:text-6xl font-semibold text-white leading-tight">
              How It Works
            </h1>
            <p className="text-white/80 mt-6 text-lg leading-relaxed">
              Get started in minutes. Our streamlined process gets you from signup to sending messages across all your channels in four simple steps.
            </p>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="max-w-7xl mx-auto px-8 py-16">
        <div className="space-y-12">
          {steps.map((step, index) => (
            <div
              key={step.num}
              className={`relative rounded-3xl overflow-hidden ${
                index % 2 === 0
                  ? "bg-card shadow-card"
                  : "bg-gradient-deep text-primary-foreground shadow-deep"
              }`}
            >
              <div className="grid lg:grid-cols-2 gap-0">
                <div className={`p-8 md:p-12 ${index % 2 === 1 ? "lg:order-2" : ""}`}>
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
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  <div className="mt-8">
                    <Link href="/signup" className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition ${
                      index % 2 === 0
                        ? "bg-primary text-primary-foreground hover:bg-primary-glow"
                        : "bg-white text-primary hover:bg-white/90"
                    }`}>
                      Get Started <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
                <div className={`${index % 2 === 1 ? "lg:order-1" : ""} relative min-h-[300px] lg:min-h-[400px]`}>
                  <img
                    src={step.img}
                    alt={step.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 ${index % 2 === 0 ? "bg-gradient-to-r from-card/40 to-card/10" : "bg-gradient-to-r from-primary/40 to-primary/10"}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Enterprise Features Section */}
      <section className="max-w-7xl mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <div className="label-eyebrow">Built for Scale</div>
          <h2 className="font-display text-4xl font-semibold mt-3">Enterprise-Grade Infrastructure</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Everything you need to deploy at scale with confidence, security, and dedicated support.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {enterpriseFeatures.map((feature) => (
            <div key={feature.title} className="bg-card rounded-2xl p-6 shadow-card">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{feature.desc}</p>
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
            Join thousands of businesses already using My Real Customer App to automate their messaging workflows.
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
            <div className="font-display text-foreground font-semibold">My Real Customer App</div>
            <div className="text-xs mt-1">© {new Date().getFullYear()} My Real Customer App. All rights reserved.</div>
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
