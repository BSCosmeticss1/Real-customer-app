"use client";

import { ClipboardList, TrendingUp, TrendingDown, Download, Calendar as CalendarIcon, Filter, PieChart, BarChart3, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const recentBookings = [
  { id: "BK-8821", customer: "Alice Johnson", service: "Standard Maintenance", date: "May 24, 2026", amount: "$120.00", status: "Completed" },
  { id: "BK-8822", customer: "Bob Smith", service: "Premium Installation", date: "May 25, 2026", amount: "$450.00", status: "Pending" },
  { id: "BK-8823", customer: "Charlie Davis", service: "Consultation", date: "May 25, 2026", amount: "$75.00", status: "Cancelled" },
  { id: "BK-8824", customer: "Diana Prince", service: "Software Upgrade", date: "May 26, 2026", amount: "$210.00", status: "Confirmed" },
  { id: "BK-8825", customer: "Ethan Hunt", service: "Emergency Repair", date: "May 26, 2026", amount: "$350.00", status: "In Progress" },
];

export default function BookingReportingPage() {
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
          <Button className="flex-1 sm:flex-none rounded-xl px-4 sm:px-6 h-12 font-medium shadow-deep bg-primary hover:bg-primary-glow text-xs sm:text-sm">
            <Download className="h-4 w-4 mr-2" /> Download Report
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
            <div className="text-2xl sm:text-3xl font-bold">1,429</div>
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
            <div className="text-2xl sm:text-3xl font-bold">$42,850</div>
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
            <div className="text-2xl sm:text-3xl font-bold">64.2%</div>
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
            <div className="text-2xl sm:text-3xl font-bold">328</div>
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
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4">
                      <div className="font-medium text-foreground text-sm">{booking.customer}</div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">{booking.id}</div>
                    </td>
                    <td className="py-4 text-xs sm:text-sm text-foreground">{booking.service}</td>
                    <td className="py-4 text-xs sm:text-sm text-muted-foreground">{booking.date}</td>
                    <td className="py-4">
                      <Badge variant={
                        booking.status === "Completed" ? "default" :
                        booking.status === "Pending" ? "secondary" :
                        booking.status === "Cancelled" ? "destructive" : "outline"
                      } className="rounded-lg font-normal text-[10px] sm:text-xs">
                        {booking.status}
                      </Badge>
                    </td>
                    <td className="py-4 text-right font-medium text-foreground text-sm">{booking.amount}</td>
                  </tr>
                ))}
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
                  <span className="font-semibold">85%</span>
                </div>
                <div className="w-full bg-primary-foreground/20 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full" style={{ width: "85%" }} />
                </div>
                <p className="text-[10px] sm:text-xs text-primary-foreground/70">
                  You are $6,420 away from your monthly target. Keep it up!
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
                {[
                  { name: "Premium Installation", share: "42%", color: "bg-primary" },
                  { name: "Standard Maintenance", share: "28%", color: "bg-accent" },
                  { name: "Software Upgrade", share: "15%", color: "bg-secondary" },
                  { name: "Consultation", share: "10%", color: "bg-muted-foreground" },
                ].map((s) => (
                  <li key={s.name} className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${s.color}`} />
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
    </div>
  );
}
