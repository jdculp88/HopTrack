/**
 * Zod schema validation tests — Sprint 157
 *
 * Covers: common, sessions, profiles, leaderboard schemas + parseRequestBody utility.
 */

import { describe, it, expect } from "vitest";

// ── Common schemas ──────────────────────────────────────────────────────────

import {
  uuid,
  paginationParams,
  timeRange,
  requiredString,
  booleanParam,
  latitude,
  longitude,
} from "@/lib/schemas/common";

describe("common schemas", () => {
  describe("uuid", () => {
    it("accepts a valid UUID v4", () => {
      const result = uuid.safeParse("550e8400-e29b-41d4-a716-446655440000");
      expect(result.success).toBe(true);
    });

    it("rejects an empty string", () => {
      const result = uuid.safeParse("");
      expect(result.success).toBe(false);
    });

    it("rejects a non-UUID string", () => {
      const result = uuid.safeParse("not-a-uuid");
      expect(result.success).toBe(false);
    });

    it("rejects a number", () => {
      const result = uuid.safeParse(12345);
      expect(result.success).toBe(false);
    });
  });

  describe("paginationParams", () => {
    it("uses defaults when no values provided", () => {
      const result = paginationParams.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(20);
        expect(result.data.offset).toBe(0);
      }
    });

    it("coerces string values to numbers", () => {
      const result = paginationParams.safeParse({ limit: "10", offset: "5" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(10);
        expect(result.data.offset).toBe(5);
      }
    });

    it("rejects limit below 1", () => {
      const result = paginationParams.safeParse({ limit: 0 });
      expect(result.success).toBe(false);
    });

    it("rejects limit above 100", () => {
      const result = paginationParams.safeParse({ limit: 101 });
      expect(result.success).toBe(false);
    });

    it("rejects negative offset", () => {
      const result = paginationParams.safeParse({ offset: -1 });
      expect(result.success).toBe(false);
    });

    it("accepts boundary values", () => {
      const result = paginationParams.safeParse({ limit: 1, offset: 0 });
      expect(result.success).toBe(true);
      const result2 = paginationParams.safeParse({ limit: 100, offset: 9999 });
      expect(result2.success).toBe(true);
    });
  });

  describe("timeRange", () => {
    it("accepts 'week'", () => {
      expect(timeRange.safeParse("week").success).toBe(true);
    });

    it("accepts 'month'", () => {
      expect(timeRange.safeParse("month").success).toBe(true);
    });

    it("accepts 'all'", () => {
      expect(timeRange.safeParse("all").success).toBe(true);
    });

    it("defaults to 'month' when undefined", () => {
      const result = timeRange.safeParse(undefined);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("month");
      }
    });

    it("rejects invalid values", () => {
      expect(timeRange.safeParse("year").success).toBe(false);
      expect(timeRange.safeParse("day").success).toBe(false);
    });
  });

  describe("requiredString", () => {
    it("accepts a non-empty string", () => {
      const result = requiredString.safeParse("hello");
      expect(result.success).toBe(true);
    });

    it("rejects an empty string", () => {
      const result = requiredString.safeParse("");
      expect(result.success).toBe(false);
    });

    it("rejects whitespace-only strings", () => {
      const result = requiredString.safeParse("   ");
      expect(result.success).toBe(false);
    });

    it("trims whitespace from valid strings", () => {
      const result = requiredString.safeParse("  hello  ");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("hello");
      }
    });
  });

  describe("booleanParam", () => {
    it("accepts true", () => {
      const result = booleanParam.safeParse(true);
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toBe(true);
    });

    it("accepts false", () => {
      const result = booleanParam.safeParse(false);
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toBe(false);
    });

    it("accepts string 'true'", () => {
      const result = booleanParam.safeParse("true");
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toBe(true);
    });

    it("accepts string 'false'", () => {
      const result = booleanParam.safeParse("false");
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toBe(false);
    });

    it("defaults to true when undefined", () => {
      const result = booleanParam.safeParse(undefined);
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toBe(true);
    });

    it("rejects non-boolean, non-string values", () => {
      expect(booleanParam.safeParse("yes").success).toBe(false);
      expect(booleanParam.safeParse(1).success).toBe(false);
    });
  });

  describe("latitude", () => {
    it("accepts valid latitudes", () => {
      expect(latitude.safeParse(0).success).toBe(true);
      expect(latitude.safeParse(35.5951).success).toBe(true);
      expect(latitude.safeParse(-90).success).toBe(true);
      expect(latitude.safeParse(90).success).toBe(true);
    });

    it("rejects out-of-range latitudes", () => {
      expect(latitude.safeParse(-90.1).success).toBe(false);
      expect(latitude.safeParse(90.1).success).toBe(false);
    });
  });

  describe("longitude", () => {
    it("accepts valid longitudes", () => {
      expect(longitude.safeParse(0).success).toBe(true);
      expect(longitude.safeParse(-82.5515).success).toBe(true);
      expect(longitude.safeParse(-180).success).toBe(true);
      expect(longitude.safeParse(180).success).toBe(true);
    });

    it("rejects out-of-range longitudes", () => {
      expect(longitude.safeParse(-180.1).success).toBe(false);
      expect(longitude.safeParse(180.1).success).toBe(false);
    });
  });
});

