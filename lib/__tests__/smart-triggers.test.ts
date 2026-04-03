// Smart Triggers unit tests — Reese, Sprint 98
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock external dependencies before imports
vi.mock("@/lib/push", () => ({
  sendPushToUser: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

import {
  triggerWishlistOnTap,
  triggerFriendSession,
  triggerLoyaltyNudge,
} from "@/lib/smart-triggers";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createMockSupabase(overrides: Record<string, any> = {}) {
  const chainable = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    insert: vi.fn().mockResolvedValue({ error: null }),
    update: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: null }),
    then: vi.fn(),
    // Default: return empty results
    ...overrides,
  };

  // Make chainable methods return chainable by default
  const proxy = new Proxy(chainable, {
    get(target, prop) {
      const val = target[prop as string];
      if (typeof val === "function") return val;
      return val;
    },
  });

  return {
    from: vi.fn().mockReturnValue(proxy),
    _chain: chainable,
  } as any;
}

// ─── isTriggerEnabled (tested via trigger functions) ─────────────────────────

// We can't import isTriggerEnabled directly (not exported), but we test it
// through the trigger functions' behavior with notification_preferences.

describe("isTriggerEnabled (via triggers)", () => {
  it("treats null preferences as all triggers enabled", async () => {
    // A wishlist entry with null preferences should attempt to send
    const supabase = createMockSupabase();

    // wishlist query returns one user with null prefs
    let callCount = 0;
    supabase.from = vi.fn().mockImplementation((table: string) => {
      if (table === "wishlist") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [{ user_id: "u1", user: { notification_preferences: null } }],
            }),
          }),
        };
      }
      if (table === "notification_rate_limits") {
        callCount++;
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  gte: vi.fn().mockResolvedValue({ count: 0 }),
                }),
                gte: vi.fn().mockResolvedValue({ count: 0 }),
              }),
              gte: vi.fn().mockResolvedValue({ count: 0 }),
            }),
          }),
          insert: vi.fn().mockResolvedValue({ error: null }),
        };
      }
      if (table === "notifications") {
        return { insert: vi.fn().mockResolvedValue({ error: null }) };
      }
      return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis() };
    });

    const result = await triggerWishlistOnTap(supabase, "beer1", "Test IPA", "brew1", "Test Brewery");
    expect(result.sent).toBe(1);
  });

  it("respects explicitly disabled trigger", async () => {
    const supabase = createMockSupabase();
    supabase.from = vi.fn().mockImplementation((table: string) => {
      if (table === "wishlist") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [
                {
                  user_id: "u1",
                  user: { notification_preferences: { smart_wishlist_on_tap: false } },
                },
              ],
            }),
          }),
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        insert: vi.fn().mockResolvedValue({ error: null }),
      };
    });

    const result = await triggerWishlistOnTap(supabase, "beer1", "Test IPA", "brew1", "Test Brewery");
    expect(result.sent).toBe(0);
    expect(result.skipped).toBe(1);
  });

  it("treats undefined preferences as all triggers enabled", async () => {
    const supabase = createMockSupabase();
    supabase.from = vi.fn().mockImplementation((table: string) => {
      if (table === "wishlist") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [
                { user_id: "u1", user: { notification_preferences: undefined } },
              ],
            }),
          }),
        };
      }
      if (table === "notification_rate_limits") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  gte: vi.fn().mockResolvedValue({ count: 0 }),
                }),
                gte: vi.fn().mockResolvedValue({ count: 0 }),
              }),
              gte: vi.fn().mockResolvedValue({ count: 0 }),
            }),
          }),
          insert: vi.fn().mockResolvedValue({ error: null }),
        };
      }
      if (table === "notifications") {
        return { insert: vi.fn().mockResolvedValue({ error: null }) };
      }
      return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis() };
    });

    const result = await triggerWishlistOnTap(supabase, "beer1", "Test IPA", "brew1", "Test Brewery");
    expect(result.sent).toBe(1);
  });

  it("allows trigger when other triggers are disabled but this one is not", async () => {
    // smart_friend_session is false, but smart_wishlist_on_tap is not set (defaults true)
    const supabase = createMockSupabase();
    supabase.from = vi.fn().mockImplementation((table: string) => {
      if (table === "wishlist") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [
                {
                  user_id: "u1",
                  user: { notification_preferences: { smart_friend_session: false } },
                },
              ],
            }),
          }),
        };
      }
      if (table === "notification_rate_limits") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  gte: vi.fn().mockResolvedValue({ count: 0 }),
                }),
                gte: vi.fn().mockResolvedValue({ count: 0 }),
              }),
              gte: vi.fn().mockResolvedValue({ count: 0 }),
            }),
          }),
          insert: vi.fn().mockResolvedValue({ error: null }),
        };
      }
      if (table === "notifications") {
        return { insert: vi.fn().mockResolvedValue({ error: null }) };
      }
      return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis() };
    });

    const result = await triggerWishlistOnTap(supabase, "beer1", "Test IPA", "brew1", "Test Brewery");
    expect(result.sent).toBe(1);
  });
});

