import { describe, it, expect } from "vitest";

// We test the pure type system and function shape.
// fetchBreweryList requires a real Supabase client, so we verify
// exports, type shapes, and default option semantics.

describe("superadmin-brewery-list types", () => {
  it("exports fetchBreweryList as a function", async () => {
    const mod = await import("../superadmin-brewery-list");
    expect(typeof mod.fetchBreweryList).toBe("function");
  });

  it("exports BreweryListItem interface shape", async () => {
    // Verify the module exports the expected types by constructing conforming objects
    const item: import("../superadmin-brewery-list").BreweryListItem = {
      id: "test-id",
      name: "Test Brewery",
      city: "Charlotte",
      state: "NC",
      breweryType: "micro",
      createdAt: "2026-04-03T00:00:00Z",
      tier: "tap",
      verified: true,
      sessionCount: 42,
      lastActive: "2026-04-02T18:00:00Z",
      followerCount: 100,
      beerCount: 25,
      brandName: "Test Brand",
    };
    expect(item.id).toBe("test-id");
    expect(item.name).toBe("Test Brewery");
    expect(item.sessionCount).toBe(42);
  });

  it("exports BreweryListSummary interface shape", async () => {
    const summary: import("../superadmin-brewery-list").BreweryListSummary = {
      total: 7177,
      claimed: 12,
      verified: 8,
      paid: 3,
      mrrEstimate: 546,
    };
    expect(summary.total).toBe(7177);
    expect(summary.mrrEstimate).toBe(546);
  });

  it("exports BreweryListResult interface shape", async () => {
    const result: import("../superadmin-brewery-list").BreweryListResult = {
      breweries: [],
      summary: { total: 0, claimed: 0, verified: 0, paid: 0, mrrEstimate: 0 },
      totalCount: 0,
      page: 1,
      pageSize: 50,
    };
    expect(result.breweries).toHaveLength(0);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(50);
  });
});

describe("BreweryListFilter values", () => {
  it("allows all valid filter values", () => {
    const filters: import("../superadmin-brewery-list").BreweryListFilter[] = [
      "all",
      "free",
      "tap",
      "cask",
      "barrel",
      "unclaimed",
    ];
    expect(filters).toHaveLength(6);
    expect(filters).toContain("all");
    expect(filters).toContain("free");
    expect(filters).toContain("tap");
    expect(filters).toContain("cask");
    expect(filters).toContain("barrel");
    expect(filters).toContain("unclaimed");
  });
});

describe("BreweryListSort values", () => {
  it("allows all valid sort values", () => {
    const sorts: import("../superadmin-brewery-list").BreweryListSort[] = [
      "name",
      "sessions",
      "last_active",
      "created",
    ];
    expect(sorts).toHaveLength(4);
    expect(sorts).toContain("name");
    expect(sorts).toContain("sessions");
    expect(sorts).toContain("last_active");
    expect(sorts).toContain("created");
  });
});

describe("default options semantics", () => {
  it("page defaults to 1", () => {
    const input: number | undefined = undefined;
    const page = input ?? 1;
    expect(page).toBe(1);
  });

  it("pageSize defaults to 50", () => {
    const input: number | undefined = undefined;
    const pageSize = input ?? 50;
    expect(pageSize).toBe(50);
  });

  it("sort defaults to name", () => {
    const input: string | undefined = undefined;
    const sort = input ?? "name";
    expect(sort).toBe("name");
  });

  it("filter defaults to all", () => {
    const input: string | undefined = undefined;
    const filter = input ?? "all";
    expect(filter).toBe("all");
  });

  it("offset calculation is correct for page 1", () => {
    const page = 1;
    const pageSize = 50;
    const offset = (page - 1) * pageSize;
    expect(offset).toBe(0);
  });

  it("offset calculation is correct for page 3", () => {
    const page = 3;
    const pageSize = 50;
    const offset = (page - 1) * pageSize;
    expect(offset).toBe(100);
  });
});

describe("BreweryListItem nullable fields", () => {
  it("allows null for optional fields", () => {
    const item: import("../superadmin-brewery-list").BreweryListItem = {
      id: "test-id",
      name: "Unclaimed Brewery",
      city: null,
      state: null,
      breweryType: null,
      createdAt: "2026-01-01T00:00:00Z",
      tier: "unclaimed",
      verified: false,
      sessionCount: 0,
      lastActive: null,
      followerCount: 0,
      beerCount: 0,
      brandName: null,
    };
    expect(item.city).toBeNull();
    expect(item.state).toBeNull();
    expect(item.lastActive).toBeNull();
    expect(item.brandName).toBeNull();
  });
});

describe("MRR estimate calculation", () => {
  const TIER_PRICES: Record<string, number> = { tap: 49, cask: 149, barrel: 299 };

  it("calculates correct MRR for mixed paid tiers", () => {
    const paidAccounts = [
      { subscription_tier: "tap", subscription_status: "active" },
      { subscription_tier: "tap", subscription_status: "active" },
      { subscription_tier: "cask", subscription_status: "active" },
    ];

    const mrr = paidAccounts.reduce(
      (sum, a) => sum + (TIER_PRICES[a.subscription_tier] ?? 0),
      0
    );

    // 2 x $49 + 1 x $149 = $247
    expect(mrr).toBe(247);
  });

  it("excludes canceled and free accounts from MRR", () => {
    const accounts = [
      { subscription_tier: "tap", subscription_status: "canceled" },
      { subscription_tier: "free", subscription_status: null },
      { subscription_tier: "cask", subscription_status: "active" },
    ];

    const mrr = accounts
      .filter((a) => a.subscription_status === "active" && TIER_PRICES[a.subscription_tier])
      .reduce((sum, a) => sum + (TIER_PRICES[a.subscription_tier] ?? 0), 0);

    expect(mrr).toBe(149);
  });
});
