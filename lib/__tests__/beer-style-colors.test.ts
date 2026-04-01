// Beer style color system tests — Avery + Reese, Sprint 104
// Covers getStyleFamily, getStyleVars, getStyleDataAttr, STYLE_FAMILY_VARS
import { describe, it, expect } from "vitest";
import {
  getStyleFamily,
  getStyleVars,
  getStyleDataAttr,
  STYLE_FAMILY_VARS,
  type BeerStyleFamily,
} from "@/lib/beerStyleColors";

// ── STYLE_FAMILY_VARS — all 6 beer families + 4 beverage categories + default ──

describe("STYLE_FAMILY_VARS", () => {
  const expectedFamilies: BeerStyleFamily[] = [
    "ipa", "stout", "sour", "porter", "lager", "saison",
    "cider", "wine", "cocktail", "na", "default",
  ];

  it("contains entries for all 11 families", () => {
    for (const family of expectedFamilies) {
      expect(STYLE_FAMILY_VARS).toHaveProperty(family);
    }
  });

  it("every family has primary, light, and soft keys", () => {
    for (const family of expectedFamilies) {
      const vars = STYLE_FAMILY_VARS[family];
      expect(vars).toHaveProperty("primary");
      expect(vars).toHaveProperty("light");
      expect(vars).toHaveProperty("soft");
    }
  });

  it("every value is a CSS variable string in var(--*) format", () => {
    const cssVarPattern = /^var\(--[a-z0-9-]+\)$/;
    for (const family of expectedFamilies) {
      const vars = STYLE_FAMILY_VARS[family];
      expect(vars.primary).toMatch(cssVarPattern);
      expect(vars.light).toMatch(cssVarPattern);
      expect(vars.soft).toMatch(cssVarPattern);
    }
  });

  it("IPA family uses ipa-green variables", () => {
    expect(STYLE_FAMILY_VARS.ipa.primary).toContain("ipa-green");
  });

  it("stout family uses stout-espresso variables", () => {
    expect(STYLE_FAMILY_VARS.stout.primary).toContain("stout-espresso");
  });

  it("sour family uses sour-berry variables", () => {
    expect(STYLE_FAMILY_VARS.sour.primary).toContain("sour-berry");
  });

  it("porter family uses porter-plum variables", () => {
    expect(STYLE_FAMILY_VARS.porter.primary).toContain("porter-plum");
  });

  it("lager family uses lager-sky variables", () => {
    expect(STYLE_FAMILY_VARS.lager.primary).toContain("lager-sky");
  });

  it("saison family uses saison-peach variables", () => {
    expect(STYLE_FAMILY_VARS.saison.primary).toContain("saison-peach");
  });

  it("cider family uses cider-rose variables", () => {
    expect(STYLE_FAMILY_VARS.cider.primary).toContain("cider-rose");
  });

  it("wine family uses wine-burgundy variables", () => {
    expect(STYLE_FAMILY_VARS.wine.primary).toContain("wine-burgundy");
  });

  it("cocktail family uses cocktail-teal variables", () => {
    expect(STYLE_FAMILY_VARS.cocktail.primary).toContain("cocktail-teal");
  });

  it("na family uses na-lemon variables", () => {
    expect(STYLE_FAMILY_VARS.na.primary).toContain("na-lemon");
  });

  it("default family uses accent-gold as primary", () => {
    expect(STYLE_FAMILY_VARS.default.primary).toBe("var(--accent-gold)");
  });
});

// ── getStyleFamily — IPA family ──

describe("getStyleFamily IPA family", () => {
  const ipaStyles = [
    "IPA", "Double IPA", "Hazy IPA", "Session IPA",
    "Pale Ale", "New England IPA", "West Coast IPA", "Imperial IPA",
  ];

  it.each(ipaStyles)("maps '%s' to 'ipa'", (style) => {
    expect(getStyleFamily(style)).toBe("ipa");
  });
});

