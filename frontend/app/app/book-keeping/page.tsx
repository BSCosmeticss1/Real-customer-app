"use client";

import { useEffect, useState, useMemo } from "react";
import { BookOpen, Search, Filter } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const MODULES = [
  { value: "", label: "All Modules" },
  { value: "inventory", label: "Inventory" },
  { value: "bookings", label: "Bookings" },
  { value: "invoices", label: "Invoices" },
  { value: "expenses", label: "Expenses" },
  { value: "cashflow", label: "Cashflow" },
  { value: "contacts", label: "Contacts" },
];

const ENTITY_TYPES = [
  { value: "", label: "All Types" },
  { value: "message", label: "Message" },
  { value: "contact", label: "Contact" },
  { value: "product", label: "Product" },
  { value: "stock_movement", label: "Stock Movement" },
  { value: "booking", label: "Booking" },
  { value: "invoice", label: "Invoice" },
  { value: "expense", label: "Expense" },
  { value: "payment", label: "Payment" },
];

const ACTIONS = [
  { value: "", label: "All Actions" },
  { value: "CREATED", label: "Created" },
  { value: "UPDATED", label: "Updated" },
  { value: "DELETED", label: "Deleted" },
  { value: "SENT", label: "Sent" },
  { value: "PAID", label: "Paid" },
  { value: "APPROVED", label: "Approved" },
];

export default function BookKeepingPage() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  const getToken = () => localStorage.getItem("token") || "";

  const fetchData = async () => {
    try {
      const token = getToken();
      const params = new URLSearchParams();
      if (moduleFilter) params.set("module", moduleFilter);
      if (entityFilter) params.set("entityType", entityFilter);
      if (actionFilter) params.set("action", actionFilter);
      params.set("limit", "100");

      const [recordsRes, summaryRes] = await Promise.all([
        fetch(`${API_URL}/book-keeping?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/book-keeping/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const recordsData = await recordsRes.json();
      const summaryData = await summaryRes.json();

      if (!recordsRes.ok || !recordsData.success) {
        setError(recordsData.message || 'Failed to load book keeping records');
      } else {
        setError("");
        setRecords(recordsData.data || []);
      }

      if (!summaryRes.ok || !summaryData.success) {
        console.error('Failed to load summary:', summaryData.message);
      } else {
        setSummary(summaryData.data);
      }
    } catch (error) {
      console.error("Failed to load book keeping:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [moduleFilter, entityFilter, actionFilter]);

  const filteredRecords = useMemo(() => {
    if (!search.trim()) return records;
    const q = search.toLowerCase();
    return records.filter((r) =>
      [r.description, r.module, r.entityType, r.action, r.performedBy].some((v) =>
        String(v || "").toLowerCase().includes(q),
      ),
    );
  }, [records, search]);

  const moduleLabel = (v) => {
    const m = MODULES.find((x) => x.value === v);
    return m ? m.label : v;
  };

  const entityLabel = (v) => {
    const m = ENTITY_TYPES.find((x) => x.value === v);
    return m ? m.label : v;
  };

  const actionColor = (action) => {
    switch (action) {
      case "CREATED":
      case "SENT":
      case "PAID":
      case "APPROVED":
        return "text-emerald-600 bg-emerald-50";
      case "UPDATED":
        return "text-blue-600 bg-blue-50";
      case "DELETED":
        return "text-red-600 bg-red-50";
      default:
        return "text-muted-foreground bg-secondary";
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="label-eyebrow text-primary">Compliance</div>
        <h1 className="font-display text-3xl sm:text-5xl font-semibold text-foreground mt-2">
          Book Keeping
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Complete audit trail of all operations across messaging, inventory, bookings and finance.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-card rounded-2xl p-5 shadow-card">
          <div className="label-eyebrow">Total Records</div>
          <div className="font-display text-3xl font-semibold mt-3">
            {summary?.totalRecords ?? 0}
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 shadow-card">
          <div className="label-eyebrow">Modules Tracked</div>
          <div className="font-display text-3xl font-semibold mt-3">
            {summary?.byModule?.length ?? 0}
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 shadow-card md:col-span-2">
          <div className="label-eyebrow mb-3">Records by Module</div>
          <div className="flex flex-wrap gap-2">
            {summary?.byModule?.map((m) => (
              <span
                key={m.module}
                className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-foreground"
              >
                <span className="h-2 w-2 rounded-full bg-primary" />
                {moduleLabel(m.module)}: {m.count}
              </span>
            ))}
            {(!summary?.byModule || summary.byModule.length === 0) && (
              <span className="text-sm text-muted-foreground">No records yet</span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            {filteredRecords.length} records
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 min-w-[180px]">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                placeholder="Search records..."
              />
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="bg-transparent text-sm text-foreground outline-none"
              >
                {MODULES.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none"
            >
              {ENTITY_TYPES.map((e) => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none"
            >
              {ACTIONS.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-6 py-4 label-eyebrow">Date</th>
                <th className="px-6 py-4 label-eyebrow">Module</th>
                <th className="px-6 py-4 label-eyebrow">Type</th>
                <th className="px-6 py-4 label-eyebrow">Action</th>
                <th className="px-6 py-4 label-eyebrow">Description</th>
                <th className="px-6 py-4 label-eyebrow">Performed By</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    Loading records...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No book keeping records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(record.createdAt).toLocaleString("en-NG", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-2.5 py-1 text-xs font-medium text-foreground capitalize">
                        {moduleLabel(record.module)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground capitalize">
                      {entityLabel(record.entityType)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${actionColor(record.action)}`}
                      >
                        {record.action.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground max-w-xs truncate">
                      {record.description}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {record.performedBy || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
