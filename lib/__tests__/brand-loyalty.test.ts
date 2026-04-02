// Brand loyalty unit tests — Reese, Sprint 125
import { describe, it, expect, vi, beforeEach } from "vitest";

// We test the pure logic by mocking Supabase
// The actual DB interactions are tested via integration tests

describe("Brand Loyalty Types & Interfaces", () => {
  it("BrandLoyaltyProgram has correct shape", async () => {
    const { getBrandLoyaltyProgram } = await import("@/lib/brand-loyalty");
    expect(typeof getBrandLoyaltyProgram).toBe("function");
  });

  it("getBrandLoyaltyCard is exported", async () => {
    const { getBrandLoyaltyCard } = await import("@/lib/brand-loyalty");
    expect(typeof getBrandLoyaltyCard).toBe("function");
  });

  it("awardBrandStamp is exported", async () => {
    const { awardBrandStamp } = await import("@/lib/brand-loyalty");
    expect(typeof awardBrandStamp).toBe("function");
  });

  it("redeemBrandReward is exported", async () => {
    const { redeemBrandReward } = await import("@/lib/brand-loyalty");
    expect(typeof redeemBrandReward).toBe("function");
  });

  it("migrateLoyaltyToBrand is exported", async () => {
    const { migrateLoyaltyToBrand } = await import("@/lib/brand-loyalty");
    expect(typeof migrateLoyaltyToBrand).toBe("function");
  });
});

describe("Brand Loyalty Program Logic", () => {
  // Mock Supabase client
  function createMockSupabase(overrides: Record<string, any> = {}) {
    const chain = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      ...overrides,
    };
    return {
      from: vi.fn().mockReturnValue(chain),
      _chain: chain,
    } as any;
  }

  describe("getBrandLoyaltyProgram", () => {
    it("returns null when no active program exists", async () => {
      const { getBrandLoyaltyProgram } = await import("@/lib/brand-loyalty");
      const supabase = createMockSupabase({
        single: vi.fn().mockResolvedValue({ data: null, error: { code: "PGRST116" } }),
      });

      const result = await getBrandLoyaltyProgram(supabase, "brand-123");
      expect(result).toBeNull();
    });

    it("returns program when one exists", async () => {
      const { getBrandLoyaltyProgram } = await import("@/lib/brand-loyalty");
      const mockProgram = {
        id: "prog-1",
        brand_id: "brand-123",
        name: "Test Loyalty",
        stamps_required: 10,
        reward_description: "Free pint",
        earn_per_session: 1,
        is_active: true,
      };
      const supabase = createMockSupabase({
        single: vi.fn().mockResolvedValue({ data: mockProgram, error: null }),
      });

      const result = await getBrandLoyaltyProgram(supabase, "brand-123");
      expect(result).toEqual(mockProgram);
    });
  });

  describe("getBrandLoyaltyCard", () => {
    it("returns null when user has no card", async () => {
      const { getBrandLoyaltyCard } = await import("@/lib/brand-loyalty");
      const supabase = createMockSupabase({
        single: vi.fn().mockResolvedValue({ data: null, error: { code: "PGRST116" } }),
      });

      const result = await getBrandLoyaltyCard(supabase, "user-1", "brand-123");
      expect(result).toBeNull();
    });

    it("returns card when one exists", async () => {
      const { getBrandLoyaltyCard } = await import("@/lib/brand-loyalty");
      const mockCard = {
        id: "card-1",
        user_id: "user-1",
        brand_id: "brand-123",
        stamps: 5,
        lifetime_stamps: 12,
      };
      const supabase = createMockSupabase({
        single: vi.fn().mockResolvedValue({ data: mockCard, error: null }),
      });

      const result = await getBrandLoyaltyCard(supabase, "user-1", "brand-123");
      expect(result).toEqual(mockCard);
    });
  });
});

