"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Crown, Users, DollarSign, Trash2, Edit3, ChevronDown, ChevronUp, X, Search, Gift, ArrowUpRight } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";

interface MugClub {
  id: string;
  brewery_id: string;
  name: string;
  description: string | null;
  annual_fee: number;
  max_members: number | null;
  perks: string[];
  is_active: boolean;
  created_at: string;
  member_count: number;
}

interface Member {
  id: string;
  user_id: string;
  status: "active" | "expired" | "cancelled";
  joined_at: string;
  expires_at: string | null;
  notes: string | null;
  profile: { id: string; username: string; display_name: string | null; avatar_url: string | null } | null;
}

interface Props {
  breweryId: string;
  tier: string;
  initialClubs: MugClub[];
}

export function MugClubsClient({ breweryId, tier, initialClubs }: Props) {
  const [clubs, setClubs] = useState<MugClub[]>(initialClubs);
  const [showForm, setShowForm] = useState(false);
  const [editingClub, setEditingClub] = useState<MugClub | null>(null);
  const [expandedClub, setExpandedClub] = useState<string | null>(null);
  const [deletingClub, setDeletingClub] = useState<string | null>(null);
  const { success: toastSuccess, error: toastError } = useToast();

  const canManage = ["cask", "barrel"].includes(tier);

  // ─── Tier Gate ───────────────────────────────────────────────────────
  if (!canManage) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto pt-16 lg:pt-8">
        <div className="text-center py-16 space-y-5">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl"
            style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)" }}>
            <Crown size={28} style={{ color: "var(--accent-gold)" }} />
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              Mug Clubs
            </h2>
            <p className="text-sm max-w-sm mx-auto" style={{ color: "var(--text-secondary)" }}>
              Digital mug club memberships are available on <strong>Cask</strong> and <strong>Barrel</strong> tiers. Manage annual memberships, perks, and members — all in one place.
            </p>
          </div>
          <Link
            href={`/brewery-admin/${breweryId}/billing`}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
          >
            <ArrowUpRight size={15} />
            Upgrade Your Plan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto pt-16 lg:pt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
            Mug Clubs
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Manage digital memberships for your most loyal regulars.
          </p>
        </div>
        <button
          onClick={() => { setEditingClub(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
        >
          <Plus size={15} />
          New Club
        </button>
      </div>

      {/* Create / Edit Form */}
      <AnimatePresence>
        {showForm && (
          <ClubForm
            breweryId={breweryId}
            club={editingClub}
            onSave={(club) => {
              if (editingClub) {
                setClubs(clubs.map(c => c.id === club.id ? { ...club, member_count: c.member_count } : c));
              } else {
                setClubs([{ ...club, member_count: 0 }, ...clubs]);
              }
              setShowForm(false);
              setEditingClub(null);
            }}
            onCancel={() => { setShowForm(false); setEditingClub(null); }}
          />
        )}
      </AnimatePresence>

      {/* Club List */}
      {clubs.length === 0 && !showForm ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 space-y-4">
          <span className="text-5xl block">🍺</span>
          <div className="space-y-2">
            <h3 className="font-display text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              No mug clubs yet
            </h3>
            <p className="text-sm max-w-xs mx-auto" style={{ color: "var(--text-secondary)" }}>
              Create your first mug club to start building loyal memberships.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold"
            style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
          >
            <Crown size={15} />
            Create Your First Mug Club
          </button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {clubs.map((club) => (
            <ClubCard
              key={club.id}
              club={club}
              breweryId={breweryId}
              isExpanded={expandedClub === club.id}
              isDeleting={deletingClub === club.id}
              onToggle={() => setExpandedClub(expandedClub === club.id ? null : club.id)}
              onEdit={() => { setEditingClub(club); setShowForm(true); }}
              onDeleteStart={() => setDeletingClub(club.id)}
              onDeleteCancel={() => setDeletingClub(null)}
              onDeleteConfirm={async () => {
                const res = await fetch(`/api/brewery/${breweryId}/mug-clubs/${club.id}`, { method: "DELETE" });
                if (res.ok) {
                  setClubs(clubs.filter(c => c.id !== club.id));
                  setDeletingClub(null);
                  toastSuccess("Club deleted");
                } else {
                  toastError("Failed to delete club");
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Club Form ──────────────────────────────────────────────────────────────

function ClubForm({
  breweryId,
  club,
  onSave,
  onCancel,
}: {
  breweryId: string;
  club: MugClub | null;
  onSave: (club: MugClub) => void;
  onCancel: () => void;
}) {
  const { success: toastSuccess, error: toastError } = useToast();
  const [name, setName] = useState(club?.name ?? "");
  const [description, setDescription] = useState(club?.description ?? "");
  const [annualFee, setAnnualFee] = useState(club?.annual_fee?.toString() ?? "");
  const [maxMembers, setMaxMembers] = useState(club?.max_members?.toString() ?? "");
  const [perks, setPerks] = useState<string[]>(club?.perks ?? []);
  const [newPerk, setNewPerk] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !annualFee) return;

    setSaving(true);
    const body = {
      name,
      description: description || null,
      annual_fee: parseFloat(annualFee),
      max_members: maxMembers ? parseInt(maxMembers) : null,
      perks,
    };

    const url = club
      ? `/api/brewery/${breweryId}/mug-clubs/${club.id}`
      : `/api/brewery/${breweryId}/mug-clubs`;

    const res = await fetch(url, {
      method: club ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      onSave(data.club);
      toastSuccess(club ? "Club updated" : "Club created");
    } else {
      const err = await res.json().catch(() => ({}));
      toastError(err.error || "Something went wrong");
    }
    setSaving(false);
  }

  function addPerk() {
    const trimmed = newPerk.trim();
    if (trimmed && !perks.includes(trimmed)) {
      setPerks([...perks, trimmed]);
      setNewPerk("");
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      onSubmit={handleSubmit}
      className="mb-6 p-5 rounded-2xl border space-y-4 overflow-hidden"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-lg" style={{ color: "var(--text-primary)" }}>
          {club ? "Edit Club" : "New Mug Club"}
        </h3>
        <button type="button" onClick={onCancel} className="p-1.5 rounded-lg hover:opacity-70" aria-label="Cancel">
          <X size={16} style={{ color: "var(--text-muted)" }} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-mono uppercase tracking-wider block mb-1.5" style={{ color: "var(--text-muted)" }}>
            Club Name *
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Barrel Society 2026"
            required
            className="w-full px-3 py-2.5 rounded-xl text-sm border bg-transparent outline-none focus:ring-1"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)", "--tw-ring-color": "var(--accent-gold)" } as React.CSSProperties}
          />
        </div>
        <div>
          <label className="text-xs font-mono uppercase tracking-wider block mb-1.5" style={{ color: "var(--text-muted)" }}>
            Annual Fee *
          </label>
          <div className="relative">
            <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input
              type="number"
              value={annualFee}
              onChange={(e) => setAnnualFee(e.target.value)}
              placeholder="99.00"
              required
              min="0"
              step="0.01"
              className="w-full pl-8 pr-3 py-2.5 rounded-xl text-sm border bg-transparent outline-none focus:ring-1"
              style={{ borderColor: "var(--border)", color: "var(--text-primary)", "--tw-ring-color": "var(--accent-gold)" } as React.CSSProperties}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs font-mono uppercase tracking-wider block mb-1.5" style={{ color: "var(--text-muted)" }}>
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What makes this club special?"
          rows={2}
          className="w-full px-3 py-2.5 rounded-xl text-sm border bg-transparent outline-none resize-none focus:ring-1"
          style={{ borderColor: "var(--border)", color: "var(--text-primary)", "--tw-ring-color": "var(--accent-gold)" } as React.CSSProperties}
        />
      </div>

      <div>
        <label className="text-xs font-mono uppercase tracking-wider block mb-1.5" style={{ color: "var(--text-muted)" }}>
          Max Members <span className="normal-case">(leave blank for unlimited)</span>
        </label>
        <input
          type="number"
          value={maxMembers}
          onChange={(e) => setMaxMembers(e.target.value)}
          placeholder="Unlimited"
          min="1"
          className="w-full px-3 py-2.5 rounded-xl text-sm border bg-transparent outline-none focus:ring-1 max-w-[200px]"
          style={{ borderColor: "var(--border)", color: "var(--text-primary)", "--tw-ring-color": "var(--accent-gold)" } as React.CSSProperties}
        />
      </div>

      {/* Perks Builder */}
      <div>
        <label className="text-xs font-mono uppercase tracking-wider block mb-1.5" style={{ color: "var(--text-muted)" }}>
          Membership Perks
        </label>
        {perks.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {perks.map((perk, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ background: "color-mix(in srgb, var(--accent-gold) 12%, transparent)", color: "var(--accent-gold)" }}
              >
                <Gift size={11} />
                {perk}
                <button type="button" onClick={() => setPerks(perks.filter((_, j) => j !== i))} className="hover:opacity-60">
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={newPerk}
            onChange={(e) => setNewPerk(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addPerk(); } }}
            placeholder="e.g. 10% off all pours"
            className="flex-1 px-3 py-2 rounded-xl text-sm border bg-transparent outline-none focus:ring-1"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)", "--tw-ring-color": "var(--accent-gold)" } as React.CSSProperties}
          />
          <button
            type="button"
            onClick={addPerk}
            className="px-3 py-2 rounded-xl text-sm font-medium border transition-opacity hover:opacity-80"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            Add
          </button>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={saving || !name || !annualFee}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
        >
          {saving ? "Saving..." : club ? "Update Club" : "Create Club"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl text-sm font-medium border transition-opacity hover:opacity-80"
          style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
        >
          Cancel
        </button>
      </div>
    </motion.form>
  );
}

// ─── Club Card ──────────────────────────────────────────────────────────────

function ClubCard({
  club,
  breweryId,
  isExpanded,
  isDeleting,
  onToggle,
  onEdit,
  onDeleteStart,
  onDeleteCancel,
  onDeleteConfirm,
}: {
  club: MugClub;
  breweryId: string;
  isExpanded: boolean;
  isDeleting: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDeleteStart: () => void;
  onDeleteCancel: () => void;
  onDeleteConfirm: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border overflow-hidden"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {/* Club Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Crown size={16} style={{ color: "var(--accent-gold)" }} />
              <h3 className="font-display font-bold text-lg truncate" style={{ color: "var(--text-primary)" }}>
                {club.name}
              </h3>
              <span
                className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0"
                style={{
                  background: club.is_active
                    ? "color-mix(in srgb, #22c55e 15%, transparent)"
                    : "color-mix(in srgb, var(--text-muted) 15%, transparent)",
                  color: club.is_active ? "#22c55e" : "var(--text-muted)",
                }}
              >
                {club.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            {club.description && (
              <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
                {club.description}
              </p>
            )}

            {/* Stats row */}
            <div className="flex items-center gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
              <span className="flex items-center gap-1">
                <DollarSign size={12} />
                ${Number(club.annual_fee).toFixed(0)}/yr
              </span>
              <span className="flex items-center gap-1">
                <Users size={12} />
                {club.member_count} member{club.member_count !== 1 ? "s" : ""}
                {club.max_members ? ` / ${club.max_members}` : ""}
              </span>
            </div>

            {/* Perks */}
            {club.perks.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {club.perks.map((perk, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium"
                    style={{ background: "color-mix(in srgb, var(--accent-gold) 10%, transparent)", color: "var(--accent-gold)" }}
                  >
                    <Gift size={10} />
                    {perk}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={onEdit} className="p-2 rounded-lg hover:opacity-70" aria-label="Edit club">
              <Edit3 size={14} style={{ color: "var(--text-muted)" }} />
            </button>
            <button onClick={onDeleteStart} className="p-2 rounded-lg hover:opacity-70" aria-label="Delete club">
              <Trash2 size={14} style={{ color: "var(--danger)" }} />
            </button>
            <button onClick={onToggle} className="p-2 rounded-lg hover:opacity-70" aria-label={isExpanded ? "Collapse" : "Expand"}>
              {isExpanded ? <ChevronUp size={14} style={{ color: "var(--text-muted)" }} /> : <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />}
            </button>
          </div>
        </div>

        {/* Inline delete confirmation */}
        <AnimatePresence>
          {isDeleting && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-3 rounded-xl flex items-center justify-between"
              style={{ background: "color-mix(in srgb, var(--danger) 10%, transparent)" }}
            >
              <p className="text-xs font-medium" style={{ color: "var(--danger)" }}>
                Delete this club and all its members?
              </p>
              <div className="flex gap-2">
                <button onClick={onDeleteCancel} className="px-3 py-1.5 rounded-lg text-xs font-medium border" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                  Cancel
                </button>
                <button onClick={onDeleteConfirm} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: "var(--danger)" }}>
                  Delete
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Expanded: Member Management */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <MemberSection breweryId={breweryId} club={club} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Member Section ─────────────────────────────────────────────────────────

function MemberSection({ breweryId, club }: { breweryId: string; club: MugClub }) {
  const { success: toastSuccess, error: toastError } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ id: string; username: string; display_name: string | null; avatar_url: string | null }>>([]);
  const [_searching, setSearching] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    if (loaded) return;
    setLoading(true);
    const res = await fetch(`/api/brewery/${breweryId}/mug-clubs/${club.id}/members`);
    if (res.ok) {
      const data = await res.json();
      setMembers(data.members ?? []);
    }
    setLoaded(true);
    setLoading(false);
  }, [breweryId, club.id, loaded]);

  // Load on mount
  useState(() => { loadMembers(); });

  async function searchUsers(query: string) {
    setSearchQuery(query);
    if (query.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await res.json();
      // Filter out existing members
      const memberIds = new Set(members.map(m => m.user_id));
      setSearchResults((data.users ?? []).filter((u: any) => !memberIds.has(u.id)));
    }
    setSearching(false);
  }

  async function addMember(userId: string) {
    const res = await fetch(`/api/brewery/${breweryId}/mug-clubs/${club.id}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        expires_at: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setMembers([data.member, ...members]);
      setSearchQuery("");
      setSearchResults([]);
      toastSuccess("Member added");
    } else {
      const err = await res.json().catch(() => ({}));
      toastError(err.error || "Failed to add member");
    }
  }

  async function removeMember(memberId: string) {
    const res = await fetch(`/api/brewery/${breweryId}/mug-clubs/${club.id}/members`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ member_id: memberId }),
    });
    if (res.ok) {
      setMembers(members.filter(m => m.id !== memberId));
      setRemovingId(null);
      toastSuccess("Member removed");
    } else {
      toastError("Failed to remove member");
    }
  }

  return (
    <div className="border-t px-5 pb-5 pt-4 space-y-3" style={{ borderColor: "var(--border)" }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Members
        </span>
      </div>

      {/* Add member search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
        <input
          value={searchQuery}
          onChange={(e) => searchUsers(e.target.value)}
          placeholder="Search by username to add..."
          className="w-full pl-9 pr-3 py-2 rounded-xl text-sm border bg-transparent outline-none focus:ring-1"
          style={{ borderColor: "var(--border)", color: "var(--text-primary)", "--tw-ring-color": "var(--accent-gold)" } as React.CSSProperties}
        />
        {/* Search results dropdown */}
        {searchResults.length > 0 && (
          <div
            className="absolute z-10 w-full mt-1 rounded-xl border shadow-lg overflow-hidden"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            {searchResults.slice(0, 5).map((user) => (
              <button
                key={user.id}
                onClick={() => addMember(user.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:opacity-80 transition-opacity"
              >
                <UserAvatar profile={user as any} size="xs" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    {user.display_name || user.username}
                  </p>
                  <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                    @{user.username}
                  </p>
                </div>
                <Plus size={14} style={{ color: "var(--accent-gold)" }} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Member list */}
      {loading ? (
        <p className="text-xs py-4 text-center" style={{ color: "var(--text-muted)" }}>Loading members...</p>
      ) : members.length === 0 ? (
        <p className="text-xs py-4 text-center" style={{ color: "var(--text-muted)" }}>No members yet. Search for users to add.</p>
      ) : (
        <div className="space-y-1.5">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: "color-mix(in srgb, var(--surface-2) 50%, transparent)" }}>
              <UserAvatar profile={member.profile as any} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                  {member.profile?.display_name || member.profile?.username || "Unknown"}
                </p>
                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                  Joined {new Date(member.joined_at).toLocaleDateString()}
                  {member.expires_at && ` · Expires ${new Date(member.expires_at).toLocaleDateString()}`}
                </p>
              </div>
              <span
                className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full"
                style={{
                  background: member.status === "active"
                    ? "color-mix(in srgb, #22c55e 15%, transparent)"
                    : "color-mix(in srgb, var(--text-muted) 15%, transparent)",
                  color: member.status === "active" ? "#22c55e" : "var(--text-muted)",
                }}
              >
                {member.status}
              </span>

              {/* Inline remove */}
              {removingId === member.id ? (
                <div className="flex gap-1">
                  <button onClick={() => setRemovingId(null)} className="px-2 py-1 rounded-lg text-[10px] font-medium border" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
                    No
                  </button>
                  <button onClick={() => removeMember(member.id)} className="px-2 py-1 rounded-lg text-[10px] font-semibold text-white" style={{ background: "var(--danger)" }}>
                    Yes
                  </button>
                </div>
              ) : (
                <button onClick={() => setRemovingId(member.id)} className="p-1.5 rounded-lg hover:opacity-70" aria-label="Remove member">
                  <X size={12} style={{ color: "var(--text-muted)" }} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
