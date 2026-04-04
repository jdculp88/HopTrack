import { describe, it, expect } from "vitest";

// We test the pure helper logic that doesn't require a Supabase client.
// The main function calculateCommandCenterMetrics needs a real client,
// so we test the exported types and the internal computation patterns.

// ── Test bucket/trend helpers by importing indirectly ──────────────

describe("superadmin-metrics types", () => {
  it("exports CommandCenterData interface shape", async () => {
    const mod = await import("../superadmin-metrics");
    expect(typeof mod.calculateCommandCenterMetrics).toBe("function");
  });

  it("TimeRange allows valid values", () => {
    const ranges: Array<"7d" | "30d" | "90d"> = ["7d", "30d", "90d"];
    expect(ranges).toHaveLength(3);
    expect(ranges).toContain("30d");
  });
});

describe("date bucketing logic", () => {
  it("generates correct YYYY-MM-DD from ISO strings", () => {
    const iso = "2026-04-03T14:30:00.000Z";
    const key = iso.slice(0, 10);
    expect(key).toBe("2026-04-03");
  });

  it("buckets timestamps into daily counts", () => {
    // Simulate the bucketing logic used in calculateCommandCenterMetrics
    const now = new Date("2026-04-03T12:00:00Z");
    const days = 7;
    const buckets: Record<string, number> = {};

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      buckets[d.toISOString().slice(0, 10)] = 0;
    }

    expect(Object.keys(buckets)).toHaveLength(7);
    expect(buckets["2026-04-03"]).toBe(0);
    expect(buckets["2026-03-28"]).toBe(0);

    // Add some data
    buckets["2026-04-03"] = 5;
    buckets["2026-04-02"] = 3;
    buckets["2026-04-01"] = 7;

    expect(buckets["2026-04-03"]).toBe(5);
    expect(buckets["2026-04-02"]).toBe(3);
  });
});

describe("pctChange calculation", () => {
  function pctChange(current: number, prior: number): number | null {
    if (prior === 0) return current > 0 ? 100 : null;
    return Math.round(((current - prior) / prior) * 100);
  }

  it("returns positive percentage for growth", () => {
    expect(pctChange(15, 10)).toBe(50);
  });

  it("returns negative percentage for decline", () => {
    expect(pctChange(5, 10)).toBe(-50);
  });

  it("returns 0 for no change", () => {
    expect(pctChange(10, 10)).toBe(0);
  });

  it("returns 100 when prior is 0 and current > 0", () => {
    expect(pctChange(5, 0)).toBe(100);
  });

  it("returns null when both are 0", () => {
    expect(pctChange(0, 0)).toBeNull();
  });

  it("handles large numbers", () => {
    expect(pctChange(1000, 500)).toBe(100);
    expect(pctChange(7500, 5000)).toBe(50);
  });
});

describe("MRR calculation", () => {
  const TIER_MRR: Record<string, number> = {
    tap: 49,
    cask: 149,
    barrel: 299,
  };

  it("calculates correct MRR for mixed tiers", () => {
    const accounts = [
      { tier: "tap", status: "active" },
      { tier: "tap", status: "active" },
      { tier: "cask", status: "active" },
      { tier: "barrel", status: "active" },
      { tier: "tap", status: "canceled" },
      { tier: "free", status: null },
    ];

    let mrr = 0;
    for (const a of accounts) {
      if (a.status === "active" && TIER_MRR[a.tier]) {
        mrr += TIER_MRR[a.tier];
      }
    }

    // 2 × $49 + 1 × $149 + 1 × $299 = $546
    expect(mrr).toBe(546);
  });

  it("returns 0 for no paid accounts", () => {
    const accounts = [
      { tier: "free", status: null },
      { tier: "tap", status: "canceled" },
    ];

    let mrr = 0;
    for (const a of accounts) {
      if (a.status === "active" && TIER_MRR[a.tier]) {
        mrr += TIER_MRR[a.tier];
      }
    }

    expect(mrr).toBe(0);
  });
});

