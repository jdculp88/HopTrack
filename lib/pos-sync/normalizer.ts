// POS Sync Engine — Provider Adapters (Normalizers)
// Sprint 87 — The Sync Engine
// Converts provider-specific menu data into a common PosMenuItem shape

import type { PosMenuItem, PosProviderAdapter } from "./types";

/**
 * Map a raw category string to a HopTrack item_type.
 * Falls back to "beer" when category is unrecognized.
 */
function inferItemType(category: string | null): string {
  if (!category) return "beer";
  const lower = category.toLowerCase();

  if (lower.includes("cider") || lower.includes("hard cider")) return "cider";
  if (lower.includes("wine") || lower.includes("red wine") || lower.includes("white wine")) return "wine";
  if (lower.includes("cocktail") || lower.includes("mixed") || lower.includes("spirit")) return "cocktail";
  if (lower.includes("non-alcoholic") || lower.includes("mocktail") || lower.includes("soda") || lower === "na") return "non_alcoholic";

  return "beer";
}

/**
 * Toast POS Adapter
 *
 * Toast menu structure:
 * - menus[] → menuGroups[] → menuItems[]
 * - Each menuItem has: guid, name, description, pricing (amount in cents)
 * - Menu groups act as categories (e.g., "Draft Beer", "Ciders", "Wine")
 */
export const toastAdapter: PosProviderAdapter = {
  name: "toast",

  normalizeMenuItems(raw: unknown): PosMenuItem[] {
    const items: PosMenuItem[] = [];
    const data = raw as any;

    // Toast returns { menus: [{ menuGroups: [{ menuItems: [] }] }] }
    const menus = data?.menus || data?.menu || (Array.isArray(data) ? data : [data]);

    for (const menu of menus) {
      const groups = menu?.menuGroups || menu?.groups || [];
      for (const group of groups) {
        const groupName = group?.name || null;
        const menuItems = group?.menuItems || group?.items || [];

        for (const item of menuItems) {
          const guid = item?.guid || item?.id || item?.externalId;
          if (!guid) continue;

          // Toast pricing: item.pricing?.basePrice or item.price (in dollars or cents)
          let priceCents: number | null = null;
          if (item.pricing?.basePrice != null) {
            priceCents = Math.round(item.pricing.basePrice * 100);
          } else if (item.price != null) {
            priceCents = typeof item.price === "number" && item.price < 1000
              ? Math.round(item.price * 100) // dollars → cents
              : item.price; // already cents
          }

          items.push({
            pos_item_id: String(guid),
            name: item.name || "Unknown Item",
            category: groupName,
            price_cents: priceCents,
            is_available: item.visibility !== "HIDDEN" && item.isActive !== false,
            description: item.description || null,
            item_type: inferItemType(groupName),
            raw: item,
          });
        }
      }
    }

    return items;
  },

  normalizeWebhookPayload(raw: unknown): PosMenuItem[] {
    // Toast webhook for menus.updated sends the full menu payload
    // Same structure as API response
    return this.normalizeMenuItems(raw);
  },
};

/**
 * Square POS Adapter
 *
 * Square catalog structure:
 * - objects[] where type === "ITEM"
 * - Each ITEM has: id, item_data { name, description, category_id, variations[] }
 * - Variations hold pricing: price_money { amount, currency }
 * - category_id references a separate CATEGORY object
 */
export const squareAdapter: PosProviderAdapter = {
  name: "square",

  normalizeMenuItems(raw: unknown): PosMenuItem[] {
    const items: PosMenuItem[] = [];
    const data = raw as any;

    // Square returns { objects: [...] } or just an array
    const objects = data?.objects || (Array.isArray(data) ? data : []);

    // Build category lookup from CATEGORY objects
    const categories = new Map<string, string>();
    for (const obj of objects) {
      if (obj?.type === "CATEGORY" && obj.category_data?.name) {
        categories.set(obj.id, obj.category_data.name);
      }
    }

    // Process ITEM objects
    for (const obj of objects) {
      if (obj?.type !== "ITEM") continue;

      const itemData = obj.item_data;
      if (!itemData) continue;

      // Get price from first variation
      let priceCents: number | null = null;
      const variations = itemData.variations || [];
      if (variations.length > 0) {
        const firstVar = variations[0];
        const priceMoney = firstVar?.item_variation_data?.price_money;
        if (priceMoney?.amount != null) {
          priceCents = priceMoney.amount; // Square uses cents natively
        }
      }

      const categoryName = itemData.category_id
        ? categories.get(itemData.category_id) || null
        : null;

      items.push({
        pos_item_id: obj.id,
        name: itemData.name || "Unknown Item",
        category: categoryName,
        price_cents: priceCents,
        is_available: !obj.is_deleted && obj.present_at_all_locations !== false,
        description: itemData.description || null,
        item_type: inferItemType(categoryName),
        raw: obj,
      });
    }

    return items;
  },

  normalizeWebhookPayload(_raw: unknown): PosMenuItem[] {
    // Square catalog.version.updated webhook sends { type, merchant_id, data: { ... } }
    // The payload doesn't include full catalog — we need to fetch it.
    // Return empty; the engine will do a full fetch via the sync path.
    // This is by design — Square webhooks are notifications, not data payloads.
    return [];
  },
};

/** Get the adapter for a provider */
export function getAdapter(provider: string): PosProviderAdapter {
  switch (provider) {
    case "toast": return toastAdapter;
    case "square": return squareAdapter;
    default: throw new Error(`Unknown POS provider: ${provider}`);
  }
}
