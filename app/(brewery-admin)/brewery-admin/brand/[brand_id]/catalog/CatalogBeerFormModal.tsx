"use client";

import { useState, useRef } from "react";
import { motion } from "motion/react";
import { X, Save, Loader2 } from "lucide-react";
import type { BeerStyle, ItemType } from "@/types/database";
import { AROMA_NOTES, TASTE_NOTES, FINISH_NOTES } from "@/lib/beer-sensory";
import { SensoryNotesPicker } from "@/components/brewery-admin/beer-form/SensoryNotesPicker";
import { SrmPicker } from "@/components/brewery-admin/beer-form/SrmPicker";
import { SRM_MIN, SRM_MAX } from "@/lib/srm-colors";

const STYLES: BeerStyle[] = [
  "IPA","Double IPA","Hazy IPA","Session IPA","Pale Ale","Stout","Imperial Stout",
  "Porter","Lager","Pilsner","Sour","Gose","Berliner Weisse","Wheat","Hefeweizen",
  "Belgian","Saison","Amber","Red Ale","Blonde Ale","Cream Ale","Barleywine",
  "Kolsch","Cider","Mead","Other",
];

const ITEM_TYPES: { value: ItemType; label: string }[] = [
  { value: "beer", label: "Beer" },
  { value: "cider", label: "Cider" },
  { value: "wine", label: "Wine" },
  { value: "cocktail", label: "Cocktail" },
  { value: "na_beverage", label: "Non-Alcoholic" },
];

function showStyleField(t: ItemType) { return t === "beer"; }
function showAbvField(t: ItemType) { return t !== "food" && t !== "na_beverage"; }
function showIbuField(t: ItemType) { return t === "beer"; }
function showSrmField(t: ItemType) { return t === "beer"; }
function showSensoryNotesFields(t: ItemType) {
  return t === "beer" || t === "cider" || t === "wine" || t === "cocktail";
}

interface CatalogBeerFormModalProps {
  editingBeer: {
    id: string;
    name: string;
    style: string | null;
    abv: number | null;
    ibu: number | null;
    description: string | null;
    itemType: string;
    category: string | null;
    seasonal: boolean;
    // Sprint 176 sensory fields — optional so legacy pages without them
    // still compile (arrays default to [] on load)
    srm?: number | null;
    aromaNotes?: string[] | null;
    tasteNotes?: string[] | null;
    finishNotes?: string[] | null;
  } | null;
  onSave: (form: any) => Promise<boolean>;
  onClose: () => void;
}

interface FormData {
  name: string;
  style: BeerStyle;
  abv: string;
  ibu: string;
  description: string;
  itemType: ItemType;
  category: string;
  seasonal: boolean;
  srm: string;
  aromaNotes: string[];
  tasteNotes: string[];
  finishNotes: string[];
}