// ── getStyleFamily — Stout family ──

describe("getStyleFamily stout family", () => {
  const stoutStyles = [
    "Stout", "Imperial Stout", "Milk Stout", "Oatmeal Stout", "Dry Stout",
  ];

  it.each(stoutStyles)("maps '%s' to 'stout'", (style) => {
    expect(getStyleFamily(style)).toBe("stout");
  });
});

// ── getStyleFamily — Sour family ──

describe("getStyleFamily sour family", () => {
  const sourStyles = [
    "Sour", "Gose", "Berliner Weisse", "Lambic",
    "Gueuze", "Flanders Red", "Wild Ale",
  ];

  it.each(sourStyles)("maps '%s' to 'sour'", (style) => {
    expect(getStyleFamily(style)).toBe("sour");
  });
});

// ── getStyleFamily — Porter family ──

describe("getStyleFamily porter family", () => {
  const porterStyles = [
    "Porter", "Brown Ale", "Barleywine", "English Barleywine",
    "Robust Porter", "Baltic Porter",
  ];

  it.each(porterStyles)("maps '%s' to 'porter'", (style) => {
    expect(getStyleFamily(style)).toBe("porter");
  });
});

// ── getStyleFamily — Lager family ──

describe("getStyleFamily lager family", () => {
  const lagerStyles = [
    "Lager", "Pilsner", "Kolsch", "Kölsch",
    "Blonde Ale", "Cream Ale", "Helles", "Märzen", "Oktoberfest",
  ];

  it.each(lagerStyles)("maps '%s' to 'lager'", (style) => {
    expect(getStyleFamily(style)).toBe("lager");
  });
});

// ── getStyleFamily — Saison family ──

describe("getStyleFamily saison family", () => {
  const saisonStyles = [
    "Wheat", "Hefeweizen", "Belgian", "Saison", "Amber",
    "Red Ale", "Witbier", "Dunkel", "Belgian Tripel", "Belgian Dubbel",
  ];

  it.each(saisonStyles)("maps '%s' to 'saison'", (style) => {
    expect(getStyleFamily(style)).toBe("saison");
  });
});

// ── getStyleFamily — unknown / null / undefined ──

describe("getStyleFamily unknown/null/undefined inputs", () => {
  it("returns 'default' for null style", () => {
    expect(getStyleFamily(null)).toBe("default");
  });

  it("returns 'default' for undefined style", () => {
    expect(getStyleFamily(undefined)).toBe("default");
  });

  it("returns 'default' for empty string", () => {
    expect(getStyleFamily("")).toBe("default");
  });

  it("returns 'default' for an unrecognized style string", () => {
    expect(getStyleFamily("Quantum Foam Ale")).toBe("default");
  });

  it("returns 'default' for a numeric-looking style string", () => {
    expect(getStyleFamily("42")).toBe("default");
  });

  it("returns 'default' for a style with extra spaces (no trim applied)", () => {
    // STYLE_TO_FAMILY uses exact match — "IPA " with trailing space is not "IPA"
    expect(getStyleFamily("IPA ")).toBe("default");
  });
});

// ── getStyleFamily — case sensitivity ──

describe("getStyleFamily case sensitivity", () => {
  it("exact-match 'IPA' returns ipa", () => {
    expect(getStyleFamily("IPA")).toBe("ipa");
  });

  it("lowercase 'ipa' returns default (map is exact-case)", () => {
    // The current implementation uses an exact-case lookup table.
    // This test documents current behavior — it is NOT a bug to return 'default' here.
    expect(getStyleFamily("ipa")).toBe("default");
  });

  it("mixed case 'iPa' returns default (not a valid map key)", () => {
    expect(getStyleFamily("iPa")).toBe("default");
  });

  it("'stout' lowercase returns default (exact-case map)", () => {
    expect(getStyleFamily("stout")).toBe("default");
  });

  it("'Stout' title-case returns stout (correct)", () => {
    expect(getStyleFamily("Stout")).toBe("stout");
  });
});

