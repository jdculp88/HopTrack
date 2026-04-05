// Percentiles — Sprint 162 (The Identity)
//
// Bucket-based percentile computation for scalable rarity scores.
// Architecture: pre-compute 101-value threshold arrays (P0..P100) per
// style/brewery/metric. Per-user percentile is O(log 100) bsearch lookup.
//
// Runs via daily cron job. Buckets are stored in the percentile_buckets
// tables; user snapshots store the resolved percentiles per user.

// ─── Constants ─────────────────────────────────────────────────────────────

export const BUCKET_COUNT = 101; // P0, P1, ..., P100
const MIN_SAMPLE_SIZE = 2;       // Need at least 2 users to compute percentiles meaningfully

// ─── Bucket computation ────────────────────────────────────────────────────

/**
 * Computes a 101-value threshold array from a set of user counts.
 * `thresholds[p]` is the count value at the p-th percentile.
 *
 * Example: if 1000 users have drunk 0-50 IPAs, `thresholds[95]` is
 * the IPA count that puts a user in the top 5% of IPA drinkers.
 *
 * @param counts - array of per-user counts (one value per user)
 * @returns 101-element threshold array (all zeros if no data)
 */
export function computeBuckets(counts: number[]): number[] {
  const thresholds = new Array(BUCKET_COUNT).fill(0) as number[];
  if (counts.length < MIN_SAMPLE_SIZE) return thresholds;

  const sorted = [...counts].sort((a, b) => a - b);
  const n = sorted.length;

  for (let p = 0; p < BUCKET_COUNT; p++) {
    // Map p ∈ [0, 100] → index ∈ [0, n-1]
    const idx = Math.min(n - 1, Math.floor((p / 100) * (n - 1)));
    thresholds[p] = sorted[idx] ?? 0;
  }

  return thresholds;
}

// ─── Percentile lookup ─────────────────────────────────────────────────────

/**
 * Looks up the percentile for a user's count against a precomputed bucket.
 * Returns 0-100. Higher values mean the user's count is higher than more
 * other users. Binary search — O(log 101) = constant time.
 *
 * @param userCount - the user's individual count
 * @param thresholds - 101-element bucket array from computeBuckets()
 * @returns 0-100 percentile (0 if thresholds empty/invalid)
 */
export function lookupPercentile(
  userCount: number,
  thresholds: number[],
): number {
  if (thresholds.length !== BUCKET_COUNT) return 0;

  // Find the highest p where thresholds[p] <= userCount.
  // This is a classic right-edge binary search.
  let lo = 0;
  let hi = BUCKET_COUNT - 1;
  let result = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (thresholds[mid] <= userCount) {
      result = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return result;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Builds buckets from a record of { userId: count } pairs.
 * Skips zero counts by default (you're not "in" the bucket if you have none).
 *
 * @param userCounts - map of user_id → count (e.g. beers of a style)
 * @param includeZero - whether to include users with zero count (default false)
 */
export function buildBucketsFromUserCounts(
  userCounts: Record<string, number>,
  includeZero = false,
): { thresholds: number[]; sampleSize: number } {
  const counts = Object.values(userCounts).filter(
    (c) => includeZero || c > 0,
  );
  return {
    thresholds: computeBuckets(counts),
    sampleSize: counts.length,
  };
}

/**
 * Formats a percentile as a "top X%" string, suitable for share text.
 * Clamps to minimum 1% (nobody wants to share "Top 0%").
 */
export function formatTopPercent(percentile: number): string {
  const topPct = Math.max(1, 100 - Math.floor(percentile));
  return `Top ${topPct}%`;
}

/**
 * Returns a human-readable "rarity tier" label based on percentile.
 * Used for non-numeric flexes.
 */
export function getRarityTier(
  percentile: number,
): "legend" | "elite" | "rare" | "notable" | "regular" {
  if (percentile >= 99) return "legend";
  if (percentile >= 95) return "elite";
  if (percentile >= 85) return "rare";
  if (percentile >= 70) return "notable";
  return "regular";
}
