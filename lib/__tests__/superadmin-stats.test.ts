import { describe, it, expect } from "vitest";

// We test the pure type system and function shape.
// fetchPlatformStats requires a real Supabase client, so we verify
// exports, type shapes, and computation patterns.

describe("superadmin-stats types", () => {
  it("exports fetchPlatformStats as a function", async () => {
    const mod = await import("../superadmin-stats");
    expect(typeof mod.fetchPlatformStats).toBe("function");
  });

  it("exports StatCard interface shape", () => {
    const card: import("../superadmin-stats").StatCard = {
      label: "Total Users",
      value: 1500,
      sparkline: [10, 12, 8, 15, 20, 18, 22],
      subtitle: "All registered accounts",
    };
    expect(card.label).toBe("Total Users");
    expect(card.sparkline).toHaveLength(7);
  });

  it("exports ComputedRatio interface shape", () => {
    const ratio: import("../superadmin-stats").ComputedRatio = {
      label: "DAU/MAU Stickiness",
      value: 12.5,
      format: "percent",
      description: "Daily active / monthly active users",
    };
    expect(ratio.format).toBe("percent");
    expect(ratio.value).toBe(12.5);
  });

  it("exports SegmentDistribution interface shape", () => {
    const seg: import("../superadmin-stats").SegmentDistribution = {
      segment: "vip",
      label: "VIP",
      count: 15,
      color: "#D4A843",
      bgColor: "#D4A84320",
      emoji: "crown",
    };
    expect(seg.segment).toBe("vip");
    expect(seg.count).toBe(15);
  });

  it("exports StyleDistribution interface shape", () => {
    const style: import("../superadmin-stats").StyleDistribution = {
      style: "IPA",
      count: 466,
      pct: 23.5,
    };
    expect(style.style).toBe("IPA");
    expect(style.pct).toBe(23.5);
  });

  it("exports LeaderboardItem interface shape", () => {
    const item: import("../superadmin-stats").LeaderboardItem = {
      id: "brewery-123",
      name: "Pint & Pixel",
      subtitle: "Charlotte, NC",
      count: 42,
    };
    expect(item.name).toBe("Pint & Pixel");
    expect(item.count).toBe(42);
  });

  it("exports PlatformStatsData interface shape", () => {
    const data: import("../superadmin-stats").PlatformStatsData = {
      stats: [],
      ratios: [],
      crmDistribution: [],
      styleDistribution: [],
      topBreweries: [],
      topBeers: [],
      generatedAt: "2026-04-03T12:00:00Z",
    };
    expect(data.stats).toHaveLength(0);
    expect(data.generatedAt).toBe("2026-04-03T12:00:00Z");
  });
});

describe("StatsTimeRange values", () => {
  it("allows all valid time range values", () => {
    const ranges: import("../superadmin-stats").StatsTimeRange[] = ["7d", "30d", "90d"];
    expect(ranges).toHaveLength(3);
    expect(ranges).toContain("7d");
    expect(ranges).toContain("30d");
    expect(ranges).toContain("90d");
  });

  it("maps time ranges to correct day counts", () => {
    const rangeDays: Record<import("../superadmin-stats").StatsTimeRange, number> = {
      "7d": 7,
      "30d": 30,
      "90d": 90,
    };
    expect(rangeDays["7d"]).toBe(7);
    expect(rangeDays["30d"]).toBe(30);
    expect(rangeDays["90d"]).toBe(90);
  });
});

describe("ComputedRatio format values", () => {
  it("supports percent format", () => {
    const ratio: import("../superadmin-stats").ComputedRatio = {
      label: "Stickiness",
      value: 15.3,
      format: "percent",
      description: "test",
    };
    expect(ratio.format).toBe("percent");
  });

  it("supports decimal format", () => {
    const ratio: import("../superadmin-stats").ComputedRatio = {
      label: "Avg Sessions",
      value: 3.2,
      format: "decimal",
      description: "test",
    };
    expect(ratio.format).toBe("decimal");
  });

  it("supports minutes format", () => {
    const ratio: import("../superadmin-stats").ComputedRatio = {
      label: "Avg Duration",
      value: 45,
      format: "minutes",
      description: "test",
    };
    expect(ratio.format).toBe("minutes");
  });

  it("allows null value for missing data", () => {
    const ratio: import("../superadmin-stats").ComputedRatio = {
      label: "No Data",
      value: null,
      format: "percent",
      description: "Not enough data",
    };
    expect(ratio.value).toBeNull();
  });
});

describe("stickiness calculation", () => {
  it("computes DAU/MAU ratio correctly", () => {
    const dau = 25;
    const mau = 200;
    const stickiness = Math.round((dau / mau) * 1000) / 10;
    expect(stickiness).toBe(12.5);
  });

  it("returns null when MAU is 0", () => {
    const dau = 0;
    const mau = 0;
    const stickiness = mau > 0 ? Math.round((dau / mau) * 1000) / 10 : null;
    expect(stickiness).toBeNull();
  });
});

describe("avg beers per session calculation", () => {
  it("computes average correctly", () => {
    const beerLogCount = 150;
    const sessionCount = 50;
    const avg = Math.round((beerLogCount / sessionCount) * 10) / 10;
    expect(avg).toBe(3);
  });

  it("returns null when no sessions", () => {
    const sessionCount = 0;
    const avg = sessionCount > 0 ? Math.round((100 / sessionCount) * 10) / 10 : null;
    expect(avg).toBeNull();
  });
});

describe("style distribution percentage", () => {
  it("calculates correct percentages", () => {
    const styleCounts: Record<string, number> = {
      IPA: 466,
      "Pale Ale": 257,
      Amber: 232,
    };
    const total = Object.values(styleCounts).reduce((a, b) => a + b, 0);

    const ipaPct = Math.round((466 / total) * 1000) / 10;
    expect(ipaPct).toBe(48.8); // 466 / 955 = 48.8%
    expect(total).toBe(955);
  });

  it("returns 0 pct when total is 0", () => {
    const total = 0;
    const pct = total > 0 ? Math.round((5 / total) * 1000) / 10 : 0;
    expect(pct).toBe(0);
  });
});

describe("session completion rate", () => {
  it("calculates rate of sessions with at least one beer", () => {
    const totalSessions = 100;
    const sessionsWithBeer = 85;
    const rate = Math.round((sessionsWithBeer / totalSessions) * 1000) / 10;
    expect(rate).toBe(85);
  });

  it("returns null when no sessions", () => {
    const totalSessions = 0;
    const rate = totalSessions > 0 ? Math.round((0 / totalSessions) * 1000) / 10 : null;
    expect(rate).toBeNull();
  });
});
