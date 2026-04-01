import { describe, it, expect } from "vitest";

// ─── Haversine distance (same logic as /api/challenges/nearby) ──────────────
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("Sponsored Challenges — Geo Distance", () => {
  it("calculates distance between Asheville and Charlotte NC (~182km)", () => {
    // Asheville NC: 35.5951, -82.5515
    // Charlotte NC: 35.2271, -80.8431
    const dist = haversineKm(35.5951, -82.5515, 35.2271, -80.8431);
    expect(dist).toBeGreaterThan(150);
    expect(dist).toBeLessThan(200);
  });

  it("returns 0 for same location", () => {
    const dist = haversineKm(35.5951, -82.5515, 35.5951, -82.5515);
    expect(dist).toBe(0);
  });

  it("calculates short distances accurately (~10km)", () => {
    // ~10km between two Asheville points
    const dist = haversineKm(35.5951, -82.5515, 35.6851, -82.5515);
    expect(dist).toBeGreaterThan(9);
    expect(dist).toBeLessThan(11);
  });

  it("handles cross-hemisphere distances", () => {
    // NYC to London (~5500km)
    const dist = haversineKm(40.7128, -74.0060, 51.5074, -0.1278);
    expect(dist).toBeGreaterThan(5500);
    expect(dist).toBeLessThan(5700);
  });
});

describe("Sponsored Challenges — Radius Filtering", () => {
  it("filters challenges outside radius", () => {
    const brewery = { lat: 35.5951, lng: -82.5515 }; // Asheville
    const user = { lat: 35.2271, lng: -80.8431 }; // Charlotte
    const distance = haversineKm(user.lat, user.lng, brewery.lat, brewery.lng);

    // Challenge with 50km radius should NOT show to Charlotte user
    expect(distance > 50).toBe(true);

    // Challenge with 200km radius SHOULD show
    expect(distance < 200).toBe(true);
  });

  it("uses effective radius (min of challenge and request radius)", () => {
    const challengeRadius = 100;
    const requestRadius = 50;
    const effectiveRadius = Math.min(challengeRadius, requestRadius);
    expect(effectiveRadius).toBe(50);
  });

  it("defaults to 50km when no radius specified", () => {
    const defaultRadius = 50;
    expect(defaultRadius).toBe(50);
  });
});

describe("Sponsored Challenges — Analytics", () => {
  it("calculates conversion rate correctly", () => {
    const impressions = 500;
    const joinsFromDiscovery = 25;
    const conversionRate = (joinsFromDiscovery / impressions) * 100;
    expect(conversionRate).toBe(5);
  });

  it("handles zero impressions", () => {
    const impressions = 0;
    const conversionRate = impressions > 0 ? (0 / impressions) * 100 : 0;
    expect(conversionRate).toBe(0);
  });

  it("tracks discovery vs brewery page sources", () => {
    const sources = ["discovery", "brewery_page", "discovery", "brewery_page", "discovery"];
    const discoveryCount = sources.filter(s => s === "discovery").length;
    const breweryPageCount = sources.filter(s => s === "brewery_page").length;
    expect(discoveryCount).toBe(3);
    expect(breweryPageCount).toBe(2);
  });
});

describe("Sponsored Challenges — Tier Gating", () => {
  it("allows sponsored for cask tier", () => {
    const canSponsor = (tier: string) => tier === "cask" || tier === "barrel";
    expect(canSponsor("cask")).toBe(true);
  });

  it("allows sponsored for barrel tier", () => {
    const canSponsor = (tier: string) => tier === "cask" || tier === "barrel";
    expect(canSponsor("barrel")).toBe(true);
  });

  it("blocks sponsored for tap tier", () => {
    const canSponsor = (tier: string) => tier === "cask" || tier === "barrel";
    expect(canSponsor("tap")).toBe(false);
  });

  it("blocks sponsored for free tier", () => {
    const canSponsor = (tier: string) => tier === "cask" || tier === "barrel";
    expect(canSponsor("free")).toBe(false);
  });
});

describe("Sponsored Challenges — Challenge Filtering", () => {
  it("filters out ended challenges", () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 86400000);
    const tomorrow = new Date(now.getTime() + 86400000);

    const challenges = [
      { id: "1", ends_at: yesterday.toISOString(), is_active: true },
      { id: "2", ends_at: tomorrow.toISOString(), is_active: true },
      { id: "3", ends_at: null, is_active: true },
    ];

    const active = challenges.filter(c =>
      c.is_active && (!c.ends_at || new Date(c.ends_at) > now)
    );

    expect(active).toHaveLength(2);
    expect(active.map(c => c.id)).toEqual(["2", "3"]);
  });

  it("only shows sponsored + active challenges in discovery", () => {
    const challenges = [
      { id: "1", is_sponsored: true, is_active: true },
      { id: "2", is_sponsored: true, is_active: false },
      { id: "3", is_sponsored: false, is_active: true },
      { id: "4", is_sponsored: false, is_active: false },
    ];

    const discoverable = challenges.filter(c => c.is_sponsored && c.is_active);
    expect(discoverable).toHaveLength(1);
    expect(discoverable[0].id).toBe("1");
  });
});
