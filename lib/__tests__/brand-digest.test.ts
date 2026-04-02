// Brand digest stats tests — Casey + Reese, Sprint 130
// Tests calculateBrandDigestStats from lib/brand-digest.ts

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock createClient so the module can import without real Supabase
const mockCreateClient = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: (...args: any[]) => mockCreateClient(...args),
}));

/**
 * Build a mock supabase client with chainable query methods.
 * `responses` maps table names to their resolved data.
 * Tables with `single: true` resolve via `.single()`, others resolve as arrays.
 */
function mockSupabase(responses: Record<string, { data: any; single?: boolean }>) {
  const from = (table: string) => {
    const resp = responses[table] ?? { data: null };
    const chain: any = {
      select: () => chain,
      eq: () => chain,
      in: () => chain,
      gte: () => chain,
      lt: () => chain,
      order: () => chain,
      single: () => Promise.resolve({ data: resp.single ? resp.data : null, error: null }),
    };
    // For non-single queries that get awaited directly (Promise.all paths)
    chain.then = (resolve: any) =>
      resolve({ data: resp.single ? null : (resp.data ?? []), error: null });
    return chain;
  };
  return { from } as any;
}

describe("calculateBrandDigestStats", () => {
  beforeEach(() => {
    vi.resetModules();
    mockCreateClient.mockReset();
  });

  it("is exported as a function", async () => {
    mockCreateClient.mockResolvedValue(mockSupabase({}));
    const mod = await import("@/lib/brand-digest");
    expect(typeof mod.calculateBrandDigestStats).toBe("function");
  });

  it("returns brandName from the database", async () => {
    const supabase = mockSupabase({
      brewery_brands: { data: { name: "Pint & Pixel" }, single: true },
      breweries: { data: [] },
    });
    mockCreateClient.mockResolvedValue(supabase);

    const { calculateBrandDigestStats } = await import("@/lib/brand-digest");
    const result = await calculateBrandDigestStats("brand-1");
    expect(result.brandName).toBe("Pint & Pixel");
  });

  it("returns zero stats when brand has no locations", async () => {
    const supabase = mockSupabase({
      brewery_brands: { data: { name: "Empty Brand" }, single: true },
      breweries: { data: [] },
    });
    mockCreateClient.mockResolvedValue(supabase);

    const { calculateBrandDigestStats } = await import("@/lib/brand-digest");
    const result = await calculateBrandDigestStats("brand-empty");

    expect(result.stats.totalVisits).toBe(0);
    expect(result.stats.visitsTrend).toBe(0);
    expect(result.stats.totalUniqueVisitors).toBe(0);
    expect(result.stats.totalBeersLogged).toBe(0);
    expect(result.stats.crossLocationVisitors).toBe(0);
    expect(result.stats.topPerformer).toBeNull();
    expect(result.stats.locations).toEqual([]);
  });

  it("aggregates visits across multiple locations correctly", async () => {
    const supabase = {
      from: (table: string) => {
        const chain: any = {
          select: () => chain,
          eq: () => chain,
          in: () => chain,
          gte: () => chain,
          lt: () => chain,
          order: () => chain,
          single: () => {
            if (table === "brewery_brands") {
              return Promise.resolve({ data: { name: "Multi Tap" }, error: null });
            }
            return Promise.resolve({ data: null, error: null });
          },
        };
        if (table === "breweries") {
          chain.then = (resolve: any) =>
            resolve({ data: [{ id: "loc-1", name: "Downtown" }, { id: "loc-2", name: "Uptown" }], error: null });
        } else if (table === "sessions") {
          // Return sessions for both this-week and last-week queries
          chain.then = (resolve: any) =>
            resolve({
              data: [
                { id: "s1", user_id: "u1", brewery_id: "loc-1" },
                { id: "s2", user_id: "u2", brewery_id: "loc-1" },
                { id: "s3", user_id: "u3", brewery_id: "loc-2" },
              ],
              error: null,
            });
        } else if (table === "beer_logs") {
          chain.then = (resolve: any) =>
            resolve({ data: [], error: null });
        } else {
          chain.then = (resolve: any) => resolve({ data: [], error: null });
        }
        return chain;
      },
    } as any;
    mockCreateClient.mockResolvedValue(supabase);

    const { calculateBrandDigestStats } = await import("@/lib/brand-digest");
    const result = await calculateBrandDigestStats("brand-multi");

    // 3 sessions this week (same data returned for both week queries in this mock)
    expect(result.stats.totalVisits).toBe(3);
    expect(result.stats.totalUniqueVisitors).toBe(3);
  });

  it("calculates positive visitsTrend percentage (WoW)", async () => {
    let callIndex = 0;
    const supabase = {
      from: (table: string) => {
        const chain: any = {
          select: () => chain,
          eq: () => chain,
          in: () => chain,
          gte: () => chain,
          lt: () => chain,
          order: () => chain,
          single: () => {
            if (table === "brewery_brands") {
              return Promise.resolve({ data: { name: "Trending Up" }, error: null });
            }
            return Promise.resolve({ data: null, error: null });
          },
        };
        if (table === "breweries") {
          chain.then = (resolve: any) =>
            resolve({ data: [{ id: "loc-1", name: "Main" }], error: null });
        } else if (table === "sessions") {
          callIndex++;
          if (callIndex === 1) {
            // This week: 10 visits
            chain.then = (resolve: any) =>
              resolve({
                data: Array.from({ length: 10 }, (_, i) => ({
                  id: `s${i}`, user_id: `u${i}`, brewery_id: "loc-1",
                })),
                error: null,
              });
          } else {
            // Last week: 5 visits
            chain.then = (resolve: any) =>
              resolve({
                data: Array.from({ length: 5 }, (_, i) => ({
                  id: `p${i}`, user_id: `u${i}`, brewery_id: "loc-1",
                })),
                error: null,
              });
          }
        } else if (table === "beer_logs") {
          chain.then = (resolve: any) => resolve({ data: [], error: null });
        } else {
          chain.then = (resolve: any) => resolve({ data: [], error: null });
        }
        return chain;
      },
    } as any;
    mockCreateClient.mockResolvedValue(supabase);

    const { calculateBrandDigestStats } = await import("@/lib/brand-digest");
    const result = await calculateBrandDigestStats("brand-up");

    // (10 - 5) / 5 * 100 = 100%
    expect(result.stats.visitsTrend).toBe(100);
  });

  it("calculates negative visitsTrend percentage", async () => {
    let callIndex = 0;
    const supabase = {
      from: (table: string) => {
        const chain: any = {
          select: () => chain,
          eq: () => chain,
          in: () => chain,
          gte: () => chain,
          lt: () => chain,
          order: () => chain,
          single: () => {
            if (table === "brewery_brands") {
              return Promise.resolve({ data: { name: "Trending Down" }, error: null });
            }
            return Promise.resolve({ data: null, error: null });
          },
        };
        if (table === "breweries") {
          chain.then = (resolve: any) =>
            resolve({ data: [{ id: "loc-1", name: "Main" }], error: null });
        } else if (table === "sessions") {
          callIndex++;
          if (callIndex === 1) {
            // This week: 3 visits
            chain.then = (resolve: any) =>
              resolve({
                data: Array.from({ length: 3 }, (_, i) => ({
                  id: `s${i}`, user_id: `u${i}`, brewery_id: "loc-1",
                })),
                error: null,
              });
          } else {
            // Last week: 10 visits
            chain.then = (resolve: any) =>
              resolve({
                data: Array.from({ length: 10 }, (_, i) => ({
                  id: `p${i}`, user_id: `u${i}`, brewery_id: "loc-1",
                })),
                error: null,
              });
          }
        } else if (table === "beer_logs") {
          chain.then = (resolve: any) => resolve({ data: [], error: null });
        } else {
          chain.then = (resolve: any) => resolve({ data: [], error: null });
        }
        return chain;
      },
    } as any;
    mockCreateClient.mockResolvedValue(supabase);

    const { calculateBrandDigestStats } = await import("@/lib/brand-digest");
    const result = await calculateBrandDigestStats("brand-down");

    // (3 - 10) / 10 * 100 = -70%
    expect(result.stats.visitsTrend).toBe(-70);
  });

  it("handles zero-base trend (divide by zero protection)", async () => {
    let callIndex = 0;
    const supabase = {
      from: (table: string) => {
        const chain: any = {
          select: () => chain,
          eq: () => chain,
          in: () => chain,
          gte: () => chain,
          lt: () => chain,
          order: () => chain,
          single: () => {
            if (table === "brewery_brands") {
              return Promise.resolve({ data: { name: "New Brand" }, error: null });
            }
            return Promise.resolve({ data: null, error: null });
          },
        };
        if (table === "breweries") {
          chain.then = (resolve: any) =>
            resolve({ data: [{ id: "loc-1", name: "Main" }], error: null });
        } else if (table === "sessions") {
          callIndex++;
          if (callIndex === 1) {
            // This week: 5 visits
            chain.then = (resolve: any) =>
              resolve({
                data: Array.from({ length: 5 }, (_, i) => ({
                  id: `s${i}`, user_id: `u${i}`, brewery_id: "loc-1",
                })),
                error: null,
              });
          } else {
            // Last week: 0 visits
            chain.then = (resolve: any) =>
              resolve({ data: [], error: null });
          }
        } else if (table === "beer_logs") {
          chain.then = (resolve: any) => resolve({ data: [], error: null });
        } else {
          chain.then = (resolve: any) => resolve({ data: [], error: null });
        }
        return chain;
      },
    } as any;
    mockCreateClient.mockResolvedValue(supabase);

    const { calculateBrandDigestStats } = await import("@/lib/brand-digest");
    const result = await calculateBrandDigestStats("brand-new");

    // lastWeekVisits === 0, totalVisits > 0 → trend = 100
    expect(result.stats.visitsTrend).toBe(100);
  });

  it("identifies cross-location visitors (users visiting 2+ locations)", async () => {
    let callIndex = 0;
    const supabase = {
      from: (table: string) => {
        const chain: any = {
          select: () => chain,
          eq: () => chain,
          in: () => chain,
          gte: () => chain,
          lt: () => chain,
          order: () => chain,
          single: () => {
            if (table === "brewery_brands") {
              return Promise.resolve({ data: { name: "Cross Visit Brand" }, error: null });
            }
            return Promise.resolve({ data: null, error: null });
          },
        };
        if (table === "breweries") {
          chain.then = (resolve: any) =>
            resolve({ data: [{ id: "loc-1", name: "Downtown" }, { id: "loc-2", name: "Uptown" }], error: null });
        } else if (table === "sessions") {
          callIndex++;
          if (callIndex === 1) {
            // This week: user-1 visits both locations, user-2 visits only loc-1
            chain.then = (resolve: any) =>
              resolve({
                data: [
                  { id: "s1", user_id: "user-1", brewery_id: "loc-1" },
                  { id: "s2", user_id: "user-1", brewery_id: "loc-2" },
                  { id: "s3", user_id: "user-2", brewery_id: "loc-1" },
                ],
                error: null,
              });
          } else {
            chain.then = (resolve: any) => resolve({ data: [], error: null });
          }
        } else if (table === "beer_logs") {
          chain.then = (resolve: any) => resolve({ data: [], error: null });
        } else {
          chain.then = (resolve: any) => resolve({ data: [], error: null });
        }
        return chain;
      },
    } as any;
    mockCreateClient.mockResolvedValue(supabase);

    const { calculateBrandDigestStats } = await import("@/lib/brand-digest");
    const result = await calculateBrandDigestStats("brand-cross");

    // user-1 visited 2 locations, user-2 visited 1
    expect(result.stats.crossLocationVisitors).toBe(1);
  });

  it("identifies topPerformer as location with most visits", async () => {
    let callIndex = 0;
    const supabase = {
      from: (table: string) => {
        const chain: any = {
          select: () => chain,
          eq: () => chain,
          in: () => chain,
          gte: () => chain,
          lt: () => chain,
          order: () => chain,
          single: () => {
            if (table === "brewery_brands") {
              return Promise.resolve({ data: { name: "Top Brand" }, error: null });
            }
            return Promise.resolve({ data: null, error: null });
          },
        };
        if (table === "breweries") {
          chain.then = (resolve: any) =>
            resolve({ data: [{ id: "loc-1", name: "Slow Spot" }, { id: "loc-2", name: "Hot Spot" }], error: null });
        } else if (table === "sessions") {
          callIndex++;
          if (callIndex === 1) {
            // This week: loc-2 has 3 visits, loc-1 has 1
            chain.then = (resolve: any) =>
              resolve({
                data: [
                  { id: "s1", user_id: "u1", brewery_id: "loc-1" },
                  { id: "s2", user_id: "u2", brewery_id: "loc-2" },
                  { id: "s3", user_id: "u3", brewery_id: "loc-2" },
                  { id: "s4", user_id: "u4", brewery_id: "loc-2" },
                ],
                error: null,
              });
          } else {
            chain.then = (resolve: any) => resolve({ data: [], error: null });
          }
        } else if (table === "beer_logs") {
          chain.then = (resolve: any) => resolve({ data: [], error: null });
        } else {
          chain.then = (resolve: any) => resolve({ data: [], error: null });
        }
        return chain;
      },
    } as any;
    mockCreateClient.mockResolvedValue(supabase);

    const { calculateBrandDigestStats } = await import("@/lib/brand-digest");
    const result = await calculateBrandDigestStats("brand-top");

    expect(result.stats.topPerformer).toEqual({ name: "Hot Spot", visits: 3 });
  });

  it("per-location breakdown includes location names", async () => {
    let callIndex = 0;
    const supabase = {
      from: (table: string) => {
        const chain: any = {
          select: () => chain,
          eq: () => chain,
          in: () => chain,
          gte: () => chain,
          lt: () => chain,
          order: () => chain,
          single: () => {
            if (table === "brewery_brands") {
              return Promise.resolve({ data: { name: "Named Brand" }, error: null });
            }
            return Promise.resolve({ data: null, error: null });
          },
        };
        if (table === "breweries") {
          chain.then = (resolve: any) =>
            resolve({ data: [{ id: "loc-1", name: "South End" }, { id: "loc-2", name: "NoDa" }], error: null });
        } else if (table === "sessions") {
          callIndex++;
          if (callIndex === 1) {
            chain.then = (resolve: any) =>
              resolve({
                data: [
                  { id: "s1", user_id: "u1", brewery_id: "loc-1" },
                  { id: "s2", user_id: "u2", brewery_id: "loc-2" },
                ],
                error: null,
              });
          } else {
            chain.then = (resolve: any) => resolve({ data: [], error: null });
          }
        } else if (table === "beer_logs") {
          chain.then = (resolve: any) => resolve({ data: [], error: null });
        } else {
          chain.then = (resolve: any) => resolve({ data: [], error: null });
        }
        return chain;
      },
    } as any;
    mockCreateClient.mockResolvedValue(supabase);

    const { calculateBrandDigestStats } = await import("@/lib/brand-digest");
    const result = await calculateBrandDigestStats("brand-named");

    const names = result.stats.locations.map((l) => l.name);
    expect(names).toContain("South End");
    expect(names).toContain("NoDa");
    expect(result.stats.locations.length).toBe(2);
  });
});
