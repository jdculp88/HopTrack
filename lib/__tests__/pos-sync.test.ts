// POS Sync Engine — Unit Tests
// Sprint 87 — The Sync Engine
// Tests: mapper (fuzzy matching), normalizer (adapters), mock provider

import { describe, it, expect } from "vitest";
import { autoMap, levenshtein } from "../pos-sync/mapper";
import { toastAdapter, squareAdapter, getAdapter } from "../pos-sync/normalizer";
import { generateMockMenuItems, generateMockToastWebhook, generateMockSquareCatalog, generateMockSquareWebhook } from "../pos-sync/mock-provider";
import type { PosMenuItem, BeerForMatching } from "../pos-sync/types";

// ─── Levenshtein Distance ─────────────────────────────────────────────────────

describe("levenshtein", () => {
  it("returns 0 for identical strings", () => {
    expect(levenshtein("hello", "hello")).toBe(0);
  });

  it("returns string length for empty comparison", () => {
    expect(levenshtein("abc", "")).toBe(3);
    expect(levenshtein("", "abc")).toBe(3);
  });

  it("counts single substitution", () => {
    expect(levenshtein("cat", "bat")).toBe(1);
  });

  it("counts single insertion", () => {
    expect(levenshtein("cat", "cart")).toBe(1);
  });

  it("counts single deletion", () => {
    expect(levenshtein("cart", "cat")).toBe(1);
  });

  it("handles multiple edits", () => {
    expect(levenshtein("kitten", "sitting")).toBe(3);
  });
});

// ─── Auto-Mapper ──────────────────────────────────────────────────────────────

