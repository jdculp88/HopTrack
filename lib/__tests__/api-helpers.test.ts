/**
 * API Helpers Unit Tests — Sprint 134 (The Tidy), expanded Sprint 150 (The Playwright)
 *
 * Tests the shared auth + tier checking helpers: constants AND functions.
 */

import { describe, test, expect, vi, beforeEach } from "vitest";
import { ADMIN_ROLES, STAFF_ROLES, PREMIUM_TIERS, requireAuth, requireBreweryAdmin, requirePremiumTier, checkBrandCovered } from "@/lib/api-helpers";

describe("API Helper Constants", () => {
  test("ADMIN_ROLES contains owner and manager", () => {
    expect(ADMIN_ROLES).toContain("owner");
    expect(ADMIN_ROLES).toContain("manager");
    expect(ADMIN_ROLES).toHaveLength(2);
  });

  test("STAFF_ROLES contains all 5 roles", () => {
    expect(STAFF_ROLES).toContain("owner");
    expect(STAFF_ROLES).toContain("manager");
    expect(STAFF_ROLES).toContain("business");
    expect(STAFF_ROLES).toContain("marketing");
    expect(STAFF_ROLES).toContain("staff");
    expect(STAFF_ROLES).toHaveLength(5);
  });

  test("PREMIUM_TIERS contains cask and barrel", () => {
    expect(PREMIUM_TIERS).toContain("cask");
    expect(PREMIUM_TIERS).toContain("barrel");
    expect(PREMIUM_TIERS).toHaveLength(2);
  });

  test("ADMIN_ROLES is a subset of STAFF_ROLES", () => {
    for (const role of ADMIN_ROLES) {
      expect(STAFF_ROLES).toContain(role);
    }
  });
});

describe("Shared Constants (tiers)", () => {
  test("TIER_COLORS has all 4 tiers", async () => {
    const { TIER_COLORS } = await import("@/lib/constants/tiers");
    expect(Object.keys(TIER_COLORS)).toEqual(
      expect.arrayContaining(["bronze", "silver", "gold", "platinum"])
    );
  });

  test("TIER_STYLES has all 4 tiers with required properties", async () => {
    const { TIER_STYLES } = await import("@/lib/constants/tiers");
    for (const tier of ["bronze", "silver", "gold", "platinum"]) {
      expect(TIER_STYLES[tier]).toHaveProperty("ring");
      expect(TIER_STYLES[tier]).toHaveProperty("glow");
      expect(TIER_STYLES[tier]).toHaveProperty("label");
      expect(TIER_STYLES[tier]).toHaveProperty("color");
    }
  });

  test("RANK_STYLES has top 3 ranks", async () => {
    const { RANK_STYLES } = await import("@/lib/constants/tiers");
    for (const rank of [1, 2, 3]) {
      expect(RANK_STYLES[rank]).toHaveProperty("bg");
      expect(RANK_STYLES[rank]).toHaveProperty("text");
      expect(RANK_STYLES[rank]).toHaveProperty("label");
    }
  });

  test("CATEGORY_LABELS covers all achievement categories", async () => {
    const { CATEGORY_LABELS } = await import("@/lib/constants/tiers");
    const expected = [
      "explorer", "variety", "social", "loyalty", "streak",
      "milestone", "seasonal", "special", "quantity", "time", "quality",
    ];
    for (const cat of expected) {
      expect(CATEGORY_LABELS).toHaveProperty(cat);
    }
  });
});

describe("Shared Constants (UI)", () => {
  test("PILL_ACTIVE has required CSS properties", async () => {
    const { PILL_ACTIVE } = await import("@/lib/constants/ui");
    expect(PILL_ACTIVE).toHaveProperty("background");
    expect(PILL_ACTIVE).toHaveProperty("color");
    expect(PILL_ACTIVE).toHaveProperty("borderColor");
  });

  test("PILL_INACTIVE has required CSS properties", async () => {
    const { PILL_INACTIVE } = await import("@/lib/constants/ui");
    expect(PILL_INACTIVE).toHaveProperty("background");
    expect(PILL_INACTIVE).toHaveProperty("color");
    expect(PILL_INACTIVE).toHaveProperty("borderColor");
  });

  test("INPUT_STYLE has form input properties", async () => {
    const { INPUT_STYLE } = await import("@/lib/constants/ui");
    expect(INPUT_STYLE).toHaveProperty("width", "100%");
    expect(INPUT_STYLE).toHaveProperty("borderRadius", 12);
    expect(INPUT_STYLE).toHaveProperty("fontSize", 14);
  });
});

