"use client";

import { Bold, Italic, Link as LinkIcon, Send, Users, X, Check, Mail, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function EmailPage() {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [emailContactIds, setEmailContactIds] = useState<string[]>([]);
  const [emails, setEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");
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

  const sendEmailMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/messages/email/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject,
          content,
          contacts: emailContactIds,
          emails,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Email Sent: ${data.data.sent}, Failed: ${data.data.failed}`);
      setEmailContactIds([]);
      setEmails([]);
      setSubject("");
      setContent("");
      setEmailInput("");
      queryClient.invalidateQueries({ queryKey: ["emailLogs"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to send email");
    },
  });

  const { data: emailLogsData, isLoading: emailLogsLoading } = useQuery({
    queryKey: ["emailLogs"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/messages/email/logs?limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data;
    },
  });

  const addEmails = () => {
    const parts = emailInput
      .split(/[\n,;]+/)
      .map((n) => n.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    setEmails((prev) => Array.from(new Set([...prev, ...parts])));
    setEmailInput("");
  };

  const removeEmail = (addr: string) => {
    setEmails((prev) => prev.filter((e) => e !== addr));
  };

  const toggleContact = (id: string) => {
    setEmailContactIds((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const contacts = contactsData?.data || [];
  const emailSelectedDetails = contacts.filter((c: any) => emailContactIds.includes(c.id)) || [];
  const emailRecipientCount = emailContactIds.length + emails.length;

  const getInitials = (name: string) => {
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const toggleAllContacts = () => {
    if (contacts.length > 0) {
      if (emailContactIds.length === contacts.length) {
        setEmailContactIds([]);
      } else {
        setEmailContactIds(contacts.map((c: any) => c.id));
      }
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      <section className="col-span-12 lg:col-span-7 bg-card rounded-2xl p-8 shadow-card">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary grid place-items-center">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-semibold">Send Email</h1>
            <p className="text-muted-foreground text-sm">Reach contacts or any external email addresses instantly via Real customer App.</p>
          </div>
        </div>

        {/* External emails */}
        <div className="mt-8">
          <div className="label-eyebrow mb-3">External Email Addresses</div>
          <div className="flex gap-2">
            <input
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addEmails(); } }}
              placeholder="e.g. john@example.com, jane@example.com"
              className="flex-1 bg-secondary/50 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              onClick={addEmails}
              className="px-4 py-3 rounded-xl bg-secondary text-primary font-semibold text-sm hover:bg-secondary/70 transition flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Separate multiple addresses with commas, semicolons, or new lines.</p>

          {emails.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {emails.map((addr) => (
                <div key={addr} className="flex items-center gap-2 bg-secondary px-3 py-2 rounded-xl text-sm">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  <span>{addr}</span>
                  <button onClick={() => removeEmail(addr)} className="text-muted-foreground hover:text-destructive">
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
            <div className="label-eyebrow">From Contacts ({emailContactIds.length})</div>
            <button
              onClick={() => setShowContactSelector(true)}
              className="text-primary text-sm font-semibold hover:underline"
            >
              {emailContactIds.length > 0 ? "Change Selection" : "Select Contacts"}
            </button>
          </div>
          {emailContactIds.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {emailSelectedDetails.map((c: any) => (
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
              No contacts selected. Add external emails above or pick from your contacts.
            </div>
          )}
        </div>

        {/* Subject */}
        <div className="mt-8">
          <div className="label-eyebrow mb-3">Subject</div>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Your email subject"
            className="w-full bg-secondary/50 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Content */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="label-eyebrow">Message Content</div>
            <div className="flex gap-2 text-xs font-semibold">
              {[{l:"BOLD", I:Bold},{l:"ITALIC", I:Italic},{l:"LINK", I:LinkIcon}].map(({l, I}) => (
                <button key={l} className="px-3 py-1.5 rounded-md bg-secondary text-primary flex items-center gap-1.5"><I className="h-3 w-3" />{l}</button>
              ))}
            </div>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your email message here..."
            className="w-full bg-secondary/50 rounded-2xl p-5 text-sm leading-relaxed text-foreground min-h-[180px] focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => sendEmailMutation.mutate()}
            disabled={sendEmailMutation.isPending || emailRecipientCount === 0 || !subject || !content}
            className="bg-primary text-primary-foreground rounded-xl px-8 py-4 font-semibold flex items-center justify-center gap-2 shadow-deep hover:bg-primary-glow transition disabled:opacity-50"
          >
            {sendEmailMutation.isPending ? "Sending..." : <><Send className="h-4 w-4" /> Send Email ({emailRecipientCount})</>}
          </button>
        </div>
      </section>

      {/* Email logs */}
      <aside className="col-span-12 lg:col-span-5">
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <h3 className="font-display text-xl font-semibold mb-4">Recent Emails</h3>
          {emailLogsLoading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
          ) : (emailLogsData?.data?.length ?? 0) === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">No emails sent yet.</div>
          ) : (
            <div className="divide-y divide-border max-h-[520px] overflow-y-auto">
              {emailLogsData.data.map((log: any) => (
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
                  checked={contacts.length > 0 && emailContactIds.length === contacts.length}
                  onChange={toggleAllContacts}
                />
                <span className="text-sm font-medium">Select All ({contacts.length})</span>
              </label>
              <span className="text-sm text-muted-foreground">{emailContactIds.length} selected</span>
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
                    const isSelected = emailContactIds.includes(c.id);
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
                            {[c.email ? "Email" : null, c.whatsapp ? "WhatsApp" : null, c.facebook ? "Facebook" : null, c.instagram ? "Instagram" : null].filter(Boolean).join(" • ")}
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
                Done ({emailContactIds.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
