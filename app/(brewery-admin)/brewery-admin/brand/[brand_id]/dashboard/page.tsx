import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Building2, Settings, MapPin, GlassWater } from "lucide-react";
import { BrandDashboardClient } from "./BrandDashboardClient";
import { formatRelativeTime } from "@/lib/dates";
import { verifyBrandAccessWithScope } from "@/lib/brand-auth";
import { calculateBreweryKPIs, type BreweryKPIs } from "@/lib/kpi";
import { BrandOnboardingWizard } from "@/components/brewery-admin/brand/onboarding/BrandOnboardingWizard";


export const revalidate = 30;

export async function generateMetadata({ params }: { params: Promise<{ brand_id: string }> }) {
  const { brand_id } = await params;
  const supabase = await createClient();
  const { data } = await (supabase
    .from("brewery_brands")
    .select("name")
    .eq("id", brand_id)
    .single() as any);
  return { title: `${data?.name ?? "Brand"} Dashboard — HopTrack` };
}

export default async function BrandDashboardPage({ params }: { params: Promise<{ brand_id: string }> }) {
  const { brand_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify brand membership (shared utility — handles RLS fallback)
  const brandAccess = await verifyBrandAccessWithScope(supabase, brand_id, user.id);
  if (!brandAccess) redirect("/brewery-admin");
  const { role: brandRole, locationScope } = brandAccess;

  // Fetch brand
  const { data: brand } = await (supabase
    .from("brewery_brands")
    .select("*")
    .eq("id", brand_id)
    .single() as any);

  if (!brand) notFound();

  // Fetch locations
  const { data: locations } = await (supabase
    .from("breweries")
    .select("id, name, city, state, cover_image_url, latitude, longitude")
    .eq("brand_id", brand_id)
    .order("name") as any);

  const locationIds = (locations ?? []).map((l: any) => l.id);

  // Onboarding data — parallel queries for card
  const [{ data: brandLoyalty }, { count: teamCount }] = await Promise.all([
    supabase.from("brand_loyalty_programs").select("id").eq("brand_id", brand_id).eq("is_active", true).limit(1) as any,
    supabase.from("brand_accounts").select("id", { count: "exact", head: true }).eq("brand_id", brand_id) as any,
  ]);

  // Fetch analytics data server-side for initial render
  const stats = {
    totalSessions: 0, totalBeersLogged: 0, uniqueVisitors: 0,
    thisWeekSessions: 0, lastWeekSessions: 0, todaySessions: 0,
    todayBeers: 0, avgRating: null as number | null, repeatVisitorPct: null as number | null,
    crossLocationVisitors: 0, totalFollowers: 0,
  };
  let locationBreakdown: any[] = [];
  let topBeers: any[] = [];
  let recentActivity: any[] = [];
  let weeklyTrend: number[] = [0, 0, 0, 0, 0, 0, 0, 0];

  if (locationIds.length > 0) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 86400000).toISOString();

    const [
      { data: allSessions },
      { data: allBeerLogs },
      { data: todaySessions },
      { data: todayBeerLogs },
      { data: recentSessions },
      { count: followersCount },
    ] = await Promise.all([
      supabase.from("sessions").select("id, user_id, brewery_id, started_at").in("brewery_id", locationIds).eq("is_active", false).limit(50000) as any,
      supabase.from("beer_logs").select("id, beer_id, rating, quantity, logged_at, brewery_id, beer:beers(name, style)").in("brewery_id", locationIds).limit(50000) as any,
      supabase.from("sessions").select("id, user_id").in("brewery_id", locationIds).eq("is_active", false).gte("started_at", todayStart).limit(50000) as any,
      supabase.from("beer_logs").select("id, quantity").in("brewery_id", locationIds).gte("logged_at", todayStart).limit(50000) as any,
      supabase.from("sessions").select("id, brewery_id, started_at, profile:profiles(display_name, username), beer_logs(id, beer_id, beer:beers(name))").in("brewery_id", locationIds).eq("is_active", false).order("started_at", { ascending: false }).limit(15) as any,
      supabase.from("brewery_followers").select("id", { count: "exact", head: true }).in("brewery_id", locationIds) as any,
    ]);

    const sessions = allSessions ?? [];
    const beerLogs = allBeerLogs ?? [];

    // Aggregate stats
    stats.totalSessions = sessions.length;
    stats.totalBeersLogged = beerLogs.reduce((sum: number, l: any) => sum + (l.quantity ?? 1), 0);
    stats.uniqueVisitors = new Set(sessions.map((s: any) => s.user_id).filter(Boolean)).size;
    stats.thisWeekSessions = sessions.filter((s: any) => s.started_at >= weekAgo).length;
    stats.lastWeekSessions = sessions.filter((s: any) => s.started_at >= twoWeeksAgo && s.started_at < weekAgo).length;
    stats.todaySessions = (todaySessions ?? []).length;
    stats.todayBeers = (todayBeerLogs ?? []).reduce((sum: number, l: any) => sum + (l.quantity ?? 1), 0);
    stats.totalFollowers = followersCount ?? 0;

    const rated = beerLogs.filter((l: any) => l.rating > 0);
    stats.avgRating = rated.length > 0 ? parseFloat((rated.reduce((a: number, l: any) => a + l.rating, 0) / rated.length).toFixed(2)) : null;

    const userVisitCounts: Record<string, number> = {};
    sessions.forEach((s: any) => { if (s.user_id) userVisitCounts[s.user_id] = (userVisitCounts[s.user_id] ?? 0) + 1; });
    const totalUsers = Object.keys(userVisitCounts).length;
    stats.repeatVisitorPct = totalUsers > 0 ? Math.round((Object.values(userVisitCounts).filter(c => c >= 2).length / totalUsers) * 100) : null;

    const userLocations: Record<string, Set<string>> = {};
    sessions.forEach((s: any) => {
      if (s.user_id) {
        if (!userLocations[s.user_id]) userLocations[s.user_id] = new Set();
        userLocations[s.user_id].add(s.brewery_id);
      }
    });
    stats.crossLocationVisitors = Object.values(userLocations).filter(locs => locs.size >= 2).length;

    // Location breakdown
    locationBreakdown = locationIds.map((locId: string) => {
      const loc = (locations ?? []).find((l: any) => l.id === locId);
      const locSessions = sessions.filter((s: any) => s.brewery_id === locId);
      const locBeers = beerLogs.filter((l: any) => l.brewery_id === locId);
      return {
        id: locId,
        name: loc?.name ?? "Unknown",
        city: loc?.city ?? "",
        state: loc?.state ?? "",
        sessions: locSessions.length,
        beersLogged: locBeers.reduce((sum: number, l: any) => sum + (l.quantity ?? 1), 0),
        uniqueVisitors: new Set(locSessions.map((s: any) => s.user_id).filter(Boolean)).size,
      };
    }).sort((a: any, b: any) => b.sessions - a.sessions);

    // Top beers (grouped by name across locations)
    const beerCounts: Record<string, { name: string; style: string | null; count: number; totalRating: number; ratingCount: number }> = {};
    beerLogs.forEach((l: any) => {
      if (!l.beer?.name) return;
      const key = l.beer.name.toLowerCase();
      if (!beerCounts[key]) beerCounts[key] = { name: l.beer.name, style: l.beer.style ?? null, count: 0, totalRating: 0, ratingCount: 0 };
      beerCounts[key].count += l.quantity ?? 1;
      if (l.rating > 0) { beerCounts[key].totalRating += l.rating; beerCounts[key].ratingCount++; }
    });
    topBeers = Object.values(beerCounts).sort((a, b) => b.count - a.count).slice(0, 10).map(b => ({
      ...b, avgRating: b.ratingCount > 0 ? parseFloat((b.totalRating / b.ratingCount).toFixed(1)) : null,
    }));

    // Weekly trend
    weeklyTrend = [];
    for (let w = 7; w >= 0; w--) {
      const weekStart = new Date(now.getTime() - (w + 1) * 7 * 86400000).toISOString();
      const weekEnd = new Date(now.getTime() - w * 7 * 86400000).toISOString();
      weeklyTrend.push(sessions.filter((s: any) => s.started_at >= weekStart && s.started_at < weekEnd).length);
    }

    // Recent activity
    const locationNameMap: Record<string, string> = {};
    (locations ?? []).forEach((l: any) => { locationNameMap[l.id] = l.name; });
    recentActivity = (recentSessions ?? []).slice(0, 10).map((s: any) => {
      const profileName = s.profile?.display_name || s.profile?.username || "Someone";
      const beerCount = s.beer_logs?.length ?? 0;
      const firstBeer = s.beer_logs?.[0]?.beer?.name;
      const locName = locationNameMap[s.brewery_id] || "a location";
      return {
        id: s.id, type: "session" as const,
        text: `${profileName} visited ${locName}`,
        subtext: beerCount > 0 ? `${beerCount} beer${beerCount > 1 ? "s" : ""}${firstBeer ? ` incl. ${firstBeer}` : ""}` : "Checked in",
        time: formatRelativeTime(s.started_at), icon: "🍺",
      };
    });
  }

  // ── Brand-level KPIs (Sprint 124) ──
  let brandKPIs: BreweryKPIs | null = null;
  if (locationIds.length > 0) {
    const [
      { data: allSessionsFull },
      { data: allBeerLogsFull },
      { data: brandVisits },
      { data: brandLoyaltyCards },
      { data: brandRedemptions },
      { data: brandFollowers },
    ] = await Promise.all([
      supabase.from("sessions").select("id, user_id, started_at, ended_at, is_active").in("brewery_id", locationIds).eq("is_active", false).limit(50000) as any,
      supabase.from("beer_logs").select("id, beer_id, rating, quantity, logged_at").in("brewery_id", locationIds).limit(50000) as any,
      supabase.from("brewery_visits").select("user_id, total_visits").in("brewery_id", locationIds).limit(50000) as any,
      supabase.from("loyalty_cards").select("user_id").in("brewery_id", locationIds).limit(50000) as any,
      supabase.from("loyalty_redemptions").select("id, redeemed_at").in("brewery_id", locationIds).limit(50000) as any,
      supabase.from("brewery_follows").select("id, created_at").in("brewery_id", locationIds).limit(50000) as any,
    ]);

    brandKPIs = calculateBreweryKPIs({
      sessions: (allSessionsFull as any[]) ?? [],
      beerLogs: (allBeerLogsFull as any[]) ?? [],
      breweryVisits: (brandVisits as any[]) ?? [],
      loyaltyCards: (brandLoyaltyCards as any[]) ?? [],
      loyaltyRedemptions: (brandRedemptions as any[]) ?? [],
      followers: (brandFollowers as any[]) ?? [],
      periodDays: 30,
    });
  }

  // ── Tap stats (lightweight query for dashboard overview card) ──
  let tapStats: { totalOnTap: number; totalOff: number; uniqueBeers: number; sharedBeers: number } | undefined;
  if (locationIds.length > 0) {
    const { data: allBeers } = await (supabase
      .from("beers")
      .select("name, brewery_id, is_on_tap")
      .in("brewery_id", locationIds)
      .eq("is_active", true) as any);

    if (allBeers && allBeers.length > 0) {
      const totalOnTap = allBeers.filter((b: any) => b.is_on_tap).length;
      const totalOff = allBeers.filter((b: any) => !b.is_on_tap).length;
      const beerNameToLocations: Record<string, Set<string>> = {};
      allBeers.forEach((b: any) => {
        const key = b.name.toLowerCase().trim();
        if (!beerNameToLocations[key]) beerNameToLocations[key] = new Set();
        beerNameToLocations[key].add(b.brewery_id);
      });
      const uniqueBeers = Object.keys(beerNameToLocations).length;
      const sharedBeers = Object.values(beerNameToLocations).filter(s => s.size > 1).length;
      tapStats = { totalOnTap, totalOff, uniqueBeers, sharedBeers };
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Brand Header */}
      <div className="border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-6 flex items-center gap-4">
          {brand.logo_url ? (
            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 relative border" style={{ borderColor: "var(--border)" }}>
              <Image src={brand.logo_url} alt={brand.name} fill className="object-cover" sizes="56px" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)" }}>
              <Building2 size={24} style={{ color: "var(--accent-gold)" }} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl font-bold truncate" style={{ color: "var(--text-primary)" }}>
              {brand.name}
            </h1>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                <MapPin size={11} /> {(locations ?? []).length} location{(locations ?? []).length !== 1 ? "s" : ""}
              </span>
              <Link
                href={`/brand/${brand.slug}`}
                className="text-xs hover:opacity-70 transition-opacity"
                style={{ color: "var(--accent-gold)" }}
              >
                View public page
              </Link>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/brewery-admin/brand/${brand_id}/tap-list`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-opacity hover:opacity-80"
              style={{ background: "var(--surface)", borderColor: "var(--accent-gold)", color: "var(--accent-gold)" }}
            >
              <GlassWater size={14} />
              Tap List
            </Link>
            <Link
              href={`/brewery-admin/brand/${brand_id}/settings`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-opacity hover:opacity-80"
              style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
            >
              <Settings size={14} />
              Settings
            </Link>
          </div>
        </div>
      </div>

      {/* Onboarding Wizard (auto-shows for brands with < 2 locations) */}
      <BrandOnboardingWizard
        brandId={brand_id}
        brandName={brand.name}
        brandSlug={brand.slug}
        locationCount={(locations ?? []).length}
      />

      {/* Dashboard Content */}
      <BrandDashboardClient
        brandId={brand_id}
        initialData={{
          brand: { id: brand.id, name: brand.name, slug: brand.slug, logo_url: brand.logo_url, description: brand.description },
          locations: locations ?? [],
          stats,
          locationBreakdown,
          topBeers,
          recentActivity,
          weeklyTrend,
        }}
        tapStats={tapStats}
        brandKPIs={brandKPIs}
        locationScope={locationScope}
      />
    </div>
  );
}
