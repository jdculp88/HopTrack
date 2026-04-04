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
  dauSparkline: number[];      // 7-day daily DAU values
  sessionsSparkline: number[]; // 7-day daily session counts
  dauWoW: number | null;       // DAU % change vs prior week
  sessionsWoW: number | null;  // sessions % change vs prior week
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
  barbackPendingCount: number;
  barbackLastCrawl: string | null;
  barbackTotalCost: number;
}

export interface ActivityItem {
  id: string;
  type: "signup" | "session" | "claim" | "achievement";
  text: string;
  subtext: string;
  timestamp: string;
  breweryId?: string;
}

export interface SalesPipelineMetrics {
  totalClaims: number;
  pending: number;
  approved: number;
  inTrial: number; // verified, no paid tier, trial not expired
  converted: number; // has paid subscription_tier
  churned: number; // trial expired, no paid tier
  trialExpiringSoon: { breweryId: string; name: string; daysLeft: number }[];
}

export interface CommandCenterData {
  pulse: PulseMetrics;
  revenue: RevenueMetrics;
  engagement: EngagementMetrics;
  geo: GeoMetrics;
  growth: GrowthMetrics;
  health: HealthMetrics;
  recentActivity: ActivityItem[];
  crmDistribution: { segment: string; count: number; color: string; bgColor: string; emoji: string }[];
  churnDistribution: { level: string; count: number; color: string }[];
  salesPipeline: SalesPipelineMetrics;
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
    // Barback metrics
    { data: barbackLastCrawlRows },
    { data: barbackCostRows },

    // Recent activity
    { data: recentSignups },
    { data: recentSessionActivity },
    { data: recentClaims },
    { data: recentAchievements },

    // CRM segment counts (replaces 50K-row bulk fetch)
    { count: crmVipCount },
    { count: crmPowerCount },
    { count: crmRegularCount },
    { count: crmNewCount },

