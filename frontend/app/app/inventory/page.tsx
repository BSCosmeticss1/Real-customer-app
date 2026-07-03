"use client";

import { Package, Plus, Search, Filter, ArrowUpDown, MoreHorizontal, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string | null;
  description: string | null;
  quantity: number;
  reorderLevel: number;
  price: number;
  costPrice: number;
  warehouse: string;
  unit: string;
}

interface UserOption {
  id: string;
  name: string;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    description: "",
    quantity: "0",
    reorderLevel: "10",
    price: "0",
    costPrice: "0",
    warehouse: "Main Warehouse",
    unit: "piece"
  });
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const getToken = () => localStorage.getItem("token");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedUserId) params.append('userId', selectedUserId);
      const res = await fetch(`${API_URL}/inventory?${params.toString()}`, {
        headers: { "Authorization": `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      toast({ title: "Error", description: "Failed to load inventory", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/inventory/users`, {
        headers: { "Authorization": `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedUserId]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/inventory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity),
          reorderLevel: parseInt(formData.reorderLevel),
          price: parseFloat(formData.price),
          costPrice: parseFloat(formData.costPrice)
        })
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Success", description: "Product added successfully" });
        setAddDialogOpen(false);
        setFormData({
          name: "",
          sku: "",
          category: "",
          description: "",
          quantity: "0",
          reorderLevel: "10",
          price: "0",
          costPrice: "0",
          warehouse: "Main Warehouse",
          unit: "piece"
        });
        fetchProducts();
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (err) {
      console.error("Failed to add product:", err);
      toast({ title: "Error", description: "Failed to add product", variant: "destructive" });
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedUserId) params.append('userId', selectedUserId);
      const res = await fetch(`${API_URL}/inventory/export?${params.toString()}`, {
        headers: { "Authorization": `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'inventory.csv';
        a.click();
        window.URL.revokeObjectURL(url);
        toast({ title: "Success", description: "Inventory exported successfully" });
      } else {
        toast({ title: "Error", description: "Failed to export inventory", variant: "destructive" });
      }
    } catch (err) {
      console.error("Failed to export products:", err);
      toast({ title: "Error", description: "Failed to export inventory", variant: "destructive" });
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalItems = products.length;
  const lowStockCount = products.filter(p => p.quantity <= p.reorderLevel).length;

  const getStatus = (product: Product) => {
    if (product.quantity === 0) return "Out of Stock";
    if (product.quantity <= product.reorderLevel) return "Low Stock";
    return "In Stock";
  };

  const getStatusColor = (status: string) => {
    if (status === "In Stock") return "bg-success";
    if (status === "Low Stock") return "bg-warning";
    return "bg-destructive";
  };

  return (
    <div className="space-y-8">
      {/* Title row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="label-eyebrow text-primary">Asset Management</div>
          <h1 className="font-display text-3xl sm:text-5xl font-semibold text-foreground mt-2">Inventory</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 sm:flex-none rounded-xl px-6 h-12 font-medium" onClick={handleExport}>
            Export CSV
          </Button>
          <Button className="flex-1 sm:flex-none rounded-xl px-6 h-12 font-medium shadow-deep bg-primary hover:bg-primary-glow" onClick={() => setAddDialogOpen(true)}>
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
            <div className="text-xl sm:text-2xl font-semibold text-foreground">{totalItems}</div>
          </div>
        </div>
        <div className="rounded-2xl bg-card p-6 shadow-card flex items-center gap-4">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-warning-soft text-warning grid place-items-center shrink-0">
            <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
          </div>
          <div>
            <div className="label-eyebrow text-[10px] sm:text-xs">Low Stock</div>
            <div className="text-xl sm:text-2xl font-semibold text-foreground">{lowStockCount} Items</div>
          </div>
        </div>
        <div className="rounded-2xl bg-card p-6 shadow-card flex items-center gap-4">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-success-soft text-success grid place-items-center shrink-0">
            <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <div className="label-eyebrow text-[10px] sm:text-xs">Active Products</div>
            <div className="text-xl sm:text-2xl font-semibold text-foreground">{totalItems}</div>
          </div>
        </div>
      </div>

      {/* Inventory Table UI */}
      <div className="rounded-2xl bg-card border border-border shadow-card overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Filter inventory..." 
                className="pl-9 rounded-xl border-border bg-background" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {users.length > 1 && (
              <div className="w-full sm:w-48">
                <Select 
                  value={selectedUserId || "all"} 
                  onValueChange={(value) => setSelectedUserId(value === "all" ? undefined : value)}
                >
                  <SelectTrigger className="rounded-xl border-border bg-background">
                    <SelectValue placeholder="Filter by user" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading inventory...</div>
          ) : (
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
                  <th className="px-4 sm:px-6 py-4">Item Name</th>
                  {!selectedUserId && users.length > 1 && (
                    <th className="px-4 sm:px-6 py-4">Owner</th>
                  )}
                  <th className="px-4 sm:px-6 py-4">Category</th>
                  <th className="px-4 sm:px-6 py-4">Stock</th>
                  <th className="px-4 sm:px-6 py-4">Price</th>
                  <th className="px-4 sm:px-6 py-4">Status</th>
                  <th className="px-4 sm:px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.map((item: any) => {
                  const status = getStatus(item);
                  return (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 sm:px-6 py-4">
                        <div className="font-medium text-foreground text-sm sm:text-base">{item.name}</div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground">{item.sku}</div>
                      </td>
                      {!selectedUserId && users.length > 1 && (
                        <td className="px-4 sm:px-6 py-4">
                          <Badge variant="secondary" className="rounded-lg font-normal text-[10px] sm:text-xs">
                            {item.user?.name || "Unknown"}
                          </Badge>
                        </td>
                      )}
                      <td className="px-4 sm:px-6 py-4">
                        <Badge variant="secondary" className="rounded-lg font-normal text-[10px] sm:text-xs">
                          {item.category || "Uncategorized"}
                        </Badge>
                      </td>
                      <td className="px-4 sm:px-6 py-4 font-medium text-foreground text-sm">{item.quantity}</td>
                      <td className="px-4 sm:px-6 py-4 text-foreground text-sm">₦{item.price.toFixed(2)}</td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={cn("h-2 w-2 rounded-full", getStatusColor(status))} />
                          <span className="text-xs sm:text-sm">{status}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" className="rounded-lg">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        {!loading && filteredProducts.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">No products found</div>
        )}
        <div className="p-4 border-t border-border bg-muted/20 text-center">
          <Button variant="link" className="text-xs sm:text-sm text-primary">View all inventory items</Button>
        </div>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Inventory Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddItem} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" required value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" type="number" required value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reorderLevel">Reorder Level</Label>
                <Input id="reorderLevel" type="number" required value={formData.reorderLevel} onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (₦)</Label>
                <Input id="price" type="number" step="0.01" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="costPrice">Cost Price (₦)</Label>
                <Input id="costPrice" type="number" step="0.01" value={formData.costPrice} onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warehouse">Warehouse</Label>
                <Input id="warehouse" value={formData.warehouse} onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input id="unit" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Add Item</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
