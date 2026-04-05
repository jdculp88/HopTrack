import { describe, it, expect } from "vitest";
import { generateDigestRecommendations, type DigestRecommendationInput } from "../digest-recommendations";

function makeInput(overrides: Partial<DigestRecommendationInput> = {}): DigestRecommendationInput {
  return {
    breweryId: "test-brewery-id",
    topBeer: null,
    visits: 0,
    visitsTrend: 0,
    followerGrowth: 0,
    loyaltyRedemptions: 0,
    kpis: null,
    vipsNotVisiting: 0,
    ...overrides,
  };
}

describe("generateDigestRecommendations", () => {
  it("returns empty array when no rules match", () => {
    const result = generateDigestRecommendations(makeInput());
    expect(result).toHaveLength(0);
  });

  it("recommends featuring top beer (priority 1)", () => {
    const result = generateDigestRecommendations(makeInput({ topBeer: "Golden Kolsch" }));
    expect(result).toHaveLength(1);
    expect(result[0].title).toContain("Golden Kolsch");
    expect(result[0].ctaUrl).toContain("/board");
    expect(result[0].priority).toBe(1);
  });

  it("alerts about VIP customers not visiting (priority 1)", () => {
    const result = generateDigestRecommendations(makeInput({ vipsNotVisiting: 3 }));
    expect(result).toHaveLength(1);
    expect(result[0].title).toContain("3");
    expect(result[0].title).toContain("VIP");
    expect(result[0].ctaUrl).toContain("/customers");
  });

  it("handles singular VIP grammar", () => {
    const result = generateDigestRecommendations(makeInput({ vipsNotVisiting: 1 }));
    expect(result[0].title).toContain("1 VIP customer hasn't");
  });

  it("alerts on low retention rate (priority 1)", () => {
    const result = generateDigestRecommendations(makeInput({
      kpis: { retentionRate: 20, avgRatingTrend: null, tapListFreshness: null },
    }));
    expect(result).toHaveLength(1);
    expect(result[0].title).toContain("Retention");
    expect(result[0].description).toContain("20%");
    expect(result[0].ctaUrl).toContain("/loyalty");
  });

  it("does NOT alert when retention is healthy", () => {
    const result = generateDigestRecommendations(makeInput({
      kpis: { retentionRate: 50, avgRatingTrend: null, tapListFreshness: null },
    }));
    expect(result).toHaveLength(0);
  });

  it("celebrates rating improvement (priority 2)", () => {
    const result = generateDigestRecommendations(makeInput({
      kpis: { retentionRate: null, avgRatingTrend: 0.3, tapListFreshness: null },
    }));
    expect(result).toHaveLength(1);
    expect(result[0].title).toContain("0.3");
    expect(result[0].priority).toBe(2);
  });

  it("nudges on follower growth (priority 2)", () => {
    const result = generateDigestRecommendations(makeInput({ followerGrowth: 12 }));
    expect(result).toHaveLength(1);
    expect(result[0].title).toContain("12");
    expect(result[0].ctaUrl).toContain("/messages");
  });

  it("does NOT nudge on small follower growth (<5)", () => {
    const result = generateDigestRecommendations(makeInput({ followerGrowth: 3 }));
    expect(result).toHaveLength(0);
  });

  it("warns about stale tap list (priority 2)", () => {
    const result = generateDigestRecommendations(makeInput({
      kpis: { retentionRate: null, avgRatingTrend: null, tapListFreshness: 21 },
    }));
    expect(result).toHaveLength(1);
    expect(result[0].title).toContain("refresh");
    expect(result[0].description).toContain("21 days");
  });

  it("limits output to 3 recommendations max", () => {
    const result = generateDigestRecommendations(makeInput({
      topBeer: "IPA",
      vipsNotVisiting: 5,
      followerGrowth: 10,
      kpis: { retentionRate: 15, avgRatingTrend: 0.5, tapListFreshness: 20 },
    }));
    expect(result).toHaveLength(3);
  });

  it("sorts by priority (P1 before P2)", () => {
    const result = generateDigestRecommendations(makeInput({
      topBeer: "IPA", // P1
      followerGrowth: 10, // P2
      vipsNotVisiting: 3, // P1
    }));
    expect(result).toHaveLength(3);
    expect(result[0].priority).toBe(1);
    expect(result[1].priority).toBe(1);
    expect(result[2].priority).toBe(2);
  });

  it("includes correct brewery-admin URLs", () => {
    const result = generateDigestRecommendations(makeInput({
      breweryId: "abc-123",
      topBeer: "Stout",
    }));
    expect(result[0].ctaUrl).toBe("/brewery-admin/abc-123/board");
  });
});
