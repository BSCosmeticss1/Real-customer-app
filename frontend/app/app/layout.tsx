"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, MessageSquare, Sparkles, Users, LineChart, Settings, HelpCircle, Plus, Search, Bell, Grid3x3, UserCog, Package, ClipboardList, Menu, Lock, CreditCard, Phone, Mail } from "lucide-react";
import OrgSwitcher from "@/components/OrgSwitcher";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Map nav items to feature IDs (and dashboard is always shown, team/subscription are always shown)
const nav = [
  { href: "/app", label: "Dashboard", icon: LayoutGrid, exact: true, roles: ["ADMIN", "MESSAGING_MANAGER", "INVENTORY_MANAGER", "FINANCE_MANAGER"], alwaysShow: true },
  { href: "/app/messaging", label: "Messaging", icon: MessageSquare, roles: ["ADMIN", "MESSAGING_MANAGER", "INVENTORY_MANAGER", "FINANCE_MANAGER"], featureId: "messaging" },
  { href: "/app/sms", label: "SMS", icon: Phone, roles: ["ADMIN", "MESSAGING_MANAGER", "INVENTORY_MANAGER", "FINANCE_MANAGER"], featureId: "messaging" },
  { href: "/app/email", label: "Email", icon: Mail, roles: ["ADMIN", "MESSAGING_MANAGER", "INVENTORY_MANAGER", "FINANCE_MANAGER"], featureId: "messaging" },
  { href: "/app/automation", label: "Automation", icon: Sparkles, roles: ["ADMIN", "MESSAGING_MANAGER", "INVENTORY_MANAGER", "FINANCE_MANAGER"], featureId: "automation" },
  { href: "/app/contacts", label: "Contacts", icon: Users, roles: ["ADMIN", "MESSAGING_MANAGER", "INVENTORY_MANAGER", "FINANCE_MANAGER"], featureId: "contacts" },
  { href: "/app/inventory", label: "Inventory", icon: Package, roles: ["ADMIN", "MESSAGING_MANAGER", "INVENTORY_MANAGER", "FINANCE_MANAGER"], featureId: "inventory" },
  { href: "/app/booking-reporting", label: "Booking Reporting", icon: ClipboardList, roles: ["ADMIN", "MESSAGING_MANAGER", "INVENTORY_MANAGER", "FINANCE_MANAGER"], featureId: "bookingReporting" },
  { href: "/app/analytics", label: "Analytics", icon: LineChart, roles: ["ADMIN", "MESSAGING_MANAGER", "INVENTORY_MANAGER", "FINANCE_MANAGER"], featureId: "analytics" },
  { href: "/app/settings/team", label: "Team", icon: UserCog, roles: ["ADMIN"], alwaysShow: true },
  { href: "/app/settings/subscription", label: "Subscription", icon: CreditCard, roles: ["ADMIN"], alwaysShow: true },
];

const titleMap: Record<string, string> = {
  "/app": "Search systems or logs…",
  "/app/messaging": "Search interactions…",
  "/app/sms": "Search SMS recipients…",
  "/app/email": "Search email recipients…",
  "/app/automation": "Search automation nodes…",
  "/app/contacts": "Search contacts or platforms…",
  "/app/inventory": "Search inventory items…",
  "/app/booking-reporting": "Search booking reports…",
  "/app/analytics": "Search reports…",
  "/app/settings/team": "Search team members…",
  "/app/settings/organization": "Search settings…",
  "/app/settings/subscription": "Manage subscription…",
};

