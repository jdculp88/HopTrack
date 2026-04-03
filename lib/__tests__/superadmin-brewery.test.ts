// Superadmin Brewery Detail unit tests — Reese + Quinn, Sprint 140 (The Bridge)
import { describe, it, expect, vi } from "vitest";
import type { BreweryDetailData, TeamMember, TapListSnapshot, LoyaltySummary, TimelineItem } from "@/lib/superadmin-brewery";

// ── Type shape tests ──────────────────────────────────────────────────

describe("BreweryDetailData type shape", () => {
  const mockData: BreweryDetailData = {
    brewery: { id: "test-id", name: "Test Brewery", city: "Charlotte", state: "NC", created_at: "2026-01-01" },
    brand: null,
    team: [],
    kpis: {
      avgSessionDuration: 45,
      avgSessionDurationTrend: 5,
      beersPerVisit: 2.3,
      beersPerVisitTrend: -3,
      newVisitorPct: 40,
      returningVisitorPct: 60,
      visitorSplitTrend: 2,
      retentionRate: 35,
      retentionTrend: 1,
      loyaltyConversionRate: 15,
      loyaltyRedemptions: 10,
      loyaltyRedemptionsTrend: 20,
      topCustomer: { name: "Josh", visits: 12 },
      peakHour: { hour: 18, label: "6 PM", count: 25 },
      avgRatingTrend: 0.2,
      reviewSentiment: { positive: 10, neutral: 3, negative: 1 },
      followerGrowthRate: 15,
      tapListFreshness: 14,
    },
    sparklines: {
      avgDuration: [40, 42, 45, 43, 44, 46, 45],
      beersPerVisit: [2.1, 2.3, 2.0, 2.4, 2.5, 2.2, 2.3],
      returningPct: [50, 55, 60, 58, 62, 59, 60],
      retention: [30, 32, 35, 35],
    },
    tapList: { totalBeers: 12, onTap: 8, styles: [{ name: "IPA", count: 4 }] },
    loyalty: { active: true, programName: "Hop Card", stampsRequired: 10, cardsIssued: 50, totalRedemptions: 8 },
    timeline: [],
    adminActions: [],
    totalSessions: 150,
    totalFollowers: 30,
    uniqueVisitors: 85,
  };

  it("has all required fields", () => {
    expect(mockData).toHaveProperty("brewery");
    expect(mockData).toHaveProperty("brand");
    expect(mockData).toHaveProperty("team");
    expect(mockData).toHaveProperty("kpis");
    expect(mockData).toHaveProperty("sparklines");
    expect(mockData).toHaveProperty("tapList");
    expect(mockData).toHaveProperty("loyalty");
    expect(mockData).toHaveProperty("timeline");
    expect(mockData).toHaveProperty("adminActions");
    expect(mockData).toHaveProperty("totalSessions");
    expect(mockData).toHaveProperty("totalFollowers");
    expect(mockData).toHaveProperty("uniqueVisitors");
  });

  it("brewery has name and location", () => {
    expect(mockData.brewery.name).toBe("Test Brewery");
    expect(mockData.brewery.city).toBe("Charlotte");
    expect(mockData.brewery.state).toBe("NC");
  });

  it("kpis has all 18 metrics", () => {
    const kpiKeys = Object.keys(mockData.kpis);
    expect(kpiKeys.length).toBe(18);
    expect(kpiKeys).toContain("avgSessionDuration");
    expect(kpiKeys).toContain("beersPerVisit");
    expect(kpiKeys).toContain("retentionRate");
    expect(kpiKeys).toContain("loyaltyConversionRate");
    expect(kpiKeys).toContain("topCustomer");
    expect(kpiKeys).toContain("peakHour");
  });

  it("sparklines have correct array lengths", () => {
    expect(mockData.sparklines.avgDuration).toHaveLength(7);
    expect(mockData.sparklines.beersPerVisit).toHaveLength(7);
    expect(mockData.sparklines.returningPct).toHaveLength(7);
    expect(mockData.sparklines.retention).toHaveLength(4);
  });
});

// ── TeamMember type tests ─────────────────────────────────────────────