// ── getStyleFamily — itemType overrides style ──

describe("getStyleFamily itemType parameter", () => {
  it("itemType 'cider' returns 'cider' regardless of style", () => {
    expect(getStyleFamily("IPA", "cider")).toBe("cider");
  });

  it("itemType 'wine' returns 'wine' regardless of style", () => {
    expect(getStyleFamily("Stout", "wine")).toBe("wine");
  });

  it("itemType 'cocktail' returns 'cocktail' regardless of style", () => {
    expect(getStyleFamily(null, "cocktail")).toBe("cocktail");
  });

  it("itemType 'na_beverage' returns 'na'", () => {
    expect(getStyleFamily("Lager", "na_beverage")).toBe("na");
  });

  it("itemType 'beer' does NOT override — falls through to style lookup", () => {
    expect(getStyleFamily("IPA", "beer")).toBe("ipa");
    expect(getStyleFamily("Stout", "beer")).toBe("stout");
  });

  it("itemType 'beer' with unknown style returns 'default'", () => {
    expect(getStyleFamily("Quantum Ale", "beer")).toBe("default");
  });

  it("null itemType falls through to style lookup", () => {
    expect(getStyleFamily("IPA", null)).toBe("ipa");
  });

  it("undefined itemType falls through to style lookup", () => {
    expect(getStyleFamily("Saison", undefined)).toBe("saison");
  });

  it("unknown itemType returns 'default'", () => {
    expect(getStyleFamily("IPA", "mead")).toBe("default");
  });

  it("null style with null itemType returns 'default'", () => {
    expect(getStyleFamily(null, null)).toBe("default");
  });
});

// ── getStyleVars — return shape ──

describe("getStyleVars return shape", () => {
  it("returns an object with primary, light, soft keys", () => {
    const vars = getStyleVars("IPA");
    expect(vars).toHaveProperty("primary");
    expect(vars).toHaveProperty("light");
    expect(vars).toHaveProperty("soft");
  });

  it("all values are CSS variable strings", () => {
    const cssVarPattern = /^var\(--[a-z0-9-]+\)$/;
    const vars = getStyleVars("Stout");
    expect(vars.primary).toMatch(cssVarPattern);
    expect(vars.light).toMatch(cssVarPattern);
    expect(vars.soft).toMatch(cssVarPattern);
  });

  it("returns ipa vars for IPA style", () => {
    const vars = getStyleVars("IPA");
    expect(vars).toStrictEqual(STYLE_FAMILY_VARS.ipa);
  });

  it("returns stout vars for Stout style", () => {
    expect(getStyleVars("Stout")).toStrictEqual(STYLE_FAMILY_VARS.stout);
  });

  it("returns sour vars for Gose style", () => {
    expect(getStyleVars("Gose")).toStrictEqual(STYLE_FAMILY_VARS.sour);
  });

  it("returns porter vars for Brown Ale style", () => {
    expect(getStyleVars("Brown Ale")).toStrictEqual(STYLE_FAMILY_VARS.porter);
  });

  it("returns lager vars for Pilsner style", () => {
    expect(getStyleVars("Pilsner")).toStrictEqual(STYLE_FAMILY_VARS.lager);
  });

  it("returns saison vars for Wheat style", () => {
    expect(getStyleVars("Wheat")).toStrictEqual(STYLE_FAMILY_VARS.saison);
  });

  it("returns cider vars for itemType cider", () => {
    expect(getStyleVars(null, "cider")).toStrictEqual(STYLE_FAMILY_VARS.cider);
  });

  it("returns wine vars for itemType wine", () => {
    expect(getStyleVars(null, "wine")).toStrictEqual(STYLE_FAMILY_VARS.wine);
  });

  it("returns cocktail vars for itemType cocktail", () => {
    expect(getStyleVars(null, "cocktail")).toStrictEqual(STYLE_FAMILY_VARS.cocktail);
  });

  it("returns na vars for itemType na_beverage", () => {
    expect(getStyleVars(null, "na_beverage")).toStrictEqual(STYLE_FAMILY_VARS.na);
  });

  it("returns default vars for null style and null itemType", () => {
    expect(getStyleVars(null, null)).toStrictEqual(STYLE_FAMILY_VARS.default);
  });

  it("returns default vars for unknown style", () => {
    expect(getStyleVars("Mythical Unicorn Porter")).toStrictEqual(STYLE_FAMILY_VARS.default);
  });
});

