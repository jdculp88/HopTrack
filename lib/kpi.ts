/**
 * KPI calculation engine for brewery dashboard and drinker profiles
 * All derived from existing data — zero migrations needed
 * Sprint 124 — The Pulse
 */

// ── Brewery KPIs ────────────────────────────────────────────────────────────

export interface BreweryKPIs {
  avgSessionDuration: number | null; // minutes
  avgSessionDurationTrend: number | null; // % change WoW
  beersPerVisit: number | null;
  beersPerVisitTrend: number | null;
  newVisitorPct: number | null; // % of visitors with 1 visit
  returningVisitorPct: number | null; // % of visitors with 2+ visits
  visitorSplitTrend: number | null; // change in returning % WoW
  retentionRate: number | null; // % who visited both this and last period
  retentionTrend: number | null;
  loyaltyConversionRate: number | null; // loyalty members / unique visitors
  loyaltyRedemptions: number;
  loyaltyRedemptionsTrend: number | null;
  topCustomer: { name: string; visits: number } | null;
  peakHour: { hour: number; label: string; count: number } | null;
  avgRatingTrend: number | null; // rating change vs prior period
  reviewSentiment: { positive: number; neutral: number; negative: number } | null;
  followerGrowthRate: number | null; // % growth in period
  tapListFreshness: number | null; // avg days since beer added
}

export interface BreweryKPISparklines {
  avgDuration: number[]; // 7 daily values
  beersPerVisit: number[]; // 7 daily values
  returningPct: number[]; // 7 daily values
  retention: number[]; // 4 weekly values
}

interface Session {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  is_active?: boolean;
}

interface BeerLog {
  id: string;
  beer_id?: string;
  user_id?: string;
  rating?: number;
  quantity?: number;
  logged_at: string;
  session_id?: string;
  beer?: { name?: string; style?: string; abv?: number; created_at?: string };
}

interface BreweryVisit {
  user_id: string;
  total_visits: number;
}

interface LoyaltyCard {
  user_id: string;
}

interface LoyaltyRedemption {
  id: string;
  redeemed_at: string;
}

interface Follower {
  created_at: string;
}

interface Beer {
  id: string;
  created_at: string;
  is_on_tap?: boolean;
}

interface Profile {
  display_name?: string;
  username?: string;
}