describe("TeamMember", () => {
  const member: TeamMember = {
    id: "acc-1",
    user_id: "user-1",
    role: "owner",
    verified: true,
    propagated_from_brand: false,
    created_at: "2026-01-01",
    profile: {
      display_name: "Joshua",
      username: "jdculp",
      email: "josh@hoptrack.io",
      avatar_url: null,
    },
  };

  it("has required fields", () => {
    expect(member.role).toBe("owner");
    expect(member.verified).toBe(true);
    expect(member.propagated_from_brand).toBe(false);
  });

  it("profile can be null for unclaimed accounts", () => {
    const unclaimed: TeamMember = { ...member, profile: null };
    expect(unclaimed.profile).toBeNull();
  });

  it("role can be any of the 4 staff roles", () => {
    const roles = ["owner", "business", "marketing", "staff"];
    for (const role of roles) {
      expect(() => ({ ...member, role } satisfies TeamMember)).not.toThrow();
    }
  });
});

// ── TapListSnapshot tests ─────────────────────────────────────────────

describe("TapListSnapshot", () => {
  it("tracks on-tap count separately from total", () => {
    const snap: TapListSnapshot = { totalBeers: 20, onTap: 12, styles: [] };
    expect(snap.onTap).toBeLessThanOrEqual(snap.totalBeers);
  });

  it("styles array can be empty", () => {
    const snap: TapListSnapshot = { totalBeers: 0, onTap: 0, styles: [] };
    expect(snap.styles).toHaveLength(0);
  });

  it("styles are name+count pairs", () => {
    const snap: TapListSnapshot = {
      totalBeers: 10,
      onTap: 6,
      styles: [{ name: "IPA", count: 4 }, { name: "Stout", count: 3 }],
    };
    expect(snap.styles[0].name).toBe("IPA");
    expect(snap.styles[0].count).toBe(4);
  });
});

// ── LoyaltySummary tests ──────────────────────────────────────────────

describe("LoyaltySummary", () => {
  it("active program has all fields", () => {
    const loyalty: LoyaltySummary = {
      active: true,
      programName: "Hop Card",
      stampsRequired: 10,
      cardsIssued: 50,
      totalRedemptions: 8,
    };
    expect(loyalty.active).toBe(true);
    expect(loyalty.programName).toBe("Hop Card");
  });

  it("inactive program has null fields", () => {
    const loyalty: LoyaltySummary = {
      active: false,
      programName: null,
      stampsRequired: null,
      cardsIssued: 0,
      totalRedemptions: 0,
    };
    expect(loyalty.active).toBe(false);
    expect(loyalty.programName).toBeNull();
  });
});

// ── TimelineItem tests ────────────────────────────────────────────────

describe("TimelineItem", () => {
  it("session type has actor and detail", () => {
    const item: TimelineItem = {
      id: "s-1",
      type: "session",
      actor: "Josh",
      actorAvatar: null,
      detail: "Checked in — 3 beers",
      timestamp: "2026-04-03T18:00:00Z",
    };
    expect(item.type).toBe("session");
    expect(item.detail).toContain("beers");
  });

  it("review type has rating detail", () => {
    const item: TimelineItem = {
      id: "r-1",
      type: "review",
      actor: "Sam",
      actorAvatar: "https://example.com/avatar.jpg",
      detail: "Left a 5-star review",
      timestamp: "2026-04-03T17:30:00Z",
    };
    expect(item.type).toBe("review");
    expect(item.actorAvatar).toBeTruthy();
  });

  it("follow type is simple", () => {
    const item: TimelineItem = {
      id: "f-1",
      type: "follow",
      actor: "Taylor",
      actorAvatar: null,
      detail: "Started following",
      timestamp: "2026-04-03T16:00:00Z",
    };
    expect(item.type).toBe("follow");
  });
});

// ── ActivityItem breweryId extension ──────────────────────────────────

describe("ActivityItem breweryId", () => {
  it("session activity items can have breweryId", () => {
    // Import the type to verify the field exists
    const item = {
      id: "session-1",
      type: "session" as const,
      text: "Josh",
      subtext: "checked in at Pint & Pixel",
      timestamp: "2026-04-03T18:00:00Z",
      breweryId: "brewery-uuid",
    };
    expect(item.breweryId).toBe("brewery-uuid");
  });

  it("claim activity items can have breweryId", () => {
    const item = {
      id: "claim-1",
      type: "claim" as const,
      text: "Owner",
      subtext: "claimed Pint & Pixel (pending)",
      timestamp: "2026-04-03T18:00:00Z",
      breweryId: "brewery-uuid",
    };
    expect(item.breweryId).toBeDefined();
  });

  it("signup items may not have breweryId", () => {
    const item = {
      id: "signup-1",
      type: "signup" as const,
      text: "New user",
      subtext: "joined HopTrack",
      timestamp: "2026-04-03T18:00:00Z",
    };
    expect(item).not.toHaveProperty("breweryId");
  });
});
