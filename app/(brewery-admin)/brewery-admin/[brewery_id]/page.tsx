import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const revalidate = 30; // Revalidate every 30 seconds
import Link from "next/link";
import {
  Beer, Users, TrendingUp, Award, Calendar, ArrowUpRight,
  List, Clock, Heart, BarChart3, QrCode, Eye, Zap, Gift, RefreshCw, ScanLine,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/dates";
import { calculateBreweryKPIs, calculateBreweryKPISparklines, formatDuration, formatTrend } from "@/lib/kpi";
import ROIDashboardCard from "@/components/brewery-admin/ROIDashboardCard";
import { OnboardingChecklist } from "@/components/brewery-admin/OnboardingChecklist";
import { PosDashboardCard } from "@/components/brewery-admin/PosDashboardCard";
import { PosSyncAlertBanner } from "@/components/brewery-admin/PosSyncAlertBanner";
import { AISuggestionsCard } from "@/components/brewery-admin/AISuggestionsCard";
import { Sparkline, ActiveSessionsCounter, RecentActivityFeed } from "./DashboardClient";
import type { ActivityItem } from "./DashboardClient";

export async function generateMetadata({ params }: { params: Promise<{ brewery_id: string }> }) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("breweries").select("name").eq("id", brewery_id).single();
  return { title: `${(data as any)?.name ?? "Brewery"} Dashboard — HopTrack` };
}