// ─── Frequency Cap Logic ─────────────────────────────────────────────────────

describe("frequency cap (daily limit)", () => {
  it("skips when daily cap (3) is reached", async () => {
    const supabase = createMockSupabase();
    supabase.from = vi.fn().mockImplementation((table: string) => {
      if (table === "wishlist") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [{ user_id: "u1", user: { notification_preferences: {} } }],
            }),
          }),
        };
      }
      if (table === "notification_rate_limits") {
        // Daily count = 3 (at cap)
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              gte: vi.fn().mockResolvedValue({ count: 3 }),
            }),
          }),
        };
      }
      return { insert: vi.fn().mockResolvedValue({ error: null }) };
    });

    const result = await triggerWishlistOnTap(supabase, "beer1", "Test IPA", "brew1", "Test Brewery");
    expect(result.skipped).toBe(1);
    expect(result.sent).toBe(0);
  });
});

describe("dedup logic", () => {
  it("skips when same trigger key was sent within window", async () => {
    const supabase = createMockSupabase();
    let selectCallNum = 0;
    supabase.from = vi.fn().mockImplementation((table: string) => {
      if (table === "wishlist") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [{ user_id: "u1", user: { notification_preferences: {} } }],
            }),
          }),
        };
      }
      if (table === "notification_rate_limits") {
        selectCallNum++;
        if (selectCallNum === 1) {
          // Daily cap: 0 (under limit)
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                gte: vi.fn().mockResolvedValue({ count: 0 }),
              }),
            }),
          };
        }
        // Dedup: 1 (already sent)
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  gte: vi.fn().mockResolvedValue({ count: 1 }),
                }),
              }),
            }),
          }),
        };
      }
      return { insert: vi.fn().mockResolvedValue({ error: null }) };
    });

    const result = await triggerWishlistOnTap(supabase, "beer1", "Test IPA", "brew1", "Test Brewery");
    expect(result.skipped).toBe(1);
    expect(result.sent).toBe(0);
  });
});

// ─── triggerWishlistOnTap ────────────────────────────────────────────────────

describe("triggerWishlistOnTap", () => {
  it("returns reason when no wishlist matches", async () => {
    const supabase = createMockSupabase();
    supabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [] }),
      }),
    });

    const result = await triggerWishlistOnTap(supabase, "beer1", "Test IPA", "brew1", "Test Brewery");
    expect(result.sent).toBe(0);
    expect(result.skipped).toBe(0);
    expect(result.reason).toBe("no wishlist matches");
  });

  it("returns reason when wishlist data is null", async () => {
    const supabase = createMockSupabase();
    supabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null }),
      }),
    });

    const result = await triggerWishlistOnTap(supabase, "beer1", "Test IPA", "brew1", "Test Brewery");
    expect(result.sent).toBe(0);
    expect(result.reason).toBe("no wishlist matches");
  });
});

// ─── triggerFriendSession ────────────────────────────────────────────────────

describe("triggerFriendSession", () => {
  it("returns reason for home sessions (null brewery)", async () => {
    const supabase = createMockSupabase();
    const result = await triggerFriendSession(supabase, "u1", "Josh", null, null);
    expect(result.sent).toBe(0);
    expect(result.reason).toBe("home session");
  });

  it("returns reason for null breweryName", async () => {
    const supabase = createMockSupabase();
    const result = await triggerFriendSession(supabase, "u1", "Josh", "brew1", null);
    expect(result.sent).toBe(0);
    expect(result.reason).toBe("home session");
  });

  it("returns reason when user has no friends", async () => {
    const supabase = createMockSupabase();
    supabase.from = vi.fn().mockImplementation((table: string) => {
      if (table === "friendships") {
        return {
          select: vi.fn().mockReturnValue({
            or: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [] }),
            }),
          }),
        };
      }
      return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis() };
    });

    const result = await triggerFriendSession(supabase, "u1", "Josh", "brew1", "Test Brewery");
    expect(result.sent).toBe(0);
    expect(result.reason).toBe("no friends");
  });

  it("extracts correct friend IDs from friendships (requester side)", async () => {
    const supabase = createMockSupabase();
    supabase.from = vi.fn().mockImplementation((table: string) => {
      if (table === "friendships") {
        return {
          select: vi.fn().mockReturnValue({
            or: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [{ requester_id: "u1", addressee_id: "friend1" }],
              }),
            }),
          }),
        };
      }
      if (table === "profiles") {
        return {
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({
              data: [{ id: "friend1", notification_preferences: { smart_friend_session: false } }],
            }),
          }),
        };
      }
      return { insert: vi.fn().mockResolvedValue({ error: null }) };
    });

    const result = await triggerFriendSession(supabase, "u1", "Josh", "brew1", "Test Brewery");
    // Friend has trigger disabled, should be skipped
    expect(result.skipped).toBe(1);
    expect(result.sent).toBe(0);
  });

  it("extracts correct friend IDs from friendships (addressee side)", async () => {
    const supabase = createMockSupabase();
    supabase.from = vi.fn().mockImplementation((table: string) => {
      if (table === "friendships") {
        return {
          select: vi.fn().mockReturnValue({
            or: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [{ requester_id: "friend2", addressee_id: "u1" }],
              }),
            }),
          }),
        };
      }
      if (table === "profiles") {
        return {
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({
              data: [{ id: "friend2", notification_preferences: { smart_friend_session: false } }],
            }),
          }),
        };
      }
      return { insert: vi.fn().mockResolvedValue({ error: null }) };
    });

    const result = await triggerFriendSession(supabase, "u1", "Josh", "brew1", "Test Brewery");
    expect(result.skipped).toBe(1);
  });

  it("handles null friendships data", async () => {
    const supabase = createMockSupabase();
    supabase.from = vi.fn().mockImplementation((table: string) => {
      if (table === "friendships") {
        return {
          select: vi.fn().mockReturnValue({
            or: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: null }),
            }),
          }),
        };
      }
      return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis() };
    });

    const result = await triggerFriendSession(supabase, "u1", "Josh", "brew1", "Test Brewery");
    expect(result.sent).toBe(0);
    expect(result.reason).toBe("no friends");
  });
});

