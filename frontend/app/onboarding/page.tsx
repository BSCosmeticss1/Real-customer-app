"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Building2, Phone, Globe, MapPin, Check, ShieldCheck, Zap, MessageSquare, BarChart3, Calendar, CreditCard, Users, Package } from "lucide-react";

const FEATURE_MODULES = [
  {
    id: "messaging",
    name: "Messaging",
    description: "Manage messaging across WhatsApp, Instagram, Facebook",
    icon: MessageSquare,
    monthlyPrice: 10000,
    yearlyPrice: 80000,
  },
  {
    id: "contacts",
    name: "Contacts",
    description: "Manage your customer contacts and segments",
    icon: Users,
    monthlyPrice: 8000,
    yearlyPrice: 64000,
  },
  {
    id: "inventory",
    name: "Inventory",
    description: "Product and inventory management",
    icon: Package,
    monthlyPrice: 9000,
    yearlyPrice: 72000,
  },
  {
    id: "analytics",
    name: "Analytics",
    description: "Detailed reports and insights for your business",
    icon: BarChart3,
    monthlyPrice: 8000,
    yearlyPrice: 64000,
  },
  {
    id: "automation",
    name: "Automation",
    description: "Scheduled messages and automated workflows",
    icon: Zap,
    monthlyPrice: 12000,
    yearlyPrice: 96000,
  },
  {
    id: "bookingReporting",
    name: "Booking & Reporting",
    description: "Appointment scheduling and comprehensive reporting",
    icon: Calendar,
    monthlyPrice: 9000,
    yearlyPrice: 72000,
  },
  {
    id: "finance",
    name: "Finance",
    description: "Invoices, expenses, and financial management",
    icon: CreditCard,
    monthlyPrice: 11000,
    yearlyPrice: 88000,
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  
  // Step 1 data
  const [businessData, setBusinessData] = useState({
    businessName: "",
    businessPhone: "",
    businessAddress: "",
    website: "",
    currency: "NGN",
    timezone: "Africa/Lagos",
  });

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(id => id !== featureId) 
        : [...prev, featureId]
    );
  };

  const calculateTotal = () => {
    return selectedFeatures.reduce((total, id) => {
      const feature = FEATURE_MODULES.find(f => f.id === id);
      if (!feature) return total;
      return total + (billingCycle === "monthly" ? feature.monthlyPrice : feature.yearlyPrice);
    }, 0);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);
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
    if (selectedFeatures.length === 0) {
      setError("Please select at least one feature");
      return;
    }
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
          planType: billingCycle,
          selectedFeatures,
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
            <div className={`h-2 w-12 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto flex items-center justify-center p-6">
        <div className="max-w-4xl w-full my-auto py-8">
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
                <h1 className="font-display text-3xl sm:text-4xl font-semibold mt-2">Choose your features</h1>
                <p className="text-muted-foreground mt-2 text-sm sm:text-base">Select the modules you need and pay only for what you use.</p>
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
                    Yearly <span className="text-xs opacity-75">Save more</span>
                  </button>
                </div>
              </div>

              {/* Feature modules grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {FEATURE_MODULES.map((feature) => (
                  <FeatureCard
                    key={feature.id}
                    feature={feature}
                    selected={selectedFeatures.includes(feature.id)}
                    onClick={() => toggleFeature(feature.id)}
                    billingCycle={billingCycle}
                    formatPrice={formatPrice}
                  />
                ))}
              </div>

              {/* Summary card */}
              {selectedFeatures.length > 0 && (
                <div className="bg-card border border-border rounded-3xl p-6 shadow-deep">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">Your Plan</h3>
                      <p className="text-muted-foreground text-sm">{selectedFeatures.length} feature{selectedFeatures.length !== 1 ? 's' : ''} selected</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">{formatPrice(calculateTotal())}</div>
                      <div className="text-muted-foreground text-sm">/{billingCycle === "monthly" ? "month" : "year"}</div>
                    </div>
                  </div>
                  
                  {/* Selected features list */}
                  <div className="mt-4 space-y-2">
                    {selectedFeatures.map(id => {
                      const feature = FEATURE_MODULES.find(f => f.id === id);
                      return (
                        <div key={id} className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary" />
                            {feature?.name}
                          </span>
                          <span className="text-muted-foreground">{formatPrice(billingCycle === "monthly" ? feature!.monthlyPrice : feature!.yearlyPrice)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {error && <p className="text-destructive text-sm text-center">{error}</p>}

              <div className="flex flex-col gap-4">
                <button 
                  disabled={loading || selectedFeatures.length === 0}
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

function FeatureCard({ feature, selected, onClick, billingCycle, formatPrice }: any) {
  const Icon = feature.icon;
  return (
    <div 
      onClick={onClick}
      className={`relative cursor-pointer bg-card border-2 rounded-2xl p-5 transition-all duration-300 flex flex-col h-full ${selected ? 'border-primary shadow-deep' : 'border-border hover:border-primary/50'}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${selected ? 'border-primary bg-primary' : 'border-muted-foreground'}`}>
          {selected && <Check className="h-3 w-3 text-primary-foreground" />}
        </div>
      </div>
      <h3 className="font-semibold text-base mb-1">{feature.name}</h3>
      <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
      <div className="mt-auto">
        <div className="text-xl font-bold">{formatPrice(billingCycle === "monthly" ? feature.monthlyPrice : feature.yearlyPrice)}</div>
        <div className="text-xs text-muted-foreground">/{billingCycle === "monthly" ? "month" : "year"}</div>
      </div>
    </div>
  );
}
