"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Shield, Zap, Crown, Check, MessageSquare, Mail, Workflow, Users, Package, Calendar, TrendingUp, Globe } from "lucide-react";

const ALL_FEATURES = [
  { id: "messaging", name: "Messaging", description: "WhatsApp, Instagram, Facebook", icon: MessageSquare },
  { id: "sms", name: "SMS", description: "Bulk SMS messaging", icon: MessageSquare },
  { id: "email", name: "Email", description: "Email campaigns", icon: Mail },
  { id: "automation", name: "Automation", description: "Scheduled messages & workflows", icon: Workflow },
  { id: "contacts", name: "Contacts", description: "Contact management", icon: Users },
  { id: "inventory", name: "Inventory", description: "Product & stock management", icon: Package },
  { id: "book-keeping", name: "Book Keeping", description: "Bookings & appointments", icon: Calendar },
  { id: "sales-reporting", name: "Sales Reporting", description: "Sales tracking & reports", icon: TrendingUp },
  { id: "analytics", name: "Analytics", description: "Insights & charts", icon: TrendingUp },
];

const PLAN_MODULES = {
  standard: ["messaging", "contacts", "book-keeping", "sales-reporting", "email"],
  premium: ALL_FEATURES.map(f => f.id),
  enterprise: ALL_FEATURES.map(f => f.id),
};

const PLANS = [
  {
    id: "standard",
    name: "Standard",
    description: "Essential tools for small teams getting started",
    icon: Shield,
    monthlyPrice: 25000,
    yearlyPrice: 240000,
    features: PLAN_MODULES.standard,
    limits: { users: 3, contacts: 1000, messages: 5000 }
  },
  {
    id: "premium",
    name: "Premium",
    description: "Complete access for growing businesses",
    icon: Zap,
    monthlyPrice: 50000,
    yearlyPrice: 480000,
    features: PLAN_MODULES.premium,
    limits: { users: 10, contacts: 10000, messages: 50000 }
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Advanced features and dedicated support",
    icon: Crown,
    monthlyPrice: 100000,
    yearlyPrice: 960000,
    features: PLAN_MODULES.enterprise,
    limits: { users: 999, contacts: 99999, messages: 999999 }
  },
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);
};

