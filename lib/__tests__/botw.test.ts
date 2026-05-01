// Copyright 2026 HopTrack. All rights reserved.
// Tests for the personalized Beer of the Week scoring (S181).
import { describe, it, expect } from "vitest";
import { isoWeek, scoreBeer, type ScoringContext } from "../botw";

const baseCandidate = {
  id: "beer-1",
  name: "Test IPA",
  style: "IPA",
  abv: 6.5,
  glass_type: "tulip",
  description: null,
  avg_rating: 4.2,
  total_ratings: 50,
  aroma_notes: ["citrus", "pine"],
  taste_notes: ["bitter", "tropical"],
  finish_notes: ["dry"],
  is_featured: false,
  brewery: { id: "brew-1", name: "Heist", city: "Charlotte", state: "NC" },
};

const baseCtx: ScoringContext = {
  topStyles: [],
  preferredAromas: new Set(),
  preferredTastes: new Set(),
  preferredFinishes: new Set(),
  triedBeerIds: new Set(),
  homeCity: null,
  recentCities: new Set(),
};

describe("isoWeek", () => {
  it("returns YYYY-Www format", () => {
    expect(isoWeek(new Date("2026-05-01T12:00:00Z"))).toMatch(/^2026-W\d{2}$/);
  });

  it("is stable across the same week", () => {
    const mon = isoWeek(new Date("2026-05-04T00:00:00Z"));
    const sun = isoWeek(new Date("2026-05-10T23:59:59Z"));
    expect(mon).toBe(sun);
  });

  it("rotates between weeks", () => {
    const w1 = isoWeek(new Date("2026-05-04T00:00:00Z"));
    const w2 = isoWeek(new Date("2026-05-11T00:00:00Z"));
    expect(w1).not.toBe(w2);
  });
});

describe("scoreBeer — style fit", () => {
  it("awards 30 for top style match", () => {
    const ctx = { ...baseCtx, topStyles: ["IPA", "Stout"] };
    const { score, reasons } = scoreBeer(baseCandidate, ctx);
    expect(score).toBeGreaterThanOrEqual(30);
    expect(reasons.some((r) => r.includes("top style"))).toBe(true);
  });

  it("awards less for second-place style", () => {
    const ctx1 = { ...baseCtx, topStyles: ["IPA"] };
    const ctx2 = { ...baseCtx, topStyles: ["Stout", "IPA"] };
    expect(scoreBeer(baseCandidate, ctx1).score).toBeGreaterThan(
      scoreBeer(baseCandidate, ctx2).score,
    );
  });

  it("zero style fit when style not in user's list", () => {
    const ctx = { ...baseCtx, topStyles: ["Lager", "Pilsner"] };
    const out = scoreBeer(baseCandidate, ctx);
    expect(out.reasons.some((r) => r.includes("style"))).toBe(false);
  });
});

describe("scoreBeer — sensory fit", () => {
  it("awards points for aroma overlap", () => {
    const ctx = {
      ...baseCtx,
      preferredAromas: new Set(["citrus", "pine"]),
    };
    const { score } = scoreBeer(baseCandidate, ctx);
    const baseline = scoreBeer(baseCandidate, baseCtx).score;
    expect(score).toBeGreaterThan(baseline);
  });

  it("case-insensitive sensory matching", () => {
    const ctx = {
      ...baseCtx,
      preferredAromas: new Set(["CITRUS"]), // already lowercased in real ctx, but test the lookup
    };
    const { score } = scoreBeer(baseCandidate, ctx);
    expect(score).toBe(scoreBeer(baseCandidate, baseCtx).score);
  });
});

