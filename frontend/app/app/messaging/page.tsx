"use client";

import { Smartphone, MessageCircle, Camera, Bold, Italic, Link as LinkIcon, Send, Calendar, Square, Monitor, Users, X, Check } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

const templates = [
  { tag: "WhatsApp", title: "Summer Sale Launch", preview: "Hi {{FirstName}}," },
  { tag: "Facebook", title: "Meeting Reminder", preview: "Hello {{FirstName}}," },
  { tag: "Instagram", title: "New Post Drop", preview: "Hey {{FirstName}}," },
  { tag: "Multi-Platform", title: "Service Outage", preview: "Important. We're sorry," },
];

export default function Messaging() {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [messageContent, setMessageContent] = useState("Hi {{FirstName}},\n\nThe long-awaited Summer Collection is finally here!\n\nAs a loyal customer, we're giving you exclusive early access before the general public.\n\nShop the drop now: https://example.com/sale");
  const [showContactSelector, setShowContactSelector] = useState(false);
  const queryClient = useQueryClient();

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

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/messages/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          platform: "whatsapp",
          content: messageContent,
          contacts: selectedContacts,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Messages sent! Sent: ${data.data.sent}, Failed: ${data.data.failed}`);
      setSelectedContacts([]);
      queryClient.invalidateQueries({ queryKey: ["messageLogs"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to send messages");
    },
  });

  const toggleContact = (id: string) => {
    setSelectedContacts(prev => 
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const contacts = contactsData?.data || [];
  const toggleAllContacts = () => {
    if (contacts.length > 0) {
      if (selectedContacts.length === contacts.length) {
        setSelectedContacts([]);
      } else {
        setSelectedContacts(contacts.map((c: any) => c.id));
      }
    }
  };

  const selectedContactsDetails = contacts.filter((c: any) => selectedContacts.includes(c.id)) || [];

  const getInitials = (name: string) => {
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const hasPlatform = (contact: any, platform: string) => {
    const p = platform.toLowerCase();
    return (p === "whatsapp" && contact.whatsapp) || 
           (p === "facebook" && contact.facebook) || 
           (p === "instagram" && contact.instagram);
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Templates rail */}
      <aside className="col-span-12 lg:col-span-2 space-y-5">
        <div>
          <h3 className="font-display text-xl font-semibold mb-3">Templates</h3>
          <div className="flex gap-2 text-xs font-semibold">
            <span className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground">ALL</span>
            <span className="px-3 py-1.5 rounded-full text-muted-foreground">RECENT</span>
          </div>
        </div>
        <div className="space-y-4">
          {templates.map((t) => (
            <div 
              key={t.title} 
              className="border-l-2 border-primary pl-4 cursor-pointer hover:pl-5 transition-all"
              onClick={() => setMessageContent(t.preview + "\n\nWrite your message here...")}
            >
              <div className="label-eyebrow mb-1">{t.tag}</div>
              <div className="font-semibold text-foreground">{t.title}</div>
              <div className="text-xs text-muted-foreground mt-1 truncate">{t.preview}</div>
            </div>
          ))}
        </div>
      </aside>

      {/* Composer */}
      <section className="col-span-12 lg:col-span-6 bg-card rounded-2xl p-8 shadow-card">
        <h1 className="font-display text-4xl font-semibold">Compose Bulk Message</h1>
        <p className="text-muted-foreground mt-2">Define your campaign and reach thousands effortlessly.</p>

        <div className="mt-8">
          <div className="label-eyebrow mb-3">Target Platforms</div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: "WhatsApp", icon: MessageCircle, active: true },
              { name: "Messenger", icon: MessageCircle, active: false },
              { name: "Instagram", icon: Camera, active: false },
            ].map(({ name, icon: Icon, active }) => (
              <button 
                key={name} 
                className={`rounded-xl py-6 flex flex-col items-center gap-2 transition ${active ? "bg-primary text-primary-foreground shadow-deep" : "bg-secondary text-muted-foreground hover:bg-secondary/70"}`}
              >
                <Icon className="h-6 w-6" />
                <span className="font-semibold text-sm">{name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <div className="label-eyebrow">Selected Contacts ({selectedContacts.length})</div>
            <button 
              onClick={() => setShowContactSelector(true)}
              className="text-primary text-sm font-semibold hover:underline"
            >
              {selectedContacts.length > 0 ? "Change Selection" : "Select Contacts"}
            </button>
          </div>
          {selectedContacts.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedContactsDetails.map((c: any) => (
                <div key={c.id} className="flex items-center gap-2 bg-secondary px-3 py-2 rounded-xl text-sm">
                  <span>{c.name}</span>
                  <button 
                    onClick={() => toggleContact(c.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-secondary/50 rounded-xl p-4 text-center text-muted-foreground">
              No contacts selected. Click "Select Contacts" to choose who to message.
            </div>
          )}
        </div>

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
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            className="w-full bg-secondary/50 rounded-2xl p-5 text-sm leading-relaxed text-foreground min-h-[200px] focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <div className="text-right text-xs text-muted-foreground pt-2">{messageContent.length} chars</div>
        </div>

        <div className="mt-6">
          <div className="label-eyebrow mb-3">Personalization Tags</div>
          <div className="flex flex-wrap gap-2">
            {["+ FirstName","+ FullName","+ Company","+ Phone","+ Email","+ Date"].map(tag => (
              <button 
                key={tag} 
                onClick={() => {
                  const actualTag = tag.replace("+ ", "").replace(" ", "");
                  setMessageContent(prev => prev + ` {{${actualTag}}}`);
                }}
                className="px-4 py-2 rounded-full bg-card border border-border text-sm hover:border-primary transition"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <button 
            onClick={() => sendMessageMutation.mutate()}
            disabled={sendMessageMutation.isPending || selectedContacts.length === 0}
            className="bg-primary text-primary-foreground rounded-xl py-4 font-semibold flex items-center justify-center gap-2 shadow-deep hover:bg-primary-glow transition disabled:opacity-50"
          >
            {sendMessageMutation.isPending ? "Sending..." : <><Send className="h-4 w-4" /> Send Now</>}
          </button>
          <button className="bg-secondary text-primary rounded-xl py-4 font-semibold flex items-center justify-center gap-2 hover:bg-secondary/70 transition"><Calendar className="h-4 w-4" /> Schedule</button>
        </div>
      </section>

      {/* Live preview */}
      <aside className="col-span-12 lg:col-span-4">
        <div className="text-center label-eyebrow mb-4">Live Mobile Preview</div>
        <div className="mx-auto w-[280px] rounded-[36px] bg-foreground p-3 shadow-deep">
          <div className="rounded-[28px] overflow-hidden bg-[hsl(150,30%,90%)]">
            <div className="bg-[hsl(155,40%,30%)] text-primary-foreground px-4 py-3 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-card/30" />
              <div>
                <div className="font-semibold text-sm">Your Business</div>
                <div className="text-[10px] opacity-80">online</div>
              </div>
            </div>
            <div className="p-4 min-h-[380px]">
              <div className="bg-[hsl(40,40%,94%)] rounded-2xl p-3 text-xs space-y-2 shadow-sm">
                {messageContent.split("\n").map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
                <div className="text-right text-[10px] text-muted-foreground">Just now</div>
              </div>
            </div>
            <div className="px-3 pb-3">
              <div className="bg-card rounded-full flex items-center gap-2 pl-4 pr-1 py-1">
                <span className="text-xs text-muted-foreground flex-1">Type a message</span>
                <button className="h-8 w-8 rounded-full bg-[hsl(155,40%,30%)] grid place-items-center text-primary-foreground">🎤</button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-5">
          {[Smartphone, Square, Monitor].map((Icon, i) => (
            <button key={i} className={`h-11 w-11 rounded-xl grid place-items-center ${i===0 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}><Icon className="h-4 w-4" /></button>
          ))}
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
                  checked={contacts.length > 0 && selectedContacts.length === contacts.length}
                  onChange={toggleAllContacts}
                />
                <span className="text-sm font-medium">Select All ({contacts.length})</span>
              </label>
              <span className="text-sm text-muted-foreground">{selectedContacts.length} selected</span>
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
                  {contacts.map((c: any) => (
                    <label 
                      key={c.id} 
                      className={`flex items-center gap-4 p-4 hover:bg-secondary/30 cursor-pointer transition ${selectedContacts.includes(c.id) ? "bg-secondary/50" : ""}`}
                    >
                      <div className="flex-shrink-0">
                        <input 
                          type="checkbox" 
                          className="accent-primary h-5 w-5"
                          checked={selectedContacts.includes(c.id)}
                          onChange={() => toggleContact(c.id)}
                        />
                      </div>
                      <div className="flex-shrink-0 h-12 w-12 rounded-full bg-secondary text-primary grid place-items-center text-sm font-semibold">
                        {getInitials(c.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground">{c.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {[c.whatsapp ? "WhatsApp" : null, c.facebook ? "Facebook" : null, c.instagram ? "Instagram" : null].filter(Boolean).join(" • ")}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {["WhatsApp", "Facebook", "Instagram"].map((platform) => (
                          <div 
                            key={platform}
                            className={`h-8 w-8 rounded-lg grid place-items-center ${hasPlatform(c, platform) ? "bg-success/10 text-success" : "bg-secondary/50 text-muted-foreground"}`}
                          >
                            {hasPlatform(c, platform) ? <Check className="h-4 w-4" /> : null}
                          </div>
                        ))}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-border flex gap-3 justify-end sticky bottom-0 bg-card">
              <button 
                type="button"
                onClick={() => setShowContactSelector(false)}
                className="px-6 py-3 rounded-xl border border-border text-sm font-semibold hover:bg-secondary transition"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={() => setShowContactSelector(false)}
                className="px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-deep hover:bg-primary-glow transition"
              >
                Done ({selectedContacts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