describe("getFirstName utility", () => {
  test("extracts first name from display name", async () => {
    const { getFirstName } = await import("@/lib/first-name");
    expect(getFirstName("John Smith")).toBe("John");
  });

  test("falls back to username", async () => {
    const { getFirstName } = await import("@/lib/first-name");
    expect(getFirstName(null, "hopfan42")).toBe("hopfan42");
  });

  test("falls back to Someone", async () => {
    const { getFirstName } = await import("@/lib/first-name");
    expect(getFirstName(null, null)).toBe("Someone");
  });

  test("handles undefined", async () => {
    const { getFirstName } = await import("@/lib/first-name");
    expect(getFirstName(undefined, undefined)).toBe("Someone");
  });

  test("handles single name", async () => {
    const { getFirstName } = await import("@/lib/first-name");
    expect(getFirstName("Joshua")).toBe("Joshua");
  });
});

// ─── Helper Function Tests (Sprint 150) ─────────────────────────────────────

// Build a mock Supabase client for function testing
function buildMockSupabase(overrides: {
  user?: any;
  userError?: any;
  accountData?: any;
  breweryData?: any;
} = {}) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: overrides.user ?? null },
        error: overrides.userError ?? null,
      }),
    },
    from: vi.fn().mockImplementation((table: string) => {
      const chain: any = {};
      chain.select = vi.fn().mockReturnValue(chain);
      chain.eq = vi.fn().mockReturnValue(chain);
      chain.maybeSingle = vi.fn().mockResolvedValue({
        data: table === "brewery_accounts" ? (overrides.accountData ?? null) : null,
      });
      chain.single = vi.fn().mockResolvedValue({
        data: table === "breweries" ? (overrides.breweryData ?? null) : null,
      });
      return chain;
    }),
  } as any;
}

describe("requireAuth()", () => {
  test("returns user when session is valid", async () => {
    const mockUser = { id: "user-1", email: "test@hoptrack.beer" };
    const supabase = buildMockSupabase({ user: mockUser });

    const result = await requireAuth(supabase);

    expect(result).toEqual(mockUser);
    expect(supabase.auth.getUser).toHaveBeenCalled();
  });

  test("returns null when no session exists", async () => {
    const supabase = buildMockSupabase({ user: null });

    const result = await requireAuth(supabase);

    expect(result).toBeNull();
  });

  test("returns null when getUser returns undefined user", async () => {
    const supabase = buildMockSupabase({ user: undefined });

    const result = await requireAuth(supabase);

    expect(result).toBeFalsy();
  });
});

describe("requireBreweryAdmin()", () => {
  const breweryId = "brewery-123";
  const userId = "user-1";

  test("returns account when user is an owner", async () => {
    const supabase = buildMockSupabase({
      accountData: { role: "owner" },
    });

    const result = await requireBreweryAdmin(supabase, userId, breweryId);

    expect(result).toEqual({ role: "owner" });
    expect(supabase.from).toHaveBeenCalledWith("brewery_accounts");
  });

  test("returns account when user is a manager", async () => {
    const supabase = buildMockSupabase({
      accountData: { role: "manager" },
    });

    const result = await requireBreweryAdmin(supabase, userId, breweryId);

    expect(result).toEqual({ role: "manager" });
  });

  test("returns null when user has staff role (not admin)", async () => {
    const supabase = buildMockSupabase({
      accountData: { role: "staff" },
    });

    const result = await requireBreweryAdmin(supabase, userId, breweryId);

    expect(result).toBeNull();
  });

  test("returns null when user has no account for brewery", async () => {
    const supabase = buildMockSupabase({ accountData: null });

    const result = await requireBreweryAdmin(supabase, userId, breweryId);

    expect(result).toBeNull();
  });

  test("accepts custom roles parameter", async () => {
    const supabase = buildMockSupabase({
      accountData: { role: "marketing" },
    });

    // With default roles (owner, manager), marketing should fail
    const defaultResult = await requireBreweryAdmin(supabase, userId, breweryId);
    expect(defaultResult).toBeNull();

    // With custom roles including marketing, should pass
    const customResult = await requireBreweryAdmin(supabase, userId, breweryId, STAFF_ROLES);
    expect(customResult).toEqual({ role: "marketing" });
  });

  test("queries with correct user_id and brewery_id", async () => {
    const supabase = buildMockSupabase({ accountData: null });

    await requireBreweryAdmin(supabase, userId, breweryId);

    const fromChain = supabase.from("brewery_accounts");
    expect(supabase.from).toHaveBeenCalledWith("brewery_accounts");
  });
});

