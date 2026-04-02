"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Search, Check, Package, Loader2 } from "lucide-react";
import { ITEM_TYPE_EMOJI } from "@/types/database";

interface CatalogBeer {
  id: string;
  name: string;
  style: string | null;
  abv: number | null;
  itemType: string;
  locations: Array<{ locationId: string }>;
}

interface CatalogPickerModalProps {
  brandId: string;
  breweryId: string;
  existingBeerNames: string[];
  onClose: () => void;
  onAdded: () => void;
}

export function CatalogPickerModal({ brandId, breweryId, existingBeerNames, onClose, onAdded }: CatalogPickerModalProps) {
  const [catalog, setCatalog] = useState<CatalogBeer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchCatalog();
  }, [brandId]);

  async function fetchCatalog() {
    setLoading(true);
    try {
      const res = await fetch(`/api/brand/${brandId}/catalog`);
      if (res.ok) {
        const json = await res.json();
        setCatalog(json.data.catalog ?? []);
      }
    } catch { /* keep loading */ }
    setLoading(false);
  }

  // Filter out beers already at this location
  const existingLower = new Set(existingBeerNames.map(n => n.toLowerCase().trim()));
  const available = catalog.filter(c => {
    // Exclude if already at this location (linked or same name)
    const alreadyHere = c.locations.some(l => l.locationId === breweryId) ||
      existingLower.has(c.name.toLowerCase().trim());
    return !alreadyHere;
  });

  const filtered = search.trim()
    ? available.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase().trim()) ||
        (c.style?.toLowerCase().includes(search.toLowerCase().trim()))
      )
    : available;

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function handleAdd() {
    if (selected.size === 0) return;
    setAdding(true);

    // Add each selected catalog beer to this location
    let totalCreated = 0;
    let totalLinked = 0;

    for (const catalogBeerId of Array.from(selected)) {
      try {
        const res = await fetch(`/api/brand/${brandId}/catalog/${catalogBeerId}/add-to-locations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locationIds: [breweryId] }),
        });
        if (res.ok) {
          const json = await res.json();
          totalCreated += json.data.created ?? 0;
          totalLinked += json.data.linked ?? 0;
        }
      } catch { /* continue */ }
    }

    setAdding(false);
    onAdded();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg rounded-2xl border max-h-[80vh] flex flex-col"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: "var(--border)" }}>
          <div>
            <h2 className="font-display text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              Add from Catalog
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Select beers from your brand catalog to add to this location
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-opacity hover:opacity-70">
            <X size={18} style={{ color: "var(--text-muted)" }} />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b shrink-0" style={{ borderColor: "var(--border)" }}>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search catalog..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-sm border bg-transparent outline-none"
              style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
            />
          </div>
        </div>

        {/* Beer list */}
        <div className="flex-1 overflow-y-auto px-6 py-3 space-y-1.5">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-pulse flex flex-col items-center gap-2">
                <Package size={24} style={{ color: "var(--text-muted)" }} />
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Loading catalog...</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-2">
              <Package size={24} style={{ color: "var(--text-muted)" }} />
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {available.length === 0 ? "All catalog beers are already at this location" : "No beers match your search"}
              </p>
            </div>
          ) : (
            filtered.map(beer => {
              const isSelected = selected.has(beer.id);
              const emoji = ITEM_TYPE_EMOJI[beer.itemType as keyof typeof ITEM_TYPE_EMOJI] ?? "\u{1F37A}";
              return (
                <button
                  key={beer.id}
                  onClick={() => toggleSelect(beer.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all"
                  style={{
                    borderColor: isSelected ? "var(--accent-gold)" : "var(--border)",
                    background: isSelected ? "color-mix(in srgb, var(--accent-gold) 8%, transparent)" : "transparent",
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 border"
                    style={{
                      borderColor: isSelected ? "var(--accent-gold)" : "var(--border)",
                      background: isSelected ? "var(--accent-gold)" : "transparent",
                    }}
                  >
                    {isSelected && <Check size={12} color="#0F0E0C" />}
                  </div>
                  <span className="text-base flex-shrink-0">{emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{beer.name}</p>
                    <div className="flex items-center gap-2">
                      {beer.style && <span className="text-xs" style={{ color: "var(--text-muted)" }}>{beer.style}</span>}
                      {beer.abv != null && <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{beer.abv}%</span>}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center gap-3 shrink-0" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-opacity hover:opacity-80"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={selected.size === 0 || adding}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: "var(--accent-gold)", color: "#0F0E0C" }}
          >
            {adding ? <Loader2 size={14} className="animate-spin" /> : <Package size={14} />}
            {adding ? "Adding..." : `Add ${selected.size || ""} Beer${selected.size !== 1 ? "s" : ""}`}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
