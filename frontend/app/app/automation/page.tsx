"use client";

import { Plus, X, Trash2, Clock, Calendar, RefreshCw, Send, Users, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

interface ScheduledMessage {
  id: string;
  platform: string;
  content: string;
  scheduledAt: string;
  recurrence: string;
  status: string;
  contacts: { id: string; name: string }[];
  createdAt: string;
}

interface ContactRow {
  id: string;
  name: string;
  whatsapp?: string;
  phone?: string;
}

const emptyForm = {
  platform: "whatsapp",
  content: "",
  contactIds: [] as string[],
  scheduledAt: "",
  recurrence: "none",
};

const PLATFORMS = [
  { value: "whatsapp", label: "WhatsApp", icon: MessageSquare },
  { value: "sms", label: "SMS", icon: Send },
];

const RECURRENCE_OPTIONS = [
  { value: "none", label: "One-time" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export default function AutomationPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [showContactSelector, setShowContactSelector] = useState(false);

  const { data: scheduledData, isLoading: scheduledLoading } = useQuery({
    queryKey: ["scheduledMessages"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/messages/scheduled`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data;
    },
  });

  const { data: contactsData, isLoading: contactsLoading } = useQuery({
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

  const scheduleMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/messages/schedule`, {
        method: "POST",
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
      toast.success(editingId ? "Schedule updated successfully!" : "Message scheduled successfully!");
      setDialogOpen(false);
      setEditingId(null);
      setFormData(emptyForm);
      setShowContactSelector(false);
      queryClient.invalidateQueries({ queryKey: ["scheduledMessages"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to schedule message"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/messages/scheduled/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data;
    },
    onSuccess: () => {
      toast.success("Scheduled message cancelled successfully!");
      setDeleteTargetId(null);
      queryClient.invalidateQueries({ queryKey: ["scheduledMessages"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to cancel schedule"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content || !formData.scheduledAt || formData.contactIds.length === 0) {
      toast.error("Message, schedule time, and at least one contact are required");
      return;
    }
    scheduleMutation.mutate();
  };

  const startEdit = (msg: ScheduledMessage) => {
    setEditingId(msg.id);
    setFormData({
      platform: msg.platform,
      content: msg.content,
      contactIds: (msg.contacts || []).map((c) => c.id),
      scheduledAt: new Date(msg.scheduledAt).toISOString().slice(0, 16),
      recurrence: msg.recurrence,
    });
    setDialogOpen(true);
  };

  const toggleContact = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      contactIds: prev.contactIds.includes(id) ? prev.contactIds.filter((cid) => cid !== id) : [...prev.contactIds, id],
    }));
  };

  const scheduledMessages = scheduledData?.data || [];
  const contactsList = contactsData?.data || [];

  const getPlatformLabel = (platform: string) => {
    const found = PLATFORMS.find((p) => p.value === platform);
    return found ? found.label : platform;
  };

  const getRecurrenceLabel = (recurrence: string) => {
    const found = RECURRENCE_OPTIONS.find((r) => r.value === recurrence);
    return found ? found.label : recurrence;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-warning text-warning-foreground";
      case "sent": return "bg-success text-success-foreground";
      case "failed": return "bg-destructive text-destructive-foreground";
      case "cancelled": return "bg-muted text-muted-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  if (scheduledLoading || contactsLoading) {
    return (
      <div className="space-y-8">
        <div className="h-8 bg-secondary rounded w-64" />
        <div className="h-96 bg-secondary rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <div className="label-eyebrow text-primary">Command Center</div>
          <h1 className="font-display text-5xl font-semibold mt-2">Automation Engine</h1>
          <p className="text-muted-foreground mt-2">Schedule and automate your WhatsApp and SMS messages.</p>
        </div>
        <Button
          onClick={() => { setEditingId(null); setFormData(emptyForm); setShowContactSelector(false); setDialogOpen(true); }}
          className="rounded-xl px-6 h-12 font-medium shadow-deep bg-primary hover:bg-primary-glow"
        >
          <Plus className="h-4 w-4 mr-2" /> New Schedule
        </Button>
      </div>

      {/* Scheduled Messages List */}
      <div className="space-y-4">
        {scheduledMessages.length === 0 ? (
          <Card className="rounded-2xl shadow-card border-none bg-card">
            <CardContent className="p-8 text-center text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg font-medium">No scheduled messages yet</p>
              <p className="text-sm mt-1">Click "New Schedule" to create your first automated message.</p>
            </CardContent>
          </Card>
        ) : (
          scheduledMessages.map((msg: ScheduledMessage) => (
            <Card key={msg.id} className="rounded-2xl shadow-card border-none bg-card">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-secondary grid place-items-center shrink-0">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-foreground">{getPlatformLabel(msg.platform)}</span>
                        <Badge className={`rounded-lg font-normal text-[10px] sm:text-xs ${getStatusColor(msg.status)}`}>
                          {msg.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{msg.content}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(msg.scheduledAt), "MMM dd, yyyy 'at' hh:mm a")}
                        </span>
                        <span className="flex items-center gap-1">
                          <RefreshCw className="h-3 w-3" />
                          {getRecurrenceLabel(msg.recurrence)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {msg.contacts?.length || 0} recipients
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {msg.status === "pending" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-lg"
                        onClick={() => startEdit(msg)}
                        title="Edit"
                      >
                        <Send className="h-4 w-4 text-primary" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-lg"
                      onClick={() => setDeleteTargetId(msg.id)}
                      title="Cancel"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Schedule Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-card border border-border rounded-3xl shadow-deep w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
              <h3 className="font-display text-2xl font-semibold">{editingId ? "Edit Schedule" : "New Scheduled Message"}</h3>
              <button onClick={() => { setDialogOpen(false); setEditingId(null); setFormData(emptyForm); setShowContactSelector(false); }}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Platform *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {PLATFORMS.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFormData({ ...formData, platform: value })}
                        className={`rounded-xl py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2 transition ${
                          formData.platform === value ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/70"
                        }`}
                      >
                        <Icon className="h-4 w-4" /> {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Recipients *</label>
                  <button
                    type="button"
                    onClick={() => setShowContactSelector(!showContactSelector)}
                    className="w-full bg-secondary rounded-xl px-4 py-3 text-left text-sm font-medium flex items-center justify-between"
                  >
                    <span>
                      {formData.contactIds.length === 0
                        ? "Select contacts"
                        : `${formData.contactIds.length} contact(s) selected`}
                    </span>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </button>
                  {showContactSelector && (
                    <div className="mt-3 bg-secondary/50 rounded-xl p-4 max-h-[200px] overflow-y-auto">
                      {contactsList.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No contacts found. Add contacts first.</p>
                      ) : (
                        <div className="space-y-2">
                          {contactsList.map((contact: ContactRow) => (
                            <label
                              key={contact.id}
                              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                                formData.contactIds.includes(contact.id) ? "bg-primary/10" : "hover:bg-secondary"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={formData.contactIds.includes(contact.id)}
                                onChange={() => toggleContact(contact.id)}
                                className="accent-primary h-4 w-4"
                              />
                              <div className="flex-1">
                                <div className="text-sm font-medium text-foreground">{contact.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {contact.whatsapp || contact.phone || "No phone"}
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Message *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    placeholder="Type your message here..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Schedule Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Recurrence</label>
                  <select
                    value={formData.recurrence}
                    onChange={(e) => setFormData({ ...formData, recurrence: e.target.value })}
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {RECURRENCE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setDialogOpen(false); setEditingId(null); setFormData(emptyForm); setShowContactSelector(false); }}
                  className="flex-1 bg-secondary text-foreground rounded-xl py-3 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scheduleMutation.isPending}
                  className="flex-1 bg-primary text-primary-foreground rounded-xl py-3 font-semibold shadow-deep hover:bg-primary-glow transition disabled:opacity-50"
                >
                  {scheduleMutation.isPending ? "Saving..." : editingId ? "Update Schedule" : "Schedule Message"}
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
              <h3 className="font-display text-xl font-semibold mb-2">Cancel Schedule</h3>
              <p className="text-sm text-muted-foreground mb-6">Are you sure you want to cancel this scheduled message? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTargetId(null)}
                  className="flex-1 bg-secondary text-foreground rounded-xl py-3 font-semibold"
                >
                  Keep
                </button>
                <button
                  onClick={() => deleteMutation.mutate(deleteTargetId)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 bg-destructive text-destructive-foreground rounded-xl py-3 font-semibold shadow-deep hover:bg-destructive/90 transition disabled:opacity-50"
                >
                  {deleteMutation.isPending ? "Cancelling..." : "Cancel Schedule"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
