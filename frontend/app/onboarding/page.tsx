"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Building2, Phone, Globe, MapPin, Check, Shield, Zap, Crown } from "lucide-react";

const PLANS = [
  {
    id: "standard",
    name: "Standard",
    description: "Essential tools for small teams getting started",
    icon: Shield,
    monthlyPrice: 25000,
    yearlyPrice: 240000,
    features: ["Messaging", "Contacts", "Book Keeping", "Sales Reporting", "Email"],
    limits: { users: 3, contacts: 1000, messages: 5000 }
  },
  {
    id: "premium",
    name: "Premium",
    description: "Complete access for growing businesses",
    icon: Zap,
    monthlyPrice: 50000,
    yearlyPrice: 480000,
    features: [
      "Messaging", "SMS", "Email", "Automation",
      "Contacts", "Inventory",
      "Book Keeping", "Sales Reporting", "Analytics"
    ],
    limits: { users: 10, contacts: 10000, messages: 50000 }
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Advanced features and dedicated support",
    icon: Crown,
    monthlyPrice: 100000,
    yearlyPrice: 960000,
    features: [
      "Messaging", "SMS", "Email", "Automation",
      "Contacts", "Inventory",
      "Book Keeping", "Sales Reporting", "Analytics"
    ],
    limits: { users: 999, contacts: 99999, messages: 999999 }
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [selectedPlan, setSelectedPlan] = useState<string>("premium");

  const [businessData, setBusinessData] = useState({
    businessName: "",
    businessPhone: "",
    businessAddress: "",
    website: "",
    currency: "NGN",
    timezone: "Africa/Lagos",
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);
  };

  const calculateTotal = () => {
    const plan = PLANS.find(p => p.id === selectedPlan);
    if (!plan) return 0;
    return billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
  };

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
        body: JSON.stringify({ 
          planType: selectedPlan,
          interval: billingCycle,
          amount: calculateTotal()
        }),
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
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto flex items-center justify-center p-6">
        <div className="max-w-4xl w-full my-auto py-8">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center">
                <div className="label-eyebrow">Step 1 of 2</div>
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
                  {loading ? "Saving..." : "Continue to Plans"} <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 py-4">
              <div className="text-center">
                <div className="label-eyebrow">Step 2 of 2</div>
                <h1 className="font-display text-3xl sm:text-4xl font-semibold mt-2">Choose your plan</h1>
                <p className="text-muted-foreground mt-2 text-sm sm:text-base">Select the plan that fits your business needs.</p>
              </div>

              {/* Billing cycle toggle */}
              <div className="flex justify-center">
                <div className="bg-muted rounded-full p-1 flex gap-1">
                  <button
                    onClick={() => setBillingCycle("monthly")}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle("yearly")}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === "yearly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Yearly <span className="text-xs opacity-75">Save 20%</span>
                  </button>
                </div>
              </div>

              {/* Plan cards */}
              <div className="grid sm:grid-cols-3 gap-6">
                {PLANS.map((plan) => {
                  const Icon = plan.icon;
                  const isSelected = selectedPlan === plan.id;
                  const price = billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;

                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`relative cursor-pointer bg-card border-2 rounded-3xl p-6 transition-all duration-300 flex flex-col h-full ${isSelected ? 'border-primary shadow-deep scale-[1.02]' : 'border-border hover:border-primary/50'}`}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{plan.name}</h3>
                          <p className="text-xs text-muted-foreground">{plan.description}</p>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <div className="text-3xl font-bold">{formatPrice(price)}</div>
                        <div className="text-xs text-muted-foreground">/{billingCycle === 'monthly' ? 'month' : 'year'}</div>
                      </div>

                      <div className="space-y-3 mb-6 flex-1">
                        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Features</div>
                        {plan.features.map((feature) => (
                          <div key={feature} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-success" />
                            <span className="text-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2 pt-4 border-t border-border">
                        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Limits</div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Users</span>
                          <span className="font-medium">{plan.limits.users === 999 ? 'Unlimited' : plan.limits.users}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Contacts</span>
                          <span className="font-medium">{plan.limits.contacts === 99999 ? 'Unlimited' : plan.limits.contacts.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Messages/mo</span>
                          <span className="font-medium">{plan.limits.messages === 999999 ? 'Unlimited' : plan.limits.messages.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {error && <p className="text-destructive text-sm text-center">{error}</p>}

              <div className="flex flex-col gap-4">
                <button 
                  disabled={loading}
                  onClick={handlePlanSelection}
                  className="w-full bg-primary text-primary-foreground rounded-xl py-4 font-semibold flex items-center justify-center gap-2 shadow-deep hover:bg-primary-glow transition disabled:opacity-50"
                >
                  {loading ? "Initializing Paystack..." : `Pay ${formatPrice(calculateTotal())} via Paystack`} <ArrowRight className="h-4 w-4" />
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
