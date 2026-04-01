// POS Sync Engine — Mock Provider
// Sprint 87 — The Sync Engine
// Generates realistic POS menu data for testing without real API access
// Toggled by POS_MOCK_MODE=true env var

import type { PosMenuItem } from "./types";

/** Check if mock mode is enabled */
export function isMockMode(): boolean {
  return process.env.POS_MOCK_MODE === "true";
}

const MOCK_BEERS = [
  { name: "Hop Highway IPA", category: "Draft Beer", price: 750, style: "ipa" },
  { name: "Dark Passage Stout", category: "Draft Beer", price: 800, style: "stout" },
  { name: "Golden Mile Lager", category: "Draft Beer", price: 650, style: "lager" },
  { name: "Sour Route 66", category: "Draft Beer", price: 850, style: "sour" },
  { name: "Amber Trailhead", category: "Draft Beer", price: 700, style: "amber" },
  { name: "Pale Wanderer", category: "Draft Beer", price: 700, style: "pale ale" },
  { name: "Double Summit DIPA", category: "Draft Beer", price: 900, style: "double ipa" },
  { name: "Wheat Field Hefeweizen", category: "Draft Beer", price: 650, style: "wheat" },
  { name: "Barrel Aged Porter", category: "Draft Beer", price: 1000, style: "porter" },
  { name: "Session Blonde", category: "Draft Beer", price: 600, style: "blonde ale" },
  { name: "Belgian Detour Tripel", category: "Draft Beer", price: 950, style: "belgian" },
  { name: "Pilsner Express", category: "Draft Beer", price: 650, style: "pilsner" },
  { name: "Kolsch Connection", category: "Draft Beer", price: 650, style: "kolsch" },
  { name: "Red Ale Reroute", category: "Draft Beer", price: 700, style: "red ale" },
  { name: "Saison Scenic", category: "Draft Beer", price: 800, style: "saison" },
  { name: "Orchard Ramble Cider", category: "Ciders", price: 750, style: "cider" },
  { name: "Dry Hopped Cider", category: "Ciders", price: 800, style: "cider" },
  { name: "Ginger Pear Cider", category: "Ciders", price: 750, style: "cider" },
  { name: "House Red Blend", category: "Wine", price: 1200, style: "wine" },
  { name: "Chardonnay", category: "Wine", price: 1100, style: "wine" },
  { name: "Old Fashioned", category: "Cocktails", price: 1400, style: "cocktail" },
  { name: "Mango Mule", category: "Cocktails", price: 1300, style: "cocktail" },
  { name: "Hop Water Sparkling", category: "Non-Alcoholic", price: 500, style: "na" },
  { name: "Ginger Kombucha", category: "Non-Alcoholic", price: 600, style: "na" },
];

/**
 * Generate mock POS menu items.
 * @param count Number of items to generate (default: 20, max: MOCK_BEERS.length)
 * @param seed Optional seed for deterministic shuffling
 */
export function generateMockMenuItems(count = 20, seed?: number): PosMenuItem[] {
  const items = [...MOCK_BEERS];

  // Simple seeded shuffle
  const rng = seed !== undefined ? seededRandom(seed) : Math.random;
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }

  return items.slice(0, Math.min(count, items.length)).map((item, i) => ({
    pos_item_id: `mock_${i + 1}_${item.name.toLowerCase().replace(/\s+/g, "_")}`,
    name: item.name,
    category: item.category,
    price_cents: item.price,
    is_available: true,
    description: null,
    item_type: item.category === "Ciders" ? "cider"
      : item.category === "Wine" ? "wine"
      : item.category === "Cocktails" ? "cocktail"
      : item.category === "Non-Alcoholic" ? "non_alcoholic"
      : "beer",
  }));
}

/**
 * Generate a mock Toast webhook payload for menus.updated.
 */
export function generateMockToastWebhook(count = 15): unknown {
  const items = generateMockMenuItems(count);
  // Group by category for Toast's nested structure
  const groups = new Map<string, any[]>();
  for (const item of items) {
    const cat = item.category || "Other";
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat)!.push({
      guid: item.pos_item_id,
      name: item.name,
      description: item.description,
      pricing: { basePrice: (item.price_cents || 0) / 100 },
      visibility: item.is_available ? "VISIBLE" : "HIDDEN",
    });
  }

  return {
    eventType: "menus.updated",
    timestamp: new Date().toISOString(),
    menus: [{
      menuGroups: Array.from(groups.entries()).map(([name, menuItems]) => ({
        name,
        menuItems,
      })),
    }],
  };
}

/**
 * Generate a mock Square webhook payload for catalog.version.updated.
 * Note: Square webhooks are notifications only — they don't include catalog data.
 */
export function generateMockSquareWebhook(merchantId = "mock_merchant_123"): unknown {
  return {
    type: "catalog.version.updated",
    merchant_id: merchantId,
    created_at: new Date().toISOString(),
    data: { type: "catalog", id: "catalog_version_" + Date.now() },
  };
}

/**
 * Generate a mock Square catalog API response.
 */
export function generateMockSquareCatalog(count = 15): unknown {
  const items = generateMockMenuItems(count);
  const categoryMap = new Map<string, string>();

  // Create category objects
  const categoryObjects = [];
  for (const item of items) {
    const cat = item.category || "Other";
    if (!categoryMap.has(cat)) {
      const catId = `cat_${cat.toLowerCase().replace(/\s+/g, "_")}`;
      categoryMap.set(cat, catId);
      categoryObjects.push({
        type: "CATEGORY",
        id: catId,
        category_data: { name: cat },
      });
    }
  }

  // Create item objects
  const itemObjects = items.map(item => ({
    type: "ITEM",
    id: item.pos_item_id,
    is_deleted: false,
    present_at_all_locations: true,
    item_data: {
      name: item.name,
      description: item.description,
      category_id: categoryMap.get(item.category || "Other"),
      variations: [{
        type: "ITEM_VARIATION",
        id: `var_${item.pos_item_id}`,
        item_variation_data: {
          name: "Regular",
          price_money: { amount: item.price_cents, currency: "USD" },
        },
      }],
    },
  }));

  return { objects: [...categoryObjects, ...itemObjects] };
}

/** Simple seeded PRNG for deterministic test data */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
