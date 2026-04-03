import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";

// GET /api/challenges/nearby — discover sponsored challenges near a location
// Query params: lat, lng, radius_km (optional, default 50), limit (optional, default 20)
export async function GET(request: NextRequest) {
  const limited = rateLimitResponse(request, "challenges-nearby", { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");
  const radiusKm = parseInt(searchParams.get("radius_km") ?? "50", 10);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 50);

  // Fetch active sponsored challenges with brewery location
  const { data: challenges, error } = await (supabase
    .from("challenges")
    .select(`
      id, name, description, icon, challenge_type, target_value,
      reward_description, reward_xp, ends_at, is_sponsored,
      cover_image_url, geo_radius_km, created_at,
      participant_count:challenge_participants(count),
      brewery:breweries!inner(id, name, city, state, latitude, longitude, cover_image_url)
    `)
    .eq("is_sponsored", true)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(limit * 3) as any); // Over-fetch to filter by distance

  if (error) {
    return NextResponse.json({ error: "Failed to fetch challenges" }, { status: 500 });
  }

  const now = new Date();
  let results = (challenges ?? [])
    .map((c: any) => {
      const brewery = c.brewery;
      const participantCount = c.participant_count?.[0]?.count ?? 0;

      // Filter out ended challenges
      if (c.ends_at && new Date(c.ends_at) < now) return null;

      // Calculate distance if coordinates provided
      let distanceKm: number | null = null;
      if (!isNaN(lat) && !isNaN(lng) && brewery?.latitude && brewery?.longitude) {
        distanceKm = haversineKm(lat, lng, brewery.latitude, brewery.longitude);
        // Filter by the challenge's own geo radius AND the requested radius
        const effectiveRadius = Math.min(c.geo_radius_km ?? 50, radiusKm);
        if (distanceKm > effectiveRadius) return null;
      }

      return {
        id: c.id,
        name: c.name,
        description: c.description,
        icon: c.icon,
        challenge_type: c.challenge_type,
        target_value: c.target_value,
        reward_description: c.reward_description,
        reward_xp: c.reward_xp,
        ends_at: c.ends_at,
        cover_image_url: c.cover_image_url,
        participant_count: participantCount,
        brewery: {
          id: brewery.id,
          name: brewery.name,
          city: brewery.city,
          state: brewery.state,
          cover_image_url: brewery.cover_image_url,
        },
        distance_km: distanceKm ? Math.round(distanceKm * 10) / 10 : null,
      };
    })
    .filter(Boolean);

  // Sort: by distance if available, otherwise by participant count
  if (!isNaN(lat) && !isNaN(lng)) {
    results.sort((a: any, b: any) => (a.distance_km ?? 999) - (b.distance_km ?? 999));
  } else {
    results.sort((a: any, b: any) => b.participant_count - a.participant_count);
  }

  // Apply final limit
  results = results.slice(0, limit);

  // Also fetch user's existing participations for these challenges
  const challengeIds = results.map((r: any) => r.id);
  const { data: myParticipations } = await (supabase
    .from("challenge_participants")
    .select("challenge_id, current_progress, completed_at")
    .eq("user_id", user.id)
    .in("challenge_id", challengeIds) as any);

  const participationMap = new Map(
    (myParticipations ?? []).map((p: any) => [p.challenge_id, p])
  );

  // Attach user's participation status
  const enriched = results.map((r: any) => ({
    ...r,
    my_participation: participationMap.get(r.id) ?? null,
  }));

  return NextResponse.json(enriched, {
    headers: { "Cache-Control": "private, max-age=60" },
  });
}

// Haversine distance in km
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
