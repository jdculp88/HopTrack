import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";
import { apiSuccess, apiUnauthorized, apiBadRequest } from "@/lib/api-response";
import { haversineDistance, formatDistance } from "@/lib/geo";

// ─── GET /api/brand/[brand_id]/locations/nearby?lat=X&lng=Y ────────────────
// Returns brand locations sorted by distance from the given coordinates.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brand_id: string }> }
) {
  const { brand_id } = await params;
  const rl = rateLimitResponse(request, "brand-locations-nearby", { limit: 30, windowMs: 60_000 });
  if (rl) return rl;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiUnauthorized();

  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 50);

  if (isNaN(lat) || isNaN(lng)) {
    return apiBadRequest("lat and lng query parameters are required");
  }

  const { data: locations } = await (supabase
    .from("breweries")
    .select("id, name, city, state, cover_image_url, latitude, longitude, description")
    .eq("brand_id", brand_id)
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .order("name") as any);

  const withDistance = (locations ?? [])
    .map((loc: any) => {
      const distance = haversineDistance(lat, lng, loc.latitude, loc.longitude);
      return {
        ...loc,
        distance_miles: Math.round(distance * 100) / 100,
        distance_display: formatDistance(distance),
      };
    })
    .sort((a: any, b: any) => a.distance_miles - b.distance_miles)
    .slice(0, limit);

  return apiSuccess(withDistance);
}
