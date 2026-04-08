"use client";

import { useMemo, type RefObject } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Beer, MapPin, Route, Gift, Star, Flame } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { StreakCard } from "@/components/ui/StreakCard";
import { BeerStyleBadge } from "@/components/ui/BeerStyleBadge";
import { getStyleFamily, getStyleVars } from "@/lib/beerStyleColors";
import { ActivityHeatmap } from "@/components/profile/ActivityHeatmap";
import { BeerDNACard } from "@/components/profile/BeerDNACard";
import { SessionCard } from "@/components/social/SessionCard";
import { CheckinCard } from "@/components/social/CheckinCard";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { getLevelProgress, LEVELS } from "@/lib/xp";
import { FeedCardSkeletons, FeedEndMessage } from "./FeedPaginationUI";
import type { Profile, Session } from "@/types/database";
import type { StyleDNAEntry, WishlistItem, UserAchievement } from "./HomeFeed";

/** Sprint 171: Your Round visible Sunday through Saturday of the reporting week */
function isYourRoundVisible(): boolean {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 6=Sat
  // Show all week — the content covers the previous 7 days and refreshes Sunday
  return day >= 0; // Always visible when there's data — the key gate is total_checkins > 0
  // NOTE: If Joshua wants it hidden mid-week, change to: return day === 0 || day === 1;
}

/** Sprint 171: Wrapped visible Dec 1 through Jan 31 only */
function isWrappedVisible(): boolean {
  const month = new Date().getMonth(); // 0=Jan, 11=Dec
  return month === 11 || month === 0; // December or January
}
import { useReactions } from "./ReactionContext";

