"use client";

import { useState, useMemo } from "react";
import { Trophy } from "lucide-react";
import { AchievementBadge } from "@/components/achievements/AchievementBadge";
import { CATEGORY_LABELS } from "@/lib/constants/tiers";
import { PILL_ACTIVE, PILL_INACTIVE } from "@/lib/constants/ui";
import type { AchievementTier, AchievementCategory } from "@/types/database";

const TOTAL_ACHIEVEMENTS = 52;

const TIER_ORDER: AchievementTier[] = ["platinum", "gold", "silver", "bronze"];

type SortBy = "date" | "tier";

interface AchievementsGridProps {
  achievements: any[];
}

export function AchievementsGrid({ achievements }: AchievementsGridProps) {
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [filterTier, setFilterTier] = useState<AchievementTier | "all">("all");
  const [filterCategory, setFilterCategory] = useState<AchievementCategory | "all">("all");
  const [showLocked, setShowLocked] = useState(true);

  // Which tiers actually have earned achievements
  const earnedTiers = useMemo(() => {
    const tiers = new Set<AchievementTier>();
    for (const ua of achievements) tiers.add(ua.achievement?.tier);
    return tiers;
  }, [achievements]);

  // Which categories actually have earned achievements
  const earnedCategories = useMemo(() => {
    const cats = new Set<AchievementCategory>();
    for (const ua of achievements) cats.add(ua.achievement?.category);
    return cats;
  }, [achievements]);

  // Apply sort + filter
  const displayed = useMemo(() => {
    let list = [...achievements];

    if (filterTier !== "all") {
      list = list.filter((ua: any) => ua.achievement?.tier === filterTier);
    }
    if (filterCategory !== "all") {
      list = list.filter((ua: any) => ua.achievement?.category === filterCategory);
    }

    if (sortBy === "date") {
      list.sort((a: any, b: any) =>
        new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime()
      );
    } else {
      // tier sort: platinum → gold → silver → bronze
      list.sort((a: any, b: any) => {
        const ai = TIER_ORDER.indexOf(a.achievement?.tier);
        const bi = TIER_ORDER.indexOf(b.achievement?.tier);
        if (ai !== bi) return ai - bi;
        // secondary: newest first within same tier
        return new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime();
      });
    }

    return list;
  }, [achievements, sortBy, filterTier, filterCategory]);

  if (achievements.length === 0) return null;

  // Most recent 3 (before any filtering) for "New" badges
  const recentIds = new Set(achievements.slice(0, 3).map((a: any) => a.id));

  const earnedCount = achievements.length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, var(--accent-gold), var(--accent-amber))" }}
          >
            <Trophy size={16} className="text-[var(--bg)]" />
          </div>
          <div>
            <h2 className="font-display text-[28px] font-bold tracking-[-0.02em] text-[var(--text-primary)] leading-tight">
              Achievements
            </h2>
            <p className="font-mono text-sm text-[var(--text-muted)]">
              {earnedCount} / {TOTAL_ACHIEVEMENTS} earned
            </p>
          </div>
        </div>
      </div>

      {/* Sort row */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] mr-1">Sort</span>
        {(["date", "tier"] as SortBy[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSortBy(s)}
            className="px-3 py-1 text-xs font-medium rounded-full border transition-all"
            style={sortBy === s ? PILL_ACTIVE : PILL_INACTIVE}
          >
            {s === "date" ? "By Date" : "By Tier"}
          </button>
        ))}

        {/* Show Locked toggle — pushed to the right */}
        <button
          type="button"
          onClick={() => setShowLocked((v) => !v)}
          className="ml-auto px-3 py-1 text-xs font-medium rounded-full border transition-all"
          style={showLocked ? PILL_ACTIVE : PILL_INACTIVE}
        >
          {showLocked ? "Locked On" : "Locked Off"}
        </button>
      </div>

      {/* Tier filter chips */}
      <div className="flex flex-wrap gap-2 mb-3">
        <button
          type="button"
          onClick={() => setFilterTier("all")}
          className="px-3 py-1 text-xs font-medium rounded-full border transition-all"
          style={filterTier === "all" ? PILL_ACTIVE : PILL_INACTIVE}
        >
          All Tiers
        </button>
        {TIER_ORDER.filter((t) => earnedTiers.has(t)).map((tier) => (
          <button
            key={tier}
            type="button"
            onClick={() => setFilterTier(filterTier === tier ? "all" : tier)}
            className="px-3 py-1 text-xs font-medium rounded-full border capitalize transition-all"
            style={filterTier === tier ? PILL_ACTIVE : PILL_INACTIVE}
          >
            {tier}
          </button>
        ))}
      </div>

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          type="button"
          onClick={() => setFilterCategory("all")}
          className="px-3 py-1 text-xs font-medium rounded-full border transition-all"
          style={filterCategory === "all" ? PILL_ACTIVE : PILL_INACTIVE}
        >
          All Categories
        </button>
        {(Object.keys(CATEGORY_LABELS) as AchievementCategory[])
          .filter((c) => earnedCategories.has(c))
          .map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCategory(filterCategory === cat ? "all" : cat)}
              className="px-3 py-1 text-xs font-medium rounded-full border transition-all"
              style={filterCategory === cat ? PILL_ACTIVE : PILL_INACTIVE}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
      </div>

      {/* Grid */}
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
        </div>
      ) : (
        <div className="text-center py-8 bg-[var(--surface)] rounded-[14px] border border-[var(--border)]">
          <p className="text-[var(--text-muted)] text-sm">No achievements match these filters.</p>
        </div>
      )}

      {/* Show Locked — unearned achievements placeholder grid */}
      {showLocked && filterTier === "all" && filterCategory === "all" && earnedCount < TOTAL_ACHIEVEMENTS && (
        <div className="mt-6">
          <p className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] mb-3">
            Locked — {TOTAL_ACHIEVEMENTS - earnedCount} remaining
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
            {Array.from({ length: Math.min(TOTAL_ACHIEVEMENTS - earnedCount, 10) }).map((_, i) => (
              <div
                key={`locked-${i}`}
                className="rounded-[14px] py-3 px-2 flex flex-col items-center"
                style={{ background: "var(--card-bg)", border: "1px dashed var(--border)" }}
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center opacity-30 grayscale" style={{ border: "2px dashed var(--border)" }}>
                  <span className="text-2xl">🏅</span>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] mt-2">Locked</p>
              </div>
            ))}
            {TOTAL_ACHIEVEMENTS - earnedCount > 10 && (
              <div
                className="rounded-[14px] py-3 px-2 flex flex-col items-center justify-center"
                style={{ background: "var(--card-bg)", border: "1px dashed var(--border)" }}
              >
                <span className="text-xs font-mono text-[var(--text-muted)]">
                  +{TOTAL_ACHIEVEMENTS - earnedCount - 10}
                </span>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">more</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
