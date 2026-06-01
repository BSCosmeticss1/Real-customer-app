"use client";

import { Send, Hourglass, Calendar, AlertTriangle, TrendingUp, Clock, Check, Sparkles, CloudUpload, AlertCircle, UserPlus, BarChart3, MessageSquarePlus, Upload } from "lucide-react";

const stats = [
  { label: "Total Sent", value: "1.2M", icon: Send, foot: <><TrendingUp className="h-3.5 w-3.5" /> +12.5% this month</>, tone: "default" },
  { label: "Pending", value: "4,892", icon: Hourglass, foot: <><Clock className="h-3.5 w-3.5" /> Next batch in 4m</>, tone: "default" },
  { label: "Scheduled", value: "124", icon: Calendar, foot: <><Calendar className="h-3.5 w-3.5" /> Active automations</>, tone: "default" },
  { label: "Failure Rate", value: "0.04%", icon: AlertTriangle, foot: <><Check className="h-3.5 w-3.5" /> Within safe threshold</>, tone: "danger" },
];

const activity = [
  { icon: Check, tint: "bg-success-soft text-success", title: 'Campaign "Spring Outreach" Completed', sub: "45,021 messages delivered successfully to Segment A.", time: "JUST NOW" },
  { icon: Sparkles, tint: "bg-accent/40 text-primary", title: "New Automation Triggered", sub: "User signup workflow initiated for 12 new contacts.", time: "12M AGO" },
  { icon: CloudUpload, tint: "bg-secondary text-primary", title: "Bulk Import Successful", sub: "Imported 12,500 contacts via Excel sheet.", time: "45M AGO" },
  { icon: AlertCircle, tint: "bg-destructive-soft text-destructive", title: "API Rate Limit Warning", sub: 'Provider node "Delta" reaching throughput.', time: "1H AGO" },
  { icon: UserPlus, tint: "bg-secondary text-primary", title: "New Administrator Added", sub: "Account access granted to Sarah Miller (Lead Dev).", time: "3H AGO" },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Title row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="label-eyebrow text-primary">System Overview</div>
          <h1 className="font-display text-3xl sm:text-5xl font-semibold text-foreground mt-2">Command Console</h1>
        </div>
        <div className="sm:text-right">
          <div className="label-eyebrow">System Health</div>
          <div className="flex items-center gap-2 mt-2">
            <span className="font-display text-xl text-foreground">Operational</span>
            <span className="flex gap-0.5 items-end">
              {[10,14,18,22].map((h,i) => <span key={i} className="w-1 bg-success rounded-sm" style={{height: h}} />)}
            </span>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((s) => {
          const Icon = s.icon;
          const danger = s.tone === "danger";
          return (
            <div key={s.label} className={`rounded-2xl p-6 shadow-card ${danger ? "bg-destructive-soft" : "bg-card"}`}>
              <div className="flex items-start justify-between">
                <div className={`label-eyebrow ${danger ? "text-destructive" : ""}`}>{s.label}</div>
                <Icon className={`h-7 w-7 ${danger ? "text-destructive/40" : "text-muted-foreground/40"}`} />
              </div>
              <div className={`font-display text-4xl sm:text-5xl font-semibold mt-6 ${danger ? "text-destructive" : "text-foreground"}`}>{s.value}</div>
              <div className={`mt-6 text-xs flex items-center gap-1.5 ${danger ? "text-destructive" : "text-muted-foreground"}`}>{s.foot}</div>
            </div>
          );
        })}
      </div>

      {/* Quick start + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left col */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-gradient-deep text-primary-foreground p-7 shadow-deep">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold">Quick Start</h2>
            <p className="text-primary-foreground/70 mt-2 text-sm leading-relaxed">Execute immediate actions or initialize new campaign nodes.</p>
            <div className="mt-6 space-y-3">
              <button className="w-full bg-card text-foreground rounded-xl py-4 font-medium flex items-center justify-center gap-3 hover:translate-y-[-1px] transition">
                <MessageSquarePlus className="h-5 w-5" /> Compose Message
              </button>
              <button className="w-full bg-primary-glow text-primary-foreground rounded-xl py-4 font-medium flex items-center justify-center gap-3 border border-primary-foreground/10 hover:bg-primary-glow/80 transition">
                <Upload className="h-5 w-5" /> Upload Contacts
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-card p-6 shadow-card">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-display text-xl font-semibold">System Nodes</h3>
            </div>
            <ul className="space-y-4 text-sm">
              {[
                { name: "Messaging Gateway", value: "99.9%", dot: "bg-success" },
                { name: "Automation Logic", value: "ONLINE", dot: "bg-success" },
                { name: "API Endpoint v2", value: "ACTIVE", dot: "bg-primary-glow" },
              ].map((n) => (
                <li key={n.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-3 font-medium text-foreground">
                    <span className={`h-2.5 w-2.5 rounded-full ${n.dot}`} />
                    {n.name}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground tracking-wide">{n.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right col activity */}
        <div className="lg:col-span-2 rounded-2xl bg-card p-7 shadow-card relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold">Recent Activity</h2>
            <button className="text-sm font-semibold text-primary hover:underline self-start">Full Audit Log</button>
          </div>
          <ul className="divide-y divide-border">
            {activity.map((a, i) => {
              const Icon = a.icon;
              return (
                <li key={i} className="py-4 flex items-start gap-4">
                  <div className={`h-10 w-10 sm:h-11 sm:w-11 rounded-xl shrink-0 grid place-items-center ${a.tint}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                      <div className="font-semibold text-foreground text-sm sm:text-base truncate">{a.title}</div>
                      <div className="label-eyebrow shrink-0 text-[10px] sm:text-xs">{a.time}</div>
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2 sm:line-clamp-none">{a.sub}</div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Live traffic floating card - Hidden on mobile, shown on lg */}
          <div className="hidden lg:block absolute right-6 bottom-6 bg-card rounded-2xl shadow-deep border border-border p-4 w-60">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="label-eyebrow">Live Traffic</span>
            </div>
            <div className="flex items-end gap-1.5 h-14">
              {[40,55,70,90,55,80,65,95].map((h,i) => (
                <span key={i} className="flex-1 rounded-t" style={{height: `${h}%`, background: i%3===0 ? "hsl(var(--primary))" : "hsl(var(--accent))"}} />
              ))}
            </div>
            <p className="text-[11px] italic text-muted-foreground mt-2">Real-time data visualization of outgoing packets.</p>
          </div>
        </div>
      </div>
    </div>
  );
}