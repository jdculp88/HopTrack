import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";

// GET /api/ads/feed?lat=X&lng=Y — return a single geo-eligible ad for the feed
export async function GET(req: NextRequest) {
  const rl = rateLimitResponse(req, "ads-feed", { limit: 30, windowMs: 60_000 });
  if (rl) return rl;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const lat = parseFloat(req.nextUrl.searchParams.get("lat") ?? "0");
  const lng = parseFloat(req.nextUrl.searchParams.get("lng") ?? "0");

  if (!lat || !lng) {
    return NextResponse.json({ ad: null });
  }

  // Fetch all active ads with their brewery location
  const now = new Date().toISOString();
  const { data: ads } = await (supabase
    .from("brewery_ads")
    .select("*, brewery:breweries(name, city, state, latitude, longitude, logo_url)")
    .eq("is_active", true)
    .lte("starts_at", now)
    .order("created_at", { ascending: false })
    .limit(50) as any);

  if (!ads || ads.length === 0) {
    return NextResponse.json({ ad: null });
  }

  // Filter by geo (haversine) and budget
  const eligible = ads.filter((ad: any) => {
    // Must have brewery with coordinates
    if (!ad.brewery?.latitude || !ad.brewery?.longitude) return false;
    // Check end date
    if (ad.ends_at && new Date(ad.ends_at) < new Date()) return false;
    // Check budget (0 = unlimited)
    if (ad.budget_cents > 0 && ad.spent_cents >= ad.budget_cents) return false;

    // Haversine distance
    const R = 6371;
    const dLat = (ad.brewery.latitude - lat) * Math.PI / 180;
    const dLng = (ad.brewery.longitude - lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat * Math.PI / 180) * Math.cos(ad.brewery.latitude * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2;
    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return dist <= ad.radius_km;
  });

  if (eligible.length === 0) {
    return NextResponse.json({ ad: null });
  }

  // Pick a random eligible ad (simple rotation)
  const ad = eligible[Math.floor(Math.random() * eligible.length)];

  return NextResponse.json({
    ad: {
      id: ad.id,
      brewery_id: ad.brewery_id,
      title: ad.title,
      body: ad.body,
      image_url: ad.image_url,
      cta_url: ad.cta_url,
      cta_label: ad.cta_label,
      brewery: {
        name: ad.brewery?.name,
        city: ad.brewery?.city,
        state: ad.brewery?.state,
        logo_url: ad.brewery?.logo_url,
      },
    },
  });
}
