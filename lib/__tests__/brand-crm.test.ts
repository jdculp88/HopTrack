import { describe, it, expect } from "vitest";
import {
  buildBrandCustomerList,
  buildBrandCustomerProfile,
  findRegularsAtOtherLocations,
} from "../brand-crm";

// ─── Test Data Factories ────────────────────────────────────────────────────

function makeVisit(userId: string, breweryId: string, visits: number) {
  return {
    user_id: userId,
    brewery_id: breweryId,
    total_visits: visits,
    unique_beers_tried: visits * 2,
    first_visit_at: "2026-01-01T12:00:00Z",
    last_visit_at: "2026-03-15T18:00:00Z",
  };
}

function makeProfile(id: string, name: string) {
  return { id, display_name: name, username: name.toLowerCase().replace(/\s/g, ""), avatar_url: null };
}

function makeSession(id: string, breweryId: string, date: string) {
  return { id, brewery_id: breweryId, started_at: date, ended_at: date };
}

function makeBeerLog(beerId: string, breweryId: string, name: string, style: string, rating = 0) {
  return { beer_id: beerId, brewery_id: breweryId, beer_name: name, beer_style: style, rating, quantity: 1 };
}

const LOC_A = "brewery-a";
const LOC_B = "brewery-b";
const LOC_C = "brewery-c";
const locationMap = new Map([
  [LOC_A, "Downtown Taproom"],
  [LOC_B, "Eastside Brewery"],
  [LOC_C, "Airport Location"],
]);

// ─── buildBrandCustomerList ─────────────────────────────────────────────────

describe("buildBrandCustomerList", () => {
  it("aggregates visits across multiple locations for same user", () => {
    const visits = [
      makeVisit("user-1", LOC_A, 5),
      makeVisit("user-1", LOC_B, 3),
    ];
    const profiles = [makeProfile("user-1", "Alice")];

    const result = buildBrandCustomerList(visits, profiles, locationMap);
    expect(result).toHaveLength(1);
    expect(result[0].totalVisits).toBe(8); // 5 + 3
    expect(result[0].locationsVisited).toBe(2);
  });

  it("sets isCrossLocation true when user visited 2+ locations", () => {
    const visits = [
      makeVisit("user-1", LOC_A, 3),
      makeVisit("user-1", LOC_B, 2),
    ];
    const profiles = [makeProfile("user-1", "Alice")];

    const result = buildBrandCustomerList(visits, profiles, locationMap);
    expect(result[0].isCrossLocation).toBe(true);
  });

  it("sets isCrossLocation false for single-location users", () => {
    const visits = [makeVisit("user-1", LOC_A, 10)];
    const profiles = [makeProfile("user-1", "Alice")];

    const result = buildBrandCustomerList(visits, profiles, locationMap);
    expect(result[0].isCrossLocation).toBe(false);
  });

  it("computes segment from total brand visits, not per-location", () => {
    // 3 visits at A + 3 visits at B = 6 total → "power" (5-9)
    const visits = [
      makeVisit("user-1", LOC_A, 3),
      makeVisit("user-1", LOC_B, 3),
    ];
    const profiles = [makeProfile("user-1", "Alice")];

    const result = buildBrandCustomerList(visits, profiles, locationMap);
    expect(result[0].segment).toBe("power");
    expect(result[0].totalVisits).toBe(6);
  });

  it("handles empty input gracefully", () => {
    const result = buildBrandCustomerList([], [], locationMap);
    expect(result).toEqual([]);
  });

  it("populates locationNames from the location map", () => {
    const visits = [
      makeVisit("user-1", LOC_A, 2),
      makeVisit("user-1", LOC_B, 1),
    ];
    const profiles = [makeProfile("user-1", "Alice")];

    const result = buildBrandCustomerList(visits, profiles, locationMap);
    expect(result[0].locationNames).toContain("Downtown Taproom");
    expect(result[0].locationNames).toContain("Eastside Brewery");
  });
});

// ─── buildBrandCustomerProfile ──────────────────────────────────────────────

