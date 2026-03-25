"use client";

import { useState } from "react";
import { AchievementBadge } from "@/components/achievements/AchievementBadge";

const INITIAL_COUNT = 12;

interface AchievementsGridProps {
  achievements: any[];
}

export function AchievementsGrid({ achievements }: AchievementsGridProps) {
  const [showAll, setShowAll] = useState(false);

  if (achievements.length === 0) return null;

  const displayed = showAll ? achievements : achievements.slice(0, INITIAL_COUNT);
  const hasMore = achievements.length > INITIAL_COUNT;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">Achievements</h2>
        <span className="text-sm text-[var(--text-muted)]">{achievements.length} earned</span>
      </div>

      <div className="flex flex-wrap gap-4">
        {displayed.map((ua: any) => (
          <AchievementBadge
            key={ua.id}
            achievement={ua.achievement}
            earned
            earnedAt={ua.earned_at}
            size="md"
          />
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="mt-4 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: "var(--accent-gold)" }}
        >
          {showAll
            ? "Show less ↑"
            : `Show all ${achievements.length} achievements ↓`}
        </button>
      )}
    </div>
  );
}
