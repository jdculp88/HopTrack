/**
 * Beer & Beverage Style Color System — Design System v2.0
 * Maps any beer style string → one of 10 beer color families.
 * Maps non-beer item types → dedicated category colors (Sprint 83).
 * Each family maps to CSS variables defined in globals.css.
 *
 * 4 values per family: primary (saturated), light (mid), soft (lighter), tint (background wash).
 * Legacy: `light` field = tint for backward compatibility. Use `tint` for new code.
 *
 * Rule: Style = Color, Always.
 * IPA is always hop green. Stout is always espresso. Cider is always orchard rose. No exceptions.
 */

export type BeerStyleFamily =
  | "ipa" | "stout" | "sour" | "porter" | "lager" | "saison"
  | "pilsner" | "amber" | "dipa" | "pale_ale"
  | "cider" | "wine" | "cocktail" | "na"
  | "default";

/** CSS variable names for each color family (4 values: primary/light/soft/tint) */
export const STYLE_FAMILY_VARS: Record<BeerStyleFamily, {
  primary: string;
  light: string;   // Legacy: points to tint for backward compat
  soft: string;
  tint: string;    // DS v2: lightest background wash
  lt: string;      // DS v2: mid-light shade
}> = {
  stout:    { primary: "var(--stout-espresso)",     light: "var(--stout-espresso-light)",   soft: "var(--stout-espresso-soft)",    tint: "var(--stout-espresso-tint)",    lt: "var(--stout-espresso-lt)" },
  porter:   { primary: "var(--porter-plum)",        light: "var(--porter-plum-light)",      soft: "var(--porter-plum-soft)",       tint: "var(--porter-plum-tint)",       lt: "var(--porter-plum-lt)" },
  ipa:      { primary: "var(--ipa-green)",          light: "var(--ipa-green-light)",        soft: "var(--ipa-green-soft)",         tint: "var(--ipa-green-tint)",         lt: "var(--ipa-green-lt)" },
  sour:     { primary: "var(--sour-berry)",         light: "var(--sour-berry-light)",       soft: "var(--sour-berry-soft)",        tint: "var(--sour-berry-tint)",        lt: "var(--sour-berry-lt)" },
  lager:    { primary: "var(--lager-sky)",          light: "var(--lager-sky-light)",        soft: "var(--lager-sky-soft)",         tint: "var(--lager-sky-tint)",         lt: "var(--lager-sky-lt)" },
  saison:   { primary: "var(--saison-peach)",       light: "var(--saison-peach-light)",     soft: "var(--saison-peach-soft)",      tint: "var(--saison-peach-tint)",      lt: "var(--saison-peach-lt)" },
  pilsner:  { primary: "var(--pilsner-grain)",      light: "var(--pilsner-grain-tint)",     soft: "var(--pilsner-grain-soft)",     tint: "var(--pilsner-grain-tint)",     lt: "var(--pilsner-grain-lt)" },
  amber:    { primary: "var(--amber-fire)",         light: "var(--amber-fire-tint)",        soft: "var(--amber-fire-soft)",        tint: "var(--amber-fire-tint)",        lt: "var(--amber-fire-lt)" },
  dipa:     { primary: "var(--dipa-hop)",           light: "var(--dipa-hop-tint)",          soft: "var(--dipa-hop-soft)",          tint: "var(--dipa-hop-tint)",          lt: "var(--dipa-hop-lt)" },
  pale_ale: { primary: "var(--pale-meadow)",        light: "var(--pale-meadow-tint)",       soft: "var(--pale-meadow-soft)",       tint: "var(--pale-meadow-tint)",       lt: "var(--pale-meadow-lt)" },
  cider:    { primary: "var(--cider-rose)",         light: "var(--cider-rose-light)",       soft: "var(--cider-rose-soft)",        tint: "var(--cider-rose-light)",       lt: "var(--cider-rose-soft)" },
  wine:     { primary: "var(--wine-burgundy)",      light: "var(--wine-burgundy-light)",    soft: "var(--wine-burgundy-soft)",     tint: "var(--wine-burgundy-light)",    lt: "var(--wine-burgundy-soft)" },
  cocktail: { primary: "var(--cocktail-teal)",      light: "var(--cocktail-teal-light)",    soft: "var(--cocktail-teal-soft)",     tint: "var(--cocktail-teal-light)",    lt: "var(--cocktail-teal-soft)" },
  na:       { primary: "var(--na-lemon)",           light: "var(--na-lemon-light)",         soft: "var(--na-lemon-soft)",          tint: "var(--na-lemon-light)",         lt: "var(--na-lemon-soft)" },
  default:  { primary: "var(--accent-gold)",        light: "var(--surface-2)",              soft: "var(--accent-amber)",           tint: "var(--surface-2)",              lt: "var(--accent-amber)" },
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
  "Hazy IPA":          "ipa",
  "Session IPA":       "ipa",
  "New England IPA":   "ipa",
  "West Coast IPA":    "ipa",

  // DIPA family — deep hop (DS v2: split from IPA)
  "Double IPA":        "dipa",
  "Imperial IPA":      "dipa",
  "Triple IPA":        "dipa",

  // Pale Ale family — meadow (DS v2: split from IPA)
  "Pale Ale":          "pale_ale",
  "American Pale Ale": "pale_ale",
  "English Pale Ale":  "pale_ale",

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
  "Kolsch":            "lager",
  "Kölsch":            "lager",
  "Blonde Ale":        "lager",
  "Cream Ale":         "lager",
  "Helles":            "lager",

  // Pilsner family — golden grain (DS v2: split from lager)
  "Pilsner":           "pilsner",
  "Czech Pilsner":     "pilsner",
  "German Pilsner":    "pilsner",

  // Saison/Wheat family — harvest peach
  "Wheat":             "saison",
  "Hefeweizen":        "saison",
  "Belgian":           "saison",
  "Saison":            "saison",
  "Witbier":           "saison",
  "Dunkel":            "saison",
  "Belgian Tripel":    "saison",
  "Belgian Dubbel":    "saison",

  // Amber family — copper fire (DS v2: split from saison)
  "Amber":             "amber",
  "Red Ale":           "amber",
  "Irish Red":         "amber",
  "Märzen":            "amber",
  "Oktoberfest":       "amber",
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
