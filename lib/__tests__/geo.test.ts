import { describe, it, expect } from "vitest";
import { haversineDistance, formatDistance } from "@/lib/geo";
import { groupNearbyByBrand } from "@/components/session/CheckinEntryDrawer";

// ─── haversineDistance ────────────────────────────────────────────────────────

describe("haversineDistance", () => {
  it("returns 0 for the same point", () => {
    expect(haversineDistance(35.2271, -80.8431, 35.2271, -80.8431)).toBe(0);
  });

  it("calculates known distance: Charlotte NC to Asheville NC (~100 miles)", () => {
    const distance = haversineDistance(35.2271, -80.8431, 35.5951, -82.5515);
    expect(distance).toBeGreaterThan(95);
    expect(distance).toBeLessThan(105);
  });

  it("calculates known distance: NYC to LA (~2445 miles)", () => {
    const distance = haversineDistance(40.7128, -74.006, 34.0522, -118.2437);
    expect(distance).toBeGreaterThan(2400);
    expect(distance).toBeLessThan(2500);
  });

  it("handles negative coordinates (southern hemisphere)", () => {
    // Sydney to Melbourne (~553 miles)
    const distance = haversineDistance(-33.8688, 151.2093, -37.8136, 144.9631);
    expect(distance).toBeGreaterThan(400);
    expect(distance).toBeLessThan(600);
  });

  it("handles very close points", () => {
    // Two points ~0.07 miles apart
    const distance = haversineDistance(35.2271, -80.8431, 35.228, -80.8431);
    expect(distance).toBeGreaterThan(0);
    expect(distance).toBeLessThan(0.1);
  });
});

// ─── formatDistance ──────────────────────────────────────────────────────────

describe("formatDistance", () => {
  it('returns "Nearby" for distances < 0.1 miles', () => {
    expect(formatDistance(0.05)).toBe("Nearby");
    expect(formatDistance(0.09)).toBe("Nearby");
  });

  it("returns X.X mi for distances < 10 miles", () => {
    expect(formatDistance(0.3)).toBe("0.3 mi");
    expect(formatDistance(5.678)).toBe("5.7 mi");
    expect(formatDistance(9.99)).toBe("10.0 mi");
  });

  it("returns rounded miles for distances >= 10", () => {
    expect(formatDistance(10.4)).toBe("10 mi");
    expect(formatDistance(25.6)).toBe("26 mi");
    expect(formatDistance(100.2)).toBe("100 mi");
  });
});

// ─── groupNearbyByBrand ─────────────────────────────────────────────────────

describe("groupNearbyByBrand", () => {
  const makeBrewery = (id: string, name: string, brandId?: string, brand?: any) => ({
    id,
    name,
    brand_id: brandId || null,
    brand: brand || null,
    city: "Charlotte",
    state: "NC",
    latitude: 35.2,
    longitude: -80.8,
  } as any);

  it("returns empty array for no breweries", () => {
    expect(groupNearbyByBrand([])).toEqual([]);
  });

  it("returns independent breweries unchanged", () => {
    const breweries = [
      makeBrewery("1", "Brewery A"),
      makeBrewery("2", "Brewery B"),
    ];
    expect(groupNearbyByBrand(breweries)).toEqual(breweries);
  });

  it("groups brand locations together, before independent", () => {
    const brand = { id: "brand-1", name: "Pint & Pixel", slug: "pint-and-pixel" };
    const breweries = [
      makeBrewery("1", "Independent One"),
      makeBrewery("2", "P&P South End", "brand-1", brand),
      makeBrewery("3", "Independent Two"),
      makeBrewery("4", "P&P NoDa", "brand-1", brand),
    ];
    const result = groupNearbyByBrand(breweries);
    expect(result[0].id).toBe("2"); // P&P South End (first branded)
    expect(result[1].id).toBe("4"); // P&P NoDa (second branded)
    expect(result[2].id).toBe("1"); // Independent One
    expect(result[3].id).toBe("3"); // Independent Two
  });

  it("groups multiple brands separately", () => {
    const brandA = { id: "a", name: "Brand A", slug: "a" };
    const brandB = { id: "b", name: "Brand B", slug: "b" };
    const breweries = [
      makeBrewery("1", "A-Loc1", "a", brandA),
      makeBrewery("2", "B-Loc1", "b", brandB),
      makeBrewery("3", "A-Loc2", "a", brandA),
    ];
    const result = groupNearbyByBrand(breweries);
    // Brand A group first (appeared first), then Brand B
    expect(result[0].id).toBe("1"); // A-Loc1
    expect(result[1].id).toBe("3"); // A-Loc2
    expect(result[2].id).toBe("2"); // B-Loc1
  });

  it("handles all branded breweries", () => {
    const brand = { id: "x", name: "X", slug: "x" };
    const breweries = [
      makeBrewery("1", "Loc1", "x", brand),
      makeBrewery("2", "Loc2", "x", brand),
    ];
    const result = groupNearbyByBrand(breweries);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("1");
    expect(result[1].id).toBe("2");
  });
});
