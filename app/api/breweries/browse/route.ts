import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";

/**
 * GET /api/breweries/browse?offset=0&limit=200
 * Paginated browse endpoint for the Explore page "Load More" button.
 * Returns breweries with GPS coordinates, ordered by name.
 */
export async function GET(request: Request) {
  const limited = rateLimitResponse(request, "breweries-browse", { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);

  const offset = parseInt(searchParams.get("offset") ?? "0");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "200"), 500);

  const { data, error } = await supabase
    .from("breweries")
    .select("*")
    .not("latitude", "is", null)
    .order("name")
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { breweries: data ?? [] },
    { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=120" } }
  );
}