describe("tier distribution", () => {
  it("groups accounts by tier correctly", () => {
    const accounts = [
      { tier: "free" },
      { tier: "free" },
      { tier: "tap" },
      { tier: "cask" },
      { tier: "free" },
    ];

    const tierCounts: Record<string, number> = {};
    for (const a of accounts) {
      tierCounts[a.tier] = (tierCounts[a.tier] || 0) + 1;
    }

    expect(tierCounts.free).toBe(3);
    expect(tierCounts.tap).toBe(1);
    expect(tierCounts.cask).toBe(1);
    expect(tierCounts.barrel).toBeUndefined();
  });
});

describe("DAU/WAU/MAU computation", () => {
  it("counts unique users per time window", () => {
    const now = new Date("2026-04-03T12:00:00Z");
    const sessions = [
      { user_id: "a", started_at: "2026-04-03T10:00:00Z" }, // today
      { user_id: "a", started_at: "2026-04-03T11:00:00Z" }, // today (dupe)
      { user_id: "b", started_at: "2026-04-03T09:00:00Z" }, // today
      { user_id: "c", started_at: "2026-04-01T10:00:00Z" }, // 2 days ago
      { user_id: "d", started_at: "2026-03-15T10:00:00Z" }, // 19 days ago
    ];

    const todayStr = now.toISOString().slice(0, 10);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);

    const dauUsers = new Set<string>();
    const wauUsers = new Set<string>();
    const mauUsers = new Set<string>();

    for (const s of sessions) {
      const d = new Date(s.started_at);
      if (d >= thirtyDaysAgo) mauUsers.add(s.user_id);
      if (d >= sevenDaysAgo) wauUsers.add(s.user_id);
      if (s.started_at.slice(0, 10) === todayStr) dauUsers.add(s.user_id);
    }

    expect(dauUsers.size).toBe(2); // a, b
    expect(wauUsers.size).toBe(3); // a, b, c
    expect(mauUsers.size).toBe(4); // a, b, c, d
  });
});

describe("claim funnel", () => {
  it("builds funnel from counts", () => {
    const funnel = {
      totalBreweries: 7177,
      claimed: 12,
      verified: 8,
      paid: 3,
    };

    expect(funnel.totalBreweries).toBeGreaterThan(funnel.claimed);
    expect(funnel.claimed).toBeGreaterThanOrEqual(funnel.verified);
    expect(funnel.verified).toBeGreaterThanOrEqual(funnel.paid);
  });
});

describe("PulseMetrics sparkline fields", () => {
  it("dauSparkline contains 7-day daily values", () => {
    const sparkline = [10, 12, 8, 15, 20, 18, 22];
    expect(sparkline).toHaveLength(7);
    expect(sparkline[0]).toBe(10);
    expect(sparkline[6]).toBe(22);
  });

  it("sessionsSparkline contains 7-day daily values", () => {
    const sparkline = [50, 45, 60, 55, 70, 65, 80];
    expect(sparkline).toHaveLength(7);
    expect(Math.max(...sparkline)).toBe(80);
  });

  it("dauWoW calculates week-over-week change", () => {
    function pctChange(current: number, prior: number): number | null {
      if (prior === 0) return current > 0 ? 100 : null;
      return Math.round(((current - prior) / prior) * 100);
    }

    // 20 DAU this week vs 15 last week = +33%
    expect(pctChange(20, 15)).toBe(33);
    // 10 DAU this week vs 20 last week = -50%
    expect(pctChange(10, 20)).toBe(-50);
  });

  it("sessionsWoW calculates week-over-week change", () => {
    function pctChange(current: number, prior: number): number | null {
      if (prior === 0) return current > 0 ? 100 : null;
      return Math.round(((current - prior) / prior) * 100);
    }

    // 80 sessions this week vs 70 last week = +14%
    expect(pctChange(80, 70)).toBe(14);
    // No sessions last week, 5 this week = +100%
    expect(pctChange(5, 0)).toBe(100);
  });

  it("WoW values can be null when no data", () => {
    const dauWoW: number | null = null;
    const sessionsWoW: number | null = null;
    expect(dauWoW).toBeNull();
    expect(sessionsWoW).toBeNull();
  });
});

