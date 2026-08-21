"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type MovementType = "incoming" | "outgoing";

interface Movement {
  id: string;
  type: MovementType;
  quantity: number;
  previousQuantity: number | null;
  newQuantity: number | null;
  reference: string | null;
  notes: string | null;
  createdAt: string;
  product: { name: string; sku: string; category: string | null };
  user?: { id: string; name: string } | null;
}

interface UserOption {
  id: string;
  name: string;
}

const PAGE_SIZE = 20;

export default function StockMovementsPage() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<"all" | MovementType>("all");
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(
    undefined,
  );
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [stats, setStats] = useState({ total: 0, incoming: 0, outgoing: 0 });
  const { toast } = useToast();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const getToken = () => localStorage.getItem("token");

  const buildParams = useCallback(
    (overrides: Record<string, string | number | undefined> = {}) => {
      const params = new URLSearchParams();
      const merged = {
        page,
        limit: PAGE_SIZE,
        type: typeFilter === "all" ? undefined : typeFilter,
        userId: selectedUserId,
        ...overrides,
      };
      Object.entries(merged).forEach(([key, value]) => {
        if (value !== undefined && value !== "") params.append(key, String(value));
      });
      return params;
    },
    [page, typeFilter, selectedUserId],
  );

  const fetchMovements = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_URL}/inventory/movements?${buildParams().toString()}`,
        { headers: { Authorization: `Bearer ${getToken()}` } },
      );
      const data = await res.json();
      if (data.success) {
        setMovements(data.data);
        setPages(data.pagination?.pages || 1);
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Failed to fetch stock movements:", err);
      toast({
        title: "Error",
        description: "Failed to load stock movements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  const fetchStats = useCallback(async () => {
    try {
      const token = getToken();
      const [totalRes, inRes, outRes] = await Promise.all([
        fetch(
          `${API_URL}/inventory/movements?${buildParams({ type: undefined, page: 1, limit: 1 }).toString()}`,
          { headers: { Authorization: `Bearer ${token}` } },
        ),
        fetch(
          `${API_URL}/inventory/movements?${buildParams({ type: "incoming", page: 1, limit: 1 }).toString()}`,
          { headers: { Authorization: `Bearer ${token}` } },
        ),
        fetch(
          `${API_URL}/inventory/movements?${buildParams({ type: "outgoing", page: 1, limit: 1 }).toString()}`,
          { headers: { Authorization: `Bearer ${token}` } },
        ),
      ]);
      const [totalData, inData, outData] = await Promise.all([
        totalRes.json(),
        inRes.json(),
        outRes.json(),
      ]);
      setStats({
        total: totalData?.pagination?.total || 0,
        incoming: inData?.pagination?.total || 0,
        outgoing: outData?.pagination?.total || 0,
      });
    } catch (err) {
      console.error("Failed to fetch movement stats:", err);
    }
  }, [buildParams]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/inventory/users`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [typeFilter, selectedUserId]);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  useEffect(() => {
    fetchStats();
  }, [selectedUserId]);

  return (
    <div className="space-y-8">
      {/* Title row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="label-eyebrow text-primary">Inventory Flow</div>
          <h1 className="font-display text-3xl sm:text-5xl font-semibold text-foreground mt-2">
            Stock Movement
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Track every incoming and outgoing movement across your inventory.
          </p>
        </div>
        <Button
          asChild
          className="rounded-xl px-6 h-12 font-medium shadow-deep bg-primary hover:bg-primary-glow"
        >
          <Link href="/app/inventory">
            <Plus className="h-4 w-4 mr-2" /> Record Movement
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-2xl bg-card p-6 shadow-card flex items-center gap-4">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
            <ArrowLeftRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <div className="label-eyebrow text-[10px] sm:text-xs">
              Total Movements
            </div>
            <div className="text-xl sm:text-2xl font-semibold text-foreground">
              {stats.total}
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-card p-6 shadow-card flex items-center gap-4">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-emerald-500/10 text-emerald-500 grid place-items-center shrink-0">
            <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <div className="label-eyebrow text-[10px] sm:text-xs text-emerald-500">
              Incoming
            </div>
            <div className="text-xl sm:text-2xl font-semibold text-emerald-500">
              {stats.incoming}
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-card p-6 shadow-card flex items-center gap-4">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-red-500/10 text-red-500 grid place-items-center shrink-0">
            <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <div className="label-eyebrow text-[10px] sm:text-xs text-red-500">
              Outgoing
            </div>
            <div className="text-xl sm:text-2xl font-semibold text-red-500">
              {stats.outgoing}
            </div>
          </div>
        </div>
      </div>

      {/* Filters + table */}
      <div className="rounded-2xl bg-card border border-border shadow-card overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {(["all", "incoming", "outgoing"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={cn(
                  "rounded-xl px-4 py-2 text-sm font-medium transition",
                  typeFilter === type
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-background text-foreground",
                )}
              >
                {type === "all" ? "All movements" : type}
              </button>
            ))}
          </div>
          {users.length > 1 && (
            <div className="w-full md:w-56">
              <Select
                value={selectedUserId || "all"}
                onValueChange={(value: string) =>
                  setSelectedUserId(value === "all" ? undefined : value)
                }
              >
                <SelectTrigger className="rounded-xl border-border bg-background">
                  <SelectValue placeholder="Filter by user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {users.map((user: UserOption) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading stock movements...
            </div>
          ) : movements.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No stock movements found
            </div>
          ) : (
            <table className="w-full min-w-[860px] text-left">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
                  <th className="px-4 sm:px-6 py-4">Product</th>
                  <th className="px-4 sm:px-6 py-4">Type</th>
                  <th className="px-4 sm:px-6 py-4">Quantity</th>
                  <th className="px-4 sm:px-6 py-4">Stock Change</th>
                  <th className="px-4 sm:px-6 py-4">Reference</th>
                  <th className="px-4 sm:px-6 py-4">Recorded By</th>
                  <th className="px-4 sm:px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {movements.map((movement: Movement) => (
                  <tr key={movement.id} className="hover:bg-muted/20">
                    <td className="px-4 sm:px-6 py-4">
                      <div className="font-medium text-foreground text-sm">
                        {movement.product?.name || "Unknown product"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {movement.product?.sku}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium",
                          movement.type === "incoming"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-red-500/10 text-red-500",
                        )}
                      >
                        {movement.type === "incoming" ? (
                          <TrendingUp className="h-3.5 w-3.5" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5" />
                        )}
                        {movement.type}
                      </span>
                    </td>
                    <td
                      className={cn(
                        "px-4 sm:px-6 py-4 text-base font-semibold",
                        movement.type === "incoming"
                          ? "text-emerald-500"
                          : "text-red-500",
                      )}
                    >
                      {movement.type === "incoming" ? "+" : "-"}
                      {movement.quantity}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-muted-foreground">
                      {movement.previousQuantity ?? "—"} →{" "}
                      {movement.newQuantity ?? "—"}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-muted-foreground">
                      {movement.reference || "—"}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-muted-foreground">
                      {movement.user?.name || "—"}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(movement.createdAt).toLocaleString([], {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {pages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              disabled={page <= 1}
              onClick={() => setPage((p: number) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <span className="text-xs sm:text-sm text-muted-foreground">
              Page {page} of {pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              disabled={page >= pages}
              onClick={() => setPage((p: number) => Math.min(pages, p + 1))}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