describe("autoMap", () => {
  const makeBeer = (overrides: Partial<BeerForMatching> & { id: string; name: string }): BeerForMatching => ({
    brewery_id: "brewery_1",
    style: null,
    abv: null,
    pos_item_id: null,
    is_on_tap: true,
    item_type: "beer",
    ...overrides,
  });

  const makePosItem = (overrides: Partial<PosMenuItem> & { pos_item_id: string; name: string }): PosMenuItem => ({
    category: "Draft Beer",
    price_cents: 700,
    is_available: true,
    description: null,
    item_type: "beer",
    ...overrides,
  });

  it("matches by exact pos_item_id (Stage 1)", () => {
    const beers = [makeBeer({ id: "b1", name: "Hop Highway IPA", pos_item_id: "pos_123" })];
    const posItems = [makePosItem({ pos_item_id: "pos_123", name: "Hop Highway IPA" })];

    const results = autoMap(posItems, beers);
    expect(results).toHaveLength(1);
    expect(results[0].beer_id).toBe("b1");
    expect(results[0].confidence).toBe("high");
    expect(results[0].mapping_type).toBe("auto");
  });

  it("detects name conflict on pos_item_id match", () => {
    const beers = [makeBeer({ id: "b1", name: "Hop Highway IPA", pos_item_id: "pos_123" })];
    const posItems = [makePosItem({ pos_item_id: "pos_123", name: "Hop Highway India Pale Ale" })];

    const results = autoMap(posItems, beers);
    expect(results[0].beer_id).toBe("b1");
    expect(results[0].conflict).toBeDefined();
    expect(results[0].conflict?.pos_name).toBe("Hop Highway India Pale Ale");
    expect(results[0].conflict?.hoptrack_name).toBe("Hop Highway IPA");
  });

  it("matches by exact name (Stage 2)", () => {
    const beers = [makeBeer({ id: "b1", name: "Dark Passage Stout" })];
    const posItems = [makePosItem({ pos_item_id: "pos_456", name: "Dark Passage Stout" })];

    const results = autoMap(posItems, beers);
    expect(results[0].beer_id).toBe("b1");
    expect(results[0].confidence).toBe("high");
  });

  it("matches case-insensitively (Stage 2)", () => {
    const beers = [makeBeer({ id: "b1", name: "golden mile lager" })];
    const posItems = [makePosItem({ pos_item_id: "pos_789", name: "Golden Mile Lager" })];

    const results = autoMap(posItems, beers);
    expect(results[0].beer_id).toBe("b1");
  });

  it("matches after stripping suffixes (Stage 3)", () => {
    const beers = [makeBeer({ id: "b1", name: "Hop Highway" })];
    const posItems = [makePosItem({ pos_item_id: "pos_x", name: "Hop Highway IPA Draft" })];

    const results = autoMap(posItems, beers);
    expect(results[0].beer_id).toBe("b1");
    expect(results[0].confidence).toBe("medium");
  });

  it("matches by fuzzy Levenshtein ≤ 3 (Stage 4)", () => {
    const beers = [makeBeer({ id: "b1", name: "Amber Trail" })];
    const posItems = [makePosItem({ pos_item_id: "pos_y", name: "Amber Trailhead" })];

    const results = autoMap(posItems, beers);
    // "amber trail" vs "amber trailhead" — after normalization, Levenshtein should be small enough
    expect(results[0].beer_id).toBe("b1");
  });

  it("marks unmapped when no match found", () => {
    const beers = [makeBeer({ id: "b1", name: "Something Completely Different" })];
    const posItems = [makePosItem({ pos_item_id: "pos_z", name: "Exotic Mango Sour Explosion" })];

    const results = autoMap(posItems, beers);
    expect(results[0].beer_id).toBeNull();
    expect(results[0].mapping_type).toBe("unmapped");
    expect(results[0].confidence).toBe("none");
  });

  it("does not double-map beers (each beer used once)", () => {
    const beers = [makeBeer({ id: "b1", name: "Hop Highway IPA" })];
    const posItems = [
      makePosItem({ pos_item_id: "pos_1", name: "Hop Highway IPA" }),
      makePosItem({ pos_item_id: "pos_2", name: "Hop Highway IPA 16oz" }),
    ];

    const results = autoMap(posItems, beers);
    const mapped = results.filter(r => r.beer_id !== null);
    expect(mapped).toHaveLength(1); // Only one should match
  });

  it("handles empty POS items", () => {
    const beers = [makeBeer({ id: "b1", name: "Test Beer" })];
    const results = autoMap([], beers);
    expect(results).toHaveLength(0);
  });

  it("handles empty beer list", () => {
    const posItems = [makePosItem({ pos_item_id: "pos_1", name: "Test Item" })];
    const results = autoMap(posItems, []);
    expect(results).toHaveLength(1);
    expect(results[0].mapping_type).toBe("unmapped");
  });

  it("achieves ≥80% match rate on realistic data", () => {
    // Simulate a brewery with 15 beers, 12 of which appear in POS with slight variations
    const beers = [
      makeBeer({ id: "b1", name: "Hop Highway IPA" }),
      makeBeer({ id: "b2", name: "Dark Passage Stout" }),
      makeBeer({ id: "b3", name: "Golden Mile Lager" }),
      makeBeer({ id: "b4", name: "Sour Route" }),
      makeBeer({ id: "b5", name: "Amber Trailhead" }),
      makeBeer({ id: "b6", name: "Pale Wanderer" }),
      makeBeer({ id: "b7", name: "Double Summit" }),
      makeBeer({ id: "b8", name: "Wheat Field Hefe" }),
      makeBeer({ id: "b9", name: "Barrel Aged Porter" }),
      makeBeer({ id: "b10", name: "Session Blonde" }),
      makeBeer({ id: "b11", name: "Pilsner Express" }),
      makeBeer({ id: "b12", name: "Red Ale" }),
    ];

    const posItems = [
      makePosItem({ pos_item_id: "p1", name: "Hop Highway IPA" }), // exact
      makePosItem({ pos_item_id: "p2", name: "Dark Passage Stout" }), // exact
      makePosItem({ pos_item_id: "p3", name: "Golden Mile Lager Draft" }), // suffix
      makePosItem({ pos_item_id: "p4", name: "Sour Route" }), // exact
      makePosItem({ pos_item_id: "p5", name: "Amber Trailhead Ale" }), // suffix
      makePosItem({ pos_item_id: "p6", name: "Pale Wanderer" }), // exact
      makePosItem({ pos_item_id: "p7", name: "Double Summit DIPA" }), // close
      makePosItem({ pos_item_id: "p8", name: "Wheat Field Hefe" }), // exact
      makePosItem({ pos_item_id: "p9", name: "Barrel Aged Porter" }), // exact
      makePosItem({ pos_item_id: "p10", name: "Session Blonde Ale" }), // suffix
      makePosItem({ pos_item_id: "p11", name: "Pilsner Express" }), // exact
      makePosItem({ pos_item_id: "p12", name: "Red Ale Reroute" }), // fuzzy
      makePosItem({ pos_item_id: "p13", name: "Brand New Seasonal" }), // no match
      makePosItem({ pos_item_id: "p14", name: "Limited Release Sour" }), // no match
      makePosItem({ pos_item_id: "p15", name: "Guest Tap Collab IPA" }), // no match
    ];

    const results = autoMap(posItems, beers);
    const matched = results.filter(r => r.beer_id !== null).length;
    const rate = matched / posItems.length;
    expect(rate).toBeGreaterThanOrEqual(0.8); // ≥80% target from REQ-073
  });
});

