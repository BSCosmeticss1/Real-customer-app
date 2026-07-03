"use client";

import { useState, useEffect } from "react";
import { Check, CreditCard, Loader2, MessageSquare, Users, Package, BarChart3, Sparkles, Calendar, ArrowRight } from "lucide-react";
import { toast } from "sonner";

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
    icon: Sparkles,
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

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);
};

export default function SubscriptionSettings() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/auth/me`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await res.json();
        if (result.success) {
          setUser(result.data);
          setBillingCycle(result.data.subscription?.plan || 'monthly');
          setSelectedFeatures(result.data.subscription?.selectedFeatures || []);
        }
      } catch (err) {
        toast.error("Failed to load subscription");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

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

  const handleUpdateSubscription = async () => {
    setProcessing(true);
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
        toast.error(data.message || "Failed to update subscription");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <div className="label-eyebrow">Admin Console</div>
        <h1 className="font-display text-5xl font-semibold text-foreground mt-2">Subscription</h1>
        <p className="text-muted-foreground mt-3">Manage your subscription, add or remove features, and update your billing cycle.</p>
      </div>

      {/* Current Subscription */}
      <section className="bg-card border border-border rounded-2xl p-8 shadow-card space-y-6">
        <h2 className="font-display text-2xl font-semibold text-foreground">Current Plan</h2>
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground grid place-items-center">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <div className="font-semibold text-lg text-foreground">{billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1)} Plan</div>
            <div className="text-muted-foreground text-sm">Active features: {selectedFeatures.length || "All"}</div>
          </div>
        </div>
      </section>

      {/* Billing Cycle Toggle */}
      <section className="bg-card border border-border rounded-2xl p-8 shadow-card space-y-6">
        <h2 className="font-display text-2xl font-semibold text-foreground">Billing Cycle</h2>
        <div className="flex bg-muted rounded-full p-1 gap-1 w-fit">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === 'monthly' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === 'yearly' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Yearly <span className="text-xs opacity-75 ml-1">Save more</span>
          </button>
        </div>
      </section>

      {/* Feature Modules */}
      <section className="bg-card border border-border rounded-2xl p-8 shadow-card space-y-6">
        <h2 className="font-display text-2xl font-semibold text-foreground">Features</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {FEATURE_MODULES.map((feature) => {
            const Icon = feature.icon;
            const isSelected = selectedFeatures.includes(feature.id);
            return (
              <div
                key={feature.id}
                onClick={() => toggleFeature(feature.id)}
                className={`relative cursor-pointer bg-background border-2 rounded-2xl p-5 transition-all duration-300 flex flex-col h-full ${isSelected ? 'border-primary' : 'border-border hover:border-primary/50'}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'}`}>
                    {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                </div>
                <h3 className="font-semibold text-base mb-1">{feature.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
                <div className="mt-auto">
                  <div className="text-xl font-bold">{formatPrice(billingCycle === 'monthly' ? feature.monthlyPrice : feature.yearlyPrice)}</div>
                  <div className="text-xs text-muted-foreground">/{billingCycle === 'monthly' ? 'month' : 'year'}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Summary */}
      <section className="bg-card border border-border rounded-2xl p-8 shadow-card space-y-6">
        <h2 className="font-display text-2xl font-semibold text-foreground">Summary</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-lg">{selectedFeatures.length} features</div>
            <div className="text-muted-foreground text-sm">Billed {billingCycle}</div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{formatPrice(calculateTotal())}</div>
            <div className="text-muted-foreground text-sm">/{billingCycle === 'monthly' ? 'month' : 'year'}</div>
          </div>
        </div>
        <button
          disabled={processing}
          onClick={handleUpdateSubscription}
          className="w-full bg-primary text-primary-foreground rounded-xl py-4 font-semibold flex items-center justify-center gap-2 shadow-deep hover:bg-primary-glow transition disabled:opacity-50"
        >
          {processing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Update Subscription
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </section>
    </div>
  );
}
