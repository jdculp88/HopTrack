"use client";

import { useState, useEffect } from "react";
import { Users, UserPlus, Trash2, Loader2, Shield, ShieldCheck, ShieldAlert, ChevronDown, Clock, X, MapPin } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useToast } from "@/components/ui/Toast";
import { LocationScopePicker } from "@/components/brewery-admin/brand/LocationScopePicker";

const SPRING = { type: "spring" as const, stiffness: 400, damping: 30 };

interface Location {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
}

interface BrandTeamClientProps {
  brandId: string;
  brandName: string;
  locations: Location[];
  userRole: string;
  userId: string;
}

const ROLE_CONFIG: Record<string, { label: string; description: string; icon: typeof Shield; color: string }> = {
  owner: {
    label: "Owner",
    description: "Full access to all locations, billing, team, and brand settings",
    icon: ShieldAlert,
    color: "var(--accent-gold)",
  },
  brand_manager: {
    label: "Brand Manager",
    description: "Manage all locations, team, catalog, and reports (no billing or dissolve)",
    icon: ShieldCheck,
    color: "var(--accent-gold)",
  },
  regional_manager: {
    label: "Regional Manager",
    description: "Manage scoped locations only (can be limited to specific locations)",
    icon: Shield,
    color: "var(--text-muted)",
  },
};

const FILTER_OPTIONS = [
  { key: "all", label: "All" },
  { key: "owner", label: "Owners" },
  { key: "brand_manager", label: "Brand Managers" },
  { key: "regional_manager", label: "Regional Managers" },
];

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function activityMessage(entry: any): string {
  const actor = entry.actor?.display_name || entry.actor?.username || "Someone";
  const target = entry.target?.display_name || entry.target?.username || "a member";
  switch (entry.action) {
    case "added":
      return `${actor} added ${target} as ${ROLE_CONFIG[entry.new_value]?.label ?? entry.new_value}`;
    case "removed":
      return `${actor} removed ${target}`;
    case "role_changed":
      return `${actor} changed ${target}'s role from ${ROLE_CONFIG[entry.old_value]?.label ?? entry.old_value} to ${ROLE_CONFIG[entry.new_value]?.label ?? entry.new_value}`;
    case "scope_changed":
      return `${actor} changed ${target}'s scope from ${entry.old_value} to ${entry.new_value}`;
    default:
      return `${actor} made a change to ${target}`;
  }
}

