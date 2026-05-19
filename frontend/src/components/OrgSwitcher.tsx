import { useState } from "react";
import { Building2, Check, ChevronsUpDown, Plus } from "lucide-react";

const orgs = [
  { id: "acme", name: "Acme Corp", role: "Admin" },
  { id: "atlas", name: "Atlas Media", role: "Staff" },
  { id: "venture", name: "Venture Labs", role: "Admin" },
];

const OrgSwitcher = () => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(orgs[0]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 bg-card border border-border rounded-full pl-2 pr-4 py-1.5 shadow-card hover:bg-secondary transition"
      >
        <div className="h-8 w-8 rounded-full bg-secondary grid place-items-center text-primary">
          <Building2 className="h-4 w-4" />
        </div>
        <div className="text-left">
          <div className="text-sm font-semibold text-foreground leading-tight">{active.name}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{active.role}</div>
        </div>
        <ChevronsUpDown className="h-4 w-4 text-muted-foreground ml-1" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-2xl shadow-deep p-2 z-20">
            <div className="label-eyebrow px-3 py-2">Your organizations</div>
            {orgs.map((o) => (
              <button
                key={o.id}
                onClick={() => { setActive(o); setOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary transition"
              >
                <div className="h-8 w-8 rounded-lg bg-secondary grid place-items-center text-primary">
                  <Building2 className="h-4 w-4" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-semibold text-foreground">{o.name}</div>
                  <div className="text-xs text-muted-foreground">{o.role}</div>
                </div>
                {active.id === o.id && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
            <div className="border-t border-border mt-2 pt-2">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary transition text-sm font-semibold text-primary">
                <Plus className="h-4 w-4" /> Create new organization
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrgSwitcher;
