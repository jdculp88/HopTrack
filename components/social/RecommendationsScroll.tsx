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
import { getGlass, getGlassSvgContent } from "@/lib/glassware";
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

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1 snap-x">
        {merged.slice(0, 10).map((beer, i) => {
          const styleVars = getStyleVars(beer.style);
          const glass = getGlass("shaker_pint");
          const svgHtml = glass ? getGlassSvgContent(glass, `reco-${beer.id}`) : null;

          return (
            <motion.div
              key={beer.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex-shrink-0 snap-start"
            >
              <Link href={`/beer/${beer.id}`}>
                <div
                  className="w-[220px] rounded-[14px] overflow-hidden transition-all hover:scale-[1.02] flex flex-col"
                  style={{
                    border: "1px solid var(--card-border)",
                    background: "var(--card-bg)",
                  }}
                >
                  {/* Style-tinted hero area with glass watermark */}
                  <div
                    className="relative px-4 pt-10 pb-3"
                    style={{
                      background: `linear-gradient(180deg, color-mix(in srgb, ${styleVars.primary} 20%, var(--card-bg)) 0%, var(--card-bg) 100%)`,
                    }}
                  >
                    {/* Glass watermark */}
                    {svgHtml && (
                      <div className="absolute top-2 right-3 opacity-15">
                        <svg
                          viewBox="0 0 80 120"
                          width={36}
                          height={54}
                          dangerouslySetInnerHTML={{ __html: svgHtml }}
                        />
                      </div>
                    )}

                    {/* Beer name — large, bold */}
                    <p
                      className="font-display font-bold leading-tight"
                      style={{ color: "var(--text-primary)", fontSize: "16px", letterSpacing: "-0.01em" }}
                    >
                      {beer.name}
                    </p>
                    {beer.brewery && (
                      <p
                        className="text-xs truncate mt-0.5"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {beer.brewery.name}
                      </p>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="px-4 pb-4 flex flex-col gap-2 flex-1">
                    {/* Style badge — full-width, prominent */}
                    {beer.style && (
                      <div>
                        <BeerStyleBadge style={beer.style} size="sm" />
                      </div>
                    )}

                    {/* Rating with 5 filled stars */}
                    {beer.avg_rating != null && beer.avg_rating > 0 && (
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <Star
                              key={j}
                              size={11}
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
                          className="text-sm font-mono font-bold"
                          style={{ color: "var(--accent-gold)" }}
                        >
                          {beer.avg_rating.toFixed(1)}
                        </span>
                        {beer.total_ratings > 0 && (
                          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                            ({beer.total_ratings})
                          </span>
                        )}
                      </div>
                    )}

                    {/* Reason line — style's primary color */}
                    {beer.reason && (
                      <p
                        className="text-[11px] leading-relaxed line-clamp-2 mt-auto"
                        style={{ color: styleVars.primary }}
                      >
                        {beer.reason}
                      </p>
                    )}
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
