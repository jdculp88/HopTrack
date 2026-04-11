/**
 * Standardized sensory note libraries for beer tasting.
 *
 * Sourced from the Beer Judge Certification Program (BJCP) style guidelines,
 * Cicerone Certification Program tasting vocabulary, and common brewer
 * shorthand. Breweries pick from these lists in the tap list form, but can
 * also type a custom note if their term isn't present.
 *
 * Order within each category is roughly "most common → least common" so the
 * picker surfaces the big hitters first when typing. Lists stay intentionally
 * comprehensive but not exhaustive — the free-text escape hatch handles the
 * long tail.
 *
 * Each list is a readonly tuple so TypeScript narrows to literal types where
 * the picker needs exact matches.
 */

// ─── Aroma notes ─────────────────────────────────────────────────────────────
// "What does it smell like" — nose/olfactory descriptors. Covers hop-forward,
// malt-forward, yeast-derived, and barrel-aged beers.

export const AROMA_NOTES = [
  // Citrus & tropical hops
  "Citrus", "Grapefruit", "Orange", "Lemon", "Lime", "Tangerine",
  "Tropical", "Mango", "Passionfruit", "Pineapple", "Guava", "Papaya",
  // Stone & pome fruit
  "Peach", "Apricot", "Pear", "Apple", "Cherry",
  // Berry
  "Strawberry", "Raspberry", "Blueberry", "Blackberry",
  // Piney / resinous hops
  "Pine", "Resinous", "Dank", "Herbal", "Grassy", "Floral", "Earthy",
  // Spice & pepper
  "Pepper", "Clove", "Coriander", "Cardamom", "Anise",
  // Malt-derived
  "Bread", "Biscuit", "Toast", "Toasty", "Caramel", "Toffee", "Honey",
  "Molasses", "Bready", "Doughy", "Nutty",
  // Roast
  "Chocolate", "Cocoa", "Coffee", "Espresso", "Roasty", "Burnt",
  // Yeast / fermentation
  "Banana", "Bubblegum", "Pear Drop", "Yeasty", "Bready Yeast",
  // Sour / funky
  "Tart", "Lactic", "Funky", "Barnyard", "Horse Blanket", "Leather",
  "Vinegar", "Acetic",
  // Barrel & wood
  "Vanilla", "Oak", "Bourbon", "Whiskey", "Rum", "Wine Barrel",
  // Smoke & peat
  "Smoke", "Peat", "Smoky", "Campfire",
  // Other
  "Dark Fruit", "Raisin", "Plum", "Fig", "Date",
  "Tobacco", "Soy Sauce",
] as const;

// ─── Taste notes ─────────────────────────────────────────────────────────────
// "What does it taste like on the palate" — flavor descriptors plus mouthfeel
// crossover terms that brewers commonly use. Separate from aroma because some
// beers smell like one thing and taste like another (e.g. Hazy IPAs smell
// tropical but taste softly bitter).

export const TASTE_NOTES = [
  // Bitterness / hop character
  "Bitter", "Hoppy", "Resinous", "Dank", "Piney", "Herbal",
  // Sweetness
  "Sweet", "Honey", "Caramel", "Toffee", "Molasses", "Maple",
  // Malt character
  "Malty", "Bready", "Biscuity", "Toasty", "Nutty", "Grainy",
  // Roast
  "Roasty", "Chocolate", "Cocoa", "Coffee", "Espresso", "Burnt",
  // Fruit
  "Juicy", "Tropical", "Citrus", "Grapefruit", "Stone Fruit",
  "Dark Fruit", "Berry", "Apple", "Pear",
  // Spice / yeast
  "Spicy", "Peppery", "Clove", "Banana",
  // Acidity / sour
  "Tart", "Sour", "Puckering", "Lactic", "Acidic", "Funky",
  // Body & mouthfeel
  "Crisp", "Clean", "Dry", "Full-bodied", "Light-bodied", "Medium-bodied",
  "Creamy", "Silky", "Smooth", "Pillowy", "Velvety", "Round",
  "Effervescent", "Prickly",
  // Alcohol
  "Boozy", "Warming",
  // Barrel
  "Vanilla", "Oak", "Bourbon", "Whiskey",
  // Smoke
  "Smoky", "Peat",
  // Balance descriptors
  "Balanced", "Rich", "Complex", "Sessionable",
] as const;

// ─── Finish notes ────────────────────────────────────────────────────────────
// "What lingers after the swallow" — the aftertaste + final impression.
// Shorter list because finish is mostly about residual bitterness, dryness,
// or warmth rather than the full flavor spectrum.

export const FINISH_NOTES = [
  // Dry / clean
  "Dry", "Crisp", "Clean", "Snappy", "Refreshing",
  // Bitter
  "Bitter", "Lingering Bitter", "Resinous Finish", "Hoppy Finish",
  // Sweet
  "Sweet", "Sweet Finish", "Honey", "Caramel",
  // Malt / bread
  "Malty", "Biscuity", "Bready",
  // Roast
  "Roasty", "Coffee", "Chocolate", "Burnt",
  // Sour
  "Tart", "Puckering", "Lactic",
  // Spice (Belgians, saisons)
  "Peppery",
  // Mouthfeel finish
  "Smooth", "Creamy", "Silky", "Pillowy", "Round",
  // Warmth / alcohol
  "Warming", "Boozy", "Hot",
  // Barrel / wood
  "Oaky", "Vanilla", "Bourbon",
  // Smoke
  "Smoky", "Peat",
  // Other
  "Mineral", "Saline", "Crackery",
  "Long", "Short", "Quick",
] as const;

// ─── Narrow types ────────────────────────────────────────────────────────────

export type AromaNote  = (typeof AROMA_NOTES)[number];
export type TasteNote  = (typeof TASTE_NOTES)[number];
export type FinishNote = (typeof FINISH_NOTES)[number];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Case-insensitive membership check so "pine" and "Pine" both match. Used by
 * the picker to decide whether a typed value already exists in the list or
 * should be offered as a custom addition.
 */
export function isKnownNote(
  value: string,
  list: readonly string[],
): boolean {
  const v = value.trim().toLowerCase();
  if (!v) return false;
  return list.some(n => n.toLowerCase() === v);
}

/**
 * Title-case a free-text note so user-typed "pine" becomes "Pine" on save.
 * Keeps acronyms (ESB, NEIPA) uppercased if the user wrote them that way.
 */
export function normalizeNote(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  // Preserve ALL-CAPS words (BJCP, NEIPA, ESB, etc.)
  if (trimmed === trimmed.toUpperCase() && trimmed.length <= 5) return trimmed;
  return trimmed
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map(w => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}
