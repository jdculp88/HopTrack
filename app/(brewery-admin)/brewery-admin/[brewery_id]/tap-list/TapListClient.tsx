"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, GlassWater, ToggleLeft, ToggleRight, X, Save, Loader2, AlertTriangle, Award, Tv, GripVertical, Ban, CheckSquare, Square, ArrowDownAZ, Layers, Code2 } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
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

function validateNumericFields(form: typeof emptyBeer): Record<string, string> {
  const errors: Record<string, string> = {};
  if (form.abv !== "") {
    const v = parseFloat(form.abv as string);
    if (isNaN(v) || v < 0 || v > 100) errors.abv = "ABV must be 0–100%";
  }
  if (form.ibu !== "") {
    const v = parseInt(form.ibu as string);
    if (isNaN(v) || v < 0 || v > 200) errors.ibu = "IBU must be 0–200";
  }
  if (form.price !== "") {
    const v = parseFloat(form.price as string);
    if (isNaN(v) || v < 0 || v > 999) errors.price = "Price must be $0–$999";
  }
  return errors;
}

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
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchSaving, setBatchSaving] = useState(false);
  const [batchDeleteConfirm, setBatchDeleteConfirm] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const initialFormRef = useRef(emptyBeer);
  const supabase = createClient();

  function isDirty() {
    const f = form;
    const i = initialFormRef.current;
    return f.name !== i.name || f.style !== i.style || f.abv !== i.abv ||
      f.ibu !== i.ibu || f.description !== i.description || f.price !== i.price ||
      pourSizes.length > 0;
  }

  function closeForm() {
    if (isDirty()) { setConfirmDiscard(true); return; }
    setShowForm(false);
    setConfirmDiscard(false);
  }

  function forceCloseForm() {
    setShowForm(false);
    setConfirmDiscard(false);
  }
  const { success: toastSuccess } = useToast();

  const filtered = beers.filter(b =>
    filter === "on_tap" ? b.is_on_tap :
    filter === "off_tap" ? !b.is_on_tap : true
  );
  const onTapCount = beers.filter(b => b.is_on_tap).length;

  function openAdd() {
    initialFormRef.current = emptyBeer;
    setForm(emptyBeer);
    setEditingBeer(null);
    setGlassType(null);
    setPourSizes([]);
    setSaveError(null);
    setFieldErrors({});
    setConfirmDiscard(false);
    setShowForm(true);
  }

  async function openEdit(beer: Beer) {
    const f = { name: beer.name, style: (beer.style as BeerStyle) ?? "IPA", abv: beer.abv?.toString() ?? "", ibu: beer.ibu?.toString() ?? "", description: beer.description ?? "", price: beer.price_per_pint?.toString() ?? "" };
    initialFormRef.current = f;
    setForm(f);
    setGlassType(beer.glass_type ?? null);
    setPourSizes([]);
    setEditingBeer(beer);
    setSaveError(null);
    setFieldErrors({});
    setConfirmDiscard(false);
    setShowForm(true);

    // Fetch existing pour sizes
    setLoadingPourSizes(true);
    const { data } = await supabase
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
    const errors = validateNumericFields(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
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
      const { data, error } = await supabase.from("beers").update(payload).eq("id", editingBeer.id).select().single();
      if (error) { setSaveError("Couldn't save changes. Please try again."); setSaving(false); return; }
      if (data) setBeers(prev => prev.map(b => b.id === editingBeer.id ? { ...b, ...data } : b));
      savedBeerId = editingBeer.id;
    } else {
      const { data, error } = await supabase.from("beers").insert(payload).select().single();
      if (error) { setSaveError("Couldn't add beer. Please try again."); setSaving(false); return; }
      if (data) setBeers(prev => [...prev, data]);
      savedBeerId = (data as any).id;
    }

    // Save pour sizes — delete existing, insert new
    const validSizes = pourSizes.filter(s => s.label.trim() && s.price && !isNaN(parseFloat(s.price)));
    await supabase.from("beer_pour_sizes").delete().eq("beer_id", savedBeerId);
    if (validSizes.length > 0) {
      await supabase.from("beer_pour_sizes").insert(
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
    setConfirmDiscard(false);
  }

  async function toggleTap(beer: Beer) {
    const newVal = !beer.is_on_tap;
    setBeers(prev => prev.map(b => b.id === beer.id ? { ...b, is_on_tap: newVal } : b));
    const { error } = await supabase.from("beers").update({ is_on_tap: newVal }).eq("id", beer.id);
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
    const { error } = await supabase.from("beers").update({ is_86d: newVal }).eq("id", beer.id);
    if (error) setBeers(prev => prev.map(b => b.id === beer.id ? { ...b, is_86d: beer.is_86d } : b));
    else toastSuccess(newVal ? `${beer.name} marked as 86'd` : `${beer.name} back in stock`);
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
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
      await supabase.from("beers").update({ display_order: u.display_order }).eq("id", u.id);
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ── Batch Actions ──────────────────────────────────────────────────────────

  function toggleBatchMode() {
    setBatchMode(prev => !prev);
    setSelectedIds(new Set());
  }

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(b => b.id)));
    }
  }

  async function batchMark86(mark: boolean) {
    if (selectedIds.size === 0) return;
    setBatchSaving(true);
    const ids = Array.from(selectedIds);

    // Optimistic update
    setBeers(prev => prev.map(b => ids.includes(b.id) ? { ...b, is_86d: mark } : b));

    await Promise.all(ids.map(id =>
      supabase.from("beers").update({ is_86d: mark }).eq("id", id)
    ));

    toastSuccess(mark ? `${ids.length} beer${ids.length !== 1 ? "s" : ""} marked as 86'd` : `${ids.length} beer${ids.length !== 1 ? "s" : ""} back in stock`);
    setBatchSaving(false);
    setSelectedIds(new Set());
    setBatchMode(false);
  }

  async function batchDelete() {
    if (selectedIds.size === 0) return;
    setBatchSaving(true);
    const ids = Array.from(selectedIds);

    await Promise.all(ids.map(id =>
      supabase.from("beers").delete().eq("id", id)
    ));

    setBeers(prev => prev.filter(b => !ids.includes(b.id)));
    toastSuccess(`${ids.length} beer${ids.length !== 1 ? "s" : ""} removed`);
    setBatchSaving(false);
    setSelectedIds(new Set());
    setBatchMode(false);
    setBatchDeleteConfirm(false);
  }

  function sortByStyle() {
    const sorted = [...beers].sort((a, b) => {
      const styleCmp = a.style.localeCompare(b.style);
      if (styleCmp !== 0) return styleCmp;
      return a.name.localeCompare(b.name);
    });
    setBeers(sorted);
    // Persist new order
    sorted.forEach(async (b, i) => {
      await supabase.from("beers").update({ display_order: i }).eq("id", b.id);
    });
    toastSuccess("Beers sorted by style");
  }

  function sortAlphabetical() {
    const sorted = [...beers].sort((a, b) => a.name.localeCompare(b.name));
    setBeers(sorted);
    sorted.forEach(async (b, i) => {
      await supabase.from("beers").update({ display_order: i }).eq("id", b.id);
    });
    toastSuccess("Beers sorted alphabetically");
  }

  async function handleDelete(beer: Beer) {
    setDeletingId(beer.id);
    setConfirmDeleteId(null);
    await supabase.from("beers").delete().eq("id", beer.id);
    setBeers(prev => prev.filter(b => b.id !== beer.id));
    setDeletingId(null);
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto pt-16 lg:pt-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>Tap List</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            {onTapCount} on tap · {beers.length} total beers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/brewery-admin/${breweryId}/embed`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 border min-h-[44px] no-underline"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--surface)" }}
          >
            <Code2 size={16} /> <span className="hidden sm:inline">Embed</span>
          </a>
          <button
            onClick={() => window.open(`/brewery-admin/${breweryId}/board`, "_blank")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 border min-h-[44px]"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--surface)" }}
          >
            <Tv size={16} /> <span className="hidden sm:inline">The </span>Board
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 min-h-[44px]"
            style={{ background: "var(--accent-gold)", color: "var(--bg)" }}>
            <Plus size={16} /> Add Beer
          </button>
        </div>
      </div>

      {/* Filter tabs + batch controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex gap-2 overflow-x-auto">
          {(["all", "on_tap", "off_tap"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn("px-3 py-2 sm:py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap min-h-[44px] sm:min-h-0", filter === f ? "font-semibold" : "opacity-60 hover:opacity-80")}
              style={filter === f
                ? { background: "var(--accent-gold)", color: "var(--bg)" }
                : { background: "var(--surface)", color: "var(--text-secondary)", border: "1px solid var(--border)" }
              }>
              {f === "all" ? `All (${beers.length})` : f === "on_tap" ? `On Tap (${onTapCount})` : `Off Tap (${beers.length - onTapCount})`}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={sortAlphabetical}
            className="flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-medium transition-all border min-h-[44px] sm:min-h-0 whitespace-nowrap"
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
            title="Sort A-Z"
          >
            <ArrowDownAZ size={14} /> A-Z
          </button>
          <button
            onClick={sortByStyle}
            className="flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-medium transition-all border min-h-[44px] sm:min-h-0 whitespace-nowrap"
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
            title="Group by style"
          >
            <Layers size={14} /> Style
          </button>
          <button
            onClick={toggleBatchMode}
            className={cn("flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-medium transition-all border min-h-[44px] sm:min-h-0 whitespace-nowrap")}
            style={batchMode
              ? { background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)", borderColor: "var(--accent-gold)", color: "var(--accent-gold)" }
              : { background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-secondary)" }
            }
          >
            <CheckSquare size={14} /> Select
          </button>
        </div>
      </div>

      {/* Batch action bar */}
      <AnimatePresence>
        {batchMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="overflow-hidden mb-4"
          >
            <div
              className="flex flex-col gap-3 px-4 py-3 rounded-xl border"
              style={{ background: "color-mix(in srgb, var(--accent-gold) 8%, var(--surface))", borderColor: "color-mix(in srgb, var(--accent-gold) 30%, transparent)" }}
            >
              {/* Top row: select all + count + done */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={selectAll}
                    className="flex items-center gap-2 text-sm font-medium min-h-[44px] sm:min-h-0"
                    style={{ color: "var(--accent-gold)" }}
                  >
                    {selectedIds.size === filtered.length && filtered.length > 0
                      ? <CheckSquare size={18} />
                      : <Square size={18} />}
                    {selectedIds.size === filtered.length && filtered.length > 0 ? "Deselect All" : "Select All"}
                  </button>
                  {selectedIds.size > 0 && (
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: "var(--accent-gold)", color: "var(--bg)" }}>
                      {selectedIds.size} selected
                    </span>
                  )}
                </div>
                <button
                  onClick={toggleBatchMode}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all border min-h-[44px] sm:min-h-0"
                  style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--surface)" }}
                >
                  Done
                </button>
              </div>

              {/* Bottom row: action buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => batchMark86(true)}
                  disabled={selectedIds.size === 0 || batchSaving}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 min-h-[44px] sm:min-h-0"
                  style={{ background: "rgba(196,75,58,0.15)", color: "var(--danger)", border: "1px solid rgba(196,75,58,0.3)" }}
                >
                  {batchSaving ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />}
                  Mark 86&apos;d
                </button>
                <button
                  onClick={() => batchMark86(false)}
                  disabled={selectedIds.size === 0 || batchSaving}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 min-h-[44px] sm:min-h-0"
                  style={{ background: "var(--surface)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
                >
                  {batchSaving ? <Loader2 size={14} className="animate-spin" /> : <ToggleRight size={14} />}
                  Un-86
                </button>
                <button
                  onClick={() => setBatchDeleteConfirm(true)}
                  disabled={selectedIds.size === 0 || batchSaving}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 min-h-[44px] sm:min-h-0"
                  style={{ background: "var(--danger)", color: "#fff" }}
                >
                  {batchSaving ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  Delete
                </button>
              </div>

              {/* Inline delete confirmation */}
              <AnimatePresence>
                {batchDeleteConfirm && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-4 py-3 rounded-xl border"
                      style={{ background: "rgba(196,75,58,0.08)", borderColor: "rgba(196,75,58,0.4)" }}>
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={13} style={{ color: "var(--danger)" }} />
                        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                          Permanently remove <strong style={{ color: "var(--text-primary)" }}>{selectedIds.size} beer{selectedIds.size !== 1 ? "s" : ""}</strong>? This cannot be undone.
                        </span>
                      </div>
                      <div className="flex gap-2 ml-3 flex-shrink-0">
                        <button onClick={() => setBatchDeleteConfirm(false)}
                          className="px-3 py-1 rounded-lg text-xs font-medium"
                          style={{ color: "var(--text-secondary)", background: "var(--surface-2)" }}>
                          Cancel
                        </button>
                        <button onClick={batchDelete}
                          disabled={batchSaving}
                          className="px-3 py-1 rounded-lg text-xs font-semibold disabled:opacity-50"
                          style={{ background: "var(--danger)", color: "#fff" }}>
                          {batchSaving ? <Loader2 size={12} className="animate-spin inline" /> : "Delete All"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Beer List */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <SortableContext items={filtered.map(b => b.id)} strategy={verticalListSortingStrategy}>
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map(beer => (
            <SortableBeerItem
              key={beer.id}
              beer={beer}
              confirmDeleteId={confirmDeleteId}
              deletingId={deletingId}
              batchMode={batchMode}
              isSelected={selectedIds.has(beer.id)}
              activeId={activeId}
              onToggleSelect={() => toggleSelect(beer.id)}
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
              {filter === "on_tap" ? "The taps are dry" : filter === "off_tap" ? "Everything's flowing — nothing off tap!" : "The menu is empty"}
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              {filter === "all" && "Add your first beer and let the pours begin."}
              {filter === "on_tap" && "Toggle a beer on tap to see it here."}
            </p>
          </div>
        )}
      </div>
      </SortableContext>

      {/* Drag overlay — ghost card with gold border when dragging */}
      <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
        {activeId ? (() => {
          const draggedBeer = beers.find(b => b.id === activeId);
          if (!draggedBeer) return null;
          return (
            <div
              className="rounded-2xl border overflow-hidden"
              style={{
                background: "var(--surface)",
                borderColor: "var(--accent-gold)",
                borderWidth: 2,
                boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 0 2px var(--accent-gold)",
                transform: "scale(1.02)",
                transformOrigin: "center",
              }}
            >
              <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4">
                <div className="flex-shrink-0 p-1.5 touch-none flex items-center justify-center" style={{ color: "var(--accent-gold)" }}>
                  <GripVertical size={16} />
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                  style={{ background: draggedBeer.is_86d ? "rgba(196,75,58,0.15)" : draggedBeer.is_on_tap ? "rgba(212,168,67,0.15)" : "var(--surface-2)" }}>
                  {draggedBeer.is_86d ? "❌" : "🍺"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold" style={{ color: "var(--text-primary)" }}>{draggedBeer.name}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{draggedBeer.style}</p>
                </div>
              </div>
            </div>
          );
        })() : null}
      </DragOverlay>
      </DndContext>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)" }}
            onClick={e => e.target === e.currentTarget && closeForm()}>
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
                <button onClick={closeForm} style={{ color: "var(--text-muted)" }}>
                  <X size={20} />
                </button>
              </div>

              {/* Discard confirmation */}
              <AnimatePresence>
                {confirmDiscard && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="overflow-hidden mb-4"
                  >
                    <div className="flex items-center justify-between px-4 py-3 rounded-xl border"
                      style={{ background: "rgba(196,75,58,0.1)", borderColor: "rgba(196,75,58,0.3)" }}>
                      <p className="text-sm font-medium" style={{ color: "#C44B3A" }}>Discard unsaved changes?</p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setConfirmDiscard(false)} className="text-xs px-3 py-1.5 rounded-lg border"
                          style={{ color: "var(--text-secondary)", borderColor: "var(--border)" }}>
                          Keep editing
                        </button>
                        <button onClick={forceCloseForm} className="text-xs px-3 py-1.5 rounded-lg font-medium"
                          style={{ background: "#C44B3A", color: "#fff" }}>
                          Discard
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

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

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider block mb-1.5" style={{ color: "var(--text-muted)" }}>ABV %</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={form.abv}
                      onChange={e => {
                        setForm(f => ({ ...f, abv: e.target.value }));
                        const errs = validateNumericFields({ ...form, abv: e.target.value });
                        setFieldErrors(prev => ({ ...prev, abv: errs.abv ?? "" }));
                      }}
                      placeholder="5.5"
                      className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none"
                      style={{
                        background: "var(--surface-2)",
                        borderColor: fieldErrors.abv ? "var(--danger)" : "var(--border)",
                        color: "var(--text-primary)",
                      }}
                    />
                    {fieldErrors.abv && (
                      <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>{fieldErrors.abv}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider block mb-1.5" style={{ color: "var(--text-muted)" }}>IBU</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="200"
                      value={form.ibu}
                      onChange={e => {
                        setForm(f => ({ ...f, ibu: e.target.value }));
                        const errs = validateNumericFields({ ...form, ibu: e.target.value });
                        setFieldErrors(prev => ({ ...prev, ibu: errs.ibu ?? "" }));
                      }}
                      placeholder="45"
                      className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none"
                      style={{
                        background: "var(--surface-2)",
                        borderColor: fieldErrors.ibu ? "var(--danger)" : "var(--border)",
                        color: "var(--text-primary)",
                      }}
                    />
                    {fieldErrors.ibu && (
                      <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>{fieldErrors.ibu}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider block mb-1.5" style={{ color: "var(--text-muted)" }}>Price $</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="999"
                      value={form.price}
                      onChange={e => {
                        setForm(f => ({ ...f, price: e.target.value }));
                        const errs = validateNumericFields({ ...form, price: e.target.value });
                        setFieldErrors(prev => ({ ...prev, price: errs.price ?? "" }));
                      }}
                      placeholder="7.00"
                      className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none"
                      style={{
                        background: "var(--surface-2)",
                        borderColor: fieldErrors.price ? "var(--danger)" : "var(--border)",
                        color: "var(--text-primary)",
                      }}
                    />
                    {fieldErrors.price && (
                      <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>{fieldErrors.price}</p>
                    )}
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
                      <div className="hidden sm:grid gap-1.5 text-xs font-mono uppercase tracking-wider mb-1" style={{ gridTemplateColumns: "1fr 80px 100px 32px", color: "var(--text-muted)" }}>
                        <span>Label</span><span>oz</span><span>Price $</span><span></span>
                      </div>
                      {pourSizes.map((size, idx) => (
                        <div key={idx} className="grid gap-1.5 items-center" style={{ gridTemplateColumns: "1fr 60px 80px 32px" }}>
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
                <button onClick={handleSave} disabled={saving || !form.name.trim() || Object.values(fieldErrors).some(Boolean)}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: "var(--accent-gold)", color: "var(--bg)" }}>
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
  batchMode: boolean;
  isSelected: boolean;
  activeId: string | null;
  onToggleSelect: () => void;
  onToggleTap: (beer: Beer) => void;
  onToggle86d: (beer: Beer) => void;
  onToggleFeatured: (beer: Beer) => void;
  onEdit: (beer: Beer) => void;
  onConfirmDelete: (id: string) => void;
  onDelete: (beer: Beer) => void;
  onCancelDelete: () => void;
}

function SortableBeerItem({ beer, confirmDeleteId, deletingId, batchMode, isSelected, activeId, onToggleSelect, onToggleTap, onToggle86d, onToggleFeatured, onEdit, onConfirmDelete, onDelete, onCancelDelete }: SortableBeerItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } = useSortable({ id: beer.id });

  const isDragActive = activeId !== null;
  // Show a gold drop-target indicator line above this item when something is being dragged over it (and it's not the item being dragged)
  const showDropIndicator = isOver && activeId !== beer.id;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // The original item becomes a ghost placeholder while DragOverlay renders the visual copy
    opacity: isDragging ? 0 : beer.is_on_tap ? 1 : 0.6,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {/* Drop target indicator */}
      <AnimatePresence>
        {showDropIndicator && (
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ scaleX: 0, opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="h-0.5 rounded-full mb-2"
            style={{ background: "var(--accent-gold)", boxShadow: "0 0 8px var(--accent-gold)" }}
          />
        )}
      </AnimatePresence>

    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-2xl border transition-all overflow-hidden"
      style={{
        borderColor: confirmDeleteId === beer.id ? "var(--danger)" : isDragActive && isOver ? "var(--accent-gold)" : "var(--border)",
        borderWidth: isDragActive && isOver ? 2 : 1,
      }}
    >
      <div
        className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4"
        style={{ background: isSelected ? "color-mix(in srgb, var(--accent-gold) 6%, var(--surface))" : "var(--surface)" }}
      >
        {/* Batch checkbox */}
        {batchMode && (
          <button
            onClick={onToggleSelect}
            className="flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
            style={{ color: isSelected ? "var(--accent-gold)" : "var(--text-muted)" }}
          >
            {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
          </button>
        )}

        {/* Drag handle */}
        {!batchMode && (
          <button {...listeners} className="flex-shrink-0 cursor-grab active:cursor-grabbing p-1.5 touch-none min-w-[44px] min-h-[44px] flex items-center justify-center"
            style={{ color: "var(--text-muted)" }}>
            <GripVertical size={16} />
          </button>
        )}

        {/* Tap indicator */}
        <button onClick={() => onToggleTap(beer)} className="flex-shrink-0 transition-opacity hover:opacity-70 min-w-[44px] min-h-[44px] flex items-center justify-center">
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
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {beer.is_on_tap && (
            <button onClick={() => onToggle86d(beer)}
              title={beer.is_86d ? "Back in stock" : "Mark as 86'd (out of stock)"}
              className="p-2.5 sm:p-2 rounded-lg transition-colors hover:opacity-70 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
              style={{ color: beer.is_86d ? "var(--danger)" : "var(--text-muted)" }}>
              <Ban size={15} />
            </button>
          )}
          <button onClick={() => onToggleFeatured(beer)}
            title={beer.is_featured ? "Remove featured" : "Set as Beer of the Week"}
            className="p-2.5 sm:p-2 rounded-lg transition-colors hover:opacity-70 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 hidden sm:flex items-center justify-center"
            style={{ color: beer.is_featured ? "var(--accent-gold)" : "var(--text-muted)" }}>
            <Award size={15} />
          </button>
          <button onClick={() => onEdit(beer)}
            className="p-2.5 sm:p-2 rounded-lg transition-colors hover:opacity-70 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
            style={{ color: "var(--text-secondary)" }}>
            <Edit2 size={15} />
          </button>
          <button
            onClick={() => onConfirmDelete(beer.id)}
            disabled={deletingId === beer.id}
            className="p-2.5 sm:p-2 rounded-lg transition-colors hover:opacity-70 disabled:opacity-40 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
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
    </div>
  );
}