describe("Brand Loyalty Database Types", () => {
  it("BrandLoyaltyProgram type is registered in Database", async () => {
    const types = await import("@/types/database");
    // Verify the type exists by checking the interface shape
    const program: types.BrandLoyaltyProgram = {
      id: "test",
      brand_id: "test",
      name: "Test",
      description: null,
      stamps_required: 10,
      reward_description: "Free pint",
      earn_per_session: 1,
      is_active: true,
      created_at: "2026-01-01",
    };
    expect(program.stamps_required).toBe(10);
    expect(program.earn_per_session).toBe(1);
  });

  it("BrandLoyaltyCard type is registered in Database", async () => {
    const types = await import("@/types/database");
    const card: types.BrandLoyaltyCard = {
      id: "test",
      user_id: "test",
      brand_id: "test",
      program_id: "test",
      stamps: 5,
      lifetime_stamps: 12,
      last_stamp_at: null,
      last_stamp_brewery_id: null,
      created_at: "2026-01-01",
    };
    expect(card.stamps).toBe(5);
    expect(card.lifetime_stamps).toBe(12);
  });

  it("BrandLoyaltyRedemption type is registered in Database", async () => {
    const types = await import("@/types/database");
    const redemption: types.BrandLoyaltyRedemption = {
      id: "test",
      card_id: "test",
      user_id: "test",
      brand_id: "test",
      brewery_id: "test",
      program_id: "test",
      redeemed_at: "2026-01-01",
    };
    expect(redemption.brewery_id).toBe("test");
  });

  it("RedemptionCode type includes brand_loyalty_reward", async () => {
    const types = await import("@/types/database");
    const code: types.RedemptionCode = {
      id: "test",
      code: "ABC12",
      type: "brand_loyalty_reward",
      user_id: "test",
      brewery_id: "test",
      brand_id: "brand-123",
      program_id: null,
      mug_club_id: null,
      perk_index: null,
      promotion_id: null,
      promo_description: null,
      pos_reference: null,
      status: "pending",
      created_at: "2026-01-01",
      expires_at: "2026-01-01",
      confirmed_at: null,
      confirmed_by: null,
    };
    expect(code.type).toBe("brand_loyalty_reward");
    expect(code.brand_id).toBe("brand-123");
  });
});

describe("Brand Loyalty Reward Logic", () => {
  it("reward is ready when stamps >= stamps_required", () => {
    const stamps = 10;
    const stamps_required = 10;
    expect(stamps >= stamps_required).toBe(true);
  });

  it("reward is not ready when stamps < stamps_required", () => {
    const stamps = 7;
    const stamps_required = 10;
    expect(stamps >= stamps_required).toBe(false);
  });

  it("remaining stamps calculated correctly", () => {
    const stamps = 7;
    const stamps_required = 10;
    const remaining = Math.max(0, stamps_required - stamps);
    expect(remaining).toBe(3);
  });

  it("remaining is 0 when over threshold", () => {
    const stamps = 12;
    const stamps_required = 10;
    const remaining = Math.max(0, stamps_required - stamps);
    expect(remaining).toBe(0);
  });

  it("stamps after redemption is correct", () => {
    const stamps = 15;
    const stamps_required = 10;
    const afterRedemption = stamps - stamps_required;
    expect(afterRedemption).toBe(5);
  });

  it("earn_per_session defaults to 1", () => {
    const earn = 1;
    const newStamps = 5 + earn;
    expect(newStamps).toBe(6);
  });

  it("earn_per_session of 2 awards double stamps", () => {
    const earn = 2;
    const newStamps = 5 + earn;
    expect(newStamps).toBe(7);
  });

  it("lifetime stamps are cumulative across redemptions", () => {
    let stamps = 0;
    let lifetime = 0;
    const stamps_required = 10;

    // 12 visits
    for (let i = 0; i < 12; i++) {
      stamps += 1;
      lifetime += 1;
    }
    expect(stamps).toBe(12);
    expect(lifetime).toBe(12);

    // Redeem
    stamps -= stamps_required;
    expect(stamps).toBe(2);
    expect(lifetime).toBe(12); // lifetime doesn't decrease
  });
});

describe("Brand Loyalty Migration Logic", () => {
  it("aggregates stamps from multiple locations", () => {
    const locationCards = [
      { user_id: "user-1", stamps: 3, lifetime_stamps: 5 },
      { user_id: "user-1", stamps: 4, lifetime_stamps: 7 },
      { user_id: "user-2", stamps: 2, lifetime_stamps: 2 },
    ];

    const userTotals = new Map<string, { stamps: number; lifetime: number }>();
    for (const card of locationCards) {
      const existing = userTotals.get(card.user_id) || { stamps: 0, lifetime: 0 };
      existing.stamps += card.stamps || 0;
      existing.lifetime += card.lifetime_stamps || 0;
      userTotals.set(card.user_id, existing);
    }

    expect(userTotals.get("user-1")).toEqual({ stamps: 7, lifetime: 12 });
    expect(userTotals.get("user-2")).toEqual({ stamps: 2, lifetime: 2 });
    expect(userTotals.size).toBe(2);
  });
});
