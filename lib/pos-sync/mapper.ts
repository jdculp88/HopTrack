// POS Sync Engine — Auto-Mapping Algorithm
// Sprint 87 — The Sync Engine
// Fuzzy matching engine: POS menu items → HopTrack beers
// Target: ≥80% auto-mapped on first sync

import type { PosMenuItem, BeerForMatching, MappingResult } from "./types";

/** Common beer-name suffixes to strip for normalized comparison */
const STRIP_SUFFIXES = /\b(ipa|ale|lager|stout|porter|pilsner|wheat|sour|draft|pint|can|bottle|16oz|12oz|crowler|growler|on tap)\b/gi;
const STRIP_PUNCTUATION = /[^\w\s]/g;
const COLLAPSE_SPACES = /\s+/g;

/** Normalize a name for comparison: lowercase, strip suffixes, trim */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(STRIP_PUNCTUATION, " ")
    .replace(STRIP_SUFFIXES, " ")
    .replace(COLLAPSE_SPACES, " ")
    .trim();
}

/**
 * Levenshtein distance between two strings.
 * Returns the minimum edit operations (insert, delete, replace) needed.
 */
export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  // Use single-row optimization
  const prev = Array.from({ length: n + 1 }, (_, i) => i);
  const curr = new Array(n + 1);

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,      // deletion
        curr[j - 1] + 1,  // insertion
        prev[j - 1] + cost // substitution
      );
    }
    // Swap rows
    for (let j = 0; j <= n; j++) prev[j] = curr[j];
  }

  return prev[n];
}

/** Map POS category strings to HopTrack item types */
const _CATEGORY_TO_ITEM_TYPE: Record<string, string> = {
  beer: "beer", draft: "beer", ale: "beer", lager: "beer",
  cider: "cider", "hard cider": "cider",
  wine: "wine", "red wine": "wine", "white wine": "wine",
  cocktail: "cocktail", mixed: "cocktail", spirit: "cocktail",
  "non-alcoholic": "non_alcoholic", na: "non_alcoholic", soda: "non_alcoholic", mocktail: "non_alcoholic",
};

/** Map POS category to a beer style hint for better matching */
function getCategoryStyleHint(category: string | null): string | null {
  if (!category) return null;
  const lower = category.toLowerCase();
  // If category contains a style keyword, return it
  const styles = ["ipa", "stout", "porter", "lager", "pilsner", "wheat", "sour", "amber", "pale ale", "blonde", "saison", "kolsch"];
  return styles.find(s => lower.includes(s)) || null;
}

/**
 * Auto-map POS menu items to HopTrack beers.
 *
 * 4-stage matching:
 * 1. Exact — pos_item_id match (previously mapped)
 * 2. Exact name — lowercase exact match
 * 3. Normalized name — strip suffixes, compare cores
 * 4. Fuzzy — Levenshtein ≤ 3 on normalized names, with optional style hint
 *
 * Returns a MappingResult per POS item with confidence scoring.
 */
export function autoMap(
  posItems: PosMenuItem[],
  beers: BeerForMatching[]
): MappingResult[] {
  const results: MappingResult[] = [];
  const usedBeerIds = new Set<string>();

  // Pre-compute normalized beer names
  const beersByPosItemId = new Map<string, BeerForMatching>();
  const beersByExactName = new Map<string, BeerForMatching>();
  const beersNormalized = beers.map(b => ({
    beer: b,
    normalized: normalizeName(b.name),
    lower: b.name.toLowerCase(),
  }));

  // Build lookup indexes
  for (const beer of beers) {
    if (beer.pos_item_id) beersByPosItemId.set(beer.pos_item_id, beer);
    beersByExactName.set(beer.name.toLowerCase(), beer);
  }

  for (const item of posItems) {
    let matched: BeerForMatching | null = null;
    let confidence: MappingResult["confidence"] = "none";
    let conflict: MappingResult["conflict"] | undefined;

    // Stage 1: Exact pos_item_id match
    const byId = beersByPosItemId.get(item.pos_item_id);
    if (byId && !usedBeerIds.has(byId.id)) {
      matched = byId;
      confidence = "high";

      // Check for name divergence (conflict)
      if (byId.name.toLowerCase() !== item.name.toLowerCase()) {
        conflict = { pos_name: item.name, hoptrack_name: byId.name };
      }
    }

    // Stage 2: Exact name match
    if (!matched) {
      const byName = beersByExactName.get(item.name.toLowerCase());
      if (byName && !usedBeerIds.has(byName.id)) {
        matched = byName;
        confidence = "high";
      }
    }

    // Stage 3: Normalized name match
    if (!matched) {
      const normalizedItem = normalizeName(item.name);
      if (normalizedItem.length > 0) {
        for (const entry of beersNormalized) {
          if (usedBeerIds.has(entry.beer.id)) continue;
          if (entry.normalized === normalizedItem) {
            matched = entry.beer;
            confidence = "medium";
            break;
          }
        }
      }
    }

    // Stage 4: Fuzzy match (Levenshtein ≤ 3)
    if (!matched) {
      const normalizedItem = normalizeName(item.name);
      if (normalizedItem.length > 0) {
        let bestDist = 4; // threshold + 1
        let bestMatch: BeerForMatching | null = null;
        const styleHint = getCategoryStyleHint(item.category);

        for (const entry of beersNormalized) {
          if (usedBeerIds.has(entry.beer.id)) continue;
          const dist = levenshtein(normalizedItem, entry.normalized);
          if (dist < bestDist) {
            bestDist = dist;
            bestMatch = entry.beer;
          } else if (dist === bestDist && bestMatch && styleHint) {
            // Prefer style-matching beer at same edit distance
            if (entry.beer.style?.toLowerCase().includes(styleHint) &&
                !bestMatch.style?.toLowerCase().includes(styleHint)) {
              bestMatch = entry.beer;
            }
          }
        }

        if (bestMatch) {
          matched = bestMatch;
          confidence = bestDist <= 1 ? "medium" : "low";
        }
      }
    }

    // Also check substring containment for short POS names (e.g. "Hazy" matching "Hazy Little Thing IPA")
    if (!matched) {
      const lowerItem = item.name.toLowerCase();
      if (lowerItem.length >= 4) {
        for (const entry of beersNormalized) {
          if (usedBeerIds.has(entry.beer.id)) continue;
          if (entry.lower.includes(lowerItem) || lowerItem.includes(entry.lower)) {
            matched = entry.beer;
            confidence = "low";
            break;
          }
        }
      }
    }

    if (matched) {
      usedBeerIds.add(matched.id);
    }

    results.push({
      pos_item_id: item.pos_item_id,
      pos_item_name: item.name,
      beer_id: matched?.id ?? null,
      beer_name: matched?.name ?? null,
      mapping_type: matched ? (confidence === "high" ? "auto" : "auto") : "unmapped",
      confidence: matched ? confidence : "none",
      conflict,
    });
  }

  return results;
}
