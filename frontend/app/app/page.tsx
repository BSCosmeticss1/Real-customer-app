"use client";

import { Send, Hourglass, Calendar, AlertTriangle, TrendingUp, Clock, Check, Sparkles, AlertCircle, BarChart3, MessageSquarePlus, Upload } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function formatCount(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

function relativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "JUST NOW";
  if (mins < 60) return `${mins}M AGO`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}H AGO`;
  return `${Math.floor(hours / 24)}D AGO`;
}

function activityTint(status: string) {
  switch (status) {
    case "sent": return "bg-success-soft text-success";
    case "pending": return "bg-accent/40 text-primary";
    case "failed": return "bg-destructive-soft text-destructive";
    case "scheduled": return "bg-secondary text-primary";
    default: return "bg-secondary text-primary";
  }
}

const nodeStats = [
  { name: "Messaging Gateway", value: "99.9%", dot: "bg-success" },
  { name: "Automation Logic", value: "ONLINE", dot: "bg-success" },
  { name: "API Endpoint v2", value: "ACTIVE", dot: "bg-primary-glow" },
];

export default function Dashboard() {
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    setToken(localStorage.getItem("token") || "");
  }, []);

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    enabled: !!token,
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
  });

  const { data: scheduledData } = useQuery({
    queryKey: ["dashboard-scheduled"],
    enabled: !!token,
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/dashboard/scheduled`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
  });

  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ["dashboard-activity"],
    enabled: !!token,
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/dashboard/activity`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
  });

  const messagesSent = Number(statsData?.messagesSent || 0);
  const pendingMessages = Number(statsData?.pendingMessages || 0);
  const failedMessages = Number(statsData?.failedMessages || 0);
  const totalDispatches = messagesSent + pendingMessages + failedMessages;
  const failureRate = totalDispatches > 0 ? ((failedMessages / totalDispatches) * 100).toFixed(2) + "%" : "0.00%";

  const stats = [
    { label: "Total Sent", value: formatCount(messagesSent), icon: Send, foot: <><TrendingUp className="h-3.5 w-3.5" /> Live from backend</>, tone: "default" },
    { label: "Pending", value: pendingMessages.toLocaleString(), icon: Hourglass, foot: <><Clock className="h-3.5 w-3.5" /> Queued messages</>, tone: "default" },
    { label: "Scheduled", value: String(scheduledData?.count || 0), icon: Calendar, foot: <><Calendar className="h-3.5 w-3.5" /> Active automations</>, tone: "default" },
    { label: "Failure Rate", value: failureRate, icon: AlertTriangle, foot: <><Check className="h-3.5 w-3.5" /> Monitored live</>, tone: parseFloat(failureRate) > 5 ? "danger" : "default" },
  ];

  const activity = (activityData || []).map((log: any) => {
    const tint = activityTint(log.status);
    const title = log.platform ? `${log.platform.charAt(0).toUpperCase() + log.platform.slice(1)} ${log.status === "sent" ? "Delivery" : log.status}` : "System Event";
    const sub = log.content && String(log.content).trim() ? String(log.content).slice(0, 120) + (String(log.content).length > 120 ? "…" : "") : "No details";
    const time = log.sentAt ? relativeTime(log.sentAt) : "RECENT";
    return { tint, title, sub, time };
  });

  const isLoading = statsLoading || activityLoading;

  return (
    <div className="space-y-8">
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
              <div className={`font-display text-4xl sm:text-5xl font-semibold mt-6 ${danger ? "text-destructive" : "text-foreground"}`}>
                {isLoading ? <span className="inline-block h-10 w-20 bg-secondary/60 rounded animate-pulse" /> : s.value}
              </div>
              <div className={`mt-6 text-xs flex items-center gap-1.5 ${danger ? "text-destructive" : "text-muted-foreground"}`}>{s.foot}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              {nodeStats.map((n) => (
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

        <div className="lg:col-span-2 rounded-2xl bg-card p-7 shadow-card relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold">Recent Activity</h2>
            <button className="text-sm font-semibold text-primary hover:underline self-start">Full Audit Log</button>
          </div>
          {isLoading || activity.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {isLoading ? "Loading activity..." : "No activity yet."}
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {activity.map((a, i) => {
                return (
                  <li key={i} className="py-4 flex items-start gap-4">
                    <div className={`h-10 w-10 sm:h-11 sm:w-11 rounded-xl shrink-0 grid place-items-center ${a.tint}`}>
                      {iconFromTint(a.tint)}
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
          )}

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

function iconFromTint(tint: string) {
  if (tint.includes("success")) return <Check className="h-5 w-5" />;
  if (tint.includes("destructive")) return <AlertCircle className="h-5 w-5" />;
  if (tint.includes("accent")) return <Clock className="h-5 w-5" />;
  return <Sparkles className="h-5 w-5" />;
}