    // Churn distribution counts
    { count: churnActiveCount },
    { count: churnAtRiskCount },
    { count: churnChurnedCount },
  ] = await Promise.all([
    // ── Pulse queries ──
    service.from("profiles").select("id", { count: "exact", head: true }) as unknown as CountResult,
    service.from("sessions").select("user_id, started_at").gte("started_at", thirtyDaysAgo).limit(50000) as any,
    service.from("sessions").select("id", { count: "exact", head: true }).eq("is_active", true) as unknown as CountResult,
    service.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", oneWeekAgo) as unknown as CountResult,
    service.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", twoWeeksAgo).lt("created_at", oneWeekAgo) as unknown as CountResult,

    // ── Revenue queries ──
    service.from("brewery_accounts").select("subscription_tier, subscription_status, trial_ends_at, verified").limit(50000) as any,
    service.from("breweries").select("id", { count: "exact", head: true }) as unknown as CountResult,
    service.from("brewery_claims").select("id", { count: "exact", head: true }).eq("status", "approved") as unknown as CountResult,
    service.from("brewery_accounts").select("id", { count: "exact", head: true }).eq("verified", true) as unknown as CountResult,

    // ── Engagement queries ──
    service.from("sessions").select("id, user_id, started_at, ended_at").eq("is_active", false).gte("started_at", rangeStart).limit(50000) as any,
    service.from("beer_logs").select("id, session_id, beer_id").gte("logged_at", rangeStart).limit(50000) as any,
    service.from("loyalty_programs").select("id", { count: "exact", head: true }).eq("is_active", true) as unknown as CountResult,
    // Top beers: fetch beer_logs with beer name, group in JS
    service.from("beer_logs").select("beer:beers(id, name, style)").gte("logged_at", rangeStart).limit(50000) as any,
    // Top breweries: fetch sessions with brewery name, group in JS
    service.from("sessions").select("brewery:breweries(id, name, city, state)").eq("is_active", false).gte("started_at", rangeStart).limit(50000) as any,

    // ── Geo query ──
    service.from("breweries").select("state").not("state", "is", null).limit(50000) as any,

    // ── Growth queries (scoped to selected range) ──
    service.from("profiles").select("created_at").gte("created_at", rangeStart).order("created_at", { ascending: true }).limit(50000) as any,
    service.from("sessions").select("started_at").eq("is_active", false).gte("started_at", rangeStart).order("started_at", { ascending: true }).limit(50000) as any,
    service.from("brewery_claims").select("created_at").gte("created_at", rangeStart).order("created_at", { ascending: true }).limit(50000) as any,

    // ── Health queries ──
    service.from("brewery_claims").select("id", { count: "exact", head: true }).eq("status", "pending") as unknown as CountResult,
    service.from("crawled_beers").select("id", { count: "exact", head: true }).eq("status", "pending") as unknown as CountResult,
    service.from("pos_connections").select("id", { count: "exact", head: true }).eq("is_active", true) as unknown as CountResult,
    service.from("api_keys").select("id", { count: "exact", head: true }).eq("is_active", true) as unknown as CountResult,
    // Barback AI metrics (Sprint 146)
    service.from("crawl_jobs").select("completed_at").order("completed_at", { ascending: false, nullsFirst: false }).limit(1) as any,
    service.from("crawl_jobs").select("cost_usd").not("cost_usd", "is", null).limit(50000) as any,

    // ── Recent activity queries ──
    service.from("profiles").select("id, display_name, username, created_at").order("created_at", { ascending: false }).limit(10) as any,
    service.from("sessions").select("id, started_at, brewery_id, brewery:breweries(id, name), profile:profiles(display_name)").eq("is_active", false).order("started_at", { ascending: false }).limit(10) as any,
    service.from("brewery_claims").select("id, created_at, status, brewery_id, brewery:breweries(id, name), profile:profiles(display_name)").order("created_at", { ascending: false }).limit(10) as any,
    service.from("user_achievements").select("id, unlocked_at, achievement:achievements(name), profile:profiles(display_name)").order("unlocked_at", { ascending: false }).limit(10) as any,

    // CRM segment counts (boundaries match lib/crm.ts computeSegment)
    service.from("profiles").select("id", { count: "exact", head: true }).gte("total_checkins", 10) as unknown as CountResult,
    service.from("profiles").select("id", { count: "exact", head: true }).gte("total_checkins", 5).lt("total_checkins", 10) as unknown as CountResult,
    service.from("profiles").select("id", { count: "exact", head: true }).gte("total_checkins", 2).lt("total_checkins", 5) as unknown as CountResult,
    service.from("profiles").select("id", { count: "exact", head: true }).lt("total_checkins", 2) as unknown as CountResult,

    // Churn distribution counts (14d active, 45d at-risk, rest churned)
    service.from("profiles").select("id", { count: "exact", head: true }).gte("last_session_date", daysAgo(14)) as unknown as CountResult,
    service.from("profiles").select("id", { count: "exact", head: true }).gte("last_session_date", daysAgo(45)).lt("last_session_date", daysAgo(14)) as unknown as CountResult,
    service.from("profiles").select("id", { count: "exact", head: true }).or(`last_session_date.is.null,last_session_date.lt.${daysAgo(45)}`) as unknown as CountResult,
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

  // Build 7-day sparklines for DAU and sessions
  const dauSparkline: number[] = [];
  const sessionsSparkline: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = toDateKey(d.toISOString());
    const dayUsers = new Set<string>();
    let daySessions = 0;
    for (const s of sessions30d) {
      if (toDateKey(s.started_at) === key) {
        dayUsers.add(s.user_id);
        daySessions++;
      }
    }
    dauSparkline.push(dayUsers.size);
    sessionsSparkline.push(daySessions);
  }

  // WoW trends for DAU and sessions
  const priorWeekDauUsers = new Set<string>();
  let priorWeekSessions = 0;
  const twoWeeksAgoDate = new Date(Date.now() - 14 * 86400000);
  for (const s of sessions30d) {
    const d = new Date(s.started_at);
    if (d >= twoWeeksAgoDate && d < sevenDaysAgoDate) {
      if (toDateKey(s.started_at) === toDateKey(twoWeeksAgoDate.toISOString())) {
        priorWeekDauUsers.add(s.user_id);
        priorWeekSessions++;
      }
    }
  }
  const thisWeekDau = dauSparkline.slice(-1)[0] ?? 0;
  const priorDau = dauSparkline.length >= 8 ? dauSparkline[0] : null;
  const dauWoW = priorDau !== null && priorDau > 0 ? pctChange(thisWeekDau, priorDau) : null;
  const thisWeekSessions = sessionsSparkline.reduce((a, b) => a + b, 0);
  const priorWeekSessionsTotal = sessions30d.filter(s => {
    const d = new Date(s.started_at);
    return d >= twoWeeksAgoDate && d < sevenDaysAgoDate;
  }).length;
  const sessionsWoW = priorWeekSessionsTotal > 0 ? pctChange(thisWeekSessions, priorWeekSessionsTotal) : null;

  const pulse: PulseMetrics = {
    totalUsers: totalUsers ?? 0,
    dau: dauUsers.size,
    wau: wauUsers.size,
    mau: mauUsers.size,
    sessionsToday,
    activeSessions: activeSessions ?? 0,
    newUsersThisWeek: newUsersThisWeek ?? 0,
    newUsersWoW: pctChange(newUsersThisWeek ?? 0, newUsersPriorWeek ?? 0),
    dauSparkline,
    sessionsSparkline,
    dauWoW,
    sessionsWoW,
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
    rangeDays
  );
  const sessionVolume = bucketByDay(
    ((sessionRows ?? []) as { started_at: string }[]).map(r => ({ date_field: r.started_at })),
    rangeDays
  );
  const claimTrend = bucketByDay(
    ((claimRows ?? []) as { created_at: string }[]).map(r => ({ date_field: r.created_at })),
    rangeDays
  );

  const growth: GrowthMetrics = { userSignups, sessionVolume, claimTrend };

  // ── Compute Health ─────────────────────────────────────────────────

  // Barback metrics
  const barbackLastCrawl = ((barbackLastCrawlRows as any[]) ?? [])[0]?.completed_at ?? null;
  const barbackTotalCost = ((barbackCostRows as any[]) ?? []).reduce(
    (sum: number, r: any) => sum + (Number(r.cost_usd) || 0), 0
  );

  const health: HealthMetrics = {
    pendingClaims: pendingClaims ?? 0,
    pendingBeerReviews: pendingBeerReviews ?? 0,
    posActiveConnections: posConnections ?? 0,
    apiKeysActive: apiKeysActive ?? 0,
    barbackPendingCount: pendingBeerReviews ?? 0,
    barbackLastCrawl,
    barbackTotalCost: Math.round(barbackTotalCost * 100) / 100,
  };

  // ── Compute CRM + Churn Distribution ──────────────────────────────

  const segmentCounts: Record<string, number> = {
    vip: crmVipCount ?? 0,
    power: crmPowerCount ?? 0,
    regular: crmRegularCount ?? 0,
    new: crmNewCount ?? 0,
  };
  const churnCounts: Record<string, number> = {
    active: churnActiveCount ?? 0,
    at_risk: churnAtRiskCount ?? 0,
    churned: churnChurnedCount ?? 0,
  };
  const CHURN_COLORS: Record<string, string> = { active: "#4A7C59", at_risk: "#E8841A", churned: "#C44B3A" };

  const CRM_SEGMENT_META: Record<string, { color: string; bgColor: string; emoji: string }> = {
    vip: { color: "var(--accent-gold)", bgColor: "rgba(212,168,67,0.15)", emoji: "👑" },
    power: { color: "#a78bfa", bgColor: "rgba(167,139,250,0.15)", emoji: "⚡" },
    regular: { color: "#60a5fa", bgColor: "rgba(96,165,250,0.15)", emoji: "🍺" },
    new: { color: "#4ade80", bgColor: "rgba(74,222,128,0.15)", emoji: "🌱" },
  };

  const crmDistribution = Object.entries(segmentCounts).map(([segment, count]) => ({
    segment,
    count,
    ...CRM_SEGMENT_META[segment],
  }));

  const CHURN_LABELS: Record<string, string> = { active: "Active", at_risk: "At Risk", churned: "Churned" };
  const churnDistribution = Object.entries(churnCounts).map(([level, count]) => ({
    level: CHURN_LABELS[level] || level,
    count,
    color: CHURN_COLORS[level],
  }));

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

  // Sort all by timestamp descending, take 30
  const recentActivity = activity
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 30);

  // ── Sales Pipeline (Sprint 148) ──────────────────────────────────────
  const salesPipeline = await calculateSalesPipeline(service);

  // ── Assemble ───────────────────────────────────────────────────────

  return {
    pulse,
    revenue,
    engagement,
    geo,
    growth,
    health,
    recentActivity,
    crmDistribution,
    churnDistribution,
    salesPipeline,
    generatedAt: new Date().toISOString(),
  };
}

