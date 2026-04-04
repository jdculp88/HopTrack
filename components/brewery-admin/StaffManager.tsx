"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UserPlus, Trash2, Shield, ShieldCheck, ShieldAlert, Beer, ChevronDown, X, Loader2, Building2 } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useToast } from "@/components/ui/Toast";

// ─── Types ─────────────────────────────────────────────────────────────────────

type StaffRole = "owner" | "business" | "marketing" | "staff";

interface StaffMember {
  id: string;
  user_id: string;
  role: StaffRole;
  propagated_from_brand?: boolean;
  profile: {
    display_name: string | null;
    username?: string;
    avatar_url?: string | null;
    email?: string;
  };
}

interface StaffManagerProps {
  breweryId: string;
  currentUserRole: string; // 'owner' | 'business' | 'marketing' | 'staff'
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const SPRING = { type: "spring" as const, stiffness: 400, damping: 30 };

const ROLE_CONFIG: Record<StaffRole, { label: string; description: string; icon: typeof Shield; color: string }> = {
  owner:     { label: "Admin",     description: "Full access to everything",                                  icon: ShieldAlert, color: "var(--accent-gold)" },
  business:  { label: "Business",  description: "Analytics, billing, staff management — no danger zone",      icon: ShieldCheck, color: "var(--accent-gold)" },
  marketing: { label: "Marketing", description: "Tap list, promos, events, messages, ads — no billing/settings", icon: Shield,   color: "var(--text-secondary)" },
  staff:     { label: "Staff",     description: "Can ONLY confirm redemption codes (for bar staff)",          icon: Beer,        color: "var(--text-muted)" },
};

const ASSIGNABLE_ROLES: StaffRole[] = ["business", "marketing", "staff"];

// ─── Component ─────────────────────────────────────────────────────────────────

export function StaffManager({ breweryId, currentUserRole }: StaffManagerProps) {
  const toast = useToast();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addInput, setAddInput] = useState("");
  const [addRole, setAddRole] = useState<StaffRole>("staff");
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);

  const canManage = currentUserRole === "owner" || currentUserRole === "business";
  const isOwner = currentUserRole === "owner";

  // ─── Fetch staff ───────────────────────────────────────────────────────────

  const fetchStaff = useCallback(async () => {
    try {
      const res = await fetch(`/api/brewery/${breweryId}/staff`);
      if (!res.ok) throw new Error("Failed to load staff");
      const data = await res.json();
      setStaff(data.data ?? data);
    } catch {
      toast.error("Could not load staff list");
    } finally {
      setLoading(false);
    }
  }, [breweryId, toast]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // ─── Add staff ─────────────────────────────────────────────────────────────

  const handleAdd = async () => {
    const trimmed = addInput.trim();
    if (!trimmed) return;

    setAdding(true);
    try {
      const res = await fetch(`/api/brewery/${breweryId}/staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrUsername: trimmed, role: addRole }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to add staff member");
      }
      toast.success(`Added ${trimmed} as ${ROLE_CONFIG[addRole].label}`);
      setAddInput("");
      setAddRole("staff");
      setShowAddForm(false);
      fetchStaff();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to add staff member";
      toast.error(msg);
    } finally {
      setAdding(false);
    }
  };

  // ─── Update role ───────────────────────────────────────────────────────────

  const handleRoleChange = async (memberId: string, newRole: StaffRole) => {
    setUpdatingRoleId(memberId);
    try {
      const res = await fetch(`/api/brewery/${breweryId}/staff`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, role: newRole }),
      });
      if (!res.ok) throw new Error("Failed to update role");
      setStaff((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      );
      toast.success(`Role updated to ${ROLE_CONFIG[newRole].label}`);
    } catch {
      toast.error("Could not update role");
    } finally {
      setUpdatingRoleId(null);
    }
  };

  // ─── Remove staff ──────────────────────────────────────────────────────────

  const handleRemove = async (memberId: string) => {
    setRemovingId(memberId);
    try {
      const res = await fetch(`/api/brewery/${breweryId}/staff`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });
      if (!res.ok) throw new Error("Failed to remove staff member");
      setStaff((prev) => prev.filter((m) => m.id !== memberId));
      setConfirmRemoveId(null);
      toast.success("Staff member removed");
    } catch {
      toast.error("Could not remove staff member");
    } finally {
      setRemovingId(null);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div
        className="rounded-2xl p-6 animate-pulse"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div className="h-6 w-40 rounded-xl mb-4" style={{ background: "var(--surface-2)" }} />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-xl" style={{ background: "var(--surface-2)" }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Staff Management
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            {staff.length} team member{staff.length !== 1 ? "s" : ""}
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowAddForm((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{
              background: showAddForm ? "var(--surface-2)" : "var(--accent-gold)",
              color: showAddForm ? "var(--text-primary)" : "#0F0E0C",
            }}
          >
            <motion.div
              animate={{ rotate: showAddForm ? 45 : 0 }}
              transition={SPRING}
              className="flex items-center"
            >
              {showAddForm ? <X size={16} /> : <UserPlus size={16} />}
            </motion.div>
            {showAddForm ? "Cancel" : "Add Staff"}
          </button>
        )}
      </div>

      {/* ── Add Form ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={SPRING}
            className="overflow-hidden"
          >
            <div
              className="rounded-xl p-4 mb-4"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Email or username"
                  value={addInput}
                  onChange={(e) => setAddInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  className="flex-1 px-3 py-2 rounded-xl text-sm outline-none placeholder:opacity-50"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                />
                <div className="relative">
                  <select
                    value={addRole}
                    onChange={(e) => setAddRole(e.target.value as StaffRole)}
                    className="appearance-none px-3 py-2 pr-8 rounded-xl text-sm outline-none cursor-pointer"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {ASSIGNABLE_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {ROLE_CONFIG[r].label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "var(--text-muted)" }}
                  />
                </div>
                <button
                  onClick={handleAdd}
                  disabled={adding || !addInput.trim()}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-opacity disabled:opacity-40"
                  style={{ background: "var(--accent-gold)", color: "#0F0E0C" }}
                >
                  <motion.div className="flex items-center gap-2" whileTap={{ scale: 0.97 }} transition={SPRING}>
                    {adding ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                    {adding ? "Adding..." : "Add"}
                  </motion.div>
                </button>
              </div>

              {/* Role descriptions */}
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                {ASSIGNABLE_ROLES.map((r) => {
                  const cfg = ROLE_CONFIG[r];
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={r}
                      className="flex items-start gap-2 px-2.5 py-2 rounded-lg text-xs"
                      style={{
                        background: addRole === r ? "var(--surface)" : "transparent",
                        border: addRole === r ? "1px solid var(--border)" : "1px solid transparent",
                      }}
                    >
                      <Icon size={13} style={{ color: cfg.color, flexShrink: 0, marginTop: 1 }} />
                      <div>
                        <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                          {cfg.label}
                        </span>
                        <p style={{ color: "var(--text-muted)" }}>{cfg.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Staff List ─────────────────────────────────────────────────────── */}
      {staff.length === 0 ? (
        <div className="py-10 text-center">
          <Shield size={32} className="mx-auto mb-2 opacity-30" style={{ color: "var(--text-muted)" }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            No staff members yet
          </p>
          {canManage && (
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Add your first team member above
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {staff.map((member) => {
              const cfg = ROLE_CONFIG[member.role];
              const Icon = cfg.icon;
              const isConfirming = confirmRemoveId === member.id;
              const isRemoving = removingId === member.id;
              const isPropagated = member.propagated_from_brand === true;
              const canChangeRole = isOwner && member.role !== "owner" && !isPropagated;
              const canRemove = canManage && member.role !== "owner" && !isPropagated;

              return (
                <motion.div
                  key={member.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={SPRING}
                >
                  <div
                    className="rounded-xl p-3"
                    style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <UserAvatar
                        profile={{
                          display_name: member.profile.display_name,
                          username: member.profile.username,
                          avatar_url: member.profile.avatar_url,
                        }}
                        size="sm"
                      />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                          {member.profile.display_name ?? member.profile.username ?? "Unknown"}
                        </p>
                        {member.profile.email && (
                          <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                            {member.profile.email}
                          </p>
                        )}
                      </div>

                      {/* Role badge or dropdown */}
                      {canChangeRole ? (
                        <div className="relative">
                          <select
                            value={member.role}
                            onChange={(e) => handleRoleChange(member.id, e.target.value as StaffRole)}
                            disabled={updatingRoleId === member.id}
                            className="appearance-none px-2.5 py-1 pr-7 rounded-lg text-xs font-medium outline-none cursor-pointer"
                            style={{
                              background: "var(--surface)",
                              border: "1px solid var(--border)",
                              color: cfg.color,
                            }}
                          >
                            {ASSIGNABLE_ROLES.map((r) => (
                              <option key={r} value={r}>
                                {ROLE_CONFIG[r].label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={12}
                            className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ color: "var(--text-muted)" }}
                          />
                        </div>
                      ) : (
                        <div
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                          style={{ background: "var(--surface)", border: "1px solid var(--border)", color: cfg.color }}
                        >
                          <Icon size={12} />
                          {cfg.label}
                        </div>
                      )}

                      {/* Propagated badge */}
                      {isPropagated && (
                        <div
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs"
                          style={{ background: "color-mix(in srgb, var(--accent-gold) 10%, transparent)", color: "var(--accent-gold)" }}
                          title="Managed at brand level"
                        >
                          <Building2 size={10} />
                          Via Brand
                        </div>
                      )}

                      {/* Remove button */}
                      {canRemove && (
                        <button
                          onClick={() => setConfirmRemoveId(isConfirming ? null : member.id)}
                          className="p-1.5 rounded-lg transition-colors hover:opacity-80"
                          style={{ color: "var(--danger)" }}
                          aria-label={`Remove ${member.profile.display_name ?? "staff member"}`}
                        >
                          <motion.div whileTap={{ scale: 0.9 }} transition={SPRING}>
                            <Trash2 size={15} />
                          </motion.div>
                        </button>
                      )}
                    </div>

                    {/* Inline remove confirmation */}
                    <AnimatePresence>
                      {isConfirming && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={SPRING}
                          className="overflow-hidden"
                        >
                          <div
                            className="flex items-center justify-between mt-3 pt-3 gap-3"
                            style={{ borderTop: "1px solid var(--border)" }}
                          >
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                              Remove{" "}
                              <span style={{ color: "var(--text-primary)" }}>
                                {member.profile.display_name ?? member.profile.username ?? "this member"}
                              </span>
                              ?
                            </p>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setConfirmRemoveId(null)}
                                className="px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                                style={{
                                  background: "var(--surface)",
                                  color: "var(--text-secondary)",
                                  border: "1px solid var(--border)",
                                }}
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleRemove(member.id)}
                                disabled={isRemoving}
                                className="px-3 py-1 rounded-lg text-xs font-medium transition-opacity disabled:opacity-50"
                                style={{ background: "var(--danger)", color: "#fff" }}
                              >
                                <motion.div
                                  className="flex items-center gap-1"
                                  whileTap={{ scale: 0.95 }}
                                  transition={SPRING}
                                >
                                  {isRemoving ? (
                                    <Loader2 size={12} className="animate-spin" />
                                  ) : (
                                    <Trash2 size={12} />
                                  )}
                                  {isRemoving ? "Removing..." : "Remove"}
                                </motion.div>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ── Role Legend ─────────────────────────────────────────────────────── */}
      <div className="mt-6 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
        <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>
          Role Permissions
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(["owner", "business", "marketing", "staff"] as StaffRole[]).map((r) => {
            const cfg = ROLE_CONFIG[r];
            const RoleIcon = cfg.icon;
            return (
              <div key={r} className="flex items-start gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                <RoleIcon size={12} style={{ color: cfg.color, flexShrink: 0, marginTop: 1 }} />
                <div>
                  <span className="font-medium" style={{ color: "var(--text-secondary)" }}>
                    {cfg.label}
                  </span>
                  <p className="leading-tight">{cfg.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