// ── getStyleDataAttr ──

describe("getStyleDataAttr", () => {
  it("returns the same value as getStyleFamily for beer styles", () => {
    expect(getStyleDataAttr("IPA")).toBe(getStyleFamily("IPA"));
    expect(getStyleDataAttr("Stout")).toBe(getStyleFamily("Stout"));
    expect(getStyleDataAttr("Gose")).toBe(getStyleFamily("Gose"));
  });

  it("returns the same value as getStyleFamily for item types", () => {
    expect(getStyleDataAttr(null, "cider")).toBe(getStyleFamily(null, "cider"));
    expect(getStyleDataAttr("Wheat", "wine")).toBe(getStyleFamily("Wheat", "wine"));
  });

  it("returns 'ipa' for IPA style (for use as data-style attribute)", () => {
    expect(getStyleDataAttr("IPA")).toBe("ipa");
  });

  it("returns 'default' for null style (safe for use in data-style)", () => {
    expect(getStyleDataAttr(null)).toBe("default");
  });

  it("returns a BeerStyleFamily string (usable as data attribute value)", () => {
    const result = getStyleDataAttr("Double IPA");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});

// ── Full coverage: all 26 documented beer styles return a non-default family ──

describe("all 26 documented beer styles map to a non-default family", () => {
  const allMappedStyles: [string, BeerStyleFamily][] = [
    // IPA
    ["IPA", "ipa"], ["Double IPA", "ipa"], ["Hazy IPA", "ipa"],
    ["Session IPA", "ipa"], ["Pale Ale", "ipa"], ["New England IPA", "ipa"],
    ["West Coast IPA", "ipa"], ["Imperial IPA", "ipa"],
    // Stout
    ["Stout", "stout"], ["Imperial Stout", "stout"], ["Milk Stout", "stout"],
    ["Oatmeal Stout", "stout"], ["Dry Stout", "stout"],
    // Sour
    ["Sour", "sour"], ["Gose", "sour"], ["Berliner Weisse", "sour"],
    ["Lambic", "sour"], ["Gueuze", "sour"], ["Flanders Red", "sour"], ["Wild Ale", "sour"],
    // Porter
    ["Porter", "porter"], ["Brown Ale", "porter"], ["Barleywine", "porter"],
    ["English Barleywine", "porter"], ["Robust Porter", "porter"], ["Baltic Porter", "porter"],
    // Lager
    ["Lager", "lager"], ["Pilsner", "lager"], ["Kolsch", "lager"], ["Kölsch", "lager"],
    ["Blonde Ale", "lager"], ["Cream Ale", "lager"], ["Helles", "lager"],
    ["Märzen", "lager"], ["Oktoberfest", "lager"],
    // Saison
    ["Wheat", "saison"], ["Hefeweizen", "saison"], ["Belgian", "saison"],
    ["Saison", "saison"], ["Amber", "saison"], ["Red Ale", "saison"],
    ["Witbier", "saison"], ["Dunkel", "saison"],
    ["Belgian Tripel", "saison"], ["Belgian Dubbel", "saison"],
  ];

  it.each(allMappedStyles)("'%s' maps to '%s'", (style, expectedFamily) => {
    expect(getStyleFamily(style)).toBe(expectedFamily);
    expect(getStyleFamily(style)).not.toBe("default");
  });
});
