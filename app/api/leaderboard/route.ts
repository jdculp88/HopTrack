/**
 * GET /api/leaderboard — Sprint 157 (The Engagement Engine)
 *
 * Multi-category leaderboard with scope and time range support.
 * Categories: xp, checkins, styles, breweries, streak
 * Scopes: global, friends, city
 * Time ranges: week, month, all
 */

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/api-helpers";
import { apiSuccess, apiUnauthorized, apiServerError } from "@/lib/api-response";
import { parseSearchParams } from "@/lib/schemas";
import { leaderboardQuerySchema } from "@/lib/schemas/leaderboard";
import { rateLimitResponse } from "@/lib/rate-limit";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getTimeRangeStart(timeRange: "week" | "month" | "all"): string | null {
  if (timeRange === "all") return null;
  const now = new Date();
  if (timeRange === "week") {
    const start = new Date(now);
    start.setDate(start.getDate() - 7);
    start.setHours(0, 0, 0, 0);
    return start.toISOString();
  }
  // month
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return start.toISOString();
}

async function getFriendIds(supabase: any, userId: string): Promise<string[]> {
  const { data: friends } = await supabase
    .from("friends")
    .select("user_id, friend_id")
    .eq("status", "accepted")
    .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
    .limit(500) as any;

  if (!friends || friends.length === 0) return [userId];

  const ids = new Set<string>([userId]);
  for (const f of friends) {
    ids.add(f.user_id === userId ? f.friend_id : f.user_id);
  }
  return Array.from(ids);
}

// ─── Category Query Builders ──────────────────────────────────────────────────

async function queryXP(
  supabase: any,
  limit: number,
  scopeFilter: string[] | null
) {
  let query = supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, level, xp, current_streak")
    .order("xp", { ascending: false })
    .gt("xp", 0)
    .limit(limit);

  if (scopeFilter) {
    query = query.in("id", scopeFilter);
  }

  const { data, error } = await query as any;
  if (error) throw error;

  return (data ?? []).map((p: any, i: number) => ({
    profile: {
      id: p.id,
      username: p.username,
      display_name: p.display_name,
      avatar_url: p.avatar_url,
      level: p.level ?? 1,
    },
    rank: i + 1,
    value: p.xp ?? 0,
    label: "XP",
  }));
}

