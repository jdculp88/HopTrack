/**
 * Superadmin Platform Stats — deep dive data engine
 * Sprint 143 — The Superadmin III
 *
 * Provides enriched platform stats with sparklines, computed ratios,
 * CRM segment breakdown, beer style distribution, and interactive leaderboards.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { computeSegment, SEGMENTS, type CustomerSegment } from "@/lib/crm";

// ── Types ──────────────────────────────────────────────────────────────

export type StatsTimeRange = "7d" | "30d" | "90d";

export interface StatCard {
  label: string;
  value: number;
  sparkline: number[]; // 7-day daily values
  subtitle: string;
}

export interface ComputedRatio {
  label: string;
  value: number | null;
  format: "percent" | "decimal" | "minutes";
  description: string;
}

export interface SegmentDistribution {
  segment: CustomerSegment;
  label: string;
  count: number;
  color: string;
  bgColor: string;
  emoji: string;
}

export interface StyleDistribution {
  style: string;
  count: number;
  pct: number;
}

export interface LeaderboardItem {
  id: string;
  name: string;
  subtitle: string;
  count: number;
}

export interface PlatformStatsData {
  stats: StatCard[];
  ratios: ComputedRatio[];
  crmDistribution: SegmentDistribution[];
  styleDistribution: StyleDistribution[];
  topBreweries: LeaderboardItem[];
  topBeers: LeaderboardItem[];
  generatedAt: string;
}

// ── Helpers ────────────────────────────────────────────────────────────

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86400000).toISOString();
}

function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

function bucketByDay7(rows: { ts: string }[]): number[] {
  const now = new Date();
  const buckets: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    buckets[toDateKey(d.toISOString())] = 0;
  }
  for (const row of rows) {
    const key = toDateKey(row.ts);
    if (key in buckets) buckets[key]++;
  }
  return Object.entries(buckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, count]) => count);
}

// ── Main calculation function ──────────────────────────────────────────

type CountResult = { count: number | null; data: null; error: null };

export async function fetchPlatformStats(
  service: SupabaseClient,
  range: StatsTimeRange = "30d"
): Promise<PlatformStatsData> {
  const rangeDays = { "7d": 7, "30d": 30, "90d": 90 }[range];
  const rangeStart = daysAgo(rangeDays);
  const sevenDaysAgo = daysAgo(7);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayISO = todayStart.toISOString();
  const thirtyDaysAgo = daysAgo(30);

  // ── Fire all queries in parallel ──────────────────────────────────

  const [
    // Counts
    { count: totalProfiles },
    { count: totalBreweries },
    { count: totalBeers },
    { count: totalSessions },
    { count: verifiedAccounts },
    { count: totalReviews },
    { count: totalComments },

    // Sparkline data (7 days)
    { data: signupRows7d },
    { data: sessionRows7d },

    // Ratio data (range)
    { data: rangeSessions },
    { data: rangeBeerLogs },

    // CRM profiles
    { data: crmProfiles },

    // Style distribution
    { data: styleLogs },

    // Leaderboards
    { data: brewerySessionRows },
    { data: beerLogRows },
  ] = await Promise.all([
    // Counts
    service.from("profiles").select("id", { count: "exact", head: true }) as unknown as CountResult,
    service.from("breweries").select("id", { count: "exact", head: true }) as unknown as CountResult,
    service.from("beers").select("id", { count: "exact", head: true }) as unknown as CountResult,
    service.from("sessions").select("id", { count: "exact", head: true }).eq("is_active", false) as unknown as CountResult,
    service.from("brewery_accounts").select("id", { count: "exact", head: true }).eq("verified", true) as unknown as CountResult,
    service.from("brewery_reviews").select("id", { count: "exact", head: true }) as unknown as CountResult,
    service.from("session_comments").select("id", { count: "exact", head: true }) as unknown as CountResult,

    // Sparklines
    service.from("profiles").select("created_at").gte("created_at", sevenDaysAgo).limit(50000) as any,
    service.from("sessions").select("started_at").eq("is_active", false).gte("started_at", sevenDaysAgo).limit(50000) as any,

    // Ratios
    service.from("sessions").select("id, user_id, started_at").eq("is_active", false).gte("started_at", rangeStart).limit(50000) as any,
    service.from("beer_logs").select("id, session_id").gte("logged_at", rangeStart).limit(50000) as any,

    // CRM
    service.from("profiles").select("total_checkins, last_session_date").limit(50000) as any,

    // Styles
    service.from("beer_logs").select("beer:beers(style)").gte("logged_at", rangeStart).limit(50000) as any,

    // Leaderboards
    service.from("sessions").select("brewery:breweries(id, name, city, state)").eq("is_active", false).gte("started_at", rangeStart).limit(50000) as any,
    service.from("beer_logs").select("beer:beers(id, name, style)").gte("logged_at", rangeStart).limit(50000) as any,
  ]);

  // ── Build sparklines ──────────────────────────────────────────────

  const signupSparkline = bucketByDay7(
    ((signupRows7d ?? []) as any[]).map((r: any) => ({ ts: r.created_at }))
  );
  const sessionSparkline = bucketByDay7(
    ((sessionRows7d ?? []) as any[]).map((r: any) => ({ ts: r.started_at }))
  );

  // ── Stat cards ────────────────────────────────────────────────────

  const stats: StatCard[] = [
    { label: "Total Users", value: totalProfiles ?? 0, sparkline: signupSparkline, subtitle: "All registered accounts" },
    { label: "Breweries", value: totalBreweries ?? 0, sparkline: [], subtitle: "Listings in database" },
    { label: "Beers", value: totalBeers ?? 0, sparkline: [], subtitle: "Beer catalog entries" },
    { label: "Sessions", value: totalSessions ?? 0, sparkline: sessionSparkline, subtitle: "Completed check-ins" },
    { label: "Verified Accounts", value: verifiedAccounts ?? 0, sparkline: [], subtitle: "Claimed breweries" },
    { label: "Reviews", value: totalReviews ?? 0, sparkline: [], subtitle: "Brewery reviews" },
    { label: "Comments", value: totalComments ?? 0, sparkline: [], subtitle: "Session comments" },
  ];

  // ── Compute ratios ────────────────────────────────────────────────

  const sessions = (rangeSessions ?? []) as { id: string; user_id: string; started_at: string }[];
  const beerLogs = (rangeBeerLogs ?? []) as { id: string; session_id: string }[];

  // DAU / MAU stickiness
  const todayStr = toDateKey(new Date().toISOString());
  const dauIds = new Set<string>();
  const mauIds = new Set<string>();
  for (const s of (rangeSessions ?? []) as any[]) {
    if (toDateKey(s.started_at) === todayStr) dauIds.add(s.user_id);
  }
  // MAU from 30-day window
  const mauStart = daysAgo(30);
  for (const s of sessions) {
    if (s.started_at >= mauStart) mauIds.add(s.user_id);
  }
  const stickiness = mauIds.size > 0 ? Math.round((dauIds.size / mauIds.size) * 1000) / 10 : null;

  // Avg sessions/user
  const uniqueSessionUsers = new Set(sessions.map(s => s.user_id));
  const avgSessionsPerUser = uniqueSessionUsers.size > 0
    ? Math.round((sessions.length / uniqueSessionUsers.size) * 10) / 10
    : null;

  // Avg beers/session
  const avgBeersPerSession = sessions.length > 0
    ? Math.round((beerLogs.length / sessions.length) * 10) / 10
    : null;

  // Session completion rate
  const sessionIdsWithBeer = new Set(beerLogs.map(l => l.session_id));
  const completedSessions = sessions.filter(s => sessionIdsWithBeer.has(s.id)).length;
  const completionRate = sessions.length > 0
    ? Math.round((completedSessions / sessions.length) * 1000) / 10
    : null;

  const ratios: ComputedRatio[] = [
    { label: "DAU/MAU Stickiness", value: stickiness, format: "percent", description: "Daily active / monthly active users" },
    { label: "Avg Sessions/User", value: avgSessionsPerUser, format: "decimal", description: "Sessions per unique user in range" },
    { label: "Avg Beers/Session", value: avgBeersPerSession, format: "decimal", description: "Beers logged per session in range" },
    { label: "Session Completion", value: completionRate, format: "percent", description: "Sessions with at least one beer logged" },
  ];

  // ── CRM distribution ──────────────────────────────────────────────

  const profiles = (crmProfiles ?? []) as { total_checkins: number; last_session_date: string | null }[];
  const segmentCounts: Record<CustomerSegment, number> = { vip: 0, power: 0, regular: 0, new: 0 };
  for (const p of profiles) {
    const seg = computeSegment(p.total_checkins ?? 0);
    segmentCounts[seg]++;
  }

  const crmDistribution: SegmentDistribution[] = SEGMENTS.map(s => ({
    segment: s.id,
    label: s.label,
    count: segmentCounts[s.id],
    color: s.color,
    bgColor: s.bgColor,
    emoji: s.emoji,
  }));

  // ── Style distribution ────────────────────────────────────────────

  const styleCounts: Record<string, number> = {};
  for (const row of (styleLogs ?? []) as any[]) {
    const style = row.beer?.style;
    if (!style) continue;
    styleCounts[style] = (styleCounts[style] || 0) + 1;
  }
  const totalStyleLogs = Object.values(styleCounts).reduce((a, b) => a + b, 0);
  const styleDistribution: StyleDistribution[] = Object.entries(styleCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 12)
    .map(([style, count]) => ({
      style,
      count,
      pct: totalStyleLogs > 0 ? Math.round((count / totalStyleLogs) * 1000) / 10 : 0,
    }));

  // ── Top breweries ─────────────────────────────────────────────────

  const breweryCounts: Record<string, { name: string; location: string; count: number }> = {};
  for (const row of (brewerySessionRows ?? []) as any[]) {
    const b = row.brewery;
    if (!b?.id || !b?.name) continue;
    if (!breweryCounts[b.id]) {
      breweryCounts[b.id] = { name: b.name, location: [b.city, b.state].filter(Boolean).join(", "), count: 0 };
    }
    breweryCounts[b.id].count++;
  }
  const topBreweries: LeaderboardItem[] = Object.entries(breweryCounts)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 15)
    .map(([id, b]) => ({ id, name: b.name, subtitle: b.location, count: b.count }));

  // ── Top beers ─────────────────────────────────────────────────────

  const beerCounts: Record<string, { name: string; style: string; count: number }> = {};
  for (const row of (beerLogRows ?? []) as any[]) {
    const b = row.beer;
    if (!b?.id || !b?.name) continue;
    if (!beerCounts[b.id]) {
      beerCounts[b.id] = { name: b.name, style: b.style || "", count: 0 };
    }
    beerCounts[b.id].count++;
  }
  const topBeers: LeaderboardItem[] = Object.entries(beerCounts)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 15)
    .map(([id, b]) => ({ id, name: b.name, subtitle: b.style, count: b.count }));

  // ── Assemble ───────────────────────────────────────────────────────

  return {
    stats,
    ratios,
    crmDistribution,
    styleDistribution,
    topBreweries,
    topBeers,
    generatedAt: new Date().toISOString(),
  };
}
