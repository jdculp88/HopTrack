// Beer Personality tests — Sprint 162 (The Identity)
// Covers computePersonality, getArchetypeByCode, listAllArchetypes
import { describe, it, expect } from "vitest";
import {
  computePersonality,
  getArchetypeByCode,
  listAllArchetypes,
  type PersonalityBeerLog,
} from "@/lib/personality";

// Test data builders ────────────────────────────────────────────────────────

function log(
  beerId: string,
  style: string,
  rating: number | null = null,
): PersonalityBeerLog {
  return {
    beer_id: beerId,
    rating,
    beer: { id: beerId, style, item_type: "beer" },
  };
}

/** Repeat `log` `n` times with same beerId (revisit). */
function logs(beerId: string, style: string, n: number, rating: number | null = null): PersonalityBeerLog[] {
  return Array.from({ length: n }, () => log(beerId, style, rating));
}

// ─── computePersonality — data sufficiency ─────────────────────────────────

describe("computePersonality — data sufficiency", () => {
  it("returns default archetype for 0 beers", () => {
    const result = computePersonality([]);
    expect(result.hasEnoughData).toBe(false);
    expect(result.archetype).toBe("The New Pour");
    expect(result.emoji).toBe("🌱");
    expect(result.code).toBe("----");
  });

  it("returns default archetype for <5 beers", () => {
    const result = computePersonality([
      log("b1", "IPA"),
      log("b2", "Stout"),
      log("b3", "Lager"),
      log("b4", "Sour"),
    ]);
    expect(result.hasEnoughData).toBe(false);
    expect(result.archetype).toBe("The New Pour");
    expect(result.code).toBe("----");
  });

  it("computes full archetype at exactly 5 beers", () => {
    const result = computePersonality([
      log("b1", "IPA"),
      log("b2", "IPA"),
      log("b3", "IPA"),
      log("b4", "IPA"),
      log("b5", "IPA"),
    ]);
    expect(result.hasEnoughData).toBe(true);
    expect(result.code).not.toBe("----");
    expect(result.code).toHaveLength(4);
  });
});

// ─── Variety axis: Explorer (E) vs Loyalist (L) ───────────────────────────

describe("Variety axis (E/L)", () => {
  it("all one style = Loyalist", () => {
    const result = computePersonality(logs("b1", "IPA", 10));
    expect(result.axes.variety).toBe("L");
  });

  it("all different styles = Explorer", () => {
    const distinct = [
      log("b1", "IPA"),
      log("b2", "Stout"),
      log("b3", "Lager"),
      log("b4", "Sour"),
      log("b5", "Porter"),
      log("b6", "Saison"),
      log("b7", "Brown Ale"),
      log("b8", "Pilsner"),
    ];
    const result = computePersonality(distinct);
    expect(result.axes.variety).toBe("E");
  });

  it("3 unique styles in 10 beers = below threshold (L)", () => {
    // 3/10 = 0.3 — threshold is >= 0.3 so this should be Explorer
    const sample = [
      ...logs("b1", "IPA", 4),
      ...logs("b2", "Stout", 3),
      ...logs("b3", "Lager", 3),
    ];
    const result = computePersonality(sample);
    expect(result.axes.variety).toBe("E");
  });

  it("2 unique styles in 10 beers = Loyalist (below 0.3)", () => {
    const sample = [...logs("b1", "IPA", 5), ...logs("b2", "Stout", 5)];
    const result = computePersonality(sample);
    expect(result.axes.variety).toBe("L");
  });
});

// ─── Hop Intensity: Bold (B) vs Smooth (S) ─────────────────────────────────

describe("Hop axis (B/S)", () => {
  it("all IPAs = Bold", () => {
    const result = computePersonality(logs("b1", "IPA", 10));
    expect(result.axes.hopIntensity).toBe("B");
  });

  it("zero IPAs = Smooth", () => {
    const sample = [
      ...logs("b1", "Stout", 3),
      ...logs("b2", "Lager", 3),
      ...logs("b3", "Porter", 2),
      ...logs("b4", "Sour", 2),
    ];
    const result = computePersonality(sample);
    expect(result.axes.hopIntensity).toBe("S");
  });

  it("Pale Ale counts as hop-forward (ipa family)", () => {
    const result = computePersonality(logs("b1", "Pale Ale", 6));
    expect(result.axes.hopIntensity).toBe("B");
  });

  it("35% hop share crosses threshold", () => {
    // 4/10 = 40% hops
    const sample = [
      ...logs("b1", "IPA", 4),
      ...logs("b2", "Lager", 3),
      ...logs("b3", "Stout", 3),
    ];
    const result = computePersonality(sample);
    expect(result.axes.hopIntensity).toBe("B");
  });

  it("30% hop share stays Smooth", () => {
    // 3/10 = 30% hops — below 35%
    const sample = [
      ...logs("b1", "IPA", 3),
      ...logs("b2", "Lager", 4),
      ...logs("b3", "Stout", 3),
    ];
    const result = computePersonality(sample);
    expect(result.axes.hopIntensity).toBe("S");
  });
});