export function YouTabContent({
  profile,
  sessions,
  weekStats: _weekStats,
  currentUserId,
  userAchievements,
  wishlist,
  styleDNA,
  loading,
  hasMore,
  sentinelRef,
  activityHeatmap,
  pastRoutes,
}: {
  profile: Profile | null;
  sessions: Session[];
  weekStats: { sessions: number; beers: number; uniqueBreweries: number };
  currentUserId: string;
  userAchievements?: UserAchievement[];
  wishlist?: WishlistItem[];
  styleDNA?: StyleDNAEntry[];
  loading?: boolean;
  hasMore?: boolean;
  sentinelRef?: RefObject<HTMLDivElement | null>;
  activityHeatmap?: { date: string; count: number }[];
  pastRoutes?: Array<{ id: string; title: string; location_city: string | null; completed_at: string | null; hop_route_stops: Array<{ brewery: { name: string } | null }> }>;
}) {
  const { reactionCounts, userReactions, commentCounts } = useReactions();
  const levelInfo = profile ? getLevelProgress(profile.xp) : null;

  const visitedBreweries = useMemo(() => {
    const seen = new Map<string, { id: string; name: string; city: string | null; state: string | null }>();
    for (const s of sessions) {
      const b = s.brewery;
      if (b && !seen.has(b.id)) seen.set(b.id, b);
    }
    return Array.from(seen.values());
  }, [sessions]);

  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* XP / Rank hero card */}
      {levelInfo && (() => {
        // Build 5 milestone ranks centered on current level
        const allLevels = LEVELS;
        const currentIdx = allLevels.findIndex(l => l.level === levelInfo.current.level);
        const startIdx = Math.max(0, Math.min(currentIdx - 2, allLevels.length - 5));
        const milestones = allLevels.slice(startIdx, startIdx + 5);
        // Progress across the 5-milestone window
        const windowStart = milestones[0].xp_required;
        const windowEnd = milestones[milestones.length - 1].xp_required;
        const windowProgress = windowEnd > windowStart
          ? Math.min(100, Math.max(2, Math.round(((profile.xp - windowStart) / (windowEnd - windowStart)) * 100)))
          : 100;

        return (
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
              {/* Header — avatar + level/rank left, next rank right */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <UserAvatar profile={profile} size="md" />
                  <div>
                    <p className="font-mono uppercase" style={{ fontSize: "9px", color: "var(--accent-gold)", letterSpacing: "0.08em" }}>
                      Level {profile.level}
                    </p>
                    <p className="font-sans font-bold" style={{ fontSize: "20px", color: "var(--text-primary)" }}>
                      {levelInfo.current.name}
                    </p>
                  </div>
                </div>
                {levelInfo.next && (
                  <div className="text-right">
                    <p className="font-mono uppercase" style={{ fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.08em" }}>
                      Next Rank
                    </p>
                    <p className="font-sans font-semibold" style={{ fontSize: "15px", color: "var(--text-primary)" }}>
                      {levelInfo.next.name}
                    </p>
                    <p className="font-mono font-semibold" style={{ fontSize: "11px", color: "var(--accent-gold)" }}>
                      {levelInfo.xpToNext} XP to go
                    </p>
                  </div>
                )}
              </div>

              {/* XP progress bar — represents position across 5 milestone window */}
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
                      fontWeight: m.level === levelInfo.current.level ? 700 : 400,
                      color: m.level === levelInfo.current.level ? "var(--text-primary)" : "var(--text-muted)",
                    }}
                  >
                    {m.name}
                  </span>
                ))}
              </div>

              {/* Streak row */}
              <div
                className="flex items-center justify-between pt-3"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <div className="flex items-center gap-2">
                  <Flame size={14} style={{ color: "var(--accent-gold)" }} />
                  <span className="font-mono" style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    {profile.current_streak ?? 0} day streak
                  </span>
                </div>
                <span className="font-mono" style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  Best: {profile.longest_streak ?? profile.current_streak ?? 0}d
                </span>
              </div>
            </div>
          </motion.div>
        );
      })()}

      {/* Stats — 3 cards + separate streak card */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={<Beer size={14} style={{ color: "var(--accent-gold)" }} />} value={profile.total_checkins} label="SESSIONS" />
        <StatCard icon={<Star size={14} style={{ color: "var(--accent-gold)" }} />} value={profile.unique_beers ?? 0} label="UNIQUE BEERS" />
        <StatCard icon={<MapPin size={14} style={{ color: "var(--accent-gold)" }} />} value={visitedBreweries.length || (profile.unique_breweries ?? 0)} label="BREWERIES" />
      </div>

      <StreakCard
        icon={<Flame size={20} style={{ color: "var(--accent-gold)" }} />}
        streak={profile.current_streak ?? 0}
        personalBest={profile.longest_streak ?? profile.current_streak ?? 0}
      />

      {/* Sprint 171: Your Round — only show on Sunday through Saturday of reporting week */}
      {profile.total_checkins > 0 && isYourRoundVisible() && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Link href="/your-round" className="block">
            <motion.div
              className="rounded-[14px] p-5 relative overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow"
              style={{
                background: "linear-gradient(135deg, rgba(232,132,26,0.10) 0%, rgba(232,132,26,0.03) 100%)",
                border: "1px solid rgba(232,132,26,0.20)",
              }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center gap-3.5 relative z-10">
                <div className="p-2.5 rounded-xl" style={{ background: "rgba(232,132,26,0.12)" }}>
                  <Gift size={16} style={{ color: "var(--accent-amber)" }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      Your Round, this week
                    </p>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(232,132,26,0.15)", color: "var(--accent-amber)" }}>NEW</span>
                  </div>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Last 7 days of pours, highlights, and top styles
                  </p>
                </div>
                <span className="text-xs font-mono" style={{ color: "var(--accent-amber)" }}>View</span>
              </div>
            </motion.div>
          </Link>
        </motion.div>
      )}

      {/* Sprint 171: Wrapped — only visible Dec 1 through Jan 31 */}
      {profile.total_checkins > 0 && isWrappedVisible() && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Link href="/wrapped" className="block">
            <motion.div
              className="rounded-[14px] p-5 relative overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow"
              style={{
                background: "linear-gradient(135deg, rgba(212,168,67,0.10) 0%, rgba(212,168,67,0.03) 100%)",
                border: "1px solid rgba(212,168,67,0.20)",
              }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {/* Sparkle particles */}
              {[0, 1, 2, 3, 4, 5].map(i => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: i % 2 === 0 ? 2.5 : 2,
                    height: i % 2 === 0 ? 2.5 : 2,
                    background: "var(--amber, var(--accent-gold))",
                    left: `${12 + i * 15}%`,
                    top: `${20 + (i * 11) % 60}%`,
                  }}
                  animate={{
                    opacity: [0, 0.7, 0],
                    scale: [0.5, 1.2, 0.5],
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 2 + (i % 3) * 0.6,
                    delay: i * 0.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}
              <div className="flex items-center gap-3.5 relative z-10">
                <div className="p-2.5 rounded-xl" style={{ background: "rgba(212,168,67,0.12)" }}>
                  <Gift size={16} style={{ color: "var(--accent-gold)" }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      Your Wrapped is ready
                    </p>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(212,168,67,0.15)", color: "var(--accent-gold)" }}>NEW</span>
                  </div>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    See your year in beer — stats, favorites, and personality
                  </p>
                </div>
                <span className="text-xs font-mono" style={{ color: "var(--accent-gold)" }}>View</span>
              </div>
            </motion.div>
          </Link>
        </motion.div>
      )}

      {/* Activity Heatmap */}
      {activityHeatmap && activityHeatmap.length > 0 && (
        <ActivityHeatmap data={activityHeatmap} />
      )}

      {/* Beer DNA */}
      {styleDNA && styleDNA.length >= 3 && profile.username && (
        <BeerDNACard styleDNA={styleDNA} username={profile.username} />
      )}

      {/* Recent achievements — radiating arcs treatment */}
      {userAchievements && userAchievements.length > 0 && (
        <div
          className="card-bg-achievement rounded-[14px] p-4 space-y-3 shadow-[var(--shadow-card)] border border-[var(--card-border)]"
        >
          <div className="flex items-center justify-between relative z-10">
            <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Recent Achievements
            </p>
            <Link href="/achievements" className="text-xs font-medium" style={{ color: "var(--accent-gold)" }}>
              View All
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide snap-x">
            {userAchievements.map((ua) => (
              <div key={ua.id} className="flex flex-col items-center gap-1.5 flex-shrink-0 w-16 snap-start">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ background: "color-mix(in srgb, var(--accent-gold) 10%, transparent)" }}
                >
                  {ua.achievement.icon}
                </div>
                <p
                  className="text-[10px] text-center leading-tight truncate w-full"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {ua.achievement.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Want to Try — 2-column grid */}
      {wishlist && wishlist.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Want to Try
            </p>
            <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
              {wishlist.length} saved
            </span>
          </div>
          <div className="grid grid-cols-2" style={{ gap: "10px" }}>
            {wishlist.slice(0, 6).map((item) => {
              if (!item.beer) return null;
              const sv = getStyleVars(item.beer.style);
              return (
                <Link key={item.id} href={`/beer/${item.beer.id}`}>
                  <div
                    className="rounded-[14px] flex items-center relative group"
                    style={{
                      padding: "14px",
                      gap: "10px",
                      background: `linear-gradient(135deg, color-mix(in srgb, ${sv.primary} 14%, var(--card-bg)), var(--card-bg))`,
                      border: `1px solid color-mix(in srgb, ${sv.primary} 12%, var(--border))`,
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = "";
                      (e.currentTarget as HTMLElement).style.boxShadow = "";
                    }}
                  >
                    {/* Thumbnail — style-tinted, glass SVG */}
                    <div
                      className="flex-shrink-0 flex items-center justify-center"
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "10px",
                        background: `color-mix(in srgb, ${sv.primary} 10%, var(--warm-bg))`,
                      }}
                    >
                      <svg
                        width={20}
                        height={20}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={sv.primary}
                        strokeWidth={1}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ opacity: 0.45 }}
                      >
                        <path d="M7 3h10l-1.5 15a2 2 0 0 1-2 1.8h-3a2 2 0 0 1-2-1.8L7 3z" />
                      </svg>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-sans font-semibold truncate"
                        style={{ fontSize: "13px", color: "var(--text-primary)" }}
                      >
                        {item.beer.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {item.beer.style && <BeerStyleBadge style={item.beer.style} size="xs" />}
                        {item.beer.brewery?.name && (
                          <span className="truncate" style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                            · {item.beer.brewery.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Remove button — hover reveal */}
                    <div
                      className="absolute flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      style={{
                        top: "8px",
                        right: "8px",
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        background: "var(--warm-bg)",
                        border: "1px solid var(--border)",
                        fontSize: "10px",
                        color: "var(--text-muted)",
                      }}
                    >
                      ×
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Brewery Passport */}
      {visitedBreweries.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Brewery Passport
            </p>
            <span className="text-[10px] font-mono" style={{ color: "var(--accent-gold)" }}>
              {visitedBreweries.length} visited
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {visitedBreweries.slice(0, 6).map((b) => (
              <Link key={b.id} href={`/brewery/${b.id}`} className="block">
                <div
                  className="card-bg-hoproute p-3 rounded-xl transition-[colors,shadow] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]"
                  style={{ border: "1px solid color-mix(in srgb, var(--accent-amber) 20%, var(--border))" }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">🍻</span>
                    <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                      {b.name}
                    </p>
                  </div>
                  {(b.city || b.state) && (
                    <p className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>
                      {[b.city, b.state].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
          {visitedBreweries.length > 6 && (
            <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
              +{visitedBreweries.length - 6} more in your passport
            </p>
          )}
        </div>
      )}

      {/* Past HopRoutes */}
      {pastRoutes && pastRoutes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Route size={15} style={{ color: "var(--accent-gold)" }} />
              <p className="text-xs font-mono uppercase tracking-widest" style={{ color: "var(--accent-gold)" }}>
                Past HopRoutes
              </p>
            </div>
            <Link href="/hop-route/new" className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
              Plan new →
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            {pastRoutes.slice(0, 3).map((route) => (
              <Link key={route.id} href={`/hop-route/${route.id}`} className="block">
                <motion.div
                  whileHover={{ x: 2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="card-bg-hoproute flex items-center gap-3 p-3 rounded-xl transition-[colors,shadow] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]"
                  style={{ border: "1px solid color-mix(in srgb, var(--accent-amber) 20%, var(--border))" }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "color-mix(in srgb, var(--accent-gold) 12%, transparent)", color: "var(--accent-gold)" }}>
                    🗺️
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{route.title}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {route.hop_route_stops.map(s => s.brewery?.name).filter(Boolean).join(" → ")}
                    </p>
                  </div>
                  {route.location_city && (
                    <span className="text-xs text-[var(--text-muted)] flex items-center gap-0.5 flex-shrink-0">
                      <MapPin size={9} /> {route.location_city}
                    </span>
                  )}
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Plan HopRoute CTA — same design as Discover tab */}
      {(!pastRoutes || pastRoutes.length === 0) && (
        <Link href="/hop-route/new" className="block">
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="rounded-[16px] overflow-hidden"
            style={{
              background: "linear-gradient(135deg, var(--warm-bg), var(--card-bg))",
              border: "1px solid var(--border)",
              padding: "20px",
            }}
          >
            <div className="flex items-center" style={{ gap: "16px" }}>
              <div
                className="flex-shrink-0 flex items-center justify-center rounded-[14px]"
                style={{
                  width: "52px",
                  height: "52px",
                  background: "linear-gradient(135deg, rgba(196,136,62,0.12), rgba(196,136,62,0.06))",
                  border: "1px solid rgba(196,136,62,0.15)",
                  fontSize: "24px",
                }}
              >
                🗺️
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center" style={{ gap: "5px", marginBottom: "2px" }}>
                  <span
                    className="rounded-full flex-shrink-0"
                    style={{ width: "5px", height: "5px", background: "var(--success, #4CAF50)" }}
                  />
                  <span
                    className="font-mono font-semibold uppercase"
                    style={{ fontSize: "9px", color: "var(--accent-gold)", letterSpacing: "0.12em" }}
                  >
                    New
                  </span>
                </div>
                <p className="font-sans font-semibold" style={{ fontSize: "17px", color: "var(--text-primary)" }}>
                  Plan a HopRoute
                </p>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
                  AI-powered brewery crawl planner. Tell us where and when — we build your night.
                </p>
              </div>
            </div>
          </motion.div>
        </Link>
      )}

      {/* Your activity */}
      <div className="space-y-3 !mt-10">
        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-[var(--border)] opacity-60" />
          <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            Your Activity
          </span>
          <div className="flex-1 border-t border-[var(--border)] opacity-60" />
        </div>

        {sessions.length > 0 ? (
          <div className="space-y-4">
            {sessions.map((s, i) => {
              const beerCount = (s as any).beer_logs?.length ?? 0;
              // 0 beers = minimal check-in row
              if (beerCount === 0) {
                return <CheckinCard key={s.id} session={s} index={i} />;
              }
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.28 }}
                >
                  <SessionCard
                    session={s}
                    currentUserId={currentUserId}
                    reactionCounts={reactionCounts?.[s.id]}
                    userReactions={userReactions?.[s.id]}
                    commentCount={commentCounts?.[s.id]}
                  />
                </motion.div>
              );
            })}

            {/* Pagination sentinel + status */}
            {loading && <FeedCardSkeletons count={3} />}
            {!hasMore && sessions.length >= 20 && <FeedEndMessage />}
            {sentinelRef && hasMore && !loading && (
              <div ref={sentinelRef} className="h-4" />
            )}
          </div>
        ) : (
          <div className="text-center py-10 space-y-4">
            <span className="text-5xl block">🍺</span>
            <div className="space-y-2">
              <h3 className="font-display text-[22px] font-bold tracking-[-0.01em]" style={{ color: "var(--text-primary)" }}>
                Time to crack one open.
              </h3>
              <p className="text-sm max-w-xs mx-auto leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Your session history will live here. Start a session to see the
                magic.
              </p>
            </div>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("hoptrack:open-checkin"))}
              className="inline-flex items-center gap-2 font-semibold text-sm px-5 py-3 rounded-xl transition-all"
              style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
            >
              <Beer size={15} />
              Start a Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
