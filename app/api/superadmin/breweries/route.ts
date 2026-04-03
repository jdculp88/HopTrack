/**
 * Superadmin Breweries List API — Sprint 143
 * GET /api/superadmin/breweries?page=1&sort=name&filter=all&q=search
 */

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/api-helpers";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/api-response";
import { fetchBreweryList } from "@/lib/superadmin-brewery-list";
import type { BreweryListSort, BreweryListFilter } from "@/lib/superadmin-brewery-list";

export async function GET(request: Request) {
  const supabase = await createClient();
  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  // Check superadmin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_superadmin")
    .eq("id", user.id)
    .single() as any;
  if (!profile?.is_superadmin) return apiUnauthorized();

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") ?? "1", 10);
  const sort = (url.searchParams.get("sort") ?? "created") as BreweryListSort;
  const filter = (url.searchParams.get("filter") ?? "all") as BreweryListFilter;
  const search = url.searchParams.get("q") ?? undefined;

  try {
    const result = await fetchBreweryList(supabase, { page, sort, filter, search });
    return apiSuccess(result, 200, {}, {
      "Cache-Control": "private, max-age=15",
    });
  } catch (err) {
    console.error("Breweries list error:", err);
    return apiError("Failed to fetch breweries", "INTERNAL_ERROR", 500);
  }
}