describe("requirePremiumTier()", () => {
  const breweryId = "brewery-123";

  test("returns true for cask tier", async () => {
    const supabase = buildMockSupabase({
      breweryData: { subscription_tier: "cask" },
    });

    const result = await requirePremiumTier(supabase, breweryId);

    expect(result).toBe(true);
  });

  test("returns true for barrel tier", async () => {
    const supabase = buildMockSupabase({
      breweryData: { subscription_tier: "barrel" },
    });

    const result = await requirePremiumTier(supabase, breweryId);

    expect(result).toBe(true);
  });

  test("returns false for tap tier (free)", async () => {
    const supabase = buildMockSupabase({
      breweryData: { subscription_tier: "tap" },
    });

    const result = await requirePremiumTier(supabase, breweryId);

    expect(result).toBe(false);
  });

  test("returns false for null subscription_tier", async () => {
    const supabase = buildMockSupabase({
      breweryData: { subscription_tier: null },
    });

    const result = await requirePremiumTier(supabase, breweryId);

    expect(result).toBe(false);
  });

  test("returns false when brewery not found", async () => {
    const supabase = buildMockSupabase({ breweryData: null });

    const result = await requirePremiumTier(supabase, breweryId);

    expect(result).toBe(false);
  });

  test("queries the breweries table", async () => {
    const supabase = buildMockSupabase({ breweryData: null });

    await requirePremiumTier(supabase, breweryId);

    expect(supabase.from).toHaveBeenCalledWith("breweries");
  });

  test("accepts custom tiers parameter", async () => {
    const supabase = buildMockSupabase({
      breweryData: { subscription_tier: "tap" },
    });

    // Default tiers (cask, barrel) — tap should fail
    const defaultResult = await requirePremiumTier(supabase, breweryId);
    expect(defaultResult).toBe(false);

    // Custom tiers including tap — should pass
    const customResult = await requirePremiumTier(supabase, breweryId, ["tap", "cask", "barrel"]);
    expect(customResult).toBe(true);
  });
});

// ─── checkBrandCovered Tests (Sprint 152) ─────────────────────────────────────

function buildBrandMockSupabase(overrides: {
  breweryData?: any;
  brandData?: any;
} = {}) {
  return {
    from: vi.fn().mockImplementation((table: string) => {
      const chain: any = {};
      chain.select = vi.fn().mockReturnValue(chain);
      chain.eq = vi.fn().mockReturnValue(chain);
      chain.single = vi.fn().mockResolvedValue({
        data: table === "breweries"
          ? (overrides.breweryData ?? null)
          : table === "brewery_brands"
            ? (overrides.brandData ?? null)
            : null,
      });
      return chain;
    }),
  } as any;
}

describe("checkBrandCovered()", () => {
  const breweryId = "brewery-123";

  test("returns covered: false when brewery has no brand_id", async () => {
    const supabase = buildBrandMockSupabase({
      breweryData: { brand_id: null },
    });

    const result = await checkBrandCovered(supabase, breweryId);

    expect(result).toEqual({ covered: false });
  });

  test("returns covered: false when brand has free tier", async () => {
    const supabase = buildBrandMockSupabase({
      breweryData: { brand_id: "brand-1" },
      brandData: { name: "Test Brand", subscription_tier: "free" },
    });

    const result = await checkBrandCovered(supabase, breweryId);

    expect(result).toEqual({ covered: false });
  });

  test("returns covered: true with brandName when brand has barrel tier", async () => {
    const supabase = buildBrandMockSupabase({
      breweryData: { brand_id: "brand-1" },
      brandData: { name: "Pint & Pixel", subscription_tier: "barrel" },
    });

    const result = await checkBrandCovered(supabase, breweryId);

    expect(result).toEqual({ covered: true, brandName: "Pint & Pixel" });
  });

  test("returns covered: false when brewery not found", async () => {
    const supabase = buildBrandMockSupabase({
      breweryData: null,
    });

    const result = await checkBrandCovered(supabase, breweryId);

    expect(result).toEqual({ covered: false });
  });

  test("returns covered: false when brand not found", async () => {
    const supabase = buildBrandMockSupabase({
      breweryData: { brand_id: "brand-1" },
      brandData: null,
    });

    const result = await checkBrandCovered(supabase, breweryId);

    expect(result).toEqual({ covered: false });
  });

  test("queries breweries table first, then brewery_brands", async () => {
    const supabase = buildBrandMockSupabase({
      breweryData: { brand_id: "brand-1" },
      brandData: { name: "Test", subscription_tier: "barrel" },
    });

    await checkBrandCovered(supabase, breweryId);

    expect(supabase.from).toHaveBeenCalledWith("breweries");
    expect(supabase.from).toHaveBeenCalledWith("brewery_brands");
  });
});
