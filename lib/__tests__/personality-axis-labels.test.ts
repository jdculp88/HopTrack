import { describe, it, expect } from "vitest";
import {
  AXIS_LABELS,
  computePersonality,
  listAllArchetypes,
  type PersonalityBeerLog,
} from "../personality";

describe("AXIS_LABELS", () => {
  it("defines labels for all 8 axis letters", () => {
    const expectedLetters = ["E", "L", "B", "S", "H", "R", "J", "O"];
    for (const letter of expectedLetters) {
      expect(AXIS_LABELS[letter]).toBeDefined();
      expect(AXIS_LABELS[letter].label).toBeTruthy();
      expect(AXIS_LABELS[letter].description).toBeTruthy();
    }
  });

  it("has unique labels for each letter", () => {
    const labels = Object.values(AXIS_LABELS).map((a) => a.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("has unique descriptions for each letter", () => {
    const descriptions = Object.values(AXIS_LABELS).map((a) => a.description);
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  it("covers all axis pairs: E/L, B/S, H/R, J/O", () => {
    // Variety axis
    expect(AXIS_LABELS.E.label).toBe("Explorer");
    expect(AXIS_LABELS.L.label).toBe("Loyalist");
    // Hop axis
    expect(AXIS_LABELS.B.label).toBe("Bold");
    expect(AXIS_LABELS.S.label).toBe("Smooth");
    // Timing axis
    expect(AXIS_LABELS.H.label).toBe("Hunter");
    expect(AXIS_LABELS.R.label).toBe("Regular");
    // Critique axis
    expect(AXIS_LABELS.J.label).toBe("Judge");
    expect(AXIS_LABELS.O.label).toBe("Optimist");
  });
});

describe("computePersonality code maps to AXIS_LABELS", () => {
  it("every letter in a personality code has a label", () => {
    // Build logs that produce the EBHJ archetype
    const logs: PersonalityBeerLog[] = [];
    for (let i = 0; i < 20; i++) {
      logs.push({
        beer_id: `beer-${i}`,
        rating: 2.5, // Low rating + variance → Judge
        beer: {
          id: `beer-${i}`,
          style: i < 8 ? "IPA" : ["Stout", "Lager", "Wheat", "Sour", "Porter", "Amber"][i % 6],
          item_type: "beer",
        },
      });
    }
    const result = computePersonality(logs);
    expect(result.hasEnoughData).toBe(true);

    for (const letter of result.code.split("")) {
      expect(AXIS_LABELS[letter]).toBeDefined();
      expect(AXIS_LABELS[letter].label.length).toBeGreaterThan(0);
    }
  });
});

describe("all 16 archetypes", () => {
  it("lists exactly 16 archetypes", () => {
    const all = listAllArchetypes();
    expect(all.length).toBe(16);
  });

  it("every archetype code is 4 letters from the AXIS_LABELS keys", () => {
    const validLetters = new Set(Object.keys(AXIS_LABELS));
    for (const arch of listAllArchetypes()) {
      expect(arch.code.length).toBe(4);
      for (const letter of arch.code.split("")) {
        expect(validLetters.has(letter)).toBe(true);
      }
    }
  });
});