// ── Session schemas ─────────────────────────────────────────────────────────

import { sessionCreateSchema } from "@/lib/schemas/sessions";

describe("sessionCreateSchema", () => {
  it("accepts a valid brewery session", () => {
    const result = sessionCreateSchema.safeParse({
      brewery_id: "550e8400-e29b-41d4-a716-446655440000",
      context: "brewery",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid home session without brewery_id", () => {
    const result = sessionCreateSchema.safeParse({
      context: "home",
    });
    expect(result.success).toBe(true);
  });

  it("rejects brewery context without brewery_id", () => {
    const result = sessionCreateSchema.safeParse({
      context: "brewery",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("brewery_id");
    }
  });

  it("applies defaults for share_to_feed and context", () => {
    const result = sessionCreateSchema.safeParse({
      brewery_id: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.share_to_feed).toBe(true);
      expect(result.data.context).toBe("brewery");
    }
  });

  it("accepts optional latitude and longitude", () => {
    const result = sessionCreateSchema.safeParse({
      brewery_id: "550e8400-e29b-41d4-a716-446655440000",
      context: "brewery",
      session_latitude: 35.5951,
      session_longitude: -82.5515,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.session_latitude).toBe(35.5951);
      expect(result.data.session_longitude).toBe(-82.5515);
    }
  });

  it("rejects invalid latitude/longitude bounds", () => {
    const result = sessionCreateSchema.safeParse({
      brewery_id: "550e8400-e29b-41d4-a716-446655440000",
      context: "brewery",
      session_latitude: 91,
      session_longitude: -200,
    });
    expect(result.success).toBe(false);
  });

  it("accepts note as optional string", () => {
    const result = sessionCreateSchema.safeParse({
      brewery_id: "550e8400-e29b-41d4-a716-446655440000",
      context: "brewery",
      note: "Great vibes tonight",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.note).toBe("Great vibes tonight");
    }
  });

  it("transforms empty note to undefined", () => {
    const result = sessionCreateSchema.safeParse({
      brewery_id: "550e8400-e29b-41d4-a716-446655440000",
      context: "brewery",
      note: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.note).toBeUndefined();
    }
  });
});

// ── Profile schemas ─────────────────────────────────────────────────────────

import { profileUpdateSchema } from "@/lib/schemas/profiles";

describe("profileUpdateSchema", () => {
  it("accepts a valid partial update", () => {
    const result = profileUpdateSchema.safeParse({
      display_name: "Joshua",
      bio: "Craft beer enthusiast",
    });
    expect(result.success).toBe(true);
  });

  it("accepts an empty object (all fields optional)", () => {
    const result = profileUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("sanitizes username to lowercase and strips special chars", () => {
    const result = profileUpdateSchema.safeParse({
      username: "BeerKing_42!@#",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      // The regex [^a-z0-9_] strips everything except lowercase alphanumeric and underscore
      expect(result.data.username).toBe("beerking_42");
    }
  });

  it("rejects username shorter than 2 characters", () => {
    const result = profileUpdateSchema.safeParse({
      username: "a",
    });
    expect(result.success).toBe(false);
  });

  it("rejects username longer than 30 characters", () => {
    const result = profileUpdateSchema.safeParse({
      username: "a".repeat(31),
    });
    expect(result.success).toBe(false);
  });

  it("rejects display_name longer than 100 characters", () => {
    const result = profileUpdateSchema.safeParse({
      display_name: "x".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("rejects bio longer than 500 characters", () => {
    const result = profileUpdateSchema.safeParse({
      bio: "x".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty string for avatar_url (clears avatar)", () => {
    const result = profileUpdateSchema.safeParse({
      avatar_url: "",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid URL for avatar_url", () => {
    const result = profileUpdateSchema.safeParse({
      avatar_url: "https://example.com/avatar.jpg",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid avatar_url", () => {
    const result = profileUpdateSchema.safeParse({
      avatar_url: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("accepts boolean is_public", () => {
    const result = profileUpdateSchema.safeParse({ is_public: false });
    expect(result.success).toBe(true);
  });

  it("accepts notification_preferences with string keys and boolean values", () => {
    const result = profileUpdateSchema.safeParse({
      notification_preferences: { push: true, email: false, sms: true },
    });
    expect(result.success).toBe(true);
  });

  it("rejects notification_preferences with non-boolean values", () => {
    const result = profileUpdateSchema.safeParse({
      notification_preferences: { push: "yes" },
    });
    expect(result.success).toBe(false);
  });
});

// ── Leaderboard schemas ─────────────────────────────────────────────────────

import { leaderboardQuerySchema, LEADERBOARD_CATEGORIES } from "@/lib/schemas/leaderboard";

describe("leaderboardQuerySchema", () => {
  it("uses defaults when empty object provided", () => {
    const result = leaderboardQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.category).toBe("xp");
      expect(result.data.scope).toBe("global");
      expect(result.data.timeRange).toBe("month");
      expect(result.data.limit).toBe(50);
    }
  });

  it("accepts all valid categories", () => {
    const categories = ["xp", "checkins", "styles", "breweries", "streak"];
    categories.forEach((category) => {
      const result = leaderboardQuerySchema.safeParse({ category });
      expect(result.success).toBe(true);
    });
  });

  it("accepts all valid scopes", () => {
    const scopes = ["global", "friends", "city"];
    scopes.forEach((scope) => {
      const result = leaderboardQuerySchema.safeParse({ scope });
      expect(result.success).toBe(true);
    });
  });

  it("accepts all valid time ranges", () => {
    const ranges = ["week", "month", "all"];
    ranges.forEach((timeRange) => {
      const result = leaderboardQuerySchema.safeParse({ timeRange });
      expect(result.success).toBe(true);
    });
  });

  it("rejects invalid category", () => {
    const result = leaderboardQuerySchema.safeParse({ category: "invalid" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid scope", () => {
    const result = leaderboardQuerySchema.safeParse({ scope: "national" });
    expect(result.success).toBe(false);
  });

  it("coerces limit from string", () => {
    const result = leaderboardQuerySchema.safeParse({ limit: "25" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(25);
    }
  });

  it("rejects limit above 100", () => {
    const result = leaderboardQuerySchema.safeParse({ limit: 200 });
    expect(result.success).toBe(false);
  });
});

describe("LEADERBOARD_CATEGORIES", () => {
  it("has 5 categories", () => {
    expect(LEADERBOARD_CATEGORIES).toHaveLength(5);
  });

  it("each category has id, label, and icon", () => {
    LEADERBOARD_CATEGORIES.forEach((cat) => {
      expect(cat).toHaveProperty("id");
      expect(cat).toHaveProperty("label");
      expect(cat).toHaveProperty("icon");
    });
  });
});

// ── parseRequestBody utility ────────────────────────────────────────────────

import { parseRequestBody } from "@/lib/schemas/index";
import { z } from "zod";

function mockRequest(body: unknown): Request {
  return new Request("http://localhost/api/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("parseRequestBody", () => {
  const testSchema = z.object({
    name: z.string().min(1),
    age: z.number().int().positive(),
  });

  it("returns data on valid input", async () => {
    const req = mockRequest({ name: "Joshua", age: 30 });
    const result = await parseRequestBody(req, testSchema);
    expect(result.error).toBeNull();
    expect(result.data).toEqual({ name: "Joshua", age: 30 });
  });

  it("returns error response on validation failure", async () => {
    const req = mockRequest({ name: "", age: -1 });
    const result = await parseRequestBody(req, testSchema);
    expect(result.data).toBeNull();
    expect(result.error).not.toBeNull();
    // The error should be a Response (from apiBadRequest)
    if (result.error) {
      const body = await result.error.json();
      expect(body.error.status).toBe(400);
      expect(body.error.code).toBe("VALIDATION_ERROR");
    }
  });

  it("returns 'Invalid JSON body' for non-JSON request", async () => {
    const req = new Request("http://localhost/api/test", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: "this is not json",
    });
    const result = await parseRequestBody(req, testSchema);
    expect(result.data).toBeNull();
    expect(result.error).not.toBeNull();
    if (result.error) {
      const body = await result.error.json();
      expect(body.error.message).toBe("Invalid JSON body");
    }
  });

  it("includes field name in validation error when available", async () => {
    const req = mockRequest({ name: "Joshua", age: "not-a-number" });
    const result = await parseRequestBody(req, testSchema);
    expect(result.data).toBeNull();
    if (result.error) {
      const body = await result.error.json();
      expect(body.error.field).toBe("age");
    }
  });
});
