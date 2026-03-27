"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, GlassWater, ToggleLeft, ToggleRight, X, Save, Loader2, AlertTriangle, Award, Tv, GripVertical, Ban } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { BeerStyleBadge } from "@/components/ui/BeerStyleBadge";
import type { BeerStyle } from "@/types/database";
import { GLASS_TYPES, getGlassSvgContent } from "@/lib/glassware";

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
  is_86d: boolean;
  display_order: number;
  avg_rating: number | null;
  total_checkins: number;
  price_per_pint: number | null;
  glass_type: string | null;
}

interface PourSizeRow {
  id?: string;
  label: string;
  oz: string;    // string for input binding, "" if none
  price: string; // string for input binding
  display_order: number;
}

const POUR_QUICK_ADD: Array<{ label: string; oz: string }> = [
  { label: "Taster", oz: "5" },
  { label: "Half Pint", oz: "8" },
  { label: "Pint", oz: "16" },
  { label: "22oz Pint", oz: "22" },
  { label: "Growler", oz: "32" },
  { label: "Flight", oz: "" },
];

interface TapListClientProps {
  breweryId: string;
  initialBeers: Beer[];
}

const emptyBeer = { name: "", style: "IPA" as BeerStyle, abv: "", ibu: "", description: "", price: "" };

