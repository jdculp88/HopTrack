"use client";

import { HopMark } from "@/components/ui/HopMark";
import { C, type BreweryStats } from "./board-types";

interface BoardStatsProps {
  breweryStats: BreweryStats | undefined;
  showStats: boolean;
}

/**
 * Renders the right side of the board footer: brewery quick-stats line
 * (total pours, unique visitors, top-rated beer) plus the HopTrack badge
 * and the green "Live" indicator.
 */
export function BoardStats({ breweryStats, showStats }: BoardStatsProps) {
  const statsLine = (() => {
    if (!breweryStats || breweryStats.totalPours === 0) return null;
    const parts: string[] = [];
    parts.push(`${breweryStats.totalPours.toLocaleString()} pours`);
    parts.push(`${breweryStats.uniqueVisitors.toLocaleString()} visitors`);
    if (breweryStats.topRatedBeer) {
      parts.push(
        `Top Rated: ${breweryStats.topRatedBeer}${
          breweryStats.topRatedScore ? ` ⭐ ${breweryStats.topRatedScore.toFixed(1)}` : ""
        }`
      );
    }
    return parts.join(" · ");
  })();

  return (
    <>
      {/* Quick stats line */}
      {showStats && statsLine && (
        <div
          className="font-mono"
          style={{ fontSize: 13, color: C.textMuted, whiteSpace: "nowrap", flexShrink: 0 }}
        >
          {statsLine}
        </div>
      )}

      {/* HopTrack badge + Live dot */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <HopMark variant="horizontal" theme="cream" height={18} aria-hidden />
          <span className="font-mono" style={{
            fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em",
            color: C.textSubtle, opacity: 0.7,
          }}>
            Powered by HopTrack
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#3D7A52", display: "inline-block" }} />
          <span className="font-mono" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: C.textSubtle }}>
            Live
          </span>
        </div>
      </div>
    </>
  );
}
