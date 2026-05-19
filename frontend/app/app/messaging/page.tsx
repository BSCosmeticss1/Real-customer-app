"use client";

import { Smartphone, MessageCircle, Camera, Bold, Italic, Link as LinkIcon, Send, Calendar, Square, Monitor } from "lucide-react";

const templates = [
  { tag: "WhatsApp", title: "Summer Sale Launch", preview: "Hi {{Firs..." },
  { tag: "Facebook", title: "Meeting Reminder", preview: "Hello {{Firs..." },
  { tag: "Instagram", title: "New Post Drop", preview: "Hey {{Firs..." },
  { tag: "Multi-Platform", title: "Service Outage", preview: "Important. We'r..." },
];

export default function Messaging() {
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
            <div key={t.title} className="border-l-2 border-primary pl-4">
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
            ].map(({ name, icon: I, active }) => (
              <button key={name} className={`rounded-2xl py-6 flex flex-col items-center gap-2 transition ${active ? "bg-primary text-primary-foreground shadow-deep" : "bg-secondary text-muted-foreground hover:bg-secondary/70"}`}>
                <I className="h-6 w-6" />
                <span className="font-semibold text-sm">{name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <div className="label-eyebrow">Message Content</div>
            <div className="flex gap-2 text-xs font-semibold">
              {[{l:"BOLD", I:Bold},{l:"ITALIC", I:Italic},{l:"LINK", I:LinkIcon}].map(({l,I}) => (
                <button key={l} className="px-3 py-1.5 rounded-md bg-secondary text-primary flex items-center gap-1.5"><I className="h-3 w-3" />{l}</button>
              ))}
            </div>
          </div>
          <div className="bg-secondary/50 rounded-2xl p-5 text-sm leading-relaxed text-foreground space-y-3">
            <p>Hi <span className="bg-accent/60 px-1.5 py-0.5 rounded font-mono text-xs">{`{{FirstName}}`}</span>,</p>
            <p>The long-awaited Summer Collection is finally here!</p>
            <p>As a loyal customer, we're giving you exclusive early access before the general public. Use the code <span className="bg-accent/60 px-1.5 py-0.5 rounded font-mono text-xs">{`{{PromoCode}}`}</span> at checkout to get 20% off your entire order.</p>
            <p>Shop the drop now: <span className="text-primary underline">https://architect.shop/summer-drop</span></p>
            <div className="text-right text-xs text-muted-foreground pt-2">242 / 1024 chars</div>
          </div>
        </div>

        <div className="mt-6">
          <div className="label-eyebrow mb-3">Personalization Tags</div>
          <div className="flex flex-wrap gap-2">
            {["+ First Name","+ Last Name","+ Order ID","+ Promo Code","+ Custom Field"].map(t => (
              <button key={t} className="px-4 py-2 rounded-full bg-card border border-border text-sm hover:border-primary transition">{t}</button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <button className="bg-primary text-primary-foreground rounded-xl py-4 font-semibold flex items-center justify-center gap-2 shadow-deep hover:bg-primary-glow transition"><Send className="h-4 w-4" /> Send Now</button>
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
                <div className="font-semibold text-sm">Architect Brand</div>
                <div className="text-[10px] opacity-80">online</div>
              </div>
            </div>
            <div className="p-4 min-h-[380px]">
              <div className="bg-[hsl(40,40%,94%)] rounded-2xl p-3 text-xs space-y-2 shadow-sm">
                <p>Hi Alex,</p>
                <p>The long-awaited Summer Collection is finally here!</p>
                <p>As a loyal customer, we're giving you exclusive early access. Use code <strong>SUMMER24</strong> at checkout for 20% off.</p>
                <p className="text-[hsl(155,40%,30%)] underline">https://architect.shop/summer-drop</p>
                <div className="text-right text-[10px] text-muted-foreground">12:45 PM</div>
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
          {[Smartphone, Square, Monitor].map((I, i) => (
            <button key={i} className={`h-11 w-11 rounded-xl grid place-items-center ${i===0 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}><I className="h-4 w-4" /></button>
          ))}
        </div>
      </aside>
    </div>
  );
}