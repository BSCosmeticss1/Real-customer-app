"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  MessageSquare,
  Sparkles,
  Users,
  LineChart,
  Settings,
  HelpCircle,
  Search,
  Bell,
  Grid3x3,
  UserCog,
  Package,
  ClipboardList,
  Menu,
  Lock,
  CreditCard,
  Phone,
  Mail,
  Landmark,
  ReceiptText,
  WalletCards,
  TrendingUp,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ArrowLeftRight,
  BookOpen,
} from "lucide-react";
import OrgSwitcher from "@/components/OrgSwitcher";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Map nav items to feature IDs (and dashboard is always shown, team/subscription are always shown)
interface NavItem {
  href: string;
  label: string;
  icon: any;
  exact?: boolean;
  roles: string[];
  featureId?: string;
  alwaysShow?: boolean;
}

interface NavGroup {
  group: string;
  roles?: string[];
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    group: "Overview",
    items: [
      {
        href: "/app",
        label: "Dashboard",
        icon: LayoutGrid,
        exact: true,
        roles: ["ADMIN", "MESSAGING_MANAGER", "INVENTORY_MANAGER", "FINANCE_MANAGER"],
        alwaysShow: true,
      },
    ],
  },
  {
    group: "Messaging",
    items: [
      {
        href: "/app/messaging",
        label: "Messaging",
        icon: MessageSquare,
        roles: ["ADMIN", "MESSAGING_MANAGER", "INVENTORY_MANAGER", "FINANCE_MANAGER"],
        featureId: "messaging",
      },
      {
        href: "/app/sms",
        label: "SMS",
        icon: Phone,
        roles: ["ADMIN", "MESSAGING_MANAGER", "INVENTORY_MANAGER", "FINANCE_MANAGER"],
        featureId: "messaging",
      },
      {
        href: "/app/email",
        label: "Email",
        icon: Mail,
        roles: ["ADMIN", "MESSAGING_MANAGER", "INVENTORY_MANAGER", "FINANCE_MANAGER"],
        featureId: "messaging",
      },
      {
        href: "/app/automation",
        label: "Automation",
        icon: Sparkles,
        roles: ["ADMIN", "MESSAGING_MANAGER", "INVENTORY_MANAGER", "FINANCE_MANAGER"],
        featureId: "automation",
      },
      {
        href: "/app/contacts",
        label: "Contacts",
        icon: Users,
        roles: ["ADMIN", "MESSAGING_MANAGER", "INVENTORY_MANAGER", "FINANCE_MANAGER"],
        featureId: "contacts",
      },
    ],
  },
  {
    group: "Core Tools",
    items: [
      {
        href: "/app/inventory",
        label: "Inventory",
        icon: Package,
        exact: true,
        roles: ["ADMIN", "MESSAGING_MANAGER", "INVENTORY_MANAGER", "FINANCE_MANAGER"],
        featureId: "inventory",
      },
      {
        href: "/app/inventory/stock-movements",
        label: "Stock Movement",
        icon: ArrowLeftRight,
        exact: true,
        roles: ["ADMIN", "MESSAGING_MANAGER", "INVENTORY_MANAGER", "FINANCE_MANAGER"],
        featureId: "inventory",
      },
      {
        href: "/app/booking-reporting",
        label: "Booking Reporting",
        icon: ClipboardList,
        roles: ["ADMIN", "MESSAGING_MANAGER", "INVENTORY_MANAGER", "FINANCE_MANAGER"],
        featureId: "bookingReporting",
      },
      {
        href: "/app/analytics",
        label: "Analytics",
        icon: LineChart,
        roles: ["ADMIN", "MESSAGING_MANAGER", "INVENTORY_MANAGER", "FINANCE_MANAGER"],
        featureId: "analytics",
      },
    ],
  },
  {
    group: "Finance",
    roles: ["ADMIN", "FINANCE_MANAGER"],
    items: [
      {
        href: "/app/finance/invoices",
        label: "Invoice",
        icon: ReceiptText,
        roles: ["ADMIN", "FINANCE_MANAGER"],
        featureId: "finance",
      },
      {
        href: "/app/finance/expenses",
        label: "Expenses",
        icon: WalletCards,
        roles: ["ADMIN", "FINANCE_MANAGER"],
        featureId: "finance",
      },
      {
        href: "/app/finance/cashflow",
        label: "Cashflow",
        icon: TrendingUp,
        roles: ["ADMIN", "FINANCE_MANAGER"],
        featureId: "finance",
      },
    ],
  },
  {
    group: "System",
    roles: ["ADMIN"],
    items: [
      {
        href: "/app/settings/team",
        label: "Team",
        icon: UserCog,
        roles: ["ADMIN"],
        alwaysShow: true,
      },
      {
        href: "/app/settings/subscription",
        label: "Subscription",
        icon: CreditCard,
        roles: ["ADMIN"],
        alwaysShow: true,
      },
    ],
  },
  {
    group: "Book Keeping",
    roles: ["ADMIN", "AUDITOR"],
    items: [
      {
        href: "/app/book-keeping",
        label: "Audit Log",
        icon: BookOpen,
        exact: true,
        roles: ["ADMIN", "AUDITOR"],
        alwaysShow: true,
      },
    ],
  },
];

