// HopRoute Smart Concierge tests — Sprint 178
// Tests for computeRouteMetrics, computeTasteFingerprint, scoreBreweryRelevance
import { describe, it, expect } from "vitest";
import {
  computeRouteMetrics,
  computeTasteFingerprint,
  scoreBreweryRelevance,
  type RouteMetricsStop,
  type BeerLogWithSensory,
  type BeerReviewRow,
  type BreweryForScoring,
  type ScoringUserContext,
} from "@/lib/hop-route";
import type { PersonalityResult } from "@/lib/personality";

// ─── Helpers ──────────────────────────────────────────────────────────────

function makePersonality(overrides: Partial<PersonalityResult> = {}): PersonalityResult {
  return {
    code: "EBHJ",
    archetype: "The Hop Hunter",
    emoji: "🎯",
    tagline: "Always chasing the next hop bomb",
    axes: { variety: "E", hopIntensity: "B", timing: "H", critique: "J" },
    signals: {
      varietyScore: 0.4, hopShare: 0.5, uniquenessRatio: 0.7,
      avgRating: 3.6, ratingStdDev: 1.0, ratedCount: 30,
      totalBeers: 50, uniqueStyles: 15, uniqueBeers: 35,
    },
    hasEnoughData: true,
    ...overrides,
  };
}

function makeScoringCtx(overrides: Partial<ScoringUserContext> = {}): ScoringUserContext {
  return {
    personality: makePersonality(),
    tasteFingerprintNotes: ["Citrus", "Tropical", "Pine", "Juicy", "Bitter", "Hoppy", "Dry", "Crisp"],
    wishlistBeerIds: new Set<string>(),
    visitHistory: new Map(),
    vibeFilters: [],
    ...overrides,
  };
}

// ─── computeRouteMetrics ────────────────────────────────────────────────────

describe("computeRouteMetrics", () => {
  it("computes distances between consecutive stops", () => {
    // Asheville, NC area — ~0.3 mi apart
    const stops: RouteMetricsStop[] = [
      { brewery_id: "a", stop_order: 1, lat: 35.5946, lng: -82.5540 },
      { brewery_id: "b", stop_order: 2, lat: 35.5978, lng: -82.5510 },
      { brewery_id: "c", stop_order: 3, lat: 35.6010, lng: -82.5480 },
    ];

    const result = computeRouteMetrics(stops);

    expect(result.legs).toHaveLength(2);
    expect(result.legs[0].from_order).toBe(1);
    expect(result.legs[0].to_order).toBe(2);
    expect(result.legs[0].distance_miles).toBeGreaterThan(0);
    expect(result.legs[0].distance_miles).toBeLessThan(1);
    expect(result.legs[0].walk_minutes).toBeGreaterThan(0);
    expect(result.total_distance_miles).toBeGreaterThan(0);
    expect(result.avg_stop_distance_miles).toBeGreaterThan(0);
  });

  it("handles single stop (no legs)", () => {
    const stops: RouteMetricsStop[] = [
      { brewery_id: "a", stop_order: 1, lat: 35.5946, lng: -82.5540 },
    ];

    const result = computeRouteMetrics(stops);

    expect(result.legs).toHaveLength(0);
    expect(result.total_distance_miles).toBe(0);
    expect(result.avg_stop_distance_miles).toBe(0);
  });

  it("sorts stops by stop_order before computing", () => {
    const stops: RouteMetricsStop[] = [
      { brewery_id: "c", stop_order: 3, lat: 35.6010, lng: -82.5480 },
      { brewery_id: "a", stop_order: 1, lat: 35.5946, lng: -82.5540 },
      { brewery_id: "b", stop_order: 2, lat: 35.5978, lng: -82.5510 },
    ];

    const result = computeRouteMetrics(stops);

    expect(result.legs[0].from_order).toBe(1);
    expect(result.legs[0].to_order).toBe(2);
    expect(result.legs[1].from_order).toBe(2);
    expect(result.legs[1].to_order).toBe(3);
  });

  it("estimates walking time at ~3 mph", () => {
    // Two stops roughly 1 mile apart
    const stops: RouteMetricsStop[] = [
      { brewery_id: "a", stop_order: 1, lat: 35.5946, lng: -82.5540 },
      { brewery_id: "b", stop_order: 2, lat: 35.6090, lng: -82.5540 }, // ~1 mi north
    ];

    const result = computeRouteMetrics(stops);

    // 1 mile at 3 mph = ~20 min
    expect(result.legs[0].walk_minutes).toBeGreaterThanOrEqual(15);
    expect(result.legs[0].walk_minutes).toBeLessThanOrEqual(25);
  });

  it("handles empty stops array", () => {
    const result = computeRouteMetrics([]);

    expect(result.legs).toHaveLength(0);
    expect(result.total_distance_miles).toBe(0);
    expect(result.avg_stop_distance_miles).toBe(0);
  });

  it("rounds distances to 2 decimal places", () => {
    const stops: RouteMetricsStop[] = [
      { brewery_id: "a", stop_order: 1, lat: 35.5946, lng: -82.5540 },
      { brewery_id: "b", stop_order: 2, lat: 35.5950, lng: -82.5535 },
    ];

    const result = computeRouteMetrics(stops);
    const decimalPlaces = result.legs[0].distance_miles.toString().split(".")[1]?.length ?? 0;
    expect(decimalPlaces).toBeLessThanOrEqual(2);
  });
});

