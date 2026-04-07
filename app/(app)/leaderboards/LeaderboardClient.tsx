"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { Trophy, Zap, Beer, Palette, MapPin, Flame, Users, Globe, Building2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/SkeletonLoader";
import { LeaderboardRow } from "@/components/social/LeaderboardRow";
import { LeaderboardPodium } from "@/components/social/LeaderboardPodium";
import { LEADERBOARD_CATEGORIES } from "@/lib/schemas/leaderboard";
import { PILL_ACTIVE, PILL_INACTIVE } from "@/lib/constants/ui";
import { stagger, spring } from "@/lib/animation";
import { formatCount } from "@/lib/utils";
import type { LeaderboardEntry } from "@/types/database";

// ─── Types ───────────────────────────────────────────────────────────────────

type Category = "xp" | "checkins" | "styles" | "breweries" | "streak";
type Scope = "global" | "friends" | "city";
type TimeRange = "week" | "month" | "all";

interface CurrentUser {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  level: number;
  home_city: string | null;
}

interface LeaderboardClientProps {
  currentUser: CurrentUser;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Zap,
  Beer,
  Palette,
  MapPin,
  Flame,
};

const SCOPE_OPTIONS: { id: Scope; label: string; icon: React.ElementType }[] = [
  { id: "global", label: "Global", icon: Globe },
  { id: "friends", label: "Friends", icon: Users },
  { id: "city", label: "City", icon: Building2 },
];

const TIME_OPTIONS: { id: TimeRange; label: string }[] = [
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "all", label: "All Time" },
];

const VALUE_LABELS: Record<Category, string> = {
  xp: "XP",
  checkins: "check-ins",
  styles: "styles",
  breweries: "breweries",
  streak: "day streak",
};

/** XP and streak are always all-time (no time range filter) */
const ALL_TIME_CATEGORIES = new Set<Category>(["xp", "streak"]);

// ─── Rank Change Tracking (localStorage) ────────────────────────────────────

function getRankStorageKey(cat: Category, sc: Scope, tr: TimeRange): string {
  return `ht-lb-ranks-${cat}-${sc}-${tr}`;
}

