// ROI extended unit tests — Avery + Reese, Sprint 104
// Covers edge cases, output shape validation, and additional tier scenarios
// not already in roi.test.ts
import { describe, it, expect } from "vitest";
import { calculateROI, formatROIMessage, type ROIData } from "@/lib/roi";

// ── Output shape validation ──

describe("calculateROI output shape", () => {
  it("returns all required ROIData fields", () => {
    const result = calculateROI({
      loyaltyVisitsThisMonth: 5,
      loyaltyVisitsByWeek: [1, 1, 1, 2],
      subscriptionTier: "tap",
    });
    expect(result).toHaveProperty("loyaltyDrivenVisits");
    expect(result).toHaveProperty("estimatedRevenue");
    expect(result).toHaveProperty("subscriptionCost");
    expect(result).toHaveProperty("roiMultiple");
    expect(result).toHaveProperty("trend");
    expect(result).toHaveProperty("periodLabel");
  });

  it("all numeric fields are numbers (not NaN or undefined)", () => {
    const result = calculateROI({
      loyaltyVisitsThisMonth: 5,
      loyaltyVisitsByWeek: [1, 1, 1, 2],
      subscriptionTier: "cask",
    });
    expect(typeof result.loyaltyDrivenVisits).toBe("number");
    expect(typeof result.estimatedRevenue).toBe("number");
    expect(typeof result.subscriptionCost).toBe("number");
    expect(typeof result.roiMultiple).toBe("number");
    expect(Number.isNaN(result.loyaltyDrivenVisits)).toBe(false);
    expect(Number.isNaN(result.estimatedRevenue)).toBe(false);
    expect(Number.isNaN(result.subscriptionCost)).toBe(false);
    expect(Number.isNaN(result.roiMultiple)).toBe(false);
  });

  it("trend is always an array", () => {
    const result = calculateROI({
      loyaltyVisitsThisMonth: 0,
      loyaltyVisitsByWeek: [],
      subscriptionTier: "free",
    });
    expect(Array.isArray(result.trend)).toBe(true);
  });

  it("periodLabel is always a non-empty string", () => {
    const result = calculateROI({
      loyaltyVisitsThisMonth: 1,
      loyaltyVisitsByWeek: [1],
      subscriptionTier: "barrel",
    });
    expect(typeof result.periodLabel).toBe("string");
    expect(result.periodLabel.length).toBeGreaterThan(0);
  });
});

// ── Zero visits edge cases ──

describe("calculateROI with zero visits", () => {
  it("returns 0 estimated revenue for zero visits", () => {
    const result = calculateROI({
      loyaltyVisitsThisMonth: 0,
      loyaltyVisitsByWeek: [0, 0, 0, 0],
      subscriptionTier: "tap",
    });
    expect(result.estimatedRevenue).toBe(0);
  });

  it("returns 0 ROI multiple for zero visits on paid tier (not negative, not Infinity)", () => {
    const result = calculateROI({
      loyaltyVisitsThisMonth: 0,
      loyaltyVisitsByWeek: [0, 0, 0, 0],
      subscriptionTier: "cask",
    });
    expect(result.roiMultiple).toBe(0);
    expect(Number.isFinite(result.roiMultiple)).toBe(true);
  });

  it("returns 0 ROI multiple for zero visits on barrel tier (not Infinity)", () => {
    const result = calculateROI({
      loyaltyVisitsThisMonth: 0,
      loyaltyVisitsByWeek: [0, 0, 0, 0],
      subscriptionTier: "barrel",
    });
    expect(result.roiMultiple).toBe(0);
    expect(Number.isFinite(result.roiMultiple)).toBe(true);
  });

  it("zero visits with custom avg spend still returns 0 revenue", () => {
    const result = calculateROI({
      loyaltyVisitsThisMonth: 0,
      loyaltyVisitsByWeek: [0, 0, 0, 0],
      subscriptionTier: "tap",
      avgSpendPerVisit: 100,
    });
    expect(result.estimatedRevenue).toBe(0);
  });
});

// ── Free tier specifics ──

