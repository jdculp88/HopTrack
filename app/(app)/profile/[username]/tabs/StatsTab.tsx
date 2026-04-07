"use client";

// StatsTab — Sprint 160 (The Flow) + Sprint 162 (The Identity)
// Shows drinker stats: Quick Stats, Rarity, Temporal, Level+XP, DrinkerStatsCard, BeerDNA, ActivityHeatmap.

import { Flame } from "lucide-react";
import { BeerDNACard } from "@/components/profile/BeerDNACard";
import { DrinkerStatsCard } from "@/components/profile/DrinkerStatsCard";
import { ActivityHeatmap } from "@/components/profile/ActivityHeatmap";
import { RarityCallouts, type RaritySnapshot } from "@/components/profile/RarityCallouts";
import { TemporalHighlight } from "@/components/profile/TemporalHighlight";
import { CountUp } from "@/components/ui/CountUp";
import { EmptyState } from "@/components/ui/EmptyState";
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
  const { total_checkins, unique_beers, unique_breweries, current_streak, longest_streak, level } = profileStats;
  return (
    <div className="space-y-6">
      {/* Sprint 171: Quick Stats — color-differentiated KPIs */}
      <div className="card-bg-stats border border-[var(--card-border)] rounded-2xl p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            className="text-center rounded-2xl py-3 px-1"
            style={{ background: "color-mix(in srgb, var(--accent-blue) 8%, var(--card-bg))" }}
          >
            <p className="font-mono font-bold text-xl leading-none" style={{ color: "var(--accent-blue)" }}>
              <CountUp value={total_checkins} duration={1.0} />
            </p>
            <p className="text-[10px] text-[var(--text-muted)] mt-1 font-mono uppercase tracking-wide">Sessions</p>
          </div>
          <div
            className="text-center rounded-2xl py-3 px-1"
            style={{ background: "color-mix(in srgb, var(--accent-amber) 8%, var(--card-bg))" }}
          >
            <p className="font-mono font-bold text-xl leading-none" style={{ color: "var(--accent-amber)" }}>
              <CountUp value={unique_beers} duration={1.0} delay={0.1} />
            </p>
            <p className="text-[10px] text-[var(--text-muted)] mt-1 font-mono uppercase tracking-wide">Unique Beers</p>
          </div>
          <div
            className="text-center rounded-2xl py-3 px-1"
            style={{ background: "color-mix(in srgb, var(--accent-green) 8%, var(--card-bg))" }}
          >
            <p className="font-mono font-bold text-xl leading-none" style={{ color: "var(--success)" }}>
              <CountUp value={unique_breweries} duration={1.0} delay={0.2} />
            </p>
            <p className="text-[10px] text-[var(--text-muted)] mt-1 font-mono uppercase tracking-wide">Breweries</p>
          </div>
          <div
            className="text-center rounded-2xl py-3 px-1"
            style={{ background: `color-mix(in srgb, ${current_streak > 0 ? "var(--accent-amber)" : "var(--accent-gold)"} 8%, var(--card-bg))` }}
          >
            <p
              className="font-mono font-bold text-xl leading-none"
              style={{ color: current_streak > 0 ? "var(--accent-amber)" : "var(--accent-gold)" }}
            >
              <CountUp value={current_streak} duration={1.0} delay={0.3} />
            </p>
            <p className="text-[10px] text-[var(--text-muted)] mt-1 font-mono uppercase tracking-wide">Day Streak</p>
          </div>
        </div>
      </div>

      {/* Level + XP Progress */}
      <div className="card-bg-stats border border-[var(--border)] rounded-2xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-[var(--accent-gold)] uppercase tracking-wider">Level {level}</span>
            <p className="font-display font-semibold text-[var(--text-primary)]">{levelInfo.current.name}</p>
          </div>
          {levelInfo.next && (
            <div className="text-right">
              <p className="text-xs text-[var(--text-muted)]">Next: {levelInfo.next.name}</p>
              <p className="text-xs font-mono text-[var(--text-secondary)]">{levelInfo.xpToNext} XP to go</p>
            </div>
          )}
        </div>
        <div className="h-2 bg-[var(--surface-2)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              background: "linear-gradient(to right, var(--accent-gold), var(--accent-amber))",
              width: `${levelInfo.progress}%`,
            }}
          />
        </div>
        {(current_streak > 0 || longest_streak > 0) && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[var(--border)]">
            {current_streak > 0 && (
              <div className="flex items-center gap-1.5">
                <Flame
                  size={14}
                  className={
                    current_streak >= 30
                      ? "text-[var(--accent-amber)]"
                      : current_streak >= 7
                        ? "text-[var(--accent-gold)]"
                        : "text-[var(--text-muted)]"
                  }
                />
                <span
                  className="text-sm font-mono font-bold"
                  style={{ color: current_streak >= 7 ? "var(--accent-gold)" : "var(--text-secondary)" }}
                >
                  {current_streak}
                </span>
                <span className="text-xs text-[var(--text-muted)]">day streak</span>
              </div>
            )}
            {longest_streak > current_streak && (
              <div className="flex items-center gap-1 ml-auto">
                <span className="text-xs text-[var(--text-muted)]">Best: {longest_streak}d</span>
              </div>
            )}
          </div>
        )}
      </div>

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

      {/* Activity Heatmap — 52-week pour pattern */}
      {heatmapData.length > 0 && (
        <div className="border border-[var(--border)] rounded-2xl p-4 bg-[var(--surface)]">
          <h3 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-3">Pour Pattern</h3>
          <ActivityHeatmap data={heatmapData} />
        </div>
      )}
    </div>
  );
}
