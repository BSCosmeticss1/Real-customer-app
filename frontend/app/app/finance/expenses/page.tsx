"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Pencil, Plus, Receipt, Search, Trash2 } from "lucide-react";

type ExpenseStatus = "Pending" | "Approved" | "Paid";

type Expense = {
  id: string;
  vendor: string;
  category: string;
  date: string;
  amount: number;
  status: ExpenseStatus;
  paymentMethod: string;
  notes: string;
};

const categoryOptions = [
  "Operations",
  "Marketing",
  "Payroll",
  "Utilities",
  "Rent",
  "Travel",
  "Software",
  "Other",
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);

const emptyForm = {
  id: "",
  vendor: "",
  category: "Operations",
  date: "",
  amount: "",
  status: "Pending" as ExpenseStatus,
  paymentMethod: "Bank transfer",
  notes: "",
};

const normalizeExpense = (expense: any): Expense => ({
  id: expense.id,
  vendor: expense.description || expense.vendor || "Expense",
  category: expense.category || "Operations",
  date: expense.date ? new Date(expense.date).toISOString().slice(0, 10) : "",
  amount: Number(expense.amount || 0),
  status: (expense.status || "pending") as ExpenseStatus,
  paymentMethod: expense.paymentMethod || "Bank transfer",
  notes: expense.notes || "",
});

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | ExpenseStatus>(
    "All",
  );
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const getToken = () => localStorage.getItem("token") || "";

  const fetchExpenses = async () => {
    try {
      const res = await fetch(`${API_URL}/expenses?limit=100`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setExpenses((data.data || []).map(normalizeExpense));
      }
    } catch (error) {
      console.error("Failed to load expenses:", error);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesSearch = [
        expense.id,
        expense.vendor,
        expense.category,
        expense.paymentMethod,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || expense.status === statusFilter;
      const matchesCategory =
        categoryFilter === "All" || expense.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [expenses, search, statusFilter, categoryFilter]);

  const stats = useMemo(() => {
    const total = expenses.reduce((sum, item) => sum + item.amount, 0);
    const pending = expenses
      .filter((item) => item.status === "Pending")
      .reduce((sum, item) => sum + item.amount, 0);
    const paid = expenses
      .filter((item) => item.status === "Paid")
      .reduce((sum, item) => sum + item.amount, 0);
    const records = expenses.length;

    return { total, pending, paid, records };
  }, [expenses]);

  const openCreateForm = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      id: `EXP-${String(expenses.length + 1021).padStart(4, "0")}`,
    });
    setIsFormOpen(true);
  };

  const openEditForm = (expense: Expense) => {
    setEditingId(expense.id);
    setForm({
      id: expense.id,
      vendor: expense.vendor,
      category: expense.category,
      date: expense.date,
      amount: String(expense.amount),
      status: expense.status,
      paymentMethod: expense.paymentMethod,
      notes: expense.notes,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async () => {
    const amount = Number(form.amount);
    if (
      !form.vendor.trim() ||
      !form.category.trim() ||
      !form.date ||
      !Number.isFinite(amount)
    ) {
      return;
    }

    const payload = {
      description: form.vendor.trim(),
      category: form.category.trim(),
      date: form.date,
      amount,
      notes: form.notes.trim(),
      paymentMethod: form.paymentMethod.trim(),
      status: form.status.toLowerCase(),
    };

    try {
      const url = editingId
        ? `${API_URL}/expenses/${editingId}`
        : `${API_URL}/expenses`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchExpenses();
      }
    } catch (error) {
      console.error("Failed to save expense:", error);
    }

    setIsFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleDelete = async (expenseId: string) => {
    try {
      const res = await fetch(`${API_URL}/expenses/${expenseId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (res.ok) {
        await fetchExpenses();
      }
    } catch (error) {
      console.error("Failed to delete expense:", error);
    }
  };

  const setStatus = async (expenseId: string, nextStatus: ExpenseStatus) => {
    try {
      const res = await fetch(`${API_URL}/expenses/${expenseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status: nextStatus.toLowerCase() }),
      });

      if (res.ok) {
        await fetchExpenses();
      }
    } catch (error) {
      console.error("Failed to update expense status:", error);
    }
  };

  const exportExpenses = () => {
    const rows = [
      [
        "Expense ID",
        "Vendor",
        "Category",
        "Date",
        "Amount",
        "Status",
        "Payment Method",
        "Notes",
      ],
      ...expenses.map((expense) => [
        expense.id,
        expense.vendor,
        expense.category,
        expense.date,
        expense.amount,
        expense.status,
        expense.paymentMethod,
        expense.notes,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "expenses.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="label-eyebrow text-primary">Finance</div>
          <h1 className="font-display text-3xl sm:text-5xl font-semibold mt-2">
            Expense operations
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 min-w-[220px]">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              placeholder="Search vendor or category"
            />
          </div>
          <button
            onClick={exportExpenses}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
          >
            <Plus className="h-4 w-4" /> New expense
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-card rounded-2xl p-5 shadow-card">
          <div className="label-eyebrow">Total spend</div>
          <div className="font-display text-3xl font-semibold mt-3">
            {formatCurrency(stats.total)}
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 shadow-card">
          <div className="label-eyebrow">Pending</div>
          <div className="font-display text-3xl font-semibold mt-3">
            {formatCurrency(stats.pending)}
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 shadow-card">
          <div className="label-eyebrow">Paid</div>
          <div className="font-display text-3xl font-semibold mt-3">
            {formatCurrency(stats.paid)}
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 shadow-card">
          <div className="label-eyebrow">Records</div>
          <div className="font-display text-3xl font-semibold mt-3">
            {stats.records}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Receipt className="h-4 w-4" />
            {filteredExpenses.length} expenses
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
            >
              <option value="All">All categories</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as "All" | ExpenseStatus)
              }
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
            >
              <option value="All">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-6 py-4 label-eyebrow">Expense</th>
                <th className="px-6 py-4 label-eyebrow">Category</th>
                <th className="px-6 py-4 label-eyebrow">Date</th>
                <th className="px-6 py-4 label-eyebrow">Amount</th>
                <th className="px-6 py-4 label-eyebrow">Status</th>
                <th className="px-6 py-4 label-eyebrow text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((expense) => (
                <tr
                  key={expense.id}
                  className="border-b border-border last:border-b-0"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2 text-primary">
                        <Receipt className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          {expense.vendor}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {expense.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-foreground">
                    {expense.category}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {expense.date}
                  </td>
                  <td className="px-6 py-4 font-semibold text-foreground">
                    {formatCurrency(expense.amount)}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={expense.status}
                      onChange={(event) =>
                        setStatus(
                          expense.id,
                          event.target.value as ExpenseStatus,
                        )
                      }
                      className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground outline-none"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditForm(expense)}
                        className="rounded-lg border border-border bg-card p-2 text-foreground"
                        aria-label={`Edit expense ${expense.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="rounded-lg border border-red-500/40 bg-red-500/10 p-2 text-red-600"
                        aria-label={`Delete expense ${expense.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="label-eyebrow text-primary">Expense</div>
                <h2 className="font-display text-3xl font-semibold mt-1">
                  {editingId ? "Edit expense" : "Create expense"}
                </h2>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="rounded-xl border border-border px-3 py-2 text-sm"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-2 text-sm">
                <span className="text-muted-foreground">Expense ID</span>
                <input
                  value={form.id}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      id: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none"
                />
              </label>

              <label className="space-y-2 text-sm">
                <span className="text-muted-foreground">Status</span>
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.value as ExpenseStatus,
                    }))
                  }
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Paid">Paid</option>
                </select>
              </label>

              <label className="space-y-2 text-sm md:col-span-2">
                <span className="text-muted-foreground">Vendor</span>
                <input
                  value={form.vendor}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      vendor: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none"
                />
              </label>

              <label className="space-y-2 text-sm">
                <span className="text-muted-foreground">Category</span>
                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none"
                >
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm">
                <span className="text-muted-foreground">Amount</span>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      amount: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none"
                />
              </label>

              <label className="space-y-2 text-sm">
                <span className="text-muted-foreground">Date</span>
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      date: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none"
                />
              </label>

              <label className="space-y-2 text-sm">
                <span className="text-muted-foreground">Payment method</span>
                <input
                  value={form.paymentMethod}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      paymentMethod: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none"
                />
              </label>

              <label className="space-y-2 text-sm md:col-span-2">
                <span className="text-muted-foreground">Notes</span>
                <textarea
                  value={form.notes}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsFormOpen(false)}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
              >
                {editingId ? "Save changes" : "Create expense"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
