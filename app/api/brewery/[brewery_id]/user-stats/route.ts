import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/api-helpers";
import { apiUnauthorized, apiSuccess, apiServerError } from "@/lib/api-response";

// GET /api/brewery/[brewery_id]/user-stats?userId=X
// Returns aggregated stats for a user at a specific brewery
export async function GET(
  req: Request,
  { params }: { params: Promise<{ brewery_id: string }> },
) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  const url = new URL(req.url);
  const userId = url.searchParams.get("userId") || user.id;

  // Fetch all sessions at this brewery for this user
  const { data: sessions, error: sessionsError } = await supabase
    .from("sessions")
    .select("id, started_at, ended_at")
    .eq("brewery_id", brewery_id)
    .eq("user_id", userId)
    .eq("is_active", false)
    .order("started_at", { ascending: false })
    .limit(50000);

  if (sessionsError) {
    return apiServerError(sessionsError.message);
  }

  const allSessions = sessions ?? [];
  const visitCount = allSessions.length;

  // Calculate total time spent (sum of durations in minutes)
  let totalTimeMinutes = 0;
  for (const s of allSessions) {
    if (s.started_at && s.ended_at) {
      const start = new Date(s.started_at).getTime();
      const end = new Date(s.ended_at).getTime();
      totalTimeMinutes += Math.max(0, (end - start) / 60000);
    }
  }

  // Fetch all beer_logs at this brewery for this user to find most-ordered beer
  const { data: beerLogs, error: logsError } = await supabase
    .from("beer_logs")
    .select("beer_id, quantity, beer:beers!beer_id(name)")
    .eq("brewery_id", brewery_id)
    .eq("user_id", userId)
    .limit(50000);

  if (logsError) {
    return apiServerError(logsError.message);
  }

  const allLogs = beerLogs ?? [];

  // Count beers by beer_id
  const beerCounts: Record<string, { name: string; count: number }> = {};
  for (const log of allLogs) {
    const beerId = log.beer_id;
    if (!beerId) continue;
    const beerName = (log.beer as any)?.name || "Unknown";
    if (!beerCounts[beerId]) {
      beerCounts[beerId] = { name: beerName, count: 0 };
    }
    beerCounts[beerId].count += log.quantity ?? 1;
  }

  // Find most ordered beer
  let mostOrderedBeer: { name: string; count: number } | null = null;
  for (const entry of Object.values(beerCounts)) {
    if (!mostOrderedBeer || entry.count > mostOrderedBeer.count) {
      mostOrderedBeer = entry;
    }
  }

  // Visitor rank
  const { data: allVisits } = await supabase
    .from("brewery_visits")
    .select("user_id, total_visits")
    .eq("brewery_id", brewery_id)
    .order("total_visits", { ascending: false })
    .limit(50000);

  let visitorRank = 0;
  if (allVisits) {
    const idx = (allVisits as any[]).findIndex((v: any) => v.user_id === userId);
    visitorRank = idx >= 0 ? idx + 1 : 0;
  }

  // Format total time
  const hours = Math.floor(totalTimeMinutes / 60);
  const mins = Math.round(totalTimeMinutes % 60);
  const totalTimeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return apiSuccess({
    visit_count: visitCount,
    total_time_minutes: Math.round(totalTimeMinutes),
    total_time_formatted: totalTimeStr,
    most_ordered_beer: mostOrderedBeer,
    total_beers_logged: allLogs.reduce((sum: number, l: any) => sum + (l.quantity ?? 1), 0),
    visitor_rank: visitorRank,
    total_visitors: allVisits?.length ?? 0,
  });
}
