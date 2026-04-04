"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Megaphone, Trash2, Edit2, X, Save, Loader2, Eye, MousePointerClick, BarChart3, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import type { BreweryAd } from "@/types/database";
import Link from "next/link";

interface AdsClientProps {
  breweryId: string;
  ads: BreweryAd[];
  tier: string;
}

const emptyForm = {
  title: "",
  body: "",
  image_url: "",
  cta_url: "",
  cta_label: "Visit",
  radius_km: 25,
  budget_cents: 0,
  starts_at: "",
  ends_at: "",
};

export function AdsClient({ breweryId, ads: initialAds, tier }: AdsClientProps) {
  const supabase = createClient();
  const { success: toastSuccess, error: toastError } = useToast();
  const [ads, setAds] = useState<BreweryAd[]>(initialAds);
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState<BreweryAd | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const tierEligible = ["cask", "barrel"].includes(tier);

  function openCreate() {
    setEditingAd(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(ad: BreweryAd) {
    setEditingAd(ad);
    setForm({
      title: ad.title,
      body: ad.body ?? "",
      image_url: ad.image_url ?? "",
      cta_url: ad.cta_url ?? "",
      cta_label: ad.cta_label ?? "Visit",
      radius_km: ad.radius_km,
      budget_cents: ad.budget_cents,
      starts_at: ad.starts_at ? ad.starts_at.slice(0, 16) : "",
      ends_at: ad.ends_at ? ad.ends_at.slice(0, 16) : "",
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.title.trim()) { toastError("Title is required"); return; }
    setSaving(true);

    const payload = {
      title: form.title.trim(),
      body: form.body.trim() || null,
      image_url: form.image_url.trim() || null,
      cta_url: form.cta_url.trim() || null,
      cta_label: form.cta_label.trim() || "Visit",
      radius_km: form.radius_km,
      budget_cents: form.budget_cents,
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : new Date().toISOString(),
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
    };

    if (editingAd) {
      const { data, error } = await supabase
        .from("brewery_ads")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", editingAd.id)
        .select()
        .single() as any;

      if (error) { toastError("Failed to update ad"); setSaving(false); return; }
      setAds(prev => prev.map(a => a.id === editingAd.id ? data : a));
      toastSuccess("Ad updated");
    } else {
      const { data, error } = await supabase
        .from("brewery_ads")
        .insert({ ...payload, brewery_id: breweryId })
        .select()
        .single() as any;

      if (error) { toastError("Failed to create ad"); setSaving(false); return; }
      setAds(prev => [data, ...prev]);
      toastSuccess("Ad created");
    }

    setSaving(false);
    setShowForm(false);
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("brewery_ads").delete().eq("id", id) as any;
    if (error) { toastError("Failed to delete ad"); return; }
    setAds(prev => prev.filter(a => a.id !== id));
    setConfirmDeleteId(null);
    toastSuccess("Ad deleted");
  }

  async function toggleActive(ad: BreweryAd) {
    const newVal = !ad.is_active;
    setAds(prev => prev.map(a => a.id === ad.id ? { ...a, is_active: newVal } : a));
    const { error } = await supabase
      .from("brewery_ads")
      .update({ is_active: newVal, updated_at: new Date().toISOString() })
      .eq("id", ad.id) as any;
    if (error) {
      setAds(prev => prev.map(a => a.id === ad.id ? { ...a, is_active: !newVal } : a));
      toastError("Failed to update ad");
    } else {
      toastSuccess(newVal ? "Ad activated" : "Ad paused");
    }
  }

  // Tier gate
  if (!tierEligible) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto pt-16 lg:pt-8">
        <div className="flex items-center gap-3 mb-6">
          <Megaphone size={24} style={{ color: "var(--accent-gold)" }} />
          <h1 className="font-display text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Ad Campaigns</h1>
        </div>
        <div className="rounded-2xl p-8 text-center border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <Lock size={40} className="mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
          <h2 className="font-display text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            Cask or Barrel Tier Required
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            Promote your brewery to nearby craft beer lovers. Create geo-targeted ad campaigns
            that appear in the HopTrack feed.
          </p>
          <Link
            href={`/brewery-admin/${breweryId}/billing`}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold"
            style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
          >
            Upgrade to Unlock
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto pt-16 lg:pt-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Megaphone size={24} style={{ color: "var(--accent-gold)" }} />
          <h1 className="font-display text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Ad Campaigns</h1>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
        >
          <Plus size={16} />
          New Campaign
        </button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="rounded-2xl p-5 border space-y-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                  {editingAd ? "Edit Campaign" : "New Campaign"}
                </h2>
                <button onClick={() => setShowForm(false)} aria-label="Close" style={{ color: "var(--text-muted)" }}>
                  <X size={20} />
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-muted)" }}>Title *</label>
                  <input
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    maxLength={100}
                    className="w-full px-3 py-2.5 rounded-xl text-sm border bg-transparent"
                    style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
                    placeholder="e.g. New IPA Release This Weekend"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-muted)" }}>Description</label>
                  <textarea
                    value={form.body}
                    onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                    maxLength={500}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl text-sm border bg-transparent resize-none"
                    style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
                    placeholder="Tell people what's happening..."
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-muted)" }}>CTA Label</label>
                  <input
                    value={form.cta_label}
                    onChange={e => setForm(f => ({ ...f, cta_label: e.target.value }))}
                    maxLength={30}
                    className="w-full px-3 py-2.5 rounded-xl text-sm border bg-transparent"
                    style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-muted)" }}>CTA URL</label>
                  <input
                    value={form.cta_url}
                    onChange={e => setForm(f => ({ ...f, cta_url: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm border bg-transparent"
                    style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-muted)" }}>Radius (km)</label>
                  <input
                    type="number"
                    value={form.radius_km}
                    onChange={e => setForm(f => ({ ...f, radius_km: parseInt(e.target.value) || 25 }))}
                    min={1}
                    max={200}
                    className="w-full px-3 py-2.5 rounded-xl text-sm border bg-transparent"
                    style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-muted)" }}>Image URL</label>
                  <input
                    value={form.image_url}
                    onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm border bg-transparent"
                    style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-muted)" }}>Starts</label>
                  <input
                    type="datetime-local"
                    value={form.starts_at}
                    onChange={e => setForm(f => ({ ...f, starts_at: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm border bg-transparent"
                    style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-muted)" }}>Ends</label>
                  <input
                    type="datetime-local"
                    value={form.ends_at}
                    onChange={e => setForm(f => ({ ...f, ends_at: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm border bg-transparent"
                    style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl text-sm font-medium border"
                  style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>Cancel</button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                  style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {editingAd ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ad List */}
      {ads.length === 0 ? (
        <div className="rounded-2xl p-8 text-center border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <Megaphone size={40} className="mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
          <h2 className="font-display text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>No campaigns yet</h2>
          <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
            Create your first ad campaign to reach nearby craft beer lovers.
          </p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold"
            style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
          >
            <Plus size={16} />
            Create Campaign
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {ads.map(ad => (
            <div key={ad.id} className="rounded-2xl p-4 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-display font-bold" style={{ color: "var(--text-primary)" }}>{ad.title}</h3>
                  {ad.body && <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{ad.body}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleActive(ad)}
                    className="text-xs px-2.5 py-1 rounded-lg font-medium"
                    style={{
                      background: ad.is_active
                        ? "color-mix(in srgb, var(--accent-gold) 15%, transparent)"
                        : "color-mix(in srgb, var(--text-muted) 10%, transparent)",
                      color: ad.is_active ? "var(--accent-gold)" : "var(--text-muted)",
                    }}
                  >
                    {ad.is_active ? "Active" : "Paused"}
                  </button>
                  <button onClick={() => openEdit(ad)} style={{ color: "var(--text-muted)" }} aria-label="Edit ad">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => setConfirmDeleteId(ad.id)} style={{ color: "var(--text-muted)" }} aria-label="Delete ad">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
                <span className="flex items-center gap-1"><Eye size={12} />{ad.impressions.toLocaleString()} views</span>
                <span className="flex items-center gap-1"><MousePointerClick size={12} />{ad.clicks} clicks</span>
                <span className="flex items-center gap-1">
                  <BarChart3 size={12} />
                  {ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : "0"}% CTR
                </span>
                <span>{ad.radius_km}km radius</span>
              </div>

              {/* Inline delete confirmation */}
              <AnimatePresence>
                {confirmDeleteId === ad.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                      <p className="text-xs flex-1" style={{ color: "var(--danger)" }}>Delete this campaign?</p>
                      <button onClick={() => setConfirmDeleteId(null)} className="text-xs px-3 py-1.5 rounded-lg border"
                        style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>Cancel</button>
                      <button
                        onClick={() => handleDelete(ad.id)}
                        className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                        style={{ background: "var(--danger)", color: "white" }}
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
