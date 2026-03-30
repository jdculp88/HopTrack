/**
 * Beer Style Color System — Sprint 63
 * Maps any beer style string → one of 6 color families.
 * Each family maps to CSS variables defined in globals.css.
 *
 * Rule: Style = Color, Always.
 * IPA is always hop green. Stout is always espresso. No exceptions.
 */

export type BeerStyleFamily = "ipa" | "stout" | "sour" | "porter" | "lager" | "saison" | "default";

/** CSS variable names for each color family */
export const STYLE_FAMILY_VARS: Record<BeerStyleFamily, { primary: string; light: string; soft: string }> = {
  ipa:     { primary: "var(--ipa-green)",          light: "var(--ipa-green-light)",        soft: "var(--ipa-green-soft)" },
  stout:   { primary: "var(--stout-espresso-mid)", light: "var(--stout-espresso-light)",   soft: "var(--stout-espresso-mid)" },
  sour:    { primary: "var(--sour-berry)",          light: "var(--sour-berry-light)",       soft: "var(--sour-berry-soft)" },
  porter:  { primary: "var(--porter-plum)",         light: "var(--porter-plum-light)",      soft: "var(--porter-plum-soft)" },
  lager:   { primary: "var(--lager-sky)",           light: "var(--lager-sky-light)",        soft: "var(--lager-sky-soft)" },
  saison:  { primary: "var(--saison-peach)",        light: "var(--saison-peach-light)",     soft: "var(--saison-peach)" },
  default: { primary: "var(--accent-gold)",         light: "var(--surface-2)",              soft: "var(--accent-amber)" },
};

/** Maps beer style strings → family key */
const STYLE_TO_FAMILY: Record<string, BeerStyleFamily> = {
  // IPA family — hop green
  "IPA":               "ipa",
  "Double IPA":        "ipa",
  "Hazy IPA":          "ipa",
  "Session IPA":       "ipa",
  "Pale Ale":          "ipa",
  "New England IPA":   "ipa",
  "West Coast IPA":    "ipa",
  "Imperial IPA":      "ipa",

  // Stout family — espresso
  "Stout":             "stout",
  "Imperial Stout":    "stout",
  "Milk Stout":        "stout",
  "Oatmeal Stout":     "stout",
  "Dry Stout":         "stout",

  // Sour family — wild berry
  "Sour":              "sour",
  "Gose":              "sour",
  "Berliner Weisse":   "sour",
  "Lambic":            "sour",
  "Gueuze":            "sour",
  "Flanders Red":      "sour",
  "Wild Ale":          "sour",

  // Porter family — barrel plum
  "Porter":            "porter",
  "Brown Ale":         "porter",
  "Barleywine":        "porter",
  "English Barleywine": "porter",
  "Robust Porter":     "porter",
  "Baltic Porter":     "porter",

  // Lager family — crisp sky
  "Lager":             "lager",
  "Pilsner":           "lager",
  "Kolsch":            "lager",
  "Kölsch":            "lager",
  "Blonde Ale":        "lager",
  "Cream Ale":         "lager",
  "Helles":            "lager",
  "Märzen":            "lager",
  "Oktoberfest":       "lager",

  // Saison family — harvest peach (closest to core brand gold)
  "Wheat":             "saison",
  "Hefeweizen":        "saison",
  "Belgian":           "saison",
  "Saison":            "saison",
  "Amber":             "saison",
  "Red Ale":           "saison",
  "Witbier":           "saison",
  "Dunkel":            "saison",
  "Belgian Tripel":    "saison",
  "Belgian Dubbel":    "saison",
};

/**
 * Returns the color family for a given beer style string.
 * Falls back to "default" (amber/gold) for unknown styles.
 */
export function getStyleFamily(style: string | null | undefined): BeerStyleFamily {
  if (!style) return "default";
  return STYLE_TO_FAMILY[style] ?? "default";
}

/**
 * Returns CSS variable strings for a given beer style.
 * Use for inline styles: `style={{ color: getStyleVars(beer.style).primary }}`
 */
export function getStyleVars(style: string | null | undefined) {
  return STYLE_FAMILY_VARS[getStyleFamily(style)];
}

/**
 * Returns the data-style attribute value for CSS card background classes.
 * Use on `.card-bg-reco` and `.card-bg-collection` elements.
 */
export function getStyleDataAttr(style: string | null | undefined): BeerStyleFamily {
  return getStyleFamily(style);
}