export function BrandTeamClient({ brandId, brandName, locations, userRole, userId }: BrandTeamClientProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showActivity, setShowActivity] = useState(false);

  // Add form state
  const [addInput, setAddInput] = useState("");
  const [addRole, setAddRole] = useState<string>("regional_manager");
  const [addScope, setAddScope] = useState<string[] | null>(null);
  const [adding, setAdding] = useState(false);

  // Inline actions state
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [editingScopeId, setEditingScopeId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { success, error: toastError } = useToast();
  const canManage = userRole === "owner" || userRole === "brand_manager";
  const isOwner = userRole === "owner";

  async function fetchMembers(showLoading = false) {
    if (showLoading) setLoading(true);
    const res = await fetch(`/api/brand/${brandId}/members`);
    const data = await res.json();
    setMembers(data.data ?? []);
    setLoading(false);
  }

  async function fetchActivity() {
    const res = await fetch(`/api/brand/${brandId}/team-activity?limit=50`);
    const data = await res.json();
    setActivity(data.data ?? []);
  }

  /* eslint-disable react-hooks/rules-of-hooks -- async fetch pattern, setState is after await */
  useEffect(() => {
    void fetchMembers(); // loading starts true
    if (canManage) void fetchActivity();
  }, [brandId]); // eslint-disable-line react-hooks/exhaustive-deps
  /* eslint-enable react-hooks/rules-of-hooks */

  async function handleAdd() {
    if (!addInput.trim()) return;
    setAdding(true);

    const body: any = { email_or_username: addInput.trim(), role: addRole };
    if (addRole === "regional_manager" && addScope && addScope.length > 0) {
      body.location_scope = addScope;
    }

    const res = await fetch(`/api/brand/${brandId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setAdding(false);

    if (res.ok && data.data) {
      setMembers((prev) => [...prev, data.data]);
      setAddInput("");
      setAddRole("regional_manager");
      setAddScope(null);
      setShowAddForm(false);
      success("Team member added! Access propagated to locations.");
      fetchActivity();
    } else {
      toastError(data.error?.message ?? "Failed to add member");
    }
  }

  async function handleRemove(targetUserId: string) {
    setRemovingId(targetUserId);
    const res = await fetch(`/api/brand/${brandId}/members`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: targetUserId }),
    });
    setRemovingId(null);
    setConfirmRemoveId(null);

    if (res.ok) {
      setMembers((prev) => prev.filter((m) => m.user_id !== targetUserId));
      success("Member removed from brand and all locations");
      fetchActivity();
    } else {
      toastError("Failed to remove member");
    }
  }

  async function handleRoleChange(targetUserId: string, newRole: string) {
    setUpdatingId(targetUserId);
    const res = await fetch(`/api/brand/${brandId}/members`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: targetUserId, role: newRole }),
    });
    setUpdatingId(null);

    if (res.ok) {
      setMembers((prev) =>
        prev.map((m) => (m.user_id === targetUserId ? { ...m, role: newRole } : m))
      );
      success(`Role updated to ${ROLE_CONFIG[newRole]?.label ?? newRole}`);
      fetchActivity();
    } else {
      const data = await res.json();
      toastError(data.error?.message ?? "Failed to update role");
    }
  }

  async function handleScopeChange(targetUserId: string, newScope: string[] | null) {
    setUpdatingId(targetUserId);
    const res = await fetch(`/api/brand/${brandId}/members`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: targetUserId, location_scope: newScope }),
    });
    setUpdatingId(null);

    if (res.ok) {
      setMembers((prev) =>
        prev.map((m) => (m.user_id === targetUserId ? { ...m, location_scope: newScope } : m))
      );
      success("Location scope updated");
      setEditingScopeId(null);
      fetchActivity();
    } else {
      toastError("Failed to update scope");
    }
  }

  const filteredMembers = filter === "all"
    ? members
    : members.filter((m) => m.role === filter);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users size={20} style={{ color: "var(--accent-gold)" }} />
          <h1 className="font-display font-bold text-xl" style={{ color: "var(--text-primary)" }}>
            Brand Team
          </h1>
          <span
            className="text-xs font-mono px-2 py-0.5 rounded-full"
            style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)", color: "var(--accent-gold)" }}
          >
            {members.length}
          </span>
        </div>
        {canManage && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
            style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
          >
            {showAddForm ? <X size={16} /> : <UserPlus size={16} />}
            {showAddForm ? "Cancel" : "Add Member"}
          </button>
        )}
      </div>

      {/* Add Member Form */}
      <AnimatePresence>
        {showAddForm && canManage && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={SPRING}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-2xl space-y-3" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={addInput}
                  onChange={(e) => setAddInput(e.target.value)}
                  placeholder="Email or username"
                  className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: "var(--surface)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                />
                <select
                  value={addRole}
                  onChange={(e) => setAddRole(e.target.value)}
                  className="px-3 py-2 rounded-xl text-sm"
                  style={{ background: "var(--surface)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
                >
                  {isOwner && <option value="owner">Owner</option>}
                  <option value="brand_manager">Brand Manager</option>
                  <option value="regional_manager">Regional Manager</option>
                </select>
              </div>

              {/* Location scope picker for regional managers */}
              <AnimatePresence>
                {addRole === "regional_manager" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={SPRING}
                    className="overflow-hidden"
                  >
                    <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-muted)" }}>
                      Location Access
                    </label>
                    <LocationScopePicker
                      locations={locations}
                      value={addScope}
                      onChange={setAddScope}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={handleAdd}
                disabled={adding || !addInput.trim()}
                className="w-full px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-40 transition-opacity hover:opacity-90"
                style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
              >
                {adding ? (
                  <Loader2 size={16} className="animate-spin mx-auto" />
                ) : (
                  "Add to Brand Team"
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Pills */}
      <div className="flex gap-2 flex-wrap">
        {FILTER_OPTIONS.map((opt) => {
          const count = opt.key === "all" ? members.length : members.filter((m) => m.role === opt.key).length;
          return (
            <button
              key={opt.key}
              onClick={() => setFilter(opt.key)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={
                filter === opt.key
                  ? { background: "var(--accent-gold)", color: "var(--bg)" }
                  : { background: "var(--surface-2)", color: "var(--text-muted)" }
              }
            >
              {opt.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Team Roster */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin" style={{ color: "var(--text-muted)" }} />
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="text-center py-8">
          <Users size={32} className="mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {filter === "all" ? "No team members yet" : `No ${FILTER_OPTIONS.find((o) => o.key === filter)?.label?.toLowerCase()}`}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredMembers.map((m: any) => {
            const roleConfig = ROLE_CONFIG[m.role] ?? ROLE_CONFIG.regional_manager;
            const RoleIcon = roleConfig.icon;
            const isSelf = m.user_id === userId;
            const scopeNames = m.location_scope
              ? m.location_scope.map((id: string) => locations.find((l) => l.id === id)?.name ?? "Unknown").filter(Boolean)
              : [];
            const scopeLabel = m.location_scope
              ? scopeNames.length <= 3
                ? scopeNames.join(", ")
                : `${scopeNames.length} of ${locations.length} locations`
              : "All locations";
            const isAllLocations = !m.location_scope;

            return (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={SPRING}
                className="p-4 rounded-2xl"
                style={{ background: "var(--surface-2)" }}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{
                      background: "color-mix(in srgb, var(--accent-gold) 20%, transparent)",
                      color: "var(--accent-gold)",
                    }}
                  >
                    {(m.profile?.display_name ?? m.profile?.username ?? "?")[0].toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                        {m.profile?.display_name || m.profile?.username || "Unknown"}
                        {isSelf && (
                          <span className="text-xs ml-1" style={{ color: "var(--text-muted)" }}>(you)</span>
                        )}
                      </p>
                    </div>

                    {m.profile?.username && m.profile?.display_name && (
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>@{m.profile.username}</p>
                    )}

                    {/* Role + scope row */}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {/* Role badge or dropdown */}
                      {isOwner && m.role !== "owner" && !isSelf ? (
                        <select
                          value={m.role}
                          onChange={(e) => handleRoleChange(m.user_id, e.target.value)}
                          disabled={updatingId === m.user_id}
                          className="text-xs px-2 py-1 rounded-lg"
                          style={{
                            background: "color-mix(in srgb, var(--accent-gold) 10%, transparent)",
                            color: "var(--accent-gold)",
                            border: "1px solid color-mix(in srgb, var(--accent-gold) 20%, transparent)",
                          }}
                        >
                          <option value="brand_manager">Brand Manager</option>
                          <option value="regional_manager">Regional Manager</option>
                        </select>
                      ) : (
                        <span
                          className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                          style={{
                            background: "color-mix(in srgb, var(--accent-gold) 10%, transparent)",
                            color: roleConfig.color,
                          }}
                        >
                          <RoleIcon size={10} />
                          {roleConfig.label}
                        </span>
                      )}

                      {/* Scope */}
                      {m.role !== "owner" && (
                        <>
                          {editingScopeId === m.user_id ? (
                            <div className="flex-1 min-w-[180px]">
                              <LocationScopePicker
                                locations={locations}
                                value={m.location_scope}
                                onChange={(newScope) => handleScopeChange(m.user_id, newScope)}
                              />
                            </div>
                          ) : (
                            <button
                              onClick={() => canManage && setEditingScopeId(m.user_id)}
                              className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-opacity hover:opacity-80"
                              style={isAllLocations
                                ? { background: "color-mix(in srgb, #22c55e 10%, transparent)", color: "#22c55e", border: "1px solid color-mix(in srgb, #22c55e 20%, transparent)" }
                                : { background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)" }
                              }
                              disabled={!canManage}
                            >
                              <MapPin size={10} />
                              {scopeLabel}
                              {canManage && <ChevronDown size={10} className="ml-0.5" />}
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    {/* Meta: joined + invited by */}
                    <div className="flex items-center gap-3 mt-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        Joined {timeAgo(m.invited_at ?? m.created_at)}
                      </span>
                      {m.inviter && (m.inviter.display_name || m.inviter.username) && (
                        <span>by {m.inviter.display_name || m.inviter.username}</span>
                      )}
                    </div>
                  </div>

                  {/* Remove button */}
                  {canManage && m.role !== "owner" && !isSelf && (
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => setConfirmRemoveId(m.user_id)}
                        className="p-2 rounded-lg transition-opacity hover:opacity-70"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Inline remove confirmation */}
                <AnimatePresence>
                  {confirmRemoveId === m.user_id && (
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
                        <p className="text-xs" style={{ color: "var(--danger)" }}>
                          Remove {m.profile?.display_name || m.profile?.username}? This revokes access to all locations.
                        </p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => setConfirmRemoveId(null)}
                            className="text-xs px-3 py-1.5 rounded-lg"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleRemove(m.user_id)}
                            disabled={removingId === m.user_id}
                            className="text-xs px-3 py-1.5 rounded-lg font-medium"
                            style={{ background: "var(--danger)", color: "#fff" }}
                          >
                            {removingId === m.user_id ? "Removing..." : "Remove"}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Role Legend */}
      <div className="rounded-2xl p-4 space-y-2" style={{ background: "var(--surface-2)" }}>
        <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Role Permissions
        </h3>
        {Object.entries(ROLE_CONFIG).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <div key={key} className="flex items-start gap-2">
              <Icon size={14} className="mt-0.5 flex-shrink-0" style={{ color: config.color }} />
              <div>
                <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  {config.label}
                </span>
                <span className="text-xs ml-2" style={{ color: "var(--text-muted)" }}>
                  — {config.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity Log */}
      {canManage && activity.length > 0 && (
        <div className="rounded-2xl" style={{ background: "var(--surface-2)" }}>
          <button
            onClick={() => setShowActivity(!showActivity)}
            className="flex items-center justify-between w-full p-4 text-left"
          >
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Activity Log ({activity.length})
            </h3>
            <ChevronDown
              size={14}
              style={{
                color: "var(--text-muted)",
                transform: showActivity ? "rotate(180deg)" : undefined,
                transition: "transform 0.2s",
              }}
            />
          </button>

          <AnimatePresence>
            {showActivity && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                transition={SPRING}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-2 max-h-64 overflow-y-auto">
                  {activity.map((entry: any) => (
                    <div key={entry.id} className="flex items-start gap-2">
                      <div
                        className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                        style={{ background: "var(--accent-gold)" }}
                      />
                      <div className="min-w-0">
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                          {activityMessage(entry)}
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {timeAgo(entry.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
