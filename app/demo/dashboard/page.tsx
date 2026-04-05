import { cacheLife, cacheTag } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { DEMO_BREWERY_ID, DEMO_BREWERY_NAME } from "@/lib/constants/demo";
import { calculateBreweryKPIs, calculateBreweryKPISparklines } from "@/lib/kpi";
import { calculateROI } from "@/lib/roi";
import { formatRelativeTime } from "@/lib/dates";
import type { ActivityItem } from "@/app/(brewery-admin)/brewery-admin/[brewery_id]/DashboardClient";
import DemoDashboardClient from "./DemoDashboardClient";

async function fetchDemoDashboardData() {
  "use cache";
  cacheLife("hop-standard");
  cacheTag("demo");

  const supabase = createServiceClient();
  const breweryId = DEMO_BREWERY_ID;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
  const weekAgoStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6).toISOString();
  const twoWeeksAgoStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 13).toISOString();

  // ── Fetch all data in parallel (mirrors brewery dashboard) ────────────
  const [
    { data: brewery },
    { data: beers },
    { data: recentSessions },
    { data: loyaltyProgram },
    { data: allSessions },
    { data: allBeerLogs },
    { count: todayVisitCountRaw },
    { count: todayBeerCountRaw },
    { count: activeCountRaw },
    { data: recentReviews },
    { data: recentFollowers },
  ] = await Promise.all([
    supabase.from("breweries").select("*").eq("id", breweryId).single() as any,
    supabase.from("beers").select("*").eq("brewery_id", breweryId) as any,
    supabase
      .from("sessions")
      .select("*, profile:profiles(display_name, username, avatar_url), beer_logs(id, beer_id, rating, quantity, beer:beers(name, style))")
      .eq("brewery_id", breweryId)
      .eq("is_active", false)
      .order("started_at", { ascending: false })
      .limit(10) as any,
    supabase
      .from("loyalty_programs")
      .select("*, loyalty_cards(count)")
      .eq("brewery_id", breweryId)
      .eq("is_active", true)
      .single() as any,
    supabase
      .from("sessions")
      .select("id, user_id, started_at, ended_at, is_active")
      .eq("brewery_id", breweryId)
      .eq("is_active", false)
      .limit(50000) as any,
    supabase
      .from("beer_logs")
      .select("id, beer_id, rating, quantity, logged_at, beer:beers(name, style)")
      .eq("brewery_id", breweryId)
      .limit(50000) as any,
    supabase
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .eq("brewery_id", breweryId)
      .eq("is_active", false)
      .gte("started_at", todayStart)
      .lt("started_at", tomorrowStart) as any,
    supabase
      .from("beer_logs")
      .select("id", { count: "exact", head: true })
      .eq("brewery_id", breweryId)
      .gte("logged_at", todayStart)
      .lt("logged_at", tomorrowStart) as any,
    supabase
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .eq("brewery_id", breweryId)
      .eq("is_active", true) as any,
    supabase
      .from("brewery_reviews")
      .select("id, rating, comment, created_at, profile:profiles!user_id(display_name, username)")
      .eq("brewery_id", breweryId)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("brewery_follows")
      .select("id, created_at, profile:profiles!user_id(display_name, username)")
      .eq("brewery_id", breweryId)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  // Additional KPI data
  const [
    { data: breweryVisits },
    { data: loyaltyCards },
    { data: loyaltyRedemptions },
    { data: allFollowers },
    { count: totalVisitCountRaw },
    { count: totalBeerCountRaw },
    { count: thisWeekCountRaw },
    { count: lastWeekCountRaw },
  ] = await Promise.all([
    supabase.from("brewery_visits").select("user_id, total_visits").eq("brewery_id", breweryId).limit(50000) as any,
    supabase.from("loyalty_cards").select("user_id").eq("brewery_id", breweryId).limit(50000) as any,
    supabase.from("loyalty_redemptions").select("id, redeemed_at").eq("brewery_id", breweryId).limit(50000) as any,
    supabase.from("brewery_follows").select("id, created_at").eq("brewery_id", breweryId).limit(50000) as any,

    // Accurate counts (bypass PostgREST max-rows cap — S155 P0 fix)
    supabase.from("sessions").select("id", { count: "exact", head: true }).eq("brewery_id", breweryId).eq("is_active", false) as any,
    supabase.from("beer_logs").select("id", { count: "exact", head: true }).eq("brewery_id", breweryId) as any,
    supabase.from("sessions").select("id", { count: "exact", head: true }).eq("brewery_id", breweryId).eq("is_active", false).gte("started_at", weekAgoStart).lt("started_at", tomorrowStart) as any,
    supabase.from("sessions").select("id", { count: "exact", head: true }).eq("brewery_id", breweryId).eq("is_active", false).gte("started_at", twoWeeksAgoStart).lt("started_at", weekAgoStart) as any,
  ]);

  // Build profile lookup for top customer
  const topSessionUserIds = Object.entries(
    ((allSessions as any[]) ?? []).reduce((acc: Record<string, number>, s: any) => {
      if (s.user_id) acc[s.user_id] = (acc[s.user_id] ?? 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 3).map(([id]) => id);

  const { data: topProfiles } = topSessionUserIds.length > 0
    ? await supabase.from("profiles").select("id, display_name, username").in("id", topSessionUserIds) as any
    : { data: [] };

  const profileLookup: Record<string, { display_name?: string; username?: string }> = {};
  ((topProfiles as any[]) ?? []).forEach((p: any) => {
    profileLookup[p.id] = { display_name: p.display_name, username: p.username };
  });

  const { count: totalFollowerCount } = await supabase
    .from("brewery_follows")
    .select("id", { count: "exact", head: true })
    .eq("brewery_id", breweryId);

  const { count: todayNewFollowers } = await supabase
    .from("brewery_follows")
    .select("id", { count: "exact", head: true })
    .eq("brewery_id", breweryId)
    .gte("created_at", todayStart)
    .lt("created_at", tomorrowStart);

  // ── Compute stats ─────────────────────────────────────────────────────
  const sessions = (allSessions as any[]) ?? [];
  const beerLogs = (allBeerLogs as any[]) ?? [];

  const totalVisits = totalVisitCountRaw ?? 0;
  const totalBeersLogged = totalBeerCountRaw ?? 0;
  const uniqueVisitors = new Set(sessions.map((s: any) => s.user_id)).size;

  const todayVisitCount = todayVisitCountRaw ?? 0;
  const todayBeersCount = todayBeerCountRaw ?? 0;
  const activeSessionCount = activeCountRaw ?? 0;

  // Weekly sparkline (uses capped data — relative shape is representative)
  const weeklyData: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1);
    const dayCount = sessions.filter((s: any) => {
      const d = new Date(s.started_at);
      return d >= dayStart && d < dayEnd;
    }).length;
    weeklyData.push(dayCount);
  }

  const thisWeekTotal = thisWeekCountRaw ?? 0;
  const lastWeekTotal = lastWeekCountRaw ?? 0;
  const weekTrend = lastWeekTotal > 0
    ? Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100)
    : null;

  // Top 3 beers
  const beerMap: Record<string, { name: string; style: string; count: number; totalRating: number; ratedCount: number }> = {};
  beerLogs.forEach((l: any) => {
    if (!l.beer_id) return;
    if (!beerMap[l.beer_id]) beerMap[l.beer_id] = { name: l.beer?.name ?? "Unknown", style: l.beer?.style ?? "", count: 0, totalRating: 0, ratedCount: 0 };
    beerMap[l.beer_id].count += l.quantity ?? 1;
    if (l.rating > 0) {
      beerMap[l.beer_id].totalRating += l.rating;
      beerMap[l.beer_id].ratedCount += 1;
    }
  });
  const topBeersList = Object.values(beerMap).sort((a, b) => b.count - a.count).slice(0, 3);

  const onTapCount = ((beers as any[]) ?? []).filter((b: any) => b.is_on_tap).length;
  const totalBeerCount = ((beers as any[]) ?? []).length;

  // KPIs
  const kpis = calculateBreweryKPIs({
    sessions: sessions as any[],
    beerLogs: beerLogs as any[],
    breweryVisits: (breweryVisits as any[]) ?? [],
    loyaltyCards: (loyaltyCards as any[]) ?? [],
    loyaltyRedemptions: (loyaltyRedemptions as any[]) ?? [],
    followers: (allFollowers as any[]) ?? [],
    beers: (beers as any[]) ?? [],
    profiles: profileLookup,
    periodDays: 30,
  });
  const sparklines = calculateBreweryKPISparklines({
    sessions: sessions as any[],
    beerLogs: beerLogs as any[],
  });

  // ROI
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const loyaltyVisitsThisMonth = sessions.filter((s: any) => new Date(s.started_at) >= new Date(monthStart)).length;
  const loyaltyVisitsByWeek: number[] = [];
  for (let w = 3; w >= 0; w--) {
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (w + 1) * 7);
    const weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - w * 7);
    loyaltyVisitsByWeek.push(sessions.filter((s: any) => {
      const d = new Date(s.started_at);
      return d >= weekStart && d < weekEnd;
    }).length);
  }

  const roi = calculateROI({
    loyaltyVisitsThisMonth,
    loyaltyVisitsByWeek,
    subscriptionTier: "tap",
  });

  // Activity feed
  const activityItems: ActivityItem[] = [];
  ((recentSessions as any[]) ?? []).slice(0, 3).forEach((s: any) => {
    const beerCount = ((s.beer_logs as any[]) ?? []).reduce((sum: number, l: any) => sum + (l.quantity ?? 1), 0);
    activityItems.push({
      id: `session-${s.id}`,
      type: "session",
      text: `${s.profile?.display_name ?? "Guest"} visited`,
      subtext: beerCount > 0 ? `${beerCount} beer${beerCount !== 1 ? "s" : ""} logged` : "Brewery visit",
      time: formatRelativeTime(s.started_at),
      icon: "🍺",
    });
  });
  ((recentReviews as any[]) ?? []).slice(0, 2).forEach((r: any) => {
    activityItems.push({
      id: `review-${r.id}`,
      type: "review",
      text: `${(r as any).profile?.display_name ?? "Someone"} left a ${r.rating}-star review`,
      subtext: r.comment ? r.comment.slice(0, 60) + (r.comment.length > 60 ? "..." : "") : "No comment",
      time: formatRelativeTime(r.created_at),
      icon: "⭐",
    });
  });
  ((recentFollowers as any[]) ?? []).slice(0, 2).forEach((f: any) => {
    activityItems.push({
      id: `follow-${f.id}`,
      type: "follower",
      text: `${(f as any).profile?.display_name ?? "Someone"} started following`,
      subtext: "New follower",
      time: formatRelativeTime(f.created_at),
      icon: "💛",
    });
  });

  // Recent visits for display
  const recentVisits = ((recentSessions as any[]) ?? []).slice(0, 6).map((s: any) => {
    const sessionBeerLogs = (s.beer_logs as any[]) ?? [];
    const beerCount = sessionBeerLogs.reduce((sum: number, l: any) => sum + (l.quantity ?? 1), 0);
    const sessionRatings = sessionBeerLogs.filter((l: any) => l.rating > 0);
    const sessionAvg = sessionRatings.length > 0
      ? (sessionRatings.reduce((a: number, l: any) => a + l.rating, 0) / sessionRatings.length).toFixed(1)
      : null;
    const topBeerName = sessionBeerLogs.length > 0 ? (sessionBeerLogs[0]?.beer?.name ?? "Unnamed Beer") : null;

    return {
      id: s.id,
      displayName: s.profile?.display_name ?? "Guest",
      beerCount,
      topBeerName,
      sessionAvg,
      time: formatRelativeTime(s.started_at),
    };
  });

  return {
    breweryName: (brewery as any)?.name ?? DEMO_BREWERY_NAME,
    city: (brewery as any)?.city,
    state: (brewery as any)?.state,
    breweryType: (brewery as any)?.brewery_type,
    todayVisitCount,
    todayBeersCount,
    todayNewFollowers: todayNewFollowers ?? 0,
    activeSessionCount,
    totalVisits,
    totalBeersLogged,
    uniqueVisitors,
    thisWeekTotal,
    weekTrend,
    weeklyData,
    totalFollowerCount: totalFollowerCount ?? 0,
    onTapCount,
    totalBeerCount,
    kpis,
    sparklines,
    roi,
    topBeersList,
    activityFeed: activityItems.slice(0, 5),
    recentVisits,
    hasLoyalty: !!loyaltyProgram,
  };
}

export default async function DemoDashboardPage() {
  const props = await fetchDemoDashboardData();
  return <DemoDashboardClient {...props} />;
}
