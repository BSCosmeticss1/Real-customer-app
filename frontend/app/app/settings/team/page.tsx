"use client";

import { Mail, MoreVertical, Plus, Shield, User } from "lucide-react";

const members = [
  { name: "Jane Doe", email: "jane@acme.com", role: "Admin", initials: "JD", joined: "Jan 2025" },
  { name: "Marcus Lin", email: "marcus@acme.com", role: "Staff", initials: "ML", joined: "Feb 2025" },
  { name: "Priya Shah", email: "priya@acme.com", role: "Staff", initials: "PS", joined: "Mar 2025" },
  { name: "Tom Reyes", email: "tom@acme.com", role: "Pending", initials: "TR", joined: "—" },
];

export default function Team() {
  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="label-eyebrow">Admin only</div>
          <h1 className="font-display text-5xl font-semibold text-foreground mt-2">Team Members</h1>
          <p className="text-muted-foreground mt-3">Invite teammates and manage their access to this organization.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-5 py-3 text-sm font-semibold shadow-deep hover:bg-primary-glow transition">
          <Plus className="h-4 w-4" /> Invite member
        </button>
      </div>

      {/* Invite by email */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-card flex items-center gap-3">
        <div className="relative flex-1">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input placeholder="teammate@company.com" className="w-full bg-background border border-border rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
        </div>
        <select className="bg-background border border-border rounded-xl px-4 py-3 text-sm font-medium">
          <option>Staff</option>
          <option>Admin</option>
        </select>
        <button className="bg-primary text-primary-foreground rounded-xl px-5 py-3 text-sm font-semibold hover:bg-primary-glow transition">Send invite</button>
      </div>

      {/* List */}
      <div className="grid grid-cols-[2fr_1fr_1fr_40px] gap-4 px-6 label-eyebrow">
        <div>Member</div>
        <div>Role</div>
        <div>Joined</div>
        <div />
      </div>
      <div className="space-y-3">
        {members.map((m) => (
          <div key={m.email} className="grid grid-cols-[2fr_1fr_1fr_40px] gap-4 items-center bg-card border border-border rounded-2xl px-6 py-4 shadow-card">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground grid place-items-center text-sm font-semibold">{m.initials}</div>
              <div>
                <div className="font-semibold text-foreground">{m.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{m.email}</div>
              </div>
            </div>
            <div>
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-md ${
                m.role === "Admin" ? "bg-primary text-primary-foreground" :
                m.role === "Pending" ? "bg-warning/20 text-warning" :
                "bg-secondary text-primary"
              }`}>
                {m.role === "Admin" ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />} {m.role}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">{m.joined}</div>
            <button className="h-8 w-8 grid place-items-center rounded-full hover:bg-secondary text-muted-foreground">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}