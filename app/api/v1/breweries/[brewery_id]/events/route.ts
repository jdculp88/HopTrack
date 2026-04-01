// GET /api/v1/breweries/:brewery_id/events — Upcoming events
// Sprint 85 — The Pipeline (Avery)

import { createClient } from "@/lib/supabase/server";
import { apiResponse, apiError, apiOptions } from "@/lib/api-keys";
import { rateLimitResponse } from "@/lib/rate-limit";

export const OPTIONS = apiOptions;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const rl = rateLimitResponse(req, "v1:breweries:events", { limit: 20, windowMs: 60_000 });
  if (rl) return rl;

  const { brewery_id } = await params;
  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
  const perPage = Math.min(50, Math.max(1, parseInt(url.searchParams.get("per_page") ?? "20")));
  const offset = (page - 1) * perPage;
  const includePast = url.searchParams.get("include_past") === "true";

  const supabase = await createClient();

  // Verify brewery exists
  const { data: brewery } = await (supabase as any)
    .from("breweries")
    .select("id")
    .eq("id", brewery_id)
    .maybeSingle();

  if (!brewery) return apiError("Brewery not found", 404, "not_found");

  let query = (supabase as any)
    .from("brewery_events")
    .select("id, title, description, event_date, start_time, end_time, event_type, is_active, created_at", { count: "exact" })
    .eq("brewery_id", brewery_id)
    .eq("is_active", true);

  if (!includePast) {
    query = query.gte("event_date", new Date().toISOString().split("T")[0]);
  }

  const { data: events, count, error } = await query
    .order("event_date", { ascending: true })
    .range(offset, offset + perPage - 1);

  if (error) return apiError("Internal server error", 500, "db_error");

  return apiResponse(events ?? [], { total: count ?? 0, page, per_page: perPage });
}