// ─── Toast Normalizer ─────────────────────────────────────────────────────────

describe("toastAdapter", () => {
  it("normalizes nested menu structure", () => {
    const raw = {
      menus: [{
        menuGroups: [{
          name: "Draft Beer",
          menuItems: [
            { guid: "t1", name: "Hop Highway IPA", pricing: { basePrice: 7.50 }, visibility: "VISIBLE" },
            { guid: "t2", name: "Dark Stout", pricing: { basePrice: 8.00 }, visibility: "HIDDEN" },
          ],
        }],
      }],
    };

    const items = toastAdapter.normalizeMenuItems(raw);
    expect(items).toHaveLength(2);
    expect(items[0].pos_item_id).toBe("t1");
    expect(items[0].name).toBe("Hop Highway IPA");
    expect(items[0].price_cents).toBe(750);
    expect(items[0].is_available).toBe(true);
    expect(items[0].category).toBe("Draft Beer");
    expect(items[1].is_available).toBe(false); // HIDDEN
  });

  it("handles empty menu", () => {
    const items = toastAdapter.normalizeMenuItems({ menus: [] });
    expect(items).toHaveLength(0);
  });

  it("infers item_type from category", () => {
    const raw = {
      menus: [{
        menuGroups: [
          { name: "Ciders", menuItems: [{ guid: "c1", name: "Apple Cider", pricing: { basePrice: 7 } }] },
          { name: "Wine", menuItems: [{ guid: "w1", name: "Chardonnay", pricing: { basePrice: 12 } }] },
          { name: "Cocktails", menuItems: [{ guid: "x1", name: "Old Fashioned", pricing: { basePrice: 14 } }] },
        ],
      }],
    };

    const items = toastAdapter.normalizeMenuItems(raw);
    expect(items.find(i => i.pos_item_id === "c1")?.item_type).toBe("cider");
    expect(items.find(i => i.pos_item_id === "w1")?.item_type).toBe("wine");
    expect(items.find(i => i.pos_item_id === "x1")?.item_type).toBe("cocktail");
  });
});

// ─── Square Normalizer ────────────────────────────────────────────────────────

