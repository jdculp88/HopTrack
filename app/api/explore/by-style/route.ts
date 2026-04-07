/**
 * Explore by Style API — Sprint 160 (The Flow)
 *
 * Returns beers + breweries matching a style family (ipa, stout, sour, etc.)
 *
 * Query: ?family=ipa|stout|sour|porter|lager|saison|cider|wine|cocktail|na
 *
 * Auth required.
 */

import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/api-helpers";
import { apiSuccess, apiError, apiBadRequest, apiUnauthorized } from "@/lib/api-response";
import { getStyleFamily, type BeerStyleFamily } from "@/lib/beerStyleColors";

// Rate limit: 60 req/min per user
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const VALID_FAMILIES: readonly BeerStyleFamily[] = [
  "ipa",
  "stout",
  "sour",
  "porter",
  "lager",
  "saison",
  "cider",
  "wine",
  "cocktail",
  "na",
] as const;

// Canonical style strings for each family (used for .in() filter)
// These are the keys from STYLE_TO_FAMILY in lib/beerStyleColors.ts
const FAMILY_STYLES: Record<BeerStyleFamily, string[]> = {
  ipa: ["IPA", "Hazy IPA", "Session IPA", "New England IPA", "West Coast IPA"],
  dipa: ["Double IPA", "Imperial IPA", "Triple IPA"],
  pale_ale: ["Pale Ale", "American Pale Ale", "English Pale Ale"],
  stout: ["Stout", "Imperial Stout", "Milk Stout", "Oatmeal Stout", "Dry Stout"],
  sour: ["Sour", "Gose", "Berliner Weisse", "Lambic", "Gueuze", "Flanders Red", "Wild Ale"],
  porter: ["Porter", "Brown Ale", "Barleywine", "English Barleywine", "Robust Porter", "Baltic Porter"],
  lager: ["Lager", "Kolsch", "Kölsch", "Blonde Ale", "Cream Ale", "Helles"],
  pilsner: ["Pilsner", "Czech Pilsner", "German Pilsner"],
  saison: ["Wheat", "Hefeweizen", "Belgian", "Saison", "Witbier", "Dunkel", "Belgian Tripel", "Belgian Dubbel"],
  amber: ["Amber", "Red Ale", "Irish Red", "Märzen", "Oktoberfest"],
  cider: [],
  wine: [],
  cocktail: [],
  na: [],
  default: [],
};

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await requireAuth(supabase);
    if (!user) return apiUnauthorized();

    // Rate limit
    const now = Date.now();
    const bucket = rateLimitMap.get(user.id);
    if (bucket && bucket.resetAt > now) {
      if (bucket.count >= 60) return apiError("Rate limit exceeded", "RATE_LIMITED", 429);
      bucket.count++;
    } else {
      rateLimitMap.set(user.id, { count: 1, resetAt: now + 60_000 });
    }

    // Validate family param
    const { searchParams } = new URL(request.url);
    const family = searchParams.get("family") as BeerStyleFamily | null;
    if (!family || !VALID_FAMILIES.includes(family)) {
      return apiBadRequest(
        `family must be one of: ${VALID_FAMILIES.join(", ")}`,
        "family"
      );
    }

    const cityFilter = searchParams.get("city");

    // Handle non-beer item types (cider/wine/cocktail/na) separately
    const itemType = family === "cider" ? "cider"
      : family === "wine" ? "wine"
      : family === "cocktail" ? "cocktail"
      : family === "na" ? "na_beverage"
      : null;

    let beersQuery = supabase
      .from("beers")
      .select("id, name, style, abv, avg_rating, total_ratings, item_type, brewery_id, brewery:breweries(id, name, city, state)")
      .order("avg_rating", { ascending: false, nullsFirst: false })
      .limit(30);

    if (itemType) {
      beersQuery = beersQuery.eq("item_type", itemType);
    } else {
      // Beer style filter
      const styles = FAMILY_STYLES[family];
      if (styles.length === 0) {
        return apiBadRequest(`No styles mapped for family: ${family}`, "family");
      }
      beersQuery = beersQuery.in("style", styles);
    }

    const { data: beersRaw } = await (beersQuery as any);
    const beers = ((beersRaw ?? []) as any[]);

    // Filter by city if provided (client-side filter on joined brewery)
    const filteredBeers = cityFilter
      ? beers.filter((b: any) => b.brewery?.city === cityFilter)
      : beers;

    // Double-check style matches via getStyleFamily (guards against missed mappings)
    const matchedBeers = filteredBeers.filter((b: any) => {
      const actualFamily = getStyleFamily(b.style, b.item_type);
      return actualFamily === family;
    });

    // Aggregate unique breweries
    const breweryMap = new Map<string, { id: string; name: string; city: string | null; state: string | null; beerCount: number }>();
    for (const beer of matchedBeers) {
      if (!beer.brewery?.id) continue;
      const existing = breweryMap.get(beer.brewery.id);
      if (existing) {
        existing.beerCount++;
      } else {
        breweryMap.set(beer.brewery.id, {
          id: beer.brewery.id,
          name: beer.brewery.name,
          city: beer.brewery.city ?? null,
          state: beer.brewery.state ?? null,
          beerCount: 1,
        });
      }
    }

    const breweries = [...breweryMap.values()].sort((a, b) => b.beerCount - a.beerCount).slice(0, 20);

    return apiSuccess(
      { beers: matchedBeers.slice(0, 20), breweries },
      200,
      { family, beerCount: matchedBeers.length, breweryCount: breweries.length },
      { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" }
    );
  } catch (err) {
    console.error("Explore by-style API error:", err);
    return apiError("Failed to fetch beers by style", "BY_STYLE_FETCH_ERROR", 500);
  }
}