// ─── computeTasteFingerprint ────────────────────────────────────────────────

describe("computeTasteFingerprint", () => {
  const personality = makePersonality();

  it("extracts top styles from rated beer logs", () => {
    const logs: BeerLogWithSensory[] = [
      { rating: 4.5, beer: { style: "IPA", abv: 6.5, aroma_notes: ["Citrus"], taste_notes: ["Hoppy"], finish_notes: ["Bitter"] } },
      { rating: 4.0, beer: { style: "IPA", abv: 7.0, aroma_notes: ["Tropical"], taste_notes: ["Juicy"], finish_notes: ["Dry"] } },
      { rating: 3.8, beer: { style: "Stout", abv: 5.5, aroma_notes: ["Chocolate"], taste_notes: ["Roasty"], finish_notes: ["Smooth"] } },
    ];

    const result = computeTasteFingerprint(logs, [], personality);

    expect(result.topStyles.length).toBeGreaterThan(0);
    expect(result.topStyles[0].style).toBe("IPA");
    expect(result.topStyles[0].count).toBe(2);
  });

  it("computes sensory note frequency from liked beers (rating >= 3.5)", () => {
    const logs: BeerLogWithSensory[] = [
      { rating: 4.5, beer: { style: "IPA", abv: 6.5, aroma_notes: ["Citrus", "Pine"], taste_notes: ["Hoppy"], finish_notes: ["Bitter"] } },
      { rating: 4.0, beer: { style: "IPA", abv: 7.0, aroma_notes: ["Citrus", "Tropical"], taste_notes: ["Juicy"], finish_notes: ["Dry"] } },
      { rating: 2.0, beer: { style: "Lager", abv: 4.5, aroma_notes: ["Bread"], taste_notes: ["Crisp"], finish_notes: ["Clean"] } },
    ];

    const result = computeTasteFingerprint(logs, [], personality);

    // Citrus appears in 2 liked beers, Bread only in 1 unliked beer
    expect(result.topAromaNotes).toContain("Citrus");
    expect(result.topAromaNotes).not.toContain("Bread");
  });

  it("extracts flavor tags from reviews", () => {
    const reviews: BeerReviewRow[] = [
      { rating: 4.5, flavor_tags: ["Hoppy", "Citrusy", "Bitter"] },
      { rating: 4.0, flavor_tags: ["Hoppy", "Tropical"] },
    ];

    const result = computeTasteFingerprint([], reviews, personality);

    expect(result.topFlavorTags[0]).toBe("Hoppy");
  });

  it("computes ABV range from liked beers", () => {
    const logs: BeerLogWithSensory[] = [
      { rating: 4.5, beer: { style: "IPA", abv: 5.5, aroma_notes: [], taste_notes: [], finish_notes: [] } },
      { rating: 4.0, beer: { style: "DIPA", abv: 8.5, aroma_notes: [], taste_notes: [], finish_notes: [] } },
      { rating: 3.8, beer: { style: "Stout", abv: 6.0, aroma_notes: [], taste_notes: [], finish_notes: [] } },
    ];

    const result = computeTasteFingerprint(logs, [], personality);

    expect(result.abvRange.min).toBe(5.5);
    expect(result.abvRange.max).toBe(8.5);
    expect(result.abvRange.avg).toBeGreaterThan(6);
  });

  it("returns personality-derived fields", () => {
    const explorerPersonality = makePersonality({ axes: { variety: "E", hopIntensity: "B", timing: "H", critique: "J" } });
    const result = computeTasteFingerprint([], [], explorerPersonality);

    expect(result.explorationMode).toBe("variety");
    expect(result.intensityPreference).toBe("bold");
    expect(result.personalityCode).toBe("EBHJ");
    expect(result.personalityArchetype).toBe("The Hop Hunter");
  });

  it("handles Loyalist + Smooth personality", () => {
    const loyalist = makePersonality({
      code: "LSRO",
      archetype: "The Loyal Local",
      axes: { variety: "L", hopIntensity: "S", timing: "R", critique: "O" },
    });
    const result = computeTasteFingerprint([], [], loyalist);

    expect(result.explorationMode).toBe("reliable");
    expect(result.intensityPreference).toBe("smooth");
  });

  it("handles empty inputs gracefully", () => {
    const result = computeTasteFingerprint([], [], personality);

    expect(result.topStyles).toHaveLength(0);
    expect(result.topAromaNotes).toHaveLength(0);
    expect(result.abvRange).toEqual({ min: 0, max: 0, avg: 0 });
  });

  it("limits to top 5 notes per category", () => {
    const logs: BeerLogWithSensory[] = Array.from({ length: 10 }, (_, i) => ({
      rating: 4.0,
      beer: {
        style: "IPA",
        abv: 6.0,
        aroma_notes: [`Note${i}`, `Extra${i}`],
        taste_notes: [`Taste${i}`],
        finish_notes: [`Finish${i}`],
      },
    }));

    const result = computeTasteFingerprint(logs, [], personality);

    expect(result.topAromaNotes.length).toBeLessThanOrEqual(5);
    expect(result.topTasteNotes.length).toBeLessThanOrEqual(5);
    expect(result.topFinishNotes.length).toBeLessThanOrEqual(5);
  });
});