async function queryCheckins(
  supabase: any,
  limit: number,
  timeStart: string | null,
  scopeFilter: string[] | null
) {
  let query = supabase
    .from("sessions")
    .select("user_id, profile:profiles!sessions_user_id_fkey(id, username, display_name, avatar_url, level)")
    .eq("is_active", false);

  if (timeStart) {
    query = query.gte("started_at", timeStart);
  }
  if (scopeFilter) {
    query = query.in("user_id", scopeFilter);
  }

  // Cap query to avoid PostgREST limits
  query = query.limit(10000);

  const { data, error } = await query as any;
  if (error) throw error;

  // Aggregate counts per user
  const countMap = new Map<string, { count: number; profile: any }>();
  for (const row of data ?? []) {
    const uid = row.user_id;
    const existing = countMap.get(uid);
    if (existing) {
      existing.count += 1;
    } else {
      countMap.set(uid, { count: 1, profile: row.profile });
    }
  }

  return Array.from(countMap.entries())
    .map(([, { count, profile }]) => ({
      profile: {
        id: profile?.id,
        username: profile?.username,
        display_name: profile?.display_name,
        avatar_url: profile?.avatar_url,
        level: profile?.level ?? 1,
      },
      value: count,
      label: "check-ins",
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
    .map((entry, i) => ({ ...entry, rank: i + 1 }));
}

async function queryStyles(
  supabase: any,
  limit: number,
  timeStart: string | null,
  scopeFilter: string[] | null
) {
  let query = supabase
    .from("beer_logs")
    .select("user_id, beer:beers!beer_logs_beer_id_fkey(style), session:sessions!beer_logs_session_id_fkey(started_at)")
    .not("beer.style", "is", null);

  if (scopeFilter) {
    query = query.in("user_id", scopeFilter);
  }

  query = query.limit(10000);

  const { data, error } = await query as any;
  if (error) throw error;

  // Filter by time range on session.started_at (join-level filtering)
  const filtered = timeStart
    ? (data ?? []).filter((r: any) => r.session?.started_at && r.session.started_at >= timeStart)
    : (data ?? []);

  // Count distinct styles per user
  const styleMap = new Map<string, Set<string>>();
  for (const row of filtered) {
    const uid = row.user_id;
    const style = row.beer?.style;
    if (!style) continue;
    if (!styleMap.has(uid)) styleMap.set(uid, new Set());
    styleMap.get(uid)!.add(style);
  }

  // Need profiles for display — fetch unique user IDs
  const userIds = Array.from(styleMap.keys());
  if (userIds.length === 0) return [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, level")
    .in("id", userIds) as any;

  const profileMap = new Map<string, any>();
  for (const p of profiles ?? []) {
    profileMap.set(p.id, p);
  }

  return userIds
    .map((uid) => ({
      profile: profileMap.get(uid) ?? { id: uid, username: "unknown", display_name: null, avatar_url: null, level: 1 },
      value: styleMap.get(uid)!.size,
      label: "styles",
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
    .map((entry, i) => ({ ...entry, rank: i + 1 }));
}

async function queryBreweries(
  supabase: any,
  limit: number,
  timeStart: string | null,
  scopeFilter: string[] | null
) {
  let query = supabase
    .from("sessions")
    .select("user_id, brewery_id")
    .eq("is_active", false)
    .not("brewery_id", "is", null);

  if (timeStart) {
    query = query.gte("started_at", timeStart);
  }
  if (scopeFilter) {
    query = query.in("user_id", scopeFilter);
  }

  query = query.limit(10000);

  const { data, error } = await query as any;
  if (error) throw error;

  // Count distinct breweries per user
  const breweryMap = new Map<string, Set<string>>();
  for (const row of data ?? []) {
    const uid = row.user_id;
    if (!breweryMap.has(uid)) breweryMap.set(uid, new Set());
    breweryMap.get(uid)!.add(row.brewery_id);
  }

  const userIds = Array.from(breweryMap.keys());
  if (userIds.length === 0) return [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, level")
    .in("id", userIds) as any;

  const profileMap = new Map<string, any>();
  for (const p of profiles ?? []) {
    profileMap.set(p.id, p);
  }

  return userIds
    .map((uid) => ({
      profile: profileMap.get(uid) ?? { id: uid, username: "unknown", display_name: null, avatar_url: null, level: 1 },
      value: breweryMap.get(uid)!.size,
      label: "breweries",
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
    .map((entry, i) => ({ ...entry, rank: i + 1 }));
}

async function queryStreak(
  supabase: any,
  limit: number,
  scopeFilter: string[] | null
) {
  let query = supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, level, current_streak")
    .order("current_streak", { ascending: false })
    .gt("current_streak", 0)
    .limit(limit);

  if (scopeFilter) {
    query = query.in("id", scopeFilter);
  }

  const { data, error } = await query as any;
  if (error) throw error;

  return (data ?? []).map((p: any, i: number) => ({
    profile: {
      id: p.id,
      username: p.username,
      display_name: p.display_name,
      avatar_url: p.avatar_url,
      level: p.level ?? 1,
    },
    rank: i + 1,
    value: p.current_streak ?? 0,
    label: "day streak",
  }));
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const limited = rateLimitResponse(request, "leaderboard", { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  const supabase = await createClient();
  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  const parsed = parseSearchParams(request, leaderboardQuerySchema);
  if (parsed.error) return parsed.error;

  const { category, scope, timeRange, limit } = parsed.data;

  try {
    // Build scope filter (list of user IDs to include)
    let scopeFilter: string[] | null = null;

    if (scope === "friends") {
      scopeFilter = await getFriendIds(supabase as any, user.id);
    } else if (scope === "city") {
      const { data: myProfile } = await (supabase as any)
        .from("profiles")
        .select("home_city")
        .eq("id", user.id)
        .single();

      if (myProfile?.home_city) {
        const { data: cityProfiles } = await (supabase as any)
          .from("profiles")
          .select("id")
          .eq("home_city", myProfile.home_city)
          .limit(1000);

        scopeFilter = (cityProfiles ?? []).map((p: any) => p.id);
      }
    }

    const timeStart = getTimeRangeStart(timeRange);

    // Query by category
    let entries: any[];
    switch (category) {
      case "xp":
        entries = await queryXP(supabase as any, limit, scopeFilter);
        break;
      case "checkins":
        entries = await queryCheckins(supabase as any, limit, timeStart, scopeFilter);
        break;
      case "styles":
        entries = await queryStyles(supabase as any, limit, timeStart, scopeFilter);
        break;
      case "breweries":
        entries = await queryBreweries(supabase as any, limit, timeStart, scopeFilter);
        break;
      case "streak":
        entries = await queryStreak(supabase as any, limit, scopeFilter);
        break;
      default:
        entries = [];
    }

    // Find current user's position
    const userEntry = entries.find((e: any) => e.profile.id === user.id);
    const userRank = userEntry?.rank ?? -1;
    const userValue = userEntry?.value ?? 0;

    return apiSuccess(entries, 200, {
      total: entries.length,
      userRank,
      userValue,
    }, {
      "Cache-Control": "public, max-age=60, stale-while-revalidate=120",
    });
  } catch (err) {
    return apiServerError(`Leaderboard query failed: ${category}/${scope}/${timeRange}`);
  }
}
