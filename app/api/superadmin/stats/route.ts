/**
 * Superadmin Platform Stats API — Sprint 143
 *
 * Returns enriched platform stats with sparklines, ratios, CRM segments,
 * style distribution, and interactive leaderboards.
 */

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/api-helpers";
import { apiSuccess, apiUnauthorized } from "@/lib/api-response";
import { fetchPlatformStats, type StatsTimeRange } from "@/lib/superadmin-stats";

export async function GET(request: Request) {
  const supabase = await createClient();
  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  // Superadmin check
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_superadmin")
    .eq("id", user.id)
    .single() as any;
  if (!profile?.is_superadmin) return apiUnauthorized();

  const url = new URL(request.url);
  const range = (url.searchParams.get("range") ?? "30d") as StatsTimeRange;

  const data = await fetchPlatformStats(supabase, range);

  // 30s private cache
  return apiSuccess(data, 200, {}, {
    "Cache-Control": "private, max-age=30",
  });
}
