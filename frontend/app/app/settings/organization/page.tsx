"use client";

import { Building2, Upload, Save } from "lucide-react";

export default function OrgSettings() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <div className="label-eyebrow">Admin only</div>
        <h1 className="font-display text-5xl font-semibold text-foreground mt-2">Organization Settings</h1>
        <p className="text-muted-foreground mt-3">Manage your organization profile, branding, and platform integrations.</p>
      </div>

      {/* Profile */}
      <section className="bg-card border border-border rounded-2xl p-8 shadow-card space-y-6">
        <h2 className="font-display text-2xl font-semibold text-foreground">Profile</h2>
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 rounded-2xl bg-secondary grid place-items-center text-primary">
            <Building2 className="h-8 w-8" />
          </div>
          <button className="flex items-center gap-2 bg-secondary text-primary rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-accent/40 transition">
            <Upload className="h-4 w-4" /> Upload logo
          </button>
        </div>
        <div className="grid grid-cols-2 gap-5">
          <Field label="Organization name" defaultValue="Acme Corp" />
          <Field label="Public ID" defaultValue="acme-corp" />
          <Field label="Industry" defaultValue="Retail" />
          <Field label="Timezone" defaultValue="UTC+05:30" />
        </div>
      </section>

      {/* Integrations */}
      <section className="bg-card border border-border rounded-2xl p-8 shadow-card space-y-6">
        <h2 className="font-display text-2xl font-semibold text-foreground">Platform Integrations</h2>
        <div className="space-y-3">
          {[
            { name: "WhatsApp Business API", connected: true },
            { name: "Instagram Graph API", connected: true },
            { name: "Facebook Messenger", connected: false },
          ].map((p) => (
            <div key={p.name} className="flex items-center justify-between p-4 rounded-xl bg-secondary/40">
              <div className="flex items-center gap-3">
                <span className={`h-2 w-2 rounded-full ${p.connected ? "bg-success" : "bg-muted-foreground"}`} />
                <span className="font-medium text-foreground">{p.name}</span>
              </div>
              <button className="text-sm font-semibold text-primary hover:underline">{p.connected ? "Manage" : "Connect"}</button>
            </div>
          ))}
        </div>
      </section>

      {/* Danger */}
      <section className="bg-destructive-soft border border-destructive/20 rounded-2xl p-8 space-y-4">
        <h2 className="font-display text-2xl font-semibold text-destructive">Danger Zone</h2>
        <p className="text-sm text-foreground/80">Permanently delete this organization. All contacts, messages, and automations will be erased.</p>
        <button className="bg-destructive text-destructive-foreground rounded-xl px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition">Delete organization</button>
      </section>

      <div className="flex justify-end">
        <button className="bg-primary text-primary-foreground rounded-xl px-6 py-3 font-semibold flex items-center gap-2 shadow-deep hover:bg-primary-glow transition">
          <Save className="h-4 w-4" /> Save changes
        </button>
      </div>
    </div>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <input {...props} className="mt-2 w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
    </label>
  );
}