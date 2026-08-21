"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, FileText, Wallet, TrendingUp } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);

export default function FinancePage() {
  const [stats, setStats] = useState([
    {
      label: "Outstanding Invoices",
      value: "₦0",
      detail: "0 pending",
      icon: FileText,
    },
    { label: "Monthly Expenses", value: "₦0", detail: "0 total", icon: Wallet },
    { label: "Cashflow", value: "₦0", detail: "0 net", icon: TrendingUp },
  ]);
  const [recentInvoices, setRecentInvoices] = useState([
    {
      id: "INV-0000",
      client: "No invoices yet",
      status: "Draft",
      amount: "₦0",
    },
  ]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const [statsRes, invoicesRes] = await Promise.all([
          fetch(`${API_URL}/dashboard/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/invoices?limit=3`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const statsData = await statsRes.json();
        const invoicesData = await invoicesRes.json();

        if (statsData.success) {
          const totalRevenue = Number(statsData.data.totalRevenue || 0);
          const totalExpenses = Number(statsData.data.totalExpenses || 0);
          const cashflow = Number(statsData.data.netCashFlow || 0);

          setStats([
            {
              label: "Outstanding Invoices",
              value: formatCurrency(totalRevenue),
              detail: `${Number(statsData.data.totalContacts || 0)} active contacts`,
              icon: FileText,
            },
            {
              label: "Monthly Expenses",
              value: formatCurrency(totalExpenses),
              detail: "Current total",
              icon: Wallet,
            },
            {
              label: "Cashflow",
              value: formatCurrency(cashflow),
              detail: cashflow >= 0 ? "Positive flow" : "Needs attention",
              icon: TrendingUp,
            },
          ]);
        }

        if (invoicesData.success && Array.isArray(invoicesData.data)) {
          const mapped = invoicesData.data.slice(0, 3).map((invoice: any) => ({
            id: invoice.invoiceNumber || invoice.id,
            client: invoice.client || "Unknown client",
            status:
              (invoice.status || "draft").charAt(0).toUpperCase() +
              (invoice.status || "draft").slice(1),
            amount: formatCurrency(Number(invoice.total || 0)),
          }));

          setRecentInvoices(
            mapped.length
              ? mapped
              : [
                  {
                    id: "INV-0000",
                    client: "No invoices yet",
                    status: "Draft",
                    amount: "₦0",
                  },
                ],
          );
        }
      } catch (error) {
        console.error("Failed to load finance overview:", error);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <div className="label-eyebrow text-primary">Finance Module</div>
        <h1 className="font-display text-3xl sm:text-5xl font-semibold text-foreground mt-2">
          Finance Overview
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map(({ label, value, detail, icon: Icon }) => (
          <div key={label} className="bg-card rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div className="label-eyebrow">{label}</div>
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="font-display text-3xl font-semibold mt-4">
              {value}
            </div>
            <div className="mt-3 text-sm text-muted-foreground">{detail}</div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-display text-2xl font-semibold">
            Recent Invoices
          </h2>
          <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            <ArrowUpRight className="h-4 w-4" /> View all
          </button>
        </div>

        <div className="divide-y divide-border">
          {recentInvoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between px-6 py-4"
            >
              <div>
                <div className="font-semibold text-foreground">
                  {invoice.id}
                </div>
                <div className="text-sm text-muted-foreground">
                  {invoice.client}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-foreground">
                  {invoice.status}
                </span>
                <span className="font-semibold text-foreground">
                  {invoice.amount}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
