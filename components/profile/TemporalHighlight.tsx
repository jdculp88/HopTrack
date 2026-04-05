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
              <div className="flex-1 h-5 bg-[var(--surface-2)] rounded-md overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${width}%` }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 25,
                    delay: i * 0.04,
                  }}
                  className="h-full rounded-md"
                  style={{
                    background: isFavorite
                      ? "linear-gradient(to right, var(--accent-gold), var(--accent-amber))"
                      : "var(--border)",
                  }}
                />
              </div>
              <span
                className="text-[10px] font-mono tabular-nums w-6 text-right flex-shrink-0"
                style={{ color: isFavorite ? "var(--accent-gold)" : "var(--text-muted)" }}
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
