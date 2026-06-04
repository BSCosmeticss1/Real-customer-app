"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Building2, Phone, Globe, MapPin, Check, ShieldCheck, Zap } from "lucide-react";

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Step 1 data
  const [businessData, setBusinessData] = useState({
    businessName: "",
    businessPhone: "",
    businessAddress: "",
    website: "",
    currency: "NGN",
    timezone: "Africa/Lagos",
  });

  // Step 2 data
  const [plan, setPlan] = useState<"monthly" | "yearly">("monthly");

  const handleDetailsSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/onboarding/details`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(businessData),
      });

      const data = await res.json();
      if (data.success) {
        setStep(2);
      } else {
        setError(data.message || "Failed to update details");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelection = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/payments/paystack/initialize-subscription`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ planType: plan }),
      });

      const data = await res.json();
      if (data.success && data.data.authorization_url) {
        window.location.href = data.data.authorization_url;
      } else {
        setError(data.message || "Failed to initialize payment");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50 shrink-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-display text-xl font-semibold">Real customer App</Link>
          <div className="flex items-center gap-4">
            <div className={`h-2 w-12 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`h-2 w-12 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`h-2 w-12 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto flex items-center justify-center p-6">
        <div className="max-w-2xl w-full my-auto py-8">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center">
                <div className="label-eyebrow">Step 2 of 3</div>
                <h1 className="font-display text-3xl sm:text-4xl font-semibold mt-2">Business details</h1>
                <p className="text-muted-foreground mt-2 text-sm sm:text-base">Tell us more about your organization.</p>
              </div>

              <form onSubmit={handleDetailsSubmit} className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-deep space-y-4 sm:space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <Field 
                    icon={Building2} 
                    label="Business Name" 
                    placeholder="My Company Ltd" 
                    value={businessData.businessName}
                    onChange={(e) => setBusinessData({ ...businessData, businessName: e.target.value })}
                    required
                  />
                  <Field 
                    icon={Phone} 
                    label="Business Phone" 
                    placeholder="+234..." 
                    value={businessData.businessPhone}
                    onChange={(e) => setBusinessData({ ...businessData, businessPhone: e.target.value })}
                    required
                  />
                </div>
                <Field 
                  icon={MapPin} 
                  label="Business Address" 
                  placeholder="Lagos, Nigeria" 
                  value={businessData.businessAddress}
                  onChange={(e) => setBusinessData({ ...businessData, businessAddress: e.target.value })}
                />
                <Field 
                  icon={Globe} 
                  label="Website (Optional)" 
                  placeholder="https://..." 
                  value={businessData.website}
                  onChange={(e) => setBusinessData({ ...businessData, website: e.target.value })}
                />

                {error && <p className="text-destructive text-sm">{error}</p>}

                <button 
                  disabled={loading}
                  type="submit" 
                  className="w-full bg-primary text-primary-foreground rounded-xl py-4 font-semibold flex items-center justify-center gap-2 shadow-deep hover:bg-primary-glow transition"
                >
                  {loading ? "Saving..." : "Continue to Pricing"} <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 py-4">
              <div className="text-center">
                <div className="label-eyebrow">Step 3 of 3</div>
                <h1 className="font-display text-3xl sm:text-4xl font-semibold mt-2">Choose your plan</h1>
                <p className="text-muted-foreground mt-2 text-sm sm:text-base">Select a subscription that fits your business needs.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <PricingCard 
                  title="Monthly"
                  price="30,000"
                  period="month"
                  description="Perfect for small teams starting out."
                  features={["Unlimited Contacts", "All Platforms", "Basic Analytics", "Priority Support"]}
                  selected={plan === "monthly"}
                  onClick={() => setPlan("monthly")}
                  icon={Zap}
                />
                <PricingCard 
                  title="Yearly"
                  price="120,000"
                  period="year"
                  description="Best value for growing organizations."
                  features={["Everything in Monthly", "Save ₦240,000/year", "Advanced Automations", "Dedicated Manager"]}
                  selected={plan === "yearly"}
                  onClick={() => setPlan("yearly")}
                  icon={ShieldCheck}
                  badge="Save 66%"
                />
              </div>

              {error && <p className="text-destructive text-sm text-center">{error}</p>}

              <div className="flex flex-col gap-4">
                <button 
                  disabled={loading}
                  onClick={handlePlanSelection}
                  className="w-full bg-primary text-primary-foreground rounded-xl py-4 font-semibold flex items-center justify-center gap-2 shadow-deep hover:bg-primary-glow transition"
                >
                  {loading ? "Initializing Paystack..." : `Pay ₦${plan === "monthly" ? "30,000" : "120,000"} via Paystack`} <ArrowRight className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setStep(1)}
                  className="text-sm text-muted-foreground hover:text-foreground transition text-center"
                >
                  Back to business details
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Field({ icon: Icon, label, ...props }: { icon: any; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="relative mt-2">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input {...props} className="w-full bg-card border border-border rounded-xl pl-11 pr-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" />
      </div>
    </label>
  );
}

function PricingCard({ title, price, period, description, features, selected, onClick, icon: Icon, badge }: any) {
  return (
    <div 
      onClick={onClick}
      className={`relative cursor-pointer bg-card border-2 rounded-3xl p-6 transition-all duration-300 flex flex-col h-full ${selected ? 'border-primary shadow-deep scale-[1.02]' : 'border-border hover:border-primary/50'}`}
    >
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
          {badge}
        </div>
      )}
      <div className="flex items-center gap-3 mb-4">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="font-semibold text-lg">{title}</h3>
      </div>
      <div className="mb-4">
        <span className="text-3xl font-bold">₦{price}</span>
        <span className="text-muted-foreground text-sm ml-1">/{period}</span>
      </div>
      <p className="text-sm text-muted-foreground mb-6">{description}</p>
      <div className="space-y-3 mt-auto">
        {features.map((f: string) => (
          <div key={f} className="flex items-start gap-2 text-sm">
            <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <span>{f}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
