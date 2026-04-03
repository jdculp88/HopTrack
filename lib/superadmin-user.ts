/**
 * Superadmin User Detail — data fetching engine
 * Sprint 142 — The Superadmin II
 *
 * Accepts a Supabase service client and returns all data needed
 * for the consumer account detail page. Mirrors the pattern in
 * lib/superadmin-brewery.ts — single Promise.all, typed result.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  calculateDrinkerKPIs,
  type DrinkerKPIs,
} from "@/lib/kpi";
import {
  computeSegment,
  getSegmentConfig,
  computeEngagementScore,
  getEngagementLevel,
  type CustomerSegment,
  type SegmentConfig,
} from "@/lib/crm";

// ── Types ──────────────────────────────────────────────────────────────

export type ChurnRiskLevel = "green" | "amber" | "red";

export interface ChurnRisk {
  level: ChurnRiskLevel;
  label: string;
  daysSinceLastSession: number | null;
}

export interface LifecycleStage {
  id: string;
  label: string;
  reached: boolean;
}

export interface UserActivityEvent {
  id: string;
  type: "session" | "achievement" | "reaction" | "comment" | "follow";
  title: string;
  detail: string | null;
  timestamp: string;
  icon: string; // emoji
}

export interface UserSessionRow {
  id: string;
  breweryName: string;
  breweryId: string | null;
  startedAt: string;
  duration: number | null; // minutes
  beerCount: number;
  avgRating: number | null;
}

export interface SessionHeatmapDay {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface TopStyle {
  name: string;
  count: number;
  pct: number;
}

export interface BreweryAffinity {
  breweryId: string;
  breweryName: string;
  city: string | null;
  state: string | null;
  visits: number;
  lastVisit: string | null;
  avgRating: number | null;
  hasLoyaltyCard: boolean;
}

export interface AdminNote {
  id: string;
  content: string;
  adminName: string | null;
  updatedAt: string;
}

export interface UserDetailData {
  profile: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    banner_url: string | null;
    bio: string | null;
    email: string | null;
    home_city: string | null;
    total_checkins: number;
    unique_beers: number;
    unique_breweries: number;
    level: number;
    xp: number;
    current_streak: number;
    longest_streak: number;
    is_public: boolean;
    is_superadmin: boolean;
    created_at: string;
    last_session_date: string | null;
    notification_preferences: Record<string, boolean> | null;
    share_live: boolean | null;
  };
  segment: CustomerSegment;
  segmentConfig: SegmentConfig;
  engagementScore: number;
  engagementLevel: string;
  churnRisk: ChurnRisk;
  lifecycle: LifecycleStage[];
  kpis: DrinkerKPIs;
  engagementSparkline: number[]; // 30 daily session counts
  topStyles: TopStyle[];
  recentActivity: UserActivityEvent[];
  sessions: UserSessionRow[];
  sessionHeatmap: SessionHeatmapDay[];
  breweryAffinities: BreweryAffinity[];
  adminNotes: AdminNote[];
  adminTags: string[];
  totalSessions: number;
  totalFriends: number;
  totalReactions: number;
  totalComments: number;
  totalAchievements: number;
  totalPossibleAchievements: number;
}

// ── Helpers ────────────────────────────────────────────────────────────

function computeChurnRisk(lastSessionDate: string | null): ChurnRisk {
  if (!lastSessionDate) {
    return { level: "red", label: "No sessions", daysSinceLastSession: null };
  }
  const days = Math.floor(
    (Date.now() - new Date(lastSessionDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (days <= 14) return { level: "green", label: "Active", daysSinceLastSession: days };
  if (days <= 45) return { level: "amber", label: "At Risk", daysSinceLastSession: days };
  return { level: "red", label: "Churned", daysSinceLastSession: days };
}

function computeLifecycle(
  sessionCount: number,
  friendCount: number,
  reactionCount: number
): LifecycleStage[] {
  return [
    { id: "signed_up", label: "Signed Up", reached: true },
    { id: "first_session", label: "First Session", reached: sessionCount >= 1 },
    { id: "repeat", label: "Repeat", reached: sessionCount >= 3 },
    { id: "loyal", label: "Loyal", reached: sessionCount >= 10 },
    {
      id: "advocate",
      label: "Advocate",
      reached: sessionCount >= 10 && (friendCount >= 3 || reactionCount >= 10),
    },
  ];
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function buildDailyBuckets(dates: string[], days: number): number[] {
  const now = new Date();
  const counts: Record<string, number> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - (days - 1 - i));
    counts[toDateKey(d)] = 0;
  }
  for (const date of dates) {
    const key = date.slice(0, 10);
    if (key in counts) counts[key]++;
  }
  return Object.values(counts);
}

function buildSessionHeatmap(sessionDates: string[]): SessionHeatmapDay[] {
  const now = new Date();
  const result: SessionHeatmapDay[] = [];
  const counts: Record<string, number> = {};

  // Build 365-day map
  for (let i = 364; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = toDateKey(d);
    counts[key] = 0;
  }

  for (const date of sessionDates) {
    const key = date.slice(0, 10);
    if (key in counts) counts[key]++;
  }

  for (const [date, count] of Object.entries(counts)) {
    result.push({ date, count });
  }

  return result;
}

// ── Main fetch function ────────────────────────────────────────────────

export async function fetchUserDetail(
  service: SupabaseClient,
  userId: string
): Promise<UserDetailData | null> {
  // ── Parallel fetch (15 queries) ──────────────────────────────────────
  const [
    { data: profile },
    { data: allSessions },
    { data: allBeerLogs },
    { count: friendCount },
    { data: achievements },
    { count: totalAchievementCount },
    { count: reactionCount },
    { count: commentCount },
    { data: follows },
    { data: loyaltyCards },
    { data: adminNotesRaw },
    { data: adminTagsRaw },
    { data: recentReactions },
    { data: recentComments },
    { data: breweryVisits },
  ] = await Promise.all([
    // 1. Profile full row
    service
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle() as any,

    // 2. Sessions with brewery join
    service
      .from("sessions")
      .select("id, brewery_id, started_at, ended_at, is_active, brewery:breweries(id, name, city, state)")
      .eq("user_id", userId)
      .eq("is_active", false)
      .order("started_at", { ascending: false })
      .limit(5000) as any,

    // 3. Beer logs with beer join
    service
      .from("beer_logs")
      .select("id, beer_id, session_id, brewery_id, rating, quantity, logged_at, comment, beer:beers(id, name, style, abv)")
      .eq("user_id", userId)
      .limit(10000) as any,

    // 4. Friendships count (both directions)
    service
      .from("friendships")
      .select("id", { count: "exact", head: true })
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      .eq("status", "accepted") as any,

    // 5. User achievements
    service
      .from("user_achievements")
      .select("id, unlocked_at, achievement:achievements(id, name, icon)")
      .eq("user_id", userId)
      .order("unlocked_at", { ascending: false })
      .limit(200) as any,

    // 6. Total possible achievements
    service
      .from("achievements")
      .select("id", { count: "exact", head: true }) as any,

    // 7. Reactions count
    service
      .from("reactions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId) as any,

    // 8. Comments count
    service
      .from("session_comments")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId) as any,

    // 9. Brewery follows
    service
      .from("brewery_follows")
      .select("brewery_id, created_at")
      .eq("user_id", userId) as any,

    // 10. Loyalty cards
    service
      .from("loyalty_cards")
      .select("brewery_id, stamps_earned")
      .eq("user_id", userId) as any,

    // 11. Admin notes with admin profile
    service
      .from("admin_user_notes")
      .select("id, content, admin_user_id, updated_at, created_at, admin:profiles!admin_user_id(display_name)")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(10) as any,

    // 12. Admin tags
    service
      .from("admin_user_tags")
      .select("tag")
      .eq("user_id", userId) as any,

    // 13. Recent reactions (for activity feed)
    service
      .from("reactions")
      .select("id, session_id, emoji, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20) as any,

    // 14. Recent comments (for activity feed)
    service
      .from("session_comments")
      .select("id, session_id, content, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20) as any,

    // 15. Brewery visits with brewery join
    service
      .from("brewery_visits")
      .select("brewery_id, total_visits, last_visited_at, brewery:breweries(id, name, city, state)")
      .eq("user_id", userId)
      .order("total_visits", { ascending: false }) as any,
  ]);

  if (!profile) return null;

  // ── Safe casts ──────────────────────────────────────────────────────
  const sessions = (allSessions as any[]) ?? [];
  const beerLogs = (allBeerLogs as any[]) ?? [];
  const friendsTotal = friendCount ?? 0;
  const achievementList = (achievements as any[]) ?? [];
  const totalAchievements = totalAchievementCount ?? 0;
  const reactionsTotal = reactionCount ?? 0;
  const commentsTotal = commentCount ?? 0;
  const followsList = (follows as any[]) ?? [];
  const loyaltyCardsList = (loyaltyCards as any[]) ?? [];
  const visits = (breweryVisits as any[]) ?? [];

  // ── Segment + Engagement ────────────────────────────────────────────
  const totalCheckins = profile.total_checkins ?? 0;
  const segment = computeSegment(totalCheckins);
  const segmentConfig = getSegmentConfig(totalCheckins);

  const engagementScore = computeEngagementScore({
    visits: totalCheckins,
    lastVisitDate: profile.last_session_date,
    beersLogged: beerLogs.length,
    avgRating: null, // platform-wide, not brewery-specific
    hasLoyaltyCard: loyaltyCardsList.length > 0,
    isFollowing: followsList.length > 0,
  });
  const engagementLevel = getEngagementLevel(engagementScore);

  // ── Churn risk ──────────────────────────────────────────────────────
  const churnRisk = computeChurnRisk(profile.last_session_date);

  // ── Lifecycle ───────────────────────────────────────────────────────
  const lifecycle = computeLifecycle(sessions.length, friendsTotal, reactionsTotal);

  // ── Drinker KPIs ────────────────────────────────────────────────────
  const breweryMap = visits.map((v: any) => ({
    id: v.brewery_id,
    city: v.brewery?.city ?? null,
    state: v.brewery?.state ?? null,
  }));

  const kpis = calculateDrinkerKPIs({
    sessions,
    beerLogs,
    breweries: breweryMap,
    friendCount: friendsTotal,
    reactionCount: reactionsTotal,
    commentCount: commentsTotal,
    achievementCount: achievementList.length,
    totalAchievements,
  });

  // ── 30-day sparkline ────────────────────────────────────────────────
  const engagementSparkline = buildDailyBuckets(
    sessions.map((s: any) => s.started_at),
    30
  );

  // ── Top styles ──────────────────────────────────────────────────────
  const styleCounts: Record<string, number> = {};
  for (const log of beerLogs) {
    const style = log.beer?.style;
    if (style) styleCounts[style] = (styleCounts[style] ?? 0) + (log.quantity ?? 1);
  }
  const totalPours = beerLogs.reduce((sum: number, l: any) => sum + (l.quantity ?? 1), 0);
  const topStyles: TopStyle[] = Object.entries(styleCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({
      name,
      count,
      pct: totalPours > 0 ? Math.round((count / totalPours) * 100) : 0,
    }));

  // ── Activity feed (merge + sort) ────────────────────────────────────
  const activity: UserActivityEvent[] = [];

  // Sessions (last 30)
  for (const s of sessions.slice(0, 30)) {
    const breweryName = s.brewery?.name ?? "Unknown brewery";
    const logCount = beerLogs.filter((l: any) => l.session_id === s.id).length;
    activity.push({
      id: `session-${s.id}`,
      type: "session",
      title: `Session at ${breweryName}`,
      detail: logCount > 0 ? `${logCount} beer${logCount > 1 ? "s" : ""} logged` : null,
      timestamp: s.started_at,
      icon: "🍺",
    });
  }

  // Achievements
  for (const a of achievementList.slice(0, 20)) {
    activity.push({
      id: `achievement-${a.id}`,
      type: "achievement",
      title: `Unlocked "${a.achievement?.name ?? "Achievement"}"`,
      detail: null,
      timestamp: a.unlocked_at,
      icon: a.achievement?.icon ?? "🏆",
    });
  }

  // Reactions
  for (const r of (recentReactions as any[]) ?? []) {
    activity.push({
      id: `reaction-${r.id}`,
      type: "reaction",
      title: `Reacted ${r.emoji ?? "👍"} to a session`,
      detail: null,
      timestamp: r.created_at,
      icon: r.emoji ?? "👍",
    });
  }

  // Comments
  for (const c of (recentComments as any[]) ?? []) {
    activity.push({
      id: `comment-${c.id}`,
      type: "comment",
      title: "Left a comment",
      detail: c.content ? (c.content.length > 80 ? c.content.slice(0, 80) + "…" : c.content) : null,
      timestamp: c.created_at,
      icon: "💬",
    });
  }

  // Sort by timestamp descending, take 50
  activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const recentActivity = activity.slice(0, 50);

  // ── Session rows ────────────────────────────────────────────────────
  const sessionRows: UserSessionRow[] = sessions.slice(0, 200).map((s: any) => {
    const sessionLogs = beerLogs.filter((l: any) => l.session_id === s.id);
    const ratings = sessionLogs.filter((l: any) => l.rating && l.rating > 0).map((l: any) => l.rating);
    const avgRating = ratings.length > 0
      ? Math.round((ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length) * 10) / 10
      : null;
    const duration = s.ended_at
      ? Math.round((new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) / 60000)
      : null;

    return {
      id: s.id,
      breweryName: s.brewery?.name ?? "Unknown",
      breweryId: s.brewery_id,
      startedAt: s.started_at,
      duration: duration && duration > 0 && duration < 720 ? duration : null,
      beerCount: sessionLogs.length,
      avgRating,
    };
  });

  // ── Session heatmap (365 days) ──────────────────────────────────────
  const sessionHeatmap = buildSessionHeatmap(
    sessions.map((s: any) => s.started_at)
  );

  // ── Brewery affinities ──────────────────────────────────────────────
  const loyaltyBreweryIds = new Set(loyaltyCardsList.map((c: any) => c.brewery_id));

  // Build per-brewery rating averages from beer logs
  const breweryRatings: Record<string, number[]> = {};
  for (const log of beerLogs) {
    if (log.brewery_id && log.rating && log.rating > 0) {
      if (!breweryRatings[log.brewery_id]) breweryRatings[log.brewery_id] = [];
      breweryRatings[log.brewery_id].push(log.rating);
    }
  }

  const breweryAffinities: BreweryAffinity[] = visits.map((v: any) => {
    const ratings = breweryRatings[v.brewery_id] ?? [];
    const avg = ratings.length > 0
      ? Math.round((ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length) * 10) / 10
      : null;

    return {
      breweryId: v.brewery_id,
      breweryName: v.brewery?.name ?? "Unknown",
      city: v.brewery?.city ?? null,
      state: v.brewery?.state ?? null,
      visits: v.total_visits ?? 0,
      lastVisit: v.last_visited_at ?? null,
      avgRating: avg,
      hasLoyaltyCard: loyaltyBreweryIds.has(v.brewery_id),
    };
  });

  // ── Admin notes ─────────────────────────────────────────────────────
  const adminNotes: AdminNote[] = ((adminNotesRaw as any[]) ?? []).map((n: any) => ({
    id: n.id,
    content: n.content,
    adminName: n.admin?.display_name ?? null,
    updatedAt: n.updated_at,
  }));

  const adminTags = ((adminTagsRaw as any[]) ?? []).map((t: any) => t.tag as string);

  return {
    profile: {
      id: profile.id,
      username: profile.username,
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
      banner_url: profile.banner_url ?? null,
      bio: profile.bio,
      email: profile.email ?? null,
      home_city: profile.home_city,
      total_checkins: totalCheckins,
      unique_beers: profile.unique_beers ?? 0,
      unique_breweries: profile.unique_breweries ?? 0,
      level: profile.level ?? 1,
      xp: profile.xp ?? 0,
      current_streak: profile.current_streak ?? 0,
      longest_streak: profile.longest_streak ?? 0,
      is_public: profile.is_public ?? true,
      is_superadmin: profile.is_superadmin ?? false,
      created_at: profile.created_at,
      last_session_date: profile.last_session_date,
      notification_preferences: profile.notification_preferences ?? null,
      share_live: profile.share_live ?? null,
    },
    segment,
    segmentConfig,
    engagementScore,
    engagementLevel,
    churnRisk,
    lifecycle,
    kpis,
    engagementSparkline,
    topStyles,
    recentActivity,
    sessions: sessionRows,
    sessionHeatmap,
    breweryAffinities,
    adminNotes,
    adminTags,
    totalSessions: sessions.length,
    totalFriends: friendsTotal,
    totalReactions: reactionsTotal,
    totalComments: commentsTotal,
    totalAchievements: achievementList.length,
    totalPossibleAchievements: totalAchievements,
  };
}