function SidebarContent({ pathname, businessName, userRole, selectedFeatures, allowedFeatures }: { pathname: string; businessName?: string; userRole?: string; selectedFeatures?: string[]; allowedFeatures?: string[] }) {
  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  // For admin: use selectedFeatures from subscription
  // For others: use allowedFeatures
  const allFeatureIds = ["messaging", "contacts", "inventory", "analytics", "automation", "bookingReporting", "finance"];
  let activeFeatures: string[];
  
  if (userRole === "ADMIN") {
    activeFeatures = selectedFeatures && selectedFeatures.length > 0 ? selectedFeatures : allFeatureIds;
  } else {
    activeFeatures = allowedFeatures && allowedFeatures.length > 0 ? allowedFeatures : [];
  }

  // Filter nav items:
  // - alwaysShow items
  // - items where featureId is in activeFeatures
  // - and role check
  const filteredNav = nav.filter(item => {
    // Role check
    const hasRole = !userRole || item.roles.includes(userRole);
    if (!hasRole) return false;

    // Always show items
    if (item.alwaysShow) return true;

    // Feature check
    return activeFeatures.includes(item.featureId);
  });

  return (
    <div className="flex flex-col h-full bg-sidebar">
      <div className="p-6 flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-primary text-primary-foreground grid place-items-center shadow-deep">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5"><path d="M12 2L4 22h3l1.5-4h7L17 22h3L12 2zm-2.2 13L12 8.5 14.2 15H9.8z" fill="currentColor"/></svg>
        </div>
        <div>
          <div className="font-display text-lg font-semibold text-foreground leading-none">{businessName || "Real customer App"}</div>
          <div className="label-eyebrow mt-1.5">{userRole === 'ADMIN' ? 'Admin Console' : 'Automation Engine'}</div>
        </div>
      </div>

      <nav className="px-3 mt-2 space-y-1 flex-1">
        {filteredNav.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
              isActive(href, exact)
                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-card"
                : "text-sidebar-foreground hover:bg-sidebar-accent/60"
            )}
          >
            <Icon className="h-[18px] w-[18px]" />
            {label}
          </Link>
        ))}
      </nav>

      {(userRole === 'ADMIN' || userRole === 'MESSAGING_MANAGER') && (
        <div className="p-4">
          <button className="w-full bg-primary text-primary-foreground rounded-xl py-3.5 font-medium flex items-center justify-center gap-2 shadow-deep hover:bg-primary-glow transition">
            <Plus className="h-4 w-4" /> New Workflow
          </button>
        </div>
      )}

      <div className="px-6 pb-6 space-y-3 text-sm text-sidebar-foreground">
        <Link href="/app/settings/organization" className="flex items-center gap-3 hover:text-primary transition"><Settings className="h-4 w-4" /> Settings</Link>
        <button className="flex items-center gap-3 hover:text-primary transition"><HelpCircle className="h-4 w-4" /> Support</button>
      </div>
    </div>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const placeholder = titleMap[pathname] ?? "Search…";

  useEffect(() => {
    const checkOnboarding = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/auth/me`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.success) {
          const { onboardingStatus, isVerified, mustChangePassword } = data.data;
          setUser(data.data);
          
          if (!isVerified) {
            router.push("/signup"); 
            return;
          }

          if (onboardingStatus !== "COMPLETED") {
            router.push("/onboarding");
            return;
          }

          if (mustChangePassword) {
            setShowPasswordModal(true);
          }
        } else {
          router.push("/login");
        }
      } catch (err) { // @ts-ignore
        console.error("Auth check failed", err);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkOnboarding();
  }, [router]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    setPasswordLoading(true);
    setPasswordError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/auth/first-password-change`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setShowPasswordModal(false);
        // Refresh user data
        const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/auth/me`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const userData = await userRes.json();
        if (userData.success) setUser(userData.data);
      } else {
        setPasswordError(data.message || "Failed to update password");
      }
    } catch (err) {
      setPasswordError("Something went wrong");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const businessName = user?.settings?.businessName || "My Organization";

  return (
    <div className="min-h-screen flex bg-background relative">
      {/* First Time Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-6">
          <div className="max-w-md w-full bg-card border border-border rounded-3xl shadow-deep p-8 animate-in zoom-in duration-300">
            <div className="text-center mb-8">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-semibold">Change your password</h2>
              <p className="text-muted-foreground mt-2">Since this is your first time logging in, please set a new password for your account.</p>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">New Password</label>
                <input
                  required
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Confirm New Password</label>
                <input
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
                  placeholder="••••••••"
                />
              </div>

              {passwordError && <p className="text-destructive text-xs">{passwordError}</p>}

              <button
                disabled={passwordLoading}
                type="submit"
                className="w-full bg-primary text-primary-foreground rounded-xl py-3.5 font-semibold shadow-deep hover:bg-primary-glow transition disabled:opacity-50"
              >
                {passwordLoading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 border-r border-sidebar-border flex-col">
        <SidebarContent 
          pathname={pathname} 
          businessName={businessName} 
          userRole={user?.role} 
          selectedFeatures={user?.subscription?.selectedFeatures}
          allowedFeatures={user?.allowedFeatures}
        />
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4 flex-1">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button className="lg:hidden h-10 w-10 rounded-xl border border-border flex items-center justify-center hover:bg-secondary transition">
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <SidebarContent 
                  pathname={pathname} 
                  businessName={businessName} 
                  userRole={user?.role} 
                  selectedFeatures={user?.subscription?.selectedFeatures}
                  allowedFeatures={user?.allowedFeatures}
                />
              </SheetContent>
            </Sheet>
            
            <div className="relative max-w-md w-full hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder={placeholder}
                className="w-full bg-secondary/50 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="h-10 w-10 rounded-xl border border-border flex items-center justify-center hover:bg-secondary transition relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-primary rounded-full border-2 border-card" />
            </button>
            <OrgSwitcher businessName={businessName} userRole={user?.role} />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 sm:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}