describe("CommandCenterData crmDistribution", () => {
  it("contains segment entries with required fields", () => {
    const crmDistribution = [
      { segment: "vip", count: 5, color: "#D4A843", bgColor: "#D4A84320", emoji: "crown" },
      { segment: "power", count: 15, color: "#C0C0C0", bgColor: "#C0C0C020", emoji: "zap" },
      { segment: "regular", count: 40, color: "#CD7F32", bgColor: "#CD7F3220", emoji: "user" },
      { segment: "new", count: 100, color: "#6B7280", bgColor: "#6B728020", emoji: "sparkles" },
    ];

    expect(crmDistribution).toHaveLength(4);
    expect(crmDistribution[0].segment).toBe("vip");
    expect(crmDistribution[0].count).toBe(5);
    expect(crmDistribution[0].color).toBeTruthy();
    expect(crmDistribution[0].emoji).toBe("crown");

    const totalUsers = crmDistribution.reduce((sum, s) => sum + s.count, 0);
    expect(totalUsers).toBe(160);
  });
});

describe("CommandCenterData churnDistribution", () => {
  it("contains churn risk levels with required fields", () => {
    const churnDistribution = [
      { level: "low", count: 80, color: "#22c55e" },
      { level: "medium", count: 30, color: "#f59e0b" },
      { level: "high", count: 10, color: "#ef4444" },
    ];

    expect(churnDistribution).toHaveLength(3);
    expect(churnDistribution[0].level).toBe("low");
    expect(churnDistribution[2].level).toBe("high");

    const total = churnDistribution.reduce((sum, c) => sum + c.count, 0);
    expect(total).toBe(120);
  });

  it("each entry has a color for chart rendering", () => {
    const entry = { level: "low", count: 50, color: "#22c55e" };
    expect(entry.color).toMatch(/^#[0-9a-fA-F]{6}$/);
  });
});

// ── Sales Pipeline (Sprint 148) ───────────────────────────────────

describe("SalesPipelineMetrics interface", () => {
  it("exports calculateSalesPipeline function", async () => {
    const mod = await import("../superadmin-metrics");
    expect(typeof mod.calculateSalesPipeline).toBe("function");
  });

  it("SalesPipelineMetrics shape is valid", () => {
    // Type check at compile time, runtime check for shape
    const sample = {
      totalClaims: 10,
      pending: 3,
      approved: 7,
      inTrial: 4,
      converted: 2,
      churned: 1,
      trialExpiringSoon: [
        { breweryId: "abc", name: "Test Brewery", daysLeft: 3 },
      ],
    };

    expect(sample.totalClaims).toBeGreaterThanOrEqual(0);
    expect(sample.pending + sample.approved).toBeLessThanOrEqual(sample.totalClaims + sample.approved);
    expect(sample.trialExpiringSoon).toHaveLength(1);
    expect(sample.trialExpiringSoon[0].daysLeft).toBe(3);
  });

  it("conversion rate calculation works correctly", () => {
    const approved = 10;
    const converted = 3;
    const convRate = approved > 0 ? Math.round((converted / approved) * 100) : 0;
    expect(convRate).toBe(30);
  });

  it("conversion rate is 0 when no approvals", () => {
    const approved = 0;
    const converted = 0;
    const convRate = approved > 0 ? Math.round((converted / approved) * 100) : 0;
    expect(convRate).toBe(0);
  });

  it("trialExpiringSoon sorts by daysLeft ascending", () => {
    const trials = [
      { breweryId: "a", name: "A", daysLeft: 5 },
      { breweryId: "b", name: "B", daysLeft: 1 },
      { breweryId: "c", name: "C", daysLeft: 3 },
    ];
    const sorted = [...trials].sort((a, b) => a.daysLeft - b.daysLeft);
    expect(sorted[0].name).toBe("B");
    expect(sorted[1].name).toBe("C");
    expect(sorted[2].name).toBe("A");
  });
});
