"use client";

import { Sliders, Download, Mail, MessageSquare, Slack, ChevronLeft, ChevronRight, Zap, RotateCcw, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const platformIcon: Record<string, any> = {
  whatsapp: MessageSquare,
  instagram: MessageSquare,
  facebook: MessageSquare,
  sms: MessageSquare,
  email: Mail,
  slack: Slack,
};

const platformName: Record<string, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  facebook: "Facebook",
  sms: "SMS Gateway",
  email: "Email Service",
  slack: "Slack Bot",
};

function getLast24h() {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  return { start: yesterday.toISOString(), end: now.toISOString() };
}

export default function Analytics() {
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    setToken(localStorage.getItem("token") || "");
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["analytics-logs"],
    enabled: !!token,
    queryFn: async () => {
      const { start, end } = getLast24h();
      const res = await fetch(`${API_BASE}/messages/logs?limit=100&startDate=${encodeURIComponent(start)}&endDate=${encodeURIComponent(end)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data || [];
    },
  });

  const logs = data || [];
  const totalSent = logs.filter((l: any) => l.status === "sent").length;
  const totalFailed = logs.filter((l: any) => l.status === "failed").length;
  const totalDispatches = totalSent + totalFailed + logs.filter((l: any) => l.status === "pending").length;
  const deliveryRate = totalDispatches > 0 ? ((totalSent / totalDispatches) * 100).toFixed(1) + "%" : "0.0%";

  const stats = [
    { label: "Total Sent (24h)", value: totalSent.toLocaleString(), foot: "Last 24 hours", side: "" },
    { label: "Delivery Rate", value: deliveryRate, foot: "", side: "border-l-4 border-success", bar: true },
    { label: "Failed Deliveries", value: totalFailed.toLocaleString(), foot: totalFailed > 0 ? "Requires immediate action" : "All clear", side: "border-l-4 border-destructive", danger: totalFailed > 0 },
    { label: "Avg. Latency", value: "N/A", foot: "No telemetry data yet", side: "" },
  ];

  const rows = logs.slice(0, 10).map((log: any) => {
    const Icon = platformIcon[log.platform] || MessageSquare;
    const p = platformName[log.platform] || log.platform || "System";
    const to = log.contact?.name || log.contactName || log.contact?.company || "Unknown";
    const id = log.externalId || log.id.slice(0, 8);
    const msg = log.content ? `"${String(log.content).slice(0, 60)}${String(log.content).length > 60 ? "…" : ""}"` : "—";
    const status = (log.status || "pending").toUpperCase();
    const tone = log.status === "sent" ? "bg-success-soft text-success" : log.status === "failed" ? "bg-destructive-soft text-destructive" : "bg-accent/60 text-primary";
    return { I: Icon, p, to, id, msg, status, tone };
  });

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-sm text-muted-foreground">Infrastructure <span className="mx-1">›</span> <span className="text-primary">Messaging Logs</span></div>
          <h1 className="font-display text-5xl font-semibold mt-2">Messaging Logs</h1>
          <p className="text-muted-foreground mt-2 max-w-md">Real-time surveillance of all automated delivery nodes across multi-platform integrations.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-card border border-border rounded-xl px-5 py-3 font-semibold flex items-center gap-2 shadow-card"><Sliders className="h-4 w-4" /> Advanced Filters</button>
          <button className="bg-primary text-primary-foreground rounded-xl px-5 py-3 font-semibold flex items-center gap-2 shadow-deep"><Download className="h-4 w-4" /> Export Data</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((s) => (
          <div key={s.label} className={`bg-card rounded-2xl p-6 shadow-card ${s.side}`}>
            <div className="label-eyebrow">{s.label}</div>
            <div className={`font-display text-4xl font-semibold mt-3 ${s.danger ? "text-destructive" : "text-foreground"}`}>
              {isLoading ? <span className="inline-block h-8 w-24 bg-secondary/60 rounded animate-pulse" /> : s.value}
            </div>
            {s.bar && <div className="h-1.5 bg-secondary rounded-full mt-4"><div className="h-full w-[99%] bg-success rounded-full" /></div>}
            {s.foot && <div className={`text-xs mt-3 ${s.danger ? "text-destructive font-semibold" : "text-muted-foreground"}`}>{s.foot}</div>}
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        <div className="flex items-center justify-between p-6">
          <h2 className="font-display text-2xl font-semibold">Live Delivery Stream</h2>
          <span className="text-xs font-semibold flex items-center gap-2 text-muted-foreground"><span className="h-2 w-2 rounded-full bg-success animate-pulse" /> STREAM ACTIVE</span>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading logs...</div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No message logs in the last 24 hours.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left border-t border-border">
                <th className="label-eyebrow px-6 py-4">Platform</th>
                <th className="label-eyebrow py-4">Recipient</th>
                <th className="label-eyebrow py-4">Message Preview</th>
                <th className="label-eyebrow py-4 text-right pr-6">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const RowIcon = r.I;
                return (
                  <tr key={i} className={`border-t border-border ${r.tone.includes("destructive") ? "bg-destructive-soft/40" : ""}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-lg grid place-items-center ${r.tone}`}><RowIcon className="h-4 w-4" /></div>
                        <span className="font-semibold text-foreground">{r.p}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="font-medium text-foreground">{r.to}</div>
                      <div className="text-xs text-muted-foreground">ID: {r.id}</div>
                    </td>
                    <td className="py-4 italic text-muted-foreground max-w-md truncate">{r.msg}</td>
                    <td className="py-4 text-right pr-6">
                      <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-wider ${r.tone}`}>{r.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <div className="flex items-center justify-between p-5 bg-secondary/30">
          <div className="text-sm text-muted-foreground font-semibold">PAGE 1 OF {Math.max(1, Math.ceil((logs as any[]).length / 10)).toLocaleString()}</div>
          <div className="flex items-center gap-2">
            <button className="h-9 w-9 rounded-lg bg-card grid place-items-center"><ChevronLeft className="h-4 w-4" /></button>
            {[1,2,3].map(n => <button key={n} className={`h-9 w-9 rounded-lg ${n===1 ? "bg-primary text-primary-foreground" : "bg-card"}`}>{n}</button>)}
            <button className="h-9 w-9 rounded-lg bg-card grid place-items-center"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-2xl shadow-card border-l-4 border-destructive p-7 relative">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[11px] font-bold tracking-wider px-3 py-1 rounded-full bg-destructive-soft text-destructive">CRITICAL ERROR</span>
            <span className="text-xs text-muted-foreground">TRACE ID: 9942-XF-8271</span>
          </div>
          <h3 className="font-display text-2xl font-semibold">Transmission Timeout: SMS Gateway 4</h3>
          <pre className="mt-5 bg-secondary/60 rounded-xl p-5 text-xs leading-6 font-mono overflow-x-auto">
<span className="text-destructive font-bold">Error: [408] Request Timeout</span>
{`
> Initiating handshake with upstream provider: Twilio_US_East_1
> DNS Resolution: Success (0.2ms)
> TLS Handshake: Success (45.1ms)
> Sending Payload: { "to": "+15550129983", "body": "Alert: CPU..." }`}
<span className="text-destructive">{`
! Provider Response: Gateway timed out after 30000ms.
  No ACK received.`}</span>
          </pre>
          <div className="flex gap-3 mt-6">
            <button className="bg-primary text-primary-foreground rounded-xl px-5 py-3 font-semibold flex items-center gap-2 shadow-deep"><RotateCcw className="h-4 w-4" /> Manual Retry Now</button>
            <button className="bg-secondary text-foreground rounded-xl px-5 py-3 font-semibold">Ignore Log</button>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-7 shadow-card">
          <h3 className="font-display text-2xl font-semibold mb-5">Recommended Actions</h3>
          <div className="space-y-5">
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-lg bg-secondary text-primary grid place-items-center shrink-0"><Zap className="h-4 w-4" /></div>
              <div>
                <div className="font-semibold">Reroute Traffic</div>
                <p className="text-sm text-muted-foreground mt-1">Switch to secondary SMS provider (Plivo_Global) to bypass current latency spikes in East US.</p>
                <button className="text-xs font-bold text-primary mt-2 tracking-wider">APPLY ROUTE PATCH</button>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-lg bg-secondary text-primary grid place-items-center shrink-0"><Clock className="h-4 w-4" /></div>
              <div>
                <div className="font-semibold">Adjust Retry Policy</div>
                <p className="text-sm text-muted-foreground mt-1">Current backoff: 2s, 10s, 30s. Recommendation: Increase to exponential backoff over 5 mins.</p>
                <button className="text-xs font-bold text-primary mt-2 tracking-wider">MODIFY POLICY</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
