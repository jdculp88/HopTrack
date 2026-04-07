"use client";

// Temporal Highlight — Sprint 162 (The Identity)
// Shows "Your Beer Thursday" + day-of-week breakdown.

import { motion } from "motion/react";
import { Card, CardTitle } from "@/components/ui/Card";
import type { TemporalProfile } from "@/lib/temporal";

interface TemporalHighlightProps {
  profile: TemporalProfile;
}

export function TemporalHighlight({ profile }: TemporalHighlightProps) {
  if (!profile.hasEnoughData || !profile.favoriteDay) return null;

  // Find max count to normalize bar widths
  const maxCount = Math.max(...profile.dowBreakdown.map((d) => d.count), 1);

  return (
    <Card padding="spacious">
      <CardTitle as="h3" className="mb-1">
        Your Beer {profile.favoriteDay.label}
      </CardTitle>
      <p className="text-xs text-[var(--text-muted)] mb-4">
        {Math.round(profile.favoriteDay.share * 100)}% of your pours
        {profile.favoriteHour && ` · peak hour ${profile.favoriteHour.label}`}
      </p>
      <div className="space-y-1.5">
        {profile.dowBreakdown.map((day, i) => {
          const width = (day.count / maxCount) * 100;
          const isFavorite = day.dow === profile.favoriteDay?.dow;
          const shortLabel = day.label.slice(0, 3);
          return (
            <div key={day.dow} className="flex items-center gap-2">
              <span
                className="text-[10px] font-mono uppercase tracking-wider w-8 flex-shrink-0"
                style={{ color: isFavorite ? "var(--accent-gold)" : "var(--text-muted)" }}
              >
                {shortLabel}
              </span>
              <div
                className="flex-1 overflow-hidden rounded-md"
                style={{ height: isFavorite ? "28px" : "20px", background: "var(--warm-bg, var(--surface-2))" }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${width}%` }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 25,
                    delay: i * 0.04,
                  }}
                  className="h-full rounded-md relative"
                  style={{
                    background: isFavorite
                      ? "linear-gradient(to right, var(--amber, var(--accent-gold)), var(--accent-amber))"
                      : "var(--border)",
                    boxShadow: isFavorite ? "0 0 12px rgba(196,136,62,0.2)" : "none",
                  }}
                />
              </div>
              <span
                className="font-mono tabular-nums w-6 text-right flex-shrink-0"
                style={{
                  fontSize: isFavorite ? "13px" : "10px",
                  fontWeight: isFavorite ? 700 : 500,
                  color: isFavorite ? "var(--amber, var(--accent-gold))" : "var(--text-muted)",
                }}
              >
                {day.count}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
