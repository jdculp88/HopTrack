import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";
import Anthropic from "@anthropic-ai/sdk";
import {
  buildHopRoutePrompt,
  enforceMaxOneSponsoredStop,
  computeTasteFingerprint,
  scoreBreweryRelevance,
  computeRouteMetrics,
  type HopRouteInput,
  type HopRouteOutput,
  type HopRouteBrewery,
  type BeerLogWithSensory,
  type BeerReviewRow,
  type BreweryForScoring,
  type ScoringUserContext,
  type RouteMetricsStop,
} from "@/lib/hop-route";
import { haversineDistance } from "@/lib/geo";
import { computePersonality, type PersonalityBeerLog } from "@/lib/personality";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// POST /api/hop-route/generate
export async function POST(request: Request) {
  const limited = rateLimitResponse(request, "hop-route-generate", { limit: 5, windowMs: 60 * 1000 });
  if (limited) return limited;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { location, time_window, stop_count = 3, group_size = "solo", vibe = [], transport = "walking" } = body;

  if (!location?.lat || !location?.lng || !location?.city) {
    return NextResponse.json({ error: "location with lat, lng, city is required" }, { status: 400 });
  }
  if (!time_window?.start || !time_window?.end) {
    return NextResponse.json({ error: "time_window with start and end is required" }, { status: 400 });
  }
  if (stop_count < 2 || stop_count > 5) {
    return NextResponse.json({ error: "stop_count must be between 2 and 5" }, { status: 400 });
  }

  // ── Local interfaces for Supabase row shapes ──────────────────────────────

  interface NearbyBrewery {
    id: string;
    name: string;
    city: string | null;
    state: string | null;
    latitude: number | null;
    longitude: number | null;
    brewery_type: string | null;
    description: string | null;
    hop_route_eligible: boolean | null;
    hop_route_offer: string | null;
    vibe_tags: string[] | null;
  }

  interface TapBeer {
    id: string;
    name: string;
    style: string | null;
    abv: number | null;
    avg_rating: number | null;
    brewery_id: string;
    created_at: string;
    aroma_notes: string[] | null;
    taste_notes: string[] | null;
    finish_notes: string[] | null;
  }

  interface FriendshipRow {
    requester_id: string;
    addressee_id: string;
  }

  interface FriendSession {
    user_id: string;
    brewery_id: string;
    brewery: { name: string } | null;
    profile: { display_name: string | null; username: string } | null;
  }

  interface FriendReviewRow {
    rating: number | null;
    beer: { name: string; brewery_id: string } | null;
    profile: { display_name: string | null } | null;
  }

  interface VisitRow {
    brewery_id: string;
    total_visits: number;
    unique_beers_tried: number;
    last_visit_at: string | null;
  }

  interface PourSizeRow {
    beer_id: string;
    size_name: string;
    size_oz: number;
    price: number;
  }

  // ── 1. Fetch nearby breweries with adaptive radius ────────────────────────

  const { data: allBreweries } = await supabase
    .from("breweries")
    .select("id, name, city, state, latitude, longitude, brewery_type, description, hop_route_eligible, hop_route_offer, vibe_tags")
    .not("latitude", "is", null)
    .not("longitude", "is", null);

  let radiusMiles = transport === "walking" ? 1.5 : transport === "rideshare" ? 10 : 25;

  function filterByRadius(breweries: NearbyBrewery[], radius: number): NearbyBrewery[] {
    return breweries.filter((b) => {
      if (!b.latitude || !b.longitude) return false;
      return haversineDistance(location.lat, location.lng, b.latitude, b.longitude) <= radius;
    });
  }

  let nearbyBreweries = filterByRadius((allBreweries ?? []) as unknown as NearbyBrewery[], radiusMiles);

  // Adaptive walking radius: 1.5 → 2.5 → 3.0 mi
  if (transport === "walking" && nearbyBreweries.length < stop_count * 2) {
    radiusMiles = 2.5;
    nearbyBreweries = filterByRadius((allBreweries ?? []) as unknown as NearbyBrewery[], radiusMiles);
  }
  if (transport === "walking" && nearbyBreweries.length < stop_count * 2) {
    radiusMiles = 3.0;
    nearbyBreweries = filterByRadius((allBreweries ?? []) as unknown as NearbyBrewery[], radiusMiles);
  }

  if (nearbyBreweries.length < stop_count) {
    return NextResponse.json(
      { error: `Not enough breweries nearby. Found ${nearbyBreweries.length}, need ${stop_count}.` },
      { status: 422 },
    );
  }

  const breweryIds = nearbyBreweries.map((b) => b.id);

  // ── 2. Parallel data fetches ──────────────────────────────────────────────

  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [
    beersResult,
    personalityLogsResult,
    sensoryLogsResult,
    wishlistResult,
    visitHistoryResult,
    reviewsResult,
    friendshipsResult,
    recentCheckinsResult,
  ] = await Promise.all([
    // On-tap beers with full sensory data
    supabase
      .from("beers")
      .select("id, name, style, abv, avg_rating, brewery_id, created_at, aroma_notes, taste_notes, finish_notes")
      .in("brewery_id", breweryIds)
      .eq("is_on_tap" as never, true),

    // Personality logs (for computePersonality)
    supabase
      .from("beer_logs")
      .select("beer_id, rating, beer:beers(id, style, item_type)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(200),

    // Sensory-enriched beer logs (for taste fingerprint)
    supabase
      .from("beer_logs")
      .select("rating, beer:beers(style, abv, aroma_notes, taste_notes, finish_notes)")
      .eq("user_id", user.id)
      .not("rating", "is", null)
      .order("created_at", { ascending: false })
      .limit(200),

    // Wishlist
    supabase.from("wishlist").select("beer_id").eq("user_id", user.id),

    // Visit history at nearby breweries
    supabase
      .from("brewery_visits")
      .select("brewery_id, total_visits, unique_beers_tried, last_visit_at")
      .eq("user_id", user.id)
      .in("brewery_id", breweryIds),

    // Reviews with flavor tags
    supabase
      .from("beer_reviews")
      .select("rating, flavor_tags")
      .eq("user_id", user.id)
      .not("flavor_tags", "is", null)
      .order("rating", { ascending: false })
      .limit(50),

    // Friendships
    supabase
      .from("friendships")
      .select("requester_id, addressee_id")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq("status", "accepted"),

    // Recent check-ins at nearby breweries (trending signal)
    supabase
      .from("sessions")
      .select("brewery_id")
      .in("brewery_id", breweryIds)
      .gte("started_at", twentyFourHoursAgo),
  ]);

  // ── 3. Compute personality + taste fingerprint ────────────────────────────

  const personalityLogs = (personalityLogsResult.data ?? []) as unknown as PersonalityBeerLog[];
  const personality = computePersonality(personalityLogs);

  const sensoryLogs = (sensoryLogsResult.data ?? []) as unknown as BeerLogWithSensory[];
  const reviewRows = (reviewsResult.data ?? []) as unknown as BeerReviewRow[];
  const tasteFingerprint = computeTasteFingerprint(sensoryLogs, reviewRows, personality);

  // Build legacy taste_dna for backward compatibility in prompt
  const styleMap = new Map<string, { total: number; count: number }>();
  for (const log of sensoryLogs) {
    const style = log.beer?.style;
    if (!style || typeof log.rating !== "number") continue;
    const existing = styleMap.get(style) ?? { total: 0, count: 0 };
    styleMap.set(style, { total: existing.total + log.rating, count: existing.count + 1 });
  }
  const taste_dna = Array.from(styleMap.entries())
    .map(([style, { total, count }]) => ({ style, avg_rating: total / count }))
    .sort((a, b) => b.avg_rating - a.avg_rating);

  // ── 4. Build scoring context ──────────────────────────────────────────────

  const wishlistBeerIds = new Set(
    ((wishlistResult.data ?? []) as Array<{ beer_id: string }>).map((w) => w.beer_id),
  );

  const visitHistory = new Map<string, { total_visits: number; last_visit_at: string | null }>();
  for (const v of (visitHistoryResult.data ?? []) as unknown as VisitRow[]) {
    visitHistory.set(v.brewery_id, { total_visits: v.total_visits, last_visit_at: v.last_visit_at });
  }

  // Combined top sensory notes from fingerprint
  const tasteFingerprintNotes = [
    ...tasteFingerprint.topAromaNotes,
    ...tasteFingerprint.topTasteNotes,
    ...tasteFingerprint.topFinishNotes,
  ].slice(0, 10);

  const scoringCtx: ScoringUserContext = {
    personality,
    tasteFingerprintNotes,
    wishlistBeerIds,
    visitHistory,
    vibeFilters: vibe,
  };

  // Build beer-by-brewery map
  const beers = (beersResult.data ?? []) as unknown as TapBeer[];
  const beersByBrewery = new Map<string, TapBeer[]>();
  for (const beer of beers) {
    const arr = beersByBrewery.get(beer.brewery_id) ?? [];
    arr.push(beer);
    beersByBrewery.set(beer.brewery_id, arr);
  }

  // Recent check-in counts by brewery (trending)
  const checkinCounts = new Map<string, number>();
  for (const s of (recentCheckinsResult.data ?? []) as Array<{ brewery_id: string }>) {
    checkinCounts.set(s.brewery_id, (checkinCounts.get(s.brewery_id) ?? 0) + 1);
  }

  // ── 5. Score & rank breweries ─────────────────────────────────────────────

  const scoredBreweries = nearbyBreweries.map((b) => {
    const breweryBeers = beersByBrewery.get(b.id) ?? [];
    const onTapSensoryNotes = breweryBeers.flatMap((beer) => [
      ...(beer.aroma_notes ?? []),
      ...(beer.taste_notes ?? []),
      ...(beer.finish_notes ?? []),
    ]);

    // Avg tap age in days
    const now = Date.now();
    const tapAges = breweryBeers
      .map((beer) => (now - new Date(beer.created_at).getTime()) / (1000 * 60 * 60 * 24))
      .filter((d) => d >= 0);
    const avgTapAgeDays = tapAges.length > 0 ? tapAges.reduce((a, b) => a + b, 0) / tapAges.length : 0;

    const breweryForScoring: BreweryForScoring = {
      id: b.id,
      name: b.name,
      vibe_tags: b.vibe_tags ?? [],
      on_tap_beer_ids: breweryBeers.map((beer) => beer.id),
      on_tap_sensory_notes: onTapSensoryNotes,
      avg_tap_age_days: avgTapAgeDays,
      recent_checkin_count: checkinCounts.get(b.id) ?? 0,
    };

    const { score, reasons } = scoreBreweryRelevance(breweryForScoring, scoringCtx);
    return { brewery: b, beers: breweryBeers, score, reasons };
  });

  // Sort by score descending, take top 15
  scoredBreweries.sort((a, b) => b.score - a.score);
  const top15 = scoredBreweries.slice(0, 15);

  // ── 6. Fetch friend activity for top-15 ───────────────────────────────────

  const friendIds = ((friendshipsResult.data ?? []) as unknown as FriendshipRow[]).map((f) =>
    f.requester_id === user.id ? f.addressee_id : f.requester_id,
  );

  // Legacy social context (friend sessions at breweries)
  const social_context: HopRouteInput["social_context"] = [];
  const friendReviewsByBrewery = new Map<string, Array<{ friend_name: string; beer_name: string; rating: number; when_display: string }>>();

  if (friendIds.length > 0) {
    const top15Ids = top15.map((s) => s.brewery.id);

    const [friendSessionsResult, friendReviewsResult] = await Promise.all([
      supabase
        .from("sessions")
        .select("user_id, brewery_id, brewery:breweries(name), profile:profiles!sessions_user_id_fkey(display_name, username)")
        .in("user_id", friendIds)
        .in("brewery_id", top15Ids)
        .gte("started_at", ninetyDaysAgo),

      supabase
        .from("beer_reviews")
        .select("rating, beer:beers(name, brewery_id), profile:profiles(display_name)")
        .in("user_id", friendIds)
        .gte("created_at", ninetyDaysAgo)
        .not("rating", "is", null)
        .order("rating", { ascending: false })
        .limit(100),
    ]);

    // Build legacy social context
    const socialMap = new Map<string, { brewery_name: string; friend_name: string; count: number }>();
    for (const s of (friendSessionsResult.data ?? []) as unknown as FriendSession[]) {
      const key = `${s.user_id}:${s.brewery_id}`;
      const existing = socialMap.get(key);
      const friendName = s.profile?.display_name || s.profile?.username || "A friend";
      const breweryName = s.brewery?.name ?? "a brewery";
      if (existing) {
        existing.count++;
      } else {
        socialMap.set(key, { brewery_name: breweryName, friend_name: friendName, count: 1 });
      }
    }
    for (const [key, val] of socialMap.entries()) {
      const brewery_id = key.split(":")[1];
      social_context.push({ brewery_id, brewery_name: val.brewery_name, friend_name: val.friend_name, visit_count: val.count });
    }

    // Build friend reviews by brewery (for rich brewery data)
    for (const r of (friendReviewsResult.data ?? []) as unknown as FriendReviewRow[]) {
      if (!r.beer?.brewery_id || !r.beer?.name || !r.rating) continue;
      const brewId = r.beer.brewery_id;
      const arr = friendReviewsByBrewery.get(brewId) ?? [];
      arr.push({
        friend_name: r.profile?.display_name || "A friend",
        beer_name: r.beer.name,
        rating: r.rating,
        when_display: "recently",
      });
      friendReviewsByBrewery.set(brewId, arr);
    }
  }

  // ── 7. Assemble enriched brewery data for Claude ──────────────────────────

  const enrichedBreweries: HopRouteBrewery[] = top15.map(({ brewery: b, beers: breweryBeers, score, reasons }) => {
    const visit = visitHistory.get(b.id);
    let lastVisitDisplay = "";
    if (visit?.last_visit_at) {
      const daysSince = Math.round((Date.now() - new Date(visit.last_visit_at).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince <= 1) lastVisitDisplay = "today";
      else if (daysSince <= 7) lastVisitDisplay = `${daysSince} days ago`;
      else if (daysSince <= 30) lastVisitDisplay = `${Math.round(daysSince / 7)} weeks ago`;
      else lastVisitDisplay = `${Math.round(daysSince / 30)} months ago`;
    }

    return {
      id: b.id,
      name: b.name,
      city: b.city,
      state: b.state,
      latitude: b.latitude,
      longitude: b.longitude,
      brewery_type: b.brewery_type,
      is_sponsored: b.hop_route_eligible ?? false,
      vibe_tags: b.vibe_tags ?? [],
      relevance_score: score,
      relevance_reasons: reasons,
      description: b.description,
      visit_history: visit ? { total_visits: visit.total_visits, last_visit_display: lastVisitDisplay, unique_beers_tried: 0 } : null,
      friend_activity: (friendReviewsByBrewery.get(b.id) ?? []).slice(0, 2),
      top_beers: breweryBeers.slice(0, 8).map((beer) => ({
        id: beer.id,
        name: beer.name,
        style: beer.style,
        abv: beer.abv,
        avg_rating: beer.avg_rating,
        aroma_notes: (beer.aroma_notes ?? []).slice(0, 3),
        taste_notes: (beer.taste_notes ?? []).slice(0, 3),
        finish_notes: (beer.finish_notes ?? []).slice(0, 3),
        is_wishlisted: wishlistBeerIds.has(beer.id),
        is_trending: (checkinCounts.get(b.id) ?? 0) >= 3,
      })),
    };
  });

  // ── 8. Build prompt and call Claude ───────────────────────────────────────

  const hopRouteInput: HopRouteInput = {
    location,
    time_window,
    stop_count,
    group_size,
    vibe,
    transport,
    taste_dna,
    taste_fingerprint: tasteFingerprint,
    social_context,
    breweries: enrichedBreweries,
  };

  const { system, user: userMsg } = buildHopRoutePrompt(hopRouteInput);

  // Token budget check (dev only)
  if (process.env.NODE_ENV === "development") {
    const approxTokens = Math.ceil((system.length + userMsg.length) / 4);
    console.log(`[HopRoute] Prompt size: ~${approxTokens} tokens (system: ${system.length} chars, user: ${userMsg.length} chars)`);
  }

  let aiOutput: HopRouteOutput;
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system,
      messages: [{ role: "user", content: userMsg }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const clean = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    aiOutput = JSON.parse(clean) as HopRouteOutput;
  } catch (err) {
    console.error("[HopRoute] AI error:", err);
    return NextResponse.json({ error: "Failed to generate route. Please try again." }, { status: 502 });
  }

  // Enforce max 1 sponsored stop
  aiOutput.stops = enforceMaxOneSponsoredStop(aiOutput.stops);

  // ── 9. Persist to database ────────────────────────────────────────────────

  // Build lat/lng lookup for selected breweries
  const breweryLatLng = new Map<string, { lat: number; lng: number }>();
  for (const b of enrichedBreweries) {
    if (b.latitude && b.longitude) {
      breweryLatLng.set(b.id, { lat: b.latitude, lng: b.longitude });
    }
  }

  // Compute distance metrics
  const metricsStops: RouteMetricsStop[] = aiOutput.stops
    .map((stop) => {
      const coords = breweryLatLng.get(stop.brewery_id);
      if (!coords) return null;
      return { brewery_id: stop.brewery_id, stop_order: stop.stop_order, lat: coords.lat, lng: coords.lng };
    })
    .filter((s): s is RouteMetricsStop => s !== null);

  const metrics = computeRouteMetrics(metricsStops);

  const { data: route, error: routeErr } = await supabase
    .from("hop_routes" as never)
    .insert({
      user_id: user.id,
      title: aiOutput.title,
      location_city: location.city,
      location_lat: location.lat,
      location_lng: location.lng,
      stop_count,
      group_size,
      vibe,
      transport,
      status: "draft",
      total_distance_miles: metrics.total_distance_miles,
      avg_stop_distance_miles: metrics.avg_stop_distance_miles,
    })
    .select("id")
    .single();

  if (routeErr || !route) {
    return NextResponse.json({ error: "Failed to save route" }, { status: 500 });
  }

  const routeRow = route as { id: string };

  // Insert stops with distance metrics
  for (const stop of aiOutput.stops) {
    const leg = metrics.legs.find((l) => l.from_order === stop.stop_order);

    const { data: stopRow, error: stopErr } = await supabase
      .from("hop_route_stops" as never)
      .insert({
        route_id: routeRow.id,
        brewery_id: stop.brewery_id,
        stop_order: stop.stop_order,
        arrival_time: stop.arrival_time,
        departure_time: stop.departure_time,
        travel_to_next_minutes: stop.travel_to_next_minutes,
        reasoning_text: stop.reasoning_text,
        social_context: stop.social_context,
        is_sponsored: stop.is_sponsored,
        distance_to_next_miles: leg?.distance_miles ?? null,
        walk_minutes_to_next: leg?.walk_minutes ?? null,
      })
      .select("id")
      .single();

    if (stopErr || !stopRow) continue;

    const stopRowTyped = stopRow as { id: string };

    if (stop.recommended_beers?.length > 0) {
      await supabase.from("hop_route_stop_beers" as never).insert(
        stop.recommended_beers.map((b) => ({
          stop_id: stopRowTyped.id,
          beer_id: b.beer_id || null,
          beer_name: b.name,
          reason_text: b.reason,
        })),
      );
    }
  }

  return NextResponse.json({ route_id: routeRow.id, title: aiOutput.title }, { status: 201 });
}