export function calculateBreweryKPIs(opts: {
  sessions: Session[];
  beerLogs: BeerLog[];
  breweryVisits?: BreweryVisit[];
  loyaltyCards?: LoyaltyCard[];
  loyaltyRedemptions?: LoyaltyRedemption[];
  followers?: Follower[];
  beers?: Beer[];
  profiles?: Record<string, Profile>;
  periodDays?: number; // default 30
}): BreweryKPIs {
  const periodDays = opts.periodDays ?? 30;
  const now = Date.now();
  const periodStart = now - periodDays * 86400000;
  const priorStart = periodStart - periodDays * 86400000;

  const sessions = opts.sessions;
  const beerLogs = opts.beerLogs;

  // Filter to current and prior periods
  const currentSessions = sessions.filter(s => new Date(s.started_at).getTime() >= periodStart);
  const priorSessions = sessions.filter(s => {
    const t = new Date(s.started_at).getTime();
    return t >= priorStart && t < periodStart;
  });

  // ── Avg Session Duration ──────────────────────────────────────────────────
  const durations = currentSessions
    .filter(s => s.ended_at)
    .map(s => (new Date(s.ended_at!).getTime() - new Date(s.started_at).getTime()) / 60000)
    .filter(d => d > 0 && d < 720); // exclude impossibly long sessions (12h+)

  const avgSessionDuration = durations.length > 0
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : null;

  const priorDurations = priorSessions
    .filter(s => s.ended_at)
    .map(s => (new Date(s.ended_at!).getTime() - new Date(s.started_at).getTime()) / 60000)
    .filter(d => d > 0 && d < 720);

  const priorAvgDuration = priorDurations.length > 0
    ? priorDurations.reduce((a, b) => a + b, 0) / priorDurations.length
    : null;

  const avgSessionDurationTrend = avgSessionDuration && priorAvgDuration
    ? Math.round(((avgSessionDuration - priorAvgDuration) / priorAvgDuration) * 100)
    : null;

  // ── Beers Per Visit ───────────────────────────────────────────────────────
  const currentLogs = beerLogs.filter(l => new Date(l.logged_at).getTime() >= periodStart);
  const currentPours = currentLogs.reduce((sum, l) => sum + (l.quantity ?? 1), 0);
  const beersPerVisit = currentSessions.length > 0
    ? Math.round((currentPours / currentSessions.length) * 10) / 10
    : null;

  const priorLogs = beerLogs.filter(l => {
    const t = new Date(l.logged_at).getTime();
    return t >= priorStart && t < periodStart;
  });
  const priorPours = priorLogs.reduce((sum, l) => sum + (l.quantity ?? 1), 0);
  const priorBpv = priorSessions.length > 0
    ? priorPours / priorSessions.length
    : null;

  const beersPerVisitTrend = beersPerVisit && priorBpv
    ? Math.round(((beersPerVisit - priorBpv) / priorBpv) * 100)
    : null;

  // ── New vs Returning Visitors ─────────────────────────────────────────────
  const visits = opts.breweryVisits ?? [];
  const totalVisitors = visits.length;
  const newVisitors = visits.filter(v => v.total_visits === 1).length;
  const returningVisitors = visits.filter(v => v.total_visits >= 2).length;
  const newVisitorPct = totalVisitors > 0 ? Math.round((newVisitors / totalVisitors) * 100) : null;
  const returningVisitorPct = totalVisitors > 0 ? Math.round((returningVisitors / totalVisitors) * 100) : null;

  // Trend: compare current period returning % vs prior period
  const currentVisitorIds = new Set(currentSessions.map(s => s.user_id));
  const priorVisitorIds = new Set(priorSessions.map(s => s.user_id));
  const currentReturning = [...currentVisitorIds].filter(id => {
    const v = visits.find(v => v.user_id === id);
    return v && v.total_visits >= 2;
  }).length;
  const priorReturning = [...priorVisitorIds].filter(id => {
    const v = visits.find(v => v.user_id === id);
    return v && v.total_visits >= 2;
  }).length;
  const currentRetPct = currentVisitorIds.size > 0 ? (currentReturning / currentVisitorIds.size) * 100 : 0;
  const priorRetPct = priorVisitorIds.size > 0 ? (priorReturning / priorVisitorIds.size) * 100 : 0;
  const visitorSplitTrend = priorRetPct > 0
    ? Math.round(currentRetPct - priorRetPct)
    : null;

  // ── Customer Retention Rate ───────────────────────────────────────────────
  // % of prior period visitors who also visited in current period
  const retainedCount = [...priorVisitorIds].filter(id => currentVisitorIds.has(id)).length;
  const retentionRate = priorVisitorIds.size > 0
    ? Math.round((retainedCount / priorVisitorIds.size) * 100)
    : null;

  // Retention trend: compare vs the period before prior
  const olderStart = priorStart - periodDays * 86400000;
  const olderVisitorIds = new Set(
    sessions.filter(s => {
      const t = new Date(s.started_at).getTime();
      return t >= olderStart && t < priorStart;
    }).map(s => s.user_id)
  );
  const olderRetained = [...olderVisitorIds].filter(id => priorVisitorIds.has(id)).length;
  const olderRetention = olderVisitorIds.size > 0 ? (olderRetained / olderVisitorIds.size) * 100 : null;
  const retentionTrend = retentionRate !== null && olderRetention !== null
    ? Math.round(retentionRate - olderRetention)
    : null;

  // ── Loyalty Conversion Rate ───────────────────────────────────────────────
  const loyaltyMembers = opts.loyaltyCards?.length ?? 0;
  const uniqueVisitors = new Set(sessions.map(s => s.user_id)).size;
  const loyaltyConversionRate = uniqueVisitors > 0
    ? Math.round((loyaltyMembers / uniqueVisitors) * 100)
    : null;

  // ── Loyalty Redemptions ───────────────────────────────────────────────────
  const redemptions = opts.loyaltyRedemptions ?? [];
  const currentRedemptions = redemptions.filter(r => new Date(r.redeemed_at).getTime() >= periodStart).length;
  const priorRedemptions = redemptions.filter(r => {
    const t = new Date(r.redeemed_at).getTime();
    return t >= priorStart && t < periodStart;
  }).length;
  const loyaltyRedemptionsTrend = priorRedemptions > 0
    ? Math.round(((currentRedemptions - priorRedemptions) / priorRedemptions) * 100)
    : null;

  // ── Top Customer ──────────────────────────────────────────────────────────
  const customerCounts: Record<string, number> = {};
  currentSessions.forEach(s => {
    if (s.user_id) customerCounts[s.user_id] = (customerCounts[s.user_id] ?? 0) + 1;
  });
  const topCustomerId = Object.entries(customerCounts).sort((a, b) => b[1] - a[1])[0];
  const topCustomer = topCustomerId
    ? {
        name: opts.profiles?.[topCustomerId[0]]?.display_name
          ?? opts.profiles?.[topCustomerId[0]]?.username
          ?? "Anonymous",
        visits: topCustomerId[1],
      }
    : null;

  // ── Peak Hour ─────────────────────────────────────────────────────────────
  const hourCounts = Array(24).fill(0);
  currentSessions.forEach(s => { hourCounts[new Date(s.started_at).getHours()]++; });
  const peakHourIdx = hourCounts.indexOf(Math.max(...hourCounts));
  const peakHour = hourCounts[peakHourIdx] > 0
    ? {
        hour: peakHourIdx,
        label: peakHourIdx === 0 ? "12 AM" : peakHourIdx < 12 ? `${peakHourIdx} AM` : peakHourIdx === 12 ? "12 PM" : `${peakHourIdx - 12} PM`,
        count: hourCounts[peakHourIdx],
      }
    : null;

  // ── Avg Rating Trend ──────────────────────────────────────────────────────
  const currentRatings = currentLogs.filter(l => l.rating && l.rating > 0).map(l => l.rating!);
  const priorRatings = priorLogs.filter(l => l.rating && l.rating > 0).map(l => l.rating!);
  const currentAvgRating = currentRatings.length > 0
    ? currentRatings.reduce((a, b) => a + b, 0) / currentRatings.length
    : null;
  const priorAvgRating = priorRatings.length > 0
    ? priorRatings.reduce((a, b) => a + b, 0) / priorRatings.length
    : null;
  const avgRatingTrend = currentAvgRating !== null && priorAvgRating !== null
    ? Math.round((currentAvgRating - priorAvgRating) * 10) / 10
    : null;

  // ── Review Sentiment ──────────────────────────────────────────────────────
  const allRatings = currentRatings;
  const reviewSentiment = allRatings.length > 0
    ? {
        positive: allRatings.filter(r => r >= 4).length,
        neutral: allRatings.filter(r => r >= 2.5 && r < 4).length,
        negative: allRatings.filter(r => r < 2.5).length,
      }
    : null;

  // ── Follower Growth Rate ──────────────────────────────────────────────────
  const followers = opts.followers ?? [];
  const currentFollows = followers.filter(f => new Date(f.created_at).getTime() >= periodStart).length;
  const priorFollows = followers.filter(f => {
    const t = new Date(f.created_at).getTime();
    return t >= priorStart && t < periodStart;
  }).length;
  const followerGrowthRate = priorFollows > 0
    ? Math.round(((currentFollows - priorFollows) / priorFollows) * 100)
    : currentFollows > 0 ? 100 : null;

  // ── Tap List Freshness ────────────────────────────────────────────────────
  const onTapBeers = (opts.beers ?? []).filter(b => b.is_on_tap);
  const tapListFreshness = onTapBeers.length > 0
    ? Math.round(
        onTapBeers.reduce((sum, b) => sum + (now - new Date(b.created_at).getTime()) / 86400000, 0)
        / onTapBeers.length
      )
    : null;

  return {
    avgSessionDuration,
    avgSessionDurationTrend,
    beersPerVisit,
    beersPerVisitTrend,
    newVisitorPct,
    returningVisitorPct,
    visitorSplitTrend,
    retentionRate,
    retentionTrend,
    loyaltyConversionRate,
    loyaltyRedemptions: currentRedemptions,
    loyaltyRedemptionsTrend,
    topCustomer,
    peakHour,
    avgRatingTrend,
    reviewSentiment,
    followerGrowthRate,
    tapListFreshness,
  };
}