// ─── triggerLoyaltyNudge ─────────────────────────────────────────────────────

describe("triggerLoyaltyNudge", () => {
  it("returns reason when no loyalty programs exist", async () => {
    const supabase = createMockSupabase();
    supabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [] }),
        }),
      }),
    });

    const result = await triggerLoyaltyNudge(supabase, "u1", "brew1", "Test Brewery");
    expect(result.sent).toBe(0);
    expect(result.reason).toBe("no loyalty programs");
  });

  it("returns reason when trigger is disabled in preferences", async () => {
    const supabase = createMockSupabase();
    supabase.from = vi.fn().mockImplementation((table: string) => {
      if (table === "loyalty_programs") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [{ id: "prog1", name: "Stamp Card", stamps_required: 10, reward_description: "Free pint" }],
              }),
            }),
          }),
        };
      }
      if (table === "loyalty_cards") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [{ program_id: "prog1", stamps: 9 }] }),
            }),
          }),
        };
      }
      if (table === "profiles") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { notification_preferences: { smart_loyalty_nudge: false } },
              }),
            }),
          }),
        };
      }
      return { insert: vi.fn().mockResolvedValue({ error: null }) };
    });

    const result = await triggerLoyaltyNudge(supabase, "u1", "brew1", "Test Brewery");
    expect(result.sent).toBe(0);
    expect(result.reason).toBe("disabled");
  });

  it("does not nudge when user is more than 2 stamps away", async () => {
    const supabase = createMockSupabase();
    supabase.from = vi.fn().mockImplementation((table: string) => {
      if (table === "loyalty_programs") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [{ id: "prog1", name: "Stamp Card", stamps_required: 10, reward_description: "Free pint" }],
              }),
            }),
          }),
        };
      }
      if (table === "loyalty_cards") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [{ program_id: "prog1", stamps: 5 }] }),
            }),
          }),
        };
      }
      if (table === "profiles") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { notification_preferences: {} },
              }),
            }),
          }),
        };
      }
      return { insert: vi.fn().mockResolvedValue({ error: null }) };
    });

    const result = await triggerLoyaltyNudge(supabase, "u1", "brew1", "Test Brewery");
    // 5 stamps out of 10 = 5 remaining, too far
    expect(result.sent).toBe(0);
  });

  it("does not nudge when stamps already meet requirement", async () => {
    const supabase = createMockSupabase();
    supabase.from = vi.fn().mockImplementation((table: string) => {
      if (table === "loyalty_programs") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [{ id: "prog1", name: "Stamp Card", stamps_required: 10, reward_description: "Free pint" }],
              }),
            }),
          }),
        };
      }
      if (table === "loyalty_cards") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [{ program_id: "prog1", stamps: 10 }] }),
            }),
          }),
        };
      }
      if (table === "profiles") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { notification_preferences: {} },
              }),
            }),
          }),
        };
      }
      return { insert: vi.fn().mockResolvedValue({ error: null }) };
    });

    const result = await triggerLoyaltyNudge(supabase, "u1", "brew1", "Test Brewery");
    // 10/10 = 0 remaining, not > 0
    expect(result.sent).toBe(0);
  });

  it("handles user with no loyalty card (0 stamps default)", async () => {
    const supabase = createMockSupabase();
    supabase.from = vi.fn().mockImplementation((table: string) => {
      if (table === "loyalty_programs") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [{ id: "prog1", name: "Stamp Card", stamps_required: 10, reward_description: "Free pint" }],
              }),
            }),
          }),
        };
      }
      if (table === "loyalty_cards") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [] }),
            }),
          }),
        };
      }
      if (table === "profiles") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { notification_preferences: {} },
              }),
            }),
          }),
        };
      }
      return { insert: vi.fn().mockResolvedValue({ error: null }) };
    });

    const result = await triggerLoyaltyNudge(supabase, "u1", "brew1", "Test Brewery");
    // 0 stamps out of 10 = 10 remaining, too far
    expect(result.sent).toBe(0);
  });
});
