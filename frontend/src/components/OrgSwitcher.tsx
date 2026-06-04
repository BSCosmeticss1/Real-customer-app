import { useState } from "react";
import { Building2, Check, ChevronsUpDown, Plus } from "lucide-react";

const OrgSwitcher = ({ businessName, userRole }: { businessName?: string; userRole?: string }) => {
  const [open, setOpen] = useState(false);

  const active = {
    id: "active",
    name: businessName || "My Organization",
    role: userRole === 'ADMIN' ? 'Administrator' : 'Staff Member'
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 bg-card border border-border rounded-full pl-2 pr-4 py-1.5 shadow-card hover:bg-secondary transition"
      >
        <div className="h-8 w-8 rounded-full bg-secondary grid place-items-center text-primary">
          <Building2 className="h-4 w-4" />
        </div>
        <div className="text-left max-w-[120px] truncate">
          <div className="text-sm font-semibold text-foreground leading-tight truncate">{active.name}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{active.role}</div>
        </div>
        <ChevronsUpDown className="h-4 w-4 text-muted-foreground ml-1" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-2xl shadow-deep p-2 z-20">
            <div className="label-eyebrow px-3 py-2">Your organization</div>
            <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-secondary transition">
              <div className="h-8 w-8 rounded-lg bg-primary/10 grid place-items-center text-primary">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="flex-1 text-left truncate">
                <div className="text-sm font-semibold text-foreground truncate">{active.name}</div>
                <div className="text-xs text-muted-foreground">{active.role}</div>
              </div>
              <Check className="h-4 w-4 text-primary" />
            </div>
            
            <div className="border-t border-border mt-2 pt-2">
              <button 
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/login";
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-destructive/10 transition text-sm font-semibold text-destructive"
              >
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrgSwitcher;
