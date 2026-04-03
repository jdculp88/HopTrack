"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trophy, Plus, Trash2, Edit2, Users, CheckCircle, X, Eye, Sparkles, Globe, Lock } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatsGrid } from "@/components/ui/StatsGrid";

const CHALLENGE_ICONS = ["🍺", "🏆", "🔥", "⭐", "🎯", "🍻", "🌟", "💪", "🎉", "🏅", "👑", "🍁", "❄️", "☀️", "🌙", "🎃"];

const CHALLENGE_TYPES = [
  { value: "beer_count", label: "Beer Count", description: "Try N different beers from our tap list" },
  { value: "specific_beers", label: "Specific Beers", description: "Try these specific beers" },
  { value: "visit_streak", label: "Visit Streak", description: "Visit N times total" },
  { value: "style_variety", label: "Style Variety", description: "Try N different styles" },
] as const;

type ChallengeType = "beer_count" | "specific_beers" | "visit_streak" | "style_variety";

interface Challenge {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  challenge_type: ChallengeType;
  target_value: number;
  target_beer_ids: string[];
  reward_description: string | null;
  reward_xp: number;
  reward_loyalty_stamps: number;
  ends_at: string | null;
  is_active: boolean;
  participant_count: number;
  completed_count: number;
  // Sponsored fields (Sprint 91)
  is_sponsored: boolean;
  cover_image_url: string | null;
  geo_radius_km: number | null;
  impressions: number;
  joins_from_discovery: number;
}

interface Beer {
  id: string;
  name: string;
  style: string;
}

interface Props {
  breweryId: string;
  initialChallenges: Challenge[];
  tapListBeers: Beer[];
  subscriptionTier?: string;
}

const GEO_RADIUS_OPTIONS = [
  { value: 10, label: "10 km" },
  { value: 25, label: "25 km" },
  { value: 50, label: "50 km (default)" },
  { value: 100, label: "100 km" },
];

const defaultForm = {
  name: "",
  description: "",
  icon: "🍺",
  challenge_type: "beer_count" as ChallengeType,
  target_value: 5,
  target_beer_ids: [] as string[],
  reward_description: "",
  reward_xp: 100,
  reward_loyalty_stamps: 0,
  ends_at: "",
  is_sponsored: false,
  cover_image_url: "",
  geo_radius_km: 50,
};

