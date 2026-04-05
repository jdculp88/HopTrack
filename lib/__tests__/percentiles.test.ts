// Percentiles tests — Sprint 162 (The Identity)
import { describe, it, expect } from "vitest";
import {
  computeBuckets,
  lookupPercentile,
  buildBucketsFromUserCounts,
  formatTopPercent,
  getRarityTier,
  BUCKET_COUNT,
} from "@/lib/percentiles";

// ─── computeBuckets ───────────────────────────────────────────────────────

describe("computeBuckets", () => {
  it("returns 101 values", () => {
    const buckets = computeBuckets([1, 2, 3, 4, 5]);
    expect(buckets).toHaveLength(BUCKET_COUNT);
  });

  it("returns all zeros for empty input", () => {
    const buckets = computeBuckets([]);
    expect(buckets.every((v) => v === 0)).toBe(true);
  });

  it("returns all zeros for single user (below min sample size)", () => {
    const buckets = computeBuckets([10]);
    expect(buckets.every((v) => v === 0)).toBe(true);
  });

  it("correctly computes percentiles for 10 users", () => {
    // 10 users with counts 1, 2, 3, ..., 10
    const buckets = computeBuckets([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(buckets[0]).toBe(1);    // P0 = min
    expect(buckets[100]).toBe(10); // P100 = max
  });

  it("handles unsorted input", () => {
    const buckets = computeBuckets([5, 1, 3, 9, 7, 2, 8, 4, 10, 6]);
    expect(buckets[0]).toBe(1);
    expect(buckets[100]).toBe(10);
  });

  it("handles duplicate values", () => {
    const buckets = computeBuckets([5, 5, 5, 5, 5, 5, 5, 5, 5, 5]);
    expect(buckets[0]).toBe(5);
    expect(buckets[50]).toBe(5);
    expect(buckets[100]).toBe(5);
  });

  it("P50 is median", () => {
    const buckets = computeBuckets([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    // With n=10, floor(0.5 * 9) = 4, sorted[4] = 5
    expect(buckets[50]).toBe(5);
  });
});

// ─── lookupPercentile ─────────────────────────────────────────────────────

describe("lookupPercentile", () => {
  it("returns 0 for invalid threshold array", () => {
    expect(lookupPercentile(5, [])).toBe(0);
    expect(lookupPercentile(5, [1, 2, 3])).toBe(0);
  });

  it("user below all thresholds returns 0", () => {
    const buckets = computeBuckets([10, 20, 30, 40, 50]);
    expect(lookupPercentile(0, buckets)).toBe(0);
  });

  it("user above all thresholds returns 100", () => {
    const buckets = computeBuckets([10, 20, 30, 40, 50]);
    expect(lookupPercentile(1000, buckets)).toBe(100);
  });

  it("user at median returns ~50", () => {
    const buckets = computeBuckets([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    // User with count 5 should be around p50
    const pct = lookupPercentile(5, buckets);
    expect(pct).toBeGreaterThanOrEqual(40);
    expect(pct).toBeLessThanOrEqual(60);
  });

  it("top user returns 100", () => {
    const buckets = computeBuckets([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(lookupPercentile(10, buckets)).toBe(100);
  });

  it("is monotonic — higher counts yield higher percentiles", () => {
    const buckets = computeBuckets([1, 3, 5, 7, 9, 11, 13, 15, 17, 19]);
    let prev = 0;
    for (let count = 0; count <= 20; count++) {
      const pct = lookupPercentile(count, buckets);
      expect(pct).toBeGreaterThanOrEqual(prev);
      prev = pct;
    }
  });
});

// ─── buildBucketsFromUserCounts ───────────────────────────────────────────

describe("buildBucketsFromUserCounts", () => {
  it("filters zero counts by default", () => {
    const result = buildBucketsFromUserCounts({
      u1: 5,
      u2: 0,
      u3: 10,
      u4: 0,
      u5: 3,
    });
    expect(result.sampleSize).toBe(3);
  });

  it("includes zero counts when requested", () => {
    const result = buildBucketsFromUserCounts(
      { u1: 0, u2: 0, u3: 5 },
      true,
    );
    expect(result.sampleSize).toBe(3);
  });

  it("returns empty buckets for sparse data", () => {
    const result = buildBucketsFromUserCounts({ u1: 5 });
    expect(result.sampleSize).toBe(1);
    expect(result.thresholds.every((v) => v === 0)).toBe(true);
  });
});

// ─── formatTopPercent ─────────────────────────────────────────────────────

describe("formatTopPercent", () => {
  it("converts percentile to top % string", () => {
    expect(formatTopPercent(97)).toBe("Top 3%");
    expect(formatTopPercent(50)).toBe("Top 50%");
  });

  it("clamps minimum to 1%", () => {
    expect(formatTopPercent(100)).toBe("Top 1%");
    expect(formatTopPercent(99.9)).toBe("Top 1%");
  });
});

// ─── getRarityTier ────────────────────────────────────────────────────────

describe("getRarityTier", () => {
  it("99+ = legend", () => {
    expect(getRarityTier(99)).toBe("legend");
    expect(getRarityTier(100)).toBe("legend");
  });

  it("95-98 = elite", () => {
    expect(getRarityTier(95)).toBe("elite");
    expect(getRarityTier(98)).toBe("elite");
  });

  it("85-94 = rare", () => {
    expect(getRarityTier(85)).toBe("rare");
    expect(getRarityTier(94)).toBe("rare");
  });

  it("70-84 = notable", () => {
    expect(getRarityTier(70)).toBe("notable");
    expect(getRarityTier(84)).toBe("notable");
  });

  it("<70 = regular", () => {
    expect(getRarityTier(50)).toBe("regular");
    expect(getRarityTier(0)).toBe("regular");
  });
});

// ─── Integration: end-to-end workflow ─────────────────────────────────────

describe("End-to-end percentile workflow", () => {
  it("correctly ranks users by activity", () => {
    // Simulate 100 users with Pareto-ish distribution
    const userCounts: Record<string, number> = {};
    for (let i = 1; i <= 100; i++) {
      userCounts[`u${i}`] = i; // u1=1, u2=2, ..., u100=100
    }
    const { thresholds } = buildBucketsFromUserCounts(userCounts);

    // u100 (count=100) should be P100
    expect(lookupPercentile(100, thresholds)).toBe(100);
    // u50 (count=50) should be around P50
    const p50 = lookupPercentile(50, thresholds);
    expect(p50).toBeGreaterThanOrEqual(45);
    expect(p50).toBeLessThanOrEqual(55);
    // u1 (count=1) should be P0-P1
    expect(lookupPercentile(1, thresholds)).toBeLessThanOrEqual(1);
  });
});
