"use client";

import { useState, useEffect } from "react";
import { Check, Loader2, ArrowRight, Shield, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ALL_FEATURES = [
  { id: "messaging", name: "Messaging", description: "WhatsApp, Instagram, Facebook" },
  { id: "sms", name: "SMS", description: "Bulk SMS messaging" },
  { id: "email", name: "Email", description: "Email campaigns" },
  { id: "automation", name: "Automation", description: "Scheduled messages & workflows" },
  { id: "contacts", name: "Contacts", description: "Contact management" },
  { id: "inventory", name: "Inventory", description: "Product & stock management" },
  { id: "book-keeping", name: "Book Keeping", description: "Bookings & appointments" },
  { id: "sales-reporting", name: "Sales Reporting", description: "Sales tracking & reports" },
  { id: "analytics", name: "Analytics", description: "Insights & charts" },
];

export const PLAN_MODULES = {
  standard: ["messaging", "contacts", "book-keeping", "sales-reporting", "email"],
  premium: ALL_FEATURES.map(f => f.id),
  enterprise: ALL_FEATURES.map(f => f.id),
};

const PLANS = [
  {
    id: "standard",
    name: "Standard",
    description: "Essential tools for small teams getting started",
    icon: Shield,
    monthlyPrice: 25000,
    yearlyPrice: 240000,
    features: PLAN_MODULES.standard,
    limits: { users: 3, contacts: 1000, messages: 5000 }
  },
  {
    id: "premium",
    name: "Premium",
    description: "Complete access for growing businesses",
    icon: Zap,
    monthlyPrice: 50000,
    yearlyPrice: 480000,
    features: PLAN_MODULES.premium,
    limits: { users: 10, contacts: 10000, messages: 50000 }
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Advanced features and dedicated support",
    icon: Crown,
    monthlyPrice: 100000,
    yearlyPrice: 960000,
    features: PLAN_MODULES.enterprise,
    limits: { users: 999, contacts: 99999, messages: 999999 }
  },
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);
};

export default function SubscriptionSettings() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [planUsage, setPlanUsage] = useState<any>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string>("premium");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [userRes, usageRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/auth/me`, {
            headers: { "Authorization": `Bearer ${token}` }
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/auth/plan-usage`, {
            headers: { "Authorization": `Bearer ${token}` }
          })
        ]);
        
        const userResult = await userRes.json();
        const usageResult = await usageRes.json();
        
        if (userResult.success) {
          setUser(userResult.data);
          const currentPlan = userResult.data.subscription?.plan || "premium";
          const currentInterval = userResult.data.subscription?.interval || "monthly";
          setSelectedPlan(currentPlan);
          setBillingCycle(currentInterval);
        }
        if (usageResult.success) {
          setPlanUsage(usageResult.data);
        }
      } catch (err) {
        toast.error("Failed to load subscription");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const calculateTotal = () => {
    const plan = PLANS.find(p => p.id === selectedPlan);
    if (!plan) return 0;
    return billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
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
          planType: selectedPlan,
          interval: billingCycle,
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

  const currentPlan = PLANS.find(p => p.id === selectedPlan) || PLANS[1];

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <div className="label-eyebrow">Admin Console</div>
        <h1 className="font-display text-5xl font-semibold text-foreground mt-2">Subscription</h1>
        <p className="text-muted-foreground mt-3">Choose the perfect plan for your business. Upgrade or downgrade anytime.</p>
      </div>

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
            Yearly <span className="text-xs opacity-75 ml-1">Save 20%</span>
          </button>
        </div>
      </section>

      {/* Current Usage */}
      {planUsage && (
        <section className="bg-card border border-border rounded-2xl p-8 shadow-card space-y-6">
          <h2 className="font-display text-2xl font-semibold text-foreground">Current Usage</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <UsageBar
              label="Team Members"
              used={planUsage.usage.users}
              limit={planUsage.limits.users}
            />
            <UsageBar
              label="Contacts"
              used={planUsage.usage.contacts}
              limit={planUsage.limits.contacts}
            />
            <UsageBar
              label="Messages (This Month)"
              used={planUsage.usage.messages}
              limit={planUsage.limits.messages}
            />
          </div>
        </section>
      )}

      {/* Plan Cards */}
      <section className="grid md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const isSelected = selectedPlan === plan.id;
          const price = billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
          const isCurrentPlan = user?.subscription?.plan === plan.id && user?.subscription?.interval === billingCycle;

          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative cursor-pointer bg-background border-2 rounded-3xl p-6 transition-all duration-300 flex flex-col h-full ${isSelected ? 'border-primary shadow-deep scale-[1.02]' : 'border-border hover:border-primary/50'}`}
            >
              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  Current Plan
                </div>
              )}
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
                {plan.features.map((featureId) => {
                  const feature = ALL_FEATURES.find(f => f.id === featureId);
                  if (!feature) return null;
                  return (
                    <div key={featureId} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success" />
                      <span className="text-foreground">{feature.name}</span>
                    </div>
                  );
                })}
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
      </section>

      {/* Summary */}
      <section className="bg-card border border-border rounded-2xl p-8 shadow-card space-y-6">
        <h2 className="font-display text-2xl font-semibold text-foreground">Summary</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-lg">{currentPlan.name} Plan</div>
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
              {isCurrentPlan ? "Keep Current Plan" : "Update Subscription"}
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </section>
    </div>
  );
}

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number }) {
  const isUnlimited = limit === 999 || limit === 99999 || limit === 999999;
  const percentage = isUnlimited ? 0 : Math.min((used / limit) * 100, 100);
  const isNearLimit = !isUnlimited && percentage >= 80;
  const isAtLimit = !isUnlimited && percentage >= 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-medium ${isAtLimit ? 'text-destructive' : isNearLimit ? 'text-warning' : 'text-foreground'}`}>
          {used.toLocaleString()} / {isUnlimited ? 'Unlimited' : limit.toLocaleString()}
        </span>
      </div>
      {!isUnlimited && (
        <div className="w-full bg-secondary rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all ${isAtLimit ? 'bg-destructive' : isNearLimit ? 'bg-warning' : 'bg-primary'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
      {isAtLimit && (
        <p className="text-[10px] text-destructive font-medium">Limit reached. Upgrade your plan to add more.</p>
      )}
      {isNearLimit && !isAtLimit && (
        <p className="text-[10px] text-warning font-medium">Approaching limit. Consider upgrading.</p>
      )}
    </div>
  );
}
