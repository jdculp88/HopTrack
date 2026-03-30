"use client";

import { useMemo, type RefObject } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Beer, MapPin, Flame, Route } from "lucide-react";
import { ActivityHeatmap } from "@/components/profile/ActivityHeatmap";
import { SessionCard } from "@/components/social/SessionCard";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { getLevelProgress } from "@/lib/xp";
import { FeedLoadingSpinner, FeedEndMessage } from "./FeedPaginationUI";
import type { Profile, Session } from "@/types/database";
import type { StyleDNAEntry, WishlistItem, UserAchievement } from "./HomeFeed";
import { useReactions } from "./ReactionContext";

export function YouTabContent({
  profile,
  sessions,
  weekStats,
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

  if (!profile) return null;

  const visitedBreweries = useMemo(() => {
    const seen = new Map<string, { id: string; name: string; city: string | null; state: string | null }>();
    for (const s of sessions) {
      const b = s.brewery;
      if (b && !seen.has(b.id)) seen.set(b.id, b);
    }
    return Array.from(seen.values());
  }, [sessions]);

  const maxStyleCount = styleDNA && styleDNA.length > 0 ? styleDNA[0].count : 1;

  return (
    <div className="space-y-5">
      {/* Profile header */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
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
          <div className="space-y-1.5">
            <div
              className="flex items-center justify-between text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              <span>{profile.xp.toLocaleString()} XP</span>
              <span>{levelInfo.xpToNext} XP to Level {levelInfo.next.level}</span>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: "var(--surface-2)" }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${levelInfo.progress}%` }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(to right, var(--accent-gold), var(--accent-amber))",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2">
        {[
          {
            label: "Sessions",
            value: profile.total_checkins,
            icon: <Beer size={14} style={{ color: "var(--accent-gold)" }} />,
          },
          {
            label: "Beers",
            value: profile.unique_beers ?? 0,
            icon: <span className="text-sm">🍺</span>,
          },
          {
            label: "Breweries",
            value: visitedBreweries.length || (profile.unique_breweries ?? 0),
            icon: <MapPin size={14} style={{ color: "var(--accent-gold)" }} />,
          },
          {
            label: "Streak",
            value: profile.current_streak ?? 0,
            icon: <Flame size={14} style={{ color: "var(--accent-amber)" }} />,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-3 text-center"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex justify-center mb-1">{stat.icon}</div>
            <p className="text-lg font-bold font-mono" style={{ color: "var(--text-primary)" }}>
              {stat.value}
            </p>
            <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Activity Heatmap */}
      {activityHeatmap && activityHeatmap.length > 0 && (
        <div
          className="rounded-2xl p-4"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <ActivityHeatmap data={activityHeatmap} compact />
        </div>
      )}

      {/* Taste DNA */}
      {styleDNA && styleDNA.length >= 3 && (
        <div
          className="rounded-2xl p-4 space-y-3"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
              Your Taste DNA
            </p>
            <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
              based on {styleDNA.reduce((s, e) => s + e.count, 0)} beers
            </span>
          </div>
          <div className="space-y-2">
            {styleDNA.slice(0, 6).map((entry, i) => (
              <div key={entry.style} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {entry.style}
                  </span>
                  <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
                    {entry.count} {entry.count === 1 ? "beer" : "beers"}
                    {entry.avgRating ? ` · ★ ${entry.avgRating.toFixed(1)}` : ""}
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(entry.count / maxStyleCount) * 100}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}
                    className="h-full rounded-full"
                    style={{
                      background: i === 0
                        ? "linear-gradient(to right, var(--accent-gold), var(--accent-amber))"
                        : "color-mix(in srgb, var(--accent-gold) 50%, var(--surface-2))",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {styleDNA && styleDNA.length > 0 && styleDNA.length < 3 && (
        <div
          className="rounded-2xl p-4 text-center"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
            Your Taste DNA
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Keep logging beers to build your Taste DNA — needs 3+ styles.
          </p>
        </div>
      )}

      {/* Recent achievements */}
      {userAchievements && userAchievements.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Recent Achievements
            </p>
            <Link href="/achievements" className="text-xs font-medium" style={{ color: "var(--accent-gold)" }}>
              View All
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {userAchievements.map((ua) => (
              <div key={ua.id} className="flex flex-col items-center gap-1.5 flex-shrink-0 w-16">
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
          <div className="space-y-2">
            {wishlist.slice(0, 5).map((item) => (
              item.beer ? (
                <Link key={item.id} href={`/beer/${item.beer.id}`}>
                  <div
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: "color-mix(in srgb, var(--accent-gold) 8%, transparent)" }}
                    >
                      🍺
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                        {item.beer.name}
                      </p>
                      <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                        {item.beer.brewery?.name}
                        {item.beer.style ? ` · ${item.beer.style}` : ""}
                      </p>
                    </div>
                    {item.beer.abv && (
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
          <div className="grid grid-cols-2 gap-2">
            {visitedBreweries.slice(0, 6).map((b) => (
              <Link key={b.id} href={`/brewery/${b.id}`}>
                <div
                  className="p-3 rounded-xl"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
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
                  className="flex items-center gap-3 p-3 rounded-xl border transition-colors"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}
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
          <div className="flex items-center gap-3 p-4 rounded-2xl border border-dashed transition-colors" style={{ borderColor: "color-mix(in srgb, var(--accent-gold) 30%, transparent)" }}>
            <span className="text-2xl">🗺️</span>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Plan a HopRoute</p>
              <p className="text-xs text-[var(--text-muted)]">AI-powered brewery crawl planner</p>
            </div>
          </div>
        </Link>
      )}

      {/* Your activity */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            Your Activity
          </span>
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
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
            {loading && <FeedLoadingSpinner />}
            {!hasMore && sessions.length >= 20 && <FeedEndMessage />}
            {sentinelRef && hasMore && !loading && (
              <div ref={sentinelRef} className="h-4" />
            )}
          </div>
        ) : (
          <div className="text-center py-10 space-y-3">
            <span className="text-5xl block">🍻</span>
            <h3 className="font-display text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              Start your story
            </h3>
            <p className="text-sm max-w-xs mx-auto" style={{ color: "var(--text-muted)" }}>
              Your sessions, ratings, and achievements will appear here.
            </p>
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
