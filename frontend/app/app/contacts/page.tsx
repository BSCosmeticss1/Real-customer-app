"use client";

import { Filter, ChevronDown, Check, Minus, UserPlus, Upload, BarChart3, ChevronLeft, ChevronRight, Zap, MessageCircle, X, Pencil, Trash2, Users } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { toast } from "sonner";

const platforms = ["WhatsApp", "Facebook", "Instagram"];

interface ContactRow {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  facebook?: string;
  instagram?: string;
}

const emptyContact: Omit<ContactRow, "id"> = {
  name: "",
  company: "",
  email: "",
  phone: "",
  whatsapp: "",
  facebook: "",
  instagram: "",
};

export default function Contacts() {
  const queryClient = useQueryClient();
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<ContactRow, "id">>(emptyContact);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const contactMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      const url = editingId
        ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/contacts/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/contacts`;
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data;
    },
    onSuccess: () => {
      toast.success(editingId ? "Contact updated successfully!" : "Contact added successfully!");
      setShowAddModal(false);
      setEditingId(null);
      setFormData(emptyContact);
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save contact");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/contacts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data;
    },
    onSuccess: () => {
      toast.success("Contact deleted successfully!");
      setDeleteTargetId(null);
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete contact"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Name is required");
      return;
    }
    contactMutation.mutate();
  };

  const startEdit = (contact: ContactRow) => {
    setEditingId(contact.id);
    setFormData({
      name: contact.name,
      company: contact.company || "",
      email: contact.email || "",
      phone: contact.phone || "",
      whatsapp: contact.whatsapp || "",
      facebook: contact.facebook || "",
      instagram: contact.instagram || "",
    });
    setShowAddModal(true);
  };

  const handleBulkUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validExtensions = [".csv", ".xlsx", ".xls"];
    const fileExtension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      toast.error("Invalid file format. Please upload CSV or Excel files.");
      return;
    }

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/contacts/import`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success(`Imported ${data.data.imported} contacts successfully!`);
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to import contacts");
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
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
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={handleBulkUpload}
            className="bg-card border border-border rounded-xl px-5 py-3 font-semibold flex items-center gap-2 shadow-card"
          >
            <Upload className="h-4 w-4" /> Bulk Upload
          </button>
          <button
            onClick={() => { setEditingId(null); setFormData(emptyContact); setShowAddModal(true); }}
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
                  onChange={() => {
                    if (selectedContactIds.length === contacts.length) setSelectedContactIds([]);
                    else setSelectedContactIds(contacts.map((c: any) => c.id));
                  }}
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
                        onChange={() => {
                          setSelectedContactIds(prev =>
                            prev.includes(c.id) ? prev.filter(cid => cid !== c.id) : [...prev, c.id]
                          );
                        }}
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
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => startEdit(c)}
                          className="h-8 w-8 rounded-lg hover:bg-secondary inline-grid place-items-center"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4 text-primary" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(c.id)}
                          className="h-8 w-8 rounded-lg hover:bg-secondary inline-grid place-items-center"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </button>
                      </div>
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
            {totalContacts > 0 && (
              <>
                <button className="h-9 w-9 rounded-lg bg-card grid place-items-center"><ChevronLeft className="h-4 w-4" /></button>
                {Array.from({ length: Math.min((contactsData?.pagination?.pages || 1), 5) }).map((_, i) => (
                  <button key={i + 1} className={`h-9 w-9 rounded-lg ${i + 1 === (contactsData?.pagination?.page || 1) ? "bg-primary text-primary-foreground" : "bg-card"}`}>{i + 1}</button>
                ))}
                <button className="h-9 w-9 rounded-lg bg-card grid place-items-center"><ChevronRight className="h-4 w-4" /></button>
                <button className="ml-3 bg-card rounded-lg px-4 py-2 text-xs font-semibold flex items-center gap-2">{contactsData?.pagination?.limit || 25} PER PAGE <ChevronDown className="h-3 w-3" /></button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-card rounded-2xl p-6 shadow-card relative overflow-hidden">
          <div className="label-eyebrow">Active Platforms</div>
          <div className="font-display text-5xl font-semibold mt-3">
            {contacts.filter((c: any) => (c.whatsapp || c.facebook || c.instagram)).length}
          </div>
          <div className="text-xs text-success font-semibold mt-3">contacts with at least 1 platform</div>
          <Zap className="absolute right-4 bottom-4 h-16 w-16 text-secondary" />
        </div>
        <div className="bg-card rounded-2xl p-6 shadow-card relative overflow-hidden">
          <div className="label-eyebrow">Total Contacts</div>
            <div className="font-display text-5xl font-semibold mt-3">{totalContacts}</div>
            <div className="text-xs text-muted-foreground mt-3">Distributed across 3 platforms</div>
          <MessageCircle className="absolute right-4 bottom-4 h-16 w-16 text-secondary" />
        </div>
        <div className="bg-gradient-deep text-primary-foreground rounded-2xl p-6 shadow-deep relative overflow-hidden">
          <h3 className="font-display text-2xl font-semibold">Contact Insights</h3>
          <p className="text-primary-foreground/75 text-sm mt-2">
            {totalContacts > 0
              ? `You have ${contacts.filter((c: any) => c.whatsapp).length} WhatsApp, ${contacts.filter((c: any) => c.facebook).length} Facebook, and ${contacts.filter((c: any) => c.instagram).length} Instagram contacts.`
              : "Start adding contacts to see platform distribution insights."}
          </p>
          <button className="mt-5 bg-primary-glow/60 rounded-xl px-4 py-2.5 text-sm font-semibold">View All Contacts</button>
          <BarChart3 className="absolute right-4 bottom-4 h-16 w-16 text-primary-foreground/10" />
        </div>
      </div>

      {/* Add/Edit Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-card border border-border rounded-3xl shadow-deep w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
              <h3 className="font-display text-2xl font-semibold">{editingId ? "Edit Contact" : "Add Contact"}</h3>
              <button onClick={() => { setShowAddModal(false); setEditingId(null); setFormData(emptyContact); }}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Enter contact name"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="+234 803 123 4567"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">WhatsApp Number</label>
                <input
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="+234 803 123 4567"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Facebook</label>
                <input
                  type="text"
                  value={formData.facebook}
                  onChange={(e) => setFormData({...formData, facebook: e.target.value})}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Facebook username or ID"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Instagram</label>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Instagram username"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingId(null); setFormData(emptyContact); }}
                  className="flex-1 bg-secondary text-foreground rounded-xl py-3 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={contactMutation.isPending}
                  className="flex-1 bg-primary text-primary-foreground rounded-xl py-3 font-semibold shadow-deep hover:bg-primary-glow transition disabled:opacity-50"
                >
                  {contactMutation.isPending ? "Saving..." : editingId ? "Update Contact" : "Add Contact"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-card border border-border rounded-3xl shadow-deep w-full max-w-sm">
            <div className="p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive grid place-items-center mx-auto mb-4">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">Delete Contact</h3>
              <p className="text-sm text-muted-foreground mb-6">Are you sure you want to delete this contact? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTargetId(null)}
                  className="flex-1 bg-secondary text-foreground rounded-xl py-3 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteMutation.mutate(deleteTargetId)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 bg-destructive text-destructive-foreground rounded-xl py-3 font-semibold shadow-deep hover:bg-destructive/90 transition disabled:opacity-50"
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
