"use client";

import { Filter, ChevronDown, Check, Minus, UserPlus, Upload, BarChart3, ChevronLeft, ChevronRight, Zap, MessageCircle } from "lucide-react";

const platforms = ["WhatsApp","Facebook","Instagram","TikTok","Reels","SMS"];

const contacts = [
  { name: "Adrian Sterling", role: "Head of Acquisition", initials: "AS", color: "bg-secondary text-primary", states: [1,1,0,1,1,1] },
  { name: "Julianne Moore", role: "Influencer Partner", initials: "JM", color: "bg-accent text-primary", states: [1,0,1,1,1,0] },
  { name: "Roman Kemp", role: "Retail Architect", initials: "RK", color: "bg-success-soft text-success", states: [0,1,0,0,0,1] },
  { name: "Silas Vane", role: "Brand Strategist", initials: "SV", color: "bg-primary text-primary-foreground", states: [1,1,1,1,1,1] },
  { name: "Mira Okafor", role: "Growth Lead", initials: "MO", color: "bg-accent/60 text-primary", states: [1,1,0,1,0,1] },
];

export default function Contacts() {
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-5xl font-semibold">Contact Intelligence</h1>
          <p className="text-muted-foreground mt-2">Architecting relationships through unified platform orchestration.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-card border border-border rounded-xl px-5 py-3 font-semibold flex items-center gap-2 shadow-card"><Upload className="h-4 w-4" /> Bulk Upload</button>
          <button className="bg-primary text-primary-foreground rounded-xl px-5 py-3 font-semibold flex items-center gap-2 shadow-deep"><UserPlus className="h-4 w-4" /> Add Contact</button>
        </div>
      </div>

      <div className="bg-card/60 rounded-2xl p-4 flex flex-wrap items-center gap-3">
        <span className="label-eyebrow flex items-center gap-2"><Filter className="h-3.5 w-3.5" />Filters</span>
        <button className="bg-card rounded-xl px-4 py-2.5 text-sm font-medium flex items-center gap-3 min-w-[180px] justify-between">All Platforms <ChevronDown className="h-4 w-4" /></button>
        <button className="bg-card rounded-xl px-4 py-2.5 text-sm font-medium flex items-center gap-3 min-w-[160px] justify-between">Any Tag <ChevronDown className="h-4 w-4" /></button>
        <div className="ml-auto flex gap-2">
          <span className="bg-primary text-primary-foreground rounded-full px-4 py-2 text-xs font-semibold">Active Campaigns (12)</span>
          <span className="bg-card rounded-full px-4 py-2 text-xs font-semibold border border-border">New This Week (48)</span>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left">
              <th className="p-5 w-10"><input type="checkbox" className="accent-primary" /></th>
              <th className="label-eyebrow py-5">Contact Name</th>
              {platforms.map(p => <th key={p} className="label-eyebrow py-5 text-center">{p}</th>)}
              <th className="label-eyebrow py-5 text-center pr-6">Action</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.name} className="border-t border-border hover:bg-secondary/30 transition">
                <td className="p-5"><input type="checkbox" className="accent-primary" /></td>
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full grid place-items-center text-xs font-semibold ${c.color}`}>{c.initials}</div>
                    <div>
                      <div className="font-semibold text-foreground">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.role}</div>
                    </div>
                  </div>
                </td>
                {c.states.map((s,i) => (
                  <td key={i} className="text-center">
                    {s ? (
                      <span className="inline-grid place-items-center h-7 w-7 rounded-full bg-success text-success-foreground"><Check className="h-3.5 w-3.5" /></span>
                    ) : (
                      <span className="inline-grid place-items-center h-7 w-7 rounded-full bg-secondary text-muted-foreground"><Minus className="h-3.5 w-3.5" /></span>
                    )}
                  </td>
                ))}
                <td className="text-center pr-6">
                  <button className="h-8 w-8 rounded-lg hover:bg-secondary inline-grid place-items-center"><MessageCircle className="h-4 w-4 text-primary" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between p-5 bg-secondary/30">
          <div className="text-sm text-muted-foreground">Showing 1–25 of 1,248 contacts</div>
          <div className="flex items-center gap-2">
            <button className="h-9 w-9 rounded-lg bg-card grid place-items-center"><ChevronLeft className="h-4 w-4" /></button>
            {[1,2,3].map(n => <button key={n} className={`h-9 w-9 rounded-lg ${n===1 ? "bg-primary text-primary-foreground" : "bg-card"}`}>{n}</button>)}
            <button className="h-9 w-9 rounded-lg bg-card grid place-items-center"><ChevronRight className="h-4 w-4" /></button>
            <button className="ml-3 bg-card rounded-lg px-4 py-2 text-xs font-semibold flex items-center gap-2">25 PER PAGE <ChevronDown className="h-3 w-3" /></button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-card rounded-2xl p-6 shadow-card relative overflow-hidden">
          <div className="label-eyebrow">Automation Reach</div>
          <div className="font-display text-5xl font-semibold mt-3">88.4%</div>
          <div className="text-xs text-success font-semibold mt-3">+2.4% vs last week</div>
          <Zap className="absolute right-4 bottom-4 h-16 w-16 text-secondary" />
        </div>
        <div className="bg-card rounded-2xl p-6 shadow-card relative overflow-hidden">
          <div className="label-eyebrow">Global Messages</div>
          <div className="font-display text-5xl font-semibold mt-3">14.2k</div>
          <div className="text-xs text-muted-foreground mt-3">Distributed across 6 platforms</div>
          <MessageCircle className="absolute right-4 bottom-4 h-16 w-16 text-secondary" />
        </div>
        <div className="bg-gradient-deep text-primary-foreground rounded-2xl p-6 shadow-deep relative overflow-hidden">
          <h3 className="font-display text-2xl font-semibold">Architecture Insights</h3>
          <p className="text-primary-foreground/75 text-sm mt-2">Your Instagram automation has a 40% higher engagement rate than manual outreach this month.</p>
          <button className="mt-5 bg-primary-glow/60 rounded-xl px-4 py-2.5 text-sm font-semibold">Review Strategy</button>
          <BarChart3 className="absolute right-4 bottom-4 h-16 w-16 text-primary-foreground/10" />
        </div>
      </div>
    </div>
  );
}