export function calculateBreweryKPISparklines(opts: {
  sessions: Session[];
  beerLogs: BeerLog[];
}): BreweryKPISparklines {
  const now = new Date();
  const { sessions, beerLogs } = opts;

  // 7 daily sparklines for duration, beers/visit, returning %
  const avgDuration: number[] = [];
  const beersPerVisitData: number[] = [];
  const returningPct: number[] = [];

  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1);

    const daySessions = sessions.filter(s => {
      const d = new Date(s.started_at);
      return d >= dayStart && d < dayEnd;
    });

    // Duration
    const dayDurations = daySessions
      .filter(s => s.ended_at)
      .map(s => (new Date(s.ended_at!).getTime() - new Date(s.started_at).getTime()) / 60000)
      .filter(d => d > 0 && d < 720);
    avgDuration.push(dayDurations.length > 0
      ? Math.round(dayDurations.reduce((a, b) => a + b, 0) / dayDurations.length)
      : 0);

    // Beers per visit
    const dayLogs = beerLogs.filter(l => {
      const d = new Date(l.logged_at);
      return d >= dayStart && d < dayEnd;
    });
    const dayPours = dayLogs.reduce((sum, l) => sum + (l.quantity ?? 1), 0);
    beersPerVisitData.push(daySessions.length > 0
      ? Math.round((dayPours / daySessions.length) * 10) / 10
      : 0);

    // Returning visitors (visitors who had sessions before this day)
    const dayVisitorIds = new Set(daySessions.map(s => s.user_id));
    const priorVisitorIds = new Set(
      sessions
        .filter(s => new Date(s.started_at) < dayStart)
        .map(s => s.user_id)
    );
    const dayReturning = [...dayVisitorIds].filter(id => priorVisitorIds.has(id)).length;
    returningPct.push(dayVisitorIds.size > 0
      ? Math.round((dayReturning / dayVisitorIds.size) * 100)
      : 0);
  }

  // 4 weekly retention sparkline
  const retention: number[] = [];
  for (let w = 3; w >= 0; w--) {
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (w + 1) * 7);
    const weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - w * 7);
    const prevWeekStart = new Date(weekStart.getTime() - 7 * 86400000);

    const weekVisitors = new Set(
      sessions.filter(s => {
        const d = new Date(s.started_at);
        return d >= weekStart && d < weekEnd;
      }).map(s => s.user_id)
    );
    const prevWeekVisitors = new Set(
      sessions.filter(s => {
        const d = new Date(s.started_at);
        return d >= prevWeekStart && d < weekStart;
      }).map(s => s.user_id)
    );

    const retained = [...prevWeekVisitors].filter(id => weekVisitors.has(id)).length;
    retention.push(prevWeekVisitors.size > 0 ? Math.round((retained / prevWeekVisitors.size) * 100) : 0);
  }

  return { avgDuration, beersPerVisit: beersPerVisitData, returningPct, retention };
}

