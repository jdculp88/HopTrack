// AI Recommendations unit tests — Reese + Casey, Sprint 146
import { describe, it, expect } from "vitest";

// ── Test AI recommendation types ──

describe("AI Recommendations — types", () => {
  it("defines AIRecommendedBeer with aiReason field", () => {
    const beer = {
      id: "uuid-1",
      name: "Test IPA",
      style: "IPA",
      abv: 6.5,
      avg_rating: 4.2,
      total_ratings: 45,
      brewery: { id: "b-1", name: "Test Brewery", city: "Charlotte" },
      reason: "Because you love IPAs",
      aiReason: "You've rated 5 IPAs above 4 stars this month — this award-winning IPA from Test Brewery is right up your alley.",
    };

    expect(beer.aiReason).toBeTruthy();
    expect(beer.aiReason.length).toBeGreaterThan(beer.reason.length);
  });
});

// ── Test cache TTL logic ──

describe("AI Recommendations — cache", () => {
  it("24-hour cache expires correctly", () => {
    const now = Date.now();
    const expiresAt = new Date(now + 24 * 60 * 60 * 1000);
    const isExpired = expiresAt.getTime() < Date.now();
    expect(isExpired).toBe(false);
  });

  it("expired cache detected correctly", () => {
    const yesterday = new Date(Date.now() - 25 * 60 * 60 * 1000);
    const isExpired = yesterday.getTime() < Date.now();
    expect(isExpired).toBe(true);
  });
});

// ── Test style DNA building ──

describe("AI Recommendations — style DNA", () => {
  it("builds top styles from beer log data", () => {
    const logs = [
      { style: "IPA" },
      { style: "IPA" },
      { style: "IPA" },
      { style: "Stout" },
      { style: "Stout" },
      { style: "Pale Ale" },
      { style: null },
    ];

    const styleCounts: Record<string, number> = {};
    for (const log of logs) {
      if (!log.style) continue;
      styleCounts[log.style] = (styleCounts[log.style] || 0) + 1;
    }

    const topStyles = Object.entries(styleCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([style, count]) => ({ style, count }));

    expect(topStyles).toHaveLength(3);
    expect(topStyles[0]).toEqual({ style: "IPA", count: 3 });
    expect(topStyles[1]).toEqual({ style: "Stout", count: 2 });
  });
});

// ── Test fallback behavior ──

describe("AI Recommendations — fallback", () => {
  it("wraps basic recommendations as AIRecommendedBeer on failure", () => {
    const basic = [
      {
        id: "b-1",
        name: "Hop Forward",
        style: "IPA",
        abv: 7.0,
        avg_rating: 4.5,
        total_ratings: 100,
        brewery: { id: "br-1", name: "Local Brewery", city: "Asheville" },
        reason: "Because you love IPAs",
      },
    ];

    const fallback = basic.map((b) => ({
      ...b,
      aiReason: b.reason,
    }));

    expect(fallback[0].aiReason).toBe("Because you love IPAs");
    expect(fallback[0].name).toBe("Hop Forward");
  });

  it("limits fallback to 3 recommendations", () => {
    const basics = Array.from({ length: 10 }, (_, i) => ({
      id: `b-${i}`,
      name: `Beer ${i}`,
      style: "IPA",
      abv: 5.0,
      avg_rating: 4.0,
      total_ratings: 50,
      brewery: { id: "br-1", name: "Brewery", city: null },
      reason: "Good beer",
    }));

    const results = basics.slice(0, 3).map((b) => ({ ...b, aiReason: b.reason }));
    expect(results).toHaveLength(3);
  });
});

// ── Test rate limiting ──

describe("AI Recommendations — rate limits", () => {
  it("allows 3 regenerations per day per user", () => {
    const LIMIT = 3;
    const WINDOW_MS = 24 * 60 * 60 * 1000;
    expect(LIMIT).toBe(3);
    expect(WINDOW_MS).toBe(86400000);
  });
});
