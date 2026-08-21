"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  DollarSign,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const fallbackMonthlyData = [
  { month: "Jan", income: 18200, expenses: 12450 },
  { month: "Feb", income: 19450, expenses: 13120 },
  { month: "Mar", income: 21300, expenses: 13900 },
  { month: "Apr", income: 22800, expenses: 14480 },
  { month: "May", income: 24600, expenses: 15250 },
  { month: "Jun", income: 26300, expenses: 16780 },
];

const expenseBreakdown = [
  { name: "Operations", value: 15400 },
  { name: "Marketing", value: 10950 },
  { name: "Payroll", value: 18600 },
  { name: "Travel", value: 4200 },
  { name: "Software", value: 5300 },
];

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);

export default function CashflowPage() {
  const [monthlyData, setMonthlyData] = useState(fallbackMonthlyData);

  useEffect(() => {
    const fetchCashflow = async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const res = await fetch(`${API_URL}/dashboard/cashflow`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setMonthlyData(
            data.data.map((item: any) => ({
              month: item.month,
              income: Number(item.income || 0),
              expenses: Number(item.expenses || 0),
            })),
          );
        }
      } catch (error) {
        console.error("Failed to load cashflow:", error);
      }
    };

    fetchCashflow();
  }, []);

  const totalIncome = useMemo(
    () => monthlyData.reduce((sum, item) => sum + item.income, 0),
    [monthlyData],
  );
  const totalExpenses = useMemo(
    () => monthlyData.reduce((sum, item) => sum + item.expenses, 0),
    [monthlyData],
  );
  const netFlow = totalIncome - totalExpenses;

  return (
    <div className="space-y-8">
      <div>
        <div className="label-eyebrow text-primary">Finance</div>
        <h1 className="font-display text-3xl sm:text-5xl font-semibold mt-2">
          Cashflow
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-2 text-emerald-500">
            <TrendingUp className="h-4 w-4" />
            <span className="label-eyebrow">Total income</span>
          </div>
          <div className="font-display text-3xl font-semibold mt-3">
            {formatCurrency(totalIncome)}
          </div>
        </div>
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-2 text-red-500">
            <TrendingDown className="h-4 w-4" />
            <span className="label-eyebrow">Total expenses</span>
          </div>
          <div className="font-display text-3xl font-semibold mt-3">
            {formatCurrency(totalExpenses)}
          </div>
        </div>
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-2 text-primary">
            <DollarSign className="h-4 w-4" />
            <span className="label-eyebrow">Net flow</span>
          </div>
          <div
            className={`font-display text-3xl font-semibold mt-3 ${netFlow >= 0 ? "text-emerald-500" : "text-red-500"}`}
          >
            {formatCurrency(netFlow)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-card rounded-2xl shadow-card p-6 xl:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-2xl font-semibold">
              Cashflow trend
            </h2>
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
              <TrendingUp className="h-4 w-4" /> Live data
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="incomeGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="expenseGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(Number(value))}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  fill="url(#incomeGlow)"
                  strokeWidth={3}
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444"
                  fill="url(#expenseGlow)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-card p-6">
          <h2 className="font-display text-2xl font-semibold mb-5">
            Expense distribution
          </h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell
                      key={`${entry.name}-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(Number(value))}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {expenseBreakdown.map((entry, index) => (
              <div
                key={entry.name}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-muted-foreground">{entry.name}</span>
                </div>
                <span className="font-medium text-foreground">
                  {formatCurrency(entry.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl font-semibold">
            Cashflow snapshot
          </h2>
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
            <ArrowUpRight className="h-4 w-4" /> Live snapshot
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {monthlyData.map((entry) => {
            const net = entry.income - entry.expenses;
            return (
              <div
                key={entry.month}
                className="rounded-2xl border border-border p-4"
              >
                <div className="label-eyebrow">{entry.month}</div>
                <div className="mt-3 text-lg font-semibold text-foreground">
                  {formatCurrency(net)}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Income {formatCurrency(entry.income)} • Expenses{" "}
                  {formatCurrency(entry.expenses)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
