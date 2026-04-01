import { describe, it, expect } from "vitest";
import {
  computeSegment,
  getSegmentConfig,
  getSegmentById,
  computeEngagementScore,
  getEngagementLevel,
  buildCustomerProfile,
  SEGMENTS,
  type EngagementFactors,
} from "../crm";

// ─── Segment Logic ───────────────────────────────────────────────────────────

describe("computeSegment", () => {
  it("returns 'new' for 1 visit", () => {
    expect(computeSegment(1)).toBe("new");
  });

  it("returns 'regular' for 2-4 visits", () => {
    expect(computeSegment(2)).toBe("regular");
    expect(computeSegment(3)).toBe("regular");
    expect(computeSegment(4)).toBe("regular");
  });

  it("returns 'power' for 5-9 visits", () => {
    expect(computeSegment(5)).toBe("power");
    expect(computeSegment(7)).toBe("power");
    expect(computeSegment(9)).toBe("power");
  });

  it("returns 'vip' for 10+ visits", () => {
    expect(computeSegment(10)).toBe("vip");
    expect(computeSegment(50)).toBe("vip");
    expect(computeSegment(100)).toBe("vip");
  });

  it("returns 'new' for 0 visits (edge case)", () => {
    expect(computeSegment(0)).toBe("new");
  });
});

describe("getSegmentConfig", () => {
  it("returns full config for VIP", () => {
    const config = getSegmentConfig(15);
    expect(config.id).toBe("vip");
    expect(config.label).toBe("VIP");
    expect(config.emoji).toBe("👑");
  });

  it("returns full config for new visitor", () => {
    const config = getSegmentConfig(1);
    expect(config.id).toBe("new");
    expect(config.label).toBe("New");
  });
});

describe("getSegmentById", () => {
  it("returns config by ID", () => {
    expect(getSegmentById("power").label).toBe("Power");
    expect(getSegmentById("regular").emoji).toBe("🍺");
  });
});

describe("SEGMENTS constant", () => {
  it("has 4 segments", () => {
    expect(SEGMENTS).toHaveLength(4);
  });

  it("segments are ordered by minVisits descending", () => {
    expect(SEGMENTS[0].id).toBe("vip");
    expect(SEGMENTS[3].id).toBe("new");
  });

  it("every segment has required fields", () => {
    SEGMENTS.forEach(s => {
      expect(s.id).toBeTruthy();
      expect(s.label).toBeTruthy();
      expect(s.color).toBeTruthy();
      expect(s.bgColor).toBeTruthy();
      expect(s.emoji).toBeTruthy();
      expect(typeof s.minVisits).toBe("number");
    });
  });
});

// ─── Engagement Scoring ──────────────────────────────────────────────────────

describe("computeEngagementScore", () => {
  const baseFactors: EngagementFactors = {
    visits: 0,
    lastVisitDate: null,
    beersLogged: 0,
    avgRating: null,
    hasLoyaltyCard: false,
    isFollowing: false,
  };

  it("returns 0 for a completely inactive user", () => {
    expect(computeEngagementScore(baseFactors)).toBe(0);
  });

  it("returns 100 for a maximally engaged user", () => {
    const score = computeEngagementScore({
      visits: 30,
      lastVisitDate: new Date().toISOString(),
      beersLogged: 50,
      avgRating: 4.5,
      hasLoyaltyCard: true,
      isFollowing: true,
    });
    expect(score).toBe(100);
  });

  it("frequency caps at 30 visits (35 pts)", () => {
    const a = computeEngagementScore({ ...baseFactors, visits: 30 });
    const b = computeEngagementScore({ ...baseFactors, visits: 100 });
    expect(a).toBe(b);
  });

  it("recency decays over 90 days", () => {
    const recent = computeEngagementScore({
      ...baseFactors,
      lastVisitDate: new Date().toISOString(),
    });
    const old = computeEngagementScore({
      ...baseFactors,
      lastVisitDate: new Date(Date.now() - 45 * 86400000).toISOString(),
    });
    const ancient = computeEngagementScore({
      ...baseFactors,
      lastVisitDate: new Date(Date.now() - 91 * 86400000).toISOString(),
    });
    expect(recent).toBe(30);
    expect(old).toBeGreaterThan(0);
    expect(ancient).toBe(0);
  });

  it("loyalty card adds 10 pts", () => {
    const without = computeEngagementScore(baseFactors);
    const withCard = computeEngagementScore({ ...baseFactors, hasLoyaltyCard: true });
    expect(withCard - without).toBe(10);
  });

  it("following adds 10 pts", () => {
    const without = computeEngagementScore(baseFactors);
    const withFollow = computeEngagementScore({ ...baseFactors, isFollowing: true });
    expect(withFollow - without).toBe(10);
  });

  it("score is always between 0 and 100", () => {
    for (let i = 0; i < 20; i++) {
      const score = computeEngagementScore({
        visits: Math.floor(Math.random() * 100),
        lastVisitDate: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 180 * 86400000).toISOString() : null,
        beersLogged: Math.floor(Math.random() * 200),
        avgRating: Math.random() > 0.5 ? Math.random() * 5 : null,
        hasLoyaltyCard: Math.random() > 0.5,
        isFollowing: Math.random() > 0.5,
      });
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });
});