// ─── scoreBreweryRelevance ──────────────────────────────────────────────────

describe("scoreBreweryRelevance", () => {
  function makeBrewery(overrides: Partial<BreweryForScoring> = {}): BreweryForScoring {
    return {
      id: "brew-1",
      name: "Test Brewery",
      vibe_tags: [],
      on_tap_beer_ids: [],
      on_tap_sensory_notes: [],
      avg_tap_age_days: 5,
      recent_checkin_count: 0,
      ...overrides,
    };
  }

  it("returns 0-100 score", () => {
    const { score } = scoreBreweryRelevance(makeBrewery(), makeScoringCtx());
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("gives highest points for wishlist beer on tap", () => {
    const withWishlist = scoreBreweryRelevance(
      makeBrewery({ on_tap_beer_ids: ["beer-1", "beer-2"] }),
      makeScoringCtx({ wishlistBeerIds: new Set(["beer-1"]) }),
    );
    const withoutWishlist = scoreBreweryRelevance(
      makeBrewery({ on_tap_beer_ids: ["beer-1", "beer-2"] }),
      makeScoringCtx({ wishlistBeerIds: new Set() }),
    );

    expect(withWishlist.score).toBeGreaterThan(withoutWishlist.score);
    expect(withWishlist.reasons.some(r => r.includes("wishlisted"))).toBe(true);
  });

  it("scores taste overlap from sensory notes", () => {
    const highOverlap = scoreBreweryRelevance(
      makeBrewery({ on_tap_sensory_notes: ["Citrus", "Tropical", "Pine", "Juicy", "Hoppy", "Bitter"] }),
      makeScoringCtx({ tasteFingerprintNotes: ["Citrus", "Tropical", "Pine", "Juicy", "Bitter"] }),
    );
    const noOverlap = scoreBreweryRelevance(
      makeBrewery({ on_tap_sensory_notes: ["Chocolate", "Coffee", "Vanilla"] }),
      makeScoringCtx({ tasteFingerprintNotes: ["Citrus", "Tropical", "Pine"] }),
    );

    expect(highOverlap.score).toBeGreaterThan(noOverlap.score);
  });

  it("Explorer personality prefers unvisited breweries", () => {
    const explorerCtx = makeScoringCtx({
      personality: makePersonality({ axes: { variety: "E", hopIntensity: "B", timing: "H", critique: "J" } }),
      visitHistory: new Map(),
    });

    const newBrewery = scoreBreweryRelevance(makeBrewery({ id: "new-1" }), explorerCtx);

    const visitedCtx = makeScoringCtx({
      personality: makePersonality({ axes: { variety: "E", hopIntensity: "B", timing: "H", critique: "J" } }),
      visitHistory: new Map([["visited-1", { total_visits: 5, last_visit_at: "2026-04-01" }]]),
    });

    const visitedBrewery = scoreBreweryRelevance(makeBrewery({ id: "visited-1" }), visitedCtx);

    expect(newBrewery.score).toBeGreaterThan(visitedBrewery.score);
    expect(newBrewery.reasons.some(r => r.includes("New brewery"))).toBe(true);
  });

  it("Loyalist personality prefers revisited breweries", () => {
    const loyalistCtx = makeScoringCtx({
      personality: makePersonality({ axes: { variety: "L", hopIntensity: "S", timing: "R", critique: "O" } }),
      visitHistory: new Map([["fav-1", { total_visits: 5, last_visit_at: "2026-04-01" }]]),
    });

    const favBrewery = scoreBreweryRelevance(makeBrewery({ id: "fav-1" }), loyalistCtx);

    const newCtx = makeScoringCtx({
      personality: makePersonality({ axes: { variety: "L", hopIntensity: "S", timing: "R", critique: "O" } }),
      visitHistory: new Map(),
    });

    const newBrewery = scoreBreweryRelevance(makeBrewery({ id: "new-1" }), newCtx);

    expect(favBrewery.score).toBeGreaterThan(newBrewery.score);
    expect(favBrewery.reasons.some(r => r.includes("favorite"))).toBe(true);
  });

  it("scores vibe match correctly", () => {
    const vibeMatch = scoreBreweryRelevance(
      makeBrewery({ vibe_tags: ["outdoor", "dog-friendly", "food"] }),
      makeScoringCtx({ vibeFilters: ["outdoor", "dog-friendly"] }),
    );
    const noVibeMatch = scoreBreweryRelevance(
      makeBrewery({ vibe_tags: ["lively", "sports"] }),
      makeScoringCtx({ vibeFilters: ["outdoor", "dog-friendly"] }),
    );

    expect(vibeMatch.score).toBeGreaterThan(noVibeMatch.score);
  });

  it("fresh tap lists score higher than stale ones", () => {
    const fresh = scoreBreweryRelevance(
      makeBrewery({ avg_tap_age_days: 3 }),
      makeScoringCtx(),
    );
    const stale = scoreBreweryRelevance(
      makeBrewery({ avg_tap_age_days: 45 }),
      makeScoringCtx(),
    );

    expect(fresh.score).toBeGreaterThan(stale.score);
  });

  it("trending breweries get a boost", () => {
    const trending = scoreBreweryRelevance(
      makeBrewery({ recent_checkin_count: 20 }),
      makeScoringCtx(),
    );
    const quiet = scoreBreweryRelevance(
      makeBrewery({ recent_checkin_count: 0 }),
      makeScoringCtx(),
    );

    expect(trending.score).toBeGreaterThan(quiet.score);
  });

  it("caps score at 100", () => {
    // Stack all signals to max
    const maxed = scoreBreweryRelevance(
      makeBrewery({
        on_tap_beer_ids: ["w1", "w2", "w3"],
        on_tap_sensory_notes: ["Citrus", "Tropical", "Pine", "Juicy", "Bitter", "Hoppy", "Dry", "Crisp"],
        vibe_tags: ["outdoor", "dog-friendly", "food", "chill"],
        avg_tap_age_days: 2,
        recent_checkin_count: 50,
      }),
      makeScoringCtx({
        wishlistBeerIds: new Set(["w1", "w2", "w3"]),
        vibeFilters: ["outdoor", "dog-friendly", "food", "chill"],
      }),
    );

    expect(maxed.score).toBeLessThanOrEqual(100);
  });

  it("returns human-readable reasons", () => {
    const { reasons } = scoreBreweryRelevance(
      makeBrewery({
        on_tap_beer_ids: ["beer-1"],
        on_tap_sensory_notes: ["Citrus", "Tropical"],
        vibe_tags: ["outdoor"],
        recent_checkin_count: 10,
      }),
      makeScoringCtx({
        wishlistBeerIds: new Set(["beer-1"]),
        vibeFilters: ["outdoor"],
      }),
    );

    expect(reasons.length).toBeGreaterThan(0);
    expect(reasons.every(r => typeof r === "string")).toBe(true);
  });
});
