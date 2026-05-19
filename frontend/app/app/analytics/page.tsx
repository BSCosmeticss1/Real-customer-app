"use client";

import { Sliders, Download, Mail, MessageSquare, Slack, ChevronLeft, ChevronRight, Zap, RotateCcw, Clock } from "lucide-react";

const stats = [
  { label: "Total Sent (24h)", value: "142,892", foot: "+12.4% vs yesterday", side: "" },
  { label: "Delivery Rate", value: "99.2%", foot: "", side: "border-l-4 border-success", bar: true },
  { label: "Failed Deliveries", value: "412", foot: "Requires immediate action", side: "border-l-4 border-destructive", danger: true },
  { label: "Avg. Latency", value: "240ms", foot: "Optimal performance", side: "" },
];

const rows = [
  { I: Mail, p: "Email Service", to: "aleks.v@example.com", id: "USER_882", msg: '"Your authentication node has been successful…"', status: "SENT", tone: "bg-success-soft text-success" },
  { I: MessageSquare, p: "SMS Gateway", to: "+1 (555) 012-9983", id: "SMS_NODE_4", msg: '"Alert: CPU Usage on Node-4 exceeds 95%…"', status: "FAILED", tone: "bg-destructive-soft text-destructive", row: "bg-destructive-soft/40" },
  { I: Slack, p: "Slack Bot", to: "#engineering-alerts", id: "SLK_WH_01", msg: '"Deployment of \'Architect-UI\' succeeded on p…"', status: "PENDING", tone: "bg-accent/60 text-primary" },
  { I: Mail, p: "Email Service", to: "marcus.t@design.co", id: "USER_741", msg: '"New design system assets are ready for revie…"', status: "SENT", tone: "bg-success-soft text-success" },
];

export default function Analytics() {
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
            <div className={`font-display text-4xl font-semibold mt-3 ${s.danger ? "text-destructive" : "text-foreground"}`}>{s.value}</div>
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
            {rows.map((r, i) => (
              <tr key={i} className={`border-t border-border ${r.row ?? ""}`}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-lg grid place-items-center ${r.tone}`}><r.I className="h-4 w-4" /></div>
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
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between p-5 bg-secondary/30">
          <div className="text-sm text-muted-foreground font-semibold">PAGE 1 OF 1,244</div>
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