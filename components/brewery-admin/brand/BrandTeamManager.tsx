"use client";

import { useState, useEffect } from "react";
import { UserPlus, Trash2, Loader2, Shield, Users } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useToast } from "@/components/ui/Toast";

interface BrandTeamManagerProps {
  brandId: string;
  isOwner: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  regional_manager: "Regional Manager",
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  owner: "Full access to all locations and brand settings",
  regional_manager: "Manages all locations (no billing or danger zone)",
};

export function BrandTeamManager({ brandId, isOwner }: BrandTeamManagerProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addEmail, setAddEmail] = useState("");
  const [addRole, setAddRole] = useState<string>("regional_manager");
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const { success, error: toastError } = useToast();

  async function fetchMembers(showLoading = false) {
    if (showLoading) setLoading(true);
    const res = await fetch(`/api/brand/${brandId}/members`);
    const data = await res.json();
    setMembers(data.data ?? []);
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks -- async fetch pattern, setState is after await
  useEffect(() => {
    void fetchMembers(); // loading starts true
  }, [brandId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAdd() {
    if (!addEmail) return;
    setAdding(true);
    const res = await fetch(`/api/brand/${brandId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email_or_username: addEmail, role: addRole }),
    });
    const data = await res.json();
    setAdding(false);
    if (res.ok && data.data) {
      setMembers((prev) => [...prev, data.data]);
      setAddEmail("");
      success("Brand member added! Access propagated to all locations.");
    } else {
      toastError(data.error?.message ?? "Failed to add member");
    }
  }

  async function handleRemove(userId: string) {
    setRemovingId(userId);
    const res = await fetch(`/api/brand/${brandId}/members`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });
    setRemovingId(null);
    setConfirmRemoveId(null);
    if (res.ok) {
      setMembers((prev) => prev.filter((m: any) => m.user_id !== userId));
      success("Member removed from brand and all locations");
    } else {
      toastError("Failed to remove member");
    }
  }

  const inputStyle = {
    width: "100%", padding: "10px 16px", borderRadius: 12,
    border: "1px solid var(--border)", background: "var(--surface-2)",
    color: "var(--text-primary)", fontSize: 14, outline: "none",
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Users size={18} style={{ color: "var(--accent-gold)" }} />
        <h2 className="font-display font-bold text-lg" style={{ color: "var(--text-primary)" }}>Brand Team</h2>
      </div>

      {/* Role legend */}
      <div className="rounded-xl p-3 mb-4 space-y-1.5" style={{ background: "var(--surface-2)" }}>
        {Object.entries(ROLE_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-2">
            <Shield size={12} style={{ color: "var(--accent-gold)" }} />
            <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{label}</span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>— {ROLE_DESCRIPTIONS[key]}</span>
          </div>
        ))}
      </div>

      {/* Members list */}
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 size={20} className="animate-spin" style={{ color: "var(--text-muted)" }} />
        </div>
      ) : (
        <div className="space-y-2 mb-4">
          {members.map((m: any) => (
            <div key={m.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--surface-2)" }}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: "color-mix(in srgb, var(--accent-gold) 20%, transparent)", color: "var(--accent-gold)" }}>
                  {(m.profile?.display_name ?? m.profile?.username ?? "?")[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    {m.profile?.display_name || m.profile?.username || "Unknown"}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {ROLE_LABELS[m.role] ?? m.role}
                  </p>
                </div>
              </div>

              {isOwner && m.role !== "owner" && (
                <div className="flex-shrink-0 ml-2">
                  {confirmRemoveId === m.user_id ? (
                    <AnimatePresence>
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                        <button onClick={() => setConfirmRemoveId(null)} className="text-xs px-2 py-1 rounded-lg" style={{ color: "var(--text-muted)" }}>Cancel</button>
                        <button onClick={() => handleRemove(m.user_id)} disabled={removingId === m.user_id} className="text-xs px-2 py-1 rounded-lg font-medium" style={{ color: "var(--danger)" }}>
                          {removingId === m.user_id ? "..." : "Remove"}
                        </button>
                      </motion.div>
                    </AnimatePresence>
                  ) : (
                    <button onClick={() => setConfirmRemoveId(m.user_id)} className="p-1.5 rounded-lg transition-opacity hover:opacity-70" style={{ color: "var(--text-muted)" }}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add member form */}
      {isOwner && (
        <div className="flex gap-2">
          <input
            type="text"
            value={addEmail}
            onChange={(e) => setAddEmail(e.target.value)}
            placeholder="Email or username"
            style={inputStyle}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <select
            value={addRole}
            onChange={(e) => setAddRole(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm"
            style={{ background: "var(--surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
          >
            <option value="regional_manager">Regional Manager</option>
            <option value="owner">Owner</option>
          </select>
          <button
            onClick={handleAdd}
            disabled={adding || !addEmail}
            className="px-3 py-2 rounded-xl flex-shrink-0 disabled:opacity-40"
            style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
          >
            {adding ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
          </button>
        </div>
      )}
    </div>
  );
}