export function ChallengesClient({ breweryId, initialChallenges, tapListBeers, subscriptionTier }: Props) {
  const canSponsor = subscriptionTier === "cask" || subscriptionTier === "barrel";
  const [challenges, setChallenges] = useState<Challenge[]>(initialChallenges);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const { success: toastSuccess, error: toastError } = useToast();

  function openCreate() {
    setEditingId(null);
    setForm(defaultForm);
    setShowForm(true);
  }

  function openEdit(c: Challenge) {
    setEditingId(c.id);
    setForm({
      name: c.name,
      description: c.description ?? "",
      icon: c.icon,
      challenge_type: c.challenge_type,
      target_value: c.target_value,
      target_beer_ids: c.target_beer_ids ?? [],
      reward_description: c.reward_description ?? "",
      reward_xp: c.reward_xp,
      reward_loyalty_stamps: c.reward_loyalty_stamps,
      ends_at: c.ends_at ? c.ends_at.split("T")[0] : "",
      is_sponsored: c.is_sponsored ?? false,
      cover_image_url: c.cover_image_url ?? "",
      geo_radius_km: c.geo_radius_km ?? 50,
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name.trim()) { toastError("Name is required"); return; }
    if (form.target_value < 1) { toastError("Target must be at least 1"); return; }
    if (form.challenge_type === "specific_beers" && form.target_beer_ids.length === 0) {
      toastError("Select at least one beer"); return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        ends_at: form.ends_at || null,
        reward_xp: Number(form.reward_xp),
        reward_loyalty_stamps: Number(form.reward_loyalty_stamps),
        target_value: form.challenge_type === "specific_beers"
          ? form.target_beer_ids.length
          : Number(form.target_value),
        is_sponsored: canSponsor ? form.is_sponsored : false,
        cover_image_url: form.cover_image_url || null,
        geo_radius_km: form.is_sponsored ? form.geo_radius_km : null,
        ...(editingId ? { challenge_id: editingId } : {}),
      };

      const res = await fetch(`/api/brewery/${breweryId}/challenges`, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save challenge");
      }

      const saved = await res.json();

      if (editingId) {
        setChallenges(prev => prev.map(c => c.id === editingId ? { ...c, ...saved } : c));
        toastSuccess("Challenge updated");
      } else {
        setChallenges(prev => [{ ...saved, participant_count: 0, completed_count: 0 }, ...prev]);
        toastSuccess("Challenge created!");
      }

      setShowForm(false);
      setEditingId(null);
    } catch (e: any) {
      toastError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(c: Challenge) {
    const res = await fetch(`/api/brewery/${breweryId}/challenges`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challenge_id: c.id, is_active: !c.is_active }),
    });
    if (res.ok) {
      setChallenges(prev => prev.map(ch => ch.id === c.id ? { ...ch, is_active: !c.is_active } : ch));
      toastSuccess(c.is_active ? "Challenge paused" : "Challenge activated");
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/brewery/${breweryId}/challenges`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challenge_id: id }),
    });
    if (res.ok) {
      setChallenges(prev => prev.filter(c => c.id !== id));
      toastSuccess("Challenge deleted");
    } else {
      toastError("Failed to delete");
    }
    setConfirmDeleteId(null);
  }

  function toggleBeer(beerId: string) {
    setForm(prev => ({
      ...prev,
      target_beer_ids: prev.target_beer_ids.includes(beerId)
        ? prev.target_beer_ids.filter(id => id !== beerId)
        : [...prev.target_beer_ids, beerId],
    }));
  }

  const activeCount = challenges.filter(c => c.is_active).length;
  const totalParticipants = challenges.reduce((sum, c) => sum + c.participant_count, 0);
  const totalCompleted = challenges.reduce((sum, c) => sum + c.completed_count, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <PageHeader
        title="Challenges"
        subtitle="Create challenges that keep customers coming back."
        icon={Trophy}
        action={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
          >
            <Plus size={16} />
            New Challenge
          </button>
        }
      />

      {/* Stats */}
      <StatsGrid stats={[
        { label: "Active", value: activeCount },
        { label: "Participants", value: totalParticipants },
        { label: "Completions", value: totalCompleted },
      ]} />

      {/* Create / Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="rounded-2xl border p-6 space-y-5"
            style={{ background: "var(--surface)", borderColor: "var(--accent-gold)" }}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold" style={{ color: "var(--text-primary)" }}>
                {editingId ? "Edit Challenge" : "New Challenge"}
              </h2>
              <button onClick={() => setShowForm(false)}>
                <X size={18} style={{ color: "var(--text-muted)" }} />
              </button>
            </div>

            {/* Icon picker */}
            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: "var(--text-muted)" }}>Icon</label>
              <div className="flex flex-wrap gap-2">
                {CHALLENGE_ICONS.map(icon => (
                  <button
                    key={icon}
                    onClick={() => setForm(prev => ({ ...prev, icon }))}
                    className="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all"
                    style={{
                      background: form.icon === icon ? "var(--accent-gold)" : "var(--surface-2)",
                      transform: form.icon === icon ? "scale(1.15)" : "scale(1)",
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-muted)" }}>Challenge Name *</label>
              <input
                className="w-full rounded-xl px-3 py-2.5 text-sm border outline-none focus:ring-2"
                style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                placeholder="e.g. IPA Explorer"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-muted)" }}>Description</label>
              <input
                className="w-full rounded-xl px-3 py-2.5 text-sm border outline-none"
                style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                placeholder="e.g. Try all 5 of our IPAs on tap"
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            {/* Challenge type */}
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-muted)" }}>Type *</label>
              <div className="grid grid-cols-2 gap-2">
                {CHALLENGE_TYPES.map(({ value, label, description }) => (
                  <button
                    key={value}
                    onClick={() => setForm(prev => ({ ...prev, challenge_type: value, target_beer_ids: [] }))}
                    className="text-left p-3 rounded-xl border transition-all"
                    style={{
                      background: form.challenge_type === value ? "color-mix(in srgb, var(--accent-gold) 10%, transparent)" : "var(--surface-2)",
                      borderColor: form.challenge_type === value ? "var(--accent-gold)" : "var(--border)",
                    }}
                  >
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Target value (hidden for specific_beers — auto-calculated) */}
            {form.challenge_type !== "specific_beers" && (
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-muted)" }}>
                  Target ({form.challenge_type === "visit_streak" ? "visits" : form.challenge_type === "style_variety" ? "styles" : "beers"}) *
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  className="w-full rounded-xl px-3 py-2.5 text-sm border outline-none"
                  style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                  value={form.target_value}
                  onChange={e => setForm(prev => ({ ...prev, target_value: parseInt(e.target.value) || 1 }))}
                />
              </div>
            )}

            {/* Beer picker for specific_beers */}
            {form.challenge_type === "specific_beers" && (
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-muted)" }}>
                  Select Beers * ({form.target_beer_ids.length} selected)
                </label>
                {tapListBeers.length === 0 ? (
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>No beers on tap. Add beers to your tap list first.</p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {tapListBeers.map(beer => (
                      <button
                        key={beer.id}
                        onClick={() => toggleBeer(beer.id)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all"
                        style={{
                          background: form.target_beer_ids.includes(beer.id)
                            ? "color-mix(in srgb, var(--accent-gold) 10%, transparent)"
                            : "var(--surface-2)",
                          borderColor: form.target_beer_ids.includes(beer.id) ? "var(--accent-gold)" : "transparent",
                        }}
                      >
                        <div
                          className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border"
                          style={{
                            background: form.target_beer_ids.includes(beer.id) ? "var(--accent-gold)" : "transparent",
                            borderColor: form.target_beer_ids.includes(beer.id) ? "var(--accent-gold)" : "var(--border)",
                          }}
                        >
                          {form.target_beer_ids.includes(beer.id) && <CheckCircle size={10} color="var(--bg)" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{beer.name}</p>
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{beer.style}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reward */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-muted)" }}>XP Reward</label>
                <input
                  type="number"
                  min={0}
                  className="w-full rounded-xl px-3 py-2.5 text-sm border outline-none"
                  style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                  value={form.reward_xp}
                  onChange={e => setForm(prev => ({ ...prev, reward_xp: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="col-span-1">
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-muted)" }}>Stamps</label>
                <input
                  type="number"
                  min={0}
                  className="w-full rounded-xl px-3 py-2.5 text-sm border outline-none"
                  style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                  value={form.reward_loyalty_stamps}
                  onChange={e => setForm(prev => ({ ...prev, reward_loyalty_stamps: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="col-span-1">
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-muted)" }}>End Date</label>
                <input
                  type="date"
                  className="w-full rounded-xl px-3 py-2.5 text-sm border outline-none"
                  style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                  value={form.ends_at}
                  onChange={e => setForm(prev => ({ ...prev, ends_at: e.target.value }))}
                />
              </div>
            </div>

            {/* Reward description */}
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-muted)" }}>Reward Description</label>
              <input
                className="w-full rounded-xl px-3 py-2.5 text-sm border outline-none"
                style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                placeholder="e.g. Free pint of your choice"
                value={form.reward_description}
                onChange={e => setForm(prev => ({ ...prev, reward_description: e.target.value }))}
              />
            </div>

            {/* Sponsored Section */}
            <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: canSponsor ? "color-mix(in srgb, var(--accent-gold) 30%, transparent)" : "var(--border)", background: "var(--surface-2)" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} style={{ color: "var(--accent-gold)" }} />
                  <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Make it Sponsored</span>
                </div>
                {canSponsor ? (
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, is_sponsored: !prev.is_sponsored }))}
                    className="relative w-10 h-5 rounded-full transition-colors"
                    style={{ background: form.is_sponsored ? "var(--accent-gold)" : "var(--border)" }}
                    role="switch"
                    aria-checked={form.is_sponsored}
                  >
                    <motion.div
                      className="absolute top-0.5 w-4 h-4 rounded-full"
                      style={{ background: "#fff" }}
                      animate={{ left: form.is_sponsored ? 22 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                    <Lock size={10} style={{ color: "var(--text-muted)" }} />
                    <span className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>Cask/Barrel</span>
                  </div>
                )}
              </div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Sponsored challenges appear in Discover and Explore — reaching users who haven't visited your brewery yet.
              </p>

              <AnimatePresence>
                {form.is_sponsored && canSponsor && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden space-y-3"
                  >
                    {/* Cover image URL */}
                    <div>
                      <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-muted)" }}>Cover Image URL</label>
                      <input
                        className="w-full rounded-xl px-3 py-2.5 text-sm border outline-none"
                        style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                        placeholder="https://... (optional)"
                        value={form.cover_image_url}
                        onChange={e => setForm(prev => ({ ...prev, cover_image_url: e.target.value }))}
                      />
                      {form.cover_image_url && (
                        <div className="mt-2 h-20 rounded-xl overflow-hidden">
                          <img src={form.cover_image_url} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    {/* Geo radius */}
                    <div>
                      <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-muted)" }}>
                        <Globe size={10} className="inline mr-1" />
                        Discovery Radius
                      </label>
                      <div className="flex gap-2">
                        {GEO_RADIUS_OPTIONS.map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setForm(prev => ({ ...prev, geo_radius_km: opt.value }))}
                            className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
                            style={{
                              background: form.geo_radius_km === opt.value ? "var(--accent-gold)" : "var(--surface)",
                              color: form.geo_radius_km === opt.value ? "#0F0E0C" : "var(--text-muted)",
                              border: `1px solid ${form.geo_radius_km === opt.value ? "var(--accent-gold)" : "var(--border)"}`,
                            }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border"
                style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
              >
                {saving ? "Saving..." : editingId ? "Save Changes" : "Create Challenge"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Challenge list */}
      {challenges.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: "var(--surface-2)" }}>
          <Trophy size={40} className="mx-auto mb-3 opacity-30" style={{ color: "var(--text-muted)" }} />
          <p className="font-display font-semibold" style={{ color: "var(--text-primary)" }}>No challenges yet</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Create your first challenge to drive repeat visits.</p>
          <button
            onClick={openCreate}
            className="mt-4 px-5 py-2 rounded-xl text-sm font-semibold"
            style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
          >
            Create Challenge
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {challenges.map(c => (
            <motion.div
              key={c.id}
              layout
              className="rounded-2xl border p-4"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{c.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-display font-semibold" style={{ color: "var(--text-primary)" }}>{c.name}</p>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: c.is_active ? "color-mix(in srgb, #22c55e 15%, transparent)" : "var(--surface-2)",
                        color: c.is_active ? "#22c55e" : "var(--text-muted)",
                      }}
                    >
                      {c.is_active ? "Active" : "Paused"}
                    </span>
                    {c.is_sponsored && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)",
                          color: "var(--accent-gold)",
                        }}
                      >
                        <Sparkles size={10} className="inline mr-0.5 -mt-0.5" />
                        Sponsored
                      </span>
                    )}
                    {c.ends_at && new Date(c.ends_at) < new Date() && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
                        Ended
                      </span>
                    )}
                  </div>
                  {c.description && (
                    <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>{c.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {c.participant_count} joined
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle size={12} />
                      {c.completed_count} completed
                    </span>
                    {c.reward_description && (
                      <span>🎁 {c.reward_description}</span>
                    )}
                    {c.ends_at && (
                      <span>
                        Ends {new Date(c.ends_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {/* Sponsored analytics */}
                  {c.is_sponsored && (c.impressions > 0 || c.joins_from_discovery > 0) && (
                    <div className="flex items-center gap-4 mt-1.5 text-xs" style={{ color: "var(--accent-gold)" }}>
                      <span className="flex items-center gap-1">
                        <Eye size={12} />
                        {c.impressions.toLocaleString()} impressions
                      </span>
                      <span className="flex items-center gap-1">
                        <Globe size={12} />
                        {c.joins_from_discovery} from discovery
                      </span>
                      {c.impressions > 0 && (
                        <span className="font-mono">
                          {((c.joins_from_discovery / c.impressions) * 100).toFixed(1)}% conversion
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleToggleActive(c)}
                    className="p-2 rounded-xl text-xs font-medium transition-opacity hover:opacity-70"
                    style={{ color: "var(--text-muted)", background: "var(--surface-2)" }}
                    title={c.is_active ? "Pause" : "Activate"}
                  >
                    {c.is_active ? "Pause" : "Activate"}
                  </button>
                  <button
                    onClick={() => openEdit(c)}
                    className="p-2 rounded-xl transition-opacity hover:opacity-70"
                    style={{ color: "var(--text-muted)", background: "var(--surface-2)" }}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(c.id)}
                    className="p-2 rounded-xl transition-opacity hover:opacity-70"
                    style={{ color: "var(--danger)", background: "var(--surface-2)" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Inline delete confirmation */}
              <AnimatePresence>
                {confirmDeleteId === c.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 pt-3 border-t flex items-center gap-3" style={{ borderColor: "var(--border)" }}>
                      <p className="text-sm flex-1" style={{ color: "var(--text-muted)" }}>
                        Delete this challenge? This cannot be undone.
                      </p>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-3 py-1.5 rounded-xl text-xs border"
                        style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                        style={{ background: "var(--danger)", color: "#fff" }}
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