describe("calculateROI free tier", () => {
  it("always returns 0 subscription cost", () => {
    const result = calculateROI({
      loyaltyVisitsThisMonth: 100,
      loyaltyVisitsByWeek: [25, 25, 25, 25],
      subscriptionTier: "free",
    });
    expect(result.subscriptionCost).toBe(0);
  });

  it("always returns 0 ROI multiple (no cost means no multiple)", () => {
    const result = calculateROI({
      loyaltyVisitsThisMonth: 100,
      loyaltyVisitsByWeek: [25, 25, 25, 25],
      subscriptionTier: "free",
    });
    expect(result.roiMultiple).toBe(0);
  });

  it("still calculates estimated revenue correctly", () => {
    // 20 visits * $35 = $700
    const result = calculateROI({
      loyaltyVisitsThisMonth: 20,
      loyaltyVisitsByWeek: [5, 5, 5, 5],
      subscriptionTier: "free",
    });
    expect(result.estimatedRevenue).toBe(700);
  });

  it("still calculates estimated revenue with custom avg spend", () => {
    // 20 visits * $50 = $1000
    const result = calculateROI({
      loyaltyVisitsThisMonth: 20,
      loyaltyVisitsByWeek: [5, 5, 5, 5],
      subscriptionTier: "free",
      avgSpendPerVisit: 50,
    });
    expect(result.estimatedRevenue).toBe(1000);
  });
});

// ── Tap tier specifics ──

describe("calculateROI tap tier", () => {
  it("subscription cost is exactly $49", () => {
    const result = calculateROI({
      loyaltyVisitsThisMonth: 1,
      loyaltyVisitsByWeek: [0, 0, 0, 1],
      subscriptionTier: "tap",
    });
    expect(result.subscriptionCost).toBe(49);
  });

  it("ROI multiple is rounded to 1 decimal place", () => {
    // 10 * 35 = 350 / 49 = 7.142... → rounds to 7.1
    const result = calculateROI({
      loyaltyVisitsThisMonth: 10,
      loyaltyVisitsByWeek: [2, 3, 2, 3],
      subscriptionTier: "tap",
    });
    const decimals = result.roiMultiple.toString().split(".")[1];
    expect(decimals === undefined || decimals.length <= 1).toBe(true);
  });

  it("ROI multiple is exactly 1 when revenue equals subscription cost", () => {
    // $49 / $49 = 1.0x — need visits * 35 = 49 exactly
    // Not a clean integer, so use custom avg spend: 1 visit * $49 = $49 / $49 = 1.0
    const result = calculateROI({
      loyaltyVisitsThisMonth: 1,
      loyaltyVisitsByWeek: [0, 0, 0, 1],
      subscriptionTier: "tap",
      avgSpendPerVisit: 49,
    });
    expect(result.roiMultiple).toBe(1);
  });

  it("ROI multiple below 1.0 when revenue < subscription cost", () => {
    // 1 visit * $35 = $35 / $49 = 0.7x
    const result = calculateROI({
      loyaltyVisitsThisMonth: 1,
      loyaltyVisitsByWeek: [0, 0, 0, 1],
      subscriptionTier: "tap",
    });
    expect(result.roiMultiple).toBeLessThan(1);
    expect(result.roiMultiple).toBeGreaterThan(0);
  });
});

// ── Cask tier specifics ──

describe("calculateROI cask tier", () => {
  it("subscription cost is exactly $149", () => {
    const result = calculateROI({
      loyaltyVisitsThisMonth: 1,
      loyaltyVisitsByWeek: [0, 0, 0, 1],
      subscriptionTier: "cask",
    });
    expect(result.subscriptionCost).toBe(149);
  });

  it("requires more visits than tap to break even", () => {
    const tapBreakEven = calculateROI({
      loyaltyVisitsThisMonth: 2,
      loyaltyVisitsByWeek: [0, 1, 0, 1],
      subscriptionTier: "tap",
    });
    const caskBreakEven = calculateROI({
      loyaltyVisitsThisMonth: 2,
      loyaltyVisitsByWeek: [0, 1, 0, 1],
      subscriptionTier: "cask",
    });
    // Same visits → cask ROI multiple is always less than tap
    expect(caskBreakEven.roiMultiple).toBeLessThan(tapBreakEven.roiMultiple);
  });

  it("ROI multiple is 1 when revenue equals $149 (custom avg spend)", () => {
    const result = calculateROI({
      loyaltyVisitsThisMonth: 1,
      loyaltyVisitsByWeek: [0, 0, 0, 1],
      subscriptionTier: "cask",
      avgSpendPerVisit: 149,
    });
    expect(result.roiMultiple).toBe(1);
  });

  it("ROI multiple exceeds 1.0 for strong months", () => {
    // 50 visits * $35 = $1750 / $149 = 11.7x
    const result = calculateROI({
      loyaltyVisitsThisMonth: 50,
      loyaltyVisitsByWeek: [12, 13, 12, 13],
      subscriptionTier: "cask",
    });
    expect(result.roiMultiple).toBeGreaterThan(1);
    expect(result.estimatedRevenue).toBe(1750);
  });
});

// ── ROI calculation with redemptions scenario ──
// Loyalty redemptions mean higher visit frequency → higher loyaltyVisitsThisMonth

