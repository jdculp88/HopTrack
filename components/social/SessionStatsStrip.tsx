import { Clock } from "lucide-react";

/**
 * Reusable session stats row for feed cards.
 * Design spec: 16px gap, JetBrains Mono 10.5px, text-muted,
 * 12px margin-top, NO top border separator.
 * Clock icon before duration. Star before avg rating.
 */

interface SessionStatsStripProps {
  beerCount: number;
  duration?: string | null;
  avgRating?: number | null;
}

export function SessionStatsStrip({ beerCount, duration, avgRating }: SessionStatsStripProps) {
  return (
    <div
      className="flex items-center flex-wrap"
      style={{
        gap: "16px",
        marginTop: "12px",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "10.5px",
        color: "var(--text-muted)",
      }}
    >
      <span className="flex items-center gap-1">
        <span>🍺</span>
        <span className="font-semibold">{beerCount}</span>
        <span>beer{beerCount !== 1 ? "s" : ""}</span>
      </span>

      {duration && (
        <span className="flex items-center gap-1">
          <Clock size={11} />
          <span className="font-semibold">{duration}</span>
        </span>
      )}

      {avgRating != null && (
        <span className="flex items-center gap-1">
          <span>★</span>
          <span className="font-semibold">avg {avgRating.toFixed(1)}</span>
        </span>
      )}
    </div>
  );
}
