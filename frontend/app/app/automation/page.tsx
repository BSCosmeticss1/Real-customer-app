"use client";

import { Settings2, Calendar, CalendarDays, Sliders, ChevronLeft, ChevronRight, MoreVertical, Sparkles, Mail, Network, CloudUpload, Plus, ArrowRight, Zap } from "lucide-react";

const days = ["M","T","W","T","F","S","S"];
const active = [0,2,4];

const pulse = [
  { time: "09:00 AM", tag: "SMS Blast", title: "Morning Engagement Campaign", sub: "Broadcasting to 4,502 recipients in West Coast segment.", api: "200", dur: "14m", note: "Next Run: Today" },
  { time: "11:30 AM", tag: "Data Sync", title: "Warehouse Reconciliation", sub: "Cross-referencing inventory levels with CRM message queues." },
  { time: "03:00 PM", tag: "Email Thread", title: "Weekly Retrospective Dispatch", sub: "Automated summaries for executive partners based on weekly analytics." },
];

export default function Automation() {
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <div className="label-eyebrow text-primary">Command Center</div>
          <h1 className="font-display text-5xl font-semibold mt-2">Automation Engine</h1>
        </div>
        <div className="bg-card rounded-2xl px-5 py-3 shadow-card flex items-center gap-4">
          <div>
            <div className="label-eyebrow">Background Status</div>
            <div className="font-display text-lg">Operational</div>
          </div>
          <div className="h-7 w-12 bg-success rounded-full relative">
            <span className="absolute right-0.5 top-0.5 h-6 w-6 rounded-full bg-card" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left config */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-card rounded-2xl p-7 shadow-card">
            <div className="flex items-center gap-2 mb-6">
              <Settings2 className="h-5 w-5 text-primary" />
              <h2 className="font-display text-2xl font-semibold">Configure Schedule</h2>
            </div>

            <div className="label-eyebrow">Timezone</div>
            <button className="mt-2 w-full bg-secondary rounded-xl px-4 py-3.5 text-left text-sm font-medium flex justify-between items-center">
              UTC-08:00 Pacific Time <ChevronRight className="h-4 w-4 rotate-90" />
            </button>

            <div className="label-eyebrow mt-6 mb-3">Recurrence Pattern</div>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                {l:"Daily", I:Calendar, a:false},
                {l:"Weekly", I:CalendarDays, a:true},
                {l:"Monthly", I:Calendar, a:false},
                {l:"Custom", I:Sliders, a:false},
              ].map(({l,I,a}) => (
                <button key={l} className={`rounded-xl py-3 px-4 text-sm font-semibold flex items-center gap-2 ${a ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                  <I className="h-4 w-4" /> {l}
                </button>
              ))}
            </div>

            <div className="label-eyebrow mt-6 mb-3">Days of Week</div>
            <div className="flex gap-2">
              {days.map((d, i) => (
                <button key={i} className={`h-10 w-10 rounded-full text-sm font-semibold ${active.includes(i) ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{d}</button>
              ))}
            </div>

            <button className="mt-7 w-full bg-secondary text-primary rounded-xl py-3.5 font-semibold hover:bg-secondary/70 transition">Save Configuration</button>
          </div>

          <div className="bg-gradient-deep text-primary-foreground rounded-2xl p-7 shadow-deep relative overflow-hidden">
            <h3 className="font-display text-2xl font-semibold">Automation Insight</h3>
            <p className="text-primary-foreground/75 text-sm mt-2 leading-relaxed">Your workflow "Customer Onboarding" has reduced manual tasks by 42% this week.</p>
            <div className="grid grid-cols-2 gap-3 mt-5">
              <div className="bg-primary-glow/40 rounded-xl p-4">
                <div className="label-eyebrow text-primary-foreground/70">Nodes</div>
                <div className="font-display text-3xl font-semibold mt-1">12</div>
              </div>
              <div className="bg-primary-glow/40 rounded-xl p-4">
                <div className="label-eyebrow text-primary-foreground/70">Saved</div>
                <div className="font-display text-3xl font-semibold mt-1">18h</div>
              </div>
            </div>
            <Sparkles className="absolute right-4 bottom-4 h-12 w-12 text-primary-foreground/10" />
          </div>
        </div>

        {/* Right pulse */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-card rounded-2xl p-7 shadow-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-3xl font-semibold">Upcoming Pulse</h2>
              <div className="flex items-center gap-3">
                <div className="bg-secondary rounded-lg p-1 flex text-xs font-semibold">
                  <span className="px-3 py-1.5 rounded-md bg-card shadow-sm">Timeline</span>
                  <span className="px-3 py-1.5 text-muted-foreground">Grid</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <button className="p-1 hover:bg-secondary rounded"><ChevronLeft className="h-4 w-4" /></button>
                  October 14 — 20, 2024
                  <button className="p-1 hover:bg-secondary rounded"><ChevronRight className="h-4 w-4" /></button>
                </div>
              </div>
            </div>

            <ol className="relative ml-3 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-border">
              {pulse.map((p, i) => (
                <li key={i} className="relative pl-8">
                  <span className="absolute left-0 top-2 h-4 w-4 rounded-full border-2 border-primary bg-card" />
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-foreground">{p.time}</span>
                    <span className="text-[11px] uppercase tracking-wider font-semibold bg-accent/40 text-primary px-2.5 py-1 rounded-full">{p.tag}</span>
                    {p.note && <span className="ml-auto text-xs italic text-muted-foreground">{p.note}</span>}
                  </div>
                  <div className="bg-secondary/60 rounded-xl p-5 border-l-4 border-primary">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-display text-xl font-semibold">{p.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{p.sub}</p>
                      </div>
                      <button><MoreVertical className="h-4 w-4 text-muted-foreground" /></button>
                    </div>
                    {p.api && (
                      <div className="flex gap-6 mt-4 text-xs text-muted-foreground">
                        <span>API STATUS: <strong className="text-foreground">{p.api}</strong></span>
                        <span>EST. DURATION: <strong className="text-foreground">{p.dur}</strong></span>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-3xl font-semibold">Active Workflows</h2>
              <button className="h-12 w-12 rounded-xl bg-primary text-primary-foreground grid place-items-center shadow-deep"><Zap className="h-5 w-5" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { I: Network, t: "Leads Router", s: "42 Active Threads", b: "LIVE", c: "bg-success" },
                { I: Mail, t: "Auto-Responder", s: "Scheduled for 08:00 AM", b: "IDLE", c: "bg-muted-foreground" },
                { I: CloudUpload, t: "Cloud Backup", s: "Daily at 02:00 AM", b: "STANDBY", c: "bg-primary-glow" },
              ].map(({I,t,s,b,c}) => (
                <div key={t} className="bg-card rounded-2xl p-5 shadow-card flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-secondary grid place-items-center text-primary"><I className="h-5 w-5" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground">{t}</div>
                    <div className="text-xs text-muted-foreground">{s}</div>
                  </div>
                  <span className="text-[10px] uppercase font-semibold flex items-center gap-1.5 text-muted-foreground"><span className={`h-2 w-2 rounded-full ${c}`} />{b}</span>
                </div>
              ))}
              <div className="bg-card rounded-2xl p-5 shadow-card flex items-center gap-4 border-2 border-dashed border-border">
                <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground grid place-items-center"><Plus className="h-5 w-5" /></div>
                <div className="flex-1">
                  <div className="font-semibold">New Workflow</div>
                  <div className="text-xs text-muted-foreground">Start from a template</div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}