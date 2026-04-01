// Pint Rewind aggregation tests — Reese, Sprint 93 retro action item
// Tests fetchPintRewindData with mocked Supabase to verify aggregation logic
import { describe, it, expect } from "vitest";
import { fetchPintRewindData } from "@/lib/pint-rewind";

// ── Helper: build a mock Supabase client ──

function mockSupabase(sessions: any[], beerLogs: any[], profile: any) {
  const chainable = (data: any, isSingle = false) => {
    const obj: any = {
      select: () => obj,
      eq: () => obj,
      neq: () => obj,
      order: () => (isSingle ? { data } : { data }),
      single: () => ({ data }),
    };
    return obj;
  };

  const _callCount = 0;
  return {
    from: (table: string) => {
      if (table === "sessions") return chainable(sessions);
      if (table === "beer_logs") return chainable(beerLogs);
      if (table === "profiles") return chainable(profile, true);
      return chainable(null);
    },
  };
}

// ── fetchPintRewindData ──

describe("fetchPintRewindData", () => {
  it("returns Explorer archetype when no beer logs exist", async () => {
    const supabase = mockSupabase([], [], { level: 1, xp: 0, total_checkins: 0, display_name: "Test User", username: "test" });
    const result = await fetchPintRewindData(supabase, "user-1");

    expect(result.personality.archetype).toBe("The Explorer");
    expect(result.personality.topStyle).toBeNull();
    expect(result.signatureBeer).toBeNull();
    expect(result.breweryLoyalty).toBeNull();
    expect(result.legendarySession).toBeNull();
    expect(result.scroll.totalBeers).toBe(0);
    expect(result.scroll.totalSessions).toBe(0);
  });

  it("identifies correct top style and archetype", async () => {
    const logs = [
      { beer_id: "b1", beer: { name: "Hop Storm", style: "IPA" }, rating: 4, quantity: 3, session_id: "s1" },
      { beer_id: "b2", beer: { name: "Dark Knight", style: "Stout" }, rating: 5, quantity: 1, session_id: "s1" },
    ];
    const supabase = mockSupabase([], logs, { level: 3, xp: 500, display_name: "Hop Fan" });
    const result = await fetchPintRewindData(supabase, "user-1");

    expect(result.personality.topStyle).toBe("IPA");
    expect(result.personality.archetype).toBe("The Hop Evangelist");
    expect(result.personality.count).toBe(3);
  });

  it("returns The Adventurer for unmapped style", async () => {
    const logs = [
      { beer_id: "b1", beer: { name: "Smoked Lager", style: "Rauchbier" }, rating: 4, quantity: 2, session_id: "s1" },
    ];
    const supabase = mockSupabase([], logs, { level: 1, xp: 0, display_name: "Smokey" });
    const result = await fetchPintRewindData(supabase, "user-1");

    expect(result.personality.archetype).toBe("The Adventurer");
    expect(result.personality.topStyle).toBe("Rauchbier");
  });

  it("finds the signature beer by highest quantity", async () => {
    const logs = [
      { beer_id: "b1", beer: { name: "Alpha IPA", style: "IPA" }, quantity: 2, session_id: "s1" },
      { beer_id: "b2", beer: { name: "Beta Stout", style: "Stout" }, quantity: 5, session_id: "s1" },
      { beer_id: "b1", beer: { name: "Alpha IPA", style: "IPA" }, quantity: 1, session_id: "s2" },
    ];
    const supabase = mockSupabase([], logs, { level: 1, xp: 0, display_name: "Fan" });
    const result = await fetchPintRewindData(supabase, "user-1");

    expect(result.signatureBeer).not.toBeNull();
    expect(result.signatureBeer!.name).toBe("Beta Stout");
    expect(result.signatureBeer!.count).toBe(5);
  });

  it("finds the top brewery by visit count (excludes home sessions)", async () => {
    const sessions = [
      { id: "s1", brewery_id: "br1", context: "brewery", brewery: { name: "Heist" }, started_at: "2025-01-01", ended_at: "2025-01-01" },
      { id: "s2", brewery_id: "br1", context: "brewery", brewery: { name: "Heist" }, started_at: "2025-01-02", ended_at: "2025-01-02" },
      { id: "s3", brewery_id: "br2", context: "brewery", brewery: { name: "NoDa" }, started_at: "2025-01-03", ended_at: "2025-01-03" },
      { id: "s4", brewery_id: null, context: "home", brewery: null, started_at: "2025-01-04", ended_at: "2025-01-04" },
    ];
    const supabase = mockSupabase(sessions, [], { level: 1, xp: 0, display_name: "Visitor" });
    const result = await fetchPintRewindData(supabase, "user-1");

    expect(result.breweryLoyalty).not.toBeNull();
    expect(result.breweryLoyalty!.name).toBe("Heist");
    expect(result.breweryLoyalty!.count).toBe(2);
  });

  it("counts home sessions correctly", async () => {
    const sessions = [
      { id: "s1", brewery_id: null, context: "home", brewery: null, started_at: "2025-01-01", ended_at: "2025-01-01" },
      { id: "s2", brewery_id: null, context: "home", brewery: null, started_at: "2025-01-02", ended_at: "2025-01-02" },
      { id: "s3", brewery_id: "br1", context: "brewery", brewery: { name: "NoDa" }, started_at: "2025-01-03", ended_at: "2025-01-03" },
    ];
    const supabase = mockSupabase(sessions, [], { level: 1, xp: 0, display_name: "Home Brewer" });
    const result = await fetchPintRewindData(supabase, "user-1");

    expect(result.homeSessions).toBe(2);
  });

  it("calculates rating habits correctly", async () => {
    const logs = [
      { beer_id: "b1", beer: { name: "A", style: "IPA" }, rating: 4, quantity: 1, session_id: "s1" },
      { beer_id: "b2", beer: { name: "B", style: "IPA" }, rating: 5, quantity: 1, session_id: "s1" },
      { beer_id: "b3", beer: { name: "C", style: "IPA" }, rating: 0, quantity: 1, session_id: "s1" }, // unrated
    ];
    const supabase = mockSupabase([], logs, { level: 1, xp: 0, display_name: "Rater" });
    const result = await fetchPintRewindData(supabase, "user-1");

    expect(result.ratingHabits.avgRating).toBe(4.5);
    expect(result.ratingHabits.totalRated).toBe(2);
    expect(result.ratingHabits.personality).toBe("The Eternal Optimist");
  });

  it("returns Silent Sipper when no ratings exist", async () => {
    const logs = [
      { beer_id: "b1", beer: { name: "A", style: "IPA" }, rating: null, quantity: 1, session_id: "s1" },
    ];
    const supabase = mockSupabase([], logs, { level: 1, xp: 0, display_name: "Quiet" });
    const result = await fetchPintRewindData(supabase, "user-1");

    expect(result.ratingHabits.avgRating).toBeNull();
    expect(result.ratingHabits.personality).toBe("The Silent Sipper");
  });

  it("calculates scroll stats correctly", async () => {
    const sessions = [
      { id: "s1", brewery_id: "br1", context: "brewery", brewery: { name: "Heist" }, started_at: "2025-01-01", ended_at: "2025-01-01" },
    ];
    const logs = [
      { beer_id: "b1", beer: { name: "A", style: "IPA" }, quantity: 2, session_id: "s1" },
      { beer_id: "b2", beer: { name: "B", style: "Stout" }, quantity: 1, session_id: "s1" },
      { beer_id: "b1", beer: { name: "A", style: "IPA" }, quantity: 1, session_id: "s1" },
    ];
    const supabase = mockSupabase(sessions, logs, { level: 5, xp: 1200, display_name: "Stats Fan" });
    const result = await fetchPintRewindData(supabase, "user-1");

    expect(result.scroll.totalBeers).toBe(4); // 2 + 1 + 1
    expect(result.scroll.totalSessions).toBe(1);
    expect(result.scroll.totalXp).toBe(1200);
    expect(result.scroll.uniqueBeers).toBe(2); // b1, b2
    expect(result.scroll.uniqueBreweries).toBe(1); // br1
  });

  it("uses display_name, falling back to username, then Beer Lover", async () => {
    const sub1 = mockSupabase([], [], { level: 1, xp: 0, display_name: "Joshua", username: "josh" });
    const r1 = await fetchPintRewindData(sub1, "user-1");
    expect(r1.displayName).toBe("Joshua");

    const sub2 = mockSupabase([], [], { level: 1, xp: 0, display_name: null, username: "josh" });
    const r2 = await fetchPintRewindData(sub2, "user-1");
    expect(r2.displayName).toBe("josh");

    const sub3 = mockSupabase([], [], { level: 1, xp: 0, display_name: null, username: null });
    const r3 = await fetchPintRewindData(sub3, "user-1");
    expect(r3.displayName).toBe("Beer Lover");
  });

  it("handles null profile gracefully", async () => {
    const supabase = mockSupabase([], [], null);
    const result = await fetchPintRewindData(supabase, "user-1");

    expect(result.level.level).toBe(1);
    expect(result.scroll.totalXp).toBe(0);
    expect(result.displayName).toBe("Beer Lover");
  });

  it("defaults quantity to 1 when null", async () => {
    const logs = [
      { beer_id: "b1", beer: { name: "A", style: "IPA" }, rating: null, quantity: null, session_id: "s1" },
    ];
    const supabase = mockSupabase([], logs, { level: 1, xp: 0, display_name: "Q" });
    const result = await fetchPintRewindData(supabase, "user-1");

    expect(result.scroll.totalBeers).toBe(1);
  });
});