describe("squareAdapter", () => {
  it("normalizes catalog objects with categories", () => {
    const raw = {
      objects: [
        { type: "CATEGORY", id: "cat1", category_data: { name: "Draft Beer" } },
        {
          type: "ITEM", id: "sq1", is_deleted: false, present_at_all_locations: true,
          item_data: {
            name: "Hop Highway IPA",
            category_id: "cat1",
            variations: [{
              type: "ITEM_VARIATION", id: "var1",
              item_variation_data: { name: "Regular", price_money: { amount: 750, currency: "USD" } },
            }],
          },
        },
      ],
    };

    const items = squareAdapter.normalizeMenuItems(raw);
    expect(items).toHaveLength(1);
    expect(items[0].pos_item_id).toBe("sq1");
    expect(items[0].name).toBe("Hop Highway IPA");
    expect(items[0].price_cents).toBe(750);
    expect(items[0].category).toBe("Draft Beer");
  });

  it("handles deleted items", () => {
    const raw = {
      objects: [{
        type: "ITEM", id: "sq1", is_deleted: true,
        item_data: { name: "Deleted Beer", variations: [] },
      }],
    };

    const items = squareAdapter.normalizeMenuItems(raw);
    expect(items[0].is_available).toBe(false);
  });

  it("returns empty from webhook payload (notification only)", () => {
    const items = squareAdapter.normalizeWebhookPayload({ type: "catalog.version.updated", merchant_id: "m1" });
    expect(items).toHaveLength(0);
  });

  it("handles items without category", () => {
    const raw = {
      objects: [{
        type: "ITEM", id: "sq2", is_deleted: false, present_at_all_locations: true,
        item_data: { name: "Mystery Beer", variations: [] },
      }],
    };

    const items = squareAdapter.normalizeMenuItems(raw);
    expect(items[0].category).toBeNull();
    expect(items[0].item_type).toBe("beer"); // default
  });
});

// ─── getAdapter ───────────────────────────────────────────────────────────────

describe("getAdapter", () => {
  it("returns toast adapter", () => {
    expect(getAdapter("toast").name).toBe("toast");
  });

  it("returns square adapter", () => {
    expect(getAdapter("square").name).toBe("square");
  });

  it("throws for unknown provider", () => {
    expect(() => getAdapter("clover")).toThrow("Unknown POS provider: clover");
  });
});

// ─── Mock Provider ────────────────────────────────────────────────────────────

describe("mock provider", () => {
  it("generates menu items with correct shape", () => {
    const items = generateMockMenuItems(10);
    expect(items).toHaveLength(10);
    for (const item of items) {
      expect(item.pos_item_id).toBeTruthy();
      expect(item.name).toBeTruthy();
      expect(item.price_cents).toBeGreaterThan(0);
      expect(typeof item.is_available).toBe("boolean");
      expect(["beer", "cider", "wine", "cocktail", "non_alcoholic"]).toContain(item.item_type);
    }
  });

  it("generates deterministic items with seed", () => {
    const a = generateMockMenuItems(10, 42);
    const b = generateMockMenuItems(10, 42);
    expect(a.map(i => i.name)).toEqual(b.map(i => i.name));
  });

  it("generates different items with different seeds", () => {
    const a = generateMockMenuItems(10, 1);
    const b = generateMockMenuItems(10, 2);
    expect(a.map(i => i.name)).not.toEqual(b.map(i => i.name));
  });

  it("generates valid Toast webhook payload", () => {
    const payload = generateMockToastWebhook(10) as any;
    expect(payload.eventType).toBe("menus.updated");
    expect(payload.timestamp).toBeTruthy();
    expect(payload.menus).toHaveLength(1);
    // Normalize through adapter
    const items = toastAdapter.normalizeMenuItems(payload);
    expect(items.length).toBeGreaterThan(0);
  });

  it("generates valid Square catalog response", () => {
    const catalog = generateMockSquareCatalog(10) as any;
    expect(catalog.objects).toBeDefined();
    // Normalize through adapter
    const items = squareAdapter.normalizeMenuItems(catalog);
    expect(items.length).toBeGreaterThan(0);
  });

  it("generates Square webhook (notification only)", () => {
    const payload = generateMockSquareWebhook("merchant_abc") as any;
    expect(payload.type).toBe("catalog.version.updated");
    expect(payload.merchant_id).toBe("merchant_abc");
  });
});
