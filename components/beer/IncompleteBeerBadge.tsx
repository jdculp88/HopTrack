"use client";

import { AlertTriangle } from "lucide-react";

interface IncompleteBeerBadgeProps {
  beer: {
    abv?: number | null;
    style?: string | null;
    description?: string | null;
  };
  compact?: boolean;
}

/** Returns true if the beer has suspect or missing data */
export function isBeerDataIncomplete(beer: {
  abv?: number | null;
  style?: string | null;
  description?: string | null;
}): boolean {
  // Suspect ABV (too low to be real, except for NA beers)
  if (beer.abv != null && beer.abv > 0 && beer.abv < 0.5) return true;
  // Missing critical fields
  if (!beer.style) return true;
  if (beer.abv == null) return true;
  return false;
}

export function IncompleteBeerBadge({ beer, compact = false }: IncompleteBeerBadgeProps) {
  if (!isBeerDataIncomplete(beer)) return null;

  if (compact) {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono"
        style={{
          background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)",
          color: "var(--accent-gold)",
          border: "1px solid color-mix(in srgb, var(--accent-gold) 30%, transparent)",
        }}
      >
        <AlertTriangle size={10} />
        Needs details
      </span>
    );
  }

  return (
    <div
      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs"
      style={{
        background: "color-mix(in srgb, var(--accent-gold) 10%, transparent)",
        border: "1px solid color-mix(in srgb, var(--accent-gold) 25%, transparent)",
        color: "var(--text-secondary)",
      }}
    >
      <AlertTriangle size={14} style={{ color: "var(--accent-gold)", flexShrink: 0 }} />
      <span>
        This beer is missing some details.{" "}
        <span style={{ color: "var(--accent-gold)" }}>Brewery owners can update this by claiming their listing.</span>
      </span>
    </div>
  );
}
