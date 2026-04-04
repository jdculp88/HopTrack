"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Star, Sparkles } from "lucide-react";
import { BeerStyleBadge } from "@/components/ui/BeerStyleBadge";
import { getStyleFamily } from "@/lib/beerStyleColors";

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

export function RecommendationsScroll({ beers }: { beers: RecommendedBeer[] }) {
  if (beers.length === 0) return null;

  // Group by reason for section headers
  const firstReason = beers[0].reason;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <Sparkles size={13} style={{ color: "var(--accent-gold)" }} />
        <p
          className="text-[10px] font-mono uppercase tracking-widest"
          style={{ color: "var(--accent-gold)" }}
        >
          For You
        </p>
      </div>
      <p className="text-xs px-1" style={{ color: "var(--text-secondary)" }}>
        {firstReason}
      </p>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1 snap-x">
        {beers.slice(0, 8).map((beer, i) => (
          <motion.div
            key={beer.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex-shrink-0 snap-start"
          >
            <Link href={`/beer/${beer.id}`}>
              <div
                className="card-bg-reco w-[160px] p-3 rounded-xl h-full transition-all"
                data-style={getStyleFamily(beer.style)}
                style={{ border: "1px solid var(--surface-warm-border)" }}
              >
                <p
                  className="font-display font-bold text-sm truncate mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  {beer.name}
                </p>
                {beer.brewery && (
                  <p
                    className="text-[10px] truncate mb-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {beer.brewery.name}
                  </p>
                )}
                <div className="flex items-center gap-2 mb-2">
                  {beer.style && <BeerStyleBadge style={beer.style} size="xs" />}
                  {beer.abv && (
                    <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
                      {beer.abv}%
                    </span>
                  )}
                </div>
                {beer.avg_rating && beer.avg_rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star
                      size={11}
                      className="fill-[var(--accent-gold)] text-[var(--accent-gold)]"
                    />
                    <span
                      className="text-xs font-mono font-bold"
                      style={{ color: "var(--accent-gold)" }}
                    >
                      {beer.avg_rating.toFixed(1)}
                    </span>
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                      ({beer.total_ratings})
                    </span>
                  </div>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
