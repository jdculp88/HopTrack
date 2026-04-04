// GET /api/v1/breweries/:brewery_id — Public brewery info
// Sprint 85 — The Pipeline (Avery)

import { createClient } from "@/lib/supabase/server";
import { apiResponse, apiError, apiOptions } from "@/lib/api-keys";
import { rateLimitResponse } from "@/lib/rate-limit";

export const OPTIONS = apiOptions;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const rl = rateLimitResponse(req, "v1:breweries:detail", { limit: 20, windowMs: 60_000 });
  if (rl) return rl;

  const { brewery_id } = await params;
  const supabase = await createClient();

  const { data: brewery, error } = await (supabase as any)
    .from("breweries")
    .select(`
      id, name, brewery_type, street, city, state, postal_code, country,
      phone, website_url, latitude, longitude, description,
      cover_image_url, verified, created_at,
      instagram_url, facebook_url, twitter_url, untappd_url
    `)
    .eq("id", brewery_id)
    .maybeSingle();

  if (error) return apiError("Internal server error", 500, "db_error");
  if (!brewery) return apiError("Brewery not found", 404, "not_found");

  return apiResponse(brewery, undefined, 200, 300);
}
