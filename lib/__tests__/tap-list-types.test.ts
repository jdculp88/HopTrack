/**
 * tap-list-types unit tests — Sprint 176 (Beer Sensory Fields)
 *
 * Validates the defaults, field visibility helpers, and numeric validation
 * now that SRM has joined ABV/IBU/Price in the required-numeric set and new
 * sensory-fields visibility helpers have been added.
 */

import { describe, test, expect } from "vitest";
import {
  emptyBeer,
  validateNumericFields,
  showStyleField,
  showAbvField,
  showIbuField,
  showSrmField,
  showSensoryNotesFields,
  POUR_QUICK_ADD,
  type BeerFormData,
} from "@/app/(brewery-admin)/brewery-admin/[brewery_id]/tap-list/tap-list-types";

function makeForm(overrides: Partial<BeerFormData> = {}): BeerFormData {
  return { ...emptyBeer, ...overrides };
}

describe("emptyBeer defaults", () => {
  test("initializes sensory arrays to empty", () => {
    expect(emptyBeer.aromaNotes).toEqual([]);
    expect(emptyBeer.tasteNotes).toEqual([]);
    expect(emptyBeer.finishNotes).toEqual([]);
  });

  test("initializes srm as empty string (no preset)", () => {
    expect(emptyBeer.srm).toBe("");
  });

  test("defaults to beer item type", () => {
    expect(emptyBeer.itemType).toBe("beer");
  });
});

describe("field visibility helpers", () => {
  test("SRM is only shown for beer", () => {
    expect(showSrmField("beer")).toBe(true);
    expect(showSrmField("cider")).toBe(false);
    expect(showSrmField("wine")).toBe(false);
    expect(showSrmField("cocktail")).toBe(false);
    expect(showSrmField("na_beverage")).toBe(false);
    expect(showSrmField("food")).toBe(false);
  });

  test("sensory notes show for beer, cider, wine, cocktail — not NA/food", () => {
    expect(showSensoryNotesFields("beer")).toBe(true);
    expect(showSensoryNotesFields("cider")).toBe(true);
    expect(showSensoryNotesFields("wine")).toBe(true);
    expect(showSensoryNotesFields("cocktail")).toBe(true);
    expect(showSensoryNotesFields("na_beverage")).toBe(false);
    expect(showSensoryNotesFields("food")).toBe(false);
  });

  test("existing beer-only fields still gate to beer", () => {
    expect(showStyleField("beer")).toBe(true);
    expect(showStyleField("wine")).toBe(false);
    expect(showIbuField("beer")).toBe(true);
    expect(showIbuField("wine")).toBe(false);
  });

  test("ABV hidden for food and non-alcoholic", () => {
    expect(showAbvField("beer")).toBe(true);
    expect(showAbvField("cider")).toBe(true);
    expect(showAbvField("wine")).toBe(true);
    expect(showAbvField("cocktail")).toBe(true);
    expect(showAbvField("na_beverage")).toBe(false);
    expect(showAbvField("food")).toBe(false);
  });
});

describe("validateNumericFields — SRM validation", () => {
  test("empty SRM passes validation", () => {
    const errors = validateNumericFields(makeForm({ srm: "" }));
    expect(errors.srm).toBeUndefined();
  });

  test("valid SRM (1-40) passes", () => {
    for (const value of ["1", "20", "40"]) {
      const errors = validateNumericFields(makeForm({ srm: value }));
      expect(errors.srm).toBeUndefined();
    }
  });

  test("below-minimum SRM returns an error", () => {
    const errors = validateNumericFields(makeForm({ srm: "0" }));
    expect(errors.srm).toBeTruthy();
    expect(errors.srm).toMatch(/1/);
    expect(errors.srm).toMatch(/40/);
  });

  test("above-maximum SRM returns an error", () => {
    const errors = validateNumericFields(makeForm({ srm: "41" }));
    expect(errors.srm).toBeTruthy();
    expect(errors.srm).toMatch(/40/);
  });

  test("non-numeric SRM returns an error", () => {
    const errors = validateNumericFields(makeForm({ srm: "abc" }));
    expect(errors.srm).toBeTruthy();
  });

  test("SRM errors don't leak into other fields", () => {
    const errors = validateNumericFields(makeForm({ srm: "99" }));
    expect(errors.srm).toBeTruthy();
    expect(errors.abv).toBeUndefined();
    expect(errors.ibu).toBeUndefined();
    expect(errors.price).toBeUndefined();
  });

  test("multiple errors accumulate independently", () => {
    const errors = validateNumericFields(
      makeForm({ srm: "100", abv: "200", ibu: "-5" }),
    );
    expect(errors.srm).toBeTruthy();
    expect(errors.abv).toBeTruthy();
    expect(errors.ibu).toBeTruthy();
  });
});

describe("POUR_QUICK_ADD presets", () => {
  test("Pint preset is present and defaults to 16oz", () => {
    const pint = POUR_QUICK_ADD.find(p => p.label === "Pint");
    expect(pint).toBeDefined();
    expect(pint?.oz).toBe("16");
  });
});
