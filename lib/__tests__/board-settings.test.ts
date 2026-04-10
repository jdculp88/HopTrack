/**
 * Board display format settings tests — Reese, Sprint 170 (The Glass)
 * Deferred from Sprint 167. Tests getEffectiveSettings(), FORMAT_FORCED,
 * FORMAT_DEFAULTS, and DEFAULT_SETTINGS from board-types.ts.
 */

import { describe, it, expect } from "vitest";
import {
  getEffectiveSettings,
  FORMAT_FORCED,
  FORMAT_DEFAULTS,
  DEFAULT_SETTINGS,
  FORMAT_LABELS,
  type BoardSettings,
  type BoardDisplayFormat,
} from "@/app/(brewery-admin)/brewery-admin/[brewery_id]/board/board-types";

// Sprint A retired grid + poster formats — the valid list is now classic / compact / slideshow.
const ALL_FORMATS: BoardDisplayFormat[] = ["classic", "compact", "slideshow"];

// ─── DEFAULT_SETTINGS ────────────────────────────────────────────────────────

describe("DEFAULT_SETTINGS", () => {
  it("defaults to classic display format", () => {
    expect(DEFAULT_SETTINGS.displayFormat).toBe("classic");
  });

  it("defaults to large font size", () => {
    expect(DEFAULT_SETTINGS.fontSize).toBe("large");
  });

  it("has all boolean toggles defined", () => {
    const boolKeys: (keyof BoardSettings)[] = [
      "showABV", "showDesc", "showPrice", "showRating", "showStyle", "showStats", "showGlass",
    ];
    for (const key of boolKeys) {
      expect(typeof DEFAULT_SETTINGS[key]).toBe("boolean");
    }
  });

  it("shows description off by default", () => {
    expect(DEFAULT_SETTINGS.showDesc).toBe(false);
  });

  it("shows glass by default", () => {
    expect(DEFAULT_SETTINGS.showGlass).toBe(true);
  });
});

// ─── FORMAT_LABELS ───────────────────────────────────────────────────────────

describe("FORMAT_LABELS", () => {
  it("has a label for every display format", () => {
    for (const fmt of ALL_FORMATS) {
      expect(FORMAT_LABELS[fmt]).toBeDefined();
      expect(typeof FORMAT_LABELS[fmt]).toBe("string");
      expect(FORMAT_LABELS[fmt].length).toBeGreaterThan(0);
    }
  });
});

// ─── FORMAT_DEFAULTS (recommended settings per format) ───────────────────────

describe("FORMAT_DEFAULTS", () => {
  it("has an entry for every display format", () => {
    for (const fmt of ALL_FORMATS) {
      expect(FORMAT_DEFAULTS[fmt]).toBeDefined();
    }
  });

  it("classic has no recommended overrides (empty)", () => {
    expect(Object.keys(FORMAT_DEFAULTS.classic)).toHaveLength(0);
  });

  it("compact recommends hiding glass, desc, rating, stats, style, and ABV", () => {
    const compact = FORMAT_DEFAULTS.compact;
    expect(compact.showGlass).toBe(false);
    expect(compact.showDesc).toBe(false);
    expect(compact.showRating).toBe(false);
    expect(compact.showStats).toBe(false);
    expect(compact.showStyle).toBe(false);
    expect(compact.showABV).toBe(false);
  });

  it("slideshow recommends showing glass, style, and description", () => {
    const slideshow = FORMAT_DEFAULTS.slideshow;
    expect(slideshow.showGlass).toBe(true);
    expect(slideshow.showStyle).toBe(true);
    expect(slideshow.showDesc).toBe(true);
  });
});

// ─── FORMAT_FORCED (hard overrides per format) ───────────────────────────────

describe("FORMAT_FORCED", () => {
  it("has an entry for every display format", () => {
    for (const fmt of ALL_FORMATS) {
      expect(FORMAT_FORCED[fmt]).toBeDefined();
    }
  });

  it("classic forces nothing (empty)", () => {
    expect(Object.keys(FORMAT_FORCED.classic)).toHaveLength(0);
  });

  it("slideshow forces nothing (empty)", () => {
    expect(Object.keys(FORMAT_FORCED.slideshow)).toHaveLength(0);
  });

  it("compact forces glass, desc, rating, and stats off", () => {
    const forced = FORMAT_FORCED.compact;
    expect(forced.showGlass).toBe(false);
    expect(forced.showDesc).toBe(false);
    expect(forced.showRating).toBe(false);
    expect(forced.showStats).toBe(false);
  });
});

// ─── getEffectiveSettings() ──────────────────────────────────────────────────

describe("getEffectiveSettings", () => {
  it("returns user settings unchanged for classic (no forced overrides)", () => {
    const userSettings: BoardSettings = {
      ...DEFAULT_SETTINGS,
      displayFormat: "classic",
      showGlass: false,
      showDesc: true,
    };
    const effective = getEffectiveSettings(userSettings);
    expect(effective).toEqual(userSettings);
  });

  it("returns user settings unchanged for slideshow (no forced overrides)", () => {
    const userSettings: BoardSettings = {
      ...DEFAULT_SETTINGS,
      displayFormat: "slideshow",
      showABV: false,
    };
    const effective = getEffectiveSettings(userSettings);
    expect(effective).toEqual(userSettings);
  });

  it("overrides user settings for compact — forces glass/desc/rating/stats off", () => {
    const userSettings: BoardSettings = {
      ...DEFAULT_SETTINGS,
      displayFormat: "compact",
      showGlass: true,
      showDesc: true,
      showRating: true,
      showStats: true,
    };
    const effective = getEffectiveSettings(userSettings);
    expect(effective.showGlass).toBe(false);
    expect(effective.showDesc).toBe(false);
    expect(effective.showRating).toBe(false);
    expect(effective.showStats).toBe(false);
  });

  it("preserves non-forced settings in compact mode", () => {
    const userSettings: BoardSettings = {
      ...DEFAULT_SETTINGS,
      displayFormat: "compact",
      showABV: true,
      showPrice: false,
      showStyle: true,
      fontSize: "xl",
    };
    const effective = getEffectiveSettings(userSettings);
    // Non-forced fields remain user-specified
    expect(effective.showABV).toBe(true);
    expect(effective.showPrice).toBe(false);
    expect(effective.showStyle).toBe(true);
    expect(effective.fontSize).toBe("xl");
    // Forced fields are overridden
    expect(effective.showGlass).toBe(false);
    expect(effective.showDesc).toBe(false);
    expect(effective.showRating).toBe(false);
    expect(effective.showStats).toBe(false);
  });

  it("preserves displayFormat in the returned settings", () => {
    for (const fmt of ALL_FORMATS) {
      const settings: BoardSettings = { ...DEFAULT_SETTINGS, displayFormat: fmt };
      const effective = getEffectiveSettings(settings);
      expect(effective.displayFormat).toBe(fmt);
    }
  });

  it("handles unknown format gracefully (falls back to no overrides)", () => {
    const settings = { ...DEFAULT_SETTINGS, displayFormat: "unknown" as BoardDisplayFormat };
    const effective = getEffectiveSettings(settings);
    // Nullish coalescing in getEffectiveSettings means unknown format returns settings as-is
    expect(effective).toEqual(settings);
  });
});
