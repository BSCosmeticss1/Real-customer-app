"use client";

import { ClipboardList, TrendingUp, TrendingDown, Download, Calendar as CalendarIcon, PieChart, BarChart3, Users, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

export default function BookingReportingPage() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBooking, setNewBooking] = useState({
    customerName: "",
    service: "",
    date: new Date().toISOString().split('T')[0],
    amount: "",
    status: "Pending",
    notes: ""
  });

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

  const createBookingMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newBooking,
          amount: parseFloat(newBooking.amount) || 0,
          date: new Date(newBooking.date).toISOString()
        }),
      });
      if (!res.ok) throw new Error("Failed to create booking");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Booking created successfully!");
      setShowAddModal(false);
      setNewBooking({
        customerName: "",
        service: "",
        date: new Date().toISOString().split('T')[0],
        amount: "",
        status: "Pending",
        notes: ""
      });
      queryClient.invalidateQueries({ queryKey: ["bookingStats"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create booking");
    },
  });

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBooking.customerName || !newBooking.service) {
      toast.error("Customer name and service are required");
      return;
    }
    createBookingMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="label-eyebrow text-primary">Performance Metrics</div>
            <h1 className="font-display text-3xl sm:text-5xl font-semibold text-foreground mt-2">Booking Reporting</h1>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1,2,3,4].map(i => (
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

  const recentBookings = stats?.recentBookings || [];
  const topServices = stats?.topServices || [
    { name: "Premium Installation", share: "42%", color: "bg-primary" },
    { name: "Standard Maintenance", share: "28%", color: "bg-accent" },
    { name: "Software Upgrade", share: "15%", color: "bg-secondary" },
    { name: "Consultation", share: "10%", color: "bg-muted-foreground" },
  ];

  return (
    <div className="space-y-8">
      {/* Title row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="label-eyebrow text-primary">Performance Metrics</div>
          <h1 className="font-display text-3xl sm:text-5xl font-semibold text-foreground mt-2">Booking Reporting</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 sm:flex-none rounded-xl px-4 sm:px-6 h-12 font-medium text-xs sm:text-sm">
            <CalendarIcon className="h-4 w-4 mr-2" /> Last 30 Days
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="flex-1 sm:flex-none rounded-xl px-4 sm:px-6 h-12 font-medium shadow-deep bg-primary hover:bg-primary-glow text-xs sm:text-sm">
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
            <div className="text-2xl sm:text-3xl font-bold">${stats?.grossRevenue?.toLocaleString() || 0}</div>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No bookings yet
                    </td>
                  </tr>
                ) : (
                  recentBookings.map((booking: any) => (
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
                        ${booking.amount?.toLocaleString() || 0}
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
          <Card className="rounded-2xl shadow-card border-none bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
            <CardHeader>
              <CardTitle className="font-display text-lg sm:text-xl">Monthly Goal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span>Revenue Progress</span>
                  <span className="font-semibold">{stats?.progressPercentage || 0}%</span>
                </div>
                <div className="w-full bg-primary-foreground/20 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full" style={{ width: `${stats?.progressPercentage || 0}%` }} />
                </div>
                <p className="text-[10px] sm:text-xs text-primary-foreground/70">
                  {stats?.remaining > 0 
                    ? `You are $${stats?.remaining?.toLocaleString()} away from your monthly target. Keep it up!`
                    : `Great job! You've exceeded your monthly goal!`
                  }
                </p>
                <Button className="w-full bg-white text-primary hover:bg-primary-foreground/90 rounded-xl font-medium mt-2 text-xs sm:text-sm h-10 sm:h-12">
                  View Goal Details
                </Button>
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

      {/* Add Booking Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-card border border-border rounded-3xl shadow-deep w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card">
              <h3 className="font-display text-2xl font-semibold">New Booking</h3>
              <button onClick={() => setShowAddModal(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateBooking} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Customer Name *</label>
                <input 
                  type="text"
                  required
                  value={newBooking.customerName}
                  onChange={(e) => setNewBooking({...newBooking, customerName: e.target.value})}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Service *</label>
                <input 
                  type="text"
                  required
                  value={newBooking.service}
                  onChange={(e) => setNewBooking({...newBooking, service: e.target.value})}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Enter service name"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Date</label>
                <input 
                  type="date"
                  value={newBooking.date}
                  onChange={(e) => setNewBooking({...newBooking, date: e.target.value})}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Amount</label>
                <input 
                  type="number"
                  value={newBooking.amount}
                  onChange={(e) => setNewBooking({...newBooking, amount: e.target.value})}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Status</label>
                <select 
                  value={newBooking.status}
                  onChange={(e) => setNewBooking({...newBooking, status: e.target.value})}
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
                  value={newBooking.notes}
                  onChange={(e) => setNewBooking({...newBooking, notes: e.target.value})}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Additional notes"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-secondary text-foreground rounded-xl py-3 font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={createBookingMutation.isPending}
                  className="flex-1 bg-primary text-primary-foreground rounded-xl py-3 font-semibold shadow-deep hover:bg-primary-glow transition disabled:opacity-50"
                >
                  {createBookingMutation.isPending ? "Creating..." : "Create Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
