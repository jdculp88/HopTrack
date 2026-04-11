"use client";

import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { GlassWater, GripVertical } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { ITEM_TYPE_EMOJI } from "@/types/database";
import type { BeerStyle } from "@/types/database";

import { type Beer, type BeerFormData, type PourSizeRow, emptyBeer, showStyleField, showAbvField, showIbuField, DEFAULT_GLASS } from "./tap-list-types";
import { TapListHeader } from "./TapListHeader";
import { TapListFilters, type FilterValue } from "./TapListFilters";
import { BatchActionBar } from "./BatchActionBar";
import { SortableBeerItem } from "./SortableBeerItem";
import { BeerFormModal } from "./BeerFormModal";
import { CatalogPickerModal } from "./CatalogPickerModal";

interface TapListClientProps {
  breweryId: string;
  initialBeers: Beer[];
  brandId?: string | null;
}

export function TapListClient({ breweryId, initialBeers, brandId }: TapListClientProps) {
  const [beers, setBeers] = useState<Beer[]>(initialBeers);
  const [showForm, setShowForm] = useState(false);
  const [editingBeer, setEditingBeer] = useState<Beer | null>(null);
  const [formInitial, setFormInitial] = useState(emptyBeer);
  const [formGlassType, setFormGlassType] = useState<string | null>(null);
  const [formPourSizes, setFormPourSizes] = useState<PourSizeRow[]>([]);
  const [loadingPourSizes, setLoadingPourSizes] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchSaving, setBatchSaving] = useState(false);
  const [batchDeleteConfirm, setBatchDeleteConfirm] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showCatalogPicker, setShowCatalogPicker] = useState(false);
  const supabase = createClient();
  const { success: toastSuccess, error: toastError } = useToast();

  const filtered = beers.filter(b =>
    filter === "on_tap" ? b.is_on_tap :
    filter === "off_tap" ? !b.is_on_tap : true
  );
  const onTapCount = beers.filter(b => b.is_on_tap).length;

  // ── Form open/close ──────────────────────────────────────────────────────────

  function openAdd() {
    setFormInitial(emptyBeer);
    setEditingBeer(null);
    setFormGlassType(null);
    setFormPourSizes([]);
    setSaveError(null);
    setShowForm(true);
  }

  async function openEdit(beer: Beer) {
    const f: BeerFormData = {
      name: beer.name,
      style: (beer.style as BeerStyle) ?? "IPA",
      abv: beer.abv?.toString() ?? "",
      ibu: beer.ibu?.toString() ?? "",
      description: beer.description ?? "",
      price: beer.price_per_pint?.toString() ?? "",
      itemType: beer.item_type ?? "beer",
      category: beer.category ?? "",
      srm: beer.srm != null ? String(beer.srm) : "",
      aromaNotes: beer.aroma_notes ?? [],
      tasteNotes: beer.taste_notes ?? [],
      finishNotes: beer.finish_notes ?? [],
    };
    setFormInitial(f);
    setFormGlassType(beer.glass_type ?? null);
    setFormPourSizes([]);
    setEditingBeer(beer);
    setSaveError(null);
    setShowForm(true);

    // Fetch existing pour sizes
    setLoadingPourSizes(true);
    const { data } = await supabase
      .from("beer_pour_sizes")
      .select("*")
      .eq("beer_id", beer.id)
      .order("display_order", { ascending: true });
    if (data) {
      setFormPourSizes((data as any[]).map((row: any) => ({
        id: row.id,
        label: row.label,
        oz: row.oz != null ? String(row.oz) : "",
        price: String(row.price),
        display_order: row.display_order,
        is_default: !!row.is_default,
      })));
    }
    setLoadingPourSizes(false);
  }

  async function handleSave(form: BeerFormData, glassType: string | null, pourSizes: PourSizeRow[]) {
    setSaving(true);
    setSaveError(null);

    const itemType = form.itemType;
    const payload = {
      brewery_id: breweryId,
      name: form.name.trim(),
      style: showStyleField(itemType) ? form.style : null,
      abv: showAbvField(itemType) && form.abv ? parseFloat(form.abv) : null,
      ibu: showIbuField(itemType) && form.ibu ? parseInt(form.ibu) : null,
      description: form.description.trim() || null,
      price_per_pint: form.price ? parseFloat(form.price) : null,
      glass_type: glassType ?? DEFAULT_GLASS[itemType] ?? null,
      item_type: itemType,
      category: form.category.trim() || null,
      // Sensory fields (Sprint 176). Only persist SRM for beer; notes clear
      // out for item types that don't surface the picker so toggling to
      // non-beer doesn't leak stale data.
      srm: itemType === "beer" && form.srm ? parseInt(form.srm) : null,
      aroma_notes:  itemType !== "na_beverage" ? form.aromaNotes  : [],
      taste_notes:  itemType !== "na_beverage" ? form.tasteNotes  : [],
      finish_notes: itemType !== "na_beverage" ? form.finishNotes : [],
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

    // Save pour sizes -- delete existing, insert new. We enforce exactly one
    // default row per beer at the DB level (migration 111 partial unique
    // index), so guarantee exactly one is flagged before insert: honor the
    // user's choice when present, otherwise default to the first row.
    const validSizes = pourSizes.filter(s => s.label.trim() && s.price && !isNaN(parseFloat(s.price)));
    const { error: pourDeleteError } = await supabase.from("beer_pour_sizes").delete().eq("beer_id", savedBeerId);
    if (pourDeleteError) { toastError("Failed to update pour sizes"); setSaving(false); return; }
    if (validSizes.length > 0) {
      const hasDefault = validSizes.some(s => s.is_default);
      const rowsToInsert = validSizes.map((s, i) => ({
        beer_id: savedBeerId,
        label: s.label.trim(),
        oz: s.oz ? parseFloat(s.oz) : null,
        price: parseFloat(s.price),
        display_order: i,
        is_default: hasDefault ? !!s.is_default : i === 0,
      }));
      const { error: pourInsertError } = await supabase.from("beer_pour_sizes").insert(rowsToInsert);
      if (pourInsertError) { toastError("Failed to save pour sizes"); setSaving(false); return; }
    }

    setSaving(false);
    setShowForm(false);
  }

  // ── Single item actions ──────────────────────────────────────────────────────

  async function toggleTap(beer: Beer) {
    const newVal = !beer.is_on_tap;
    setBeers(prev => prev.map(b => b.id === beer.id ? { ...b, is_on_tap: newVal } : b));
    const { error } = await supabase.from("beers").update({ is_on_tap: newVal }).eq("id", beer.id);
    if (error) setBeers(prev => prev.map(b => b.id === beer.id ? { ...b, is_on_tap: beer.is_on_tap } : b));
  }

  async function toggleFeatured(beer: Beer) {
    const wasFeatured = beer.is_featured;
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

  async function handleDelete(beer: Beer) {
    setDeletingId(beer.id);
    setConfirmDeleteId(null);
    const { error } = await supabase.from("beers").delete().eq("id", beer.id);
    if (error) {
      toastError(`Failed to delete ${beer.name}`);
    } else {
      setBeers(prev => prev.filter(b => b.id !== beer.id));
    }
    setDeletingId(null);
  }

  // ── Drag & drop ──────────────────────────────────────────────────────────────

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
    const previous = [...beers];
    setBeers(reordered);

    const results = await Promise.all(
      reordered.map((b, i) =>
        supabase.from("beers").update({ display_order: i }).eq("id", b.id)
      )
    );
    if (results.some(r => r.error)) {
      setBeers(previous);
      toastError("Failed to save new order. Reverted.");
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ── Batch actions ────────────────────────────────────────────────────────────

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
    const previous = [...beers];
    setBeers(prev => prev.filter(b => !ids.includes(b.id)));
    const results = await Promise.all(ids.map(id =>
      supabase.from("beers").delete().eq("id", id)
    ));
    const failed = results.filter(r => r.error);
    if (failed.length > 0) {
      setBeers(previous);
      toastError(`Failed to delete ${failed.length} beer${failed.length !== 1 ? "s" : ""}. Reverted.`);
    } else {
      toastSuccess(`${ids.length} beer${ids.length !== 1 ? "s" : ""} removed`);
    }
    setBatchSaving(false);
    setSelectedIds(new Set());
    setBatchMode(false);
    setBatchDeleteConfirm(false);
  }

  async function persistSort(compareFn: (a: Beer, b: Beer) => number, label: string) {
    const sorted = [...beers].sort(compareFn);
    const previous = [...beers];
    setBeers(sorted);
    const results = await Promise.all(
      sorted.map((b, i) => supabase.from("beers").update({ display_order: i }).eq("id", b.id))
    );
    if (results.some(r => r.error)) {
      setBeers(previous);
      toastError("Failed to save sort order. Reverted.");
    } else {
      toastSuccess(label);
    }
  }

  function sortAlphabetical() {
    persistSort((a, b) => a.name.localeCompare(b.name), "Beers sorted alphabetically");
  }

  function sortByStyle() {
    persistSort((a, b) => a.style.localeCompare(b.style) || a.name.localeCompare(b.name), "Beers sorted by style");
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  const draggedBeer = activeId ? beers.find(b => b.id === activeId) : null;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto pt-16 lg:pt-8">
      <TapListHeader
        breweryId={breweryId}
        onTapCount={onTapCount}
        totalCount={beers.length}
        onAdd={openAdd}
        brandId={brandId}
        onAddFromCatalog={brandId ? () => setShowCatalogPicker(true) : undefined}
      />

      <TapListFilters
        filter={filter}
        onFilterChange={setFilter}
        totalCount={beers.length}
        onTapCount={onTapCount}
        batchMode={batchMode}
        onSortAlphabetical={sortAlphabetical}
        onSortByStyle={sortByStyle}
        onToggleBatchMode={toggleBatchMode}
      />

      {/* Batch action bar */}
      <AnimatePresence>
        {batchMode && (
          <BatchActionBar
            selectedCount={selectedIds.size}
            filteredCount={filtered.length}
            batchSaving={batchSaving}
            batchDeleteConfirm={batchDeleteConfirm}
            onSelectAll={selectAll}
            onDone={toggleBatchMode}
            onMark86={batchMark86}
            onDeleteRequest={() => setBatchDeleteConfirm(true)}
            onDeleteConfirm={batchDelete}
            onDeleteCancel={() => setBatchDeleteConfirm(false)}
          />
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
              {filter === "on_tap" ? "The taps are dry" : filter === "off_tap" ? "Everything's flowing \u2014 nothing off tap!" : "The menu is empty"}
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              {filter === "all" && "Add your first item and let the pours begin."}
              {filter === "on_tap" && "Toggle a beer on tap to see it here."}
            </p>
          </div>
        )}
      </div>
      </SortableContext>

      {/* Drag overlay */}
      <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
        {draggedBeer ? (
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
                {draggedBeer.is_86d ? "\u274C" : (ITEM_TYPE_EMOJI[draggedBeer.item_type] ?? "\u{1F37A}")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold" style={{ color: "var(--text-primary)" }}>{draggedBeer.name}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{draggedBeer.style}</p>
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
      </DndContext>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <BeerFormModal
            editingBeer={editingBeer}
            initialForm={formInitial}
            initialGlassType={formGlassType}
            initialPourSizes={formPourSizes}
            loadingPourSizes={loadingPourSizes}
            saving={saving}
            saveError={saveError}
            onSave={handleSave}
            onClose={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>

      {/* Catalog Picker Modal */}
      <AnimatePresence>
        {showCatalogPicker && brandId && (
          <CatalogPickerModal
            brandId={brandId}
            breweryId={breweryId}
            existingBeerNames={beers.map(b => b.name)}
            onClose={() => setShowCatalogPicker(false)}
            onAdded={async () => {
              setShowCatalogPicker(false);
              // Refetch beers from server
              const { data } = await supabase
                .from("beers").select("*")
                .eq("brewery_id", breweryId)
                .order("display_order", { ascending: true })
                .order("name") as any;
              if (data) setBeers(data);
              toastSuccess("Beers added from catalog");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
