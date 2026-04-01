/**
 * Beer & Beverage Style Color System — Sprint 63 + Sprint 83
 * Maps any beer style string → one of 6 beer color families.
 * Maps non-beer item types → dedicated category colors (Sprint 83).
 * Each family maps to CSS variables defined in globals.css.
 *
 * Rule: Style = Color, Always.
 * IPA is always hop green. Stout is always espresso. Cider is always orchard rose. No exceptions.
 */

export type BeerStyleFamily =
  | "ipa" | "stout" | "sour" | "porter" | "lager" | "saison"
  | "cider" | "wine" | "cocktail" | "na"
  | "default";

/** CSS variable names for each color family */
export const STYLE_FAMILY_VARS: Record<BeerStyleFamily, { primary: string; light: string; soft: string }> = {
  ipa:      { primary: "var(--ipa-green)",          light: "var(--ipa-green-light)",        soft: "var(--ipa-green-soft)" },
  stout:    { primary: "var(--stout-espresso-mid)", light: "var(--stout-espresso-light)",   soft: "var(--stout-espresso-mid)" },
  sour:     { primary: "var(--sour-berry)",         light: "var(--sour-berry-light)",       soft: "var(--sour-berry-soft)" },
  porter:   { primary: "var(--porter-plum)",        light: "var(--porter-plum-light)",      soft: "var(--porter-plum-soft)" },
  lager:    { primary: "var(--lager-sky)",          light: "var(--lager-sky-light)",        soft: "var(--lager-sky-soft)" },
  saison:   { primary: "var(--saison-peach)",       light: "var(--saison-peach-light)",     soft: "var(--saison-peach)" },
  cider:    { primary: "var(--cider-rose)",         light: "var(--cider-rose-light)",       soft: "var(--cider-rose-soft)" },
  wine:     { primary: "var(--wine-burgundy)",      light: "var(--wine-burgundy-light)",    soft: "var(--wine-burgundy-soft)" },
  cocktail: { primary: "var(--cocktail-teal)",      light: "var(--cocktail-teal-light)",    soft: "var(--cocktail-teal-soft)" },
  na:       { primary: "var(--na-lemon)",           light: "var(--na-lemon-light)",         soft: "var(--na-lemon-soft)" },
  default:  { primary: "var(--accent-gold)",        light: "var(--surface-2)",              soft: "var(--accent-amber)" },
};

/** Maps item_type values → category color family (non-beer items) */
const ITEM_TYPE_TO_FAMILY: Record<string, BeerStyleFamily> = {
  "cider":        "cider",
  "wine":         "wine",
  "cocktail":     "cocktail",
  "na_beverage":  "na",
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
 * Returns the color family for a given beer style string and optional item type.
 * Non-beer item types (cider, wine, cocktail, na_beverage) get their own
 * dedicated color family, bypassing the beer-style lookup.
 * Falls back to "default" (amber/gold) for unknown styles.
 */
export function getStyleFamily(style: string | null | undefined, itemType?: string | null): BeerStyleFamily {
  // Non-beer item types get their own category color
  if (itemType && itemType !== "beer") {
    return ITEM_TYPE_TO_FAMILY[itemType] ?? "default";
  }
  if (!style) return "default";
  return STYLE_TO_FAMILY[style] ?? "default";
}

/**
 * Returns CSS variable strings for a given beer style (and optional item type).
 * Use for inline styles: `style={{ color: getStyleVars(beer.style, beer.item_type).primary }}`
 */
export function getStyleVars(style: string | null | undefined, itemType?: string | null) {
  return STYLE_FAMILY_VARS[getStyleFamily(style, itemType)];
}

/**
 * Returns the data-style attribute value for CSS card background classes.
 * Use on `.card-bg-reco` and `.card-bg-collection` elements.
 */
export function getStyleDataAttr(style: string | null | undefined, itemType?: string | null): BeerStyleFamily {
  return getStyleFamily(style, itemType);
}
