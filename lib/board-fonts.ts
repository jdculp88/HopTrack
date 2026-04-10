/**
 * Board fonts — Sprint A (The Display Suite)
 *
 * 8 curated Google Font pairs used by Board themes. Each pair includes a
 * display font (for beer names / featured text) and a body font (for meta,
 * stats, chip labels). All fonts are Google Fonts, all free for commercial
 * use, and all loadable via a single <link rel="stylesheet" href="..."> tag.
 *
 * Each theme references a font pair by its ID. Changing a brewery's theme
 * swaps both fonts together — we intentionally don't support mixing display
 * and body fonts across pairs, to keep pairings tasteful and prevent the
 * Board from looking like a ransom note.
 *
 * The `classic` pair matches the Sprint 167 Board default (Instrument Serif
 * + JetBrains Mono) for back-compat. Custom font selection is Cask-gated via
 * `tier-gates.ts` — Tap users always see `classic`.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type BoardFontId =
  | "classic"
  | "modern"
  | "rustic"
  | "vintage"
  | "editorial"
  | "chalk"
  | "industrial"
  | "delicate";

export interface BoardFontPair {
  id: BoardFontId;
  name: string;
  description: string;
  /** Display font family (for beer names, featured text). CSS font-family string. */
  display: string;
  /** Body font family (for metadata, stats, chips). CSS font-family string. */
  body: string;
  /** Google Fonts URL that loads both fonts in one request. */
  googleFontsUrl: string;
  /** Font weights that need to be loaded for this pair. */
  weights: {
    display: readonly number[];
    body: readonly number[];
  };
}

// ─── The 8 font pairs ─────────────────────────────────────────────────────────

export const BOARD_FONTS: Record<BoardFontId, BoardFontPair> = {
  classic: {
    id: "classic",
    name: "Classic",
    description: "The Sprint 167 default. Instrument Serif for headlines, JetBrains Mono for data.",
    display: "'Instrument Serif', 'Playfair Display', Georgia, serif",
    body: "'JetBrains Mono', 'SF Mono', Consolas, monospace",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;700&display=swap",
    weights: { display: [400], body: [400, 500, 700] },
  },

  modern: {
    id: "modern",
    name: "Modern",
    description: "Clean and geometric. Unbounded display with DM Sans body — pairs with Neon Haze.",
    display: "'Unbounded', 'Inter', system-ui, sans-serif",
    body: "'DM Sans', 'Inter', system-ui, sans-serif",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Unbounded:wght@500;700;900&family=DM+Sans:wght@400;500;700&display=swap",
    weights: { display: [500, 700, 900], body: [400, 500, 700] },
  },

  rustic: {
    id: "rustic",
    name: "Rustic",
    description: "Farmhouse warmth. Fraunces display with DM Sans — pairs with Hop Harvest and Rose Orchard.",
    display: "'Fraunces', 'Playfair Display', Georgia, serif",
    body: "'DM Sans', 'Inter', system-ui, sans-serif",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;1,9..144,400&family=DM+Sans:wght@400;500;700&display=swap",
    weights: { display: [400, 700], body: [400, 500, 700] },
  },

  vintage: {
    id: "vintage",
    name: "Vintage",
    description: "Old-world elegance. Playfair Display with DM Sans — pairs with Stout Roast and Burgundy Barrel.",
    display: "'Playfair Display', 'Fraunces', Georgia, serif",
    body: "'DM Sans', 'Inter', system-ui, sans-serif",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Sans:wght@400;500;700&display=swap",
    weights: { display: [400, 700, 900], body: [400, 500, 700] },
  },

  editorial: {
    id: "editorial",
    name: "Editorial",
    description: "Refined and airy. Cormorant Garamond with Inter — pairs with Coastal Salt.",
    display: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
    body: "'Inter', system-ui, sans-serif",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,700;1,400&family=Inter:wght@400;500;700&display=swap",
    weights: { display: [400, 500, 700], body: [400, 500, 700] },
  },

  chalk: {
    id: "chalk",
    name: "Chalk",
    description: "Handwritten chalkboard style. Caveat for beer names with Inter body — pairs with Slate Chalk.",
    display: "'Caveat', 'Kalam', cursive",
    body: "'Inter', system-ui, sans-serif",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;700&family=Inter:wght@400;500;700&display=swap",
    weights: { display: [400, 500, 700], body: [400, 500, 700] },
  },

  industrial: {
    id: "industrial",
    name: "Industrial",
    description: "Bold and masculine. Archivo Black display with Archivo body. Sports-bar vibe.",
    display: "'Archivo Black', 'Impact', sans-serif",
    body: "'Archivo', 'Inter', system-ui, sans-serif",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:wght@400;500;700&display=swap",
    weights: { display: [400], body: [400, 500, 700] },
  },

  delicate: {
    id: "delicate",
    name: "Delicate",
    description: "Refined italic serif. Cormorant italic for wine and cocktail bars with Inter body.",
    display: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
    body: "'Inter', system-ui, sans-serif",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,500;1,700&family=Inter:wght@400;500;700&display=swap",
    weights: { display: [400, 600], body: [400, 500, 700] },
  },
};

/** All font IDs in display order (used for font picker UI). */
export const BOARD_FONT_ORDER: readonly BoardFontId[] = [
  "classic",
  "modern",
  "rustic",
  "vintage",
  "editorial",
  "chalk",
  "industrial",
  "delicate",
] as const;

/**
 * Get the font pair for a given ID. Falls back to "classic" for unknown IDs.
 * Pure function — safe in render paths.
 */
export function getFontPair(id: string | null | undefined): BoardFontPair {
  if (!id || !(id in BOARD_FONTS)) return BOARD_FONTS.classic;
  return BOARD_FONTS[id as BoardFontId];
}

/**
 * Get the Google Fonts URL for a font pair ID. Used by the Board page to
 * preload the correct fonts via <link rel="stylesheet">.
 */
export function getFontPairUrl(id: string | null | undefined): string {
  return getFontPair(id).googleFontsUrl;
}
