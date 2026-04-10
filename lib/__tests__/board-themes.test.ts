/**
 * board-themes unit tests — Sprint A (The Display Suite)
 *
 * Verifies preset theme shape, resolveTheme fallback behavior, brand color
 * application, and CSS variable generation.
 */

import { describe, test, expect } from "vitest";
import {
  PRESET_THEMES,
  PRESET_THEME_ORDER,
  resolveTheme,
  applyBrandColor,
  themeToCssVars,
  type BoardPresetId,
} from "@/lib/board-themes";

describe("PRESET_THEMES", () => {
  const expectedIds: BoardPresetId[] = [
    "cream-classic", "midnight-gold", "slate-chalk", "neon-haze",
    "hop-harvest", "stout-roast", "coastal-salt", "burgundy-barrel",
    "rose-orchard", "brand-custom",
  ];

  test("ships exactly 10 presets", () => {
    expect(Object.keys(PRESET_THEMES)).toHaveLength(10);
  });

  test("has all expected preset IDs", () => {
    for (const id of expectedIds) {
      expect(PRESET_THEMES[id]).toBeDefined();
    }
  });

  test("every preset has a complete palette", () => {
    for (const id of expectedIds) {
      const theme = PRESET_THEMES[id];
      expect(theme.palette.bg).toBeTruthy();
      expect(theme.palette.accent).toBeTruthy();
      expect(theme.palette.text).toBeTruthy();
      expect(theme.palette.textMuted).toBeTruthy();
      expect(theme.palette.textSubtle).toBeTruthy();
      expect(theme.palette.border).toBeTruthy();
      expect(theme.palette.chipBg).toBeTruthy();
      expect(theme.palette.chipBorder).toBeTruthy();
      expect(theme.palette.danger).toBeTruthy();
    }
  });

  test("every preset has name, fontId, and isDark", () => {
    for (const id of expectedIds) {
      const theme = PRESET_THEMES[id];
      expect(theme.name).toBeTruthy();
      expect(theme.fontId).toBeTruthy();
      expect(typeof theme.isDark).toBe("boolean");
    }
  });

  test("cream-classic matches Sprint 167 palette (back-compat)", () => {
    const theme = PRESET_THEMES["cream-classic"];
    expect(theme.palette.bg).toBe("#FBF7F0");
    expect(theme.palette.accent).toBe("#D4A843");
    expect(theme.palette.text).toBe("#1A1714");
    expect(theme.palette.textMuted).toBe("#6B5E4E");
    expect(theme.palette.border).toBe("#E5DDD0");
    expect(theme.isDark).toBe(false);
  });

  test("midnight-gold is marked as dark", () => {
    expect(PRESET_THEMES["midnight-gold"].isDark).toBe(true);
  });

  test("slate-chalk uses chalk font pair", () => {
    expect(PRESET_THEMES["slate-chalk"].fontId).toBe("chalk");
  });
});

describe("PRESET_THEME_ORDER", () => {
  test("contains all 10 preset IDs", () => {
    expect(PRESET_THEME_ORDER).toHaveLength(10);
  });

  test("cream-classic is first (default)", () => {
    expect(PRESET_THEME_ORDER[0]).toBe("cream-classic");
  });

  test("brand-custom is last (upsell teaser)", () => {
    expect(PRESET_THEME_ORDER[PRESET_THEME_ORDER.length - 1]).toBe("brand-custom");
  });

  test("every ordered ID exists in PRESET_THEMES", () => {
    for (const id of PRESET_THEME_ORDER) {
      expect(PRESET_THEMES[id]).toBeDefined();
    }
  });
});

describe("resolveTheme", () => {
  test("explicit preset ID returns that preset", () => {
    const theme = resolveTheme(null, "midnight-gold");
    expect(theme.id).toBe("midnight-gold");
    expect(theme.palette.bg).toBe("#0A0906");
  });

  test("null themeId + no brewery falls back to cream-classic", () => {
    const theme = resolveTheme(null, null);
    expect(theme.id).toBe("cream-classic");
  });

  test("undefined themeId + brewery with board_theme_id uses brewery value", () => {
    const theme = resolveTheme({ board_theme_id: "hop-harvest" }, undefined);
    expect(theme.id).toBe("hop-harvest");
  });

  test("unknown themeId falls back to cream-classic", () => {
    const theme = resolveTheme(null, "not-a-real-theme");
    expect(theme.id).toBe("cream-classic");
  });

  test("brand-custom with no brand_color falls back to cream-classic", () => {
    const theme = resolveTheme({}, "brand-custom");
    expect(theme.id).toBe("cream-classic");
  });

  test("brand-custom with brand_color applies the color to accent", () => {
    const theme = resolveTheme({ brand_color: "#FF6B35" }, "brand-custom");
    expect(theme.id).toBe("brand-custom");
    expect(theme.palette.accent).toBe("#FF6B35");
  });

  test("brand-custom preserves base palette fields except accent", () => {
    const theme = resolveTheme({ brand_color: "#FF6B35" }, "brand-custom");
    const basePalette = PRESET_THEMES["brand-custom"].palette;
    expect(theme.palette.bg).toBe(basePalette.bg);
    expect(theme.palette.text).toBe(basePalette.text);
    expect(theme.palette.border).toBe(basePalette.border);
    expect(theme.palette.accent).not.toBe(basePalette.accent);
  });

  test("brewery board_theme_id is overridden by explicit themeId parameter", () => {
    const theme = resolveTheme({ board_theme_id: "midnight-gold" }, "neon-haze");
    expect(theme.id).toBe("neon-haze");
  });
});

describe("applyBrandColor", () => {
  test("replaces accent, preserves everything else", () => {
    const base = PRESET_THEMES["cream-classic"];
    const result = applyBrandColor(base, "#7B68EE");
    expect(result.palette.accent).toBe("#7B68EE");
    expect(result.palette.bg).toBe(base.palette.bg);
    expect(result.palette.text).toBe(base.palette.text);
    expect(result.name).toBe(base.name);
  });

  test("does not mutate the input theme", () => {
    const base = PRESET_THEMES["cream-classic"];
    const originalAccent = base.palette.accent;
    applyBrandColor(base, "#FF0000");
    expect(base.palette.accent).toBe(originalAccent);
  });
});

describe("themeToCssVars", () => {
  test("returns all 9 --board-* variables for cream-classic", () => {
    const vars = themeToCssVars(PRESET_THEMES["cream-classic"]);
    expect(vars["--board-bg"]).toBe("#FBF7F0");
    expect(vars["--board-accent"]).toBe("#D4A843");
    expect(vars["--board-text"]).toBe("#1A1714");
    expect(vars["--board-text-muted"]).toBe("#6B5E4E");
    expect(vars["--board-text-subtle"]).toBe("#9E8E7A");
    expect(vars["--board-border"]).toBe("#E5DDD0");
    expect(vars["--board-chip-bg"]).toBe("rgba(251,247,240,0.85)");
    expect(vars["--board-chip-border"]).toBe("#DDD5C5");
    expect(vars["--board-danger"]).toBe("#C44B3A");
  });

  test("returns dark-mode variables for midnight-gold", () => {
    const vars = themeToCssVars(PRESET_THEMES["midnight-gold"]);
    expect(vars["--board-bg"]).toBe("#0A0906");
    expect(vars["--board-accent"]).toBe("#D4A843");
  });

  test("result has exactly 9 keys", () => {
    const vars = themeToCssVars(PRESET_THEMES["cream-classic"]);
    expect(Object.keys(vars)).toHaveLength(9);
  });
});