export function CatalogBeerFormModal({ editingBeer, onSave, onClose }: CatalogBeerFormModalProps) {
  const [form, setForm] = useState<FormData>({
    name: editingBeer?.name ?? "",
    style: (editingBeer?.style as BeerStyle) ?? "IPA",
    abv: editingBeer?.abv?.toString() ?? "",
    ibu: editingBeer?.ibu?.toString() ?? "",
    description: editingBeer?.description ?? "",
    itemType: (editingBeer?.itemType as ItemType) ?? "beer",
    category: editingBeer?.category ?? "",
    seasonal: editingBeer?.seasonal ?? false,
    srm: editingBeer?.srm != null ? String(editingBeer.srm) : "",
    aromaNotes:  editingBeer?.aromaNotes  ?? [],
    tasteNotes:  editingBeer?.tasteNotes  ?? [],
    finishNotes: editingBeer?.finishNotes ?? [],
  });
  const [saving, setSaving] = useState(false);
  const [srmError, setSrmError] = useState<string | undefined>();
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const initialRef = useRef(form);

  function isDirty() {
    const i = initialRef.current;
    const arraysEqual = (a: string[], b: string[]) =>
      a.length === b.length && a.every((v, idx) => v === b[idx]);
    return form.name !== i.name || form.style !== i.style || form.abv !== i.abv ||
      form.ibu !== i.ibu || form.description !== i.description ||
      form.itemType !== i.itemType || form.category !== i.category ||
      form.seasonal !== i.seasonal || form.srm !== i.srm ||
      !arraysEqual(form.aromaNotes,  i.aromaNotes) ||
      !arraysEqual(form.tasteNotes,  i.tasteNotes) ||
      !arraysEqual(form.finishNotes, i.finishNotes);
  }

  function closeForm() {
    if (isDirty()) { setConfirmDiscard(true); return; }
    onClose();
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    // Validate SRM before sending so we surface errors immediately rather
    // than waiting on a 400 from the server
    if (form.srm !== "") {
      const srmValue = parseInt(form.srm, 10);
      if (Number.isNaN(srmValue) || srmValue < SRM_MIN || srmValue > SRM_MAX) {
        setSrmError(`SRM must be ${SRM_MIN}\u2013${SRM_MAX}`);
        return;
      }
    }
    setSrmError(undefined);
    setSaving(true);

    const payload: any = {
      name: form.name.trim(),
      style: showStyleField(form.itemType) ? form.style : null,
      abv: showAbvField(form.itemType) && form.abv ? form.abv : null,
      ibu: showIbuField(form.itemType) && form.ibu ? form.ibu : null,
      description: form.description.trim() || null,
      itemType: form.itemType,
      category: form.category.trim() || null,
      seasonal: form.seasonal,
      srm: showSrmField(form.itemType) && form.srm ? form.srm : null,
      aromaNotes:  showSensoryNotesFields(form.itemType) ? form.aromaNotes  : [],
      tasteNotes:  showSensoryNotesFields(form.itemType) ? form.tasteNotes  : [],
      finishNotes: showSensoryNotesFields(form.itemType) ? form.finishNotes : [],
    };

    // When editing, include propagate toggle
    if (editingBeer) {
      payload.propagate = true;
    }

    const ok = await onSave(payload);
    setSaving(false);
    if (!ok) return; // error handled by parent
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={closeForm}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg rounded-2xl border max-h-[90vh] overflow-y-auto"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="font-display text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            {editingBeer ? "Edit Catalog Beer" : "Add to Catalog"}
          </h2>
          <button onClick={closeForm} className="p-1.5 rounded-lg transition-opacity hover:opacity-70">
            <X size={18} style={{ color: "var(--text-muted)" }} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Note about catalog vs. location */}
          <p className="text-xs rounded-xl p-3 border" style={{ background: "color-mix(in srgb, var(--accent-gold) 6%, transparent)", borderColor: "color-mix(in srgb, var(--accent-gold) 20%, transparent)", color: "var(--text-secondary)" }}>
            Catalog entries define the beer itself (name, style, ABV). Pricing and tap status are managed per-location.
            {editingBeer && " Changes will be synced to all locations."}
          </p>

          {/* Item Type */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider mb-1.5 block" style={{ color: "var(--text-muted)" }}>
              Type
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ITEM_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setForm(f => ({ ...f, itemType: t.value }))}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                  style={{
                    background: form.itemType === t.value ? "var(--accent-gold)" : "transparent",
                    color: form.itemType === t.value ? "#0F0E0C" : "var(--text-muted)",
                    borderColor: form.itemType === t.value ? "var(--accent-gold)" : "var(--border)",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider mb-1.5 block" style={{ color: "var(--text-muted)" }}>
              Name *
            </label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Haze Highway IPA"
              className="w-full px-3 py-2.5 rounded-xl text-sm border bg-transparent outline-none"
              style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
            />
          </div>

          {/* Style */}
          {showStyleField(form.itemType) && (
            <div>
              <label className="text-xs font-mono uppercase tracking-wider mb-1.5 block" style={{ color: "var(--text-muted)" }}>
                Style
              </label>
              <select
                value={form.style}
                onChange={e => setForm(f => ({ ...f, style: e.target.value as BeerStyle }))}
                className="w-full px-3 py-2.5 rounded-xl text-sm border bg-transparent outline-none"
                style={{ borderColor: "var(--border)", color: "var(--text-primary)", background: "var(--surface)" }}
              >
                {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          {/* ABV + IBU row */}
          <div className="flex gap-3">
            {showAbvField(form.itemType) && (
              <div className="flex-1">
                <label className="text-xs font-mono uppercase tracking-wider mb-1.5 block" style={{ color: "var(--text-muted)" }}>
                  ABV %
                </label>
                <input
                  value={form.abv}
                  onChange={e => setForm(f => ({ ...f, abv: e.target.value }))}
                  placeholder="e.g. 6.5"
                  type="text"
                  inputMode="decimal"
                  className="w-full px-3 py-2.5 rounded-xl text-sm border bg-transparent outline-none"
                  style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
                />
              </div>
            )}
            {showIbuField(form.itemType) && (
              <div className="flex-1">
                <label className="text-xs font-mono uppercase tracking-wider mb-1.5 block" style={{ color: "var(--text-muted)" }}>
                  IBU
                </label>
                <input
                  value={form.ibu}
                  onChange={e => setForm(f => ({ ...f, ibu: e.target.value }))}
                  placeholder="e.g. 65"
                  type="text"
                  inputMode="numeric"
                  className="w-full px-3 py-2.5 rounded-xl text-sm border bg-transparent outline-none"
                  style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
                />
              </div>
            )}
          </div>

          {/* Category (for non-beer) */}
          {form.itemType !== "beer" && (
            <div>
              <label className="text-xs font-mono uppercase tracking-wider mb-1.5 block" style={{ color: "var(--text-muted)" }}>
                Category
              </label>
              <input
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                placeholder={form.itemType === "wine" ? "e.g. Red Wine" : "e.g. Dry Cider"}
                className="w-full px-3 py-2.5 rounded-xl text-sm border bg-transparent outline-none"
                style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider mb-1.5 block" style={{ color: "var(--text-muted)" }}>
              Description
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Tasting notes, ingredients, story..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl text-sm border bg-transparent outline-none resize-none"
              style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
            />
          </div>

          {/* Sensory section (Sprint 176) */}
          {showSrmField(form.itemType) && (
            <SrmPicker
              value={form.srm}
              onChange={v => {
                setForm(f => ({ ...f, srm: v }));
                setSrmError(undefined);
              }}
              error={srmError}
            />
          )}

          {showSensoryNotesFields(form.itemType) && (
            <div className="space-y-3">
              <SensoryNotesPicker
                label="Aroma"
                value={form.aromaNotes}
                onChange={next => setForm(f => ({ ...f, aromaNotes: next }))}
                options={AROMA_NOTES}
                placeholder="e.g. Citrus, Pine, Mango..."
              />
              <SensoryNotesPicker
                label="Taste"
                value={form.tasteNotes}
                onChange={next => setForm(f => ({ ...f, tasteNotes: next }))}
                options={TASTE_NOTES}
                placeholder="e.g. Juicy, Bitter, Creamy..."
              />
              <SensoryNotesPicker
                label="Finish"
                value={form.finishNotes}
                onChange={next => setForm(f => ({ ...f, finishNotes: next }))}
                options={FINISH_NOTES}
                placeholder="e.g. Dry, Crisp, Lingering Bitter..."
              />
            </div>
          )}

          {/* Seasonal toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setForm(f => ({ ...f, seasonal: !f.seasonal }))}
              className="w-10 h-6 rounded-full transition-colors relative"
              role="switch"
              aria-checked={form.seasonal}
              style={{ background: form.seasonal ? "var(--accent-gold)" : "var(--surface-2)" }}
            >
              <div
                className="w-4 h-4 rounded-full absolute top-1 transition-all"
                style={{
                  background: form.seasonal ? "#0F0E0C" : "var(--text-muted)",
                  left: form.seasonal ? "calc(100% - 20px)" : "4px",
                }}
              />
            </button>
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Seasonal beer</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center gap-3" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={closeForm}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-opacity hover:opacity-80"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!form.name.trim() || saving}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: "var(--accent-gold)", color: "#0F0E0C" }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Saving..." : editingBeer ? "Update & Sync" : "Add to Catalog"}
          </button>
        </div>

        {/* Discard confirmation */}
        {confirmDiscard && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
            <div className="rounded-xl border p-4 space-y-3 max-w-xs"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Discard changes?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDiscard(false)}
                  className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold border"
                  style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                >
                  Keep Editing
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-3 py-2 rounded-xl text-xs font-bold"
                  style={{ background: "var(--danger)", color: "#fff" }}
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
