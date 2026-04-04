"use client";

import { useState } from "react";
import { MapPin, Search, Plus, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useToast } from "@/components/ui/Toast";

interface BrandOnboardingStepLocationsProps {
  brandId: string;
  onComplete: () => void;
}

interface BreweryResult {
  id: string;
  name: string;
  city: string;
  state: string;
}

export function BrandOnboardingStepLocations({ brandId, onComplete }: BrandOnboardingStepLocationsProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BreweryResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [addedLocations, setAddedLocations] = useState<BreweryResult[]>([]);
  const { success, error: showError } = useToast();

  async function handleSearch(q: string) {
    setQuery(q);
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}&limit=8`);
      if (res.ok) {
        const data = await res.json();
        // Filter out already-added locations
        const addedIds = new Set(addedLocations.map((l) => l.id));
        setResults(
          (data.breweries ?? []).filter((b: BreweryResult) => !addedIds.has(b.id))
        );
      }
    } catch {
      // Silently fail search — user can retry
    }
    setSearching(false);
  }

  async function addLocation(brewery: BreweryResult) {
    setAdding(brewery.id);
    try {
      const res = await fetch(`/api/brand/${brandId}/locations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brewery_id: brewery.id }),
      });

      if (res.ok) {
        setAddedLocations((prev) => [...prev, brewery]);
        setResults((prev) => prev.filter((b) => b.id !== brewery.id));
        success(`${brewery.name} added!`);
        onComplete();
      } else {
        const data = await res.json();
        showError(data.error || "Failed to add location");
      }
    } catch {
      showError("Failed to add location");
    }
    setAdding(null);
  }

  function removeFromAdded(id: string) {
    setAddedLocations((prev) => prev.filter((l) => l.id !== id));
  }

  return (
    <div className="space-y-4 pb-4">
      <div className="text-center mb-2">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
          style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)" }}
        >
          <MapPin size={20} style={{ color: "var(--accent-gold)" }} />
        </div>
        <h3 className="font-display text-lg font-bold" style={{ color: "var(--text-primary)" }}>
          Add your locations
        </h3>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          A brand needs multiple locations to unlock cross-location loyalty, shared tap lists, and unified analytics.
        </p>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search breweries by name or city..."
          className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none border"
          style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-primary)" }}
        />
        {searching && (
          <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin" style={{ color: "var(--text-muted)" }} />
        )}
      </div>

      {/* Search results */}
      {results.length > 0 && (
        <div className="space-y-1.5 max-h-36 overflow-y-auto">
          {results.map((brewery) => (
            <div
              key={brewery.id}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors"
              style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                  {brewery.name}
                </p>
                <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                  {brewery.city}, {brewery.state}
                </p>
              </div>
              <button
                onClick={() => addLocation(brewery)}
                disabled={adding === brewery.id}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all disabled:opacity-50"
                style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)", color: "var(--accent-gold)" }}
              >
                {adding === brewery.id ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Plus size={12} />
                )}
                Add
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Added locations */}
      {addedLocations.length > 0 && (
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Added locations
          </label>
          <div className="space-y-1.5">
            <AnimatePresence>
              {addedLocations.map((loc) => (
                <motion.div
                  key={loc.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border"
                  style={{ background: "color-mix(in srgb, var(--accent-gold) 8%, transparent)", borderColor: "var(--accent-gold)" }}
                >
                  <MapPin size={14} style={{ color: "var(--accent-gold)" }} />
                  <span className="text-sm flex-1 truncate" style={{ color: "var(--text-primary)" }}>
                    {loc.name}
                  </span>
                  <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                    {loc.city}, {loc.state}
                  </span>
                  <button onClick={() => removeFromAdded(loc.id)} className="p-0.5" style={{ color: "var(--text-muted)" }}>
                    <X size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Empty state hint */}
      {query.length >= 2 && results.length === 0 && !searching && (
        <p className="text-center text-xs py-2" style={{ color: "var(--text-muted)" }}>
          No breweries found. Try a different search term.
        </p>
      )}
    </div>
  );
}