export function TapListClient({ breweryId, initialBeers }: TapListClientProps) {
  const [beers, setBeers] = useState<Beer[]>(initialBeers);
  const [showForm, setShowForm] = useState(false);
  const [editingBeer, setEditingBeer] = useState<Beer | null>(null);
  const [form, setForm] = useState(emptyBeer);
  const [glassType, setGlassType] = useState<string | null>(null);
  const [pourSizes, setPourSizes] = useState<PourSizeRow[]>([]);
  const [loadingPourSizes, setLoadingPourSizes] = useState(false);
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

  function openAdd() {
    setForm(emptyBeer);
    setEditingBeer(null);
    setGlassType(null);
    setPourSizes([]);
    setSaveError(null);
    setShowForm(true);
  }

  async function openEdit(beer: Beer) {
    setForm({ name: beer.name, style: (beer.style as BeerStyle) ?? "IPA", abv: beer.abv?.toString() ?? "", ibu: beer.ibu?.toString() ?? "", description: beer.description ?? "", price: beer.price_per_pint?.toString() ?? "" });
    setGlassType(beer.glass_type ?? null);
    setPourSizes([]);
    setEditingBeer(beer);
    setSaveError(null);
    setShowForm(true);

    // Fetch existing pour sizes
    setLoadingPourSizes(true);
    const { data } = await (supabase as any)
      .from("beer_pour_sizes")
      .select("*")
      .eq("beer_id", beer.id)
      .order("display_order", { ascending: true });
    if (data) {
      setPourSizes((data as any[]).map((row: any) => ({
        id: row.id,
        label: row.label,
        oz: row.oz != null ? String(row.oz) : "",
        price: String(row.price),
        display_order: row.display_order,
      })));
    }
    setLoadingPourSizes(false);
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
      price_per_pint: form.price ? parseFloat(form.price as string) : null,
      glass_type: glassType ?? null,
      ...(editingBeer ? {} : { is_on_tap: true }),
    };

    let savedBeerId: string;

    if (editingBeer) {
      const { data, error } = await (supabase as any).from("beers").update(payload).eq("id", editingBeer.id).select().single();
      if (error) { setSaveError("Couldn't save changes. Please try again."); setSaving(false); return; }
      if (data) setBeers(prev => prev.map(b => b.id === editingBeer.id ? { ...b, ...data } : b));
      savedBeerId = editingBeer.id;
    } else {
      const { data, error } = await (supabase as any).from("beers").insert(payload).select().single();
      if (error) { setSaveError("Couldn't add beer. Please try again."); setSaving(false); return; }
      if (data) setBeers(prev => [...prev, data]);
      savedBeerId = (data as any).id;
    }

    // Save pour sizes — delete existing, insert new
    const validSizes = pourSizes.filter(s => s.label.trim() && s.price && !isNaN(parseFloat(s.price)));
    await (supabase as any).from("beer_pour_sizes").delete().eq("beer_id", savedBeerId);
    if (validSizes.length > 0) {
      await (supabase as any).from("beer_pour_sizes").insert(
        validSizes.map((s, i) => ({
          beer_id: savedBeerId,
          label: s.label.trim(),
          oz: s.oz ? parseFloat(s.oz) : null,
          price: parseFloat(s.price),
          display_order: i,
        }))
      );
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

  async function toggle86d(beer: Beer) {
    const newVal = !beer.is_86d;
    setBeers(prev => prev.map(b => b.id === beer.id ? { ...b, is_86d: newVal } : b));
    const { error } = await (supabase as any).from("beers").update({ is_86d: newVal }).eq("id", beer.id);
    if (error) setBeers(prev => prev.map(b => b.id === beer.id ? { ...b, is_86d: beer.is_86d } : b));
    else toastSuccess(newVal ? `${beer.name} marked as 86'd` : `${beer.name} back in stock`);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = beers.findIndex(b => b.id === active.id);
    const newIndex = beers.findIndex(b => b.id === over.id);
    const reordered = arrayMove(beers, oldIndex, newIndex);

    // Optimistic update
    setBeers(reordered);

    // Persist new order
    const updates = reordered.map((b, i) => ({ id: b.id, display_order: i }));
    for (const u of updates) {
      await (supabase as any).from("beers").update({ display_order: u.display_order }).eq("id", u.id);
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.open(`/brewery-admin/${breweryId}/board`, "_blank")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 border"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--surface)" }}
          >
            <Tv size={16} /> The Board
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
            style={{ background: "var(--accent-gold)", color: "#0F0E0C" }}>
            <Plus size={16} /> Add Beer
          </button>
        </div>
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
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={filtered.map(b => b.id)} strategy={verticalListSortingStrategy}>
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map(beer => (
            <SortableBeerItem
              key={beer.id}
              beer={beer}
              confirmDeleteId={confirmDeleteId}
              deletingId={deletingId}
              onToggleTap={toggleTap}
              onToggle86d={toggle86d}
              onToggleFeatured={toggleFeatured}
              onEdit={openEdit}
              onConfirmDelete={(id) => setConfirmDeleteId(confirmDeleteId === id ? null : id)}
              onDelete={handleDelete}
              onCancelDelete={() => setConfirmDeleteId(null)}
            />
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
      </SortableContext>
      </DndContext>

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
              className="w-full max-w-2xl rounded-2xl p-6 border max-h-[90vh] overflow-y-auto"
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

                <div className="grid grid-cols-3 gap-3">
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
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider block mb-1.5" style={{ color: "var(--text-muted)" }}>Price $</label>
                    <input type="number" step="0.5" min="0" max="50" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      placeholder="7"
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

                {/* ── Glass Type Picker ─────────────────────────────── */}
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider block mb-2" style={{ color: "var(--text-muted)" }}>
                    Glass Type <span style={{ color: "var(--text-muted)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(shows on The Board)</span>
                  </label>
                  <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))" }}>
                    {GLASS_TYPES.map(glass => {
                      const isSelected = glassType === glass.key;
                      const svgHtml = getGlassSvgContent(glass, `picker-${glass.key}`);
                      return (
                        <button
                          key={glass.key}
                          type="button"
                          onClick={() => setGlassType(isSelected ? null : glass.key)}
                          className="flex flex-col items-center gap-1 p-2 rounded-xl border transition-all"
                          style={{
                            background: isSelected ? "rgba(212,168,67,0.12)" : "var(--surface-2)",
                            borderColor: isSelected ? "var(--accent-gold)" : "var(--border)",
                            cursor: "pointer",
                          }}
                          title={`${glass.name} — ${glass.ozLabel}`}
                        >
                          <svg
                            viewBox="0 0 80 120"
                            width={36}
                            height={54}
                            style={{ display: "block" }}
                            dangerouslySetInnerHTML={{ __html: svgHtml }}
                          />
                          <span className="font-mono text-center leading-tight" style={{
                            fontSize: 8,
                            color: isSelected ? "var(--accent-gold)" : "var(--text-muted)",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            lineHeight: 1.2,
                          }}>
                            {glass.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {glassType && (
                    <button
                      type="button"
                      onClick={() => setGlassType(null)}
                      className="mt-2 text-xs flex items-center gap-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <X size={11} /> Clear glass type
                    </button>
                  )}
                </div>

                {/* ── Pour Sizes ───────────────────────────────────── */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                      Pour Sizes <span style={{ color: "var(--text-muted)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(replaces single price on Board)</span>
                    </label>
                  </div>

                  {/* Quick-add presets */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {POUR_QUICK_ADD.map(preset => {
                      const alreadyAdded = pourSizes.some(s => s.label === preset.label && s.oz === preset.oz);
                      return (
                        <button
                          key={`${preset.label}-${preset.oz}`}
                          type="button"
                          disabled={alreadyAdded}
                          onClick={() => {
                            if (!alreadyAdded) {
                              setPourSizes(prev => [...prev, {
                                label: preset.label,
                                oz: preset.oz,
                                price: "",
                                display_order: prev.length,
                              }]);
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono transition-all"
                          style={{
                            background: alreadyAdded ? "var(--surface-2)" : "rgba(212,168,67,0.1)",
                            border: `1px solid ${alreadyAdded ? "var(--border)" : "rgba(212,168,67,0.3)"}`,
                            color: alreadyAdded ? "var(--text-muted)" : "var(--accent-gold)",
                            cursor: alreadyAdded ? "default" : "pointer",
                            opacity: alreadyAdded ? 0.5 : 1,
                          }}
                        >
                          + {preset.label}{preset.oz ? ` ${preset.oz}oz` : ""}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setPourSizes(prev => [...prev, { label: "", oz: "", price: "", display_order: prev.length }])}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono transition-all"
                      style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                    >
                      + Custom
                    </button>
                  </div>

                  {/* Size rows */}
                  {loadingPourSizes ? (
                    <div className="text-xs py-2" style={{ color: "var(--text-muted)" }}>Loading sizes…</div>
                  ) : pourSizes.length > 0 ? (
                    <div className="space-y-2">
                      <div className="grid gap-1.5 text-xs font-mono uppercase tracking-wider mb-1" style={{ gridTemplateColumns: "1fr 80px 100px 32px", color: "var(--text-muted)" }}>
                        <span>Label</span><span>oz</span><span>Price $</span><span></span>
                      </div>
                      {pourSizes.map((size, idx) => (
                        <div key={idx} className="grid gap-1.5 items-center" style={{ gridTemplateColumns: "1fr 80px 100px 32px" }}>
                          <input
                            value={size.label}
                            onChange={e => setPourSizes(prev => prev.map((s, i) => i === idx ? { ...s, label: e.target.value } : s))}
                            placeholder="Pint"
                            className="px-3 py-2 rounded-lg border text-sm focus:outline-none"
                            style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                          />
                          <input
                            type="number"
                            value={size.oz}
                            onChange={e => setPourSizes(prev => prev.map((s, i) => i === idx ? { ...s, oz: e.target.value } : s))}
                            placeholder="16"
                            min="0"
                            className="px-3 py-2 rounded-lg border text-sm focus:outline-none"
                            style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                          />
                          <input
                            type="number"
                            value={size.price}
                            onChange={e => setPourSizes(prev => prev.map((s, i) => i === idx ? { ...s, price: e.target.value } : s))}
                            placeholder="8.00"
                            min="0"
                            step="0.50"
                            className="px-3 py-2 rounded-lg border text-sm focus:outline-none"
                            style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                          />
                          <button
                            type="button"
                            onClick={() => setPourSizes(prev => prev.filter((_, i) => i !== idx))}
                            className="flex items-center justify-center rounded-lg h-9 w-8 transition-colors"
                            style={{ color: "var(--text-muted)", background: "var(--surface-2)" }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      No sizes added — single price above will show on The Board.
                    </p>
                  )}
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

// ─── Sortable Beer Item ────────────────────────────────────────────────────────

interface SortableBeerItemProps {
  beer: Beer;
  confirmDeleteId: string | null;
  deletingId: string | null;
  onToggleTap: (beer: Beer) => void;
  onToggle86d: (beer: Beer) => void;
  onToggleFeatured: (beer: Beer) => void;
  onEdit: (beer: Beer) => void;
  onConfirmDelete: (id: string) => void;
  onDelete: (beer: Beer) => void;
  onCancelDelete: () => void;
}

function SortableBeerItem({ beer, confirmDeleteId, deletingId, onToggleTap, onToggle86d, onToggleFeatured, onEdit, onConfirmDelete, onDelete, onCancelDelete }: SortableBeerItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: beer.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : beer.is_on_tap ? 1 : 0.6,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <motion.div ref={setNodeRef} style={style}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-2xl border transition-all overflow-hidden"
      {...attributes}
    >
      <div
        className="flex items-center gap-3 p-4"
        style={{ background: "var(--surface)", borderColor: confirmDeleteId === beer.id ? "var(--danger)" : "var(--border)" }}
      >
        {/* Drag handle */}
        <button {...listeners} className="flex-shrink-0 cursor-grab active:cursor-grabbing p-1 touch-none"
          style={{ color: "var(--text-muted)" }}>
          <GripVertical size={16} />
        </button>

        {/* Tap indicator */}
        <button onClick={() => onToggleTap(beer)} className="flex-shrink-0 transition-opacity hover:opacity-70">
          {beer.is_on_tap
            ? <ToggleRight size={24} style={{ color: "var(--accent-gold)" }} />
            : <ToggleLeft size={24} style={{ color: "var(--text-muted)" }} />}
        </button>

        {/* Icon */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
          style={{ background: beer.is_86d ? "rgba(196,75,58,0.15)" : beer.is_on_tap ? "rgba(212,168,67,0.15)" : "var(--surface-2)" }}>
          {beer.is_86d ? "❌" : "🍺"}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={cn("font-display font-semibold", beer.is_86d && "line-through")}
              style={{ color: beer.is_86d ? "var(--text-muted)" : "var(--text-primary)" }}>
              {beer.name}
            </p>
            {beer.is_featured && (
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: "rgba(212,168,67,0.15)", color: "var(--accent-gold)" }}>
                Beer of the Week
              </span>
            )}
            {beer.is_86d && (
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: "rgba(196,75,58,0.15)", color: "var(--danger)" }}>
                86&apos;d
              </span>
            )}
            {!beer.is_on_tap && !beer.is_86d && (
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
                Off tap
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <BeerStyleBadge style={beer.style as BeerStyle} size="xs" />
            {beer.abv && <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{beer.abv}% ABV</span>}
            {beer.ibu && <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{beer.ibu} IBU</span>}
            {beer.price_per_pint != null && <span className="text-xs font-mono" style={{ color: "var(--accent-gold)" }}>${beer.price_per_pint}</span>}
            {beer.avg_rating && <span className="text-xs font-mono" style={{ color: "var(--accent-gold)" }}>★ {beer.avg_rating.toFixed(1)}</span>}
            {beer.total_checkins > 0 && <span className="text-xs" style={{ color: "var(--text-muted)" }}>{beer.total_checkins} pours</span>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {beer.is_on_tap && (
            <button onClick={() => onToggle86d(beer)}
              title={beer.is_86d ? "Back in stock" : "Mark as 86'd (out of stock)"}
              className="p-2 rounded-lg transition-colors hover:opacity-70"
              style={{ color: beer.is_86d ? "var(--danger)" : "var(--text-muted)" }}>
              <Ban size={15} />
            </button>
          )}
          <button onClick={() => onToggleFeatured(beer)}
            title={beer.is_featured ? "Remove featured" : "Set as Beer of the Week"}
            className="p-2 rounded-lg transition-colors hover:opacity-70"
            style={{ color: beer.is_featured ? "var(--accent-gold)" : "var(--text-muted)" }}>
            <Award size={15} />
          </button>
          <button onClick={() => onEdit(beer)}
            className="p-2 rounded-lg transition-colors hover:opacity-70"
            style={{ color: "var(--text-secondary)" }}>
            <Edit2 size={15} />
          </button>
          <button
            onClick={() => onConfirmDelete(beer.id)}
            disabled={deletingId === beer.id}
            className="p-2 rounded-lg transition-colors hover:opacity-70 disabled:opacity-40"
            style={{ color: confirmDeleteId === beer.id ? "var(--danger)" : "var(--text-secondary)" }}>
            {deletingId === beer.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
          </button>
        </div>
      </div>

      {/* Inline delete confirmation */}
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
                <button onClick={onCancelDelete}
                  className="px-3 py-1 rounded-lg text-xs font-medium"
                  style={{ color: "var(--text-secondary)", background: "var(--surface-2)" }}>
                  Cancel
                </button>
                <button onClick={() => onDelete(beer)}
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
  );
}