// ─── Timing: Hunter (H) vs Regular (R) ─────────────────────────────────────

describe("Timing axis (H/R)", () => {
  it("all unique beers = Hunter", () => {
    const sample = Array.from({ length: 10 }, (_, i) => log(`b${i}`, "IPA"));
    const result = computePersonality(sample);
    expect(result.axes.timing).toBe("H");
  });

  it("all repeat pours (1 beer x 10) = Regular", () => {
    const result = computePersonality(logs("b1", "IPA", 10));
    expect(result.axes.timing).toBe("R");
  });

  it("60% unique = Hunter (at threshold)", () => {
    // 6 unique / 10 total = 60%
    const sample = [
      log("b1", "IPA"),
      log("b2", "IPA"),
      log("b3", "IPA"),
      log("b4", "IPA"),
      log("b5", "IPA"),
      log("b6", "IPA"),
      log("b1", "IPA"),
      log("b2", "IPA"),
      log("b3", "IPA"),
      log("b4", "IPA"),
    ];
    const result = computePersonality(sample);
    expect(result.axes.timing).toBe("H");
  });

  it("50% unique = Regular (below threshold)", () => {
    // 5 unique / 10 total = 50%
    const sample = [
      ...logs("b1", "IPA", 2),
      ...logs("b2", "IPA", 2),
      ...logs("b3", "IPA", 2),
      ...logs("b4", "IPA", 2),
      ...logs("b5", "IPA", 2),
    ];
    const result = computePersonality(sample);
    expect(result.axes.timing).toBe("R");
  });
});

// ─── Critique: Judge (J) vs Optimist (O) ───────────────────────────────────

describe("Critique axis (J/O)", () => {
  it("no ratings = Optimist", () => {
    const result = computePersonality(logs("b1", "IPA", 10));
    expect(result.axes.critique).toBe("O");
  });

  it("fewer than 3 ratings = Optimist (insufficient data)", () => {
    const sample = [
      log("b1", "IPA", 1.0),
      log("b2", "IPA", 1.5),
      log("b3", "IPA"),
      log("b4", "IPA"),
      log("b5", "IPA"),
    ];
    const result = computePersonality(sample);
    expect(result.axes.critique).toBe("O");
  });

  it("low avg rating = Judge", () => {
    const sample = [
      log("b1", "IPA", 3.0),
      log("b2", "IPA", 3.5),
      log("b3", "IPA", 3.0),
      log("b4", "IPA", 3.5),
      log("b5", "IPA", 3.0),
    ];
    const result = computePersonality(sample);
    expect(result.axes.critique).toBe("J");
  });

  it("high avg low variance = Optimist", () => {
    const sample = [
      log("b1", "IPA", 4.5),
      log("b2", "IPA", 4.5),
      log("b3", "IPA", 4.5),
      log("b4", "IPA", 4.5),
      log("b5", "IPA", 4.5),
    ];
    const result = computePersonality(sample);
    expect(result.axes.critique).toBe("O");
  });

  it("high avg but wide variance = Judge", () => {
    const sample = [
      log("b1", "IPA", 5.0),
      log("b2", "IPA", 5.0),
      log("b3", "IPA", 5.0),
      log("b4", "IPA", 2.5),
      log("b5", "IPA", 2.5),
    ];
    const result = computePersonality(sample);
    // avg = 4.0, stddev ≈ 1.22 → wide range triggers Judge
    expect(result.axes.critique).toBe("J");
    expect(result.signals.ratingStdDev).toBeGreaterThanOrEqual(0.9);
  });
});

// ─── Known code combinations ──────────────────────────────────────────────

