import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";
import Anthropic from "@anthropic-ai/sdk";
import {
  buildHopRoutePrompt,
  enforceMaxOneSponsoredStop,
  type HopRouteInput,
  type HopRouteOutput,
} from "@/lib/hop-route";
import { haversineDistance } from "@/lib/geo";

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

  interface NearbyBrewery {
    id: string;
    name: string;
    city: string | null;
    state: string | null;
    latitude: number | null;
    longitude: number | null;
    brewery_type: string | null;
    hop_route_eligible: boolean | null;
    hop_route_offer: string | null;
    vibe_tags: string[] | null;
  }

  interface TapBeer {
    id: string;
    name: string;
    style: string | null;
    brewery_id: string;
  }

  interface BeerLogWithStyle {
    rating: number | null;
    beer: { style: string | null } | null; // supabase join shape
  }

  interface FriendshipRow {
    requester_id: string;
    addressee_id: string;
  }

  interface FriendSession {
    user_id: string;
    brewery_id: string;
    brewery: { name: string } | null; // supabase join shape
    profile: { display_name: string | null; username: string } | null; // supabase join shape
  }

  // 1. Fetch nearby breweries (within ~25 miles)
  const { data: allBreweries } = await supabase
    .from("breweries")
    .select("id, name, city, state, latitude, longitude, brewery_type, hop_route_eligible, hop_route_offer, vibe_tags")
    .not("latitude", "is", null)
    .not("longitude", "is", null);

  const radiusMiles = transport === "walking" ? 1.5 : transport === "rideshare" ? 10 : 25;
  const nearbyBreweries = ((allBreweries ?? []) as NearbyBrewery[])
    .filter((b) => {
      if (!b.latitude || !b.longitude) return false;
      const dist = haversineDistance(location.lat, location.lng, b.latitude, b.longitude);
      return dist <= radiusMiles;
    })
    .slice(0, 30); // Cap at 30 for context window

  if (nearbyBreweries.length < stop_count) {
    return NextResponse.json(
      { error: `Not enough breweries nearby. Found ${nearbyBreweries.length}, need ${stop_count}.` },
      { status: 422 }
    );
  }

  // Fetch top beers for each brewery
  const breweryIds = nearbyBreweries.map((b) => b.id);
  const { data: beers } = await supabase
    .from("beers")
    .select("id, name, style, brewery_id")
    .in("brewery_id", breweryIds)
    .eq("is_on_tap" as never, true);

  const beersByBrewery = new Map<string, TapBeer[]>();
  for (const beer of (beers ?? []) as TapBeer[]) {
    const arr = beersByBrewery.get(beer.brewery_id) ?? [];
    arr.push(beer);
    beersByBrewery.set(beer.brewery_id, arr);
  }

  // 2. Fetch user's Taste DNA
  const { data: beerLogs } = await supabase
    .from("beer_logs")
    .select("rating, beer:beers(style)")
    .eq("user_id", user.id)
    .not("rating", "is", null);

  const styleMap = new Map<string, { total: number; count: number }>();
  for (const log of (beerLogs ?? []) as BeerLogWithStyle[]) {
    const style = log.beer?.style;
    if (!style || !log.rating) continue;
    const existing = styleMap.get(style) ?? { total: 0, count: 0 };
    styleMap.set(style, { total: existing.total + log.rating, count: existing.count + 1 });
  }
  const taste_dna = Array.from(styleMap.entries())
    .map(([style, { total, count }]) => ({ style, avg_rating: total / count }))
    .sort((a, b) => b.avg_rating - a.avg_rating);

  // 3. Fetch social context (friend check-ins last 90 days)
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const { data: friendships } = await supabase
    .from("friendships")
    .select("requester_id, addressee_id")
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .eq("status", "accepted");

  const friendIds = ((friendships ?? []) as FriendshipRow[]).map((f) =>
    f.requester_id === user.id ? f.addressee_id : f.requester_id
  );

  const social_context: HopRouteInput["social_context"] = [];
  if (friendIds.length > 0) {
    const { data: friendSessions } = await supabase
      .from("sessions")
      .select("user_id, brewery_id, brewery:breweries(name), profile:profiles!sessions_user_id_fkey(display_name, username)")
      .in("user_id", friendIds)
      .in("brewery_id", breweryIds)
      .gte("started_at", ninetyDaysAgo);

    const socialMap = new Map<string, { brewery_name: string; friend_name: string; count: number }>();
    for (const s of (friendSessions ?? []) as FriendSession[]) {
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
  }

  // 4. Assemble input and call Claude
  const hopRouteInput: HopRouteInput = {
    location,
    time_window,
    stop_count,
    group_size,
    vibe,
    transport,
    taste_dna,
    social_context,
    breweries: nearbyBreweries.map((b) => ({
      id: b.id,
      name: b.name,
      city: b.city,
      state: b.state,
      latitude: b.latitude,
      longitude: b.longitude,
      brewery_type: b.brewery_type,
      is_sponsored: b.hop_route_eligible ?? false,
      vibe_tags: b.vibe_tags ?? [],
      top_beers: (beersByBrewery.get(b.id) ?? []).slice(0, 5).map((beer) => ({
        id: beer.id,
        name: beer.name,
        style: beer.style,
      })),
    })),
  };

  const { system, user: userMsg } = buildHopRoutePrompt(hopRouteInput);

  let aiOutput: HopRouteOutput;
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system,
      messages: [{ role: "user", content: userMsg }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    // Strip any accidental markdown code fences
    const clean = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    aiOutput = JSON.parse(clean) as HopRouteOutput;
  } catch (err) {
    console.error("[HopRoute] AI error:", err);
    return NextResponse.json({ error: "Failed to generate route. Please try again." }, { status: 502 });
  }

  // Enforce max 1 sponsored stop
  aiOutput.stops = enforceMaxOneSponsoredStop(aiOutput.stops);

  // 5. Persist to database
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
    })
    .select("id")
    .single();

  if (routeErr || !route) {
    return NextResponse.json({ error: "Failed to save route" }, { status: 500 });
  }

  const routeRow = route as { id: string };

  // Insert stops
  for (const stop of aiOutput.stops) {
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
      })
      .select("id")
      .single();

    if (stopErr || !stopRow) continue;

    const stopRowTyped = stopRow as { id: string };

    // Insert recommended beers
    if (stop.recommended_beers?.length > 0) {
      await supabase.from("hop_route_stop_beers" as never).insert(
        stop.recommended_beers.map((b) => ({
          stop_id: stopRowTyped.id,
          beer_id: b.beer_id || null,
          beer_name: b.name,
          reason_text: b.reason,
        }))
      );
    }
  }

  return NextResponse.json({ route_id: routeRow.id, title: aiOutput.title }, { status: 201 });
}
