/**
 * Stats Snapshot cron — Sprint 162 (The Identity)
 *
 * Pre-computes percentile rankings for all users. Runs daily.
 * Architecture: bucket-based percentiles (101 thresholds per style/brewery/metric).
 * User lookup is O(log 100) bsearch — scales to 100k+ users.
 *
 * POST /api/cron/stats-snapshot
 * Secured by CRON_SECRET header. Called by GitHub Actions daily at ~4am PT.
 */

import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { rateLimitResponse } from "@/lib/rate-limit";
import { buildBucketsFromUserCounts, lookupPercentile } from "@/lib/percentiles";

const MAX_LOGS = 50_000;

type LogRow = {
  user_id: string;
  beer_id: string | null;
  brewery_id: string | null;
  beer: { style: string | null } | null;
};

export async function POST(req: Request) {
  const limited = rateLimitResponse(req, "cron-stats-snapshot", {
    limit: 1,
    windowMs: 10 * 60 * 1000,
  });
  if (limited) return limited;

  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[stats-snapshot] CRON_SECRET not configured");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const now = new Date().toISOString();

  try {
    // ─── Fetch all beer_logs with beer style ────────────────────────────
    const { data: logs, error: logsError } = (await supabase
      .from("beer_logs")
      .select("user_id, beer_id, brewery_id, beer:beers(style)")
      .limit(MAX_LOGS)) as unknown as { data: LogRow[] | null; error: Error | null };

    if (logsError) {
      console.error("[stats-snapshot] Logs fetch error:", logsError);
      return NextResponse.json({ error: "Logs fetch failed" }, { status: 500 });
    }

    const rows = logs ?? [];

    // ─── Aggregate per-user data ────────────────────────────────────────
    // styleUserCounts[style][userId] = count
    const styleUserCounts = new Map<string, Map<string, number>>();
    // breweryUserCounts[breweryId][userId] = count
    const breweryUserCounts = new Map<string, Map<string, number>>();
    // userTotals[userId] = { totalBeers, uniqueBeers (set), uniqueStyles (set), styleCounts, breweryCounts }
    type UserAgg = {
      totalBeers: number;
      uniqueBeers: Set<string>;
      uniqueStyles: Set<string>;
      styleCounts: Map<string, number>;
      breweryCounts: Map<string, number>;
    };
    const userAgg = new Map<string, UserAgg>();

    for (const log of rows) {
      if (!log.user_id) continue;

      let agg = userAgg.get(log.user_id);
      if (!agg) {
        agg = {
          totalBeers: 0,
          uniqueBeers: new Set(),
          uniqueStyles: new Set(),
          styleCounts: new Map(),
          breweryCounts: new Map(),
        };
        userAgg.set(log.user_id, agg);
      }
      agg.totalBeers += 1;
      if (log.beer_id) agg.uniqueBeers.add(log.beer_id);

      const style = log.beer?.style ?? null;
      if (style) {
        agg.uniqueStyles.add(style);
        agg.styleCounts.set(style, (agg.styleCounts.get(style) ?? 0) + 1);

        let styleMap = styleUserCounts.get(style);
        if (!styleMap) {
          styleMap = new Map();
          styleUserCounts.set(style, styleMap);
        }
        styleMap.set(log.user_id, (styleMap.get(log.user_id) ?? 0) + 1);
      }

      if (log.brewery_id) {
        agg.breweryCounts.set(
          log.brewery_id,
          (agg.breweryCounts.get(log.brewery_id) ?? 0) + 1,
        );

        let brewMap = breweryUserCounts.get(log.brewery_id);
        if (!brewMap) {
          brewMap = new Map();
          breweryUserCounts.set(log.brewery_id, brewMap);
        }
        brewMap.set(log.user_id, (brewMap.get(log.user_id) ?? 0) + 1);
      }
    }

    // ─── Build style_percentile_buckets rows ────────────────────────────
    const styleBucketRows: Array<{
      style: string;
      thresholds: number[];
      sample_size: number;
      computed_at: string;
    }> = [];
    const styleBuckets = new Map<string, number[]>();
    for (const [style, userCounts] of styleUserCounts) {
      const userCountsObj: Record<string, number> = {};
      userCounts.forEach((v, k) => {
        userCountsObj[k] = v;
      });
      const { thresholds, sampleSize } = buildBucketsFromUserCounts(userCountsObj);
      styleBuckets.set(style, thresholds);
      styleBucketRows.push({
        style,
        thresholds,
        sample_size: sampleSize,
        computed_at: now,
      });
    }

    // ─── Build brewery_percentile_buckets rows ──────────────────────────
    const breweryBucketRows: Array<{
      brewery_id: string;
      thresholds: number[];
      sample_size: number;
      computed_at: string;
    }> = [];
    const breweryBuckets = new Map<string, number[]>();
    for (const [breweryId, userCounts] of breweryUserCounts) {
      const userCountsObj: Record<string, number> = {};
      userCounts.forEach((v, k) => {
        userCountsObj[k] = v;
      });
      const { thresholds, sampleSize } = buildBucketsFromUserCounts(userCountsObj);
      breweryBuckets.set(breweryId, thresholds);
      breweryBucketRows.push({
        brewery_id: breweryId,
        thresholds,
        sample_size: sampleSize,
        computed_at: now,
      });
    }

    // ─── Build overall_percentile_buckets rows ──────────────────────────
    const totalBeersCounts: Record<string, number> = {};
    const uniqueBeersCounts: Record<string, number> = {};
    const uniqueStylesCounts: Record<string, number> = {};
    userAgg.forEach((agg, userId) => {
      totalBeersCounts[userId] = agg.totalBeers;
      uniqueBeersCounts[userId] = agg.uniqueBeers.size;
      uniqueStylesCounts[userId] = agg.uniqueStyles.size;
    });

    const overallBuckets = {
      beers: buildBucketsFromUserCounts(totalBeersCounts),
      unique_beers: buildBucketsFromUserCounts(uniqueBeersCounts),
      unique_styles: buildBucketsFromUserCounts(uniqueStylesCounts),
    };

    const overallBucketRows = [
      {
        metric: "beers",
        thresholds: overallBuckets.beers.thresholds,
        sample_size: overallBuckets.beers.sampleSize,
        computed_at: now,
      },
      {
        metric: "unique_beers",
        thresholds: overallBuckets.unique_beers.thresholds,
        sample_size: overallBuckets.unique_beers.sampleSize,
        computed_at: now,
      },
      {
        metric: "unique_styles",
        thresholds: overallBuckets.unique_styles.thresholds,
        sample_size: overallBuckets.unique_styles.sampleSize,
        computed_at: now,
      },
    ];

    // ─── Build user_stats_snapshots rows ────────────────────────────────
    const snapshotRows: Array<{
      user_id: string;
      total_beers: number;
      total_beers_percentile: number | null;
      unique_beers: number;
      unique_beers_percentile: number | null;
      unique_styles: number;
      unique_styles_percentile: number | null;
      top_style: string | null;
      top_style_count: number;
      top_style_percentile: number | null;
      top_brewery_id: string | null;
      top_brewery_visits: number;
      top_brewery_percentile: number | null;
      style_breakdown: Array<{ style: string; count: number; percentile: number }>;
      computed_at: string;
    }> = [];

    userAgg.forEach((agg, userId) => {
      // Find top style by count
      let topStyle: string | null = null;
      let topStyleCount = 0;
      agg.styleCounts.forEach((count, style) => {
        if (count > topStyleCount) {
          topStyle = style;
          topStyleCount = count;
        }
      });

      // Find top brewery by visits
      let topBrewery: string | null = null;
      let topBreweryVisits = 0;
      agg.breweryCounts.forEach((count, breweryId) => {
        if (count > topBreweryVisits) {
          topBrewery = breweryId;
          topBreweryVisits = count;
        }
      });

      // Lookup percentiles
      const topStylePercentile =
        topStyle && styleBuckets.has(topStyle)
          ? lookupPercentile(topStyleCount, styleBuckets.get(topStyle)!)
          : null;
      const topBreweryPercentile =
        topBrewery && breweryBuckets.has(topBrewery)
          ? lookupPercentile(topBreweryVisits, breweryBuckets.get(topBrewery)!)
          : null;

      // Build style breakdown with per-style percentiles
      const styleBreakdown: Array<{
        style: string;
        count: number;
        percentile: number;
      }> = [];
      agg.styleCounts.forEach((count, style) => {
        const pct = styleBuckets.has(style)
          ? lookupPercentile(count, styleBuckets.get(style)!)
          : 0;
        styleBreakdown.push({ style, count, percentile: pct });
      });
      styleBreakdown.sort((a, b) => b.count - a.count);

      snapshotRows.push({
        user_id: userId,
        total_beers: agg.totalBeers,
        total_beers_percentile: lookupPercentile(
          agg.totalBeers,
          overallBuckets.beers.thresholds,
        ),
        unique_beers: agg.uniqueBeers.size,
        unique_beers_percentile: lookupPercentile(
          agg.uniqueBeers.size,
          overallBuckets.unique_beers.thresholds,
        ),
        unique_styles: agg.uniqueStyles.size,
        unique_styles_percentile: lookupPercentile(
          agg.uniqueStyles.size,
          overallBuckets.unique_styles.thresholds,
        ),
        top_style: topStyle,
        top_style_count: topStyleCount,
        top_style_percentile: topStylePercentile,
        top_brewery_id: topBrewery,
        top_brewery_visits: topBreweryVisits,
        top_brewery_percentile: topBreweryPercentile,
        style_breakdown: styleBreakdown,
        computed_at: now,
      });
    });

    // ─── Upsert all ──────────────────────────────────────────────────────
    const upsertOps: Array<Promise<{ error: { message: string } | null }>> = [];

    if (styleBucketRows.length > 0) {
      upsertOps.push(
        supabase
          .from("style_percentile_buckets")
          .upsert(styleBucketRows, { onConflict: "style" }) as unknown as Promise<{ error: { message: string } | null }>,
      );
    }
    if (breweryBucketRows.length > 0) {
      upsertOps.push(
        supabase
          .from("brewery_percentile_buckets")
          .upsert(breweryBucketRows, { onConflict: "brewery_id" }) as unknown as Promise<{ error: { message: string } | null }>,
      );
    }
    upsertOps.push(
      supabase
        .from("overall_percentile_buckets")
        .upsert(overallBucketRows, { onConflict: "metric" }) as unknown as Promise<{ error: { message: string } | null }>,
    );
    if (snapshotRows.length > 0) {
      upsertOps.push(
        supabase
          .from("user_stats_snapshots")
          .upsert(snapshotRows, { onConflict: "user_id" }) as unknown as Promise<{ error: { message: string } | null }>,
      );
    }

    const results = await Promise.all(upsertOps);
    const errors = results.filter((r) => r.error).map((r) => r.error!.message);

    if (errors.length > 0) {
      console.error("[stats-snapshot] Upsert errors:", errors);
      return NextResponse.json(
        { error: "Upsert failures", detail: errors },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      users: snapshotRows.length,
      styles: styleBucketRows.length,
      breweries: breweryBucketRows.length,
      logs_processed: rows.length,
    });
  } catch (err) {
    console.error("[stats-snapshot] Error:", err);
    return NextResponse.json({ error: "Snapshot failed" }, { status: 500 });
  }
}
