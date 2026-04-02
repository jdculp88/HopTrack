// Brand billing unit tests — Avery + Reese, Sprint 121
import { describe, it, expect, vi } from "vitest";
import {
  propagateBrandTier,
  revertBrandTier,
  getBrandLocationCount,
  syncLocationTierOnBrandJoin,
  syncLocationTierOnBrandLeave,
} from "@/lib/brand-billing";

// ── Helpers ──

function createMockSupabase(overrides: Record<string, any> = {}) {
  const chainable: any = {
    from: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
    eq: vi.fn(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
  };

  // Default: all chain methods return the chainable
  for (const key of Object.keys(chainable)) {
    chainable[key].mockReturnValue(chainable);
  }

  // Override specific returns
  if (overrides.selectReturn) {
    chainable.single.mockResolvedValue(overrides.selectReturn);
    chainable.maybeSingle.mockResolvedValue(overrides.selectReturn);
  }

  if (overrides.countReturn !== undefined) {
    chainable.select.mockReturnValue({
      ...chainable,
      eq: vi.fn().mockResolvedValue({ count: overrides.countReturn }),
    });
  }

  if (overrides.updateReturn) {
    chainable.eq.mockResolvedValue(overrides.updateReturn);
  }

  return chainable;
}

// ── propagateBrandTier ──

describe("propagateBrandTier", () => {
  it("calls update on breweries with correct tier", async () => {
    const supabase = createMockSupabase();
    await propagateBrandTier(supabase, "brand-1", "barrel");

    expect(supabase.from).toHaveBeenCalledWith("breweries");
    expect(supabase.update).toHaveBeenCalledWith({
      subscription_tier: "barrel",
      trial_ends_at: null,
    });
    expect(supabase.eq).toHaveBeenCalledWith("brand_id", "brand-1");
  });

  it("scopes to single brewery when breweryId provided", async () => {
    const supabase = createMockSupabase();
    await propagateBrandTier(supabase, "brand-1", "cask", { breweryId: "brew-1" });

    expect(supabase.eq).toHaveBeenCalledWith("brand_id", "brand-1");
    expect(supabase.eq).toHaveBeenCalledWith("id", "brew-1");
  });
});

// ── revertBrandTier ──

describe("revertBrandTier", () => {
  it("sets all brand locations to free tier", async () => {
    const supabase = createMockSupabase();
    await revertBrandTier(supabase, "brand-1");

    expect(supabase.from).toHaveBeenCalledWith("breweries");
    expect(supabase.update).toHaveBeenCalledWith({ subscription_tier: "free" });
    expect(supabase.eq).toHaveBeenCalledWith("brand_id", "brand-1");
  });
});

// ── getBrandLocationCount ──

describe("getBrandLocationCount", () => {
  it("returns count from query", async () => {
    const supabase = createMockSupabase({ countReturn: 3 });
    const count = await getBrandLocationCount(supabase, "brand-1");

    expect(count).toBe(3);
  });

  it("returns 0 when count is null", async () => {
    const supabase = createMockSupabase({ countReturn: null });
    const count = await getBrandLocationCount(supabase, "brand-1");

    // null ?? 0 = 0
    expect(count).toBe(0);
  });
});

// ── syncLocationTierOnBrandJoin ──

describe("syncLocationTierOnBrandJoin", () => {
  it("does nothing when brand is on free tier", async () => {
    const supabase = createMockSupabase({
      selectReturn: { data: { subscription_tier: "free" } },
    });

    await syncLocationTierOnBrandJoin(supabase, "brand-1", "brew-1");

    // Should only have called from().select().eq().single() for the brand lookup
    // Should NOT have called update
    const updateCalls = supabase.update.mock.calls;
    expect(updateCalls.length).toBe(0);
  });
});

// ── syncLocationTierOnBrandLeave ──

describe("syncLocationTierOnBrandLeave", () => {
  it("does not revert if brewery has its own stripe_customer_id", async () => {
    const supabase = createMockSupabase({
      selectReturn: { data: { stripe_customer_id: "cus_abc123" } },
    });

    await syncLocationTierOnBrandLeave(supabase, "brew-1");

    // Should NOT call update since brewery has direct subscription
    const updateCalls = supabase.update.mock.calls;
    expect(updateCalls.length).toBe(0);
  });
});

// ── Module exports ──

describe("brand-billing module", () => {
  it("exports all expected functions", () => {
    expect(typeof propagateBrandTier).toBe("function");
    expect(typeof revertBrandTier).toBe("function");
    expect(typeof getBrandLocationCount).toBe("function");
    expect(typeof syncLocationTierOnBrandJoin).toBe("function");
    expect(typeof syncLocationTierOnBrandLeave).toBe("function");
  });
});
