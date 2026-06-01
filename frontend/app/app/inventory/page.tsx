"use client";

import { Package, Plus, Search, Filter, ArrowUpDown, MoreHorizontal, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const inventoryItems = [
  { id: "INV-001", name: "Premium Widget", category: "Hardware", stock: 154, status: "In Stock", price: "$49.99" },
  { id: "INV-002", name: "Software License Pro", category: "Software", stock: 0, status: "Out of Stock", price: "$199.00" },
  { id: "INV-003", name: "Standard Cable Kit", category: "Accessories", stock: 12, status: "Low Stock", price: "$15.50" },
  { id: "INV-004", name: "Cloud Storage Hub", category: "Hardware", stock: 89, status: "In Stock", price: "$299.99" },
  { id: "INV-005", name: "Enterprise Support Pack", category: "Services", stock: 500, status: "In Stock", price: "$999.00" },
];

export default function InventoryPage() {
  return (
    <div className="space-y-8">
      {/* Title row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="label-eyebrow text-primary">Asset Management</div>
          <h1 className="font-display text-3xl sm:text-5xl font-semibold text-foreground mt-2">Inventory</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 sm:flex-none rounded-xl px-6 h-12 font-medium">
            Export CSV
          </Button>
          <Button className="flex-1 sm:flex-none rounded-xl px-6 h-12 font-medium shadow-deep bg-primary hover:bg-primary-glow">
            <Plus className="h-4 w-4 mr-2" /> Add Item
          </Button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="rounded-2xl bg-card p-6 shadow-card flex items-center gap-4">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
            <Package className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <div className="label-eyebrow text-[10px] sm:text-xs">Total Items</div>
            <div className="text-xl sm:text-2xl font-semibold text-foreground">1,284</div>
          </div>
        </div>
        <div className="rounded-2xl bg-card p-6 shadow-card flex items-center gap-4">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-warning-soft text-warning grid place-items-center shrink-0">
            <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
          </div>
          <div>
            <div className="label-eyebrow text-[10px] sm:text-xs">Low Stock</div>
            <div className="text-xl sm:text-2xl font-semibold text-foreground">12 Items</div>
          </div>
        </div>
        <div className="rounded-2xl bg-card p-6 shadow-card flex items-center gap-4">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-success-soft text-success grid place-items-center shrink-0">
            <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <div className="label-eyebrow text-[10px] sm:text-xs">Active Orders</div>
            <div className="text-xl sm:text-2xl font-semibold text-foreground">48</div>
          </div>
        </div>
      </div>

      {/* Inventory Table UI */}
      <div className="rounded-2xl bg-card border border-border shadow-card overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Filter inventory..." className="pl-9 rounded-xl border-border bg-background" />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="rounded-lg text-xs sm:text-sm">
              <Filter className="h-4 w-4 mr-2" /> Filter
            </Button>
            <Button variant="ghost" size="sm" className="rounded-lg text-xs sm:text-sm">
              <ArrowUpDown className="h-4 w-4 mr-2" /> Sort
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
                <th className="px-4 sm:px-6 py-4">Item Name</th>
                <th className="px-4 sm:px-6 py-4">Category</th>
                <th className="px-4 sm:px-6 py-4">Stock</th>
                <th className="px-4 sm:px-6 py-4">Price</th>
                <th className="px-4 sm:px-6 py-4">Status</th>
                <th className="px-4 sm:px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {inventoryItems.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 sm:px-6 py-4">
                    <div className="font-medium text-foreground text-sm sm:text-base">{item.name}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">{item.id}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <Badge variant="secondary" className="rounded-lg font-normal text-[10px] sm:text-xs">
                      {item.category}
                    </Badge>
                  </td>
                  <td className="px-4 sm:px-6 py-4 font-medium text-foreground text-sm">{item.stock}</td>
                  <td className="px-4 sm:px-6 py-4 text-foreground text-sm">{item.price}</td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "h-2 w-2 rounded-full",
                        item.status === "In Stock" ? "bg-success" : 
                        item.status === "Low Stock" ? "bg-warning" : "bg-destructive"
                      )} />
                      <span className="text-xs sm:text-sm">{item.status}</span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="rounded-lg">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border bg-muted/20 text-center">
          <Button variant="link" className="text-xs sm:text-sm text-primary">View all inventory items</Button>
        </div>
      </div>
    </div>
  );
}
