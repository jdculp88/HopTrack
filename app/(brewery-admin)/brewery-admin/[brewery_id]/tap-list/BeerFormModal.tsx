"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Save, Loader2, AlertTriangle, Star, Calendar } from "lucide-react";
import { ITEM_TYPE_LABELS } from "@/types/database";
import type { BeerStyle, ItemType } from "@/types/database";
import { GLASS_TYPES, getGlassSvgContent } from "@/lib/glassware";
import { AROMA_NOTES, TASTE_NOTES, FINISH_NOTES } from "@/lib/beer-sensory";
import {
  type Beer,
  type BeerFormData,
  type PourSizeRow,
  STYLES,
  ITEM_TYPES,
  GLASSES_BY_TYPE,
  DEFAULT_GLASS,
  POUR_QUICK_ADD,
  emptyBeer,
  validateNumericFields,
  showStyleField,
  showAbvField,
  showIbuField,
  showSrmField,
  showSensoryNotesFields,
  showSeasonalField,
  showCoverImageField,
} from "./tap-list-types";
import { SensoryNotesPicker } from "@/components/brewery-admin/beer-form/SensoryNotesPicker";
import { SrmPicker } from "@/components/brewery-admin/beer-form/SrmPicker";
import { ImageUpload } from "@/components/ui/ImageUpload";

interface BeerFormModalProps {
  breweryId: string;
  editingBeer: Beer | null;
  initialForm: BeerFormData;
  initialGlassType: string | null;
  initialPourSizes: PourSizeRow[];
  loadingPourSizes: boolean;
  saving: boolean;
  saveError: string | null;
  onSave: (form: BeerFormData, glassType: string | null, pourSizes: PourSizeRow[]) => void;
  onClose: () => void;
}

