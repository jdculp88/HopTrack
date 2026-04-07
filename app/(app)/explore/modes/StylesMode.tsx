"use client";

// StylesMode — Sprint 160 (The Flow)
// Grid of 10 style family tiles with color washes. Tap → show filtered beers
// + breweries. Uses /api/explore/by-style endpoint.

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { STYLE_FAMILY_VARS, type BeerStyleFamily } from "@/lib/beerStyleColors";
import { transition, spring } from "@/lib/animation";

const FAMILIES: { key: BeerStyleFamily; label: string; emoji: string }[] = [
  { key: "ipa", label: "IPA", emoji: "🌿" },
  { key: "stout", label: "Stout", emoji: "☕" },
  { key: "sour", label: "Sour", emoji: "🍒" },
  { key: "porter", label: "Porter", emoji: "🍫" },
  { key: "lager", label: "Lager", emoji: "🌾" },
  { key: "saison", label: "Saison", emoji: "🍑" },
  { key: "cider", label: "Cider", emoji: "🍎" },
  { key: "wine", label: "Wine", emoji: "🍷" },
  { key: "cocktail", label: "Cocktail", emoji: "🍸" },
  { key: "na", label: "Non-Alc", emoji: "🍋" },
];

interface ByStyleData {
  beers: Array<{
    id: string;
    name: string;
    style: string | null;
    abv: number | null;
    avg_rating: number | null;
    brewery: { id: string; name: string; city: string | null; state: string | null } | null;
  }>;
  breweries: Array<{
    id: string;
    name: string;
    city: string | null;
    state: string | null;
    beerCount: number;
  }>;
}

export function StylesMode() {
  const [activeFamily, setActiveFamily] = useState<BeerStyleFamily | null>(null);
  const [data, setData] = useState<ByStyleData | null>(null);
  const [loading, setLoading] = useState(false);
  const cacheRef = useCacheRef();

  async function handleSelectFamily(family: BeerStyleFamily) {
    if (activeFamily === family) {
      setActiveFamily(null);
      setData(null);
      return;
    }
    setActiveFamily(family);
    // Check cache first
    const cached = cacheRef.current.get(family);
    if (cached) {
      setData(cached);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/explore/by-style?family=${family}`);
      if (!res.ok) {
        setData(null);
        return;
      }
      const json = await res.json();
      const result: ByStyleData = json.data ?? { beers: [], breweries: [] };
      cacheRef.current.set(family, result);
      setData(result);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Family grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {FAMILIES.map((family) => {
          const vars = STYLE_FAMILY_VARS[family.key];
          const isActive = activeFamily === family.key;
          return (
            <button
              key={family.key}
              type="button"
              onClick={() => handleSelectFamily(family.key)}
              className="relative rounded-2xl overflow-hidden p-4 border transition-all text-left"
              style={{
                background: `linear-gradient(135deg, ${vars.light}, ${vars.soft})`,
                borderColor: isActive ? vars.primary : "var(--border)",
                transform: isActive ? "scale(1.02)" : "scale(1)",
              }}
            >
              <div className="text-2xl mb-1.5">{family.emoji}</div>
              <p
                className="font-display font-bold text-base leading-tight"
                style={{ color: "var(--text-primary)" }}
              >
                {family.label}
              </p>
              {isActive && data && (
                <p className="text-[10px] font-mono mt-1" style={{ color: vars.primary }}>
                  {data.beers.length} beers · {data.breweries.length} breweries
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* Filtered results */}
      <AnimatePresence mode="wait">
        {activeFamily && (
          <motion.div
            key={activeFamily}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={transition.fast}
            className="space-y-6"
          >
            {loading ? (
              <div className="flex items-center justify-center py-10 gap-2 text-[var(--text-muted)]">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            ) : data ? (
              <>
                {/* Breweries */}
                {data.breweries.length > 0 && (
                  <div className="space-y-3">
                    <h3
                      className="font-display text-lg font-bold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Breweries with this style
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {data.breweries.slice(0, 10).map((brewery, i) => (
                        <motion.div
                          key={brewery.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03, ...spring.default }}
                        >
                          <Link href={`/brewery/${brewery.id}`}>
                            <Card padding="compact" hoverable className="flex items-center gap-3">
                              <div className="flex-1 min-w-0">
                                <p
                                  className="font-display font-semibold text-sm truncate"
                                  style={{ color: "var(--text-primary)" }}
                                >
                                  {brewery.name}
                                </p>
                                {(brewery.city || brewery.state) && (
                                  <p
                                    className="text-xs truncate"
                                    style={{ color: "var(--text-muted)" }}
                                  >
                                    {[brewery.city, brewery.state].filter(Boolean).join(", ")}
                                  </p>
                                )}
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p
                                  className="font-mono font-bold text-sm"
                                  style={{ color: "var(--accent-gold)" }}
                                >
                                  {brewery.beerCount}
                                </p>
                                <p className="text-[10px] text-[var(--text-muted)]">beers</p>
                              </div>
                            </Card>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Beers */}
                {data.beers.length > 0 && (
                  <div className="space-y-3">
                    <h3
                      className="font-display text-lg font-bold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Top rated in this style
                    </h3>
                    <div className="space-y-2">
                      {data.beers.slice(0, 10).map((beer, i) => (
                        <motion.div
                          key={beer.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03, ...spring.default }}
                        >
                          <Link href={`/beer/${beer.id}`}>
                            <div className="flex items-center gap-3 p-3 border border-[var(--card-border)] hover:border-[var(--accent-gold)]/30 rounded-2xl bg-[var(--card-bg)] transition-colors">
                              <div className="flex-1 min-w-0">
                                <p
                                  className="font-display font-semibold text-sm truncate"
                                  style={{ color: "var(--text-primary)" }}
                                >
                                  {beer.name}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  {beer.style && (
                                    <span
                                      className="text-[10px] font-mono uppercase tracking-wider"
                                      style={{ color: "var(--text-muted)" }}
                                    >
                                      {beer.style}
                                    </span>
                                  )}
                                  {beer.brewery?.name && (
                                    <span
                                      className="text-xs truncate"
                                      style={{ color: "var(--text-secondary)" }}
                                    >
                                      {beer.brewery.name}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {beer.avg_rating && (
                                <div className="text-right flex-shrink-0">
                                  <p
                                    className="font-mono font-bold text-sm"
                                    style={{ color: "var(--accent-gold)" }}
                                  >
                                    {beer.avg_rating.toFixed(1)}★
                                  </p>
                                </div>
                              )}
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {data.beers.length === 0 && data.breweries.length === 0 && (
                  <div className="text-center py-10 bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)]">
                    <p className="text-sm text-[var(--text-muted)]">No breweries listing this style yet</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-10 bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)]">
                <p className="text-sm text-[var(--text-muted)]">Couldn&apos;t load results</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Simple per-component cache using useRef
import { useRef } from "react";
function useCacheRef() {
  return useRef(new Map<BeerStyleFamily, ByStyleData>());
}
