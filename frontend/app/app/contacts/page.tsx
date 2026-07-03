"use client";

import { Filter, ChevronDown, Check, Minus, UserPlus, Upload, BarChart3, ChevronLeft, ChevronRight, Zap, MessageCircle, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

const platforms = ["WhatsApp", "Facebook", "Instagram"];

export default function Contacts() {
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContactName, setNewContactName] = useState("");
  const [newContactWhatsApp, setNewContactWhatsApp] = useState("");
  const [newContactFacebook, setNewContactFacebook] = useState("");
  const [newContactInstagram, setNewContactInstagram] = useState("");
  const queryClient = useQueryClient();

  const { data: contactsData, isLoading } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/contacts?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data;
    },
  });

  const addContactMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newContactName,
          phone: newContactWhatsApp,
          whatsapp: newContactWhatsApp,
          facebook: newContactFacebook,
          instagram: newContactInstagram,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data;
    },
    onSuccess: () => {
      toast.success("Contact added successfully!");
      setShowAddModal(false);
      setNewContactName("");
      setNewContactWhatsApp("");
      setNewContactFacebook("");
      setNewContactInstagram("");
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add contact");
    },
  });

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName) {
      toast.error("Name is required");
      return;
    }
    addContactMutation.mutate();
  };

  const toggleContactSelection = (id: string) => {
    setSelectedContactIds(prev => 
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const toggleAllSelection = () => {
    const contacts = contactsData?.data || [];
    if (contacts.length > 0) {
      if (selectedContactIds.length === contacts.length) {
        setSelectedContactIds([]);
      } else {
        setSelectedContactIds(contacts.map((c: any) => c.id));
      }
    }
  };

  const contacts = contactsData?.data || [];
  const totalContacts = contactsData?.pagination?.total || 0;

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-5xl font-semibold">Contact Intelligence</h1>
          <p className="text-muted-foreground mt-2">Architecting relationships through unified platform orchestration.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-card border border-border rounded-xl px-5 py-3 font-semibold flex items-center gap-2 shadow-card"><Upload className="h-4 w-4" /> Bulk Upload</button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-primary-foreground rounded-xl px-5 py-3 font-semibold flex items-center gap-2 shadow-deep"
          >
            <UserPlus className="h-4 w-4" /> Add Contact
          </button>
        </div>
      </div>

      <div className="bg-card/60 rounded-2xl p-4 flex flex-wrap items-center gap-3">
        <span className="label-eyebrow flex items-center gap-2"><Filter className="h-3.5 w-3.5" />Filters</span>
        <button className="bg-card rounded-xl px-4 py-2.5 text-sm font-medium flex items-center gap-3 min-w-[180px] justify-between">All Platforms <ChevronDown className="h-4 w-4" /></button>
        <button className="bg-card rounded-xl px-4 py-2.5 text-sm font-medium flex items-center gap-3 min-w-[160px] justify-between">Any Tag <ChevronDown className="h-4 w-4" /></button>
      </div>

      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left">
              <th className="p-5 w-10">
                <input 
                  type="checkbox" 
                  className="accent-primary"
                  checked={contacts.length > 0 && selectedContactIds.length === contacts.length}
                  onChange={toggleAllSelection}
                />
              </th>
              <th className="label-eyebrow py-5">Contact Name</th>
              {platforms.map(p => <th key={p} className="label-eyebrow py-5 text-center">{p}</th>)}
              <th className="label-eyebrow py-5 text-center pr-6">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={platforms.length + 3} className="p-8 text-center text-muted-foreground">
                  Loading contacts...
                </td>
              </tr>
            ) : contacts.length === 0 ? (
              <tr>
                <td colSpan={platforms.length + 3} className="p-8 text-center text-muted-foreground">
                  No contacts found. Click "Add Contact" to get started!
                </td>
              </tr>
            ) : (
              contacts.map((c: any) => {
                const hasPlatform = (platform: string) => {
                  const p = platform.toLowerCase();
                  return (p === "whatsapp" && c.whatsapp) || 
                         (p === "facebook" && c.facebook) || 
                         (p === "instagram" && c.instagram);
                };
                const initials = c.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                return (
                  <tr key={c.id} className="border-t border-border hover:bg-secondary/30 transition">
                    <td className="p-5">
                      <input 
                        type="checkbox" 
                        className="accent-primary"
                        checked={selectedContactIds.includes(c.id)}
                        onChange={() => toggleContactSelection(c.id)}
                      />
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full grid place-items-center text-xs font-semibold bg-secondary text-primary">
                          {initials}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{c.name}</div>
                          <div className="text-xs text-muted-foreground">{c.whatsapp || c.phone || c.company || "No contact info"}</div>
                        </div>
                      </div>
                    </td>
                    {platforms.map((p, i) => (
                      <td key={i} className="text-center">
                        {hasPlatform(p) ? (
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
                );
              })
            )}
          </tbody>
        </table>
        <div className="flex items-center justify-between p-5 bg-secondary/30">
          <div className="text-sm text-muted-foreground">
              Showing {contacts.length} of {totalContacts} contacts
            </div>
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
          <div className="label-eyebrow">Total Contacts</div>
            <div className="font-display text-5xl font-semibold mt-3">{totalContacts}</div>
            <div className="text-xs text-muted-foreground mt-3">Distributed across 3 platforms</div>
          <MessageCircle className="absolute right-4 bottom-4 h-16 w-16 text-secondary" />
        </div>
        <div className="bg-gradient-deep text-primary-foreground rounded-2xl p-6 shadow-deep relative overflow-hidden">
          <h3 className="font-display text-2xl font-semibold">Architecture Insights</h3>
          <p className="text-primary-foreground/75 text-sm mt-2">Your Instagram automation has a 40% higher engagement rate than manual outreach this month.</p>
          <button className="mt-5 bg-primary-glow/60 rounded-xl px-4 py-2.5 text-sm font-semibold">Review Strategy</button>
          <BarChart3 className="absolute right-4 bottom-4 h-16 w-16 text-primary-foreground/10" />
        </div>
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-card border border-border rounded-3xl shadow-deep w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card">
              <h3 className="font-display text-2xl font-semibold">Add Contact</h3>
              <button onClick={() => setShowAddModal(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddContact} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Name *</label>
                <input 
                  type="text"
                  required
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Enter contact name"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">WhatsApp Number</label>
                <input 
                  type="tel"
                  value={newContactWhatsApp}
                  onChange={(e) => setNewContactWhatsApp(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Facebook</label>
                <input 
                  type="text"
                  value={newContactFacebook}
                  onChange={(e) => setNewContactFacebook(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Facebook username or ID"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Instagram</label>
                <input 
                  type="text"
                  value={newContactInstagram}
                  onChange={(e) => setNewContactInstagram(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Instagram username"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-secondary text-foreground rounded-xl py-3 font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={addContactMutation.isPending}
                  className="flex-1 bg-primary text-primary-foreground rounded-xl py-3 font-semibold shadow-deep hover:bg-primary-glow transition disabled:opacity-50"
                >
                  {addContactMutation.isPending ? "Adding..." : "Add Contact"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