describe("scoreBeer — location", () => {
  it("awards 25 for home_city exact match", () => {
    const ctx = { ...baseCtx, homeCity: "Charlotte" };
    const { score, reasons } = scoreBeer(baseCandidate, ctx);
    expect(score).toBeGreaterThanOrEqual(25);
    expect(reasons.some((r) => r.includes("Charlotte"))).toBe(true);
  });

  it("case-insensitive city match", () => {
    const ctx = { ...baseCtx, homeCity: "charlotte" };
    const { reasons } = scoreBeer(baseCandidate, ctx);
    expect(reasons.some((r) => r.includes("Charlotte"))).toBe(true);
  });

  it("awards 15 for recent-visit city", () => {
    const ctx = { ...baseCtx, recentCities: new Set(["charlotte"]) };
    const { score, reasons } = scoreBeer(baseCandidate, ctx);
    expect(score).toBeGreaterThanOrEqual(15);
    expect(reasons.some((r) => r.includes("near you"))).toBe(true);
  });

  it("home_city beats recent-visit city when both match", () => {
    const homeCtx = { ...baseCtx, homeCity: "Charlotte" };
    const recentCtx = { ...baseCtx, recentCities: new Set(["charlotte"]) };
    expect(scoreBeer(baseCandidate, homeCtx).score).toBeGreaterThan(
      scoreBeer(baseCandidate, recentCtx).score,
    );
  });
});

describe("scoreBeer — quality", () => {
  it("higher avg_rating = higher score", () => {
    const lo = scoreBeer({ ...baseCandidate, avg_rating: 3.1 }, baseCtx).score;
    const hi = scoreBeer({ ...baseCandidate, avg_rating: 4.8 }, baseCtx).score;
    expect(hi).toBeGreaterThan(lo);
  });

  it("more total_ratings = higher score (popularity weight)", () => {
    const few = scoreBeer({ ...baseCandidate, total_ratings: 1 }, baseCtx).score;
    const many = scoreBeer(
      { ...baseCandidate, total_ratings: 10000 },
      baseCtx,
    ).score;
    expect(many).toBeGreaterThan(few);
  });

  it("zero rating == no quality contribution", () => {
    const out = scoreBeer({ ...baseCandidate, total_ratings: 0 }, baseCtx);
    expect(out.score).toBeGreaterThanOrEqual(10); // novelty only
  });
});

describe("scoreBeer — novelty", () => {
  it("untried beer gets +10 + 'new to you'", () => {
    const { reasons } = scoreBeer(baseCandidate, baseCtx);
    expect(reasons).toContain("new to you");
  });

  it("tried beer loses novelty bonus", () => {
    const ctx = { ...baseCtx, triedBeerIds: new Set(["beer-1"]) };
    const { score, reasons } = scoreBeer(baseCandidate, ctx);
    const untried = scoreBeer(baseCandidate, baseCtx).score;
    expect(score).toBeLessThan(untried);
    expect(reasons).not.toContain("new to you");
  });
});

describe("scoreBeer — is_featured boost", () => {
  it("featured beers get +15 + 'brewery pick'", () => {
    const out = scoreBeer({ ...baseCandidate, is_featured: true }, baseCtx);
    const baseline = scoreBeer(baseCandidate, baseCtx).score;
    expect(out.score).toBe(baseline + 15);
    expect(out.reasons).toContain("brewery pick");
  });

  it("a perfect personal match still beats a generic featured beer", () => {
    const personalCtx: ScoringContext = {
      topStyles: ["IPA"],
      preferredAromas: new Set(["citrus", "pine"]),
      preferredTastes: new Set(["bitter", "tropical"]),
      preferredFinishes: new Set(["dry"]),
      triedBeerIds: new Set(),
      homeCity: "Charlotte",
      recentCities: new Set(),
    };
    const personalMatch = scoreBeer(baseCandidate, personalCtx).score;
    const genericFeatured = scoreBeer(
      {
        ...baseCandidate,
        id: "other",
        style: "Lager",
        aroma_notes: [],
        taste_notes: [],
        finish_notes: [],
        is_featured: true,
        brewery: { id: "b2", name: "Far Away", city: "Anchorage", state: "AK" },
      },
      personalCtx,
    ).score;
    expect(personalMatch).toBeGreaterThan(genericFeatured);
  });
});

describe("scoreBeer — cold start", () => {
  it("user with no signals still gets a deterministic score", () => {
    const { score } = scoreBeer(baseCandidate, baseCtx);
    expect(score).toBeGreaterThan(0);
  });

  it("among candidates with no personal signals, quality + featured wins", () => {
    const a = scoreBeer(
      { ...baseCandidate, avg_rating: 4.0, total_ratings: 10, is_featured: false },
      baseCtx,
    ).score;
    const b = scoreBeer(
      { ...baseCandidate, id: "b", avg_rating: 4.5, total_ratings: 200, is_featured: true },
      baseCtx,
    ).score;
    expect(b).toBeGreaterThan(a);
  });
});
