import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";
import { apiSuccess, apiUnauthorized, apiBadRequest } from "@/lib/api-response";

// ─── GET /api/brand/slug-check?slug=xyz ─────────────────────────────────────
// Check if a brand slug is available.
export async function GET(request: NextRequest) {
  const rl = rateLimitResponse(request, "brand-slug-check", { limit: 20, windowMs: 60_000 });
  if (rl) return rl;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiUnauthorized();

  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug || slug.length < 2) {
    return apiBadRequest("Slug must be at least 2 characters", "slug");
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return apiBadRequest("Slug must be lowercase letters, numbers, and hyphens only", "slug");
  }

  const { data: existing } = await (supabase
    .from("brewery_brands")
    .select("id")
    .eq("slug", slug)
    .maybeSingle() as any);

  return apiSuccess({ available: !existing });
}