function loadPreviousRanks(cat: Category, sc: Scope, tr: TimeRange): Record<string, number> {
  try {
    const key = getRankStorageKey(cat, sc, tr);
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveCurrentRanks(cat: Category, sc: Scope, tr: TimeRange, entries: LeaderboardEntry[]) {
  try {
    const key = getRankStorageKey(cat, sc, tr);
    const snapshot: Record<string, number> = {};
    for (const e of entries) {
      snapshot[e.profile.id] = e.rank;
    }
    localStorage.setItem(key, JSON.stringify(snapshot));
  } catch {
    // localStorage quota or disabled — silent fail
  }
}

function computeRankChanges(
  entries: LeaderboardEntry[],
  previousRanks: Record<string, number>,
): LeaderboardEntry[] {
  if (Object.keys(previousRanks).length === 0) return entries;
  return entries.map((entry) => {
    const prev = previousRanks[entry.profile.id];
    if (prev === undefined) return entry;
    const change = prev - entry.rank; // positive = moved up
    return { ...entry, change };
  });
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function LeaderboardClient({ currentUser }: LeaderboardClientProps) {
  const [category, setCategory] = useState<Category>("xp");
  const [scope, setScope] = useState<Scope>("global");
  const [timeRange, setTimeRange] = useState<TimeRange>("month");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number>(-1);
  const [userValue, setUserValue] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [fetchKey, setFetchKey] = useState(0);

  const showTimeRange = !ALL_TIME_CATEGORIES.has(category);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        category,
        scope,
        timeRange: ALL_TIME_CATEGORIES.has(category) ? "all" : timeRange,
        limit: "50",
      });

      const res = await fetch(`/api/leaderboard?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");

      const json = await res.json();
      const data = json.data ?? [];

      // Map to LeaderboardEntry shape
      const mapped: LeaderboardEntry[] = data.map((e: any) => ({
        rank: e.rank,
        profile: {
          id: e.profile.id,
          username: e.profile.username ?? "unknown",
          display_name: e.profile.display_name ?? e.profile.username ?? "Unknown",
          avatar_url: e.profile.avatar_url ?? null,
          level: e.profile.level ?? 1,
          // Fill required Profile fields with defaults
          bio: null,
          home_city: null,
          total_checkins: 0,
          unique_beers: 0,
          unique_breweries: 0,
          xp: 0,
          is_public: true,
          current_streak: 0,
          longest_streak: 0,
        },
        value: e.value,
        change: e.change,
      }));

      // Compute rank changes from localStorage snapshot
      const resolvedTimeRange = ALL_TIME_CATEGORIES.has(category) ? "all" as TimeRange : timeRange;
      const previousRanks = loadPreviousRanks(category, scope, resolvedTimeRange);
      const withChanges = computeRankChanges(mapped, previousRanks);
      saveCurrentRanks(category, scope, resolvedTimeRange, mapped);

      setEntries(withChanges);
      setUserRank(json.meta?.userRank ?? -1);
      setUserValue(json.meta?.userValue ?? 0);
    } catch {
      setEntries([]);
      setUserRank(-1);
      setUserValue(0);
    } finally {
      setLoading(false);
    }
  }, [category, scope, timeRange, fetchKey]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Reset time range when switching to an all-time category
  useEffect(() => {
    if (ALL_TIME_CATEGORIES.has(category)) {
      setTimeRange("all");
    }
  }, [category]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <PageHeader
        title="Leaderboards"
        subtitle="See who's leading the pack"
        icon={Trophy}
      />

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {LEADERBOARD_CATEGORIES.map((cat) => {
          const active = category === cat.id;
          const Icon = CATEGORY_ICONS[cat.icon];
          return (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id as Category)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium border whitespace-nowrap transition-all"
              style={active ? PILL_ACTIVE : PILL_INACTIVE}
            >
              {Icon && <Icon size={13} />}
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Scope pills */}
      <div className="flex gap-2">
        {SCOPE_OPTIONS.map((s) => {
          const active = scope === s.id;
          const Icon = s.icon;
          // Disable city scope if no home_city
          const disabled = s.id === "city" && !currentUser.home_city;
          return (
            <button
              key={s.id}
              onClick={() => !disabled && setScope(s.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium border whitespace-nowrap transition-all"
              style={active ? PILL_ACTIVE : PILL_INACTIVE}
              disabled={disabled}
              title={disabled ? "Set your home city in settings to use this filter" : undefined}
            >
              <Icon size={13} />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Time range pills (conditional) */}
      {showTimeRange && (
        <div className="flex gap-2">
          {TIME_OPTIONS.map((t) => {
            const active = timeRange === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTimeRange(t.id)}
                className="px-3 py-1.5 rounded-xl text-xs font-mono font-medium border whitespace-nowrap transition-all"
                style={active ? PILL_ACTIVE : PILL_INACTIVE}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3 rounded-[14px] border border-[var(--card-border)]">
              <Skeleton className="w-8 h-6 rounded" />
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-3 w-20 rounded" />
              </div>
              <Skeleton className="h-5 w-16 rounded-lg" />
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          emoji="🏆"
          title="No one on the board yet"
          description={
            scope === "friends"
              ? "Add some friends and start checking in together."
              : scope === "city"
                ? "No one in your city has checked in yet. Be the first!"
                : "Start a session to get on the leaderboard."
          }
        />
      ) : (
        <>
          {/* Podium — top 3 with height hierarchy */}
          {entries.length >= 3 && (
            <LeaderboardPodium
              entries={entries}
              label={VALUE_LABELS[category]}
              currentUserId={currentUser.id}
            />
          )}

          {/* Remaining entries (4+), or all if < 3 */}
          <motion.div
            className="space-y-2"
            variants={stagger.container(0.04)}
            initial="initial"
            animate="animate"
          >
            {(entries.length >= 3 ? entries.slice(3) : entries).map((entry, i) => (
              <motion.div
                key={entry.profile.id}
                variants={stagger.item}
                transition={spring.default}
              >
                <LeaderboardRow
                  entry={entry}
                  label={VALUE_LABELS[category]}
                  currentUserId={currentUser.id}
                  index={i}
                />
              </motion.div>
            ))}
          </motion.div>
        </>
      )}

      {/* Sticky user rank card */}
      {!loading && userRank > 0 && (
        <div className="sticky bottom-4 z-10 pt-2">
          <Card
            padding="compact"
            className="border-[var(--accent-gold)]/30 shadow-lg shadow-black/20"
            style={{
              background: "color-mix(in srgb, var(--accent-gold) 8%, var(--surface))",
            } as React.CSSProperties}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)",
                  }}
                >
                  <Trophy size={16} style={{ color: "var(--accent-gold)" }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    Your rank: <span className="font-mono" style={{ color: "var(--accent-gold)" }}>#{userRank}</span>
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {formatCount(userValue)} {VALUE_LABELS[category]}
                  </p>
                </div>
              </div>
              <div
                className="px-3 py-1 rounded-lg text-xs font-mono font-bold"
                style={{
                  background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)",
                  color: "var(--accent-gold)",
                }}
              >
                #{userRank} of {entries.length}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
