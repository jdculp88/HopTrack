"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, GlassWater, ToggleLeft, ToggleRight, X, Save, Loader2, AlertTriangle, Award } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { BeerStyleBadge } from "@/components/ui/BeerStyleBadge";
import type { BeerStyle } from "@/types/database";

const STYLES: BeerStyle[] = [
  "IPA","Double IPA","Hazy IPA","Session IPA","Pale Ale","Stout","Imperial Stout",
  "Porter","Lager","Pilsner","Sour","Gose","Berliner Weisse","Wheat","Hefeweizen",
  "Belgian","Saison","Amber","Red Ale","Blonde Ale","Cream Ale","Barleywine",
  "Kolsch","Cider","Mead","Other",
];

interface Beer {
  id: string;
  name: string;
  style: string;
  abv: number | null;
  ibu: number | null;
  description: string | null;
  is_on_tap: boolean;
  is_featured: boolean;
  avg_rating: number | null;
  total_checkins: number;
}

interface TapListClientProps {
  breweryId: string;
  initialBeers: Beer[];
}

const emptyBeer = { name: "", style: "IPA" as BeerStyle, abv: "", ibu: "", description: "" };

export function TapListClient({ breweryId, initialBeers }: TapListClientProps) {
  const [beers, setBeers] = useState<Beer[]>(initialBeers);
  const [showForm, setShowForm] = useState(false);
  const [editingBeer, setEditingBeer] = useState<Beer | null>(null);
  const [form, setForm] = useState(emptyBeer);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "on_tap" | "off_tap">("all");
  const [saveError, setSaveError] = useState<string | null>(null);
  const supabase = createClient();
  const { success: toastSuccess } = useToast();

  const filtered = beers.filter(b =>
    filter === "on_tap" ? b.is_on_tap :
    filter === "off_tap" ? !b.is_on_tap : true
  );
  const onTapCount = beers.filter(b => b.is_on_tap).length;

  function openAdd() { setForm(emptyBeer); setEditingBeer(null); setSaveError(null); setShowForm(true); }
  function openEdit(beer: Beer) {
    setForm({ name: beer.name, style: (beer.style as BeerStyle) ?? "IPA", abv: beer.abv?.toString() ?? "", ibu: beer.ibu?.toString() ?? "", description: beer.description ?? "" });
    setEditingBeer(beer);
    setSaveError(null);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    setSaveError(null);

    // When editing, preserve the existing is_on_tap value — never overwrite it.
    // When adding a new beer, default to on tap.
    const payload = {
      brewery_id: breweryId,
      name: form.name.trim(),
      style: form.style,
      abv: form.abv ? parseFloat(form.abv as string) : null,
      ibu: form.ibu ? parseInt(form.ibu as string) : null,
      description: (form.description as string).trim() || null,
      ...(editingBeer ? {} : { is_on_tap: true }),
    };

    if (editingBeer) {
      const { data, error } = await (supabase as any).from("beers").update(payload).eq("id", editingBeer.id).select().single();
      if (error) { setSaveError("Couldn't save changes. Please try again."); setSaving(false); return; }
      if (data) setBeers(prev => prev.map(b => b.id === editingBeer.id ? { ...b, ...data } : b));
    } else {
      const { data, error } = await (supabase as any).from("beers").insert(payload).select().single();
      if (error) { setSaveError("Couldn't add beer. Please try again."); setSaving(false); return; }
      if (data) setBeers(prev => [...prev, data]);
    }

    setSaving(false);
    setShowForm(false);
  }

  async function toggleTap(beer: Beer) {
    const newVal = !beer.is_on_tap;
    setBeers(prev => prev.map(b => b.id === beer.id ? { ...b, is_on_tap: newVal } : b));
    const { error } = await (supabase as any).from("beers").update({ is_on_tap: newVal }).eq("id", beer.id);
    // Roll back optimistic update on failure
    if (error) setBeers(prev => prev.map(b => b.id === beer.id ? { ...b, is_on_tap: beer.is_on_tap } : b));
  }

  async function toggleFeatured(beer: Beer) {
    const wasFeatured = beer.is_featured;
    // Optimistic: clear all featured, set this one (or just clear)
    setBeers(prev => prev.map(b => ({
      ...b,
      is_featured: b.id === beer.id ? !wasFeatured : false,
    })));

    const res = await fetch(`/api/brewery/${breweryId}/featured-beer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ beer_id: wasFeatured ? null : beer.id }),
    });

    if (!res.ok) {
      // Rollback
      setBeers(prev => prev.map(b => ({ ...b, is_featured: b.id === beer.id ? wasFeatured : b.is_featured })));
    } else {
      toastSuccess(wasFeatured ? "Featured beer cleared" : `${beer.name} is now Beer of the Week!`);
    }
  }

  async function handleDelete(beer: Beer) {
    setDeletingId(beer.id);
    setConfirmDeleteId(null);
    await (supabase as any).from("beers").delete().eq("id", beer.id);
    setBeers(prev => prev.filter(b => b.id !== beer.id));
    setDeletingId(null);
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto pt-16 lg:pt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold" style={{ color: "var(--text-primary)" }}>Tap List</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            {onTapCount} on tap · {beers.length} total beers
          </p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
          style={{ background: "var(--accent-gold)", color: "#0F0E0C" }}>
          <Plus size={16} /> Add Beer
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(["all", "on_tap", "off_tap"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", filter === f ? "font-semibold" : "opacity-60 hover:opacity-80")}
            style={filter === f
              ? { background: "var(--accent-gold)", color: "#0F0E0C" }
              : { background: "var(--surface)", color: "var(--text-secondary)", border: "1px solid var(--border)" }
            }>
            {f === "all" ? `All (${beers.length})` : f === "on_tap" ? `On Tap (${onTapCount})` : `Off Tap (${beers.length - onTapCount})`}
          </button>
        ))}
      </div>

      {/* Beer List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map(beer => (
            <motion.div key={beer.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-2xl border transition-all overflow-hidden"
              style={{ background: "var(--surface)", borderColor: confirmDeleteId === beer.id ? "var(--danger)" : "var(--border)", opacity: beer.is_on_tap ? 1 : 0.6 }}>

              <div className="flex items-center gap-4 p-4">
                {/* Tap indicator */}
                <button onClick={() => toggleTap(beer)} className="flex-shrink-0 transition-opacity hover:opacity-70">
                  {beer.is_on_tap
                    ? <ToggleRight size={24} style={{ color: "var(--accent-gold)" }} />
                    : <ToggleLeft size={24} style={{ color: "var(--text-muted)" }} />}
                </button>

                {/* Icon */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                  style={{ background: beer.is_on_tap ? "rgba(212,168,67,0.15)" : "var(--surface-2)" }}>
                  🍺
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-display font-semibold" style={{ color: "var(--text-primary)" }}>{beer.name}</p>
                    {beer.is_featured && <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(212,168,67,0.15)", color: "var(--accent-gold)" }}>Beer of the Week</span>}
                    {!beer.is_on_tap && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>Off tap</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <BeerStyleBadge style={beer.style as BeerStyle} size="xs" />
                    {beer.abv && <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{beer.abv}% ABV</span>}
                    {beer.ibu && <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{beer.ibu} IBU</span>}
                    {beer.avg_rating && <span className="text-xs font-mono" style={{ color: "var(--accent-gold)" }}>★ {beer.avg_rating.toFixed(1)}</span>}
                    {beer.total_checkins > 0 && <span className="text-xs" style={{ color: "var(--text-muted)" }}>{beer.total_checkins} check-ins</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => toggleFeatured(beer)}
                    title={beer.is_featured ? "Remove featured" : "Set as Beer of the Week"}
                    className="p-2 rounded-lg transition-colors hover:opacity-70"
                    style={{ color: beer.is_featured ? "var(--accent-gold)" : "var(--text-muted)" }}>
                    <Award size={15} />
                  </button>
                  <button onClick={() => openEdit(beer)}
                    className="p-2 rounded-lg transition-colors hover:opacity-70"
                    style={{ color: "var(--text-secondary)" }}>
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(confirmDeleteId === beer.id ? null : beer.id)}
                    disabled={deletingId === beer.id}
                    className="p-2 rounded-lg transition-colors hover:opacity-70 disabled:opacity-40"
                    style={{ color: confirmDeleteId === beer.id ? "var(--danger)" : "var(--text-secondary)" }}>
                    {deletingId === beer.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  </button>
                </div>
              </div>

              {/* Inline delete confirmation — no browser dialogs */}
              <AnimatePresence>
                {confirmDeleteId === beer.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-t"
                      style={{ background: "rgba(196,75,58,0.06)", borderColor: "var(--danger)" }}>
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={13} style={{ color: "var(--danger)" }} />
                        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                          Remove <strong style={{ color: "var(--text-primary)" }}>{beer.name}</strong> from your beer list?
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-3 py-1 rounded-lg text-xs font-medium"
                          style={{ color: "var(--text-secondary)", background: "var(--surface-2)" }}>
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(beer)}
                          className="px-3 py-1 rounded-lg text-xs font-semibold"
                          style={{ background: "var(--danger)", color: "#fff" }}>
                          Remove
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-16 rounded-2xl border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <GlassWater size={40} className="mx-auto mb-3 opacity-30" style={{ color: "var(--text-muted)" }} />
            <p className="font-display text-lg" style={{ color: "var(--text-primary)" }}>
              {filter === "on_tap" ? "Nothing on tap right now" : filter === "off_tap" ? "All beers are on tap!" : "No beers yet"}
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              {filter === "all" && "Add your first beer to get started."}
            </p>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)" }}
            onClick={e => e.target === e.currentTarget && setShowForm(false)}>
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="w-full max-w-lg rounded-2xl p-6 border"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}>

              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {editingBeer ? "Edit Beer" : "Add Beer"}
                </h2>
                <button onClick={() => setShowForm(false)} style={{ color: "var(--text-muted)" }}>
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider block mb-1.5" style={{ color: "var(--text-muted)" }}>Beer Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Sunset IPA"
                    className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none"
                    style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-primary)" }} />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase tracking-wider block mb-1.5" style={{ color: "var(--text-muted)" }}>Style</label>
                  <select value={form.style} onChange={e => setForm(f => ({ ...f, style: e.target.value as BeerStyle }))}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none"
                    style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-primary)" }}>
                    {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider block mb-1.5" style={{ color: "var(--text-muted)" }}>ABV %</label>
                    <input type="number" step="0.1" min="0" max="25" value={form.abv} onChange={e => setForm(f => ({ ...f, abv: e.target.value }))}
                      placeholder="5.5"
                      className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none"
                      style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-primary)" }} />
                  </div>
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider block mb-1.5" style={{ color: "var(--text-muted)" }}>IBU</label>
                    <input type="number" min="0" max="200" value={form.ibu} onChange={e => setForm(f => ({ ...f, ibu: e.target.value }))}
                      placeholder="45"
                      className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none"
                      style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-primary)" }} />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase tracking-wider block mb-1.5" style={{ color: "var(--text-muted)" }}>Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Tasting notes, ingredients, what makes it special..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none resize-none"
                    style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-primary)" }} />
                </div>

                {saveError && (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm"
                    style={{ background: "rgba(196,75,58,0.1)", color: "var(--danger)" }}>
                    <AlertTriangle size={14} />
                    {saveError}
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowForm(false)}
                  className="flex-1 py-3 rounded-xl text-sm font-medium border transition-all"
                  style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "transparent" }}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving || !form.name.trim()}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: "var(--accent-gold)", color: "#0F0E0C" }}>
                  {saving ? <><Loader2 size={16} className="animate-spin" />Saving...</> : <><Save size={16} />{editingBeer ? "Save Changes" : "Add Beer"}</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
