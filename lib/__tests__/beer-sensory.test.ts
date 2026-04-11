/**
 * beer-sensory unit tests — Sprint 176 (Beer Sensory Fields)
 *
 * Verifies the standardized catalog lists, the membership check used by the
 * picker's "is this already known?" logic, and the normalization helper that
 * title-cases free-text entries on save.
 */

import { describe, test, expect } from "vitest";
import {
  AROMA_NOTES,
  TASTE_NOTES,
  FINISH_NOTES,
  isKnownNote,
  normalizeNote,
} from "@/lib/beer-sensory";

describe("catalog lists", () => {
  test("every list has a meaningful number of options", () => {
    // Sanity: lists should have enough depth to cover the common brewer
    // vocabulary without needing to fall back to custom for most beers.
    expect(AROMA_NOTES.length).toBeGreaterThanOrEqual(40);
    expect(TASTE_NOTES.length).toBeGreaterThanOrEqual(40);
    expect(FINISH_NOTES.length).toBeGreaterThanOrEqual(20);
  });

  test("lists are readonly tuples of non-empty strings", () => {
    for (const list of [AROMA_NOTES, TASTE_NOTES, FINISH_NOTES]) {
      for (const entry of list) {
        expect(typeof entry).toBe("string");
        expect(entry.length).toBeGreaterThan(0);
        // No leading/trailing whitespace — breaks comparison
        expect(entry).toBe(entry.trim());
      }
    }
  });

  test("no duplicate entries within a list (case-insensitive)", () => {
    for (const list of [AROMA_NOTES, TASTE_NOTES, FINISH_NOTES]) {
      const seen = new Set<string>();
      for (const entry of list) {
        const key = entry.toLowerCase();
        expect(seen.has(key)).toBe(false);
        seen.add(key);
      }
    }
  });

  test("aroma list covers the big hop descriptors", () => {
    // Regression canary — if anyone deletes these, the picker gets useless
    const required = ["Citrus", "Pine", "Tropical", "Floral", "Mango"];
    for (const r of required) {
      expect(AROMA_NOTES).toContain(r);
    }
  });

  test("finish list covers the standard dryness/bitterness scale", () => {
    const required = ["Dry", "Crisp", "Bitter", "Smooth"];
    for (const r of required) {
      expect(FINISH_NOTES).toContain(r);
    }
  });
});

describe("isKnownNote", () => {
  test("matches exact catalog entries", () => {
    expect(isKnownNote("Citrus", AROMA_NOTES)).toBe(true);
    expect(isKnownNote("Pine", AROMA_NOTES)).toBe(true);
  });

  test("is case-insensitive", () => {
    expect(isKnownNote("citrus", AROMA_NOTES)).toBe(true);
    expect(isKnownNote("CITRUS", AROMA_NOTES)).toBe(true);
    expect(isKnownNote("CiTrUs", AROMA_NOTES)).toBe(true);
  });

  test("returns false for unknown entries", () => {
    expect(isKnownNote("Nonexistent", AROMA_NOTES)).toBe(false);
    expect(isKnownNote("Weird Flavor", AROMA_NOTES)).toBe(false);
  });

  test("returns false for empty or whitespace input", () => {
    expect(isKnownNote("", AROMA_NOTES)).toBe(false);
    expect(isKnownNote("   ", AROMA_NOTES)).toBe(false);
  });

  test("ignores leading/trailing whitespace on input", () => {
    expect(isKnownNote("  Pine  ", AROMA_NOTES)).toBe(true);
  });
});

describe("normalizeNote", () => {
  test("title-cases lowercase input", () => {
    expect(normalizeNote("pine")).toBe("Pine");
    expect(normalizeNote("tropical fruit")).toBe("Tropical Fruit");
  });

  test("trims whitespace", () => {
    expect(normalizeNote("  citrus  ")).toBe("Citrus");
  });

  test("handles multi-word phrases", () => {
    expect(normalizeNote("dark fruit")).toBe("Dark Fruit");
    expect(normalizeNote("lingering bitter")).toBe("Lingering Bitter");
  });

  test("preserves short ALL-CAPS acronyms", () => {
    expect(normalizeNote("ESB")).toBe("ESB");
    expect(normalizeNote("NEIPA")).toBe("NEIPA");
  });

  test("title-cases mixed-case input (overrides user casing)", () => {
    expect(normalizeNote("pineApple")).toBe("Pineapple");
    expect(normalizeNote("BITTER")).toBe("Bitter"); // too long to be an acronym
  });

  test("returns empty string for empty/whitespace input", () => {
    expect(normalizeNote("")).toBe("");
    expect(normalizeNote("   ")).toBe("");
  });

  test("collapses runs of whitespace between words", () => {
    expect(normalizeNote("dark    fruit")).toBe("Dark Fruit");
  });
});
