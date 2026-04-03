"use client";

import { useState } from "react";
import { Plus, X, Beer, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";

interface OnboardingStepBeersProps {
  breweryId: string;
  onComplete: () => void;
}

const POPULAR_STYLES = [
  "IPA", "Hazy IPA", "Pale Ale", "Lager", "Pilsner", "Stout",
  "Porter", "Wheat", "Sour", "Amber Ale", "Brown Ale", "Saison",
  "Double IPA", "Blonde Ale", "Red Ale", "Kölsch",
];

interface BeerEntry {
  id: string;
  name: string;
  style: string;
  abv: string;
  saved: boolean;
}

export function OnboardingStepBeers({ breweryId, onComplete }: OnboardingStepBeersProps) {
  const [beers, setBeers] = useState<BeerEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const { success, error: showError } = useToast();

  // Inline add form state
  const [name, setName] = useState("");
  const [style, setStyle] = useState("");
  const [abv, setAbv] = useState("");
  const [showStylePicker, setShowStylePicker] = useState(false);

  function addBeer() {
    if (!name.trim()) return;
    const entry: BeerEntry = {
      id: crypto.randomUUID(),
      name: name.trim(),
      style: style || "Other",
      abv: abv || "",
      saved: false,
    };
    setBeers((prev) => [...prev, entry]);
    setName("");
    setStyle("");
    setAbv("");
    setShowStylePicker(false);
  }

  function removeBeer(id: string) {
    setBeers((prev) => prev.filter((b) => b.id !== id));
  }

  async function saveAll() {
    const unsaved = beers.filter((b) => !b.saved);
    if (unsaved.length === 0) return;

    setSaving(true);
    const supabase = createClient();

    const rows = unsaved.map((b) => ({
      brewery_id: breweryId,
      name: b.name,
      style: b.style,
      abv: b.abv ? parseFloat(b.abv) : null,
      is_on_tap: true,
    }));

    const { error } = await supabase.from("beers").insert(rows);

    if (error) {
      showError("Failed to save beers: " + error.message);
    } else {
      setBeers((prev) => prev.map((b) => ({ ...b, saved: true })));
      onComplete();
      success(`${unsaved.length} beer${unsaved.length !== 1 ? "s" : ""} added to your tap list!`);
    }
    setSaving(false);
  }

  const unsavedCount = beers.filter((b) => !b.saved).length;

  return (
    <div className="space-y-4 pb-4">
      <div className="text-center mb-2">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
          style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)" }}
        >
          <Beer size={20} style={{ color: "var(--accent-gold)" }} />
        </div>
        <h3 className="font-display text-lg font-bold" style={{ color: "var(--text-primary)" }}>
          Add your beers
        </h3>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Your tap list is what customers check before they visit. Add what&apos;s on tap now — you can always edit later.
        </p>
      </div>

      {/* Beer list */}
      <div className="space-y-2 max-h-32 overflow-y-auto">
        <AnimatePresence>
          {beers.map((beer) => (
            <motion.div
              key={beer.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border"
              style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
            >
              <span className="text-sm flex-1 truncate" style={{ color: "var(--text-primary)" }}>
                {beer.name}
              </span>
              <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                {beer.style}{beer.abv ? ` · ${beer.abv}%` : ""}
              </span>
              {beer.saved ? (
                <span className="text-xs" style={{ color: "var(--accent-gold)" }}>✓</span>
              ) : (
                <button onClick={() => removeBeer(beer.id)} className="p-0.5" style={{ color: "var(--text-muted)" }}>
                  <X size={14} />
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add beer form */}
      <div className="rounded-xl border p-3 space-y-3" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Beer name"
            className="flex-1 px-3 py-2 rounded-lg text-sm outline-none border"
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-primary)" }}
            onKeyDown={(e) => e.key === "Enter" && addBeer()}
          />
          <input
            type="text"
            value={abv}
            onChange={(e) => setAbv(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="ABV %"
            className="w-20 px-3 py-2 rounded-lg text-sm outline-none border text-center font-mono"
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-primary)" }}
          />
        </div>

        {/* Style picker */}
        <div>
          <button
            onClick={() => setShowStylePicker(!showStylePicker)}
            className="text-xs px-3 py-1.5 rounded-lg border transition-colors"
            style={{
              borderColor: style ? "var(--accent-gold)" : "var(--border)",
              color: style ? "var(--accent-gold)" : "var(--text-muted)",
              background: style ? "color-mix(in srgb, var(--accent-gold) 10%, transparent)" : "transparent",
            }}
          >
            {style || "Pick a style"}
          </button>

          <AnimatePresence>
            {showStylePicker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-1.5 mt-2"
              >
                {POPULAR_STYLES.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setStyle(s); setShowStylePicker(false); }}
                    className="text-xs px-2.5 py-1 rounded-full border transition-all"
                    style={{
                      borderColor: style === s ? "var(--accent-gold)" : "var(--border)",
                      color: style === s ? "var(--accent-gold)" : "var(--text-secondary)",
                      background: style === s ? "color-mix(in srgb, var(--accent-gold) 10%, transparent)" : "transparent",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={addBeer}
          disabled={!name.trim()}
          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
          style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)", color: "var(--accent-gold)" }}
        >
          <Plus size={16} />
          Add Beer
        </button>
      </div>

      {/* Save all button */}
      {unsavedCount > 0 && (
        <button
          onClick={saveAll}
          disabled={saving}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
          style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
        >
          {saving ? (
            <><Loader2 size={16} className="animate-spin" /> Saving...</>
          ) : (
            <>Save {unsavedCount} beer{unsavedCount !== 1 ? "s" : ""} to tap list</>
          )}
        </button>
      )}
    </div>
  );
}
