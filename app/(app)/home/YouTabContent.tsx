"use client";

import { useMemo, type RefObject } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Beer, MapPin, Route, Gift } from "lucide-react";
import { getStyleFamily, getStyleVars } from "@/lib/beerStyleColors";
import { ActivityHeatmap } from "@/components/profile/ActivityHeatmap";
import { BeerDNACard } from "@/components/profile/BeerDNACard";
import { SessionCard } from "@/components/social/SessionCard";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { getLevelProgress } from "@/lib/xp";
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
      {/* Profile header — pour fill hero card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="rounded-2xl p-5 relative overflow-hidden shadow-[var(--shadow-elevated)] border border-[var(--card-border)]"
        style={{
          background: "var(--card-bg)",
        }}
      >
        {/* Pour fill — rises from bottom, represents XP progress */}
        {levelInfo && (
          <motion.div
            initial={{ height: "0%" }}
            animate={{ height: `${Math.max(levelInfo.progress, 6)}%` }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            className="absolute bottom-0 left-0 right-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, color-mix(in srgb, var(--accent-gold) 22%, transparent) 0%, color-mix(in srgb, var(--accent-amber) 6%, transparent) 100%)",
            }}
          />
        )}

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <UserAvatar profile={profile} size="lg" showLevel />
            <div className="flex-1 min-w-0">
              <h1
                className="font-display text-xl font-bold leading-tight"
                style={{ color: "var(--text-primary)" }}
              >
                {profile.display_name ?? profile.username}
              </h1>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {levelInfo?.current.name} · Level {profile.level}
              </p>
            </div>
            <Link
              href={`/profile/${profile.username}`}
              className="text-xs font-medium px-3 py-1.5 rounded-lg"
              style={{
                background: "var(--surface-2)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              Profile
            </Link>
          </div>
          {levelInfo && levelInfo.next && (
            <>
              {/* Sprint 171: Thicker XP bar with glow */}
              <div className="h-2 rounded-full overflow-hidden mb-2" style={{ background: "color-mix(in srgb, var(--surface-3) 60%, transparent)" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(levelInfo.progress, 3)}%` }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
                  className="h-full rounded-full"
                  style={{
                    background: "linear-gradient(90deg, var(--accent-gold), var(--accent-amber))",
                    boxShadow: "0 0 8px rgba(212,168,67,0.3)",
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono" style={{ color: "var(--text-muted)" }}>
                  {profile.xp.toLocaleString()} XP
                </span>
                <span className="text-[11px] font-mono" style={{ color: "var(--text-muted)" }}>
                  {levelInfo.xpToNext} to Level {(levelInfo.next as any).level}
                </span>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Stats card — grid lines treatment */}
      {/* Sprint 171: Color-differentiated stats */}
      <div
        className="card-bg-stats rounded-2xl p-4 shadow-[var(--shadow-card)] border border-[var(--card-border)]"
      >
        <p className="text-[10px] font-mono uppercase tracking-widest mb-3 relative z-10" style={{ color: "var(--text-muted)" }}>
          Your Numbers
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
          <div className="text-center rounded-2xl py-3 px-1" style={{ background: "color-mix(in srgb, var(--accent-blue) 8%, var(--card-bg))" }}>
            <p className="font-mono font-bold text-xl leading-none" style={{ color: "var(--accent-blue)" }}>{profile.total_checkins}</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-1 font-mono uppercase tracking-wide">Sessions</p>
          </div>
          <div className="text-center rounded-2xl py-3 px-1" style={{ background: "color-mix(in srgb, var(--accent-amber) 8%, var(--card-bg))" }}>
            <p className="font-mono font-bold text-xl leading-none" style={{ color: "var(--accent-amber)" }}>{profile.unique_beers ?? 0}</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-1 font-mono uppercase tracking-wide">Unique Beers</p>
          </div>
          <div className="text-center rounded-2xl py-3 px-1" style={{ background: "color-mix(in srgb, var(--accent-green) 8%, var(--card-bg))" }}>
            <p className="font-mono font-bold text-xl leading-none" style={{ color: "var(--success)" }}>{visitedBreweries.length || (profile.unique_breweries ?? 0)}</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-1 font-mono uppercase tracking-wide">Breweries</p>
          </div>
          <div className="text-center rounded-2xl py-3 px-1" style={{ background: `color-mix(in srgb, ${(profile.current_streak ?? 0) > 0 ? "var(--accent-amber)" : "var(--accent-gold)"} 8%, var(--card-bg))` }}>
            <p className="font-mono font-bold text-xl leading-none" style={{ color: (profile.current_streak ?? 0) > 0 ? "var(--accent-amber)" : "var(--accent-gold)" }}>{profile.current_streak ?? 0}</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-1 font-mono uppercase tracking-wide">Day Streak</p>
          </div>
        </div>
      </div>

      {/* Sprint 171: Your Round — only show on Sunday through Saturday of reporting week */}
      {profile.total_checkins > 0 && isYourRoundVisible() && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Link href="/your-round" className="block">
            <motion.div
              className="rounded-2xl p-5 relative overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow"
              style={{
                background: "linear-gradient(135deg, rgba(232,132,26,0.10) 0%, rgba(232,132,26,0.03) 100%)",
                border: "1px solid rgba(232,132,26,0.20)",
              }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center gap-3.5 relative z-10">
                <div className="p-2.5 rounded-xl" style={{ background: "rgba(232,132,26,0.12)" }}>
                  <Gift size={18} style={{ color: "var(--accent-amber)" }} />
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
              className="rounded-2xl p-5 relative overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow"
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
                    background: "#D4A843",
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
                  <Gift size={18} style={{ color: "var(--accent-gold)" }} />
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
        <div
          className="card-bg-stats rounded-2xl p-4 shadow-[var(--shadow-card)] border border-[var(--card-border)]"
        >
          <p className="text-[10px] font-mono uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
            Activity
          </p>
          <ActivityHeatmap data={activityHeatmap} compact />
        </div>
      )}

      {/* Beer DNA */}
      {styleDNA && styleDNA.length >= 3 && profile.username && (
        <BeerDNACard styleDNA={styleDNA} username={profile.username} />
      )}

      {/* Recent achievements — radiating arcs treatment */}
      {userAchievements && userAchievements.length > 0 && (
        <div
          className="card-bg-achievement rounded-2xl p-4 space-y-3 shadow-[var(--shadow-card)] border border-[var(--card-border)]"
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

      {/* Want to Try */}
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
          <div className="space-y-5">
            {wishlist.slice(0, 5).map((item) => (
              item.beer ? (
                <Link key={item.id} href={`/beer/${item.beer.id}`}>
                  <div
                    className="card-bg-reco flex items-center gap-3 p-3.5 rounded-xl transition-all shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:scale-[1.01]"
                    data-style={getStyleFamily(item.beer.style)}
                    style={{
                      border: "1px solid var(--card-border)",
                      borderLeft: `3px solid ${getStyleVars(item.beer.style).primary}`,
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${getStyleVars(item.beer.style).light}, ${getStyleVars(item.beer.style).soft ?? getStyleVars(item.beer.style).light})` }}
                    >
                      🍺
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                        {item.beer.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                          {item.beer.brewery?.name}
                        </span>
                        {item.beer.style && (
                          <span
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded-full"
                            style={{
                              background: `color-mix(in srgb, ${getStyleVars(item.beer.style).primary} 15%, transparent)`,
                              color: getStyleVars(item.beer.style).primary,
                            }}
                          >
                            {item.beer.style}
                          </span>
                        )}
                      </div>
                    </div>
                    {item.beer.abv != null && (
                      <span className="text-xs font-mono flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                        {item.beer.abv}%
                      </span>
                    )}
                  </div>
                </Link>
              ) : null
            ))}
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
          <div className="grid grid-cols-2 gap-3">
            {visitedBreweries.slice(0, 6).map((b) => (
              <Link key={b.id} href={`/brewery/${b.id}`}>
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
          <div className="space-y-2">
            {pastRoutes.slice(0, 3).map((route) => (
              <Link key={route.id} href={`/hop-route/${route.id}`}>
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

      {/* Plan HopRoute CTA if no past routes */}
      {(!pastRoutes || pastRoutes.length === 0) && (
        <Link href="/hop-route/new">
          <div className="card-bg-hoproute flex items-center gap-3 p-4 rounded-2xl border transition-[colors,shadow] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]" style={{ borderColor: "color-mix(in srgb, var(--accent-amber) 35%, var(--border))" }}>
            <span className="text-2xl">🗺️</span>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Plan a HopRoute</p>
              <p className="text-xs text-[var(--text-muted)]">AI-powered brewery crawl planner</p>
            </div>
          </div>
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
            {sessions.map((s, i) => (
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
            ))}

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
              <h3 className="font-display text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
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