// ── Drinker KPIs ────────────────────────────────────────────────────────────

export interface DrinkerKPIs {
  avgRating: number | null;
  beersPerSession: number | null;
  favoriteStyle: { name: string; pct: number } | null;
  avgAbv: number | null;
  totalPours: number;
  sessionsThisMonth: number;
  sessionsThisYear: number;
  longestSession: number | null; // minutes
  avgSessionDuration: number | null; // minutes
  newBeersThisMonth: number;
  citiesVisited: number;
  statesVisited: number;
  socialScore: number;
  achievementPct: number | null;
}

export function calculateDrinkerKPIs(opts: {
  sessions: { id: string; started_at: string; ended_at: string | null; brewery_id?: string }[];
  beerLogs: { beer_id?: string; rating?: number; quantity?: number; logged_at: string; beer?: { style?: string; abv?: number } }[];
  breweries?: { id: string; city?: string; state?: string }[];
  friendCount?: number;
  reactionCount?: number;
  commentCount?: number;
  achievementCount?: number;
  totalAchievements?: number;
}): DrinkerKPIs {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const { sessions, beerLogs } = opts;

  // ── Avg Rating ────────────────────────────────────────────────────────────
  const ratings = beerLogs.filter(l => l.rating && l.rating > 0).map(l => l.rating!);
  const avgRating = ratings.length > 0
    ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
    : null;

  // ── Beers Per Session ─────────────────────────────────────────────────────
  const totalPours = beerLogs.reduce((sum, l) => sum + (l.quantity ?? 1), 0);
  const completedSessions = sessions.filter(s => s.ended_at);
  const beersPerSession = completedSessions.length > 0
    ? Math.round((totalPours / completedSessions.length) * 10) / 10
    : null;

  // ── Favorite Style ────────────────────────────────────────────────────────
  const styleCounts: Record<string, number> = {};
  beerLogs.forEach(l => {
    if (l.beer?.style) styleCounts[l.beer.style] = (styleCounts[l.beer.style] ?? 0) + (l.quantity ?? 1);
  });
  const topStyle = Object.entries(styleCounts).sort((a, b) => b[1] - a[1])[0];
  const favoriteStyle = topStyle && totalPours > 0
    ? { name: topStyle[0], pct: Math.round((topStyle[1] / totalPours) * 100) }
    : null;

  // ── Avg ABV ───────────────────────────────────────────────────────────────
  const abvValues = beerLogs.filter(l => l.beer?.abv && l.beer.abv > 0).map(l => l.beer!.abv!);
  const avgAbv = abvValues.length > 0
    ? Math.round((abvValues.reduce((a, b) => a + b, 0) / abvValues.length) * 10) / 10
    : null;

  // ── Sessions This Month / Year ────────────────────────────────────────────
  const sessionsThisMonth = sessions.filter(s => new Date(s.started_at) >= monthStart).length;
  const sessionsThisYear = sessions.filter(s => new Date(s.started_at) >= yearStart).length;

  // ── Longest / Avg Session Duration ────────────────────────────────────────
  const durations = completedSessions
    .map(s => (new Date(s.ended_at!).getTime() - new Date(s.started_at).getTime()) / 60000)
    .filter(d => d > 0 && d < 720);

  const longestSession = durations.length > 0 ? Math.round(Math.max(...durations)) : null;
  const avgSessionDuration = durations.length > 0
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : null;

  // ── New Beers This Month ──────────────────────────────────────────────────
  const beerFirstSeen: Record<string, number> = {};
  beerLogs.forEach(l => {
    if (!l.beer_id) return;
    const t = new Date(l.logged_at).getTime();
    if (!beerFirstSeen[l.beer_id] || t < beerFirstSeen[l.beer_id]) {
      beerFirstSeen[l.beer_id] = t;
    }
  });
  const newBeersThisMonth = Object.values(beerFirstSeen)
    .filter(t => t >= monthStart.getTime()).length;

  // ── Cities / States Visited ───────────────────────────────────────────────
  const breweryMap = new Map((opts.breweries ?? []).map(b => [b.id, b]));
  const visitedBreweryIds = new Set(sessions.map(s => s.brewery_id).filter(Boolean));
  const cities = new Set<string>();
  const states = new Set<string>();
  visitedBreweryIds.forEach(id => {
    const b = breweryMap.get(id!);
    if (b?.city) cities.add(`${b.city},${b.state}`);
    if (b?.state) states.add(b.state);
  });

  // ── Social Score ──────────────────────────────────────────────────────────
  const socialScore = (opts.friendCount ?? 0) + (opts.reactionCount ?? 0) + (opts.commentCount ?? 0);

  // ── Achievement Completion ────────────────────────────────────────────────
  const achievementPct = opts.totalAchievements && opts.totalAchievements > 0
    ? Math.round(((opts.achievementCount ?? 0) / opts.totalAchievements) * 100)
    : null;

  return {
    avgRating,
    beersPerSession,
    favoriteStyle,
    avgAbv,
    totalPours,
    sessionsThisMonth,
    sessionsThisYear,
    longestSession,
    avgSessionDuration,
    newBeersThisMonth,
    citiesVisited: cities.size,
    statesVisited: states.size,
    socialScore,
    achievementPct,
  };
}

// ── Formatting helpers ──────────────────────────────────────────────────────

export function formatDuration(minutes: number | null): string {
  if (minutes === null) return "—";
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatTrend(value: number | null, suffix = "%"): { text: string; color: string } | null {
  if (value === null) return null;
  const isPositive = value >= 0;
  return {
    text: `${isPositive ? "+" : ""}${value}${suffix}`,
    color: isPositive ? "#22c55e" : "#ef4444",
  };
}