describe("getEngagementLevel", () => {
  it("returns correct labels for score ranges", () => {
    expect(getEngagementLevel(90)).toBe("Champion");
    expect(getEngagementLevel(80)).toBe("Champion");
    expect(getEngagementLevel(70)).toBe("Engaged");
    expect(getEngagementLevel(60)).toBe("Engaged");
    expect(getEngagementLevel(50)).toBe("Warming Up");
    expect(getEngagementLevel(40)).toBe("Warming Up");
    expect(getEngagementLevel(30)).toBe("Casual");
    expect(getEngagementLevel(20)).toBe("Casual");
    expect(getEngagementLevel(10)).toBe("New Face");
    expect(getEngagementLevel(0)).toBe("New Face");
  });
});

// ─── Customer Profile Builder ────────────────────────────────────────────────

describe("buildCustomerProfile", () => {
  const mockProfile = {
    id: "user-123",
    display_name: "Alex Brewfan",
    username: "alexbrews",
    avatar_url: null,
  };

  const mockSessions = [
    { id: "s1", started_at: "2026-03-01T12:00:00Z", ended_at: "2026-03-01T14:00:00Z" },
    { id: "s2", started_at: "2026-03-10T12:00:00Z", ended_at: "2026-03-10T14:00:00Z" },
    { id: "s3", started_at: "2026-03-20T12:00:00Z", ended_at: "2026-03-20T14:00:00Z" },
  ];

  const mockBeerLogs = [
    { beer_id: "b1", beer_name: "Hazy IPA", beer_style: "IPA", rating: 4, quantity: 2 },
    { beer_id: "b2", beer_name: "Amber Ale", beer_style: "Amber", rating: 3, quantity: 1 },
    { beer_id: "b1", beer_name: "Hazy IPA", beer_style: "IPA", rating: 5, quantity: 1 },
  ];

  it("builds a complete profile", () => {
    const profile = buildCustomerProfile({
      profile: mockProfile,
      sessions: mockSessions,
      beerLogs: mockBeerLogs,
      loyaltyCard: { stamps_earned: 5 },
      isFollowing: true,
    });

    expect(profile.userId).toBe("user-123");
    expect(profile.displayName).toBe("Alex Brewfan");
    expect(profile.segment).toBe("regular");
    expect(profile.stats.totalVisits).toBe(3);
    expect(profile.stats.totalBeersLogged).toBe(4);
    expect(profile.stats.uniqueBeers).toBe(2);
    expect(profile.stats.avgRating).toBe(4);
    expect(profile.topStyles[0].style).toBe("IPA");
    expect(profile.topBeers[0].name).toBe("Hazy IPA");
    expect(profile.topBeers[0].count).toBe(3);
    expect(profile.hasLoyaltyCard).toBe(true);
    expect(profile.loyaltyStamps).toBe(5);
    expect(profile.isFollowing).toBe(true);
    expect(profile.engagementScore).toBeGreaterThan(0);
  });

  it("handles empty data gracefully", () => {
    const profile = buildCustomerProfile({
      profile: { id: "u", display_name: "Guest", username: "", avatar_url: null },
      sessions: [],
      beerLogs: [],
      loyaltyCard: null,
      isFollowing: false,
    });

    expect(profile.segment).toBe("new");
    expect(profile.stats.totalVisits).toBe(0);
    expect(profile.stats.avgRating).toBeNull();
    expect(profile.topStyles).toHaveLength(0);
    expect(profile.topBeers).toHaveLength(0);
    expect(profile.engagementScore).toBe(0);
  });

  it("sorts sessions to find first and last visit", () => {
    const profile = buildCustomerProfile({
      profile: mockProfile,
      sessions: mockSessions,
      beerLogs: [],
      loyaltyCard: null,
      isFollowing: false,
    });

    expect(profile.stats.firstVisit).toBe("2026-03-01T12:00:00Z");
    expect(profile.stats.lastVisit).toBe("2026-03-20T12:00:00Z");
  });
});
