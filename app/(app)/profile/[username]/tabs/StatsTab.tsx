"use client";

// StatsTab — Sprint 160 (The Flow) + Sprint 162 (The Identity)
// Shows drinker stats: Quick Stats, Rarity, Temporal, Level+XP, DrinkerStatsCard, BeerDNA, ActivityHeatmap.

import { Flame, GlassWater, Star, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { BeerDNACard } from "@/components/profile/BeerDNACard";
import { DrinkerStatsCard } from "@/components/profile/DrinkerStatsCard";
import { ActivityHeatmap } from "@/components/profile/ActivityHeatmap";
import { RarityCallouts, type RaritySnapshot } from "@/components/profile/RarityCallouts";
import { TemporalHighlight } from "@/components/profile/TemporalHighlight";
import { CountUp } from "@/components/ui/CountUp";
import { EmptyState } from "@/components/ui/EmptyState";
import { StreakCard } from "@/components/ui/StreakCard";
import { getLevelProgress, LEVELS } from "@/lib/xp";
import type { DrinkerKPIs } from "@/lib/kpi";
import type { TemporalProfile } from "@/lib/temporal";

interface StyleDNA {
  style: string;
  count: number;
  avgRating: number | null;
}

interface LevelInfo {
  current: { name: string };
  next: { name: string } | null;
  xpToNext: number;
  progress: number;
}

interface HeatmapDatum {
  date: string;
  count: number;
  style?: string;
}

export interface StatsTabProps {
  username: string;
  userId: string;
  isOwnProfile: boolean;
  profileStats: {
    total_checkins: number;
    unique_beers: number;
    unique_breweries: number;
    current_streak: number;
    longest_streak: number;
    level: number;
    xp: number;
  };
  levelInfo: LevelInfo;
  drinkerKPIs: DrinkerKPIs;
  styleDNA: StyleDNA[];
  heatmapData: HeatmapDatum[];
  // Sprint 162 (The Identity) — optional percentile + temporal data
  raritySnapshot?: RaritySnapshot | null;
  temporalProfile?: TemporalProfile | null;
}

export function StatsTab({
  username,
  userId,
  isOwnProfile,
  profileStats,
  levelInfo,
  drinkerKPIs,
  styleDNA,
  heatmapData,
  raritySnapshot,
  temporalProfile,
}: StatsTabProps) {
  const { total_checkins, unique_beers, unique_breweries, current_streak, longest_streak, level, xp } = profileStats;

  // Build 5 milestone ranks centered on current level (same logic as You tab)
  const xpLevelInfo = getLevelProgress(xp);
  const allLevels = LEVELS;
  const currentIdx = allLevels.findIndex(l => l.level === xpLevelInfo.current.level);
  const startIdx = Math.max(0, Math.min(currentIdx - 2, allLevels.length - 5));
  const milestones = allLevels.slice(startIdx, startIdx + 5);
  const windowStart = milestones[0].xp_required;
  const windowEnd = milestones[milestones.length - 1].xp_required;
  const windowProgress = windowEnd > windowStart
    ? Math.min(100, Math.max(2, Math.round(((xp - windowStart) / (windowEnd - windowStart)) * 100)))
    : 100;

  return (
    <div className="space-y-6">
      {/* Quick Stats — 3 cards with amber top accent bar + icons */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { value: total_checkins, label: "Sessions", icon: GlassWater, delay: 0 },
          { value: unique_beers, label: "Unique Beers", icon: Star, delay: 0.1 },
          { value: unique_breweries, label: "Breweries", icon: MapPin, delay: 0.2 },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="rounded-[14px] border overflow-hidden"
            style={{
              background: "var(--card-bg)",
              borderColor: "color-mix(in srgb, var(--accent-gold) 20%, var(--border))",
            }}
          >
            {/* Amber top accent bar */}
            <div
              className="h-[3px]"
              style={{ background: "linear-gradient(to right, var(--accent-gold), var(--accent-amber))" }}
            />
            <div className="p-3.5">
              <div
                className="w-8 h-8 rounded-[10px] flex items-center justify-center mb-2"
                style={{ background: "color-mix(in srgb, var(--accent-gold) 10%, var(--surface-2))" }}
              >
                <stat.icon size={16} style={{ color: "var(--accent-gold)" }} />
              </div>
              <p className="font-mono font-bold text-[28px] leading-none" style={{ color: "var(--text-primary)" }}>
                <CountUp value={stat.value} duration={1.0} delay={stat.delay} />
              </p>
              <p className="text-[9px] text-[var(--text-muted)] mt-1.5 font-mono uppercase tracking-[0.12em]">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Streak card — same StreakCard used on You tab */}
      {(current_streak > 0 || longest_streak > 0) && (
        <StreakCard
          icon={<Flame size={20} style={{ color: "var(--accent-gold)" }} />}
          streak={current_streak}
          personalBest={longest_streak || current_streak}
        />
      )}

      {/* Level + XP Progress — matches You tab card (minus avatar) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="rounded-[16px] overflow-hidden"
        style={{ background: "linear-gradient(135deg, var(--warm-bg), var(--card-bg))", border: "1px solid var(--border)" }}
      >
        {/* Gold top bar */}
        <div style={{ height: "3px", background: "linear-gradient(90deg, var(--accent-gold), var(--accent-amber, var(--accent-gold)))" }} />

        <div style={{ padding: "18px 20px" }}>
          {/* Header — level/rank left, next rank right */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="font-mono uppercase" style={{ fontSize: "9px", color: "var(--accent-gold)", letterSpacing: "0.08em" }}>
                Level {level}
              </p>
              <p className="font-sans font-bold" style={{ fontSize: "20px", color: "var(--text-primary)" }}>
                {xpLevelInfo.current.name}
              </p>
            </div>
            {xpLevelInfo.next && (
              <div className="text-right">
                <p className="font-mono uppercase" style={{ fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.08em" }}>
                  Next Rank
                </p>
                <p className="font-sans font-semibold" style={{ fontSize: "15px", color: "var(--text-primary)" }}>
                  {xpLevelInfo.next.name}
                </p>
                <p className="font-mono font-semibold" style={{ fontSize: "11px", color: "var(--accent-gold)" }}>
                  {xpLevelInfo.xpToNext} XP to go
                </p>
              </div>
            )}
          </div>

          {/* XP progress bar */}
          <div className="h-2.5 rounded-full overflow-hidden mb-2" style={{ background: "color-mix(in srgb, var(--surface-3) 60%, transparent)" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${windowProgress}%` }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, var(--accent-gold), var(--accent-amber, var(--accent-gold)))",
                boxShadow: "0 0 8px rgba(212,168,67,0.3)",
              }}
            />
          </div>

          {/* Rank milestones — 5 levels centered on current */}
          <div
            className="flex justify-between font-mono"
            style={{ fontSize: "8px", color: "var(--text-muted)", letterSpacing: "0.03em", marginBottom: "12px" }}
          >
            {milestones.map((m) => (
              <span
                key={m.level}
                style={{
                  fontWeight: m.level === xpLevelInfo.current.level ? 700 : 400,
                  color: m.level === xpLevelInfo.current.level ? "var(--text-primary)" : "var(--text-muted)",
                }}
              >
                {m.name}
              </span>
            ))}
          </div>

          {/* Streak row */}
          {(current_streak > 0 || longest_streak > 0) && (
            <div
              className="flex items-center justify-between pt-3"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-2">
                <Flame size={14} style={{ color: "var(--accent-gold)" }} />
                <span className="font-mono" style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  {current_streak} day streak
                </span>
              </div>
              <span className="font-mono" style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                Best: {longest_streak || current_streak}d
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Rarity Callouts — Sprint 162 */}
      {raritySnapshot && (
        <RarityCallouts snapshot={raritySnapshot} userId={userId} isOwnProfile={isOwnProfile} />
      )}

      {/* Temporal Highlight — Sprint 162 */}
      {temporalProfile && <TemporalHighlight profile={temporalProfile} />}

      {/* Drinker Stats */}
      <DrinkerStatsCard kpis={drinkerKPIs} username={username} isOwnProfile={isOwnProfile} />

      {/* Beer DNA */}
      {styleDNA.length >= 3 ? (
        <BeerDNACard styleDNA={styleDNA} username={username} />
      ) : (
        <EmptyState
          emoji="🧬"
          title="Unlock Your Beer DNA"
          description="Check in 3+ different beer styles to reveal your taste profile"
          size="sm"
        />
      )}

      {/* Activity Heatmap — same as You tab (no wrapper) */}
      {heatmapData.length > 0 && (
        <ActivityHeatmap data={heatmapData} />
      )}
    </div>
  );
}
