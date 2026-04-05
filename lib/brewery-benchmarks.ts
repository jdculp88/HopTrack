/**
 * Peer Benchmarking — anonymous comparison against similar breweries
 * Sprint 159 — The Accelerator
 */

import { createServiceClient } from "@/lib/supabase/service";

// ── Types ───────────────────────────────────────────────────────────────────

export interface BenchmarkMetric {
  yours: number | null;
  peerAvg: number | null;
  pctDiff: number | null; // ((yours - peerAvg) / peerAvg) * 100
}

export interface PeerBenchmarks {
  peerCount: number;
  peerScope: string; // "city" or "state"
  peerLocation: string; // city name or state abbreviation
  metrics: {
    avgVisitDuration: BenchmarkMetric;
    beersPerVisit: BenchmarkMetric;
    retentionRate: BenchmarkMetric;
    avgRating: BenchmarkMetric;
    followerCount: BenchmarkMetric;
  };
  insufficient: boolean; // true if < 5 peers
}

// ── Pure Helpers (testable) ─────────────────────────────────────────────────

export function calculatePctDiff(yours: number | null, peerAvg: number | null): number | null {
  if (yours === null || peerAvg === null || peerAvg === 0) return null;
  return Math.round(((yours - peerAvg) / peerAvg) * 100);
}

export function buildMetric(yours: number | null, peerAvg: number | null): BenchmarkMetric {
  return {
    yours,
    peerAvg: peerAvg !== null ? Math.round(peerAvg * 10) / 10 : null,
    pctDiff: calculatePctDiff(yours, peerAvg),
  };
}

// ── Main Function ───────────────────────────────────────────────────────────

export async function calculatePeerBenchmarks(breweryId: string): Promise<PeerBenchmarks> {
  const service = createServiceClient();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
  const sixtyDaysAgo = new Date(Date.now() - 60 * 86400000).toISOString();

  const emptyResult: PeerBenchmarks = {
    peerCount: 0,
    peerScope: "city",
    peerLocation: "",
    metrics: {
      avgVisitDuration: buildMetric(null, null),
      beersPerVisit: buildMetric(null, null),
      retentionRate: buildMetric(null, null),
      avgRating: buildMetric(null, null),
      followerCount: buildMetric(null, null),
    },
    insufficient: true,
  };

  // Get this brewery's location
  const { data: brewery } = await (service as any)
    .from("breweries")
    .select("city, state")
    .eq("id", breweryId)
    .single();

  if (!brewery?.state) return emptyResult;

  // Find peers: try city first, fall back to state
  let peerScope: "city" | "state" = "city";
  let peerLocation = brewery.city ?? "";
  let peerQuery = (service as any)
    .from("breweries")
    .select("id")
    .eq("state", brewery.state)
    .neq("id", breweryId)
    .limit(200);

  if (brewery.city) {
    const { data: cityPeers } = await (service as any)
      .from("breweries")
      .select("id")
      .eq("city", brewery.city)
      .eq("state", brewery.state)
      .neq("id", breweryId)
      .limit(200);

    if (cityPeers && cityPeers.length >= 5) {
      peerQuery = null; // skip state query
      var peerIds = cityPeers.map((p: any) => p.id);
    } else {
      peerScope = "state";
      peerLocation = brewery.state;
    }
  } else {
    peerScope = "state";
    peerLocation = brewery.state;
  }

  if (!peerIds!) {
    const { data: statePeers } = await peerQuery;
    if (!statePeers || statePeers.length < 5) return { ...emptyResult, peerLocation };
    peerIds = statePeers.map((p: any) => p.id);
  }

  const peerCount = peerIds.length;
  const allIds = [breweryId, ...peerIds];

  // Fetch data for all breweries (self + peers) in parallel
  const [
    { data: allSessions },
    { data: allBeerLogs },
    { data: allRatings },
    { data: allFollows },
    { data: priorSessions },
  ] = await Promise.all([
    (service as any).from("sessions").select("brewery_id, user_id, started_at, ended_at").eq("is_active", false).gte("started_at", thirtyDaysAgo).in("brewery_id", allIds).limit(50000),
    (service as any).from("beer_logs").select("session_id, user_id, beer:beers!inner(brewery_id)").gte("logged_at", thirtyDaysAgo).limit(50000),
    (service as any).from("beer_logs").select("rating, beer:beers!inner(brewery_id)").gt("rating", 0).gte("logged_at", thirtyDaysAgo).limit(50000),
    (service as any).from("brewery_follows").select("brewery_id").in("brewery_id", allIds).limit(50000),
    (service as any).from("sessions").select("brewery_id, user_id").eq("is_active", false).gte("started_at", sixtyDaysAgo).lt("started_at", thirtyDaysAgo).in("brewery_id", allIds).limit(50000),
  ]);

  // Helper: compute metrics for a single brewery
  function computeMetrics(bid: string) {
    const sessions = (allSessions ?? []).filter((s: any) => s.brewery_id === bid);
    const beerLogs = (allBeerLogs ?? []).filter((bl: any) => bl.beer?.brewery_id === bid);
    const ratings = (allRatings ?? []).filter((r: any) => r.beer?.brewery_id === bid);
    const follows = (allFollows ?? []).filter((f: any) => f.brewery_id === bid);
    const prior = (priorSessions ?? []).filter((s: any) => s.brewery_id === bid);

    // Avg visit duration (minutes)
    let avgDuration: number | null = null;
    const withDuration = sessions.filter((s: any) => s.ended_at);
    if (withDuration.length > 0) {
      const totalMin = withDuration.reduce((sum: number, s: any) => {
        return sum + (new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) / 60000;
      }, 0);
      avgDuration = Math.round(totalMin / withDuration.length);
    }

    // Beers per visit
    const beersPerVisit = sessions.length > 0 ? Math.round((beerLogs.length / sessions.length) * 10) / 10 : null;

    // Retention rate
    const currentUsers = new Set(sessions.map((s: any) => s.user_id));
    const priorUsers = new Set(prior.map((s: any) => s.user_id));
    let retentionRate: number | null = null;
    if (priorUsers.size > 0) {
      const retained = [...priorUsers].filter(u => currentUsers.has(u)).length;
      retentionRate = Math.round((retained / priorUsers.size) * 100);
    }

    // Avg rating
    const avgRating = ratings.length > 0
      ? Math.round((ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length) * 10) / 10
      : null;

    // Follower count
    const followerCount = follows.length;

    return { avgDuration, beersPerVisit, retentionRate, avgRating, followerCount };
  }

  // Compute for self
  const mine = computeMetrics(breweryId);

  // Compute averages across peers
  const peerMetrics = peerIds.map((pid: string) => computeMetrics(pid));

  function peerAverage(getter: (m: ReturnType<typeof computeMetrics>) => number | null): number | null {
    const values = peerMetrics.map(getter).filter((v: number | null): v is number => v !== null);
    if (values.length === 0) return null;
    return values.reduce((a: number, b: number) => a + b, 0) / values.length;
  }

  return {
    peerCount,
    peerScope,
    peerLocation,
    metrics: {
      avgVisitDuration: buildMetric(mine.avgDuration, peerAverage(m => m.avgDuration)),
      beersPerVisit: buildMetric(mine.beersPerVisit, peerAverage(m => m.beersPerVisit)),
      retentionRate: buildMetric(mine.retentionRate, peerAverage(m => m.retentionRate)),
      avgRating: buildMetric(mine.avgRating, peerAverage(m => m.avgRating)),
      followerCount: buildMetric(mine.followerCount, peerAverage(m => m.followerCount)),
    },
    insufficient: false,
  };
}
