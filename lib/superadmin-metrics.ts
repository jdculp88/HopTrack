/**
 * Superadmin Command Center — metric calculation engine
 * Sprint 136 — The Command Center
 *
 * Pure functions that accept a Supabase service client and return
 * all dashboard metrics. Mirrors the pattern in lib/kpi.ts.
 *
 * All queries use service role client (bypasses RLS) for accurate
 * platform-wide counts.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

// ── Types ──────────────────────────────────────────────────────────────

export type TimeRange = "7d" | "30d" | "90d";

export interface PulseMetrics {
  totalUsers: number;
  dau: number;
  wau: number;
  mau: number;
  sessionsToday: number;
  activeSessions: number;
  newUsersThisWeek: number;
  newUsersWoW: number | null; // % change vs prior week
}

export interface TierSlice {
  tier: string;
  count: number;
  label: string;
}

export interface RevenueMetrics {
  mrrEstimate: number;
  tierDistribution: TierSlice[];
  trialCount: number;
  paidCount: number;
  claimFunnel: {
    totalBreweries: number;
    claimed: number;
    verified: number;
    paid: number;
  };
}

export interface TopItem {
  name: string;
  count: number;
  subtitle?: string;
}

export interface EngagementMetrics {
  avgSessionsPerUser: number | null;
  avgBeersPerSession: number | null;
  avgSessionDurationMin: number | null;
  loyaltyAdoptionRate: number | null; // % of verified breweries with active loyalty
  topBeers: TopItem[];
  topBreweries: TopItem[];
}

export interface StateBreweryCount {
  state: string;
  count: number;
}

export interface GeoMetrics {
  stateDistribution: StateBreweryCount[];
}

export interface DailyDataPoint {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface GrowthMetrics {
  userSignups: DailyDataPoint[];
  sessionVolume: DailyDataPoint[];
  claimTrend: DailyDataPoint[];
}

export interface HealthMetrics {
  pendingClaims: number;
  pendingBeerReviews: number;
  posActiveConnections: number;
  apiKeysActive: number;
}

export interface ActivityItem {
  id: string;
  type: "signup" | "session" | "claim" | "achievement";
  text: string;
  subtext: string;
  timestamp: string;
  breweryId?: string;
}

export interface CommandCenterData {
  pulse: PulseMetrics;
  revenue: RevenueMetrics;
  engagement: EngagementMetrics;
  geo: GeoMetrics;
  growth: GrowthMetrics;
  health: HealthMetrics;
  recentActivity: ActivityItem[];
  generatedAt: string;
}

// ── Helpers ────────────────────────────────────────────────────────────

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86400000).toISOString();
}

function todayStart(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function toDateKey(iso: string): string {
  return iso.slice(0, 10); // YYYY-MM-DD
}

function bucketByDay(rows: { date_field: string }[], days: number): DailyDataPoint[] {
  const now = new Date();
  const buckets: Record<string, number> = {};

  // Initialize all days to 0
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    buckets[toDateKey(d.toISOString())] = 0;
  }

  // Count rows per day
  for (const row of rows) {
    const key = toDateKey(row.date_field);
    if (key in buckets) {
      buckets[key]++;
    }
  }

  return Object.entries(buckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

function pctChange(current: number, prior: number): number | null {
  if (prior === 0) return current > 0 ? 100 : null;
  return Math.round(((current - prior) / prior) * 100);
}

// ── Tier pricing (matches lib/stripe.ts) ───────────────────────────────

const TIER_MRR: Record<string, number> = {
  tap: 49,
  cask: 149,
  barrel: 299,
};

const TIER_LABELS: Record<string, string> = {
  free: "Free",
  tap: "Tap ($49)",
  cask: "Cask ($149)",
  barrel: "Barrel ($299)",
};

// ── Main calculation function ──────────────────────────────────────────

type CountResult = { count: number | null; data: null; error: null };

export async function calculateCommandCenterMetrics(
  service: SupabaseClient,
  range: TimeRange = "30d"
): Promise<CommandCenterData> {
  const rangeDays = { "7d": 7, "30d": 30, "90d": 90 }[range];
  const rangeStart = daysAgo(rangeDays);
  const oneWeekAgo = daysAgo(7);
  const twoWeeksAgo = daysAgo(14);
  const thirtyDaysAgo = daysAgo(30);
  const today = todayStart();

  // ── Fire all queries in parallel ──────────────────────────────────

  const [
    // Pulse
    { count: totalUsers },
    { data: recentSessions },
    { count: activeSessions },
    { count: newUsersThisWeek },
    { count: newUsersPriorWeek },

    // Revenue
    { data: breweryAccounts },
    { count: totalBreweries },
    { count: claimedBreweries },
    { count: verifiedBreweries },

    // Engagement
    { data: rangeSessions },
    { data: rangeBeerLogs },
    { count: loyaltyProgramCount },
    { data: topBeerRows },
    { data: topBreweryRows },

    // Geo
    { data: breweryStates },

    // Growth (30-day series regardless of range)
    { data: signupRows },
    { data: sessionRows },
    { data: claimRows },

    // Health
    { count: pendingClaims },
    { count: pendingBeerReviews },
    { count: posConnections },
    { count: apiKeysActive },

    // Recent activity
    { data: recentSignups },
    { data: recentSessionActivity },
    { data: recentClaims },
    { data: recentAchievements },
  ] = await Promise.all([
    // ── Pulse queries ──
    service.from("profiles").select("id", { count: "exact", head: true }) as unknown as CountResult,
    service.from("sessions").select("user_id, started_at").gte("started_at", thirtyDaysAgo).limit(10000) as any,
    service.from("sessions").select("id", { count: "exact", head: true }).eq("is_active", true) as unknown as CountResult,
    service.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", oneWeekAgo) as unknown as CountResult,
    service.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", twoWeeksAgo).lt("created_at", oneWeekAgo) as unknown as CountResult,

    // ── Revenue queries ──
    service.from("brewery_accounts").select("subscription_tier, subscription_status, trial_ends_at, verified") as any,
    service.from("breweries").select("id", { count: "exact", head: true }) as unknown as CountResult,
    service.from("brewery_claims").select("id", { count: "exact", head: true }).eq("status", "approved") as unknown as CountResult,
    service.from("brewery_accounts").select("id", { count: "exact", head: true }).eq("verified", true) as unknown as CountResult,

    // ── Engagement queries ──
    service.from("sessions").select("id, user_id, started_at, ended_at").eq("is_active", false).gte("started_at", rangeStart).limit(5000) as any,
    service.from("beer_logs").select("id, session_id, beer_id").gte("logged_at", rangeStart).limit(10000) as any,
    service.from("loyalty_programs").select("id", { count: "exact", head: true }).eq("is_active", true) as unknown as CountResult,
    // Top beers: fetch beer_logs with beer name, group in JS
    service.from("beer_logs").select("beer:beers(id, name, style)").gte("logged_at", rangeStart).limit(5000) as any,
    // Top breweries: fetch sessions with brewery name, group in JS
    service.from("sessions").select("brewery:breweries(id, name, city, state)").eq("is_active", false).gte("started_at", rangeStart).limit(5000) as any,

    // ── Geo query ──
    service.from("breweries").select("state").not("state", "is", null) as any,

    // ── Growth queries (always 30-day series) ──
    service.from("profiles").select("created_at").gte("created_at", thirtyDaysAgo).order("created_at", { ascending: true }).limit(10000) as any,
    service.from("sessions").select("started_at").eq("is_active", false).gte("started_at", thirtyDaysAgo).order("started_at", { ascending: true }).limit(10000) as any,
    service.from("brewery_claims").select("created_at").gte("created_at", thirtyDaysAgo).order("created_at", { ascending: true }).limit(1000) as any,

    // ── Health queries ──
    service.from("brewery_claims").select("id", { count: "exact", head: true }).eq("status", "pending") as unknown as CountResult,
    service.from("crawled_beers").select("id", { count: "exact", head: true }).eq("status", "pending") as unknown as CountResult,
    service.from("pos_connections").select("id", { count: "exact", head: true }).eq("is_active", true) as unknown as CountResult,
    service.from("api_keys").select("id", { count: "exact", head: true }).eq("is_active", true) as unknown as CountResult,

    // ── Recent activity queries ──
    service.from("profiles").select("id, display_name, username, created_at").order("created_at", { ascending: false }).limit(5) as any,
    service.from("sessions").select("id, started_at, brewery_id, brewery:breweries(id, name), profile:profiles(display_name)").eq("is_active", false).order("started_at", { ascending: false }).limit(5) as any,
    service.from("brewery_claims").select("id, created_at, status, brewery_id, brewery:breweries(id, name), profile:profiles(display_name)").order("created_at", { ascending: false }).limit(5) as any,
    service.from("user_achievements").select("id, unlocked_at, achievement:achievements(name), profile:profiles(display_name)").order("unlocked_at", { ascending: false }).limit(5) as any,
  ]);

  // ── Compute Pulse ──────────────────────────────────────────────────

  const sessions30d = (recentSessions ?? []) as { user_id: string; started_at: string }[];
  const todayStr = toDateKey(new Date().toISOString());
  const sevenDaysAgoDate = new Date(Date.now() - 7 * 86400000);
  const thirtyDaysAgoDate = new Date(Date.now() - 30 * 86400000);

  const dauUsers = new Set<string>();
  const wauUsers = new Set<string>();
  const mauUsers = new Set<string>();
  let sessionsToday = 0;

  for (const s of sessions30d) {
    const d = new Date(s.started_at);
    mauUsers.add(s.user_id);
    if (d >= sevenDaysAgoDate) wauUsers.add(s.user_id);
    if (toDateKey(s.started_at) === todayStr) {
      dauUsers.add(s.user_id);
      sessionsToday++;
    }
  }

  const pulse: PulseMetrics = {
    totalUsers: totalUsers ?? 0,
    dau: dauUsers.size,
    wau: wauUsers.size,
    mau: mauUsers.size,
    sessionsToday,
    activeSessions: activeSessions ?? 0,
    newUsersThisWeek: newUsersThisWeek ?? 0,
    newUsersWoW: pctChange(newUsersThisWeek ?? 0, newUsersPriorWeek ?? 0),
  };

  // ── Compute Revenue ────────────────────────────────────────────────

  const accounts = (breweryAccounts ?? []) as {
    subscription_tier: string | null;
    subscription_status: string | null;
    trial_ends_at: string | null;
    verified: boolean;
  }[];

  const tierCounts: Record<string, number> = { free: 0, tap: 0, cask: 0, barrel: 0 };
  let mrrEstimate = 0;
  let trialCount = 0;
  let paidCount = 0;

  for (const a of accounts) {
    const tier = a.subscription_tier || "free";
    tierCounts[tier] = (tierCounts[tier] || 0) + 1;

    if (a.subscription_status === "active" && TIER_MRR[tier]) {
      mrrEstimate += TIER_MRR[tier];
      paidCount++;
    }
    if (a.trial_ends_at && new Date(a.trial_ends_at) > new Date()) {
      trialCount++;
    }
  }

  const tierDistribution: TierSlice[] = Object.entries(tierCounts)
    .filter(([, count]) => count > 0)
    .map(([tier, count]) => ({
      tier,
      count,
      label: TIER_LABELS[tier] || tier,
    }));

  const revenue: RevenueMetrics = {
    mrrEstimate,
    tierDistribution,
    trialCount,
    paidCount,
    claimFunnel: {
      totalBreweries: totalBreweries ?? 0,
      claimed: claimedBreweries ?? 0,
      verified: verifiedBreweries ?? 0,
      paid: paidCount,
    },
  };

  // ── Compute Engagement ─────────────────────────────────────────────

  const engageSessions = (rangeSessions ?? []) as { id: string; user_id: string; started_at: string; ended_at: string | null }[];
  const engageBeerLogs = (rangeBeerLogs ?? []) as { id: string; session_id: string }[];

  const uniqueUsers = new Set(engageSessions.map(s => s.user_id));
  const avgSessionsPerUser = uniqueUsers.size > 0
    ? Math.round((engageSessions.length / uniqueUsers.size) * 10) / 10
    : null;

  const avgBeersPerSession = engageSessions.length > 0
    ? Math.round((engageBeerLogs.length / engageSessions.length) * 10) / 10
    : null;

  // Average session duration
  let totalDurationMin = 0;
  let durationCount = 0;
  for (const s of engageSessions) {
    if (s.ended_at) {
      const dur = (new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) / 60000;
      if (dur > 0 && dur < 720) { // cap at 12 hours to exclude outliers
        totalDurationMin += dur;
        durationCount++;
      }
    }
  }
  const avgSessionDurationMin = durationCount > 0
    ? Math.round(totalDurationMin / durationCount)
    : null;

  const loyaltyAdoptionRate = (verifiedBreweries ?? 0) > 0
    ? Math.round(((loyaltyProgramCount ?? 0) / (verifiedBreweries ?? 1)) * 100)
    : null;

  // Top beers
  const beerCounts: Record<string, { name: string; style: string; count: number }> = {};
  for (const row of (topBeerRows ?? []) as any[]) {
    const beer = row.beer;
    if (!beer?.name) continue;
    const key = beer.id || beer.name;
    if (!beerCounts[key]) beerCounts[key] = { name: beer.name, style: beer.style || "", count: 0 };
    beerCounts[key].count++;
  }
  const topBeers: TopItem[] = Object.values(beerCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map(b => ({ name: b.name, count: b.count, subtitle: b.style }));

  // Top breweries
  const breweryCounts: Record<string, { name: string; location: string; count: number }> = {};
  for (const row of (topBreweryRows ?? []) as any[]) {
    const brewery = row.brewery;
    if (!brewery?.name) continue;
    const key = brewery.id || brewery.name;
    if (!breweryCounts[key]) {
      breweryCounts[key] = {
        name: brewery.name,
        location: [brewery.city, brewery.state].filter(Boolean).join(", "),
        count: 0,
      };
    }
    breweryCounts[key].count++;
  }
  const topBreweries: TopItem[] = Object.values(breweryCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map(b => ({ name: b.name, count: b.count, subtitle: b.location }));

  const engagement: EngagementMetrics = {
    avgSessionsPerUser,
    avgBeersPerSession,
    avgSessionDurationMin,
    loyaltyAdoptionRate,
    topBeers,
    topBreweries,
  };

  // ── Compute Geo ────────────────────────────────────────────────────

  const stateCounts: Record<string, number> = {};
  for (const row of (breweryStates ?? []) as { state: string }[]) {
    if (!row.state) continue;
    const st = row.state.trim().toUpperCase().slice(0, 2);
    if (st.length === 2) {
      stateCounts[st] = (stateCounts[st] || 0) + 1;
    }
  }

  const stateDistribution: StateBreweryCount[] = Object.entries(stateCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15)
    .map(([state, count]) => ({ state, count }));

  const geo: GeoMetrics = { stateDistribution };

  // ── Compute Growth ─────────────────────────────────────────────────

  const userSignups = bucketByDay(
    ((signupRows ?? []) as { created_at: string }[]).map(r => ({ date_field: r.created_at })),
    30
  );
  const sessionVolume = bucketByDay(
    ((sessionRows ?? []) as { started_at: string }[]).map(r => ({ date_field: r.started_at })),
    30
  );
  const claimTrend = bucketByDay(
    ((claimRows ?? []) as { created_at: string }[]).map(r => ({ date_field: r.created_at })),
    30
  );

  const growth: GrowthMetrics = { userSignups, sessionVolume, claimTrend };

  // ── Compute Health ─────────────────────────────────────────────────

  const health: HealthMetrics = {
    pendingClaims: pendingClaims ?? 0,
    pendingBeerReviews: pendingBeerReviews ?? 0,
    posActiveConnections: posConnections ?? 0,
    apiKeysActive: apiKeysActive ?? 0,
  };

  // ── Compute Recent Activity ────────────────────────────────────────

  const activity: ActivityItem[] = [];

  for (const row of (recentSignups ?? []) as any[]) {
    activity.push({
      id: `signup-${row.id}`,
      type: "signup",
      text: row.display_name || row.username || "New user",
      subtext: "joined HopTrack",
      timestamp: row.created_at,
    });
  }

  for (const row of (recentSessionActivity ?? []) as any[]) {
    const who = row.profile?.display_name || "Someone";
    const where = row.brewery?.name || "a brewery";
    activity.push({
      id: `session-${row.id}`,
      type: "session",
      text: who,
      subtext: `checked in at ${where}`,
      timestamp: row.started_at,
      breweryId: row.brewery_id ?? row.brewery?.id,
    });
  }

  for (const row of (recentClaims ?? []) as any[]) {
    const who = row.profile?.display_name || "Someone";
    const where = row.brewery?.name || "a brewery";
    activity.push({
      id: `claim-${row.id}`,
      type: "claim",
      text: who,
      subtext: `claimed ${where} (${row.status})`,
      timestamp: row.created_at,
      breweryId: row.brewery_id ?? row.brewery?.id,
    });
  }

  for (const row of (recentAchievements ?? []) as any[]) {
    const who = row.profile?.display_name || "Someone";
    const what = row.achievement?.name || "an achievement";
    activity.push({
      id: `achievement-${row.id}`,
      type: "achievement",
      text: who,
      subtext: `unlocked "${what}"`,
      timestamp: row.unlocked_at,
    });
  }

  // Sort all by timestamp descending, take 20
  const recentActivity = activity
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20);

  // ── Assemble ───────────────────────────────────────────────────────

  return {
    pulse,
    revenue,
    engagement,
    geo,
    growth,
    health,
    recentActivity,
    generatedAt: new Date().toISOString(),
  };
}
