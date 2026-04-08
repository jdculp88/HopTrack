"use client";

import { useState, useMemo } from "react";
import { AchievementBadge } from "@/components/achievements/AchievementBadge";
import { PillTabs } from "@/components/ui/PillTabs";
import type { AchievementTier } from "@/types/database";

const TOTAL_ACHIEVEMENTS = 52;
const TIER_ORDER: AchievementTier[] = ["gold", "silver", "bronze"];

interface AchievementsGridProps {
  achievements: any[];
}

export function AchievementsGrid({ achievements }: AchievementsGridProps) {
  const [filterTier, setFilterTier] = useState<AchievementTier | "all">("all");

  const earnedCount = achievements.length;

  // Sort by tier (gold → silver → bronze), then newest first within tier
  const displayed = useMemo(() => {
    let list = [...achievements];

    if (filterTier !== "all") {
      list = list.filter((ua: any) => ua.achievement?.tier === filterTier);
    }

    const tierIdx = (t: string) => {
      const i = TIER_ORDER.indexOf(t as AchievementTier);
      return i === -1 ? 99 : i;
    };
    list.sort((a: any, b: any) => {
      const ai = tierIdx(a.achievement?.tier);
      const bi = tierIdx(b.achievement?.tier);
      if (ai !== bi) return ai - bi;
      return new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime();
    });

    return list;
  }, [achievements, filterTier]);

  if (achievements.length === 0) return null;

  const lockedCount = TOTAL_ACHIEVEMENTS - earnedCount;

  return (
    <div>
      {/* Header — title + count on one line, tier tabs below on mobile / inline on desktop */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <h2 className="font-display text-[22px] font-bold tracking-[-0.01em] text-[var(--text-primary)] whitespace-nowrap">
          Achievements{" "}
          <span className="text-sm font-mono font-normal text-[var(--text-muted)]">
            {earnedCount} / {TOTAL_ACHIEVEMENTS} earned
          </span>
        </h2>
        <PillTabs
          ariaLabel="Filter by tier"
          variant="segmented"
          size="sm"
          tabs={[
            { key: "all", label: "All Tiers" },
            ...TIER_ORDER.map((t) => ({ key: t, label: t.charAt(0).toUpperCase() + t.slice(1) })),
          ]}
          value={filterTier}
          onChange={(key) => setFilterTier(key as AchievementTier | "all")}
        />
      </div>

      {/* Grid — earned badges */}
      {displayed.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
          {displayed.map((ua: any) => (
            <div
              key={ua.id}
              className="rounded-[14px] py-3 px-2 flex flex-col items-center"
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
                boxShadow: "0 1px 3px color-mix(in srgb, var(--accent-gold) 8%, transparent)",
              }}
            >
              <AchievementBadge
                achievement={ua.achievement}
                earned
                earnedAt={ua.earned_at}
                size="md"
                className="h-full"
              />
            </div>
          ))}

          {/* Locked placeholders — always shown, only when "All Tiers" */}
          {filterTier === "all" && lockedCount > 0 &&
            Array.from({ length: Math.min(lockedCount, 10) }).map((_, i) => (
              <div
                key={`locked-${i}`}
                className="rounded-[14px] py-3 px-2 flex flex-col items-center"
                style={{ background: "var(--card-bg)", border: "1px dashed var(--border)" }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center opacity-30 grayscale"
                  style={{ border: "2px dashed var(--border)" }}
                >
                  <span className="text-2xl">🏅</span>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] mt-2">Locked</p>
              </div>
            ))
          }
          {filterTier === "all" && lockedCount > 10 && (
            <div
              className="rounded-[14px] py-3 px-2 flex flex-col items-center justify-center"
              style={{ background: "var(--card-bg)", border: "1px dashed var(--border)" }}
            >
              <span className="text-xs font-mono text-[var(--text-muted)]">
                +{lockedCount - 10}
              </span>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">more</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 bg-[var(--surface)] rounded-[14px] border border-[var(--border)]">
          <p className="text-[var(--text-muted)] text-sm">No achievements match this filter.</p>
        </div>
      )}
    </div>
  );
}
