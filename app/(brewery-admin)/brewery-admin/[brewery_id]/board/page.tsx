import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { BoardClient } from "./BoardClient";

export const metadata = { title: "The Board — HopTrack" };

export default async function BoardPage({ params }: { params: Promise<{ brewery_id: string }> }) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify brewery access
  const { data: account } = await supabase
    .from("brewery_accounts").select("role")
    .eq("user_id", user.id).eq("brewery_id", brewery_id).single() as any;
  if (!account) notFound();

  // Get brewery info
  const { data: brewery } = await supabase
    .from("breweries").select("id, name, cover_image_url")
    .eq("id", brewery_id).single() as any;

  // Get on-tap beers ordered by display_order
  const { data: beers } = await (supabase as any)
    .from("beers").select("*")
    .eq("brewery_id", brewery_id)
    .eq("is_on_tap", true)
    .order("display_order", { ascending: true })
    .order("name") as any;

  // Get upcoming events
  const { data: events } = await (supabase as any)
    .from("brewery_events").select("id, title, event_date, start_time")
    .eq("brewery_id", brewery_id)
    .eq("is_active", true)
    .gte("event_date", new Date().toISOString().split("T")[0])
    .order("event_date", { ascending: true })
    .limit(3) as any;

  // ── Brewery stats from HopTrack data ────────────────────────────────────
  // Total pours logged at this brewery
  const { count: totalPours } = await (supabase as any)
    .from("beer_logs")
    .select("id", { count: "exact", head: true })
    .eq("brewery_id", brewery_id) as any;

  // Total unique visitors
  const { count: uniqueVisitors } = await (supabase as any)
    .from("sessions")
    .select("user_id", { count: "exact", head: true })
    .eq("brewery_id", brewery_id) as any;

  // Per-beer stats: log count + avg rating from beer_logs
  const { data: beerLogStats } = await (supabase as any)
    .from("beer_logs")
    .select("beer_id, quantity, rating")
    .eq("brewery_id", brewery_id) as any;

  // Aggregate per-beer stats
  const beerStatsMap: Record<string, { logCount: number; totalRating: number; ratingCount: number }> = {};
  if (beerLogStats) {
    for (const log of beerLogStats as any[]) {
      if (!log.beer_id) continue;
      if (!beerStatsMap[log.beer_id]) {
        beerStatsMap[log.beer_id] = { logCount: 0, totalRating: 0, ratingCount: 0 };
      }
      beerStatsMap[log.beer_id].logCount += log.quantity ?? 1;
      if (log.rating != null) {
        beerStatsMap[log.beer_id].totalRating += log.rating;
        beerStatsMap[log.beer_id].ratingCount += 1;
      }
    }
  }

  // Build per-beer stats object: { beerId: { pourCount, avgRating } }
  const beerStats: Record<string, { pourCount: number; avgRating: number | null }> = {};
  for (const [beerId, stats] of Object.entries(beerStatsMap)) {
    beerStats[beerId] = {
      pourCount: stats.logCount,
      avgRating: stats.ratingCount > 0 ? Math.round((stats.totalRating / stats.ratingCount) * 10) / 10 : null,
    };
  }

  // Find top-rated and most popular beer names
  let topRatedBeer: string | null = null;
  let topRatedScore = 0;
  let mostPopularBeer: string | null = null;
  let mostPopularCount = 0;

  const beerList = (beers as any[]) ?? [];
  for (const beer of beerList) {
    const stats = beerStats[beer.id];
    if (stats) {
      if (stats.avgRating != null && stats.avgRating > topRatedScore) {
        topRatedScore = stats.avgRating;
        topRatedBeer = beer.name;
      }
      if (stats.pourCount > mostPopularCount) {
        mostPopularCount = stats.pourCount;
        mostPopularBeer = beer.name;
      }
    }
  }

  const breweryStats = {
    totalPours: totalPours ?? 0,
    uniqueVisitors: uniqueVisitors ?? 0,
    topRatedBeer,
    topRatedScore: topRatedScore > 0 ? topRatedScore : null,
    mostPopularBeer,
    mostPopularCount,
  };

  return (
    <BoardClient
      breweryId={brewery_id}
      breweryName={brewery?.name ?? "Unknown Brewery"}
      initialBeers={beerList}
      events={(events as any[]) ?? []}
      breweryStats={breweryStats}
      beerStats={beerStats}
    />
  );
}
