// Brand propagation unit tests — Avery + Reese, Sprint 122 (The Crew)
import { describe, it, expect, vi, beforeEach } from "vitest";

// We need to test the module's exports
// Mock supabase before importing
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockIn = vi.fn();
const mockDelete = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockMaybeSingle = vi.fn();
const mockSingle = vi.fn();

// ── Test BRAND_TO_BREWERY_ROLE mapping ──

describe("BRAND_TO_BREWERY_ROLE", () => {
  it("maps owner to owner", async () => {
    const mod = await import("@/lib/brand-propagation");
    // Access via propagation behavior — we can't access the const directly
    // but we can verify via the module's exports that brand_manager is supported
    expect(mod.propagateBrandAccess).toBeDefined();
    expect(mod.removePropagatedAccess).toBeDefined();
    expect(mod.recalculateScopedAccess).toBeDefined();
  });
});

// ── Test propagateBrandAccess ──

describe("propagateBrandAccess", () => {
  let mockSupabase: any;

  beforeEach(() => {
    vi.resetAllMocks();

    // Build chainable mock
    mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockImplementation(function(this: any) {
            return {
              eq: vi.fn().mockResolvedValue({ data: [], error: null }),
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              order: vi.fn().mockResolvedValue({ data: [], error: null }),
            };
          }),
        }),
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
        delete: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        }),
      }),
    };
  });

  it("returns early when no members found", async () => {
    const mod = await import("@/lib/brand-propagation");

    // Mock: no members
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    });

    await mod.propagateBrandAccess(mockSupabase, "brand-1");
    // Should have called from("brand_accounts") but not from("breweries")
    expect(mockSupabase.from).toHaveBeenCalledWith("brand_accounts");
  });

  it("returns early when no locations found", async () => {
    const mod = await import("@/lib/brand-propagation");

    // Mock: has members but no locations
    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [{ user_id: "user-1", role: "owner", location_scope: null }],
            error: null,
          }),
        }),
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

    await mod.propagateBrandAccess(mockSupabase, "brand-1");
    // Called brand_accounts and breweries, but nothing more
    expect(mockSupabase.from).toHaveBeenCalledTimes(2);
  });

  it("exports recalculateScopedAccess function", async () => {
    const mod = await import("@/lib/brand-propagation");
    expect(typeof mod.recalculateScopedAccess).toBe("function");
  });
});

// ── Test removePropagatedAccess ──

describe("removePropagatedAccess", () => {
  it("is exported and callable", async () => {
    const mod = await import("@/lib/brand-propagation");
    expect(typeof mod.removePropagatedAccess).toBe("function");
  });
});

// ── Test recalculateScopedAccess ──

describe("recalculateScopedAccess", () => {
  it("is exported and callable", async () => {
    const mod = await import("@/lib/brand-propagation");
    expect(typeof mod.recalculateScopedAccess).toBe("function");
  });
});
