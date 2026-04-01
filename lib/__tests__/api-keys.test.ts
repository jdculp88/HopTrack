// API Keys unit tests — Reese, Sprint 98
import { describe, it, expect, vi } from "vitest";

// Mock Supabase server client before imports
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null }),
      then: vi.fn(),
    }),
  }),
}));

import {
  generateApiKey,
  hashApiKey,
  apiResponse,
  apiError,
  apiOptions,
} from "@/lib/api-keys";

// ─── generateApiKey ──────────────────────────────────────────────────────────

describe("generateApiKey", () => {
  it("returns an object with rawKey, keyHash, and keyPrefix", () => {
    const result = generateApiKey();
    expect(result).toHaveProperty("rawKey");
    expect(result).toHaveProperty("keyHash");
    expect(result).toHaveProperty("keyPrefix");
  });

  it("rawKey starts with ht_live_ prefix", () => {
    const { rawKey } = generateApiKey();
    expect(rawKey.startsWith("ht_live_")).toBe(true);
  });

  it("rawKey has correct total length (ht_live_ + 64 hex chars)", () => {
    const { rawKey } = generateApiKey();
    // "ht_live_" = 8 chars, 32 random bytes = 64 hex chars
    expect(rawKey.length).toBe(8 + 64);
  });

  it("rawKey hex portion contains only valid hex characters", () => {
    const { rawKey } = generateApiKey();
    const hexPortion = rawKey.slice(8);
    expect(hexPortion).toMatch(/^[0-9a-f]{64}$/);
  });

  it("keyHash is a valid 64-character hex string (SHA-256)", () => {
    const { keyHash } = generateApiKey();
    expect(keyHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("keyPrefix is ht_live_ + first 8 chars of random portion", () => {
    const { rawKey, keyPrefix } = generateApiKey();
    expect(keyPrefix).toBe(rawKey.slice(0, 16)); // 8 + 8
    expect(keyPrefix.startsWith("ht_live_")).toBe(true);
    expect(keyPrefix.length).toBe(16);
  });

  it("generates unique keys on each call", () => {
    const a = generateApiKey();
    const b = generateApiKey();
    expect(a.rawKey).not.toBe(b.rawKey);
    expect(a.keyHash).not.toBe(b.keyHash);
  });

  it("keyHash matches hashApiKey(rawKey)", () => {
    const { rawKey, keyHash } = generateApiKey();
    expect(hashApiKey(rawKey)).toBe(keyHash);
  });
});

// ─── hashApiKey ──────────────────────────────────────────────────────────────

describe("hashApiKey", () => {
  it("produces consistent SHA-256 for the same input", () => {
    const key = "ht_live_abc123";
    expect(hashApiKey(key)).toBe(hashApiKey(key));
  });

  it("produces different hashes for different inputs", () => {
    expect(hashApiKey("ht_live_aaa")).not.toBe(hashApiKey("ht_live_bbb"));
  });

  it("returns a 64-character hex string", () => {
    const hash = hashApiKey("ht_live_test");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("matches known SHA-256 for a fixed input", () => {
    // Pre-computed: SHA-256 of "ht_live_test"
    const crypto = require("crypto");
    const expected = crypto.createHash("sha256").update("ht_live_test").digest("hex");
    expect(hashApiKey("ht_live_test")).toBe(expected);
  });
});

// ─── apiResponse ─────────────────────────────────────────────────────────────

describe("apiResponse", () => {
  it("returns a Response with status 200 by default", () => {
    const res = apiResponse({ foo: "bar" });
    expect(res).toBeInstanceOf(Response);
    expect(res.status).toBe(200);
  });

  it("wraps data in standard envelope: { data, meta, error: null }", async () => {
    const res = apiResponse({ beers: [1, 2, 3] });
    const json = await res.json();
    expect(json).toEqual({
      data: { beers: [1, 2, 3] },
      meta: {},
      error: null,
    });
  });

  it("includes meta when provided", async () => {
    const res = apiResponse([], { total: 42, page: 1 });
    const json = await res.json();
    expect(json.meta).toEqual({ total: 42, page: 1 });
  });

  it("supports custom status codes", () => {
    const res = apiResponse({ created: true }, undefined, 201);
    expect(res.status).toBe(201);
  });

  it("sets Content-Type to application/json", () => {
    const res = apiResponse({});
    expect(res.headers.get("Content-Type")).toBe("application/json");
  });

  it("sets CORS headers", () => {
    const res = apiResponse({});
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(res.headers.get("Access-Control-Allow-Methods")).toBe("GET, OPTIONS");
    expect(res.headers.get("Access-Control-Allow-Headers")).toBe("Content-Type, Authorization");
  });

  it("sets Cache-Control header", () => {
    const res = apiResponse({});
    expect(res.headers.get("Cache-Control")).toBe(
      "public, s-maxage=60, stale-while-revalidate=300"
    );
  });
});

// ─── apiError ────────────────────────────────────────────────────────────────

describe("apiError", () => {
  it("returns a Response with the specified status", () => {
    const res = apiError("Not found", 404);
    expect(res.status).toBe(404);
  });

  it("wraps error in standard envelope: { data: null, meta: {}, error: {...} }", async () => {
    const res = apiError("Unauthorized", 401, "auth_required");
    const json = await res.json();
    expect(json).toEqual({
      data: null,
      meta: {},
      error: {
        message: "Unauthorized",
        code: "auth_required",
        status: 401,
      },
    });
  });

  it("defaults error code to 'error' when not provided", async () => {
    const res = apiError("Server error", 500);
    const json = await res.json();
    expect(json.error.code).toBe("error");
  });

  it("sets CORS headers on errors too", () => {
    const res = apiError("Bad request", 400);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  it("sets Content-Type to application/json", () => {
    const res = apiError("Not found", 404);
    expect(res.headers.get("Content-Type")).toBe("application/json");
  });

  it("rate limit response has correct format (429)", async () => {
    const res = apiError("Rate limit exceeded", 429, "rate_limited");
    const json = await res.json();
    expect(res.status).toBe(429);
    expect(json.error.code).toBe("rate_limited");
    expect(json.data).toBeNull();
  });
});

// ─── apiOptions ──────────────────────────────────────────────────────────────

describe("apiOptions", () => {
  it("returns 204 No Content", () => {
    const res = apiOptions();
    expect(res.status).toBe(204);
  });

  it("sets CORS preflight headers", () => {
    const res = apiOptions();
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(res.headers.get("Access-Control-Allow-Methods")).toBe("GET, OPTIONS");
    expect(res.headers.get("Access-Control-Allow-Headers")).toBe("Content-Type, Authorization");
    expect(res.headers.get("Access-Control-Max-Age")).toBe("86400");
  });

  it("has null body", async () => {
    const res = apiOptions();
    const body = await res.text();
    expect(body).toBe("");
  });
});
