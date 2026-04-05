/**
 * Command Center Intelligence Layer — Sprint 158
 *
 * Novel KPIs that go beyond standard dashboards.
 * "State of the art — something people have never thought about."
 *
 * The existing Command Center (superadmin-metrics.ts) is the operational dashboard.
 * This is the strategic dashboard: what does it mean, what's coming, what should you do.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MagicNumberInsight {
  signal: string;
  correlation: number;
  cohortSize: number;
  controlSize: number;
  cohortRetention90d: number;
  controlRetention90d: number;
}

export interface TimeToValueMetrics {
  medianSignupToFirstCheckin: number | null;
  medianFirstCheckinToFirstRating: number | null;
  medianFirstCheckinToSecondBrewery: number | null;
  medianSignupToFriendAdded: number | null;
  trends: { metric: string; current: number | null; prior: number | null }[];
}

export interface ContentVelocity {
  checkinsPerDay: number;
  ratingsPerDay: number;
  reviewsPerDay: number;
  newBeersPerDay: number;
  acceleration: number;
  dailySeries: { date: string; checkins: number; ratings: number }[];
}

export interface FeatureAdoptionItem {
  feature: string;
  adoptionPct: number;
  trend: number | null;
  totalUsers: number;
}

export interface BreweryHealthScore {
  breweryId: string;
  name: string;
  city: string;
  state: string;
  score: number;
  breakdown: {
    contentFreshness: number;
    engagementRate: number;
    loyaltyAdoption: number;
    ratingTrend: number;
  };
}

export interface SocialGraphMetrics {
  avgFriendsPerUser: number;
  orphanRate: number;
  networkDensity: number;
  socialFeatureAdoption: {
    reactions: number;
    comments: number;
    follows: number;
  };
}

export interface PredictiveSignal {
  type: "user_churn" | "brewery_cancel" | "trending_style";
  id: string;
  name: string;
  probability: number;
  reason: string;
}

export interface RevenueIntelligenceV2 {
  projectedMRR: number;
  estimatedLTV: number;
  monthsToTarget: number;
  trialConversionRate: number;
  churnRateMonthly: number;
}

export interface IntelligenceData {
  magicNumber: MagicNumberInsight[];
  timeToValue: TimeToValueMetrics;
  contentVelocity: ContentVelocity;
  featureAdoption: FeatureAdoptionItem[];
  breweryHealth: { top10: BreweryHealthScore[]; bottom10: BreweryHealthScore[] };
  socialGraph: SocialGraphMetrics;
  predictiveSignals: PredictiveSignal[];
  revenueV2: RevenueIntelligenceV2;
  generatedAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86400000).toISOString();
}

function median(arr: number[]): number | null {
  if (arr.length === 0) return null;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function minutesBetween(a: string, b: string): number {
  return (new Date(b).getTime() - new Date(a).getTime()) / 60000;
}

function bucketByDay(items: { date: string }[], rangeDays: number): Map<string, number> {
  const buckets = new Map<string, number>();
  for (let i = rangeDays - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    buckets.set(d.toISOString().split("T")[0], 0);
  }
  for (const item of items) {
    const day = item.date.split("T")[0];
    if (buckets.has(day)) buckets.set(day, (buckets.get(day) ?? 0) + 1);
  }
  return buckets;
}

// ─── 1. Magic Number Dashboard ───────────────────────────────────────────────

export async function calculateMagicNumber(service: SupabaseClient): Promise<MagicNumberInsight[]> {
  const cutoff = daysAgo(90);

  // Users created 90+ days ago (established cohorts)
  const { data: oldUsers } = await (service as any)
    .from("profiles")
    .select("id, created_at")
    .lt("created_at", cutoff)
    .limit(10000);

  if (!oldUsers || oldUsers.length < 10) return [];

  const userIds = oldUsers.map((u: any) => u.id);
  const userCreatedMap = new Map<string, string>(oldUsers.map((u: any) => [u.id, u.created_at]));

  // Sessions for these users
  const { data: sessions } = await (service as any)
    .from("sessions")
    .select("user_id, brewery_id, started_at")
    .in("user_id", userIds)
    .eq("is_active", false)
    .limit(50000);

  // Beer logs with ratings
  const { data: beerLogs } = await (service as any)
    .from("beer_logs")
    .select("user_id, rating, logged_at")
    .in("user_id", userIds)
    .gt("rating", 0)
    .limit(50000);

  // Friendships
  const { data: friendships } = await (service as any)
    .from("friendships")
    .select("requester_id, addressee_id, created_at")
    .eq("status", "accepted")
    .limit(50000);

  // Build per-user activity maps
  const userSessions = new Map<string, any[]>();
  const userRatings = new Map<string, any[]>();
  const userFriends = new Map<string, string>();

  for (const s of sessions ?? []) {
    if (!userSessions.has(s.user_id)) userSessions.set(s.user_id, []);
    userSessions.get(s.user_id)!.push(s);
  }
  for (const r of beerLogs ?? []) {
    if (!userRatings.has(r.user_id)) userRatings.set(r.user_id, []);
    userRatings.get(r.user_id)!.push(r);
  }
  for (const f of friendships ?? []) {
    if (userIds.includes(f.requester_id)) userFriends.set(f.requester_id, f.created_at);
    if (userIds.includes(f.addressee_id)) userFriends.set(f.addressee_id, f.created_at);
  }

  // Recent activity = retained
  const thirtyDaysAgo = daysAgo(30);
  const retainedUsers = new Set<string>();
  for (const s of sessions ?? []) {
    if (s.started_at >= thirtyDaysAgo) retainedUsers.add(s.user_id);
  }

  // Test signals
  const signals: { label: string; test: (userId: string) => boolean }[] = [
    {
      label: "Checked in at 2+ breweries in first 7 days",
      test: (uid) => {
        const created = userCreatedMap.get(uid);
        if (!created) return false;
        const sevenDaysAfter = new Date(new Date(created).getTime() + 7 * 86400000).toISOString();
        const earlySessions = (userSessions.get(uid) ?? []).filter(
          (s: any) => s.started_at >= created && s.started_at <= sevenDaysAfter,
        );
        const uniqueBreweries = new Set(earlySessions.map((s: any) => s.brewery_id));
        return uniqueBreweries.size >= 2;
      },
    },
    {
      label: "Rated 3+ beers in first 7 days",
      test: (uid) => {
        const created = userCreatedMap.get(uid);
        if (!created) return false;
        const sevenDaysAfter = new Date(new Date(created).getTime() + 7 * 86400000).toISOString();
        const earlyRatings = (userRatings.get(uid) ?? []).filter(
          (r: any) => r.logged_at >= created && r.logged_at <= sevenDaysAfter,
        );
        return earlyRatings.length >= 3;
      },
    },
    {
      label: "Added a friend in first 7 days",
      test: (uid) => {
        const created = userCreatedMap.get(uid);
        const friendDate = userFriends.get(uid);
        if (!created || !friendDate) return false;
        const sevenDaysAfter = new Date(new Date(created).getTime() + 7 * 86400000).toISOString();
        return friendDate >= created && friendDate <= sevenDaysAfter;
      },
    },
    {
      label: "Visited same brewery 2+ times in first 14 days",
      test: (uid) => {
        const created = userCreatedMap.get(uid);
        if (!created) return false;
        const fourteenDaysAfter = new Date(new Date(created).getTime() + 14 * 86400000).toISOString();
        const earlySessions = (userSessions.get(uid) ?? []).filter(
          (s: any) => s.started_at >= created && s.started_at <= fourteenDaysAfter,
        );
        const breweryCounts = new Map<string, number>();
        for (const s of earlySessions) {
          breweryCounts.set(s.brewery_id, (breweryCounts.get(s.brewery_id) ?? 0) + 1);
        }
        return Array.from(breweryCounts.values()).some((c) => c >= 2);
      },
    },
  ];

  const results: MagicNumberInsight[] = [];
  for (const sig of signals) {
    const cohort = userIds.filter(sig.test);
    const control = userIds.filter((uid: string) => !sig.test(uid));

    const cohortRetained = cohort.filter((uid: string) => retainedUsers.has(uid)).length;
    const controlRetained = control.filter((uid: string) => retainedUsers.has(uid)).length;

    const cohortRetention = cohort.length > 0 ? cohortRetained / cohort.length : 0;
    const controlRetention = control.length > 0 ? controlRetained / control.length : 0;

    const correlation = controlRetention > 0 ? cohortRetention / controlRetention : cohortRetention > 0 ? 999 : 1;

    results.push({
      signal: sig.label,
      correlation: Math.round(correlation * 10) / 10,
      cohortSize: cohort.length,
      controlSize: control.length,
      cohortRetention90d: Math.round(cohortRetention * 1000) / 10,
      controlRetention90d: Math.round(controlRetention * 1000) / 10,
    });
  }

  return results.sort((a, b) => b.correlation - a.correlation);
}

// ─── 2. Time-to-Value Metrics ────────────────────────────────────────────────

export async function calculateTimeToValue(service: SupabaseClient): Promise<TimeToValueMetrics> {
  const ninetyDaysAgo = daysAgo(90);
  const fortyFiveDaysAgo = daysAgo(45);

  // Recent signups
  const { data: profiles } = await (service as any)
    .from("profiles")
    .select("id, created_at")
    .gte("created_at", ninetyDaysAgo)
    .limit(10000);

  if (!profiles || profiles.length === 0) {
    return {
      medianSignupToFirstCheckin: null,
      medianFirstCheckinToFirstRating: null,
      medianFirstCheckinToSecondBrewery: null,
      medianSignupToFriendAdded: null,
      trends: [],
    };
  }

  const userIds = profiles.map((p: any) => p.id);
  const userCreatedMap = new Map<string, string>(profiles.map((p: any) => [p.id, p.created_at]));

  // First sessions per user
  const { data: sessions } = await (service as any)
    .from("sessions")
    .select("user_id, brewery_id, started_at")
    .in("user_id", userIds)
    .eq("is_active", false)
    .order("started_at", { ascending: true })
    .limit(50000);

  // First ratings per user
  const { data: ratings } = await (service as any)
    .from("beer_logs")
    .select("user_id, logged_at")
    .in("user_id", userIds)
    .gt("rating", 0)
    .order("logged_at", { ascending: true })
    .limit(50000);

  // Friendships
  const { data: friends } = await (service as any)
    .from("friendships")
    .select("requester_id, addressee_id, created_at")
    .eq("status", "accepted")
    .or(`requester_id.in.(${userIds.join(",")}),addressee_id.in.(${userIds.join(",")})`)
    .order("created_at", { ascending: true })
    .limit(10000);

  // Build first-event maps
  const firstSession = new Map<string, any>();
  const secondBrewery = new Map<string, string>();
  const firstRating = new Map<string, string>();
  const firstFriend = new Map<string, string>();

  for (const s of sessions ?? []) {
    if (!firstSession.has(s.user_id)) {
      firstSession.set(s.user_id, s);
    } else if (!secondBrewery.has(s.user_id)) {
      const first = firstSession.get(s.user_id);
      if (first.brewery_id !== s.brewery_id) {
        secondBrewery.set(s.user_id, s.started_at);
      }
    }
  }

  for (const r of ratings ?? []) {
    if (!firstRating.has(r.user_id)) firstRating.set(r.user_id, r.logged_at);
  }

  for (const f of friends ?? []) {
    if (userIds.includes(f.requester_id) && !firstFriend.has(f.requester_id)) {
      firstFriend.set(f.requester_id, f.created_at);
    }
    if (userIds.includes(f.addressee_id) && !firstFriend.has(f.addressee_id)) {
      firstFriend.set(f.addressee_id, f.created_at);
    }
  }

  // Compute deltas
  const signupToCheckin: number[] = [];
  const checkinToRating: number[] = [];
  const checkinToSecond: number[] = [];
  const signupToFriend: number[] = [];

  for (const p of profiles) {
    const fs = firstSession.get(p.id);
    if (fs) signupToCheckin.push(minutesBetween(p.created_at, fs.started_at));

    const fr = firstRating.get(p.id);
    if (fs && fr) checkinToRating.push(minutesBetween(fs.started_at, fr));

    const sb = secondBrewery.get(p.id);
    if (fs && sb) checkinToSecond.push(minutesBetween(fs.started_at, sb));

    const ff = firstFriend.get(p.id);
    if (ff) signupToFriend.push(minutesBetween(p.created_at, ff));
  }

  // Split into recent vs prior for trends
  const recentUsers = profiles.filter((p: any) => p.created_at >= fortyFiveDaysAgo);
  const priorUsers = profiles.filter((p: any) => p.created_at < fortyFiveDaysAgo);

  const recentSignupToCheckin: number[] = [];
  const priorSignupToCheckin: number[] = [];
  for (const p of recentUsers) {
    const fs = firstSession.get(p.id);
    if (fs) recentSignupToCheckin.push(minutesBetween(p.created_at, fs.started_at));
  }
  for (const p of priorUsers) {
    const fs = firstSession.get(p.id);
    if (fs) priorSignupToCheckin.push(minutesBetween(p.created_at, fs.started_at));
  }

  return {
    medianSignupToFirstCheckin: median(signupToCheckin),
    medianFirstCheckinToFirstRating: median(checkinToRating),
    medianFirstCheckinToSecondBrewery: median(checkinToSecond),
    medianSignupToFriendAdded: median(signupToFriend),
    trends: [
      {
        metric: "Signup → First Check-in",
        current: median(recentSignupToCheckin),
        prior: median(priorSignupToCheckin),
      },
    ],
  };
}

// ─── 3. Content Velocity ─────────────────────────────────────────────────────

export async function calculateContentVelocity(
  service: SupabaseClient,
  rangeDays: number = 30,
): Promise<ContentVelocity> {
  const rangeStart = daysAgo(rangeDays);
  const halfRangeStart = daysAgo(Math.floor(rangeDays / 2));

  const [
    { data: sessionRows },
    { data: ratingRows },
    { data: beerRows },
  ] = await Promise.all([
    (service as any)
      .from("sessions")
      .select("started_at")
      .eq("is_active", false)
      .gte("started_at", rangeStart)
      .limit(50000),
    (service as any)
      .from("beer_logs")
      .select("logged_at, rating, review_text")
      .gte("logged_at", rangeStart)
      .limit(50000),
    (service as any)
      .from("beers")
      .select("created_at")
      .gte("created_at", rangeStart)
      .limit(10000),
  ]);

  const sessions = sessionRows ?? [];
  const ratings = ratingRows ?? [];
  const beers = beerRows ?? [];

  const totalDays = Math.max(rangeDays, 1);
  const checkinsPerDay = Math.round((sessions.length / totalDays) * 10) / 10;
  const ratedLogs = ratings.filter((r: any) => r.rating > 0);
  const ratingsPerDay = Math.round((ratedLogs.length / totalDays) * 10) / 10;
  const reviewLogs = ratings.filter((r: any) => r.review_text);
  const reviewsPerDay = Math.round((reviewLogs.length / totalDays) * 10) / 10;
  const newBeersPerDay = Math.round((beers.length / totalDays) * 10) / 10;

  // Acceleration: compare first half vs second half
  const firstHalfSessions = sessions.filter((s: any) => s.started_at < halfRangeStart).length;
  const secondHalfSessions = sessions.filter((s: any) => s.started_at >= halfRangeStart).length;
  const acceleration =
    firstHalfSessions > 0
      ? Math.round(((secondHalfSessions - firstHalfSessions) / firstHalfSessions) * 100)
      : secondHalfSessions > 0
        ? 100
        : 0;

  // Daily series
  const sessionBuckets = bucketByDay(
    sessions.map((s: any) => ({ date: s.started_at })),
    rangeDays,
  );
  const ratingBuckets = bucketByDay(
    ratedLogs.map((r: any) => ({ date: r.logged_at })),
    rangeDays,
  );

  const dailySeries: ContentVelocity["dailySeries"] = [];
  for (const [date, checkins] of sessionBuckets) {
    dailySeries.push({ date, checkins, ratings: ratingBuckets.get(date) ?? 0 });
  }

  return { checkinsPerDay, ratingsPerDay, reviewsPerDay, newBeersPerDay, acceleration, dailySeries };
}

// ─── 4. Feature Adoption Matrix ──────────────────────────────────────────────

export async function calculateFeatureAdoption(service: SupabaseClient): Promise<FeatureAdoptionItem[]> {
  const thirtyDaysAgo = daysAgo(30);
  const sixtyDaysAgo = daysAgo(60);

  // MAU
  const { data: mauSessions } = await (service as any)
    .from("sessions")
    .select("user_id")
    .eq("is_active", false)
    .gte("started_at", thirtyDaysAgo)
    .limit(50000);

  const mau = new Set((mauSessions ?? []).map((s: any) => s.user_id)).size;
  if (mau === 0) return [];

  // Prior MAU for trends
  const { data: priorMauSessions } = await (service as any)
    .from("sessions")
    .select("user_id")
    .eq("is_active", false)
    .gte("started_at", sixtyDaysAgo)
    .lt("started_at", thirtyDaysAgo)
    .limit(50000);
  const priorMau = new Set((priorMauSessions ?? []).map((s: any) => s.user_id)).size;

  // Feature queries in parallel
  const [
    { data: checkinUsers },
    { data: ratingUsers },
    { data: reviewUsers },
    { data: friendUsers },
    { data: achievementUsers },
    { data: followUsers },
    { data: reactionUsers },
    { data: commentUsers },
  ] = await Promise.all([
    // Check-ins
    (service as any).from("sessions").select("user_id").eq("is_active", false).gte("started_at", thirtyDaysAgo).limit(50000),
    // Ratings
    (service as any).from("beer_logs").select("user_id").gt("rating", 0).gte("logged_at", thirtyDaysAgo).limit(50000),
    // Reviews (written text)
    (service as any).from("beer_logs").select("user_id").not("review_text", "is", null).gte("logged_at", thirtyDaysAgo).limit(50000),
    // Friends added
    (service as any).from("friendships").select("requester_id").eq("status", "accepted").gte("created_at", thirtyDaysAgo).limit(10000),
    // Achievements unlocked
    (service as any).from("user_achievements").select("user_id").gte("unlocked_at", thirtyDaysAgo).limit(10000),
    // Brewery follows
    (service as any).from("brewery_follows").select("user_id").gte("created_at", thirtyDaysAgo).limit(10000),
    // Reactions
    (service as any).from("reactions").select("user_id").gte("created_at", thirtyDaysAgo).limit(10000),
    // Comments
    (service as any).from("session_comments").select("user_id").gte("created_at", thirtyDaysAgo).limit(10000),
  ]);

  const features: { name: string; users: Set<string> }[] = [
    { name: "Check-ins", users: new Set((checkinUsers ?? []).map((r: any) => r.user_id)) },
    { name: "Ratings", users: new Set((ratingUsers ?? []).map((r: any) => r.user_id)) },
    { name: "Reviews", users: new Set((reviewUsers ?? []).map((r: any) => r.user_id)) },
    { name: "Friends", users: new Set((friendUsers ?? []).map((r: any) => r.requester_id)) },
    { name: "Achievements", users: new Set((achievementUsers ?? []).map((r: any) => r.user_id)) },
    { name: "Brewery Follows", users: new Set((followUsers ?? []).map((r: any) => r.user_id)) },
    { name: "Reactions", users: new Set((reactionUsers ?? []).map((r: any) => r.user_id)) },
    { name: "Comments", users: new Set((commentUsers ?? []).map((r: any) => r.user_id)) },
  ];

  return features
    .map((f) => ({
      feature: f.name,
      adoptionPct: Math.round((f.users.size / mau) * 1000) / 10,
      trend: priorMau > 0 ? Math.round(((f.users.size / mau - f.users.size / priorMau) / (f.users.size / priorMau || 1)) * 100) : null,
      totalUsers: f.users.size,
    }))
    .sort((a, b) => b.adoptionPct - a.adoptionPct);
}

// ─── 5. Brewery Health Scores ────────────────────────────────────────────────

export async function calculateBreweryHealth(
  service: SupabaseClient,
): Promise<{ top10: BreweryHealthScore[]; bottom10: BreweryHealthScore[] }> {
  const thirtyDaysAgo = daysAgo(30);
  const sixtyDaysAgo = daysAgo(60);

  // Verified breweries
  const { data: breweries } = await (service as any)
    .from("brewery_accounts")
    .select("brewery_id, brewery:breweries(id, name, city, state)")
    .eq("verified", true)
    .limit(5000);

  if (!breweries || breweries.length === 0) return { top10: [], bottom10: [] };

  const breweryIds = breweries.map((b: any) => b.brewery_id);

  const [
    { data: tapBeers },
    { data: recentSessions },
    { data: loyaltyPrograms },
    { data: recentRatings },
    { data: priorRatings },
    { data: follows },
  ] = await Promise.all([
    (service as any).from("beers").select("brewery_id, updated_at").eq("is_on_tap", true).in("brewery_id", breweryIds).limit(50000),
    (service as any).from("sessions").select("brewery_id, user_id").eq("is_active", false).gte("started_at", thirtyDaysAgo).in("brewery_id", breweryIds).limit(50000),
    (service as any).from("loyalty_programs").select("brewery_id, is_active").in("brewery_id", breweryIds).limit(5000),
    (service as any).from("beer_logs").select("rating, beer:beers(brewery_id)").gt("rating", 0).gte("logged_at", thirtyDaysAgo).limit(50000),
    (service as any).from("beer_logs").select("rating, beer:beers(brewery_id)").gt("rating", 0).gte("logged_at", sixtyDaysAgo).lt("logged_at", thirtyDaysAgo).limit(50000),
    (service as any).from("brewery_follows").select("brewery_id").in("brewery_id", breweryIds).limit(50000),
  ]);

  // Per-brewery aggregation
  const now = Date.now();
  const scores: BreweryHealthScore[] = [];

  for (const b of breweries) {
    const bid = b.brewery_id;
    const brewery = b.brewery;
    if (!brewery) continue;

    // Content Freshness (0-25): tap list updated recently
    const beerUpdates = (tapBeers ?? []).filter((tb: any) => tb.brewery_id === bid);
    const latestUpdate = beerUpdates.reduce((latest: number, tb: any) => {
      const t = new Date(tb.updated_at).getTime();
      return t > latest ? t : latest;
    }, 0);
    const daysSinceUpdate = latestUpdate > 0 ? (now - latestUpdate) / 86400000 : 999;
    const contentFreshness = daysSinceUpdate <= 7 ? 25 : daysSinceUpdate <= 14 ? 18 : daysSinceUpdate <= 30 ? 10 : 0;

    // Engagement Rate (0-25): sessions per follower in last 30d
    const sessionCount = (recentSessions ?? []).filter((s: any) => s.brewery_id === bid).length;
    const followerCount = (follows ?? []).filter((f: any) => f.brewery_id === bid).length;
    const engagementRate = followerCount > 0 ? Math.min(25, Math.round((sessionCount / followerCount) * 5)) : sessionCount > 0 ? 10 : 0;

    // Loyalty Adoption (0-25)
    const loyalty = (loyaltyPrograms ?? []).find((lp: any) => lp.brewery_id === bid);
    const loyaltyAdoption = loyalty?.is_active ? 25 : loyalty ? 10 : 0;

    // Rating Trend (0-25): recent vs prior avg rating
    const recentBreweryRatings = (recentRatings ?? []).filter((r: any) => r.beer?.brewery_id === bid);
    const priorBreweryRatings = (priorRatings ?? []).filter((r: any) => r.beer?.brewery_id === bid);
    const recentAvg = recentBreweryRatings.length > 0
      ? recentBreweryRatings.reduce((sum: number, r: any) => sum + r.rating, 0) / recentBreweryRatings.length
      : 0;
    const priorAvg = priorBreweryRatings.length > 0
      ? priorBreweryRatings.reduce((sum: number, r: any) => sum + r.rating, 0) / priorBreweryRatings.length
      : 0;
    const ratingTrend = recentAvg >= priorAvg
      ? (recentBreweryRatings.length > 0 ? Math.min(25, Math.round(recentAvg * 5)) : 0)
      : Math.max(0, Math.round(recentAvg * 5) - 5);

    const score = contentFreshness + engagementRate + loyaltyAdoption + ratingTrend;

    scores.push({
      breweryId: bid,
      name: brewery.name,
      city: brewery.city ?? "",
      state: brewery.state ?? "",
      score,
      breakdown: { contentFreshness, engagementRate, loyaltyAdoption, ratingTrend },
    });
  }

  scores.sort((a, b) => b.score - a.score);

  return {
    top10: scores.slice(0, 10),
    bottom10: scores.slice(-10).reverse(),
  };
}

// ─── 6. Social Graph Health ──────────────────────────────────────────────────

export async function calculateSocialGraph(service: SupabaseClient): Promise<SocialGraphMetrics> {
  const thirtyDaysAgo = daysAgo(30);

  const [
    { count: totalUsers },
    { count: totalFriendships },
    { data: friendshipPairs },
    { count: recentReactions },
    { count: recentComments },
    { count: recentFollows },
    { count: recentSessions },
  ] = await Promise.all([
    (service as any).from("profiles").select("id", { count: "exact", head: true }),
    (service as any).from("friendships").select("id", { count: "exact", head: true }).eq("status", "accepted"),
    (service as any).from("friendships").select("requester_id, addressee_id").eq("status", "accepted").limit(50000),
    (service as any).from("reactions").select("id", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
    (service as any).from("session_comments").select("id", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
    (service as any).from("brewery_follows").select("id", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
    (service as any).from("sessions").select("id", { count: "exact", head: true }).eq("is_active", false).gte("started_at", thirtyDaysAgo),
  ]);

  const users = totalUsers ?? 1;
  const edges = totalFriendships ?? 0;

  // Users with at least one friend
  const usersWithFriends = new Set<string>();
  for (const f of friendshipPairs ?? []) {
    usersWithFriends.add(f.requester_id);
    usersWithFriends.add(f.addressee_id);
  }

  const avgFriendsPerUser = users > 0 ? Math.round(((edges * 2) / users) * 10) / 10 : 0;
  const orphanRate = users > 0 ? Math.round(((users - usersWithFriends.size) / users) * 1000) / 10 : 100;
  const maxEdges = (users * (users - 1)) / 2;
  const networkDensity = maxEdges > 0 ? Math.round((edges / maxEdges) * 10000) / 100 : 0;

  const sessionsCount = recentSessions ?? 1;
  return {
    avgFriendsPerUser,
    orphanRate,
    networkDensity,
    socialFeatureAdoption: {
      reactions: sessionsCount > 0 ? Math.round(((recentReactions ?? 0) / sessionsCount) * 1000) / 10 : 0,
      comments: sessionsCount > 0 ? Math.round(((recentComments ?? 0) / sessionsCount) * 1000) / 10 : 0,
      follows: sessionsCount > 0 ? Math.round(((recentFollows ?? 0) / sessionsCount) * 1000) / 10 : 0,
    },
  };
}

// ─── 7. Predictive Signals ───────────────────────────────────────────────────

export async function calculatePredictiveSignals(service: SupabaseClient): Promise<PredictiveSignal[]> {
  const fourteenDaysAgo = daysAgo(14);
  const twentyEightDaysAgo = daysAgo(28);
  const sevenDaysAgo = daysAgo(7);

  // User churn: frequency decrease
  const [{ data: recentUserSessions }, { data: priorUserSessions }] = await Promise.all([
    (service as any).from("sessions").select("user_id").eq("is_active", false).gte("started_at", fourteenDaysAgo).limit(50000),
    (service as any).from("sessions").select("user_id").eq("is_active", false).gte("started_at", twentyEightDaysAgo).lt("started_at", fourteenDaysAgo).limit(50000),
  ]);

  const recentCounts = new Map<string, number>();
  const priorCounts = new Map<string, number>();
  for (const s of recentUserSessions ?? []) recentCounts.set(s.user_id, (recentCounts.get(s.user_id) ?? 0) + 1);
  for (const s of priorUserSessions ?? []) priorCounts.set(s.user_id, (priorCounts.get(s.user_id) ?? 0) + 1);

  const churnRisks: PredictiveSignal[] = [];
  for (const [userId, priorCount] of priorCounts) {
    const recentCount = recentCounts.get(userId) ?? 0;
    if (priorCount >= 2 && recentCount <= priorCount * 0.5) {
      const probability = Math.round((1 - recentCount / priorCount) * 100);
      churnRisks.push({
        type: "user_churn",
        id: userId,
        name: userId.slice(0, 8),
        probability,
        reason: `${priorCount} sessions prior 14d → ${recentCount} recent 14d`,
      });
    }
  }

  // Trending styles
  const [{ data: recentStyleLogs }, { data: priorStyleLogs }] = await Promise.all([
    (service as any).from("beer_logs").select("beer:beers(style)").gte("logged_at", sevenDaysAgo).limit(50000),
    (service as any).from("beer_logs").select("beer:beers(style)").gte("logged_at", fourteenDaysAgo).lt("logged_at", sevenDaysAgo).limit(50000),
  ]);

  const recentStyleCounts = new Map<string, number>();
  const priorStyleCounts = new Map<string, number>();
  for (const l of recentStyleLogs ?? []) {
    const style = l.beer?.style;
    if (style) recentStyleCounts.set(style, (recentStyleCounts.get(style) ?? 0) + 1);
  }
  for (const l of priorStyleLogs ?? []) {
    const style = l.beer?.style;
    if (style) priorStyleCounts.set(style, (priorStyleCounts.get(style) ?? 0) + 1);
  }

  const trendingStyles: PredictiveSignal[] = [];
  for (const [style, recent] of recentStyleCounts) {
    const prior = priorStyleCounts.get(style) ?? 0;
    if (prior > 0 && recent >= prior * 1.5 && recent >= 5) {
      const growthPct = Math.round(((recent - prior) / prior) * 100);
      trendingStyles.push({
        type: "trending_style",
        id: style,
        name: style,
        probability: growthPct,
        reason: `${prior} → ${recent} logs (+${growthPct}%)`,
      });
    }
  }

  // Enrich churn risks with display names
  const topChurnRisks = churnRisks.sort((a, b) => b.probability - a.probability).slice(0, 10);
  if (topChurnRisks.length > 0) {
    const churnUserIds = topChurnRisks.map((r) => r.id);
    const { data: profiles } = await (service as any)
      .from("profiles")
      .select("id, display_name, username")
      .in("id", churnUserIds);

    for (const risk of topChurnRisks) {
      const profile = (profiles ?? []).find((p: any) => p.id === risk.id);
      if (profile) risk.name = profile.display_name || profile.username || risk.name;
    }
  }

  return [
    ...topChurnRisks,
    ...trendingStyles.sort((a, b) => b.probability - a.probability).slice(0, 5),
  ];
}

// ─── 8. Revenue Intelligence v2 ──────────────────────────────────────────────

export async function calculateRevenueV2(service: SupabaseClient): Promise<RevenueIntelligenceV2> {
  const TIER_PRICES: Record<string, number> = { tap: 49, cask: 149, barrel: 299 };
  const TARGET_MRR = 75000;

  const [
    { data: accounts },
    { data: claims },
  ] = await Promise.all([
    (service as any).from("brewery_accounts").select("subscription_tier, subscription_status, verified, trial_ends_at").limit(50000),
    (service as any).from("brewery_claims").select("status").limit(10000),
  ]);

  const allAccounts = accounts ?? [];

  // Current MRR
  const paidAccounts = allAccounts.filter((a: any) => a.subscription_status === "active" && a.subscription_tier);
  let currentMRR = 0;
  for (const a of paidAccounts) {
    currentMRR += TIER_PRICES[a.subscription_tier] ?? 0;
  }

  // Trial pipeline
  const inTrial = allAccounts.filter(
    (a: any) => a.verified && !a.subscription_tier && a.trial_ends_at && new Date(a.trial_ends_at) > new Date(),
  ).length;

  // Conversion + churn rates
  const totalClaims = claims?.length ?? 0;
  const approvedClaims = (claims ?? []).filter((c: any) => c.status === "approved").length;
  const converted = paidAccounts.length;
  const churned = allAccounts.filter(
    (a: any) => a.verified && !a.subscription_tier && a.trial_ends_at && new Date(a.trial_ends_at) <= new Date(),
  ).length;

  const trialConversionRate = (converted + churned) > 0 ? Math.round((converted / (converted + churned)) * 1000) / 10 : 0;
  const churnRateMonthly = (converted + churned) > 0 ? Math.round((churned / (converted + churned)) * 1000) / 10 : 0;

  // Projections
  const avgTierPrice = converted > 0 ? currentMRR / converted : TIER_PRICES.tap;
  const projectedFromTrials = Math.round(inTrial * (trialConversionRate / 100) * avgTierPrice);
  const projectedMRR = currentMRR + projectedFromTrials;

  const estimatedLTV = churnRateMonthly > 0
    ? Math.round(avgTierPrice / (churnRateMonthly / 100))
    : Math.round(avgTierPrice * 24);

  const monthlyGrowth = projectedMRR - currentMRR;
  const monthsToTarget = monthlyGrowth > 0
    ? Math.ceil((TARGET_MRR - projectedMRR) / monthlyGrowth)
    : projectedMRR >= TARGET_MRR
      ? 0
      : 999;

  return {
    projectedMRR,
    estimatedLTV,
    monthsToTarget: Math.max(0, monthsToTarget),
    trialConversionRate,
    churnRateMonthly,
  };
}

// ─── Main Aggregator ─────────────────────────────────────────────────────────

export async function calculateIntelligenceData(service: SupabaseClient): Promise<IntelligenceData> {
  // Run independent calculations in parallel
  const [timeToValue, contentVelocity, featureAdoption, socialGraph, predictiveSignals, revenueV2] =
    await Promise.all([
      calculateTimeToValue(service),
      calculateContentVelocity(service),
      calculateFeatureAdoption(service),
      calculateSocialGraph(service),
      calculatePredictiveSignals(service),
      calculateRevenueV2(service),
    ]);

  // These two are heavier — keep them out of the main parallel batch
  // They're lazy-loaded via separate endpoints
  return {
    magicNumber: [],
    timeToValue,
    contentVelocity,
    featureAdoption,
    breweryHealth: { top10: [], bottom10: [] },
    socialGraph,
    predictiveSignals,
    revenueV2,
    generatedAt: new Date().toISOString(),
  };
}
