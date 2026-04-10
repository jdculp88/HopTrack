import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BoardClient } from "./BoardClient";
import { resolveTheme } from "@/lib/board-themes";
import { getFontPairUrl } from "@/lib/board-fonts";
import type { PourSize } from "@/lib/glassware";

export const metadata = { title: "The Board — HopTrack" };

export default async function BoardPage({ params }: { params: Promise<{ brewery_id: string }> }) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: account } = await supabase
    .from("brewery_accounts").select("role")
    .eq("user_id", user.id).eq("brewery_id", brewery_id).single() as any;
  if (!account) redirect("/brewery-admin");

  // Sprint A: fetch Display Suite columns alongside the basics. These may
  // be null on legacy rows (migration 110 sets defaults but doesn't backfill
  // every edge case) — BoardClient handles null gracefully via `resolveTheme`.
  const { data: brewery } = await supabase
    .from("breweries").select(
      "id, name, cover_image_url, " +
      "board_theme_id, brand_color, brand_color_secondary, " +
      "board_font_id, board_display_scale"
    )
    .eq("id", brewery_id).single() as any;

  const { data: beers } = await supabase
    .from("beers").select("*")
    .eq("brewery_id", brewery_id)
    .eq("is_on_tap", true)
    .order("display_order", { ascending: true })
    .order("name") as any;

  // ── Pour sizes for all on-tap beers ─────────────────────────────────────────
  const beerIds = ((beers as any[]) ?? []).map((b: any) => b.id as string);
  const pourSizesMap: Record<string, PourSize[]> = {};
  if (beerIds.length > 0) {
    const { data: allPourSizes } = await supabase
      .from("beer_pour_sizes")
      .select("*")
      .in("beer_id", beerIds)
      .order("display_order", { ascending: true });
    if (allPourSizes) {
      for (const row of allPourSizes as PourSize[]) {
        if (!row.beer_id) continue;
        if (!pourSizesMap[row.beer_id]) pourSizesMap[row.beer_id] = [];
        pourSizesMap[row.beer_id].push(row);
      }
    }
  }

  const { data: events } = await supabase
    .from("brewery_events").select("id, title, event_date, start_time")
    .eq("brewery_id", brewery_id)
    .eq("is_active", true)
    .gte("event_date", new Date().toISOString().split("T")[0])
    .order("event_date", { ascending: true })
    .limit(4) as any;

  // ── Brewery-level stats ──────────────────────────────────────────────────
  const { count: totalPours } = await supabase
    .from("beer_logs")
    .select("id", { count: "exact", head: true })
    .eq("brewery_id", brewery_id) as any;

  const { count: uniqueVisitors } = await supabase
    .from("sessions")
    .select("user_id", { count: "exact", head: true })
    .eq("brewery_id", brewery_id) as any;

  // ── Per-beer logs: quantity, rating, user ────────────────────────────────
  const { data: beerLogStats } = await supabase
    .from("beer_logs")
    .select("beer_id, user_id, quantity, rating")
    .eq("brewery_id", brewery_id) as any;

  // Aggregate per-beer stats + biggest fan (by pour count)
  const beerStatsMap: Record<string, {
    logCount: number;
    totalRating: number;
    ratingCount: number;
    userTotals: Record<string, number>;
  }> = {};

  if (beerLogStats) {
    for (const log of beerLogStats as any[]) {
      if (!log.beer_id) continue;
      if (!beerStatsMap[log.beer_id]) {
        beerStatsMap[log.beer_id] = { logCount: 0, totalRating: 0, ratingCount: 0, userTotals: {} };
      }
      const qty = log.quantity ?? 1;
      beerStatsMap[log.beer_id].logCount += qty;
      if (log.rating != null) {
        beerStatsMap[log.beer_id].totalRating += log.rating;
        beerStatsMap[log.beer_id].ratingCount += 1;
      }
      if (log.user_id) {
        beerStatsMap[log.beer_id].userTotals[log.user_id] =
          (beerStatsMap[log.beer_id].userTotals[log.user_id] ?? 0) + qty;
      }
    }
  }

  // Find top user per beer
  const beerFanUserIds: Record<string, string> = {};
  for (const [beerId, stats] of Object.entries(beerStatsMap)) {
    let topUser = "";
    let topCount = 0;
    for (const [uid, count] of Object.entries(stats.userTotals)) {
      if (count > topCount) { topCount = count; topUser = uid; }
    }
    if (topUser) beerFanUserIds[beerId] = topUser;
  }

  // Fetch fan profiles
  const fanUserIds = [...new Set(Object.values(beerFanUserIds))];
  const fanProfiles: Record<string, string> = {};
  if (fanUserIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, username")
      .in("id", fanUserIds) as any;
    if (profiles) {
      for (const p of profiles as any[]) {
        fanProfiles[p.id] = p.display_name || p.username || "Anonymous";
      }
    }
  }

  // Build final per-beer stats
  const beerStats: Record<string, { pourCount: number; avgRating: number | null; biggestFan: string | null }> = {};
  for (const [beerId, stats] of Object.entries(beerStatsMap)) {
    const fanUid = beerFanUserIds[beerId];
    beerStats[beerId] = {
      pourCount: stats.logCount,
      avgRating: stats.ratingCount > 0 ? Math.round((stats.totalRating / stats.ratingCount) * 10) / 10 : null,
      biggestFan: fanUid ? (fanProfiles[fanUid] ?? null) : null,
    };
  }

  // Brewery-level summary stats
  let topRatedBeer: string | null = null;
  let topRatedScore = 0;
  let mostPopularBeer: string | null = null;
  let mostPopularCount = 0;
  const beerList = (beers as any[]) ?? [];
  for (const beer of beerList) {
    const s = beerStats[beer.id];
    if (s) {
      if (s.avgRating != null && s.avgRating > topRatedScore) { topRatedScore = s.avgRating; topRatedBeer = beer.name; }
      if (s.pourCount > mostPopularCount) { mostPopularCount = s.pourCount; mostPopularBeer = beer.name; }
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

  // Sprint A: resolve the brewery's theme server-side so we can preload the
  // correct Google Font pair instead of hard-coding Instrument Serif.
  const theme = resolveTheme(
    { board_theme_id: brewery?.board_theme_id, brand_color: brewery?.brand_color },
    brewery?.board_theme_id,
  );
  const fontUrl = getFontPairUrl(brewery?.board_font_id ?? theme.fontId);

  return (
    <>
      {/* Load the active theme's font pair for the Board */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href={fontUrl} rel="stylesheet" />
      <BoardClient
        breweryId={brewery_id}
        breweryName={brewery?.name ?? "Unknown Brewery"}
        initialBeers={beerList}
        events={(events as any[]) ?? []}
        breweryStats={breweryStats}
        beerStats={beerStats}
        pourSizesMap={pourSizesMap}
        boardThemeId={brewery?.board_theme_id ?? null}
        brandColor={brewery?.brand_color ?? null}
        brandColorSecondary={brewery?.brand_color_secondary ?? null}
        boardDisplayScale={brewery?.board_display_scale ?? null}
      />
    </>
  );
}
