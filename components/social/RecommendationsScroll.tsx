"use client";

// Sprint 171: Merged "For You" + "Brewed for You" into single section.
// Color-coded cards (from original RecommendationsScroll) + information density
// (from AIRecommendationFeedCard). One section, best of both.

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Star, Sparkles, Loader2 } from "lucide-react";
import { BeerStyleBadge } from "@/components/ui/BeerStyleBadge";
import { getStyleFamily, getStyleVars } from "@/lib/beerStyleColors";
import type { AIRecommendedBeer } from "@/lib/recommendations";

interface RecommendedBeer {
  id: string;
  name: string;
  style: string | null;
  abv: number | null;
  avg_rating: number | null;
  total_ratings: number;
  brewery: { id: string; name: string; city: string | null } | null;
  reason: string;
}

interface RecommendationsScrollProps {
  beers: RecommendedBeer[];
  aiBeers?: AIRecommendedBeer[];
}

export function RecommendationsScroll({ beers, aiBeers }: RecommendationsScrollProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [aiItems, setAiItems] = useState(aiBeers ?? []);

  // Merge: AI recommendations first (they have reasons), then algorithmic
  const aiIds = new Set(aiItems.map(b => b.id));
  const merged = [
    ...aiItems.map(b => ({
      id: b.id,
      name: b.name,
      style: b.style,
      abv: b.abv,
      avg_rating: b.avg_rating,
      total_ratings: b.total_ratings ?? 0,
      brewery: b.brewery,
      reason: b.aiReason ?? "",
    })),
    ...beers.filter(b => !aiIds.has(b.id)),
  ];

  if (merged.length === 0) return null;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/recommendations/ai", { method: "POST" });
      const json = await res.json();
      if (json.data?.recommendations?.length) {
        setAiItems(json.data.recommendations);
      }
    } catch {
      // Silent fail — keep existing
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Sparkles size={13} style={{ color: "var(--accent-gold)" }} />
          <p
            className="text-[10px] font-mono uppercase tracking-widest"
            style={{ color: "var(--accent-gold)" }}
          >
            Recommended for You
          </p>
        </div>
        {aiItems.length > 0 && (
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1 text-[10px] font-mono transition-opacity hover:opacity-70 disabled:opacity-40"
            style={{ color: "var(--text-muted)" }}
          >
            {refreshing ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
            Refresh
          </button>
        )}
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1 snap-x items-stretch">
        {merged.slice(0, 10).map((beer, i) => {
          const styleVars = getStyleVars(beer.style);

          return (
            <motion.div
              key={beer.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex-shrink-0 snap-start flex"
            >
              <Link href={`/beer/${beer.id}`}>
                <div
                  className="w-[180px] h-full rounded-[14px] overflow-hidden transition-all hover:scale-[1.02] flex flex-col"
                  style={{
                    border: "1px solid var(--card-border)",
                    background: "var(--card-bg)",
                  }}
                >
                  {/* Style-tinted hero — radial glow + linear tint per design spec */}
                  <div
                    className="relative px-3 pt-3 pb-2 flex-shrink-0 overflow-hidden"
                    style={{
                      height: "64px",
                      background: `radial-gradient(ellipse at 80% 20%, color-mix(in srgb, ${styleVars.primary} 8%, transparent) 0%, transparent 60%), linear-gradient(180deg, color-mix(in srgb, ${styleVars.primary} 6%, var(--card-bg)) 0%, var(--card-bg) 100%)`,
                    }}
                  >
                    {/* Custom glass line-art SVG per design spec */}
                    <svg
                      className="absolute top-3 right-3"
                      width={32}
                      height={32}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={styleVars.primary}
                      strokeWidth={1}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ opacity: 0.3 }}
                    >
                      <path d="M7 3h10l-1.5 15a2 2 0 0 1-2 1.8h-3a2 2 0 0 1-2-1.8L7 3z" />
                    </svg>

                    {/* Beer name */}
                    <p
                      className="font-sans font-bold leading-tight pr-8 line-clamp-2"
                      style={{ color: "var(--text-primary)", fontSize: "14px", letterSpacing: "-0.01em" }}
                    >
                      {beer.name}
                    </p>
                    {beer.brewery && (
                      <p
                        className="truncate mt-0.5"
                        style={{ fontSize: "11px", color: "var(--text-secondary)" }}
                      >
                        {beer.brewery.name}
                      </p>
                    )}
                  </div>

                  {/* Card body — badge, rating, reason aligned across cards */}
                  <div className="px-3 pb-3 flex flex-col flex-1">
                    <div className="flex flex-col">
                    {/* Style badge — full-width, sm text */}
                    {beer.style && (
                      <div style={{ marginTop: "6px" }}>
                        <BeerStyleBadge style={beer.style} size="sm" fullWidth />
                      </div>
                    )}

                    {/* Rating */}
                    {beer.avg_rating != null && beer.avg_rating > 0 && (
                      <div className="flex items-center gap-1.5" style={{ marginTop: "6px" }}>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <Star
                              key={j}
                              size={10}
                              style={{
                                color: "var(--accent-gold)",
                                fill:
                                  j < Math.round(beer.avg_rating!)
                                    ? "var(--accent-gold)"
                                    : "transparent",
                              }}
                            />
                          ))}
                        </div>
                        <span
                          className="font-mono font-bold"
                          style={{ fontSize: "13px", color: "var(--accent-gold)" }}
                        >
                          {beer.avg_rating.toFixed(1)}
                        </span>
                        {beer.total_ratings > 0 && (
                          <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                            ({beer.total_ratings})
                          </span>
                        )}
                      </div>
                    )}

                    {/* Reason — anchored to bottom */}
                    {beer.reason && (
                      <p
                        className="leading-relaxed line-clamp-2 mt-auto"
                        style={{ fontSize: "11px", color: styleVars.primary, paddingTop: "6px" }}
                      >
                        {beer.reason}
                      </p>
                    )}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/** Map style family key to its CSS variable name */
function getStyleCssVar(family: string): string {
  const map: Record<string, string> = {
    ipa: "ipa-green",
    stout: "stout-espresso-mid",
    sour: "sour-berry",
    porter: "porter-plum",
    lager: "lager-sky",
    saison: "saison-peach",
    cider: "cider-rose",
    wine: "wine-burgundy",
    cocktail: "cocktail-teal",
    na: "na-lemon",
  };
  return map[family] ?? "accent-gold";
}
