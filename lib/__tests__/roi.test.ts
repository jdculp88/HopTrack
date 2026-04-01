// ROI calculation unit tests — Reese, Sprint 93 retro action item
import { describe, it, expect } from "vitest";
import { calculateROI, formatROIMessage } from "@/lib/roi";

// ── calculateROI ──

describe("calculateROI", () => {
  it("returns zero ROI multiple for free tier", () => {
    const result = calculateROI({
      loyaltyVisitsThisMonth: 10,
      loyaltyVisitsByWeek: [2, 3, 2, 3],
      subscriptionTier: "free",
    });
    expect(result.roiMultiple).toBe(0);
    expect(result.subscriptionCost).toBe(0);
  });

  it("calculates estimated revenue using default avg spend ($35)", () => {
    const result = calculateROI({
      loyaltyVisitsThisMonth: 10,
      loyaltyVisitsByWeek: [2, 3, 2, 3],
      subscriptionTier: "free",
    });
    expect(result.estimatedRevenue).toBe(350); // 10 * 35
  });

  it("calculates estimated revenue using custom avg spend", () => {
    const result = calculateROI({
      loyaltyVisitsThisMonth: 10,
      loyaltyVisitsByWeek: [2, 3, 2, 3],
      subscriptionTier: "free",
      avgSpendPerVisit: 50,
    });
    expect(result.estimatedRevenue).toBe(500); // 10 * 50
  });

  it("returns correct subscription cost for tap tier ($49)", () => {
    const result = calculateROI({
      loyaltyVisitsThisMonth: 5,
      loyaltyVisitsByWeek: [1, 1, 1, 2],
      subscriptionTier: "tap",
    });
    expect(result.subscriptionCost).toBe(49);
  });

  it("returns correct subscription cost for cask tier ($149)", () => {
    const result = calculateROI({
      loyaltyVisitsThisMonth: 5,
      loyaltyVisitsByWeek: [1, 1, 1, 2],
      subscriptionTier: "cask",
    });
    expect(result.subscriptionCost).toBe(149);
  });

  it("returns correct subscription cost for barrel tier ($299)", () => {
    const result = calculateROI({
      loyaltyVisitsThisMonth: 5,
      loyaltyVisitsByWeek: [1, 1, 1, 2],
      subscriptionTier: "barrel",
    });
    expect(result.subscriptionCost).toBe(299);
  });

  it("calculates ROI multiple for tap tier", () => {
    // 10 visits * $35 = $350. $350 / $49 = 7.1x
    const result = calculateROI({
      loyaltyVisitsThisMonth: 10,
      loyaltyVisitsByWeek: [2, 3, 2, 3],
      subscriptionTier: "tap",
    });
    expect(result.roiMultiple).toBe(7.1);
  });

  it("calculates ROI multiple for cask tier", () => {
    // 10 visits * $35 = $350. $350 / $149 = 2.3x
    const result = calculateROI({
      loyaltyVisitsThisMonth: 10,
      loyaltyVisitsByWeek: [2, 3, 2, 3],
      subscriptionTier: "cask",
    });
    expect(result.roiMultiple).toBe(2.3);
  });

  it("handles zero loyalty visits", () => {
    const result = calculateROI({
      loyaltyVisitsThisMonth: 0,
      loyaltyVisitsByWeek: [0, 0, 0, 0],
      subscriptionTier: "tap",
    });
    expect(result.estimatedRevenue).toBe(0);
    expect(result.roiMultiple).toBe(0);
    expect(result.loyaltyDrivenVisits).toBe(0);
  });

  it("passes through trend data unchanged", () => {
    const weeks = [5, 3, 7, 2];
    const result = calculateROI({
      loyaltyVisitsThisMonth: 17,
      loyaltyVisitsByWeek: weeks,
      subscriptionTier: "tap",
    });
    expect(result.trend).toEqual(weeks);
  });

  it("always returns 'This month' as period label", () => {
    const result = calculateROI({
      loyaltyVisitsThisMonth: 1,
      loyaltyVisitsByWeek: [1],
      subscriptionTier: "free",
    });
    expect(result.periodLabel).toBe("This month");
  });
});

// ── formatROIMessage ──

describe("formatROIMessage", () => {
  it("shows estimated dollar value for free tier", () => {
    const roi = calculateROI({
      loyaltyVisitsThisMonth: 10,
      loyaltyVisitsByWeek: [2, 3, 2, 3],
      subscriptionTier: "free",
    });
    const msg = formatROIMessage(roi);
    expect(msg).toContain("10 repeat visits");
    expect(msg).toContain("$350");
  });

  it("shows ROI multiple when subscription pays for itself", () => {
    const roi = calculateROI({
      loyaltyVisitsThisMonth: 10,
      loyaltyVisitsByWeek: [2, 3, 2, 3],
      subscriptionTier: "tap",
    });
    const msg = formatROIMessage(roi);
    expect(msg).toContain("7.1x");
    expect(msg).toContain("paid for itself");
  });

  it("shows visit count when ROI is below 1x for paid tier", () => {
    // 1 visit * $35 = $35. $35 / $49 = 0.7x (below 1)
    const roi = calculateROI({
      loyaltyVisitsThisMonth: 1,
      loyaltyVisitsByWeek: [0, 0, 0, 1],
      subscriptionTier: "tap",
    });
    const msg = formatROIMessage(roi);
    expect(msg).toContain("1 repeat visits");
  });

  it("shows 'not enough data' when zero visits on paid tier", () => {
    const roi = calculateROI({
      loyaltyVisitsThisMonth: 0,
      loyaltyVisitsByWeek: [0, 0, 0, 0],
      subscriptionTier: "cask",
    });
    const msg = formatROIMessage(roi);
    expect(msg).toContain("Not enough data");
  });
});
