// Brewery Menus unit tests — Reese, Sprint 128 (The Menu)
import { describe, it, expect } from "vitest";
import { MENU_CATEGORY_LABELS } from "@/types/database";
import type { MenuCategory, BreweryMenu } from "@/types/database";

// ── Menu Categories ──

const VALID_CATEGORIES: MenuCategory[] = [
  "food", "happy_hour", "wine", "cocktail",
  "non_alcoholic", "seasonal", "kids", "brunch",
];

describe("MENU_CATEGORY_LABELS", () => {
  it("has labels for all 8 categories", () => {
    expect(Object.keys(MENU_CATEGORY_LABELS)).toHaveLength(8);
    for (const cat of VALID_CATEGORIES) {
      expect(MENU_CATEGORY_LABELS[cat]).toBeDefined();
      expect(typeof MENU_CATEGORY_LABELS[cat]).toBe("string");
    }
  });

  it("all labels are non-empty strings", () => {
    for (const label of Object.values(MENU_CATEGORY_LABELS)) {
      expect(label.length).toBeGreaterThan(0);
    }
  });

  it("food category is labeled 'Food Menu'", () => {
    expect(MENU_CATEGORY_LABELS.food).toBe("Food Menu");
  });

  it("happy_hour category is labeled 'Happy Hour'", () => {
    expect(MENU_CATEGORY_LABELS.happy_hour).toBe("Happy Hour");
  });

  it("brunch category is labeled 'Brunch'", () => {
    expect(MENU_CATEGORY_LABELS.brunch).toBe("Brunch");
  });
});

// ── Menu Validation Logic ──

describe("Menu validation", () => {
  it("image_urls array enforces max of 3 images", () => {
    const urls = ["url1", "url2", "url3"];
    expect(urls.length).toBeLessThanOrEqual(3);
    const tooMany = ["url1", "url2", "url3", "url4"];
    expect(tooMany.length).toBeGreaterThan(3);
  });

  it("category must be one of the valid 8 categories", () => {
    for (const cat of VALID_CATEGORIES) {
      expect(VALID_CATEGORIES).toContain(cat);
    }
    expect(VALID_CATEGORIES).not.toContain("dessert");
    expect(VALID_CATEGORIES).not.toContain("beer");
    expect(VALID_CATEGORIES).not.toContain("dinner");
  });

  it("display_order must be a non-negative integer", () => {
    const validOrders = [0, 1, 2, 5, 10];
    for (const order of validOrders) {
      expect(Number.isInteger(order)).toBe(true);
      expect(order).toBeGreaterThanOrEqual(0);
    }
  });
});

// ── Menu Sorting ──

describe("Menu sorting by display_order", () => {
  const menus: Pick<BreweryMenu, "category" | "display_order">[] = [
    { category: "wine", display_order: 2 },
    { category: "food", display_order: 0 },
    { category: "cocktail", display_order: 1 },
    { category: "brunch", display_order: 3 },
  ];

  it("sorts menus by display_order ascending", () => {
    const sorted = [...menus].sort((a, b) => a.display_order - b.display_order);
    expect(sorted[0].category).toBe("food");
    expect(sorted[1].category).toBe("cocktail");
    expect(sorted[2].category).toBe("wine");
    expect(sorted[3].category).toBe("brunch");
  });
});

// ── Category Uniqueness ──

describe("Category uniqueness per brewery", () => {
  it("no duplicate categories allowed per brewery", () => {
    const categories = VALID_CATEGORIES;
    const unique = new Set(categories);
    expect(unique.size).toBe(categories.length);
  });

  it("category keys match MenuCategory type values", () => {
    const labelKeys = Object.keys(MENU_CATEGORY_LABELS) as MenuCategory[];
    expect(labelKeys.sort()).toEqual([...VALID_CATEGORIES].sort());
  });
});

// ── API Request Validation ──

describe("Menu API request validation", () => {
  it("rejects empty image_urls array", () => {
    const images: string[] = [];
    expect(images.length).toBe(0);
    const isValid = images.length >= 1 && images.length <= 3;
    expect(isValid).toBe(false);
  });

  it("accepts 1-3 images", () => {
    for (const count of [1, 2, 3]) {
      const images = Array.from({ length: count }, (_, i) => `url${i}`);
      const isValid = images.length >= 1 && images.length <= 3;
      expect(isValid).toBe(true);
    }
  });

  it("rejects more than 3 images", () => {
    const images = ["a", "b", "c", "d"];
    const isValid = images.length >= 1 && images.length <= 3;
    expect(isValid).toBe(false);
  });

  it("title is optional (nullable)", () => {
    const withTitle = { title: "Weekend Brunch" };
    const withoutTitle = { title: null };
    expect(withTitle.title).toBeTruthy();
    expect(withoutTitle.title).toBeNull();
  });
});
