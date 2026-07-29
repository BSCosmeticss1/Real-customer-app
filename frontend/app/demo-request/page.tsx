"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, MessageSquare, Users, Zap, BarChart3 } from "lucide-react";

export default function DemoRequest() {
  const [formData, setFormData] = useState({
    fullName: "David John",
    email: "",
    company: "",
    phone: "+234",
    role: "",
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
          <h1 className="font-display text-4xl font-semibold">Thank You, {formData.fullName.split(" ")[0]}!</h1>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            Your demo request has been received. Our team will reach out to you within 24 hours to schedule your personalized walkthrough.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/" className="bg-primary text-primary-foreground px-6 py-3.5 rounded-xl font-semibold">Back to Home</Link>
            <Link href="/how-it-works" className="bg-card border border-border px-6 py-3.5 rounded-xl font-semibold hover:border-primary transition">Learn More</Link>
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
          <Link href="/contact" className="hover:text-primary transition">Contact</Link>
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
            <div className="label-eyebrow">Get Started</div>
            <h1 className="font-display text-5xl sm:text-6xl font-semibold mt-4 leading-tight">
              Request a <span className="text-primary">Demo</span>
            </h1>
            <p className="text-muted-foreground mt-6 text-lg leading-relaxed max-w-md">
              See how My Real Customer App can transform your messaging workflows. Fill out the form and our team will schedule a personalized demo.
            </p>

            <div className="mt-12 space-y-6">
              {[
                { icon: MessageSquare, title: "Live Product Demo", desc: "See the platform in action with a guided walkthrough tailored to your use case." },
                { icon: Users, title: "Expert Consultation", desc: "Speak with our solutions team about your specific requirements and workflows." },
                { icon: Zap, title: "Custom Implementation Plan", desc: "Get a tailored roadmap for deploying My Real Customer App in your organization." },
                { icon: BarChart3, title: "ROI Analysis", desc: "Understand the potential impact on your messaging efficiency and customer engagement." },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold">{item.title}</h3>
                    <p className="text-muted-foreground text-sm mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-card rounded-2xl shadow-card border border-border">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex -space-x-2">
                  {["bg-primary","bg-accent","bg-success"].map((c,i) => <div key={i} className={`h-8 w-8 rounded-full border-2 border-card ${c}`} />)}
                </div>
                <span className="text-sm font-medium">Join 500+ enterprises</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Companies of all sizes trust My Real Customer App to power their customer communications. From startups to Fortune 500 enterprises.
              </p>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="lg:pl-8">
            <div className="bg-card rounded-3xl p-8 md:p-10 shadow-deep border border-border">
              <div className="mb-8">
                <h2 className="font-display text-2xl font-semibold">Tell us about yourself</h2>
                <p className="text-muted-foreground mt-2">All fields marked with * are required.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
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
                    <label className="block text-sm font-medium mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                      placeholder="+234 801 234 5678"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Your Role</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                    placeholder="e.g. Marketing Manager, CTO, Founder"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">What are you looking for? *</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none"
                    placeholder="Tell us about your messaging needs, team size, and what you'd like to see in the demo..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-deep hover:bg-primary-glow transition"
                >
                  Schedule My Demo <ArrowRight className="h-4 w-4" />
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
