"use client";

import { Bold, Italic, Link as LinkIcon, Send, Users, X, Check, Phone, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function SMSPage() {
  const [smsContent, setSmsContent] = useState("");
  const [smsContactIds, setSmsContactIds] = useState<string[]>([]);
  const [smsNumbers, setSmsNumbers] = useState<string[]>([]);
  const [smsNumberInput, setSmsNumberInput] = useState("");
  const [showContactSelector, setShowContactSelector] = useState(false);

  const queryClient = useQueryClient();

  const { data: contactsData, isLoading: contactsLoading } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/contacts?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data;
    },
  });

  const sendSMSMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/messages/sms/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: smsContent,
          contacts: smsContactIds,
          phoneNumbers: smsNumbers,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data;
    },
    onSuccess: (data) => {
      toast.success(`SMS Sent: ${data.data.sent}, Failed: ${data.data.failed}`);
      setSmsContactIds([]);
      setSmsNumbers([]);
      setSmsContent("");
      setSmsNumberInput("");
      queryClient.invalidateQueries({ queryKey: ["smsLogs"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to send SMS");
    },
  });

  const { data: smsLogsData, isLoading: smsLogsLoading } = useQuery({
    queryKey: ["smsLogs"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/messages/sms/logs?limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data;
    },
  });

  const addSmsNumbers = () => {
    const parts = smsNumberInput
      .split(/[\n,;]+/)
      .map((n) => n.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    setSmsNumbers((prev) => Array.from(new Set([...prev, ...parts])));
    setSmsNumberInput("");
  };

  const removeSmsNumber = (num: string) => {
    setSmsNumbers((prev) => prev.filter((n) => n !== num));
  };

  const toggleContact = (id: string) => {
    setSmsContactIds((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const contacts = contactsData?.data || [];
  const smsSelectedDetails = contacts.filter((c: any) => smsContactIds.includes(c.id)) || [];
  const smsRecipientCount = smsContactIds.length + smsNumbers.length;

  const getInitials = (name: string) => {
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const toggleAllContacts = () => {
    if (contacts.length > 0) {
      if (smsContactIds.length === contacts.length) {
        setSmsContactIds([]);
      } else {
        setSmsContactIds(contacts.map((c: any) => c.id));
      }
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      <section className="col-span-12 lg:col-span-7 bg-card rounded-2xl p-8 shadow-card">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary grid place-items-center">
            <Phone className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-semibold">Send SMS</h1>
            <p className="text-muted-foreground text-sm">Reach contacts or any external phone numbers instantly via Real customer App.</p>
          </div>
        </div>

        {/* External numbers */}
        <div className="mt-8">
          <div className="label-eyebrow mb-3">External Phone Numbers</div>
          <div className="flex gap-2">
            <input
              value={smsNumberInput}
              onChange={(e) => setSmsNumberInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSmsNumbers(); } }}
              placeholder="e.g. 08012345678, +2348012345679"
              className="flex-1 bg-secondary/50 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              onClick={addSmsNumbers}
              className="px-4 py-3 rounded-xl bg-secondary text-primary font-semibold text-sm hover:bg-secondary/70 transition flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Separate multiple numbers with commas, semicolons, or new lines. Numbers are auto-formatted to international format.</p>

          {smsNumbers.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {smsNumbers.map((num) => (
                <div key={num} className="flex items-center gap-2 bg-secondary px-3 py-2 rounded-xl text-sm">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  <span>{num}</span>
                  <button onClick={() => removeSmsNumber(num)} className="text-muted-foreground hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* From contacts */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <div className="label-eyebrow">From Contacts ({smsContactIds.length})</div>
            <button
              onClick={() => setShowContactSelector(true)}
              className="text-primary text-sm font-semibold hover:underline"
            >
              {smsContactIds.length > 0 ? "Change Selection" : "Select Contacts"}
            </button>
          </div>
          {smsContactIds.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {smsSelectedDetails.map((c: any) => (
                <div key={c.id} className="flex items-center gap-2 bg-secondary px-3 py-2 rounded-xl text-sm">
                  <span>{c.name}</span>
                  <button onClick={() => toggleContact(c.id)} className="text-muted-foreground hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-secondary/50 rounded-xl p-4 text-center text-muted-foreground">
              No contacts selected. Add external numbers above or pick from your contacts.
            </div>
          )}
        </div>

        {/* Content */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <div className="label-eyebrow">Message Content</div>
            <div className="flex gap-2 text-xs font-semibold">
              {[{l:"BOLD", I:Bold},{l:"ITALIC", I:Italic},{l:"LINK", I:LinkIcon}].map(({l, I}) => (
                <button key={l} className="px-3 py-1.5 rounded-md bg-secondary text-primary flex items-center gap-1.5"><I className="h-3 w-3" />{l}</button>
              ))}
            </div>
          </div>
          <textarea
            value={smsContent}
            onChange={(e) => setSmsContent(e.target.value)}
            placeholder="Type your SMS message here..."
            className="w-full bg-secondary/50 rounded-2xl p-5 text-sm leading-relaxed text-foreground min-h-[160px] focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <div className="text-right text-xs text-muted-foreground pt-2">
            {smsContent.length} chars {smsContent.length > 160 && <span className="text-amber-500">· {Math.ceil(smsContent.length / 160)} SMS parts</span>}
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => sendSMSMutation.mutate()}
            disabled={sendSMSMutation.isPending || smsRecipientCount === 0 || !smsContent}
            className="bg-primary text-primary-foreground rounded-xl px-8 py-4 font-semibold flex items-center justify-center gap-2 shadow-deep hover:bg-primary-glow transition disabled:opacity-50"
          >
            {sendSMSMutation.isPending ? "Sending..." : <><Send className="h-4 w-4" /> Send SMS ({smsRecipientCount})</>}
          </button>
        </div>
      </section>

      {/* SMS logs */}
      <aside className="col-span-12 lg:col-span-5">
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <h3 className="font-display text-xl font-semibold mb-4">Recent SMS</h3>
          {smsLogsLoading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
          ) : (smsLogsData?.data?.length ?? 0) === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">No SMS sent yet.</div>
          ) : (
            <div className="divide-y divide-border max-h-[520px] overflow-y-auto">
              {smsLogsData.data.map((log: any) => (
                <div key={log.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium text-foreground text-sm truncate">{log.contactName || "Unknown"}</div>
                    <div className="text-xs text-muted-foreground truncate">{log.content}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${log.status === "sent" ? "bg-success/10 text-success" : log.status === "failed" ? "bg-destructive/10 text-destructive" : "bg-secondary text-muted-foreground"}`}>
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Contact Selector Modal */}
      {showContactSelector && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-card border border-border rounded-3xl shadow-deep w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
              <h3 className="font-display text-2xl font-semibold">Select Contacts</h3>
              <button onClick={() => setShowContactSelector(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 border-b border-border flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-primary h-4 w-4"
                  checked={contacts.length > 0 && smsContactIds.length === contacts.length}
                  onChange={toggleAllContacts}
                />
                <span className="text-sm font-medium">Select All ({contacts.length})</span>
              </label>
              <span className="text-sm text-muted-foreground">{smsContactIds.length} selected</span>
            </div>
            <div className="overflow-y-auto max-h-[60vh]">
              {contactsLoading ? (
                <div className="p-12 text-center text-muted-foreground">
                  <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  Loading contacts...
                </div>
              ) : contacts.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>No contacts found. Add some contacts first!</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {contacts.map((c: any) => {
                    const isSelected = smsContactIds.includes(c.id);
                    return (
                      <label
                        key={c.id}
                        className={`flex items-center gap-4 p-4 hover:bg-secondary/30 cursor-pointer transition ${isSelected ? "bg-secondary/50" : ""}`}
                      >
                        <div className="flex-shrink-0">
                          <input
                            type="checkbox"
                            className="accent-primary h-5 w-5"
                            checked={isSelected}
                            onChange={() => toggleContact(c.id)}
                          />
                        </div>
                        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-secondary text-primary grid place-items-center text-sm font-semibold">
                          {getInitials(c.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-foreground">{c.name}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {[c.phone ? "SMS" : null, c.whatsapp ? "WhatsApp" : null, c.facebook ? "Facebook" : null, c.instagram ? "Instagram" : null].filter(Boolean).join(" • ")}
                          </div>
                        </div>
                        <div className="h-8 w-8 rounded-lg grid place-items-center bg-secondary/50 text-muted-foreground">
                          {isSelected ? <Check className="h-4 w-4 text-success" /> : null}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-border flex gap-3 justify-end sticky bottom-0 bg-card">
              <button
                type="button"
                onClick={() => setShowContactSelector(false)}
                className="px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-deep hover:bg-primary-glow transition"
              >
                Done ({smsContactIds.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