export function BeerFormModal({
  breweryId,
  editingBeer,
  initialForm,
  initialGlassType,
  initialPourSizes,
  loadingPourSizes,
  saving,
  saveError,
  onSave,
  onClose,
}: BeerFormModalProps) {
  const [form, setForm] = useState<BeerFormData>(initialForm);
  const [glassType, setGlassType] = useState<string | null>(initialGlassType);
  const [pourSizes, setPourSizes] = useState<PourSizeRow[]>(initialPourSizes);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const initialFormRef = useRef(initialForm);

  function isDirty() {
    const f = form;
    const i = initialFormRef.current;
    const arraysEqual = (a: string[], b: string[]) =>
      a.length === b.length && a.every((v, idx) => v === b[idx]);
    return f.name !== i.name || f.style !== i.style || f.abv !== i.abv ||
      f.ibu !== i.ibu || f.description !== i.description || f.price !== i.price ||
      f.itemType !== i.itemType || f.category !== i.category ||
      f.srm !== i.srm ||
      !arraysEqual(f.aromaNotes, i.aromaNotes) ||
      !arraysEqual(f.tasteNotes, i.tasteNotes) ||
      !arraysEqual(f.finishNotes, i.finishNotes) ||
      f.coverImageUrl !== i.coverImageUrl ||
      f.seasonal !== i.seasonal ||
      pourSizes.length > 0;
  }

  function closeForm() {
    if (isDirty()) { setConfirmDiscard(true); return; }
    onClose();
  }

  function forceCloseForm() {
    onClose();
  }

  function handleSave() {
    if (!form.name.trim()) return;
    const errors = validateNumericFields(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    onSave(form, glassType, pourSizes);
  }

  return (
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
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              {editingBeer ? `Edit ${ITEM_TYPE_LABELS[form.itemType] || "Item"}` : `Add ${ITEM_TYPE_LABELS[form.itemType] || "Item"}`}
            </h2>
            {editingBeer?.brand_catalog_beer_id && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)", color: "var(--accent-gold)" }}>
                Catalog Linked
              </span>
            )}
          </div>
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
          {/* Item Type Selector */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider block mb-2" style={{ color: "var(--text-muted)" }}>Item Type</label>
            <div className="flex flex-wrap gap-2">
              {ITEM_TYPES.map(t => {
                const isSelected = form.itemType === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => {
                      setForm(f => ({ ...f, itemType: t.value }));
                      setGlassType(prev => prev && GLASSES_BY_TYPE[t.value]?.includes(prev) ? prev : DEFAULT_GLASS[t.value] ?? null);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all border"
                    style={{
                      background: isSelected ? "rgba(212,168,67,0.12)" : "var(--surface-2)",
                      borderColor: isSelected ? "var(--accent-gold)" : "var(--border)",
                      color: isSelected ? "var(--accent-gold)" : "var(--text-secondary)",
                    }}
                  >
                    <span>{t.emoji}</span> {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider block mb-1.5" style={{ color: "var(--text-muted)" }}>
              {form.itemType === "beer" ? "Beer Name" : ITEM_TYPE_LABELS[form.itemType] + " Name"} *
            </label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder={form.itemType === "beer" ? "e.g. Sunset IPA" : form.itemType === "wine" ? "e.g. Pinot Noir" : form.itemType === "cocktail" ? "e.g. Paloma" : form.itemType === "food" ? "e.g. Bavarian Pretzel" : "e.g. Sparkling Water"}
              className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none"
              style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-primary)" }} />
          </div>

          {/* Category (for non-beer items) */}
          {form.itemType !== "beer" && (
            <div>
              <label className="text-xs font-mono uppercase tracking-wider block mb-1.5" style={{ color: "var(--text-muted)" }}>
                Category <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional &mdash; e.g. &quot;Red Wine&quot;, &quot;Appetizers&quot;)</span>
              </label>
              <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                placeholder={form.itemType === "wine" ? "e.g. Red, White, Ros\u00E9" : form.itemType === "food" ? "e.g. Appetizers, Mains" : ""}
                className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none"
                style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-primary)" }} />
            </div>
          )}

          {/* Style -- only for beer */}
          {showStyleField(form.itemType) && (
            <div>
              <label className="text-xs font-mono uppercase tracking-wider block mb-1.5" style={{ color: "var(--text-muted)" }}>Style</label>
              <select value={form.style} onChange={e => setForm(f => ({ ...f, style: e.target.value as BeerStyle }))}
                className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none"
                style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-primary)" }}>
                {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* ABV */}
            {showAbvField(form.itemType) && (
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
            )}

            {/* IBU -- beer only */}
            {showIbuField(form.itemType) && (
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
            )}

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

          {/* Cover photo (Sprint 177 — write-path fix) */}
          {showCoverImageField(form.itemType) && (
            <div>
              <label className="text-xs font-mono uppercase tracking-wider block mb-1.5" style={{ color: "var(--text-muted)" }}>
                Cover Photo <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(shows on The Board &amp; beer detail)</span>
              </label>
              <ImageUpload
                bucket="beer-photos"
                folder={breweryId}
                currentUrl={form.coverImageUrl || null}
                onUpload={(url) => setForm(f => ({ ...f, coverImageUrl: url }))}
                onRemove={() => setForm(f => ({ ...f, coverImageUrl: "" }))}
                aspect="cover"
                maxSizeMb={10}
                label="Upload cover photo"
              />
            </div>
          )}

          {/* Seasonal toggle (Sprint 177 — write-path fix) */}
          {showSeasonalField(form.itemType) && (
            <div>
              <label className="text-xs font-mono uppercase tracking-wider block mb-1.5" style={{ color: "var(--text-muted)" }}>Release</label>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, seasonal: !f.seasonal }))}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all w-full sm:w-auto"
                style={{
                  background: form.seasonal ? "rgba(212,168,67,0.12)" : "var(--surface-2)",
                  borderColor: form.seasonal ? "var(--accent-gold)" : "var(--border)",
                  color: form.seasonal ? "var(--accent-gold)" : "var(--text-secondary)",
                }}
                aria-pressed={form.seasonal}
              >
                <Calendar size={14} />
                {form.seasonal ? "Seasonal release" : "Year-round"}
              </button>
              <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
                Seasonal items get a {form.seasonal ? "\u2014 " : ""}badge on The Board and appear in consumer seasonal filters.
              </p>
            </div>
          )}

          {/* Sensory section (Sprint 176) */}
          {showSrmField(form.itemType) && (
            <SrmPicker
              value={form.srm}
              onChange={v => {
                setForm(f => ({ ...f, srm: v }));
                const errs = validateNumericFields({ ...form, srm: v });
                setFieldErrors(prev => ({ ...prev, srm: errs.srm ?? "" }));
              }}
              error={fieldErrors.srm || undefined}
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

          {/* Glass Type Picker */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider block mb-2" style={{ color: "var(--text-muted)" }}>
              Glass Type <span style={{ color: "var(--text-muted)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(shows on The Board)</span>
            </label>
            <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))" }}>
              {GLASS_TYPES.filter(g => GLASSES_BY_TYPE[form.itemType]?.includes(g.key)).map(glass => {
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
                    title={`${glass.name} \u2014 ${glass.ozLabel}`}
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

          {/* Pour Sizes */}
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
                        setPourSizes(prev => {
                          // First pour added becomes the default automatically.
                          // Adding "Pint" always promotes it to default so the
                          // Board highlights it (matches Joshua's S176 ask).
                          const isPint = preset.label === "Pint";
                          const shouldBeDefault = prev.length === 0 || isPint;
                          const next: PourSizeRow[] = shouldBeDefault
                            ? prev.map(s => ({ ...s, is_default: false }))
                            : [...prev];
                          next.push({
                            label: preset.label,
                            oz: preset.oz,
                            price: "",
                            display_order: next.length,
                            is_default: shouldBeDefault,
                          });
                          return next;
                        });
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
                onClick={() => setPourSizes(prev => [...prev, {
                  label: "",
                  oz: "",
                  price: "",
                  display_order: prev.length,
                  is_default: prev.length === 0,
                }])}
                className="px-2.5 py-1 rounded-lg text-xs font-mono transition-all"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
              >
                + Custom
              </button>
            </div>

            {/* Size rows */}
            {loadingPourSizes ? (
              <div className="text-xs py-2" style={{ color: "var(--text-muted)" }}>Loading sizes&hellip;</div>
            ) : pourSizes.length > 0 ? (
              <div className="space-y-2">
                <div className="hidden sm:grid gap-1.5 text-xs font-mono uppercase tracking-wider mb-1" style={{ gridTemplateColumns: "32px 1fr 60px 80px 32px", color: "var(--text-muted)" }}>
                  <span title="Highlighted on the Board">Hero</span><span>Label</span><span>oz</span><span>Price $</span><span></span>
                </div>
                {pourSizes.map((size, idx) => (
                  <div key={idx} className="grid gap-1.5 items-center" style={{ gridTemplateColumns: "32px 1fr 60px 80px 32px" }}>
                    <button
                      type="button"
                      aria-label={size.is_default ? "Default pour (highlighted on Board)" : "Set as default pour"}
                      title={size.is_default ? "Default pour \u2014 shows highlighted on the Board" : "Make this the default pour"}
                      onClick={() => setPourSizes(prev => prev.map((s, i) => ({ ...s, is_default: i === idx })))}
                      className="flex items-center justify-center rounded-lg h-9 w-8 transition-all"
                      style={{
                        color: size.is_default ? "var(--accent-gold)" : "var(--text-muted)",
                        background: size.is_default ? "rgba(212,168,67,0.12)" : "var(--surface-2)",
                        border: `1px solid ${size.is_default ? "rgba(212,168,67,0.4)" : "var(--border)"}`,
                      }}
                    >
                      <Star size={14} fill={size.is_default ? "var(--accent-gold)" : "none"} />
                    </button>
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
                      onClick={() => setPourSizes(prev => {
                        const removed = prev[idx];
                        const next = prev.filter((_, i) => i !== idx);
                        // If we deleted the default row, promote the first
                        // surviving row so the beer always has exactly one.
                        if (removed?.is_default && next.length > 0 && !next.some(s => s.is_default)) {
                          next[0] = { ...next[0]!, is_default: true };
                        }
                        return next;
                      })}
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
                No sizes added &mdash; single price above will show on The Board.
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
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-medium border transition-all"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "transparent" }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving || !form.name.trim() || Object.values(fieldErrors).some(Boolean)}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: "var(--accent-gold)", color: "var(--bg)" }}>
            {saving ? <><Loader2 size={16} className="animate-spin" />Saving...</> : <><Save size={16} />{editingBeer ? "Save Changes" : `Add ${ITEM_TYPE_LABELS[form.itemType] || "Item"}`}</>}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
