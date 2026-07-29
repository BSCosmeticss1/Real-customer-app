"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Mail, Phone, MapPin, Send } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "David John",
    email: "",
    company: "",
    phone: "+234",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-8">
        <div className="max-w-lg w-full text-center">
          <div className="h-20 w-20 rounded-full bg-success-soft flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <h1 className="font-display text-4xl font-semibold">Message Sent!</h1>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            Thank you, {formData.name.split(" ")[0]}. We&apos;ve received your message and our team will get back to you within 24 hours.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/" className="bg-primary text-primary-foreground px-6 py-3.5 rounded-xl font-semibold">Back to Home</Link>
            <Link href="/demo-request" className="bg-card border border-border px-6 py-3.5 rounded-xl font-semibold hover:border-primary transition">Request a Demo</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
        <Link href="/" className="font-display text-xl font-semibold">My Real Customer App</Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/how-it-works" className="hover:text-primary transition">How it works</Link>
          <Link href="/enterprise" className="hover:text-primary transition">Enterprise</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold">Login</Link>
          <Link href="/signup" className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold shadow-deep hover:bg-primary-glow transition">Get Started</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Info */}
          <div className="lg:sticky lg:top-12">
            <div className="label-eyebrow">Get in Touch</div>
            <h1 className="font-display text-5xl sm:text-6xl font-semibold mt-4 leading-tight">
              Contact <span className="text-primary">Us</span>
            </h1>
            <p className="text-muted-foreground mt-6 text-lg leading-relaxed max-w-md">
              Have a question or want to discuss how My Real Customer App can help your business? Fill out the form and our team will be in touch shortly.
            </p>

            <div className="mt-12 space-y-6">
              {[
                { icon: Mail, title: "Email Us", desc: "support@myrealcust.com", link: "mailto:support@myrealcust.com" },
                { icon: Phone, title: "Call Us", desc: "+234 801 234 5678", link: "tel:+2348012345678" },
                { icon: MapPin, title: "Visit Us", desc: "Lagos, Nigeria" },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold">{item.title}</h3>
                    {item.link ? (
                      <a href={item.link} className="text-muted-foreground text-sm mt-1 hover:text-primary transition">{item.desc}</a>
                    ) : (
                      <p className="text-muted-foreground text-sm mt-1">{item.desc}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="lg:pl-8">
            <div className="bg-card rounded-3xl p-8 md:p-10 shadow-deep border border-border">
              <div className="mb-8">
                <h2 className="font-display text-2xl font-semibold">Send us a message</h2>
                <p className="text-muted-foreground mt-2">All fields marked with * are required.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                      placeholder="David John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Work Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                      placeholder="david@company.com"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Company Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                      placeholder="Acme Inc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                      placeholder="+234 801 234 5678"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Subject *</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Message *</label>
                  <textarea
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none"
                    placeholder="Tell us about your project or inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-deep hover:bg-primary-glow transition"
                >
                  Send Message <Send className="h-4 w-4" />
                </button>

                <p className="text-xs text-muted-foreground text-center">
                  By submitting this form, you agree to our <a href="#" className="underline hover:text-primary">Privacy Policy</a> and <a href="#" className="underline hover:text-primary">Terms of Service</a>.
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-8 py-10 border-t border-border mt-12">
        <div className="flex flex-wrap justify-between gap-4 text-sm text-muted-foreground">
          <div>
            <div className="font-display text-foreground font-semibold">My Real Customer App</div>
            <div className="text-xs mt-1">© {new Date().getFullYear()} My Real Customer App. All rights reserved.</div>
          </div>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-primary transition">Privacy Policy</Link>
            <Link href="/" className="hover:text-primary transition">Terms of Service</Link>
            <Link href="/" className="hover:text-primary transition">Security</Link>
            <Link href="/" className="hover:text-primary transition">Status</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