export default async function BreweryDashboardPage({ params }: { params: Promise<{ brewery_id: string }> }) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // ── Impersonation detection ─────────────────────────────────────────
  const cookieStore = await cookies();
  const isImpersonating = !!cookieStore.get("ht-impersonate")?.value;

  // Use service client during impersonation (superadmin not in brewery_accounts)
  const queryClient = isImpersonating ? createServiceClient() : supabase;

  // Verify access — skip for impersonation (layout already verified superadmin)
  let account: any = null;
  if (isImpersonating) {
    account = { role: "owner", verified: true };
  } else {
    const { data: acc } = await supabase
      .from("brewery_accounts")
      .select("role, verified, verified_at")
      .eq("user_id", user.id)
      .eq("brewery_id", brewery_id)
      .maybeSingle() as any;
    account = acc;
    if (!account) redirect("/brewery-admin/claim");
  }

  // ── Fetch all data in parallel ─────────────────────────────────────────────
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
  const weekAgoStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6).toISOString();
  const twoWeeksAgoStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 13).toISOString();

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
    { data: _loyaltyProgramsForROI },
  ] = await Promise.all([
    queryClient.from("breweries").select("*").eq("id", brewery_id).single() as any,
    queryClient.from("beers").select("*").eq("brewery_id", brewery_id) as any,

    // Recent 10 sessions with beer logs for feed display
    queryClient
      .from("sessions")
      .select("*, profile:profiles(display_name, username, avatar_url), beer_logs(id, beer_id, rating, quantity, beer:beers(name, style))")
      .eq("brewery_id", brewery_id)
      .eq("is_active", false)
      .order("started_at", { ascending: false })
      .limit(10) as any,

    queryClient
      .from("loyalty_programs")
      .select("*, loyalty_cards(count)")
      .eq("brewery_id", brewery_id)
      .eq("is_active", true)
      .single() as any,

    // All sessions for aggregate stats
    queryClient
      .from("sessions")
      .select("id, user_id, started_at, ended_at, is_active")
      .eq("brewery_id", brewery_id)
      .eq("is_active", false)
      .limit(50000) as any,

    // All beer logs for rating + top beer stats
    queryClient
      .from("beer_logs")
      .select("id, beer_id, rating, quantity, logged_at, beer:beers(name, style)")
      .eq("brewery_id", brewery_id)
      .limit(50000) as any,

    // Today's sessions (count only — bypasses PostgREST max-rows cap)
    queryClient
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .eq("brewery_id", brewery_id)
      .eq("is_active", false)
      .gte("started_at", todayStart)
      .lt("started_at", tomorrowStart) as any,

    // Today's beer logs (count only)
    queryClient
      .from("beer_logs")
      .select("id", { count: "exact", head: true })
      .eq("brewery_id", brewery_id)
      .gte("logged_at", todayStart)
      .lt("logged_at", tomorrowStart) as any,

    // Active sessions right now (count only)
    queryClient
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .eq("brewery_id", brewery_id)
      .eq("is_active", true) as any,

    // Recent reviews for activity feed
    queryClient
      .from("brewery_reviews")
      .select("id, rating, comment, created_at, profile:profiles!user_id(display_name, username)")
      .eq("brewery_id", brewery_id)
      .order("created_at", { ascending: false })
      .limit(5),

    // Recent followers for activity feed
    queryClient
      .from("brewery_follows")
      .select("id, created_at, profile:profiles!user_id(display_name, username)")
      .eq("brewery_id", brewery_id)
      .order("created_at", { ascending: false })
      .limit(5),

    // Loyalty redemptions this month (for ROI card)
    queryClient
      .from("loyalty_programs")
      .select("id")
      .eq("brewery_id", brewery_id)
      .eq("is_active", true) as any,
  ]);

  // Additional data for KPIs — brewery_visits, loyalty_cards, loyalty_redemptions, followers with dates, profiles
  const [
    { data: breweryVisits },
    { data: loyaltyCards },
    { data: loyaltyRedemptions },
    { data: allFollowers },
    { data: latestAISuggestion },
    { count: totalVisitCountRaw },
    { count: totalBeerCountRaw },
    { count: thisWeekCountRaw },
    { count: lastWeekCountRaw },
  ] = await Promise.all([
    queryClient
      .from("brewery_visits")
      .select("user_id, total_visits")
      .eq("brewery_id", brewery_id)
      .limit(50000) as any,
    queryClient
      .from("loyalty_cards")
      .select("user_id")
      .eq("brewery_id", brewery_id)
      .limit(50000) as any,
    queryClient
      .from("loyalty_redemptions")
      .select("id, redeemed_at")
      .eq("brewery_id", brewery_id)
      .limit(50000) as any,
    queryClient
      .from("brewery_follows")
      .select("id, created_at")
      .eq("brewery_id", brewery_id)
      .limit(50000) as any,
    queryClient
      .from("ai_suggestions")
      .select("id, suggestions, generated_at, status")
      .eq("brewery_id", brewery_id)
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle() as any,

    // Accurate counts — bypasses PostgREST max-rows cap (S155 P0 fix)
    queryClient
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .eq("brewery_id", brewery_id)
      .eq("is_active", false) as any,
    queryClient
      .from("beer_logs")
      .select("id", { count: "exact", head: true })
      .eq("brewery_id", brewery_id) as any,
    queryClient
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .eq("brewery_id", brewery_id)
      .eq("is_active", false)
      .gte("started_at", weekAgoStart)
      .lt("started_at", tomorrowStart) as any,
    queryClient
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .eq("brewery_id", brewery_id)
      .eq("is_active", false)
      .gte("started_at", twoWeeksAgoStart)
      .lt("started_at", weekAgoStart) as any,
  ]);

  // Build profile lookup for top customer display
  const topSessionUserIds = Object.entries(
    ((allSessions as any[]) ?? []).reduce((acc: Record<string, number>, s: any) => {
      if (s.user_id) acc[s.user_id] = (acc[s.user_id] ?? 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 3).map(([id]) => id);

  const { data: topProfiles } = topSessionUserIds.length > 0
    ? await queryClient
        .from("profiles")
        .select("id, display_name, username")
        .in("id", topSessionUserIds) as any
    : { data: [] };

  const profileLookup: Record<string, { display_name?: string; username?: string }> = {};
  ((topProfiles as any[]) ?? []).forEach((p: any) => {
    profileLookup[p.id] = { display_name: p.display_name, username: p.username };
  });

  // Follower counts (separate queries for count)
  const { count: totalFollowerCount } = await supabase
    .from("brewery_follows")
    .select("id", { count: "exact", head: true })
    .eq("brewery_id", brewery_id);

  const { count: todayNewFollowers } = await supabase
    .from("brewery_follows")
    .select("id", { count: "exact", head: true })
    .eq("brewery_id", brewery_id)
    .gte("created_at", todayStart)
    .lt("created_at", tomorrowStart);

  // ── Compute stats ─────────────────────────────────────────────────────────
  // NOTE: allSessions/allBeerLogs may be capped by PostgREST max-rows (default 1000).
  // All visible totals use { count: "exact", head: true } queries for accuracy.
  // Data arrays are used only for KPIs, sparklines, and top beers.
  const sessions = (allSessions as any[]) ?? [];
  const beerLogs = (allBeerLogs as any[]) ?? [];

  const totalVisits = totalVisitCountRaw ?? 0;
  const totalBeersLogged = totalBeerCountRaw ?? 0;
  const uniqueVisitors = new Set(sessions.map((s: any) => s.user_id)).size;
  const ratings = beerLogs.filter((l: any) => l.rating > 0).map((l: any) => l.rating);
  const avgRating = ratings.length > 0
    ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1)
    : null;

  // Today stats (from count queries — accurate regardless of row limits)
  const todayVisitCount = todayVisitCountRaw ?? 0;
  const todayBeersCount = todayBeerCountRaw ?? 0;
  const activeSessionCount = activeCountRaw ?? 0;

  // Weekly trend — sparkline uses capped data (relative shape is representative)
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

  // This week / last week totals (from count queries — accurate)
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
  const topBeersList = Object.values(beerMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const onTapCount = ((beers as any[]) ?? []).filter((b: any) => b.is_on_tap).length;
  const totalBeerCount = ((beers as any[]) ?? []).length;

  // ── Enhanced KPIs (Sprint 124) ────────────────────────────────────────────
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

  // Onboarding
  const hasBeers = totalBeerCount > 0;
  const hasLoyalty = !!loyaltyProgram;
  const hasLogo = !!(brewery as any)?.logo_url;
  // ── ROI card data ──────────────────────────────────────────────────
  // Count sessions where a loyalty stamp was earned this month
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const loyaltyVisitsThisMonth = sessions.filter((s: any) => {
    return new Date(s.started_at) >= new Date(monthStart);
  }).length;

  // Last 4 weeks of visit counts (for sparkline)
  const loyaltyVisitsByWeek: number[] = [];
  for (let w = 3; w >= 0; w--) {
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (w + 1) * 7);
    const weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - w * 7);
    const weekCount = sessions.filter((s: any) => {
      const d = new Date(s.started_at);
      return d >= weekStart && d < weekEnd;
    }).length;
    loyaltyVisitsByWeek.push(weekCount);
  }

  const subscriptionTier = (brewery as any)?.subscription_tier ?? "free";

  // ── Build activity feed ────────────────────────────────────────────────────
  const activityItems: ActivityItem[] = [];

  ((recentSessions as any[]) ?? []).slice(0, 3).forEach((s: any) => {
    const beerCount = ((s.beer_logs as any[]) ?? []).reduce(
      (sum: number, l: any) => sum + (l.quantity ?? 1), 0
    );
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
      text: `${r.profile?.display_name ?? r.profile?.username ?? "Someone"} left a ${r.rating}-star review`,
      subtext: r.comment ? r.comment.slice(0, 60) + (r.comment.length > 60 ? "..." : "") : "No comment",
      time: formatRelativeTime(r.created_at),
      icon: "⭐",
    });
  });

  ((recentFollowers as any[]) ?? []).slice(0, 2).forEach((f: any) => {
    activityItems.push({
      id: `follow-${f.id}`,
      type: "follower",
      text: `${f.profile?.display_name ?? f.profile?.username ?? "Someone"} started following`,
      subtext: "New follower",
      time: formatRelativeTime(f.created_at),
      icon: "💛",
    });
  });

  const activityFeed = activityItems.slice(0, 5);

  // ── Quick actions ──────────────────────────────────────────────────────────
  const quickActions = [
    { href: `/brewery-admin/${brewery_id}/tap-list`, label: "Tap List", icon: List, desc: "Manage beers" },
    { href: `/brewery-admin/${brewery_id}/analytics`, label: "Analytics", icon: BarChart3, desc: "View trends" },
    { href: `/brewery-admin/${brewery_id}/loyalty`, label: "Loyalty", icon: Gift, desc: "Programs & promos" },
    { href: `/brewery-admin/${brewery_id}/qr`, label: "QR Tents", icon: QrCode, desc: "Table tents" },
    { href: `/brewery-admin/${brewery_id}/customers`, label: "Customers", icon: Users, desc: "Insights" },
    { href: `/brewery-admin/${brewery_id}/events`, label: "Events", icon: Calendar, desc: "Manage events" },
    { href: `/brewery-admin/${brewery_id}/sessions`, label: "Sessions", icon: Clock, desc: "All visits" },
    { href: `/brewery/${brewery_id}`, label: "Public Page", icon: Eye, desc: "View as customer" },
    ...((brewery as any)?.pos_connected ? [{ href: `/brewery-admin/${brewery_id}/pos-sync`, label: "POS Sync", icon: RefreshCw, desc: "Sync log" }] : []),
  ];

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto pt-16 lg:pt-8">

      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-mono uppercase tracking-wider mb-1" style={{ color: "var(--accent-gold)" }}>
          {(account as any)?.role === "owner" ? "Owner" : "Manager"} · {(account as any)?.verified ? "Verified" : "Pending Verification"}
        </p>
        <h1 className="font-sans text-3xl lg:text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
          {(brewery as any)?.name}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          {(brewery as any)?.city}, {(brewery as any)?.state} · {(brewery as any)?.brewery_type?.replace(/_/g, " ")}
        </p>
      </div>

      {/* Staff Quick Action — prominent card for bar staff */}
      {(account as any)?.role === "staff" && (
        <Link
          href={`/brewery-admin/${brewery_id}/punch`}
          className="block rounded-2xl border p-6 mb-6 transition-all hover:border-[var(--accent-gold)] group"
          style={{
            background: "color-mix(in srgb, var(--accent-gold) 8%, var(--surface))",
            borderColor: "var(--border)",
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl flex-shrink-0"
              style={{ background: "var(--accent-gold)" }}
            >
              <ScanLine className="h-7 w-7" style={{ color: "var(--bg)" }} />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                Enter Customer Code
              </h2>
              <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
                Confirm loyalty rewards, mug club perks, and promotions
              </p>
            </div>
            <ArrowUpRight size={20} className="ml-auto flex-shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" style={{ color: "var(--accent-gold)" }} />
          </div>
        </Link>
      )}

      {/* Onboarding Checklist — persistent for first 14 days after verification */}
      <div className="mb-4">
        <OnboardingChecklist
          breweryId={brewery_id}
          verifiedAt={(account as any)?.verified_at ?? null}
          hasLogo={hasLogo}
          beerCount={totalBeerCount}
          hasLoyalty={hasLoyalty}
        />
      </div>

      {/* ── Today's Snapshot ─────────────────────────────────────────── */}
      <div
        className="rounded-2xl border p-4 mb-6"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Zap size={14} style={{ color: "var(--accent-gold)" }} />
          <h2 className="text-xs font-mono uppercase tracking-wider font-bold" style={{ color: "var(--accent-gold)" }}>
            Today
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          <span className="text-sm" style={{ color: "var(--text-primary)" }}>
            <strong className="font-display text-lg">{todayVisitCount}</strong>{" "}
            <span style={{ color: "var(--text-muted)" }}>visit{todayVisitCount !== 1 ? "s" : ""}</span>
          </span>
          <span className="text-sm" style={{ color: "var(--text-primary)" }}>
            <strong className="font-display text-lg">{todayBeersCount}</strong>{" "}
            <span style={{ color: "var(--text-muted)" }}>beer{todayBeersCount !== 1 ? "s" : ""} poured</span>
          </span>
          {(todayNewFollowers ?? 0) > 0 && (
            <span className="text-sm" style={{ color: "var(--text-primary)" }}>
              <strong className="font-display text-lg">{todayNewFollowers}</strong>{" "}
              <span style={{ color: "var(--text-muted)" }}>new follower{todayNewFollowers !== 1 ? "s" : ""}</span>
            </span>
          )}
          {activeSessionCount > 0 && (
            <span className="flex items-center gap-1.5 text-sm">
              <span
                className="w-2 h-2 rounded-full inline-block animate-pulse"
                style={{ background: "#22c55e" }}
              />
              <strong className="font-display text-lg" style={{ color: "var(--text-primary)" }}>{activeSessionCount}</strong>{" "}
              <span style={{ color: "var(--text-muted)" }}>drinking now</span>
            </span>
          )}
        </div>
      </div>

      {/* ── POS Sync Alert Banner ──────────────────────────────────── */}
      {(brewery as any)?.pos_connected && (
        <PosSyncAlertBanner breweryId={brewery_id} />
      )}

      {/* ── KPI Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Today's Visits */}
        <div className="rounded-2xl p-5 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Today Visits</p>
            <Users size={14} style={{ color: "var(--accent-gold)" }} />
          </div>
          <div className="flex items-end justify-between">
            <p className="font-display text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>{todayVisitCount}</p>
            <Sparkline data={weeklyData} />
          </div>
          <p className="text-[10px] mt-2 truncate" style={{ color: "var(--text-muted)" }}>
            {totalVisits.toLocaleString()} all-time
          </p>
        </div>

        {/* Weekly Trend */}
        <div className="rounded-2xl p-5 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>This Week</p>
            <TrendingUp size={14} style={{ color: "var(--accent-gold)" }} />
          </div>
          <p className="font-display text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>{thisWeekTotal}</p>
          <div className="flex items-center gap-1 mt-2">
            {weekTrend !== null ? (
              <>
                <span
                  className="text-[10px] font-mono font-bold"
                  style={{ color: weekTrend >= 0 ? "#22c55e" : "#ef4444" }}
                >
                  {weekTrend >= 0 ? "+" : ""}{weekTrend}%
                </span>
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>vs last week</span>
              </>
            ) : (
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                {thisWeekTotal} visit{thisWeekTotal !== 1 ? "s" : ""} this week
              </span>
            )}
          </div>
        </div>

        {/* Active Sessions */}
        <div className="rounded-2xl p-5 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Active Now</p>
            <Beer size={14} style={{ color: "var(--accent-gold)" }} />
          </div>
          <ActiveSessionsCounter breweryId={brewery_id} initialCount={activeSessionCount} />
          <p className="text-[10px] mt-2 truncate" style={{ color: "var(--text-muted)" }}>
            {onTapCount}/{totalBeerCount} on tap
          </p>
        </div>

        {/* Followers */}
        <div className="rounded-2xl p-5 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Followers</p>
            <Heart size={14} style={{ color: "var(--accent-gold)" }} />
          </div>
          <p className="font-display text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>{totalFollowerCount ?? 0}</p>
          <p className="text-[10px] mt-2 truncate" style={{ color: (todayNewFollowers ?? 0) > 0 ? "#22c55e" : "var(--text-muted)" }}>
            {(todayNewFollowers ?? 0) > 0 ? `+${todayNewFollowers} today` : "No new followers today"}
          </p>
        </div>
      </div>

      {/* ── KPI Cards Row 2 — The Pulse (Sprint 124) ──────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Avg Session Duration */}
        <div className="rounded-2xl p-5 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Avg Duration</p>
            <Clock size={14} style={{ color: "var(--accent-gold)" }} />
          </div>
          <div className="flex items-end justify-between">
            <p className="font-display text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              {formatDuration(kpis.avgSessionDuration)}
            </p>
            <Sparkline data={sparklines.avgDuration} />
          </div>
          {(() => {
            const trend = formatTrend(kpis.avgSessionDurationTrend);
            return trend ? (
              <div className="flex items-center gap-1 mt-2">
                <span className="text-[10px] font-mono font-bold" style={{ color: trend.color }}>{trend.text}</span>
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>vs prior 30d</span>
              </div>
            ) : (
              <p className="text-[10px] mt-2" style={{ color: "var(--text-muted)" }}>Last 30 days</p>
            );
          })()}
        </div>

        {/* Beers Per Visit */}
        <div className="rounded-2xl p-5 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Beers / Visit</p>
            <Beer size={14} style={{ color: "var(--accent-gold)" }} />
          </div>
          <div className="flex items-end justify-between">
            <p className="font-display text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              {kpis.beersPerVisit ?? "—"}
            </p>
            <Sparkline data={sparklines.beersPerVisit} />
          </div>
          {(() => {
            const trend = formatTrend(kpis.beersPerVisitTrend);
            return trend ? (
              <div className="flex items-center gap-1 mt-2">
                <span className="text-[10px] font-mono font-bold" style={{ color: trend.color }}>{trend.text}</span>
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>vs prior 30d</span>
              </div>
            ) : (
              <p className="text-[10px] mt-2" style={{ color: "var(--text-muted)" }}>Avg pours per session</p>
            );
          })()}
        </div>

        {/* New vs Returning */}
        <div className="rounded-2xl p-5 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Returning</p>
            <RefreshCw size={14} style={{ color: "var(--accent-gold)" }} />
          </div>
          <div className="flex items-end justify-between">
            <p className="font-display text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              {kpis.returningVisitorPct !== null ? `${kpis.returningVisitorPct}%` : "—"}
            </p>
            <Sparkline data={sparklines.returningPct} />
          </div>
          {kpis.newVisitorPct !== null ? (
            <p className="text-[10px] mt-2" style={{ color: "var(--text-muted)" }}>
              {kpis.newVisitorPct}% new · {kpis.returningVisitorPct}% returning
            </p>
          ) : (
            <p className="text-[10px] mt-2" style={{ color: "var(--text-muted)" }}>Visitor breakdown</p>
          )}
        </div>

        {/* Customer Retention */}
        <div className="rounded-2xl p-5 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Retention</p>
            <Award size={14} style={{ color: "var(--accent-gold)" }} />
          </div>
          <div className="flex items-end justify-between">
            <p className="font-display text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              {kpis.retentionRate !== null ? `${kpis.retentionRate}%` : "—"}
            </p>
            <Sparkline data={sparklines.retention} />
          </div>
          {(() => {
            const trend = formatTrend(kpis.retentionTrend, "pp");
            return trend ? (
              <div className="flex items-center gap-1 mt-2">
                <span className="text-[10px] font-mono font-bold" style={{ color: trend.color }}>{trend.text}</span>
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>vs prior period</span>
              </div>
            ) : (
              <p className="text-[10px] mt-2" style={{ color: "var(--text-muted)" }}>30-day return rate</p>
            );
          })()}
        </div>
      </div>

      {/* ── AI Suggestions (Sprint 146) ───────────────────────── */}
      <AISuggestionsCard
        breweryId={brewery_id}
        initialSuggestions={((latestAISuggestion as any)?.suggestions as any[]) ?? []}
        initialId={(latestAISuggestion as any)?.id ?? null}
        tier={subscriptionTier}
      />

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Left Column: Activity + Top Beers + Recent Visits ────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Recent Activity Feed */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold" style={{ color: "var(--text-primary)" }}>Recent Activity</h2>
              <Link href={`/brewery-admin/${brewery_id}/sessions`}
                className="text-xs flex items-center gap-1 transition-opacity hover:opacity-70"
                style={{ color: "var(--accent-gold)" }}>
                All sessions <ArrowUpRight size={12} />
              </Link>
            </div>
            <RecentActivityFeed items={activityFeed} />
          </div>

          {/* Top Beers */}
          {topBeersList.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-bold" style={{ color: "var(--text-primary)" }}>Top Beers</h2>
                <Link href={`/brewery-admin/${brewery_id}/analytics`}
                  className="text-xs flex items-center gap-1 transition-opacity hover:opacity-70"
                  style={{ color: "var(--accent-gold)" }}>
                  Full analytics <ArrowUpRight size={12} />
                </Link>
              </div>
              <div className="space-y-3">
                {topBeersList.map((beer, i) => {
                  const beerAvg = beer.ratedCount > 0 ? (beer.totalRating / beer.ratedCount).toFixed(1) : null;
                  const maxCount = topBeersList[0]?.count ?? 1;
                  const barWidth = Math.max(12, (beer.count / maxCount) * 100);

                  return (
                    <div key={beer.name} className="flex items-center gap-4 p-4 rounded-2xl border"
                      style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                      <span className="font-display text-2xl font-bold w-8 flex-shrink-0"
                        style={{ color: i === 0 ? "var(--accent-gold)" : "var(--text-muted)" }}>
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate" style={{ color: "var(--text-primary)" }}>{beer.name}</p>
                        <p className="text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>{beer.style}</p>
                        {/* Popularity bar */}
                        <div className="h-1 rounded-full" style={{ background: "var(--border)", width: "100%" }}>
                          <div
                            className="h-1 rounded-full transition-all"
                            style={{ background: "var(--accent-gold)", width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-mono font-bold" style={{ color: "var(--text-primary)" }}>
                          {beer.count} pour{beer.count !== 1 ? "s" : ""}
                        </p>
                        {beerAvg && (
                          <p className="text-xs" style={{ color: "var(--accent-gold)" }}>
                            {beerAvg} avg
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Visits */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold" style={{ color: "var(--text-primary)" }}>Recent Visits</h2>
              <Link href={`/brewery-admin/${brewery_id}/sessions`}
                className="text-xs flex items-center gap-1 transition-opacity hover:opacity-70"
                style={{ color: "var(--accent-gold)" }}>
                View all <ArrowUpRight size={12} />
              </Link>
            </div>
            <div className="space-y-2">
              {((recentSessions as any[]) ?? []).length === 0 ? (
                <div className="rounded-2xl p-8 text-center border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                  <p className="text-3xl mb-2">🍺</p>
                  <p className="font-display" style={{ color: "var(--text-primary)" }}>No sessions yet</p>
                  <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Share your HopTrack brewery page to get the first pour tracked.</p>
                </div>
              ) : (
                ((recentSessions as any[]) ?? []).slice(0, 6).map((s: any) => {
                  const sessionBeerLogs = (s.beer_logs as any[]) ?? [];
                  const beerCount = sessionBeerLogs.reduce((sum: number, l: any) => sum + (l.quantity ?? 1), 0);
                  const sessionRatings = sessionBeerLogs.filter((l: any) => l.rating > 0);
                  const sessionAvg = sessionRatings.length > 0
                    ? (sessionRatings.reduce((a: number, l: any) => a + l.rating, 0) / sessionRatings.length).toFixed(1)
                    : null;
                  const topBeerName = sessionBeerLogs.length > 0
                    ? (sessionBeerLogs[0]?.beer?.name ?? "Unnamed Beer")
                    : null;

                  return (
                    <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl border"
                      style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}>
                        {(s.profile?.display_name ?? s.user_id?.slice(0, 1) ?? "?")[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                          {s.profile?.display_name ?? "Guest"}
                        </p>
                        <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                          {beerCount > 0
                            ? `${beerCount} beer${beerCount !== 1 ? "s" : ""}${topBeerName ? ` · ${topBeerName}` : ""}`
                            : "Brewery visit"
                          }
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {sessionAvg && (
                          <p className="text-xs font-mono" style={{ color: "var(--accent-gold)" }}>{sessionAvg}</p>
                        )}
                        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                          {formatRelativeTime(s.started_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ── Right Column ────────────────────────────────────────────── */}
        <div className="space-y-6">

          {/* ROI Card */}
          <ROIDashboardCard
            loyaltyVisitsThisMonth={loyaltyVisitsThisMonth}
            loyaltyVisitsByWeek={loyaltyVisitsByWeek}
            subscriptionTier={subscriptionTier}
            hasLoyaltyProgram={hasLoyalty}
          />

          {/* POS Sync Card */}
          {(subscriptionTier === "cask" || subscriptionTier === "barrel") && (
            <PosDashboardCard breweryId={brewery_id} />
          )}

          {/* Quick Actions — Grid */}
          <div>
            <h3 className="font-display font-bold mb-3" style={{ color: "var(--text-primary)" }}>Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map(({ href, label, icon: Icon, desc }) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-xl border p-3 transition-all hover:border-[var(--accent-gold)] group"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                >
                  <Icon
                    size={16}
                    className="mb-1.5 transition-colors"
                    style={{ color: "var(--text-muted)" }}
                  />
                  <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>{label}</p>
                  <p className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>{desc}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* All-Time Stats */}
          <div className="rounded-2xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <h3 className="font-display font-bold mb-3" style={{ color: "var(--text-primary)" }}>All-Time Stats</h3>
            <div className="space-y-3">
              {[
                { label: "Total visits", value: totalVisits.toLocaleString() },
                { label: "Beers logged", value: totalBeersLogged.toLocaleString() },
                { label: "Unique visitors", value: uniqueVisitors.toLocaleString() },
                { label: "Avg rating", value: avgRating ? `${avgRating} / 5` : "No ratings" },
                { label: "Reviews", value: `${ratings.length}` },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</span>
                  <span className="text-sm font-mono font-bold" style={{ color: "var(--text-primary)" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Loyalty */}
          <div className="rounded-2xl p-5 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold" style={{ color: "var(--text-primary)" }}>Loyalty Program</h3>
              <Award size={14} style={{ color: "var(--accent-gold)" }} />
            </div>
            {loyaltyProgram ? (
              <>
                <p className="font-medium text-sm mb-1" style={{ color: "var(--text-primary)" }}>{(loyaltyProgram as any).name}</p>
                <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                  {(loyaltyProgram as any).stamps_required} stamps to redeem
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: "#22c55e" }} />
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Active</span>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>No loyalty program yet.</p>
                <Link href={`/brewery-admin/${brewery_id}/loyalty`}
                  className="text-xs font-medium" style={{ color: "var(--accent-gold)" }}>
                  + Create program
                </Link>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
