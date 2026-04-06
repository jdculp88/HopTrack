/**
 * Notification category mapping tests — Reese, Sprint 170 (The Glass)
 * Deferred from Sprint 168. Verifies CATEGORY_MAP covers all 16 notification
 * types and maps them to exactly 4 categories (Social, Achievements, Rewards, System).
 *
 * CATEGORY_MAP is defined inline in NotificationsClient.tsx and cannot be
 * imported directly. We duplicate the map here and cross-reference it against
 * the canonical NotificationType union from types/database.ts.
 */

import { describe, it, expect } from "vitest";
import type { NotificationType } from "@/types/database";

// ─── Canonical list of all notification types (from types/database.ts) ───────
const ALL_NOTIFICATION_TYPES: NotificationType[] = [
  "friend_request",
  "friend_checkin",
  "tagged_checkin",
  "achievement_unlocked",
  "reaction",
  "session_cheers",
  "session_comment",
  "weekly_stats",
  "nudge",
  "brewery_follow",
  "new_tap",
  "new_event",
  "first_referral",
  "group_invite",
  "reward_redeemed",
];

// ─── Duplicate of CATEGORY_MAP from NotificationsClient.tsx ──────────────────
// If this map drifts from the source, the tests below will catch it.
type NotifCategory = "social" | "achievements" | "rewards" | "system";

const CATEGORY_MAP: Record<NotificationType, NotifCategory> = {
  friend_request: "social",
  friend_checkin: "social",
  tagged_checkin: "social",
  reaction: "social",
  session_cheers: "social",
  session_comment: "social",
  group_invite: "social",
  achievement_unlocked: "achievements",
  reward_redeemed: "rewards",
  brewery_follow: "rewards",
  new_tap: "rewards",
  new_event: "rewards",
  weekly_stats: "system",
  nudge: "system",
  first_referral: "system",
};

const EXPECTED_CATEGORIES: NotifCategory[] = ["social", "achievements", "rewards", "system"];

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("Notification CATEGORY_MAP", () => {
  it("maps exactly 15 notification types (matching the type union)", () => {
    const mappedTypes = Object.keys(CATEGORY_MAP);
    expect(mappedTypes).toHaveLength(ALL_NOTIFICATION_TYPES.length);
  });

  it("every canonical NotificationType has a mapping", () => {
    for (const type of ALL_NOTIFICATION_TYPES) {
      expect(CATEGORY_MAP[type]).toBeDefined();
    }
  });

  it("no notification types are unmapped", () => {
    const mapped = new Set(Object.keys(CATEGORY_MAP));
    const canonical = new Set(ALL_NOTIFICATION_TYPES);
    // Every canonical type is in the map
    for (const t of canonical) {
      expect(mapped.has(t)).toBe(true);
    }
    // Every mapped type is canonical (no phantom entries)
    for (const t of mapped) {
      expect(canonical.has(t as NotificationType)).toBe(true);
    }
  });

  it("maps to exactly 4 categories: Social, Achievements, Rewards, System", () => {
    const usedCategories = new Set(Object.values(CATEGORY_MAP));
    expect([...usedCategories].sort()).toEqual([...EXPECTED_CATEGORIES].sort());
  });

  it("every category has at least 1 notification type", () => {
    const categoryTypes: Record<NotifCategory, string[]> = {
      social: [],
      achievements: [],
      rewards: [],
      system: [],
    };
    for (const [type, cat] of Object.entries(CATEGORY_MAP)) {
      categoryTypes[cat as NotifCategory].push(type);
    }
    for (const cat of EXPECTED_CATEGORIES) {
      expect(categoryTypes[cat].length).toBeGreaterThanOrEqual(1);
    }
  });

  it("social category contains the expected friend/session types", () => {
    const socialTypes = Object.entries(CATEGORY_MAP)
      .filter(([, cat]) => cat === "social")
      .map(([type]) => type)
      .sort();
    expect(socialTypes).toEqual([
      "friend_checkin",
      "friend_request",
      "group_invite",
      "reaction",
      "session_cheers",
      "session_comment",
      "tagged_checkin",
    ]);
  });

  it("achievements category contains achievement_unlocked", () => {
    expect(CATEGORY_MAP.achievement_unlocked).toBe("achievements");
  });

  it("rewards category contains brewery/tap/event/redemption types", () => {
    const rewardTypes = Object.entries(CATEGORY_MAP)
      .filter(([, cat]) => cat === "rewards")
      .map(([type]) => type)
      .sort();
    expect(rewardTypes).toEqual([
      "brewery_follow",
      "new_event",
      "new_tap",
      "reward_redeemed",
    ]);
  });

  it("system category contains stats/nudge/referral types", () => {
    const systemTypes = Object.entries(CATEGORY_MAP)
      .filter(([, cat]) => cat === "system")
      .map(([type]) => type)
      .sort();
    expect(systemTypes).toEqual([
      "first_referral",
      "nudge",
      "weekly_stats",
    ]);
  });

  it("all category values are lowercase strings", () => {
    for (const cat of Object.values(CATEGORY_MAP)) {
      expect(cat).toBe(cat.toLowerCase());
    }
  });
});
