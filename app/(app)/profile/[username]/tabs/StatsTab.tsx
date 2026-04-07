"use client";

// StatsTab — Sprint 160 (The Flow) + Sprint 162 (The Identity)
// Shows drinker stats: Quick Stats, Rarity, Temporal, Level+XP, DrinkerStatsCard, BeerDNA, ActivityHeatmap.

import { Flame, GlassWater, Star, MapPin } from "lucide-react";
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

      {/* Streak card — separate from stat grid */}
      {(current_streak > 0 || longest_streak > 0) && (
        <div
          className="rounded-[14px] border overflow-hidden"
          style={{
            background: "var(--card-bg)",
            borderColor: "color-mix(in srgb, var(--accent-gold) 20%, var(--border))",
          }}
        >
          <div className="h-[3px]" style={{ background: "linear-gradient(to right, var(--accent-amber), var(--accent-gold))" }} />
          <div className="p-4 flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-[14px] flex items-center justify-center text-2xl"
              style={{ background: "color-mix(in srgb, var(--accent-amber) 12%, var(--surface-2))" }}
            >
              🔥
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  <CountUp value={current_streak} duration={1.0} delay={0.3} />
                </span>
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>day streak</span>
              </div>
              {longest_streak > 0 && (
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  Personal best: {longest_streak} days
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Level + XP Progress — warm gradient card with rank milestones */}
      <div
        className="border rounded-[14px] p-4 space-y-3"
        style={{
          background: "linear-gradient(135deg, color-mix(in srgb, var(--accent-gold) 8%, var(--card-bg)) 0%, var(--card-bg) 60%)",
          borderColor: "color-mix(in srgb, var(--accent-gold) 20%, var(--border))",
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--accent-gold)" }}>
              Level {level}
            </span>
            <p className="font-display text-xl font-bold text-[var(--text-primary)]">{levelInfo.current.name}</p>
          </div>
          {levelInfo.next && (
            <div className="text-right">
              <span className="font-mono text-[9px] uppercase tracking-[0.12em] block" style={{ color: "var(--text-muted)" }}>
                Next Rank
              </span>
              <p className="font-sans text-base font-bold text-[var(--text-primary)]">{levelInfo.next.name}</p>
              <p className="font-mono text-[13px] font-bold" style={{ color: "var(--accent-gold)" }}>
                {levelInfo.xpToNext} XP to go
              </p>
            </div>
          )}
        </div>

        {/* Progress bar with amber gradient + milestone dots */}
        <div>
          <div className="relative h-2.5 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                background: "linear-gradient(to right, var(--accent-gold), var(--accent-amber))",
                width: `${levelInfo.progress}%`,
              }}
            />
            {/* Milestone dots at rank transitions */}
            {[20, 40, 60, 80].map((m) => (
              <div
                key={m}
                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border"
                style={{
                  left: `${m}%`,
                  transform: "translate(-50%, -50%)",
                  background: levelInfo.progress >= m ? "var(--accent-gold)" : "var(--surface-2)",
                  borderColor: levelInfo.progress >= m ? "var(--accent-gold)" : "var(--border)",
                }}
              />
            ))}
          </div>
          {/* Rank labels below the bar */}
          <div className="flex justify-between mt-1.5">
            {["Newbie", "Taster", "Brew Buddy", "Regular", "Legend"].map((rank) => (
              <span
                key={rank}
                className="text-[8px] font-mono"
                style={{ color: rank === levelInfo.current.name ? "var(--text-primary)" : "var(--text-muted)" }}
              >
                {rank}
              </span>
            ))}
          </div>
        </div>

        {/* Streak at bottom */}
        {(current_streak > 0 || longest_streak > 0) && (
          <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
            {current_streak > 0 && (
              <div className="flex items-center gap-1.5">
                <span>🔥</span>
                <span className="text-sm font-mono" style={{ color: "var(--text-secondary)" }}>
                  {current_streak} day streak
                </span>
              </div>
            )}
            {longest_streak > 0 && (
              <span className="text-xs text-[var(--text-muted)]">Best: {longest_streak}d</span>
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
        <div className="border border-[var(--border)] rounded-[14px] p-4 bg-[var(--surface)]">
          <h3 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-3">Pour Pattern</h3>
          <ActivityHeatmap data={heatmapData} />
        </div>
      )}
    </div>
  );
}