export default function Enterprise() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
        <Link href="/" className="font-display text-xl font-semibold">My Real Customer App</Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/how-it-works" className="hover:text-primary transition">How it works</Link>
          <Link href="/enterprise" className="text-primary border-b-2 border-primary pb-1">Enterprise</Link>
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
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&h=800&fit=crop&auto=format"
            alt="Enterprise office"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70" />
        </div>
        <div className="relative max-w-7xl mx-auto px-8 py-24 md:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-xs font-semibold text-white mb-6">
              <Shield className="h-4 w-4" />
              Enterprise Grade
            </div>
            <h1 className="font-display text-5xl sm:text-6xl font-semibold text-white leading-tight">
              Built for Enterprise Scale
            </h1>
            <p className="text-white/80 mt-6 text-lg leading-relaxed">
              Deploy My Real Customer App at scale with dedicated infrastructure, white-glove support, and enterprise-grade security. Trusted by 500+ enterprises worldwide.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link href="#plans" className="bg-white text-primary px-6 py-3.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-white/90 transition">
                View Plans <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/contact" className="bg-white/20 border border-white/30 text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-white/30 transition">
                Talk to Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="font-display text-4xl md:text-5xl font-semibold text-primary">500+</div>
            <div className="text-muted-foreground text-sm mt-2">Enterprise Clients</div>
          </div>
          <div className="text-center">
            <div className="font-display text-4xl md:text-5xl font-semibold text-primary">99.99%</div>
            <div className="text-muted-foreground text-sm mt-2">Uptime SLA</div>
          </div>
          <div className="text-center">
            <div className="font-display text-4xl md:text-5xl font-semibold text-primary">150+</div>
            <div className="text-muted-foreground text-sm mt-2">Countries Served</div>
          </div>
          <div className="text-center">
            <div className="font-display text-4xl md:text-5xl font-semibold text-primary">2B+</div>
            <div className="text-muted-foreground text-sm mt-2">Messages Monthly</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <div className="label-eyebrow">Capabilities</div>
          <h2 className="font-display text-4xl font-semibold mt-3">Everything You Need to Scale</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Comprehensive enterprise features designed for security, scalability, and seamless operations.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Shield, title: "Enterprise Security & Compliance", description: "SOC 2 Type II certified with end-to-end encryption, SSO/SAML integration, and role-based access controls. Full audit logs and data residency options for GDPR, HIPAA, and CCPA compliance." },
            { icon: Zap, title: "Dedicated Infrastructure", description: "Private or dedicated cloud deployment with auto-scaling, 99.99% uptime SLA, and zero noisy-neighbor interference. Deploy in your preferred region with full infrastructure isolation." },
            { icon: Globe, title: "Global Scale & Local Compliance", description: "Multi-region support across 15+ data centers worldwide. Local data residency compliance ensures your data stays within the borders you require." },
            { icon: Crown, title: "White-Glove Support", description: "24/7 priority support with a named customer success manager, dedicated Slack channel, and a team of solutions architects to ensure your success at every step." },
            { icon: TrendingUp, title: "Advanced Analytics & Reporting", description: "Custom dashboards, predictive analytics, and executive-level reporting. Export to your BI tools with real-time data pipelines and historical trend analysis." },
            { icon: Workflow, title: "Custom Integrations & APIs", description: "Full REST and GraphQL API access with webhooks, custom middleware support, and dedicated engineering support for complex integration requirements." },
          ].map((feature) => (
            <div key={feature.title} className="bg-card rounded-2xl p-7 shadow-card hover:shadow-deep transition group">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:scale-110 transition">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground text-sm mt-3 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="max-w-7xl mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <div className="label-eyebrow">Pricing</div>
          <h2 className="font-display text-4xl font-semibold mt-3">Choose Your Plan</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Flexible plans designed to grow with your business. All prices in NGN.</p>
          <div className="flex justify-center mt-6">
            <div className="bg-muted rounded-full p-1 flex gap-1">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === "yearly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Yearly <span className="text-xs opacity-75 ml-1">Save 20%</span>
              </button>
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const price = billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
            return (
              <div key={plan.id} className={`relative rounded-3xl p-8 ${plan.id === "premium" ? "bg-gradient-deep text-primary-foreground shadow-deep" : "bg-card shadow-card"}`}>
                {plan.id === "premium" && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-glow text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${plan.id === "premium" ? "bg-white/20 text-white" : "bg-primary/10 text-primary"}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-semibold">{plan.name}</h3>
                    <p className={`text-xs ${plan.id === "premium" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{plan.description}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="font-display text-4xl font-semibold">{formatPrice(price)}</div>
                  <div className={`text-sm ${plan.id === "premium" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>/{billingCycle === "monthly" ? "month" : "year"}</div>
                </div>
                <div className="mb-6">
                  <div className={`text-xs font-semibold uppercase tracking-wider mb-3 ${plan.id === "premium" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>Features</div>
                  <div className="space-y-2">
                    {ALL_FEATURES.map((feature) => {
                      const isIncluded = plan.features.includes(feature.id);
                      if (!isIncluded) return null;
                      return (
                        <div key={feature.id} className="flex items-center gap-2 text-sm">
                          <Check className={`h-4 w-4 flex-shrink-0 ${plan.id === "premium" ? "text-white" : "text-success"}`} />
                          <span className={plan.id === "premium" ? "text-primary-foreground" : "text-foreground"}>{feature.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <Link
                  href="/signup"
                  className={`block w-full text-center px-6 py-3.5 rounded-xl font-semibold transition ${
                    plan.id === "premium"
                      ? "bg-white text-primary hover:bg-white/90"
                      : "bg-primary text-primary-foreground hover:bg-primary-glow"
                  }`}
                >
                  Get Started
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-8 pb-20">
        <div className="bg-gradient-deep text-primary-foreground rounded-3xl p-12 md:p-20 text-center shadow-deep">
          <h2 className="font-display text-4xl sm:text-5xl font-semibold leading-tight">
            Ready to scale your messaging?
          </h2>
          <p className="text-primary-foreground/75 mt-6 max-w-xl mx-auto text-lg">
            Join 500+ enterprises already using My Real Customer App. Let&apos;s discuss how we can help you achieve your communication goals.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
            <Link
              href="#plans"
              className="bg-card text-foreground px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-card/90 transition"
            >
              View Plans <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="bg-primary-glow/40 border border-primary-foreground/20 px-8 py-4 rounded-xl font-semibold hover:bg-primary-glow/60 transition"
            >
              Talk to Sales
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
