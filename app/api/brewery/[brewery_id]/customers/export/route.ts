import { createClient } from "@/lib/supabase/server";
import { computeSegment, getSegmentById } from "@/lib/crm";
import { requireAuth, requireBreweryAdmin } from "@/lib/api-helpers";
import { apiUnauthorized, apiForbidden } from "@/lib/api-response";

// GET /api/brewery/[brewery_id]/customers/export
// Streams CSV download of customer data for brewery owners
export async function GET(
  req: Request,
  { params }: { params: Promise<{ brewery_id: string }> },
) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  // Verify brewery admin access
  const account = await requireBreweryAdmin(supabase, user.id, brewery_id);
  if (!account) return apiForbidden();

  // Fetch all completed sessions with profile info
  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, user_id, started_at, ended_at, profile:profiles!user_id(display_name, username)")
    .eq("brewery_id", brewery_id)
    .eq("is_active", false)
    .order("started_at", { ascending: false }) as any;

  // Fetch beer_logs for favorite beer
  const { data: beerLogs } = await supabase
    .from("beer_logs")
    .select("user_id, quantity, beer:beers!beer_id(name)")
    .eq("brewery_id", brewery_id) as any;

  // Aggregate per user
  const userMap = new Map<string, {
    display_name: string;
    username: string;
    visits: number;
    total_time_minutes: number;
    last_visit: string;
    beerCounts: Map<string, number>;
  }>();

  for (const s of (sessions ?? []) as any[]) {
    const uid = s.user_id;
    const profile = s.profile;
    if (!uid || !profile) continue;

    const existing = userMap.get(uid);
    let duration = 0;
    if (s.started_at && s.ended_at) {
      duration = Math.max(0, (new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) / 60000);
    }

    if (existing) {
      existing.visits += 1;
      existing.total_time_minutes += duration;
      if (s.started_at > existing.last_visit) {
        existing.last_visit = s.started_at;
      }
    } else {
      userMap.set(uid, {
        display_name: profile.display_name ?? "Unknown",
        username: profile.username ?? "",
        visits: 1,
        total_time_minutes: duration,
        last_visit: s.started_at,
        beerCounts: new Map(),
      });
    }
  }

  // Aggregate beer counts
  for (const log of (beerLogs ?? []) as any[]) {
    const uid = log.user_id;
    const beerName = log.beer?.name;
    if (!uid || !beerName) continue;
    const entry = userMap.get(uid);
    if (entry) {
      entry.beerCounts.set(beerName, (entry.beerCounts.get(beerName) ?? 0) + (log.quantity ?? 1));
    }
  }

  // Build CSV rows
  const header = "Display Name,Username,Visits,Total Time (min),Last Visit,Favorite Beer,Tier";
  const rows = Array.from(userMap.values())
    .sort((a, b) => b.visits - a.visits)
    .map((u) => {
      // Find favorite beer
      let favBeer = "";
      let maxCount = 0;
      for (const [beer, count] of u.beerCounts) {
        if (count > maxCount) { maxCount = count; favBeer = beer; }
      }

      // Determine tier — uses CRM single source of truth
      const segment = computeSegment(u.visits);
      const tier = getSegmentById(segment).label;

      const lastVisit = new Date(u.last_visit).toISOString().split("T")[0];

      return [
        csvEscape(u.display_name),
        csvEscape(u.username),
        u.visits,
        Math.round(u.total_time_minutes),
        lastVisit,
        csvEscape(favBeer),
        tier,
      ].join(",");
    });

  const csv = [header, ...rows].join("\n");
  const date = new Date().toISOString().split("T")[0];

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="hoptrack-customers-${date}.csv"`,
    },
  });
}

function csvEscape(val: string): string {
  if (!val) return "";
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}