const titleMap: Record<string, string> = {
  "/app": "Search systems or logs…",
  "/app/messaging": "Search interactions…",
  "/app/sms": "Search SMS recipients…",
  "/app/email": "Search email recipients…",
  "/app/automation": "Search automation nodes…",
  "/app/contacts": "Search contacts or platforms…",
  "/app/inventory": "Search inventory items…",
  "/app/inventory/stock-movements": "Search stock movements…",
  "/app/booking-reporting": "Search booking reports…",
  "/app/analytics": "Search reports…",
  "/app/finance": "Search finance records…",
  "/app/finance/invoices": "Search invoices…",
  "/app/finance/expenses": "Search expenses…",
  "/app/finance/cashflow": "Search cashflow…",
  "/app/settings/team": "Search team members…",
  "/app/settings/organization": "Search settings…",
  "/app/settings/subscription": "Manage subscription…",
  "/app/book-keeping": "Search audit records…",
};

function SidebarContent({
  pathname,
  businessName,
  userRole,
  userName,
  selectedFeatures,
  allowedFeatures,
  collapsed = false,
  onLogout,
}: {
  pathname: string;
  businessName?: string;
  userRole?: string;
  userName?: string;
  selectedFeatures?: string[];
  allowedFeatures?: string[];
  collapsed?: boolean;
  onLogout?: () => void;
}) {
  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  // For admin: use selectedFeatures from subscription
  // For others: use allowedFeatures
  const allFeatureIds = [
    "messaging",
    "contacts",
    "inventory",
    "analytics",
    "automation",
    "bookingReporting",
    "finance",
  ];
  let activeFeatures: string[];

  if (userRole === "ADMIN") {
    activeFeatures =
      selectedFeatures && selectedFeatures.length > 0
        ? selectedFeatures
        : allFeatureIds;
  } else {
    activeFeatures =
      allowedFeatures && allowedFeatures.length > 0 ? allowedFeatures : [];
  }

  // Filter groups by role, then items within each group by role + feature
  const visibleGroups = NAV.map((group) => {
    const groupHasRole =
      !group.roles || !userRole || group.roles.includes(userRole);
    if (!groupHasRole) return null;

    const items = group.items.filter((item) => {
      const hasRole = !userRole || item.roles.includes(userRole);
      if (!hasRole) return false;
      if (item.alwaysShow) return true;
      return item.featureId ? activeFeatures.includes(item.featureId) : true;
    });
    if (!items.length) return null;

    return { ...group, items };
  }).filter(Boolean) as NavGroup[];

  const roleLabel = userRole === "ADMIN" ? "Admin" : userRole === "FINANCE_MANAGER" ? "Finance" : userRole === "INVENTORY_MANAGER" ? "Inventory" : userRole === "MESSAGING_MANAGER" ? "Messaging" : userRole === "AUDITOR" ? "Auditor" : "Staff";

  return (
    <div className="flex flex-col h-full bg-sidebar">
      <div className={cn("flex items-center gap-3 p-6", collapsed && "justify-center px-2")}>
        <div className="h-11 w-11 rounded-xl bg-primary text-primary-foreground grid place-items-center shadow-deep shrink-0">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            <path
              d="M12 2L4 22h3l1.5-4h7L17 22h3L12 2zm-2.2 13L12 8.5 14.2 15H9.8z"
              fill="currentColor"
            />
          </svg>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="font-display text-lg font-semibold text-foreground leading-none truncate">
              {businessName || "Real customer App"}
            </div>
            <div className="label-eyebrow mt-1.5">
              {userRole === "ADMIN" ? "Admin Console" : "Automation Engine"}
            </div>
          </div>
        )}
      </div>

      <nav className="px-3 mt-2 space-y-4 flex-1 overflow-y-auto scrollbar-slim">
        {visibleGroups.map((group) => (
          <div key={group.group}>
            {!collapsed && (
              <p className="label-eyebrow px-3 mb-1.5">{group.group}</p>
            )}
            <div className="space-y-1">
              {group.items.map(({ href, label, icon: Icon, exact }) => (
                <Link
                  key={href}
                  href={href}
                  title={collapsed ? label : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                    collapsed && "justify-center px-2",
                    isActive(href, exact)
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-card"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/60",
                  )}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  {!collapsed && label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User profile + logout */}
      <div className="border-t border-sidebar-border p-3 shrink-0">
        <div className={cn(
          "rounded-2xl p-3 border border-sidebar-border bg-sidebar-accent/40 flex items-center gap-3",
          collapsed && "justify-center",
        )}>
          <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
            {userName?.[0]?.toUpperCase() || "U"}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-sidebar-foreground truncate">
                  {userName || "User"}
                </p>
                <span className="inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full mt-0.5 bg-primary/10 text-primary">
                  {roleLabel}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 rounded-xl transition-all text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {!collapsed && (
        <div className="px-6 pb-6 space-y-3 text-sm text-sidebar-foreground">
          <Link
            href="/app/settings/organization"
            className="flex items-center gap-3 hover:text-primary transition"
          >
            <Settings className="h-4 w-4" /> Settings
          </Link>
          <button className="flex items-center gap-3 hover:text-primary transition">
            <HelpCircle className="h-4 w-4" /> Support
          </button>
        </div>
      )}
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
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
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/auth/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await res.json();

        if (data.success) {
          const { onboardingStatus, isVerified, mustChangePassword } =
            data.data;
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
      } catch (err) {
        // @ts-ignore
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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/auth/first-password-change`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ newPassword }),
        },
      );
      const data = await res.json();
      if (data.success) {
        setShowPasswordModal(false);
        // Refresh user data
        const userRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/auth/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

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
              <h2 className="font-display text-2xl font-semibold">
                Change your password
              </h2>
              <p className="text-muted-foreground mt-2">
                Since this is your first time logging in, please set a new
                password for your account.
              </p>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  New Password
                </label>
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
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Confirm New Password
                </label>
                <input
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
                  placeholder="••••••••"
                />
              </div>

              {passwordError && (
                <p className="text-destructive text-xs">{passwordError}</p>
              )}

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
      <aside
        className={cn(
          "hidden lg:flex shrink-0 border-r border-sidebar-border flex-col relative transition-all duration-300",
          collapsed ? "w-[76px]" : "w-64",
        )}
      >
        <SidebarContent
          pathname={pathname}
          businessName={businessName}
          userRole={user?.role}
          userName={user?.name}
          selectedFeatures={user?.subscription?.selectedFeatures}
          allowedFeatures={user?.allowedFeatures}
          collapsed={collapsed}
          onLogout={handleLogout}
        />
        <button
          onClick={() => setCollapsed((v: boolean) => !v)}
          className="absolute top-[72px] -right-3.5 z-20 h-7 w-7 rounded-full border border-sidebar-border bg-card flex items-center justify-center shadow-card hover:bg-secondary transition"
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
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
                  userName={user?.name}
                  selectedFeatures={user?.subscription?.selectedFeatures}
                  allowedFeatures={user?.allowedFeatures}
                  onLogout={handleLogout}
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

        <div className="flex-1 overflow-y-auto p-6 sm:p-10">{children}</div>
      </main>
    </div>
  );
}
