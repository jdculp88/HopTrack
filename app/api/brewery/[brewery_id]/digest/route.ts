import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";

// GET /api/brewery/[brewery_id]/digest — generate weekly digest data
// This endpoint returns the digest payload; email sending will be wired
// when Resend integration lands. Can also be used to render in-app.
export async function GET(
  req: Request,
  { params }: { params: Promise<{ brewery_id: string }> },
) {
  const limited = rateLimitResponse(req, "brewery-digest", { limit: 10, windowMs: 60 * 1000 });
  if (limited) return limited;

  const { brewery_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify admin
  const { data: account } = await supabase
    .from("brewery_accounts").select("role")
    .eq("user_id", user.id).eq("brewery_id", brewery_id).single() as any;
  if (!account) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  // Sessions this week
  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, user_id, started_at")
    .eq("brewery_id", brewery_id)
    .eq("is_active", false)
    .gte("started_at", weekAgo);

  const visitCount = (sessions ?? []).length;
  const uniqueVisitors = new Set((sessions ?? []).map((s: any) => s.user_id)).size;

  // Beer logs this week
  const { data: beerLogs } = await supabase
    .from("beer_logs")
    .select("beer_id, quantity, beer:beers(name)")
    .eq("brewery_id", brewery_id)
    .gte("logged_at", weekAgo);

  // Top beer
  const beerCounts: Record<string, { name: string; count: number }> = {};
  for (const log of (beerLogs ?? []) as any[]) {
    const name = log.beer?.name;
    if (!name) continue;
    if (!beerCounts[name]) beerCounts[name] = { name, count: 0 };
    beerCounts[name].count += log.quantity ?? 1;
  }
  const topBeer = Object.values(beerCounts).sort((a, b) => b.count - a.count)[0] ?? null;

  // New followers this week
  const { count: newFollowers } = await supabase
    .from("brewery_follows")
    .select("id", { count: "exact", head: true })
    .eq("brewery_id", brewery_id)
    .gte("created_at", weekAgo);

  // Brewery name
  const { data: brewery } = await supabase
    .from("breweries")
    .select("name")
    .eq("id", brewery_id)
    .single();

  return NextResponse.json({
    brewery_name: brewery?.name ?? "Your Brewery",
    period: "Last 7 days",
    visit_count: visitCount,
    unique_visitors: uniqueVisitors,
    total_pours: (beerLogs ?? []).reduce((sum: number, l: any) => sum + (l.quantity ?? 1), 0),
    top_beer: topBeer,
    new_followers: newFollowers ?? 0,
  });
}
