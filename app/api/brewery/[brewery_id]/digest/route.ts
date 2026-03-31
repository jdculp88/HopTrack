import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";

export interface DigestStats {
  visits: number;
  visitsTrend: number;
  uniqueVisitors: number;
  beersLogged: number;
  topBeer: string | null;
  loyaltyRedemptions: number;
  newFollowers: number;
}

/**
 * Calculate weekly digest stats for a brewery.
 * Shared by the GET endpoint (preview) and the cron job / email trigger.
 */
export async function calculateDigestStats(
  breweryId: string,
): Promise<{ breweryName: string; stats: DigestStats }> {
  const supabase = await createClient();

  const now = Date.now();
  const weekAgo = new Date(now - 7 * 86400000).toISOString();
  const twoWeeksAgo = new Date(now - 14 * 86400000).toISOString();

  // ── Sessions this week ──
  const { data: sessionsThisWeek } = await supabase
    .from("sessions")
    .select("id, user_id")
    .eq("brewery_id", breweryId)
    .eq("is_active", false)
    .gte("started_at", weekAgo) as any;

  // ── Sessions last week (for trend) ──
  const { data: sessionsLastWeek } = await supabase
    .from("sessions")
    .select("id")
    .eq("brewery_id", breweryId)
    .eq("is_active", false)
    .gte("started_at", twoWeeksAgo)
    .lt("started_at", weekAgo) as any;

  const visits = (sessionsThisWeek ?? []).length;
  const lastWeekVisits = (sessionsLastWeek ?? []).length;
  const visitsTrend =
    lastWeekVisits === 0
      ? visits > 0
        ? 100
        : 0
      : Math.round(((visits - lastWeekVisits) / lastWeekVisits) * 100);

  const uniqueVisitors = new Set(
    (sessionsThisWeek ?? []).map((s: any) => s.user_id),
  ).size;

  // ── Beer logs this week ──
  const { data: beerLogs } = await supabase
    .from("beer_logs")
    .select("beer_id, quantity, beer:beers(name)")
    .eq("brewery_id", breweryId)
    .gte("logged_at", weekAgo) as any;

  const beersLogged = (beerLogs ?? []).reduce(
    (sum: number, l: any) => sum + (l.quantity ?? 1),
    0,
  );

  // ── Top beer ──
  const beerCounts: Record<string, { name: string; count: number }> = {};
  for (const log of (beerLogs ?? []) as any[]) {
    const name = log.beer?.name;
    if (!name) continue;
    if (!beerCounts[name]) beerCounts[name] = { name, count: 0 };
    beerCounts[name].count += log.quantity ?? 1;
  }
  const topBeer =
    Object.values(beerCounts).sort((a, b) => b.count - a.count)[0]?.name ??
    null;

  // ── Loyalty redemptions this week ──
  // loyalty_redemptions links to loyalty_programs via program_id
  const { data: programs } = await supabase
    .from("loyalty_programs")
    .select("id")
    .eq("brewery_id", breweryId) as any;

  let loyaltyRedemptions = 0;
  if (programs?.length) {
    const programIds = (programs as any[]).map((p: any) => p.id);
    const { count } = await supabase
      .from("loyalty_redemptions")
      .select("id", { count: "exact", head: true })
      .in("program_id", programIds)
      .gte("redeemed_at", weekAgo) as any;
    loyaltyRedemptions = count ?? 0;
  }

  // ── New followers this week ──
  const { count: newFollowers } = await supabase
    .from("brewery_follows")
    .select("id", { count: "exact", head: true })
    .eq("brewery_id", breweryId)
    .gte("created_at", weekAgo) as any;

  // ── Brewery name ──
  const { data: brewery } = await supabase
    .from("breweries")
    .select("name")
    .eq("id", breweryId)
    .single() as any;

  return {
    breweryName: brewery?.name ?? "Your Brewery",
    stats: {
      visits,
      visitsTrend,
      uniqueVisitors,
      beersLogged,
      topBeer,
      loyaltyRedemptions,
      newFollowers: newFollowers ?? 0,
    },
  };
}

// GET /api/brewery/[brewery_id]/digest — preview weekly digest data
// Auth required: brewery owner or manager
export async function GET(
  req: Request,
  { params }: { params: Promise<{ brewery_id: string }> },
) {
  const limited = rateLimitResponse(req, "brewery-digest", {
    limit: 10,
    windowMs: 60 * 1000,
  });
  if (limited) return limited;

  const { brewery_id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify brewery admin
  const { data: account } = (await supabase
    .from("brewery_accounts")
    .select("role")
    .eq("user_id", user.id)
    .eq("brewery_id", brewery_id)
    .single()) as any;
  if (!account)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { breweryName, stats } = await calculateDigestStats(brewery_id);

  return NextResponse.json({
    brewery_name: breweryName,
    period: "Last 7 days",
    stats,
  });
}
