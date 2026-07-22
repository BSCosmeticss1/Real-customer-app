"use client";

import { ClipboardList, TrendingUp, TrendingDown, Download, Calendar as CalendarIcon, PieChart, BarChart3, Users, Plus, X, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

interface BookingRow {
  id: string;
  bookingNumber: string;
  customerName: string;
  service: string;
  date: string;
  amount: number;
  status: string;
  notes: string;
}

const emptyBooking: Omit<BookingRow, "id" | "bookingNumber"> = {
  customerName: "",
  service: "",
  date: new Date().toISOString().split("T")[0],
  amount: 0,
  status: "Pending",
  notes: "",
};

export default function BookingReportingPage() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [viewNotesId, setViewNotesId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<BookingRow, "id" | "bookingNumber">>(emptyBooking);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["bookingStats"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/bookings/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch booking stats");
      return res.json();
    },
  });

  const { data: bookings, isLoading: bookingsLoading, refetch } = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch bookings");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(String(formData.amount)) || 0,
          date: new Date(formData.date).toISOString(),
        }),
      });
      if (!res.ok) throw new Error("Failed to create booking");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Booking created successfully!");
      setShowAddModal(false);
      setEditingId(null);
      setFormData(emptyBooking);
      queryClient.invalidateQueries({ queryKey: ["bookingStats"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to create booking"),
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/bookings/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(String(formData.amount)) || 0,
          date: new Date(formData.date).toISOString(),
        }),
      });
      if (!res.ok) throw new Error("Failed to update booking");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Booking updated successfully!");
      setShowAddModal(false);
      setEditingId(null);
      setFormData(emptyBooking);
      queryClient.invalidateQueries({ queryKey: ["bookingStats"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to update booking"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/bookings/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete booking");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Booking deleted successfully!");
      setDeleteTargetId(null);
      queryClient.invalidateQueries({ queryKey: ["bookingStats"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete booking"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.service) {
      toast.error("Customer name and service are required");
      return;
    }
    if (editingId) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const startEdit = (booking: BookingRow) => {
    setEditingId(booking.id);
    setFormData({
      customerName: booking.customerName,
      service: booking.service,
      date: booking.date.split("T")[0],
      amount: booking.amount,
      status: booking.status,
      notes: booking.notes,
    });
    setShowAddModal(true);
  };

  const recentBookings = bookings || [];
  const topServices = stats?.topServices || [
    { name: "Premium Installation", share: "42%", color: "bg-primary" },
    { name: "Standard Maintenance", share: "28%", color: "bg-accent" },
    { name: "Software Upgrade", share: "15%", color: "bg-secondary" },
    { name: "Consultation", share: "10%", color: "bg-muted-foreground" },
  ];

  if (isLoading || bookingsLoading) {
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
          <h1 className="font-display text-3xl sm:text-5xl font-semibold text-foreground mt-2">Book Keeping</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 sm:flex-none rounded-xl px-4 sm:px-6 h-12 font-medium text-xs sm:text-sm">
            <CalendarIcon className="h-4 w-4 mr-2" /> Last 30 Days
          </Button>
          <Button onClick={() => { setEditingId(null); setFormData(emptyBooking); setShowAddModal(true); }} className="flex-1 sm:flex-none rounded-xl px-4 sm:px-6 h-12 font-medium shadow-deep bg-primary hover:bg-primary-glow text-xs sm:text-sm">
            <Plus className="h-4 w-4 mr-2" /> New Booking
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="rounded-2xl shadow-card border-none bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium label-eyebrow">Total Bookings</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{stats?.totalBookings || 0}</div>
            <p className="text-[10px] sm:text-xs text-success flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" /> +18% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-card border-none bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium label-eyebrow">Gross Revenue</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">₦{stats?.grossRevenue?.toLocaleString() || 0}</div>
            <p className="text-[10px] sm:text-xs text-success flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" /> +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-card border-none bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium label-eyebrow">Conversion Rate</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{stats?.conversionRate || 0}%</div>
            <p className="text-[10px] sm:text-xs text-destructive flex items-center gap-1 mt-1">
              <TrendingDown className="h-3 w-3" /> -2% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-card border-none bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium label-eyebrow">New Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{stats?.newCustomers || 0}</div>
            <p className="text-[10px] sm:text-xs text-success flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" /> +24% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings Table */}
        <div className="lg:col-span-2 rounded-2xl bg-card p-4 sm:p-7 shadow-card border border-border overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl sm:text-2xl font-semibold">Recent Bookings</h2>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary-glow text-xs">View all</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="text-muted-foreground text-[10px] sm:text-xs font-semibold uppercase tracking-wider border-b border-border">
                  <th className="pb-4">Customer</th>
                  <th className="pb-4">Service</th>
                  <th className="pb-4">Date</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4 text-right">Amount</th>
                  <th className="pb-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No bookings yet
                    </td>
                  </tr>
                ) : (
                  recentBookings.map((booking: BookingRow) => (
                    <tr key={booking.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="py-4">
                        <div className="font-medium text-foreground text-sm">{booking.customerName}</div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground">{booking.bookingNumber}</div>
                      </td>
                      <td className="py-4 text-xs sm:text-sm text-foreground">{booking.service}</td>
                      <td className="py-4 text-xs sm:text-sm text-muted-foreground">
                        {format(new Date(booking.date), "MMM dd, yyyy")}
                      </td>
                      <td className="py-4">
                        <Badge variant={
                          booking.status === "Completed" ? "default" :
                          booking.status === "Pending" ? "secondary" :
                          booking.status === "Cancelled" ? "destructive" : "outline"
                        } className="rounded-lg font-normal text-[10px] sm:text-xs">
                          {booking.status}
                        </Badge>
                      </td>
                      <td className="py-4 text-right font-medium text-foreground text-sm">
                        ₦{booking.amount?.toLocaleString() || 0}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => startEdit(booking)}
                            className="text-xs text-primary hover:text-primary-glow font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteTargetId(booking.id)}
                            className="text-xs text-destructive hover:text-destructive/80 font-medium flex items-center gap-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                          {booking.notes && (
                            <button
                              onClick={() => setViewNotesId(booking.id)}
                              className="text-xs text-muted-foreground hover:text-foreground font-medium flex items-center gap-1"
                              title="View Notes"
                            >
                              <FileText className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Card */}
        <div className="space-y-6">
          <Card className="rounded-2xl shadow-card border-none bg-card">
            <CardHeader>
              <CardTitle className="font-display text-lg sm:text-xl">Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground">Total Bookings</span>
                  <span className="font-semibold text-sm sm:text-base">{stats?.totalBookings || 0}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.min(((stats?.totalBookings || 0) / 100) * 100, 100)}%` }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground">Completed</span>
                  <span className="font-semibold text-sm sm:text-base text-success">
                    {recentBookings.filter((b: BookingRow) => b.status === "Completed").length}
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {recentBookings.filter((b: BookingRow) => b.status === "Pending").length} pending bookings
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-card border-none bg-card">
            <CardHeader>
              <CardTitle className="font-display text-lg sm:text-xl">Top Services</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {topServices.map((s: any, index: number) => (
                  <li key={s.name} className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${
                        index === 0 ? "bg-primary" :
                        index === 1 ? "bg-accent" :
                        index === 2 ? "bg-secondary" : "bg-muted-foreground"
                      }`} />
                      {s.name}
                    </span>
                    <span className="font-semibold">{s.share}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add/Edit Booking Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-card border border-border rounded-3xl shadow-deep w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
              <h3 className="font-display text-2xl font-semibold">{editingId ? "Edit Booking" : "New Booking"}</h3>
              <button onClick={() => { setShowAddModal(false); setEditingId(null); setFormData(emptyBooking); }}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Customer Name *</label>
                  <input 
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Enter customer name"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Service *</label>
                  <input 
                    type="text"
                    required
                    value={formData.service}
                    onChange={(e) => setFormData({...formData, service: e.target.value})}
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Enter service name"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Date</label>
                  <input 
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Amount (₦)</label>
                  <input 
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Notes</label>
                  <textarea 
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Additional notes"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingId(null); setFormData(emptyBooking); }}
                  className="flex-1 bg-secondary text-foreground rounded-xl py-3 font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 bg-primary text-primary-foreground rounded-xl py-3 font-semibold shadow-deep hover:bg-primary-glow transition disabled:opacity-50"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : editingId ? "Update Booking" : "Create Booking"}
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
              <h3 className="font-display text-xl font-semibold mb-2">Delete Booking</h3>
              <p className="text-sm text-muted-foreground mb-6">Are you sure you want to delete this booking? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTargetId(null)}
                  className="flex-1 bg-secondary text-foreground rounded-xl py-3 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteMutation.mutate(deleteTargetId)}
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

      {/* View Notes Modal */}
      {viewNotesId && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-card border border-border rounded-3xl shadow-deep w-full max-w-md">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="font-display text-xl font-semibold">Booking Notes</h3>
              <button onClick={() => setViewNotesId(null)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {(recentBookings.find((b: BookingRow) => b.id === viewNotesId)?.notes) || "No notes available."}
              </p>
            </div>
            <div className="p-6 border-t border-border">
              <button
                onClick={() => setViewNotesId(null)}
                className="w-full bg-secondary text-foreground rounded-xl py-3 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
