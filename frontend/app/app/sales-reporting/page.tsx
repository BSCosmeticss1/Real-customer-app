"use client";

import { Plus, X, TrendingUp, TrendingDown, DollarSign, ShoppingCart, CheckCircle2, Clock, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

interface SalesReportRow {
  id: string;
  serialNumber: number;
  customerName: string;
  customerAddress: string;
  quantity: number;
  item: string;
  amountPaid: number;
  paid: boolean;
  balance: number;
  date: string;
  accountHistory: string;
}

const emptyRow: Omit<SalesReportRow, "id"> = {
  serialNumber: 0,
  customerName: "",
  customerAddress: "",
  quantity: 1,
  item: "",
  amountPaid: 0,
  paid: false,
  balance: 0,
  date: new Date().toISOString().split("T")[0],
  accountHistory: "",
};

export default function SalesReportingPage() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<SalesReportRow, "id">>(emptyRow);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["salesStats"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/sales-reports/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  const { data: reports, isLoading: reportsLoading, refetch } = useQuery({
    queryKey: ["salesReports"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/sales-reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch reports");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/sales-reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to create report");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Sales report added successfully!");
      setShowAddModal(false);
      setFormData(emptyRow);
      queryClient.invalidateQueries({ queryKey: ["salesReports"] });
      queryClient.invalidateQueries({ queryKey: ["salesStats"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to create report"),
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/sales-reports/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to update report");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Sales report updated successfully!");
      setEditingId(null);
      setFormData(emptyRow);
      queryClient.invalidateQueries({ queryKey: ["salesReports"] });
      queryClient.invalidateQueries({ queryKey: ["salesStats"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to update report"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/sales-reports/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete report");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Sales report deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["salesReports"] });
      queryClient.invalidateQueries({ queryKey: ["salesStats"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete report"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.item || !formData.date) {
      toast.error("Customer Name, Item, and Date are required");
      return;
    }
    if (editingId) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const startEdit = (report: SalesReportRow) => {
    setEditingId(report.id);
    setFormData({
      serialNumber: report.serialNumber,
      customerName: report.customerName,
      customerAddress: report.customerAddress,
      quantity: report.quantity,
      item: report.item,
      amountPaid: report.amountPaid,
      paid: report.paid,
      balance: report.balance,
      date: report.date.split("T")[0],
      accountHistory: report.accountHistory,
    });
    setShowAddModal(true);
  };

  const handleExport = () => {
    const rows = reports || [];
    if (rows.length === 0) {
      toast.error("No data to export");
      return;
    }
    const headers = ["N/S", "Customer Name", "Customer Address", "Quantity", "Item", "Amount Paid", "Paid", "Balance", "Date", "Account History"];
    const csvContent = [
      headers.join(","),
      ...rows.map((r: SalesReportRow) =>
        [
          r.serialNumber,
          `"${r.customerName}"`,
          `"${r.customerAddress || ""}"`,
          r.quantity,
          `"${r.item}"`,
          r.amountPaid,
          r.paid ? "Yes" : "No",
          r.balance,
          format(new Date(r.date), "yyyy-MM-dd"),
          `"${(r.accountHistory || "").replace(/"/g, '""')}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported successfully!");
  };

  const salesData = reports || [];
  const totalSales = salesData.reduce((sum: number, r: SalesReportRow) => sum + (r.amountPaid || 0), 0);
  const totalBalance = salesData.reduce((sum: number, r: SalesReportRow) => sum + (r.balance || 0), 0);
  const paidCount = salesData.filter((r: SalesReportRow) => r.paid).length;
  const pendingCount = salesData.filter((r: SalesReportRow) => !r.paid).length;

  if (statsLoading || reportsLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="h-4 bg-secondary rounded w-32 mb-2" />
            <div className="h-8 bg-secondary rounded w-64" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="rounded-2xl shadow-card border-none bg-card animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <div className="h-4 bg-secondary rounded w-24" />
              </CardHeader>
              <CardContent>
                <div className="h-10 bg-secondary rounded w-32" />
                <div className="h-4 bg-secondary rounded w-40 mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="label-eyebrow text-primary">Performance Metrics</div>
          <h1 className="font-display text-3xl sm:text-5xl font-semibold text-foreground mt-2">Sales Reporting Sheet</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport} className="rounded-xl px-4 sm:px-6 h-12 font-medium text-xs sm:text-sm">
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
          <Button onClick={() => { setEditingId(null); setFormData(emptyRow); setShowAddModal(true); }} className="rounded-xl px-4 sm:px-6 h-12 font-medium shadow-deep bg-primary hover:bg-primary-glow text-xs sm:text-sm">
            <Plus className="h-4 w-4 mr-2" /> Add Sale
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="rounded-2xl shadow-card border-none bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium label-eyebrow">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">₦{totalSales.toLocaleString()}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">All time revenue</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-card border-none bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium label-eyebrow">Total Records</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{salesData.length}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Sales entries</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-card border-none bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium label-eyebrow">Paid</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-success">{paidCount}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Fully paid orders</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-card border-none bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium label-eyebrow">Pending Balance</CardTitle>
            <Clock className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-destructive">₦{totalBalance.toLocaleString()}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{pendingCount} unpaid orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Table */}
      <div className="rounded-2xl bg-card p-4 sm:p-7 shadow-card border border-border overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl sm:text-2xl font-semibold">Sales Records</h2>
          <span className="text-xs text-muted-foreground">{salesData.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="text-muted-foreground text-[10px] sm:text-xs font-semibold uppercase tracking-wider border-b border-border">
                <th className="pb-4 w-16">N/S</th>
                <th className="pb-4">Customer Name</th>
                <th className="pb-4">Customer Address</th>
                <th className="pb-4 text-center">Qty</th>
                <th className="pb-4">Item</th>
                <th className="pb-4 text-right">Amount Paid</th>
                <th className="pb-4 text-center">Paid</th>
                <th className="pb-4 text-right">Balance</th>
                <th className="pb-4">Date</th>
                <th className="pb-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {salesData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-muted-foreground">
                    No sales records yet. Click &quot;Add Sale&quot; to create one.
                  </td>
                </tr>
              ) : (
                salesData.map((report: SalesReportRow) => (
                  <tr key={report.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-4 text-sm font-medium text-muted-foreground">{report.serialNumber}</td>
                    <td className="py-4">
                      <div className="font-medium text-foreground text-sm">{report.customerName}</div>
                    </td>
                    <td className="py-4 text-xs sm:text-sm text-muted-foreground max-w-[200px] truncate">{report.customerAddress}</td>
                    <td className="py-4 text-center text-sm text-foreground">{report.quantity}</td>
                    <td className="py-4 text-xs sm:text-sm text-foreground max-w-[150px] truncate">{report.item}</td>
                    <td className="py-4 text-right font-medium text-foreground text-sm">
                      ₦{report.amountPaid?.toLocaleString() || 0}
                    </td>
                    <td className="py-4 text-center">
                      <Badge variant={report.paid ? "default" : "destructive"} className="rounded-lg font-normal text-[10px] sm:text-xs">
                        {report.paid ? "Yes" : "No"}
                      </Badge>
                    </td>
                    <td className="py-4 text-right font-medium text-sm">
                      <span className={report.balance > 0 ? "text-destructive" : "text-success"}>
                        ₦{report.balance?.toLocaleString() || 0}
                      </span>
                    </td>
                    <td className="py-4 text-xs sm:text-sm text-muted-foreground">
                      {format(new Date(report.date), "MMM dd, yyyy")}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEdit(report)}
                          className="text-xs text-primary hover:text-primary-glow font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(report.id)}
                          className="text-xs text-destructive hover:text-destructive/80 font-medium flex items-center gap-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-card border border-border rounded-3xl shadow-deep w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
              <h3 className="font-display text-2xl font-semibold">{editingId ? "Edit Sale" : "New Sale"}</h3>
              <button onClick={() => { setShowAddModal(false); setEditingId(null); setFormData(emptyRow); }}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">N/S (Serial No)</label>
                  <input
                    type="number"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: parseInt(e.target.value) || 0 })}
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Auto-assigned"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Enter customer name"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Customer Address</label>
                  <input
                    type="text"
                    value={formData.customerAddress}
                    onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Enter customer address"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Item *</label>
                  <input
                    type="text"
                    required
                    value={formData.item}
                    onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Enter item name"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Amount Paid</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amountPaid}
                    onChange={(e) => setFormData({ ...formData, amountPaid: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Balance</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.paid}
                      onChange={(e) => setFormData({ ...formData, paid: e.target.checked })}
                      className="accent-primary h-4 w-4"
                    />
                    <span className="text-sm font-medium text-foreground">Mark as Paid</span>
                  </label>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Account History</label>
                  <textarea
                    value={formData.accountHistory}
                    onChange={(e) => setFormData({ ...formData, accountHistory: e.target.value })}
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Enter account history notes"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingId(null); setFormData(emptyRow); }}
                  className="flex-1 bg-secondary text-foreground rounded-xl py-3 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 bg-primary text-primary-foreground rounded-xl py-3 font-semibold shadow-deep hover:bg-primary-glow transition disabled:opacity-50"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : editingId ? "Update Sale" : "Add Sale"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-card border border-border rounded-3xl shadow-deep w-full max-w-sm">
            <div className="p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive grid place-items-center mx-auto mb-4">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">Delete Sale</h3>
              <p className="text-sm text-muted-foreground mb-6">Are you sure you want to delete this sales record? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTargetId(null)}
                  className="flex-1 bg-secondary text-foreground rounded-xl py-3 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    deleteMutation.mutate(deleteTargetId);
                    setDeleteTargetId(null);
                  }}
                  disabled={deleteMutation.isPending}
                  className="flex-1 bg-destructive text-destructive-foreground rounded-xl py-3 font-semibold shadow-deep hover:bg-destructive/90 transition disabled:opacity-50"
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
