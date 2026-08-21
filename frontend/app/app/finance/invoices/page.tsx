"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, FileText, Pencil, Plus, Search, Trash2 } from "lucide-react";

type InvoiceStatus = "Draft" | "Pending" | "Paid" | "Overdue";

type InvoiceItem = {
  id: string;
  productName: string;
  description: string;
  quantity: number;
  price: number;
};

type Invoice = {
  id: string;
  client: string;
  email: string;
  category: string;
  due: string;
  tax: number;
  status: InvoiceStatus;
  notes: string;
  items: InvoiceItem[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);

const createEmptyItem = (): InvoiceItem => ({
  id: `${Date.now()}-${Math.random()}`,
  productName: "",
  description: "",
  quantity: 1,
  price: 0,
});

const mapInvoiceStatus = (status?: string): InvoiceStatus => {
  const value = (status || "draft").toLowerCase();

  switch (value) {
    case "paid":
      return "Paid";
    case "pending":
      return "Pending";
    case "overdue":
      return "Overdue";
    default:
      return "Draft";
  }
};

const normalizeInvoice = (invoice: any): Invoice => {
  const mappedItems = (invoice.items || []).map((item: any, index: number) => ({
    id: item.id || `${invoice.id || "inv"}-${index}`,
    productName: item.productName || item.description || "Line item",
    description: item.description || item.productName || "",
    quantity: Number(item.quantity || 1),
    price: Number(item.price || 0),
  }));

  return {
    id: invoice.invoiceNumber || invoice.id,
    client: invoice.client || "Unknown client",
    email: invoice.clientEmail || invoice.email || "",
    category: invoice.category || "Consulting",
    due: invoice.dueDate
      ? new Date(invoice.dueDate).toISOString().slice(0, 10)
      : "",
    tax: Number(invoice.tax || 0),
    status: mapInvoiceStatus(invoice.status),
    notes: invoice.notes || "",
    items: mappedItems.length ? mappedItems : [createEmptyItem()],
  };
};

const emptyForm = {
  id: "",
  client: "",
  email: "",
  category: "",
  due: "",
  tax: "0",
  status: "Draft" as InvoiceStatus,
  notes: "",
  items: [createEmptyItem()],
};

function calculateInvoiceTotals(invoice: Invoice) {
  const subtotal = invoice.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );
  const taxAmount = subtotal * (invoice.tax / 100);
  const total = subtotal + taxAmount;

  return { subtotal, taxAmount, total };
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | InvoiceStatus>(
    "All",
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const getToken = () => localStorage.getItem("token") || "";

  const fetchInvoices = async () => {
    try {
      const res = await fetch(`${API_URL}/invoices?limit=100`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const data = await res.json();

      if (data.success) {
        setInvoices((data.data || []).map(normalizeInvoice));
      }
    } catch (error) {
      console.error("Failed to load invoices:", error);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesSearch = [
        invoice.id,
        invoice.client,
        invoice.email,
        invoice.category,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || invoice.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, statusFilter]);

  const stats = useMemo(() => {
    const paid = invoices
      .filter((invoice) => invoice.status === "Paid")
      .reduce((sum, invoice) => sum + calculateInvoiceTotals(invoice).total, 0);

    const pending = invoices
      .filter((invoice) => ["Pending", "Overdue"].includes(invoice.status))
      .reduce((sum, invoice) => sum + calculateInvoiceTotals(invoice).total, 0);

    const draft = invoices
      .filter((invoice) => invoice.status === "Draft")
      .reduce((sum, invoice) => sum + calculateInvoiceTotals(invoice).total, 0);

    return { paid, pending, draft };
  }, [invoices]);

  const openCreateForm = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      id: `INV-${String(invoices.length + 1010).padStart(4, "0")}`,
      items: [createEmptyItem()],
    });
    setIsFormOpen(true);
  };

  const openEditForm = (invoice: Invoice) => {
    setEditingId(invoice.id);
    setForm({
      id: invoice.id,
      client: invoice.client,
      email: invoice.email,
      category: invoice.category,
      due: invoice.due,
      tax: String(invoice.tax),
      status: invoice.status,
      notes: invoice.notes,
      items: invoice.items.length > 0 ? invoice.items : [createEmptyItem()],
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async () => {
    const tax = Number(form.tax);
    const payloadItems = form.items.filter(
      (item) =>
        item.productName.trim() || item.description.trim() || item.price > 0,
    );

    if (
      !form.client.trim() ||
      !form.email.trim() ||
      !form.category.trim() ||
      !form.due ||
      payloadItems.length === 0
    ) {
      return;
    }

    const payload = {
      client: form.client.trim(),
      clientEmail: form.email.trim(),
      dueDate: form.due,
      tax: Number.isFinite(tax) ? tax : 0,
      status: form.status.toLowerCase(),
      notes: form.notes.trim(),
      items: payloadItems.map((item) => ({
        description:
          item.productName.trim() || item.description.trim() || "Line item",
        quantity: Number(item.quantity) || 1,
        price: Number(item.price) || 0,
      })),
    };

    try {
      const url = editingId
        ? `${API_URL}/invoices/${editingId}`
        : `${API_URL}/invoices`;
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
        await fetchInvoices();
      }
    } catch (error) {
      console.error("Failed to save invoice:", error);
    }

    setIsFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleDelete = async (invoiceId: string) => {
    try {
      const res = await fetch(`${API_URL}/invoices/${invoiceId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (res.ok) {
        await fetchInvoices();
      }
    } catch (error) {
      console.error("Failed to delete invoice:", error);
    }
  };

  const setStatus = async (invoiceId: string, nextStatus: InvoiceStatus) => {
    try {
      const res = await fetch(`${API_URL}/invoices/${invoiceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status: nextStatus.toLowerCase() }),
      });

      if (res.ok) {
        await fetchInvoices();
      }
    } catch (error) {
      console.error("Failed to update invoice status:", error);
    }
  };

  const exportInvoices = () => {
    const rows = [
      [
        "Invoice ID",
        "Client",
        "Email",
        "Due Date",
        "Status",
        "Subtotal",
        "Tax",
        "Total",
      ],
      ...invoices.map((invoice) => {
        const totals = calculateInvoiceTotals(invoice);
        return [
          invoice.id,
          invoice.client,
          invoice.email,
          invoice.due,
          invoice.status,
          totals.subtotal,
          totals.taxAmount,
          totals.total,
        ];
      }),
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
    link.download = "invoices.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="label-eyebrow text-primary">Finance</div>
          <h1 className="font-display text-3xl sm:text-5xl font-semibold mt-2">
            Invoice operations
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 min-w-[220px]">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              placeholder="Search client or invoice"
            />
          </div>
          <button
            onClick={exportInvoices}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
          >
            <Plus className="h-4 w-4" /> New invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-card rounded-2xl p-5 shadow-card">
          <div className="label-eyebrow">Paid</div>
          <div className="font-display text-3xl font-semibold mt-3">
            {formatCurrency(stats.paid)}
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 shadow-card">
          <div className="label-eyebrow">Outstanding</div>
          <div className="font-display text-3xl font-semibold mt-3">
            {formatCurrency(stats.pending)}
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 shadow-card">
          <div className="label-eyebrow">Drafts</div>
          <div className="font-display text-3xl font-semibold mt-3">
            {formatCurrency(stats.draft)}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            {filteredInvoices.length} invoices
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as "All" | InvoiceStatus)
            }
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
          >
            <option value="All">All statuses</option>
            <option value="Draft">Draft</option>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-6 py-4 label-eyebrow">Invoice</th>
                <th className="px-6 py-4 label-eyebrow">Client</th>
                <th className="px-6 py-4 label-eyebrow">Due date</th>
                <th className="px-6 py-4 label-eyebrow">Total</th>
                <th className="px-6 py-4 label-eyebrow">Status</th>
                <th className="px-6 py-4 label-eyebrow text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => {
                const totals = calculateInvoiceTotals(invoice);
                return (
                  <tr
                    key={invoice.id}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">
                            {invoice.id}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {invoice.category}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">
                        {invoice.client}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {invoice.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {invoice.due}
                    </td>
                    <td className="px-6 py-4 font-semibold text-foreground">
                      {formatCurrency(totals.total)}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={invoice.status}
                        onChange={(event) =>
                          setStatus(
                            invoice.id,
                            event.target.value as InvoiceStatus,
                          )
                        }
                        className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground outline-none"
                      >
                        <option value="Draft">Draft</option>
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Overdue">Overdue</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setStatus(invoice.id, "Paid")}
                          className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2 py-1.5 text-[11px] font-medium text-emerald-700"
                        >
                          Mark paid
                        </button>
                        <button
                          onClick={() => openEditForm(invoice)}
                          className="rounded-lg border border-border bg-card p-2 text-foreground"
                          aria-label={`Edit invoice ${invoice.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(invoice.id)}
                          className="rounded-lg border border-red-500/40 bg-red-500/10 p-2 text-red-600"
                          aria-label={`Delete invoice ${invoice.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="label-eyebrow text-primary">Invoice</div>
                <h2 className="font-display text-3xl font-semibold mt-1">
                  {editingId ? "Edit invoice" : "Create invoice"}
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
                <span className="text-muted-foreground">Invoice ID</span>
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
                      status: event.target.value as InvoiceStatus,
                    }))
                  }
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none"
                >
                  <option value="Draft">Draft</option>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </label>

              <label className="space-y-2 text-sm md:col-span-2">
                <span className="text-muted-foreground">Client</span>
                <input
                  value={form.client}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      client: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none"
                />
              </label>

              <label className="space-y-2 text-sm md:col-span-2">
                <span className="text-muted-foreground">Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none"
                />
              </label>

              <label className="space-y-2 text-sm">
                <span className="text-muted-foreground">Category</span>
                <input
                  value={form.category}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none"
                />
              </label>

              <label className="space-y-2 text-sm">
                <span className="text-muted-foreground">Tax %</span>
                <input
                  type="number"
                  min="0"
                  value={form.tax}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      tax: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none"
                />
              </label>

              <label className="space-y-2 text-sm md:col-span-2">
                <span className="text-muted-foreground">Due date</span>
                <input
                  type="date"
                  value={form.due}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      due: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none"
                />
              </label>

              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-2xl font-semibold">
                    Line items
                  </h3>
                  <button
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        items: [...current.items, createEmptyItem()],
                      }))
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
                  >
                    <Plus className="h-4 w-4" /> Add item
                  </button>
                </div>

                <div className="space-y-3">
                  {form.items.map((item, index) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-1 md:grid-cols-12 gap-3 rounded-xl border border-border p-3"
                    >
                      <input
                        className="md:col-span-3 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
                        placeholder="Product name"
                        value={item.productName}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            items: current.items.map((row, rowIndex) =>
                              rowIndex === index
                                ? { ...row, productName: event.target.value }
                                : row,
                            ),
                          }))
                        }
                      />
                      <input
                        className="md:col-span-4 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
                        placeholder="Description"
                        value={item.description}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            items: current.items.map((row, rowIndex) =>
                              rowIndex === index
                                ? { ...row, description: event.target.value }
                                : row,
                            ),
                          }))
                        }
                      />
                      <input
                        type="number"
                        min="1"
                        className="md:col-span-2 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            items: current.items.map((row, rowIndex) =>
                              rowIndex === index
                                ? {
                                    ...row,
                                    quantity: Number(event.target.value) || 1,
                                  }
                                : row,
                            ),
                          }))
                        }
                      />
                      <input
                        type="number"
                        min="0"
                        className="md:col-span-2 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
                        placeholder="Price"
                        value={item.price}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            items: current.items.map((row, rowIndex) =>
                              rowIndex === index
                                ? {
                                    ...row,
                                    price: Number(event.target.value) || 0,
                                  }
                                : row,
                            ),
                          }))
                        }
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            items:
                              current.items.length > 1
                                ? current.items.filter(
                                    (_, rowIndex) => rowIndex !== index,
                                  )
                                : current.items,
                          }))
                        }
                        className="md:col-span-1 rounded-xl border border-red-500/30 bg-red-500/10 px-2 py-2 text-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

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
                {editingId ? "Save changes" : "Create invoice"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