// ── Retention Cohort Analysis ─────────────────────────────────────────
// Sprint 142 — The Superadmin II

export interface RetentionCohort {
  cohortWeek: string;      // "2026-W14"
  cohortStart: string;     // YYYY-MM-DD (Monday of that week)
  userCount: number;
  retention: (number | null)[];  // Week 0 through Week 12
}

export interface RetentionData {
  cohorts: RetentionCohort[];
  generatedAt: string;
}

function getISOWeekKey(dateStr: string): { key: string; monday: string } {
  const d = new Date(dateStr);
  const day = d.getDay();
  // Adjust to Monday (ISO weeks start Monday)
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);

  // ISO week number
  const jan1 = new Date(monday.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((monday.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
  const key = `${monday.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
  return { key, monday: monday.toISOString().slice(0, 10) };
}

export async function calculateRetentionCohorts(
  service: SupabaseClient
): Promise<RetentionData> {
  const lookback = 91; // ~13 weeks
  const maxWeek = 12;

  // Fetch users created in last 91 days
  const [{ data: usersRaw }, { data: sessionsRaw }] = await Promise.all([
    service
      .from("profiles")
      .select("id, created_at")
      .gte("created_at", daysAgo(lookback))
      .limit(50000) as any,
    service
      .from("sessions")
      .select("user_id, started_at")
      .eq("is_active", false)
      .gte("started_at", daysAgo(lookback + 7 * maxWeek))
      .limit(50000) as any,
  ]);

  const users = (usersRaw as any[]) ?? [];
  const sessions = (sessionsRaw as any[]) ?? [];

  // Build user → set of active week keys
  const userWeeks = new Map<string, Set<string>>();
  for (const s of sessions) {
    if (!userWeeks.has(s.user_id)) userWeeks.set(s.user_id, new Set());
    userWeeks.get(s.user_id)!.add(getISOWeekKey(s.started_at).key);
  }

  // Group users into cohorts by signup week
  const cohortMap = new Map<string, { monday: string; userIds: string[] }>();
  for (const u of users) {
    const { key, monday } = getISOWeekKey(u.created_at);
    if (!cohortMap.has(key)) cohortMap.set(key, { monday, userIds: [] });
    cohortMap.get(key)!.userIds.push(u.id);
  }

  // Build retention matrix
  const now = new Date();
  const nowWeek = getISOWeekKey(now.toISOString());

  const cohorts: RetentionCohort[] = [];

  // Sort cohorts chronologically
  const sortedKeys = [...cohortMap.keys()].sort();
  for (const cohortKey of sortedKeys) {
    const { monday, userIds } = cohortMap.get(cohortKey)!;
    const retention: (number | null)[] = [];

    for (let w = 0; w <= maxWeek; w++) {
      // Calculate the target week key
      const targetDate = new Date(monday);
      targetDate.setDate(targetDate.getDate() + w * 7);
      const targetWeek = getISOWeekKey(targetDate.toISOString());

      // If target week is in the future, mark as null
      if (targetWeek.key > nowWeek.key) {
        retention.push(null);
        continue;
      }

      // Count users active in target week
      let active = 0;
      for (const uid of userIds) {
        if (userWeeks.get(uid)?.has(targetWeek.key)) active++;
      }
      retention.push(userIds.length > 0 ? Math.round((active / userIds.length) * 100) : 0);
    }

    cohorts.push({
      cohortWeek: cohortKey,
      cohortStart: monday,
      userCount: userIds.length,
      retention,
    });
  }

  return {
    cohorts,
    generatedAt: new Date().toISOString(),
  };
}

// ── User Funnel Analysis ──────────────────────────────────────────────

export interface FunnelStep {
  label: string;
  count: number;
  pct: number;         // % of step 0
  dropoffPct: number;  // % drop from previous step
}

export interface FunnelData {
  steps: FunnelStep[];
  generatedAt: string;
}

export async function calculateUserFunnel(
  service: SupabaseClient
): Promise<FunnelData> {
  // 7 parallel count queries
  const [
    { count: totalUsers },
    { count: profileComplete },
    { count: firstSession },
    { count: secondSession },
    { data: reviewerIds },
    { data: friendUserIds },
    { count: fivePlusSessions },
  ] = await Promise.all([
    // 1. Signed up (all profiles)
    service
      .from("profiles")
      .select("id", { count: "exact", head: true }) as any,

    // 2. Completed profile (has display_name AND avatar)
    service
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .not("display_name", "is", null)
      .not("avatar_url", "is", null) as any,

    // 3. First session (total_checkins >= 1)
    service
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("total_checkins", 1) as any,

    // 4. Second session (total_checkins >= 2)
    service
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("total_checkins", 2) as any,

    // 5. Reviewed a beer (distinct user_ids with rating > 0)
    service
      .from("beer_logs")
      .select("user_id")
      .gt("rating", 0)
      .limit(50000) as any,

    // 6. Added a friend (distinct user_ids with accepted friendships)
    service
      .from("friendships")
      .select("requester_id, addressee_id")
      .eq("status", "accepted")
      .limit(50000) as any,

    // 7. 5+ sessions
    service
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("total_checkins", 5) as any,
  ]);

  // Compute distinct counts for reviewers and friends
  const reviewerCount = new Set(((reviewerIds as any[]) ?? []).map((r: any) => r.user_id)).size;
  const friendIds = new Set<string>();
  for (const f of ((friendUserIds as any[]) ?? [])) {
    friendIds.add(f.requester_id);
    friendIds.add(f.addressee_id);
  }
  const friendCount = friendIds.size;

  const total = totalUsers ?? 0;
  const counts = [
    total,
    profileComplete ?? 0,
    firstSession ?? 0,
    secondSession ?? 0,
    reviewerCount,
    friendCount,
    fivePlusSessions ?? 0,
  ];

  const labels = [
    "Signed Up",
    "Profile Complete",
    "First Session",
    "Second Session",
    "Reviewed a Beer",
    "Added a Friend",
    "5+ Sessions",
  ];

  const steps: FunnelStep[] = counts.map((count, i) => ({
    label: labels[i],
    count,
    pct: total > 0 ? Math.round((count / total) * 100) : 0,
    dropoffPct: i === 0 ? 0 : (counts[i - 1] > 0
      ? Math.round(((counts[i - 1] - count) / counts[i - 1]) * 100)
      : 0),
  }));

  return {
    steps,
    generatedAt: new Date().toISOString(),
  };
}

// ── Sales Pipeline ────────────────────────────────────────────────────
// Sprint 148 — The Closer

export async function calculateSalesPipeline(
  service: SupabaseClient
): Promise<SalesPipelineMetrics> {
  const now = new Date();

  const [
    { count: totalClaims },
    { count: pending },
    { count: approved },
    { data: verifiedAccounts },
  ] = await Promise.all([
    service.from("brewery_claims").select("id", { count: "exact", head: true }),
    service.from("brewery_claims").select("id", { count: "exact", head: true }).eq("status", "pending"),
    service.from("brewery_claims").select("id", { count: "exact", head: true }).eq("status", "approved"),
    // All verified brewery accounts with their brewery subscription data
    service
      .from("brewery_accounts")
      .select("brewery_id, verified, verified_at, brewery:breweries(id, name, subscription_tier, trial_ends_at)")
      .eq("verified", true)
      .eq("role", "owner") as any,
  ]);

  const accounts = (verifiedAccounts as any[]) ?? [];

  let inTrial = 0;
  let converted = 0;
  let churned = 0;
  const trialExpiringSoon: SalesPipelineMetrics["trialExpiringSoon"] = [];

  for (const acc of accounts) {
    const brewery = acc.brewery as any;
    if (!brewery) continue;

    const tier = brewery.subscription_tier;
    const trialEndsAt = brewery.trial_ends_at ? new Date(brewery.trial_ends_at) : null;
    const isPaid = tier && !["free", null].includes(tier);

    if (isPaid) {
      converted++;
    } else if (trialEndsAt && trialEndsAt > now) {
      // Active trial
      inTrial++;
      const daysLeft = Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 7) {
        trialExpiringSoon.push({
          breweryId: brewery.id,
          name: brewery.name ?? "Unknown",
          daysLeft,
        });
      }
    } else if (trialEndsAt && trialEndsAt <= now) {
      // Trial expired, not paid
      churned++;
    }
  }

  // Sort expiring soon by days left (most urgent first)
  trialExpiringSoon.sort((a, b) => a.daysLeft - b.daysLeft);

  return {
    totalClaims: totalClaims ?? 0,
    pending: pending ?? 0,
    approved: approved ?? 0,
    inTrial,
    converted,
    churned,
    trialExpiringSoon,
  };
}