describe("buildBrandCustomerProfile", () => {
  it("builds location breakdown with correct per-location stats", () => {
    const profile = makeProfile("user-1", "Alice");
    const sessions = [
      makeSession("s1", LOC_A, "2026-03-01T12:00:00Z"),
      makeSession("s2", LOC_A, "2026-03-05T12:00:00Z"),
      makeSession("s3", LOC_B, "2026-03-10T12:00:00Z"),
    ];
    const beerLogs = [
      makeBeerLog("b1", LOC_A, "Hazy IPA", "IPA", 4),
      makeBeerLog("b2", LOC_A, "Hazy IPA", "IPA", 4.5),
      makeBeerLog("b3", LOC_B, "Stout Night", "Stout", 3.5),
    ];
    const breweryVisits = [
      makeVisit("user-1", LOC_A, 2),
      makeVisit("user-1", LOC_B, 1),
    ];

    const result = buildBrandCustomerProfile({
      profile,
      sessions,
      beerLogs,
      breweryVisits,
      brandLoyaltyCard: null,
      locationMap,
    });

    expect(result.locationBreakdown).toHaveLength(2);
    // Sorted by visits desc — LOC_A first
    expect(result.locationBreakdown[0].breweryName).toBe("Downtown Taproom");
    expect(result.locationBreakdown[0].visits).toBe(2);
    expect(result.locationBreakdown[0].beersLogged).toBe(2);
    expect(result.locationBreakdown[0].favoriteBeer).toBe("Hazy IPA");
    expect(result.locationBreakdown[1].breweryName).toBe("Eastside Brewery");
    expect(result.locationBreakdown[1].visits).toBe(1);
  });

  it("sorts journey timeline chronologically (newest first)", () => {
    const profile = makeProfile("user-1", "Alice");
    const sessions = [
      makeSession("s1", LOC_A, "2026-03-01T12:00:00Z"),
      makeSession("s2", LOC_B, "2026-03-15T12:00:00Z"),
      makeSession("s3", LOC_A, "2026-03-10T12:00:00Z"),
    ];

    const result = buildBrandCustomerProfile({
      profile,
      sessions,
      beerLogs: [],
      breweryVisits: [makeVisit("user-1", LOC_A, 2), makeVisit("user-1", LOC_B, 1)],
      brandLoyaltyCard: null,
      locationMap,
    });

    expect(result.journeyTimeline[0].startedAt).toBe("2026-03-15T12:00:00Z");
    expect(result.journeyTimeline[1].startedAt).toBe("2026-03-10T12:00:00Z");
    expect(result.journeyTimeline[2].startedAt).toBe("2026-03-01T12:00:00Z");
  });

  it("aggregates top styles across all locations", () => {
    const profile = makeProfile("user-1", "Alice");
    const sessions = [
      makeSession("s1", LOC_A, "2026-03-01T12:00:00Z"),
      makeSession("s2", LOC_B, "2026-03-05T12:00:00Z"),
    ];
    const beerLogs = [
      makeBeerLog("b1", LOC_A, "Hazy", "IPA"),
      makeBeerLog("b2", LOC_A, "Hazy", "IPA"),
      makeBeerLog("b3", LOC_B, "Dark One", "Stout"),
    ];

    const result = buildBrandCustomerProfile({
      profile,
      sessions,
      beerLogs,
      breweryVisits: [makeVisit("user-1", LOC_A, 1), makeVisit("user-1", LOC_B, 1)],
      brandLoyaltyCard: null,
      locationMap,
    });

    expect(result.topStyles[0].style).toBe("IPA");
    expect(result.topStyles[0].count).toBe(2);
    expect(result.topStyles[1].style).toBe("Stout");
    expect(result.topStyles[1].count).toBe(1);
  });

  it("includes brand loyalty card data when present", () => {
    const profile = makeProfile("user-1", "Alice");
    const sessions = [makeSession("s1", LOC_A, "2026-03-01T12:00:00Z")];

    const result = buildBrandCustomerProfile({
      profile,
      sessions,
      beerLogs: [],
      breweryVisits: [makeVisit("user-1", LOC_A, 1)],
      brandLoyaltyCard: { stamps: 5, lifetime_stamps: 12, last_stamp_brewery_id: LOC_A },
      locationMap,
    });

    expect(result.brandLoyaltyCard).not.toBeNull();
    expect(result.brandLoyaltyCard!.stamps).toBe(5);
    expect(result.brandLoyaltyCard!.lifetimeStamps).toBe(12);
    expect(result.brandLoyaltyCard!.lastStampBreweryName).toBe("Downtown Taproom");
  });
});

// ─── findRegularsAtOtherLocations ───────────────────────────────────────────

describe("findRegularsAtOtherLocations", () => {
  it("identifies VIP at location A who has not visited location B", () => {
    const visits = [makeVisit("user-1", LOC_A, 12)]; // VIP at A, never visited B
    const profiles = [makeProfile("user-1", "Alice")];

    const result = findRegularsAtOtherLocations(visits, profiles, [LOC_A, LOC_B], locationMap);
    expect(result).toHaveLength(1);
    expect(result[0].userId).toBe("user-1");
    expect(result[0].strongLocations).toContain("Downtown Taproom");
    expect(result[0].missingLocations).toContain("Eastside Brewery");
  });

  it("does not include users who have visited all locations", () => {
    const visits = [
      makeVisit("user-1", LOC_A, 10),
      makeVisit("user-1", LOC_B, 5),
    ];
    const profiles = [makeProfile("user-1", "Alice")];

    const result = findRegularsAtOtherLocations(visits, profiles, [LOC_A, LOC_B], locationMap);
    expect(result).toHaveLength(0);
  });

  it("does not include new/regular segment users (must be Power or VIP)", () => {
    // 3 visits at A = "regular" segment, not power/vip
    const visits = [makeVisit("user-1", LOC_A, 3)];
    const profiles = [makeProfile("user-1", "Alice")];

    const result = findRegularsAtOtherLocations(visits, profiles, [LOC_A, LOC_B], locationMap);
    expect(result).toHaveLength(0);
  });
});