describe("calculateROI with high redemption activity", () => {
  it("high redemption month shows proportionally higher ROI", () => {
    const lowRedemption = calculateROI({
      loyaltyVisitsThisMonth: 10,
      loyaltyVisitsByWeek: [2, 3, 2, 3],
      subscriptionTier: "tap",
    });
    const highRedemption = calculateROI({
      loyaltyVisitsThisMonth: 50,
      loyaltyVisitsByWeek: [12, 13, 12, 13],
      subscriptionTier: "tap",
    });
    expect(highRedemption.roiMultiple).toBeGreaterThan(lowRedemption.roiMultiple);
    expect(highRedemption.estimatedRevenue).toBeGreaterThan(lowRedemption.estimatedRevenue);
  });

  it("custom avg spend reflects higher per-visit spend from loyal customers", () => {
    // Loyal customers who redeem often spend more per visit
    const standardCustomer = calculateROI({
      loyaltyVisitsThisMonth: 20,
      loyaltyVisitsByWeek: [5, 5, 5, 5],
      subscriptionTier: "cask",
      avgSpendPerVisit: 35,
    });
    const loyalCustomer = calculateROI({
      loyaltyVisitsThisMonth: 20,
      loyaltyVisitsByWeek: [5, 5, 5, 5],
      subscriptionTier: "cask",
      avgSpendPerVisit: 55,
    });
    expect(loyalCustomer.estimatedRevenue).toBeGreaterThan(standardCustomer.estimatedRevenue);
    expect(loyalCustomer.roiMultiple).toBeGreaterThan(standardCustomer.roiMultiple);
  });
});

// ── Negative trend (visits down week-over-week) ──

describe("calculateROI with declining trend", () => {
  it("passes through declining weekly trend array unchanged", () => {
    const decliningWeeks = [15, 10, 7, 4]; // visits dropping each week
    const result = calculateROI({
      loyaltyVisitsThisMonth: 36,
      loyaltyVisitsByWeek: decliningWeeks,
      subscriptionTier: "tap",
    });
    expect(result.trend).toEqual(decliningWeeks);
  });

  it("ROI calculation is still based on total monthly visits, not trend direction", () => {
    // Declining trend doesn't change how revenue or ROI multiple are calculated
    const result = calculateROI({
      loyaltyVisitsThisMonth: 20,
      loyaltyVisitsByWeek: [10, 7, 2, 1], // heavy decline
      subscriptionTier: "tap",
    });
    expect(result.estimatedRevenue).toBe(700); // 20 * $35
    expect(result.loyaltyDrivenVisits).toBe(20);
  });

  it("all-zero weekly trend works without error", () => {
    const result = calculateROI({
      loyaltyVisitsThisMonth: 0,
      loyaltyVisitsByWeek: [0, 0, 0, 0],
      subscriptionTier: "tap",
    });
    expect(result.trend).toEqual([0, 0, 0, 0]);
    expect(result.roiMultiple).toBe(0);
  });

  it("trend array with 1 week works (not always 4 weeks)", () => {
    const result = calculateROI({
      loyaltyVisitsThisMonth: 5,
      loyaltyVisitsByWeek: [5], // single week of data
      subscriptionTier: "free",
    });
    expect(result.trend).toEqual([5]);
  });
});

// ── formatROIMessage ──

describe("formatROIMessage free tier", () => {
  it("includes the visit count", () => {
    const roi = calculateROI({
      loyaltyVisitsThisMonth: 42,
      loyaltyVisitsByWeek: [10, 11, 10, 11],
      subscriptionTier: "free",
    });
    expect(formatROIMessage(roi)).toContain("42");
  });

  it("includes the estimated dollar value with $ sign", () => {
    const roi = calculateROI({
      loyaltyVisitsThisMonth: 42,
      loyaltyVisitsByWeek: [10, 11, 10, 11],
      subscriptionTier: "free",
    });
    const msg = formatROIMessage(roi);
    expect(msg).toContain("$");
    expect(msg).toContain("1,470"); // 42 * 35 = 1470 → localeString
  });

  it("returns a string (never undefined or null)", () => {
    const roi = calculateROI({
      loyaltyVisitsThisMonth: 0,
      loyaltyVisitsByWeek: [],
      subscriptionTier: "free",
    });
    expect(typeof formatROIMessage(roi)).toBe("string");
  });
});

