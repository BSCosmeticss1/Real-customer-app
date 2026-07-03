"use client";

import { useState, useEffect } from "react";
import { Plus, UserPlus, Loader2, Trash2, Key, Power, MessageSquare, Users, Package, BarChart3, Sparkles, Calendar, CreditCard, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const FEATURE_MODULES = [
  { id: "messaging", name: "Messaging", icon: MessageSquare },
  { id: "contacts", name: "Contacts", icon: Users },
  { id: "inventory", name: "Inventory", icon: Package },
  { id: "analytics", name: "Analytics", icon: BarChart3 },
  { id: "automation", name: "Automation", icon: Sparkles },
  { id: "bookingReporting", name: "Booking & Reporting", icon: Calendar },
  { id: "finance", name: "Finance", icon: CreditCard },
];

export default function Team() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [inviteData, setInviteData] = useState({
    email: "",
    role: "MESSAGING_MANAGER", // Use this as default staff role
    name: "",
    allowedFeatures: [] as string[]
  });
  const [editingMember, setEditingMember] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    role: "MESSAGING_MANAGER",
    allowedFeatures: [] as string[]
  });
  const [updating, setUpdating] = useState(false);

  // We can keep roles for backward compatibility but focus on features

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/users`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMembers(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch team", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/auth/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.data);
        // Default allowedFeatures to all admin's paid features
        const adminFeatures = data.data.subscription?.selectedFeatures || FEATURE_MODULES.map(f => f.id);
        setInviteData(prev => ({ ...prev, allowedFeatures: adminFeatures }));
      }
    } catch (err) {
      console.error("Failed to fetch current user", err);
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchCurrentUser();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteData.email || !inviteData.name) {
      toast.error("Please fill in all fields");
      return;
    }

    setInviting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/users`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(inviteData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Invite sent successfully!");
        // Reset with admin's paid features as default
        const adminFeatures = currentUser?.subscription?.selectedFeatures || FEATURE_MODULES.map(f => f.id);
        setInviteData({ email: "", role: "MESSAGING_MANAGER", name: "", allowedFeatures: adminFeatures });
        fetchMembers();
      } else {
        toast.error(data.message || "Failed to send invite");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setInviting(false);
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/users/${id}/toggle-status`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchMembers();
      }
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const deleteUser = async () => {
    if (!deletingId) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/users/${deletingId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Member removed");
        setShowDeleteModal(false);
        setDeletingId(null);
        fetchMembers();
      }
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  const startEdit = (member: any) => {
    setEditingMember(member);
    setEditData({
      name: member.name,
      role: member.role,
      allowedFeatures: member.allowedFeatures || []
    });
    setShowEditModal(true);
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    
    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/users/${editingMember.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(editData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Member updated successfully!");
        setShowEditModal(false);
        setEditingMember(null);
        fetchMembers();
      } else {
        toast.error(data.message || "Failed to update member");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-10 max-w-6xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="label-eyebrow">Admin Console</div>
          <h1 className="font-display text-5xl font-semibold text-foreground mt-2">Team management</h1>
          <p className="text-muted-foreground mt-3 text-lg">Invite your staff and assign access to specific features to manage your business operations.</p>
        </div>
      </div>

      {/* Invitation Section */}
      <div className="bg-card border border-border rounded-3xl p-8 shadow-deep animate-in slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <UserPlus className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-semibold">Invite a new member</h2>
        </div>
        
        <form onSubmit={handleInvite} className="grid md:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Staff Name</label>
            <input 
              value={inviteData.name}
              onChange={e => setInviteData({...inviteData, name: e.target.value})}
              placeholder="Full name" 
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Work Email</label>
            <input 
              type="email"
              value={inviteData.email}
              onChange={e => setInviteData({...inviteData, email: e.target.value})}
              placeholder="staff@company.com" 
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Allow Access to Features</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="secondary" className="w-full justify-between border border-border">
                  {inviteData.allowedFeatures.length === 0 
                    ? "Select features..." 
                    : inviteData.allowedFeatures.length === 1 
                      ? FEATURE_MODULES.find(f => f.id === inviteData.allowedFeatures[0])?.name 
                      : `${inviteData.allowedFeatures.length} features selected`}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-2">
                <div className="space-y-2">
                  {(() => {
                    const adminFeatures = currentUser?.subscription?.selectedFeatures || FEATURE_MODULES.map(f => f.id);
                    return FEATURE_MODULES.filter(feature => adminFeatures.includes(feature.id)).map(feature => {
                      const Icon = feature.icon;
                      const isSelected = inviteData.allowedFeatures.includes(feature.id);
                      return (
                        <div 
                          key={feature.id}
                          className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition"
                        >
                          <Checkbox 
                            id={`invite-feature-${feature.id}`}
                            checked={isSelected}
                            onCheckedChange={(checked: boolean | 'indeterminate') => {
                              setInviteData(prev => ({
                                ...prev,
                                allowedFeatures: checked === true 
                                  ? [...prev.allowedFeatures, feature.id]
                                  : prev.allowedFeatures.filter(f => f !== feature.id)
                              }));
                            }}
                          />
                          <Label htmlFor={`invite-feature-${feature.id}`} className="flex items-center gap-2 cursor-pointer flex-1">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            {feature.name}
                          </Label>
                        </div>
                      );
                    });
                  })()}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <button 
            disabled={inviting}
            className="bg-primary text-primary-foreground rounded-xl px-6 py-3 text-sm font-semibold hover:bg-primary-glow transition shadow-deep flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Send Invite
          </button>
        </form>
        <p className="text-[11px] text-muted-foreground mt-4 px-1 italic">
          Staff will receive an email with their login credentials and will be asked to change their password on first login.
        </p>
      </div>

      {/* Members Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            Existing Team <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{members.length} members</span>
          </h3>
        </div>

        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-card">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Member</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Allowed Features</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y border-border">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <p className="text-sm text-muted-foreground mt-2">Loading team data...</p>
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-muted-foreground">
                    No team members found. Start by inviting your first staff member.
                  </td>
                </tr>
              ) : members.map((m) => (
                <tr key={m.id} className="hover:bg-muted/30 transition group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary grid place-items-center font-bold">
                        {m.name.split(' ').map((n: any) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{m.name}</div>
                        <div className="text-xs text-muted-foreground">{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-1">
                      {(m.allowedFeatures || currentUser?.subscription?.selectedFeatures || FEATURE_MODULES.map(f => f.id)).map((featureId: string) => {
                        const feature = FEATURE_MODULES.find(f => f.id === featureId);
                        if (!feature) return null;
                        return (
                          <span key={featureId} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-secondary text-secondary-foreground">
                            <feature.icon className="h-3 w-3" />
                            {feature.name}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                      m.isActive ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive"
                    }`}>
                      <div className={`h-1 w-1 rounded-full ${m.isActive ? "bg-green-500" : "bg-destructive"}`} />
                      {m.isActive ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button 
                        onClick={() => startEdit(m)}
                        title="Edit member"
                        className="h-9 w-9 rounded-xl border border-border flex items-center justify-center hover:bg-secondary transition"
                      >
                        <Key className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => toggleStatus(m.id)}
                        title={m.isActive ? "Deactivate" : "Activate"}
                        className="h-9 w-9 rounded-xl border border-border flex items-center justify-center hover:bg-secondary transition"
                      >
                        <Power className={`h-4 w-4 ${m.isActive ? "text-muted-foreground" : "text-green-500"}`} />
                      </button>
                      <button 
                        onClick={() => confirmDelete(m.id)}
                        title="Remove member"
                        className="h-9 w-9 rounded-xl border border-border flex items-center justify-center hover:bg-destructive/10 hover:border-destructive/20 hover:text-destructive transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-6">
          <div className="max-w-md w-full bg-card border border-border rounded-3xl shadow-deep p-8 animate-in zoom-in duration-300">
            <div className="text-center mb-8">
              <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-8 w-8 text-destructive" />
              </div>
              <h2 className="font-display text-2xl font-semibold">Remove team member?</h2>
              <p className="text-muted-foreground mt-2">
                Are you sure you want to remove this member? This action cannot be undone and they will lose all access to the workspace.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingId(null);
                }}
                className="flex-1 px-6 py-3.5 rounded-xl border border-border font-semibold hover:bg-secondary transition"
              >
                Cancel
              </button>
              <button
                onClick={deleteUser}
                className="flex-1 bg-destructive text-destructive-foreground rounded-xl py-3.5 font-semibold shadow-deep hover:bg-destructive/90 transition"
              >
                Remove Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-6">
          <div className="max-w-2xl w-full bg-card border border-border rounded-3xl shadow-deep p-8 animate-in zoom-in duration-300">
            <div className="mb-6">
              <h2 className="font-display text-2xl font-semibold">Edit Team Member</h2>
              <p className="text-muted-foreground mt-1">Update member details and allowed features</p>
            </div>

            <form onSubmit={handleUpdateMember} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Name</label>
                <input 
                  value={editData.name}
                  onChange={e => setEditData({...editData, name: e.target.value})}
                  placeholder="Full name" 
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Allow Access to Features</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="secondary" className="w-full justify-between border border-border">
                      {editData.allowedFeatures.length === 0 
                        ? "Select features..." 
                        : editData.allowedFeatures.length === 1 
                          ? FEATURE_MODULES.find(f => f.id === editData.allowedFeatures[0])?.name 
                          : `${editData.allowedFeatures.length} features selected`}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-2">
                    <div className="space-y-2">
                      {(() => {
                        const adminFeatures = currentUser?.subscription?.selectedFeatures || FEATURE_MODULES.map(f => f.id);
                        return FEATURE_MODULES.filter(feature => adminFeatures.includes(feature.id)).map(feature => {
                          const Icon = feature.icon;
                          const isSelected = editData.allowedFeatures.includes(feature.id);
                          return (
                            <div 
                              key={feature.id}
                              className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition"
                            >
                              <Checkbox 
                                id={`edit-feature-${feature.id}`}
                                checked={isSelected}
                                onCheckedChange={(checked: boolean | 'indeterminate') => {
                                  setEditData(prev => ({
                                    ...prev,
                                    allowedFeatures: checked === true 
                                      ? [...prev.allowedFeatures, feature.id]
                                      : prev.allowedFeatures.filter(f => f !== feature.id)
                                  }));
                                }}
                              />
                              <Label htmlFor={`edit-feature-${feature.id}`} className="flex items-center gap-2 cursor-pointer flex-1">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                                {feature.name}
                              </Label>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingMember(null);
                  }}
                  className="flex-1 px-6 py-3.5 rounded-xl border border-border font-semibold hover:bg-secondary transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 bg-primary text-primary-foreground rounded-xl py-3.5 font-semibold shadow-deep hover:bg-primary-glow transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
