"use client";

import { PieChart, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export default function Analytics() {
  const { data: contacts, isLoading: contactsLoading } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/contacts?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data.data || [];
    },
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
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

  const { data: sales, isLoading: salesLoading } = useQuery({
    queryKey: ["salesReports"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/sales-reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch sales");
      return res.json();
    },
  });

  const isLoading = contactsLoading || bookingsLoading || salesLoading;

  const contactsList = contacts || [];
  const bookingsList = bookings || [];
  const salesList = sales || [];

  const whatsappCount = contactsList.filter((c: any) => c.whatsapp).length;
  const facebookCount = contactsList.filter((c: any) => c.facebook).length;
  const instagramCount = contactsList.filter((c: any) => c.instagram).length;

  const platformData = [
    { name: "WhatsApp", value: whatsappCount, color: "#25D366" },
    { name: "Facebook", value: facebookCount, color: "#1877F2" },
    { name: "Instagram", value: instagramCount, color: "#E4405F" },
  ].filter((item) => item.value > 0);

  const statusCounts = bookingsList.reduce(
    (acc: any, b: any) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const statusData = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value: value as number,
  }));

  const statusColors: Record<string, string> = {
    Completed: "#22c55e",
    Pending: "#f59e0b",
    Confirmed: "#3b82f6",
    "In Progress": "#8b5cf6",
    Cancelled: "#ef4444",
  };

  const paidSales = salesList.filter((s: any) => s.paid).length;
  const pendingSales = salesList.filter((s: any) => !s.paid).length;

  const salesStatusData = [
    { name: "Paid", value: paidSales, color: "#8b5cf6" },
    { name: "Pending", value: pendingSales, color: "#f59e0b" },
  ].filter((item) => item.value > 0);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-8 bg-secondary rounded w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 bg-secondary rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-sm text-muted-foreground">Infrastructure <span className="mx-1">›</span> <span className="text-primary">Analytics</span></div>
          <h1 className="font-display text-5xl font-semibold mt-2">Analytics Overview</h1>
          <p className="text-muted-foreground mt-2 max-w-md">Visual insights across contacts, bookings, and sales performance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-card p-4 sm:p-7 shadow-card border border-border">
          <div className="flex items-center gap-3 mb-6">
            <PieChart className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl sm:text-2xl font-semibold">Contact Platforms</h2>
          </div>
          <div className="h-[350px]">
            {platformData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No platform data available
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-card p-4 sm:p-7 shadow-card border border-border">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl sm:text-2xl font-semibold">Bookings by Status</h2>
          </div>
          <div className="h-[350px]">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {statusData.map((entry) => (
                      <Cell key={entry.name} fill={statusColors[entry.name] || "#8884d8"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No booking status data available
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-card p-4 sm:p-7 shadow-card border border-border">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl sm:text-2xl font-semibold">Sales Reporting</h2>
        </div>
        <div className="h-[300px]">
          {salesStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {salesStatusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              No sales data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
