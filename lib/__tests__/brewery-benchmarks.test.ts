import { describe, it, expect } from "vitest";
import { calculatePctDiff, buildMetric } from "../brewery-benchmarks";

// ── Percentage Difference Calculation ───────────────────────────────────────

describe("calculatePctDiff", () => {
  it("calculates positive difference when above average", () => {
    expect(calculatePctDiff(60, 50)).toBe(20); // 20% above
  });

  it("calculates negative difference when below average", () => {
    expect(calculatePctDiff(40, 50)).toBe(-20); // 20% below
  });

  it("returns 0 when equal", () => {
    expect(calculatePctDiff(50, 50)).toBe(0);
  });

  it("returns null when yours is null", () => {
    expect(calculatePctDiff(null, 50)).toBeNull();
  });

  it("returns null when peerAvg is null", () => {
    expect(calculatePctDiff(50, null)).toBeNull();
  });

  it("returns null when peerAvg is 0", () => {
    expect(calculatePctDiff(50, 0)).toBeNull();
  });

  it("rounds to integer", () => {
    expect(calculatePctDiff(55, 50)).toBe(10); // 10%
    expect(calculatePctDiff(51, 50)).toBe(2); // 2%
  });
});

// ── Metric Builder ──────────────────────────────────────────────────────────

describe("buildMetric", () => {
  it("builds complete metric with pctDiff", () => {
    const metric = buildMetric(60, 50);
    expect(metric.yours).toBe(60);
    expect(metric.peerAvg).toBe(50);
    expect(metric.pctDiff).toBe(20);
  });

  it("rounds peerAvg to 1 decimal place", () => {
    const metric = buildMetric(60, 50.456);
    expect(metric.peerAvg).toBe(50.5);
  });

  it("handles null values gracefully", () => {
    const metric = buildMetric(null, null);
    expect(metric.yours).toBeNull();
    expect(metric.peerAvg).toBeNull();
    expect(metric.pctDiff).toBeNull();
  });

  it("handles yours null with valid peer avg", () => {
    const metric = buildMetric(null, 50);
    expect(metric.yours).toBeNull();
    expect(metric.peerAvg).toBe(50);
    expect(metric.pctDiff).toBeNull();
  });
});
