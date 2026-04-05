import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Building2, MapPin, ArrowLeft } from "lucide-react";
import { BrandReportsClient } from "./BrandReportsClient";
import { verifyBrandAccessWithScope } from "@/lib/brand-auth";
import { cacheLife, cacheTag } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";

export async function generateMetadata({ params }: { params: Promise<{ brand_id: string }> }) {
  const { brand_id } = await params;
  const supabase = await createClient();
  const { data } = await (supabase
    .from("brewery_brands")
    .select("name")
    .eq("id", brand_id)
    .single() as any);
  return { title: `${data?.name ?? "Brand"} Reports — HopTrack` };
}

async function fetchCachedReportsData(brandId: string) {
  "use cache";
  cacheLife("hop-realtime");
  cacheTag(`brand-${brandId}`);

  const service = createServiceClient();

  // Fetch brand + locations
  const { data: brand } = await (service
    .from("brewery_brands")
    .select("*")
    .eq("id", brandId)
    .single() as any);

  if (!brand) return { brand: null, locations: [], initialData: null };

  const { data: locations } = await (service
    .from("breweries")
    .select("id, name, city, state")
    .eq("brand_id", brandId)
    .order("name") as any);

  // Fetch initial comparison data (30d default)
  const locationIds = (locations ?? []).map((l: any) => l.id);
  let initialData = null;

  if (locationIds.length > 0) {
    const now = new Date();
    const nowISO = now.toISOString();
    const rangeStart = new Date(now.getTime() - 30 * 86400000).toISOString();
    const prevRangeStart = new Date(now.getTime() - 60 * 86400000).toISOString();

    const [
      { data: currentSessions },
      { data: prevSessions },
      { data: currentBeerLogs },
      { data: followers },
      { data: loyaltyPrograms },
    ] = await Promise.all([
      service.from("sessions").select("id, user_id, brewery_id, started_at").in("brewery_id", locationIds).eq("is_active", false).gte("started_at", rangeStart).lt("started_at", nowISO).limit(50000) as any,
      service.from("sessions").select("id, user_id, brewery_id").in("brewery_id", locationIds).eq("is_active", false).gte("started_at", prevRangeStart).lt("started_at", rangeStart).limit(50000) as any,
      service.from("beer_logs").select("id, beer_id, rating, quantity, brewery_id, beer:beers(name, style)").in("brewery_id", locationIds).gte("logged_at", rangeStart).lt("logged_at", nowISO).limit(50000) as any,
      service.from("brewery_followers").select("id, brewery_id").in("brewery_id", locationIds).limit(50000) as any,
      service.from("loyalty_programs").select("id, brewery_id").in("brewery_id", locationIds).eq("is_active", true) as any,
    ]);

    const sessions = currentSessions ?? [];
    const prevSess = prevSessions ?? [];
    const beerLogs = currentBeerLogs ?? [];

    // Loyalty redemptions
    const programIds = (loyaltyPrograms ?? []).map((p: any) => p.id);
    const programToBrewery: Record<string, string> = {};
    (loyaltyPrograms ?? []).forEach((p: any) => { programToBrewery[p.id] = p.brewery_id; });
    const redemptionsByBrewery: Record<string, number> = {};
    if (programIds.length > 0) {
      const { data: redemptions } = await (service.from("loyalty_redemptions").select("id, program_id").in("program_id", programIds).gte("redeemed_at", rangeStart).lt("redeemed_at", nowISO).limit(50000) as any);
      (redemptions ?? []).forEach((r: any) => {
        const bid = programToBrewery[r.program_id];
        if (bid) redemptionsByBrewery[bid] = (redemptionsByBrewery[bid] ?? 0) + 1;
      });
    }

    // Build location data
    const locData = locationIds.map((locId: string) => {
      const loc = (locations ?? []).find((l: any) => l.id === locId);
      const locSessions = sessions.filter((s: any) => s.brewery_id === locId);
      const locPrevSessions = prevSess.filter((s: any) => s.brewery_id === locId);
      const locBeers = beerLogs.filter((l: any) => l.brewery_id === locId);
      const locFollowers = (followers ?? []).filter((f: any) => f.brewery_id === locId);

      const sessionCount = locSessions.length;
      const uniqueVisitors = new Set(locSessions.map((s: any) => s.user_id).filter(Boolean)).size;
      const beersLogged = locBeers.reduce((sum: number, l: any) => sum + (l.quantity ?? 1), 0);
      const rated = locBeers.filter((l: any) => l.rating > 0);
      const avgRating = rated.length > 0 ? parseFloat((rated.reduce((a: number, l: any) => a + l.rating, 0) / rated.length).toFixed(2)) : null;

      const beerCounts: Record<string, { name: string; count: number }> = {};
      locBeers.forEach((l: any) => {
        if (!l.beer?.name) return;
        const key = l.beer.name.toLowerCase();
        if (!beerCounts[key]) beerCounts[key] = { name: l.beer.name, count: 0 };
        beerCounts[key].count += l.quantity ?? 1;
      });
      const topBeer = Object.values(beerCounts).sort((a, b) => b.count - a.count)[0]?.name ?? null;

      const prevCount = locPrevSessions.length;
      const prevVisitors = new Set(locPrevSessions.map((s: any) => s.user_id).filter(Boolean)).size;

      return {
        id: locId,
        name: loc?.name ?? "Unknown",
        city: loc?.city ?? "",
        state: loc?.state ?? "",
        sessions: sessionCount,
        uniqueVisitors,
        beersLogged,
        avgRating,
        topBeer,
        loyaltyRedemptions: redemptionsByBrewery[locId] ?? 0,
        followers: locFollowers.length,
        trend: {
          sessions: prevCount === 0 ? (sessionCount > 0 ? 100 : 0) : Math.round(((sessionCount - prevCount) / prevCount) * 100),
          uniqueVisitors: prevVisitors === 0 ? (uniqueVisitors > 0 ? 100 : 0) : Math.round(((uniqueVisitors - prevVisitors) / prevVisitors) * 100),
        },
        pctOfAvg: { sessions: 0, uniqueVisitors: 0, beersLogged: 0, avgRating: null as number | null },
        isOutlier: false,
        outlierDirection: null as "above" | "below" | null,
      };
    });

    // Compute averages + benchmarking
    const numLocs = locData.length;
    const avgSessions = numLocs > 0 ? Math.round(locData.reduce((s: number, l: any) => s + l.sessions, 0) / numLocs) : 0;
    const avgVisitors = numLocs > 0 ? Math.round(new Set(sessions.map((s: any) => s.user_id).filter(Boolean)).size / numLocs) : 0;
    const avgBeers = numLocs > 0 ? Math.round(locData.reduce((s: number, l: any) => s + l.beersLogged, 0) / numLocs) : 0;
    const allRated = beerLogs.filter((l: any) => l.rating > 0);
    const overallAvgRating = allRated.length > 0 ? parseFloat((allRated.reduce((a: number, l: any) => a + l.rating, 0) / allRated.length).toFixed(2)) : null;

    const sessionStdDev = numLocs > 1
      ? Math.sqrt(locData.reduce((sum: number, l: any) => sum + Math.pow(l.sessions - avgSessions, 2), 0) / numLocs)
      : 0;

    for (const loc of locData) {
      loc.pctOfAvg = {
        sessions: avgSessions > 0 ? Math.round((loc.sessions / avgSessions) * 100) : 0,
        uniqueVisitors: avgVisitors > 0 ? Math.round((loc.uniqueVisitors / avgVisitors) * 100) : 0,
        beersLogged: avgBeers > 0 ? Math.round((loc.beersLogged / avgBeers) * 100) : 0,
        avgRating: overallAvgRating && loc.avgRating ? Math.round((loc.avgRating / overallAvgRating) * 100) : null,
      };
      if (sessionStdDev > 0) {
        const deviation = Math.abs(loc.sessions - avgSessions);
        if (deviation > 1.5 * sessionStdDev) {
          loc.isOutlier = true;
          loc.outlierDirection = loc.sessions > avgSessions ? "above" : "below";
        }
      }
    }

    locData.sort((a: any, b: any) => b.sessions - a.sessions);

    initialData = {
      brand: { id: brand.id, name: brand.name },
      range: "30d" as const,
      locations: locData,
      brandTotals: {
        sessions: locData.reduce((s: number, l: any) => s + l.sessions, 0),
        uniqueVisitors: new Set(sessions.map((s: any) => s.user_id).filter(Boolean)).size,
        beersLogged: locData.reduce((s: number, l: any) => s + l.beersLogged, 0),
        avgRating: overallAvgRating,
        loyaltyRedemptions: locData.reduce((s: number, l: any) => s + l.loyaltyRedemptions, 0),
        followers: locData.reduce((s: number, l: any) => s + l.followers, 0),
      },
      brandAverages: { sessions: avgSessions, uniqueVisitors: avgVisitors, beersLogged: avgBeers, avgRating: overallAvgRating },
    };
  }

  return { brand, locations: locations ?? [], initialData };
}

export default async function BrandReportsPage({ params }: { params: Promise<{ brand_id: string }> }) {
  const { brand_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify brand membership (shared utility — handles RLS fallback)
  const brandAccess = await verifyBrandAccessWithScope(supabase, brand_id, user.id);
  if (!brandAccess) redirect("/brewery-admin");
  const { locationScope } = brandAccess;

  // Fetch cached data (auth verified above)
  const { brand, locations, initialData } = await fetchCachedReportsData(brand_id);

  if (!brand) notFound();

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
              {brand.name} — Reports
            </h1>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                <MapPin size={11} /> {locations.length} location{locations.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <Link
            href={`/brewery-admin/brand/${brand_id}/dashboard`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-opacity hover:opacity-80"
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            <ArrowLeft size={14} />
            Dashboard
          </Link>
        </div>
      </div>

      {/* Reports Content */}
      <BrandReportsClient
        brandId={brand_id}
        brandSlug={brand.slug}
        initialData={initialData}
        locationCount={locations.length}
        locations={locations.map((l: any) => ({ id: l.id, name: l.name, city: l.city, state: l.state }))}
        locationScope={locationScope}
      />
    </div>
  );
}
