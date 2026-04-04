/**
 * Trending scores refresh cron — Sprint 156 (The Triple Shot)
 *
 * Queries sessions + beer_logs + ratings from the last 24 hours,
 * groups by beer and brewery per city, computes time-decay scores,
 * and upserts into the trending_scores table.
 *
 * POST /api/cron/trending-refresh
 * Secured by CRON_SECRET header. Called by GitHub Actions hourly.
 */

import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { rateLimitResponse } from "@/lib/rate-limit";
import { computeScore } from "@/lib/trending";

export async function POST(req: Request) {
  // Rate limit: 1 call per 5 minutes (safety valve)
  const limited = rateLimitResponse(req, "cron-trending-refresh", {
    limit: 1,
    windowMs: 5 * 60 * 1000,
  });
  if (limited) return limited;

  // Auth: CRON_SECRET header
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[trending-refresh] CRON_SECRET not configured");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const nowISO = now.toISOString();

  try {
    // ── Fetch recent sessions with brewery context ──
    const { data: recentSessions } = await supabase
      .from("sessions")
      .select("id, user_id, brewery_id, started_at, brewery:breweries(city)")
      .eq("is_active", false)
      .gte("started_at", twentyFourHoursAgo)
      .lt("started_at", nowISO)
      .limit(50000) as any;

    // ── Fetch recent beer logs ──
    const { data: recentLogs } = await supabase
      .from("beer_logs")
      .select("id, user_id, beer_id, brewery_id, rating, created_at, brewery:breweries(city)")
      .gte("created_at", twentyFourHoursAgo)
      .lt("created_at", nowISO)
      .limit(50000) as any;

    const sessions = (recentSessions ?? []) as any[];
    const logs = (recentLogs ?? []) as any[];

    // ── Aggregate brewery scores ──
    interface AggBucket {
      checkins: number;
      ratings: number;
      users: Set<string>;
      city: string;
      lastActivity: Date;
    }

    const breweryBuckets = new Map<string, AggBucket>();
    for (const s of sessions) {
      if (!s.brewery_id) continue;
      const bucket = breweryBuckets.get(s.brewery_id) ?? {
        checkins: 0,
        ratings: 0,
        users: new Set<string>(),
        city: s.brewery?.city ?? "",
        lastActivity: new Date(s.started_at),
      };
      bucket.checkins++;
      bucket.users.add(s.user_id);
      const sessionTime = new Date(s.started_at);
      if (sessionTime > bucket.lastActivity) bucket.lastActivity = sessionTime;
      breweryBuckets.set(s.brewery_id, bucket);
    }

    // ── Aggregate beer scores ──
    const beerBuckets = new Map<string, AggBucket>();
    for (const log of logs) {
      if (!log.beer_id) continue;
      const bucket = beerBuckets.get(log.beer_id) ?? {
        checkins: 0,
        ratings: 0,
        users: new Set<string>(),
        city: log.brewery?.city ?? "",
        lastActivity: new Date(log.created_at),
      };
      bucket.checkins++;
      if (log.rating != null && log.rating > 0) bucket.ratings++;
      bucket.users.add(log.user_id);
      const logTime = new Date(log.created_at);
      if (logTime > bucket.lastActivity) bucket.lastActivity = logTime;
      beerBuckets.set(log.beer_id, bucket);
    }

    // ── Build upsert rows ──
    const upsertRows: any[] = [];

    for (const [breweryId, bucket] of breweryBuckets) {
      const hoursSince = (now.getTime() - bucket.lastActivity.getTime()) / (1000 * 60 * 60);
      const score = computeScore(bucket.checkins, bucket.ratings, bucket.users.size, hoursSince);
      if (score < 0.01) continue; // Skip near-zero scores

      upsertRows.push({
        content_type: "brewery",
        content_id: breweryId,
        score,
        checkin_count_24h: bucket.checkins,
        rating_count_24h: bucket.ratings,
        unique_users_24h: bucket.users.size,
        city: bucket.city,
        refreshed_at: nowISO,
      });
    }

    for (const [beerId, bucket] of beerBuckets) {
      const hoursSince = (now.getTime() - bucket.lastActivity.getTime()) / (1000 * 60 * 60);
      const score = computeScore(bucket.checkins, bucket.ratings, bucket.users.size, hoursSince);
      if (score < 0.01) continue;

      upsertRows.push({
        content_type: "beer",
        content_id: beerId,
        score,
        checkin_count_24h: bucket.checkins,
        rating_count_24h: bucket.ratings,
        unique_users_24h: bucket.users.size,
        city: bucket.city,
        refreshed_at: nowISO,
      });
    }

    // ── Upsert into trending_scores ──
    if (upsertRows.length > 0) {
      const { error } = await supabase
        .from("trending_scores")
        .upsert(upsertRows, { onConflict: "content_type,content_id" });

      if (error) {
        console.error("[trending-refresh] Upsert error:", error);
        return NextResponse.json(
          { error: "Failed to upsert trending scores", detail: error.message },
          { status: 500 }
        );
      }
    }

    // ── Prune stale entries (older than 48h) ──
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();
    await supabase
      .from("trending_scores")
      .delete()
      .lt("refreshed_at", fortyEightHoursAgo);

    return NextResponse.json({
      success: true,
      refreshed: upsertRows.length,
      beers: [...beerBuckets.keys()].length,
      breweries: [...breweryBuckets.keys()].length,
    });
  } catch (err) {
    console.error("[trending-refresh] Error:", err);
    return NextResponse.json({ error: "Trending refresh failed" }, { status: 500 });
  }
}
