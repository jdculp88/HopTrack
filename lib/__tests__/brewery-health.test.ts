import { describe, it, expect } from "vitest";
import {
  scoreContentFreshness,
  scoreEngagementRate,
  scoreLoyaltyAdoption,
  scoreRatingTrend,
  generateTips,
  type BreweryHealthBreakdown,
} from "../brewery-health";

// ── Content Freshness ───────────────────────────────────────────────────────

describe("scoreContentFreshness", () => {
  it("gives 25 points for tap list updated within 7 days", () => {
    expect(scoreContentFreshness(0)).toBe(25);
    expect(scoreContentFreshness(3)).toBe(25);
    expect(scoreContentFreshness(7)).toBe(25);
  });

  it("gives 18 points for tap list updated within 14 days", () => {
    expect(scoreContentFreshness(8)).toBe(18);
    expect(scoreContentFreshness(14)).toBe(18);
  });

  it("gives 10 points for tap list updated within 30 days", () => {
    expect(scoreContentFreshness(15)).toBe(10);
    expect(scoreContentFreshness(30)).toBe(10);
  });

  it("gives 0 points for stale tap list", () => {
    expect(scoreContentFreshness(31)).toBe(0);
    expect(scoreContentFreshness(999)).toBe(0);
  });
});

// ── Engagement Rate ─────────────────────────────────────────────────────────

describe("scoreEngagementRate", () => {
  it("scales based on sessions per follower (capped at 25)", () => {
    expect(scoreEngagementRate(10, 10)).toBe(5); // 1.0 ratio * 5 = 5
    expect(scoreEngagementRate(50, 10)).toBe(25); // 5.0 ratio * 5 = 25, capped
    expect(scoreEngagementRate(100, 10)).toBe(25); // above cap
  });

  it("gives 10 points when sessions exist but no followers", () => {
    expect(scoreEngagementRate(5, 0)).toBe(10);
  });

  it("gives 0 when no sessions and no followers", () => {
    expect(scoreEngagementRate(0, 0)).toBe(0);
  });
});

// ── Loyalty Adoption ────────────────────────────────────────────────────────

describe("scoreLoyaltyAdoption", () => {
  it("gives 25 for active loyalty program", () => {
    expect(scoreLoyaltyAdoption(true, true)).toBe(25);
  });

  it("gives 10 for inactive loyalty program", () => {
    expect(scoreLoyaltyAdoption(true, false)).toBe(10);
  });

  it("gives 0 when no program exists", () => {
    expect(scoreLoyaltyAdoption(false, false)).toBe(0);
  });
});

// ── Rating Trend ────────────────────────────────────────────────────────────

describe("scoreRatingTrend", () => {
  it("scores based on recent average when trending up", () => {
    expect(scoreRatingTrend(4.0, 3.5, true)).toBe(20); // 4.0 * 5 = 20
    expect(scoreRatingTrend(5.0, 4.0, true)).toBe(25); // 5.0 * 5 = 25, capped
  });

  it("penalizes declining ratings", () => {
    expect(scoreRatingTrend(3.0, 4.0, true)).toBe(10); // 3.0 * 5 - 5 = 10
    expect(scoreRatingTrend(1.0, 4.0, true)).toBe(0); // 1.0 * 5 - 5 = 0
  });

  it("gives 0 when no recent ratings", () => {
    expect(scoreRatingTrend(0, 4.0, false)).toBe(0);
  });

  it("handles equal ratings (trending up path)", () => {
    expect(scoreRatingTrend(4.0, 4.0, true)).toBe(20);
  });
});

// ── Tips Generation ─────────────────────────────────────────────────────────

describe("generateTips", () => {
  it("generates tips for low-scoring categories (< 15)", () => {
    const breakdown: BreweryHealthBreakdown = {
      contentFreshness: 10,
      engagementRate: 0,
      loyaltyAdoption: 0,
      ratingTrend: 10,
    };
    const tips = generateTips(breakdown, 20);
    expect(tips).toHaveLength(4); // all four below 15: content (10), engagement (0), loyalty (0), rating (10)
    expect(tips.some(t => t.category === "contentFreshness")).toBe(true);
    expect(tips.some(t => t.category === "engagementRate")).toBe(true);
    expect(tips.some(t => t.category === "loyaltyAdoption")).toBe(true);
    expect(tips.some(t => t.category === "ratingTrend")).toBe(true);
  });

  it("generates no tips when all scores are healthy", () => {
    const breakdown: BreweryHealthBreakdown = {
      contentFreshness: 25,
      engagementRate: 20,
      loyaltyAdoption: 25,
      ratingTrend: 20,
    };
    const tips = generateTips(breakdown, 3);
    expect(tips).toHaveLength(0);
  });

  it("includes days in content freshness tip", () => {
    const breakdown: BreweryHealthBreakdown = {
      contentFreshness: 0,
      engagementRate: 25,
      loyaltyAdoption: 25,
      ratingTrend: 25,
    };
    const tips = generateTips(breakdown, 45);
    expect(tips).toHaveLength(1);
    expect(tips[0].message).toContain("45 days");
  });

  it("handles never-updated tap list", () => {
    const breakdown: BreweryHealthBreakdown = {
      contentFreshness: 0,
      engagementRate: 25,
      loyaltyAdoption: 25,
      ratingTrend: 25,
    };
    const tips = generateTips(breakdown, 999);
    expect(tips[0].message).toContain("never been updated");
  });
});

// ── Total Score ─────────────────────────────────────────────────────────────

describe("total health score", () => {
  it("sums all 4 categories for a maximum of 100", () => {
    const total = scoreContentFreshness(1) + scoreEngagementRate(100, 10) + scoreLoyaltyAdoption(true, true) + scoreRatingTrend(5.0, 4.0, true);
    expect(total).toBe(100);
  });

  it("can be zero when all categories are zero", () => {
    const total = scoreContentFreshness(999) + scoreEngagementRate(0, 0) + scoreLoyaltyAdoption(false, false) + scoreRatingTrend(0, 0, false);
    expect(total).toBe(0);
  });
});