describe("Known archetype codes", () => {
  it("EBHJ → The Hop Hunter (explorer + bold + hunter + judge)", () => {
    // 10 unique IPAs across varied IPA sub-styles, low avg rating
    const sample = [
      log("b1", "IPA", 3.0),
      log("b2", "Hazy IPA", 3.5),
      log("b3", "Double IPA", 3.0),
      log("b4", "Session IPA", 3.5),
      log("b5", "New England IPA", 3.0),
      log("b6", "West Coast IPA", 3.5),
      log("b7", "Imperial IPA", 3.0),
      log("b8", "Pale Ale", 3.5),
      log("b9", "IPA", 3.0),
      log("b10", "Hazy IPA", 3.5),
    ];
    const result = computePersonality(sample);
    expect(result.code).toBe("EBHJ");
    expect(result.archetype).toBe("The Hop Hunter");
  });

  it("LSRO → The Loyal Local (loyalist + smooth + regular + optimist)", () => {
    // Same pilsner every night, cheerful rater
    const sample = logs("b1", "Pilsner", 10, 4.5);
    const result = computePersonality(sample);
    expect(result.code).toBe("LSRO");
    expect(result.archetype).toBe("The Loyal Local");
    expect(result.emoji).toBe("🏠"); // Sprint 171: on-brand icon
  });

  it("LBRO → The Daily Hop (loyalist + bold + regular + optimist)", () => {
    const sample = logs("b1", "IPA", 10, 4.5);
    const result = computePersonality(sample);
    expect(result.code).toBe("LBRO");
    expect(result.archetype).toBe("The Daily Hop");
  });
});

// ─── getArchetypeByCode ───────────────────────────────────────────────────

describe("getArchetypeByCode", () => {
  it("returns known archetype for valid code", () => {
    const entry = getArchetypeByCode("EBHJ");
    expect(entry.archetype).toBe("The Hop Hunter");
  });

  it("returns default for unknown code", () => {
    const entry = getArchetypeByCode("XXXX");
    expect(entry.archetype).toBe("The New Pour");
  });

  it("all 16 codes resolve to named archetypes", () => {
    const axes = ["E", "L"];
    const hops = ["B", "S"];
    const timings = ["H", "R"];
    const critiques = ["J", "O"];
    for (const v of axes) {
      for (const h of hops) {
        for (const t of timings) {
          for (const c of critiques) {
            const code = `${v}${h}${t}${c}`;
            const entry = getArchetypeByCode(code);
            expect(entry.archetype).not.toBe("The New Pour");
            expect(entry.archetype).toMatch(/^The /);
          }
        }
      }
    }
  });
});

// ─── listAllArchetypes ────────────────────────────────────────────────────

describe("listAllArchetypes", () => {
  it("returns exactly 16 archetypes", () => {
    expect(listAllArchetypes()).toHaveLength(16);
  });

  it("each archetype has code, archetype name, emoji, tagline", () => {
    for (const entry of listAllArchetypes()) {
      expect(entry.code).toHaveLength(4);
      expect(entry.archetype).toMatch(/^The /);
      expect(entry.emoji.length).toBeGreaterThanOrEqual(1);
      expect(entry.tagline.length).toBeGreaterThan(0);
    }
  });

  it("all 16 codes are unique", () => {
    const codes = listAllArchetypes().map((e) => e.code);
    const unique = new Set(codes);
    expect(unique.size).toBe(16);
  });

  it("all archetype names are unique", () => {
    const names = listAllArchetypes().map((e) => e.archetype);
    const unique = new Set(names);
    expect(unique.size).toBe(16);
  });
});

// ─── Signals output ────────────────────────────────────────────────────────

describe("PersonalitySignals", () => {
  it("populates all signal fields", () => {
    const sample = [
      log("b1", "IPA", 4.0),
      log("b2", "Stout", 3.5),
      log("b3", "Lager", 4.5),
      log("b4", "Sour", 5.0),
      log("b5", "IPA", 4.0),
    ];
    const result = computePersonality(sample);
    expect(result.signals.totalBeers).toBe(5);
    expect(result.signals.uniqueBeers).toBe(5);
    expect(result.signals.uniqueStyles).toBe(4);
    expect(result.signals.avgRating).toBeCloseTo(4.2);
    expect(result.signals.ratingStdDev).toBeGreaterThan(0);
    expect(result.signals.hopShare).toBeCloseTo(0.4);
  });
});
