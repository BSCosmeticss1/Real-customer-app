"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Plus, Search, Bell, Grid3x3 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-primary text-primary-foreground grid place-items-center shadow-deep">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5"><path d="M12 2L4 22h3l1.5-4h7L17 22h3L12 2zm-2.2 13L12 8.5 14.2 15H9.8z" fill="currentColor"/></svg>
          </div>
          <div>
            <div className="font-display text-lg font-semibold text-foreground leading-none">Real customer App</div>
            <div className="label-eyebrow mt-1.5">Platform Admin</div>
          </div>
        </div>

        <nav className="px-3 mt-2 space-y-1 flex-1">
          <Link
            href="/admin/tenants"
            className={pathname === "/admin/tenants" 
              ? "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium bg-sidebar-accent text-sidebar-accent-foreground shadow-card"
              : "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/60"
            }
          >
            <Building2 className="h-[18px] w-[18px]" />
            Tenants
          </Link>
        </nav>

        <div className="p-4">
          <button className="w-full bg-primary text-primary-foreground rounded-xl py-3.5 font-medium flex items-center justify-center gap-2 shadow-deep hover:bg-primary-glow transition">
            <Plus className="h-4 w-4" /> New Organization
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-4 px-10 py-5">
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search organizations…"
                className="w-full bg-card border border-border rounded-full pl-11 pr-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <button className="relative h-10 w-10 grid place-items-center rounded-full hover:bg-secondary">
              <Bell className="h-5 w-5 text-foreground" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive" />
            </button>
            <button className="h-10 w-10 grid place-items-center rounded-full hover:bg-secondary">
              <Grid3x3 className="h-5 w-5 text-foreground" />
            </button>
            <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground grid place-items-center text-sm font-semibold">JD</div>
          </div>
        </header>

        <main className="flex-1 px-10 pb-12">
          {children}
        </main>
      </div>
    </div>
  );
}