describe("formatROIMessage tap tier", () => {
  it("shows ROI multiple when >= 1x", () => {
    const roi = calculateROI({
      loyaltyVisitsThisMonth: 10,
      loyaltyVisitsByWeek: [2, 3, 2, 3],
      subscriptionTier: "tap",
    });
    const msg = formatROIMessage(roi);
    expect(msg).toContain("paid for itself");
    expect(msg).toContain("x"); // the multiple
  });

  it("shows visit count when ROI is exactly below 1x", () => {
    // $35 revenue / $49 cost = 0.7x — below 1, has visits
    const roi = calculateROI({
      loyaltyVisitsThisMonth: 1,
      loyaltyVisitsByWeek: [0, 0, 0, 1],
      subscriptionTier: "tap",
    });
    const msg = formatROIMessage(roi);
    expect(msg).toContain("repeat visits");
    expect(msg).not.toContain("paid for itself");
  });

  it("shows 'not enough data' when zero visits", () => {
    const roi = calculateROI({
      loyaltyVisitsThisMonth: 0,
      loyaltyVisitsByWeek: [0, 0, 0, 0],
      subscriptionTier: "tap",
    });
    const msg = formatROIMessage(roi);
    expect(msg).toContain("Not enough data");
    expect(msg).not.toContain("paid for itself");
    expect(msg).not.toContain("$");
  });
});

describe("formatROIMessage cask tier", () => {
  it("shows ROI multiple for high-traffic month", () => {
    // 50 * $35 = $1750 / $149 = 11.7x
    const roi = calculateROI({
      loyaltyVisitsThisMonth: 50,
      loyaltyVisitsByWeek: [12, 13, 12, 13],
      subscriptionTier: "cask",
    });
    const msg = formatROIMessage(roi);
    expect(msg).toContain("paid for itself");
    expect(msg).toContain("11.7x");
  });

  it("shows 'not enough data' for zero visits on cask", () => {
    const roi = calculateROI({
      loyaltyVisitsThisMonth: 0,
      loyaltyVisitsByWeek: [0, 0, 0, 0],
      subscriptionTier: "cask",
    });
    expect(formatROIMessage(roi)).toContain("Not enough data");
  });

  it("shows visit count when cask is below breakeven (few visits)", () => {
    // 2 visits * $35 = $70 / $149 = 0.5x — below 1
    const roi = calculateROI({
      loyaltyVisitsThisMonth: 2,
      loyaltyVisitsByWeek: [0, 1, 0, 1],
      subscriptionTier: "cask",
    });
    const msg = formatROIMessage(roi);
    expect(msg).toContain("repeat visits");
    expect(msg).not.toContain("paid for itself");
  });
});

describe("formatROIMessage barrel tier", () => {
  it("shows ROI multiple when barrel tier pays for itself", () => {
    // 100 visits * $35 = $3500 / $299 = 11.7x
    const roi = calculateROI({
      loyaltyVisitsThisMonth: 100,
      loyaltyVisitsByWeek: [25, 25, 25, 25],
      subscriptionTier: "barrel",
    });
    const msg = formatROIMessage(roi);
    expect(msg).toContain("paid for itself");
  });

  it("shows 'not enough data' for zero visits on barrel", () => {
    const roi = calculateROI({
      loyaltyVisitsThisMonth: 0,
      loyaltyVisitsByWeek: [0, 0, 0, 0],
      subscriptionTier: "barrel",
    });
    expect(formatROIMessage(roi)).toContain("Not enough data");
  });
});

// ── ROIData interface conformance ──

describe("calculateROI conforms to ROIData interface", () => {
  it("returned object satisfies the ROIData type contract", () => {
    const result: ROIData = calculateROI({
      loyaltyVisitsThisMonth: 15,
      loyaltyVisitsByWeek: [3, 4, 4, 4],
      subscriptionTier: "tap",
    });
    // TypeScript compilation enforces shape; runtime checks below confirm values
    expect(result.loyaltyDrivenVisits).toBe(15);
    expect(result.subscriptionCost).toBe(49);
    expect(result.trend).toHaveLength(4);
    expect(result.periodLabel).toBe("This month");
  });

  it("loyaltyDrivenVisits mirrors loyaltyVisitsThisMonth input", () => {
    const result = calculateROI({
      loyaltyVisitsThisMonth: 77,
      loyaltyVisitsByWeek: [19, 20, 19, 19],
      subscriptionTier: "free",
    });
    expect(result.loyaltyDrivenVisits).toBe(77);
  });

  it("trend mirrors loyaltyVisitsByWeek input", () => {
    const weeks = [3, 5, 8, 13];
    const result = calculateROI({
      loyaltyVisitsThisMonth: 29,
      loyaltyVisitsByWeek: weeks,
      subscriptionTier: "tap",
    });
    expect(result.trend).toStrictEqual(weeks);
  });
});
