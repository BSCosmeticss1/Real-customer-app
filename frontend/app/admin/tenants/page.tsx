"use client";

import { Building2, Rocket, Lightbulb, MoreVertical, ChevronsUpDown, TrendingUp, Users, Activity, Plus } from "lucide-react";

const stats = [
  { label: "Network Health", value: "99.98%", foot: <><TrendingUp className="h-3.5 w-3.5" /> +0.02% from last month</>, icon: Activity },
  { label: "Total Active Seats", value: "1,284", foot: "Allocated across 14 tenants", icon: Users },
  { label: "Monthly Volume", value: "4.2M", foot: "Messages processed via API", icon: TrendingUp },
];

const orgs = [
  { name: "Global Corp", id: "GC-8829-X", icon: Building2, plan: "Enterprise", planTone: "bg-primary text-primary-foreground", seats: "512 Seats", volume: "1.2M / mo", volumePct: 92, status: "Active", statusTone: "bg-success" },
  { name: "Atlas Media", id: "AM-2210-B", icon: Rocket, plan: "Professional", planTone: "bg-accent/60 text-primary", seats: "128 Seats", volume: "450K / mo", volumePct: 55, status: "Active", statusTone: "bg-success" },
  { name: "Venture Labs", id: "VL-4491-L", icon: Lightbulb, plan: "Basic", planTone: "bg-secondary text-primary", seats: "12 Seats", volume: "12K / mo", volumePct: 14, status: "Suspended", statusTone: "bg-destructive" },
];

export default function Tenants() {
  return (
    <div className="space-y-8">
      {/* Title row */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="font-display text-5xl font-semibold text-foreground">Organization Management</h1>
          <p className="text-muted-foreground mt-3 max-w-xl">Review and manage multi-tenant network performance and seat allocation.</p>
        </div>
        <button className="flex items-center gap-3 bg-card border border-border rounded-full px-5 py-3 shadow-card hover:bg-secondary transition">
          <span className="h-2 w-2 rounded-full bg-success" />
          <span className="text-sm font-medium text-foreground">Switch Organization</span>
          <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-6 shadow-card relative overflow-hidden">
            <div className="label-eyebrow">{s.label}</div>
            <div className="font-display text-5xl font-semibold text-primary mt-3">{s.value}</div>
            <div className="text-sm text-muted-foreground mt-3 flex items-center gap-1.5">{s.foot}</div>
            <s.icon className="absolute right-5 top-1/2 -translate-y-1/2 h-20 w-20 text-muted/40" strokeWidth={1} />
          </div>
        ))}
      </div>

      {/* Org table header */}
      <div className="grid grid-cols-[2fr_1fr_1fr_1.2fr_1fr_40px] gap-4 px-6 label-eyebrow">
        <div>Organization</div>
        <div>Subscription</div>
        <div>Members</div>
        <div>Avg Volume</div>
        <div>Status</div>
        <div />
      </div>

      {/* Org rows */}
      <div className="space-y-4">
        {orgs.map((o) => (
          <div key={o.id} className="grid grid-cols-[2fr_1fr_1fr_1.2fr_1fr_40px] gap-4 items-center bg-card border border-border rounded-2xl px-6 py-5 shadow-card">
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-secondary grid place-items-center text-primary">
                <o.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-foreground">{o.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">ID: {o.id}</div>
              </div>
            </div>
            <div>
              <span className={`inline-flex text-[11px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-md ${o.planTone}`}>
                {o.plan}
              </span>
            </div>
            <div className="text-sm font-medium text-foreground">{o.seats}</div>
            <div>
              <div className="text-sm font-medium text-foreground">{o.volume}</div>
              <div className="mt-2 h-1 w-24 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${o.volumePct}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <span className={`h-2 w-2 rounded-full ${o.statusTone}`} />
              {o.status}
            </div>
            <button className="h-8 w-8 grid place-items-center rounded-full hover:bg-secondary text-muted-foreground">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Footer bands */}
      <div className="grid grid-cols-[2fr_1fr] gap-6 pt-4">
        <div className="relative overflow-hidden rounded-2xl p-10 text-primary-foreground" style={{ background: "var(--gradient-deep)" }}>
          <h2 className="font-display text-3xl font-semibold">Scale Your Messaging Architecture</h2>
          <p className="mt-4 max-w-md text-primary-foreground/75">Our multi-tenant management system allows you to provision sub-organizations in under 60 seconds with isolated data nodes.</p>
          <div className="mt-8 flex gap-3">
            <button className="bg-card text-primary rounded-xl px-5 py-3 text-sm font-semibold flex items-center gap-2 hover:bg-secondary transition">
              <Plus className="h-4 w-4" /> Add New Organization
            </button>
            <button className="border border-primary-foreground/25 text-primary-foreground rounded-xl px-5 py-3 text-sm font-semibold hover:bg-primary-foreground/10 transition">
              Explore API Docs
            </button>
          </div>
          <div aria-hidden className="absolute -right-10 -bottom-10 h-72 w-72 rounded-full border border-primary-foreground/10" />
          <div aria-hidden className="absolute right-10 bottom-10 h-40 w-40 rounded-full border border-primary-foreground/10" />
        </div>
        <div className="rounded-2xl p-8 bg-success text-success-foreground">
          <div className="label-eyebrow text-success-foreground/80">Quick Insight</div>
          <h3 className="font-display text-2xl font-semibold mt-3 leading-snug">Average response time across all tenants is 14ms.</h3>
          <p className="text-sm text-success-foreground/85 mt-4">Global latency remains within the Tier-1 Enterprise SLA requirements for all regional zones.</p>
        </div>
      </div>
    </div>
  );
}