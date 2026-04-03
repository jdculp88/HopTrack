// API Keys extended unit tests — Avery + Reese, Sprint 104
// Covers additional edge cases, validateApiKey sad paths, and response contract
// details not already covered in api-keys.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock Supabase server client before any imports that reference it
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
  validateApiKey,
  apiResponse,
  apiError,
  apiOptions,
} from "@/lib/api-keys";

// ── generateApiKey — additional edge cases ──

describe("generateApiKey additional coverage", () => {
  it("key is long enough — total length > 30 chars", () => {
    const { rawKey } = generateApiKey();
    expect(rawKey.length).toBeGreaterThan(30);
  });

  it("ht_live_ prefix is exactly 8 characters", () => {
    const { rawKey } = generateApiKey();
    expect(rawKey.slice(0, 8)).toBe("ht_live_");
  });

  it("keyPrefix starts with ht_live_", () => {
    const { keyPrefix } = generateApiKey();
    expect(keyPrefix.startsWith("ht_live_")).toBe(true);
  });

  it("keyHash is a hex string (only 0-9a-f)", () => {
    const { keyHash } = generateApiKey();
    expect(keyHash).toMatch(/^[0-9a-f]+$/);
  });

  it("keyHash length is 64 (SHA-256 output)", () => {
    const { keyHash } = generateApiKey();
    expect(keyHash).toHaveLength(64);
  });

  it("generates cryptographically distinct keys across 5 calls", () => {
    const keys = Array.from({ length: 5 }, () => generateApiKey().rawKey);
    const unique = new Set(keys);
    expect(unique.size).toBe(5);
  });

  it("rawKey contains only printable ASCII (safe for HTTP Authorization header)", () => {
    const { rawKey } = generateApiKey();
    // All chars should be in printable ASCII range (0x21-0x7E) — no spaces, no control chars
    expect(rawKey).toMatch(/^[\x21-\x7E]+$/);
  });
});

// ── hashApiKey — deterministic behavior ──

describe("hashApiKey determinism and format", () => {
  it("same input always produces same output across multiple calls", () => {
    const input = "ht_live_some_test_key_value_here";
    const hash1 = hashApiKey(input);
    const hash2 = hashApiKey(input);
    const hash3 = hashApiKey(input);
    expect(hash1).toBe(hash2);
    expect(hash2).toBe(hash3);
  });

  it("produces different hashes for similar-but-distinct inputs", () => {
    expect(hashApiKey("ht_live_aaa")).not.toBe(hashApiKey("ht_live_aaA"));
    expect(hashApiKey("ht_live_abc")).not.toBe(hashApiKey("ht_live_abd"));
  });

  it("output is lowercase hex string only", () => {
    const hash = hashApiKey("ht_live_anything");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    // Confirm no uppercase letters crept in
    expect(hash).toBe(hash.toLowerCase());
  });

  it("empty string produces a valid (non-empty) hash", () => {
    const hash = hashApiKey("");
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("very long input still produces a 64-char hash", () => {
    const longKey = "ht_live_" + "a".repeat(512);
    expect(hashApiKey(longKey)).toHaveLength(64);
  });

  it("hash of 'ht_live_test' matches independently computed SHA-256", async () => {
    // Verify against Node crypto directly — no magic numbers
    const { createHash } = await import("crypto");
    const expected = createHash("sha256").update("ht_live_test").digest("hex");
    expect(hashApiKey("ht_live_test")).toBe(expected);
  });
});

// ── validateApiKey — missing / malformed header ──

describe("validateApiKey sad paths (no real DB needed)", () => {
  it("returns null when Authorization header is absent", async () => {
    const req = new Request("https://api.hoptrack.com/v1/breweries/1", {
      headers: {},
    });
    const result = await validateApiKey(req);
    expect(result).toBeNull();
  });

  it("returns null when Authorization header is not Bearer scheme", async () => {
    const req = new Request("https://api.hoptrack.com/v1/breweries/1", {
      headers: { Authorization: "Basic dXNlcjpwYXNz" },
    });
    const result = await validateApiKey(req);
    expect(result).toBeNull();
  });

  it("returns null when Bearer token does not start with ht_live_", async () => {
    const req = new Request("https://api.hoptrack.com/v1/breweries/1", {
      headers: { Authorization: "Bearer sk_live_somethingelse" },
    });
    const result = await validateApiKey(req);
    expect(result).toBeNull();
  });

  it("returns null when Bearer token is empty after 'Bearer '", async () => {
    const req = new Request("https://api.hoptrack.com/v1/breweries/1", {
      headers: { Authorization: "Bearer " },
    });
    const result = await validateApiKey(req);
    expect(result).toBeNull();
  });

  it("returns null when key has ht_live_ prefix but DB returns no match (revoked / unknown)", async () => {
    // Mock is already configured to return { data: null } from maybeSingle
    const req = new Request("https://api.hoptrack.com/v1/breweries/1", {
      headers: { Authorization: "Bearer ht_live_" + "a".repeat(64) },
    });
    const result = await validateApiKey(req);
    expect(result).toBeNull();
  });

  it("returns null for key with only the prefix and no hex data", async () => {
    const req = new Request("https://api.hoptrack.com/v1/breweries/1", {
      headers: { Authorization: "Bearer ht_live_" },
    });
    const result = await validateApiKey(req);
    expect(result).toBeNull();
  });
});

// ── apiResponse — additional contract checks ──

describe("apiResponse additional contract", () => {
  it("error field is explicitly null (not undefined, not missing)", async () => {
    const res = apiResponse({ name: "Test Brewery" });
    const json = await res.json();
    expect(json).toHaveProperty("error");
    expect(json.error).toBeNull();
  });

  it("meta defaults to empty object {} when not provided", async () => {
    const res = apiResponse([]);
    const json = await res.json();
    expect(json.meta).toEqual({});
  });

  it("data field is always present even for null", async () => {
    const res = apiResponse(null);
    const json = await res.json();
    expect(json).toHaveProperty("data");
    expect(json.data).toBeNull();
  });

  it("data field preserves arrays", async () => {
    const data = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const res = apiResponse(data);
    const json = await res.json();
    expect(json.data).toHaveLength(3);
    expect(json.data[0].id).toBe(1);
  });

  it("envelope has exactly 3 top-level keys: data, meta, error", async () => {
    const res = apiResponse({ beer: "IPA" });
    const json = await res.json();
    const keys = Object.keys(json).sort();
    expect(keys).toEqual(["data", "error", "meta"]);
  });

  it("status 201 Created is returned correctly", () => {
    const res = apiResponse({ created: true }, {}, 201);
    expect(res.status).toBe(201);
  });

  it("Cache-Control header is present for caching public responses", () => {
    const res = apiResponse({ id: 1 });
    const cc = res.headers.get("Cache-Control");
    expect(cc).not.toBeNull();
    expect(cc).toContain("public");
  });
});

// ── apiError — additional contract checks ──

describe("apiError additional contract", () => {
  it("data field is explicitly null", async () => {
    const res = apiError("Not found", 404);
    const json = await res.json();
    expect(json.data).toBeNull();
  });

  it("meta field is explicitly empty object", async () => {
    const res = apiError("Server error", 500);
    const json = await res.json();
    expect(json.meta).toEqual({});
  });

  it("error object contains message, code, and status", async () => {
    const res = apiError("Forbidden", 403, "forbidden");
    const json = await res.json();
    expect(json.error).toHaveProperty("message", "Forbidden");
    expect(json.error).toHaveProperty("code", "forbidden");
    expect(json.error).toHaveProperty("status", 403);
  });

  it("error status in body matches HTTP status code", async () => {
    const res = apiError("Too many requests", 429, "rate_limited");
    const json = await res.json();
    expect(res.status).toBe(429);
    expect(json.error.status).toBe(429);
  });

  it("error.code defaults to 'error' string when not provided", async () => {
    const res = apiError("Something went wrong", 500);
    const json = await res.json();
    expect(json.error.code).toBe("error");
  });

  it("error.code is 'error' not null when omitted", async () => {
    const res = apiError("Bad request", 400);
    const json = await res.json();
    expect(json.error.code).not.toBeNull();
    expect(typeof json.error.code).toBe("string");
  });

  it("envelope has exactly 3 top-level keys: data, meta, error", async () => {
    const res = apiError("Not found", 404);
    const json = await res.json();
    expect(Object.keys(json).sort()).toEqual(["data", "error", "meta"]);
  });

  it("common HTTP error codes 400, 401, 403, 404, 429, 500 all work", () => {
    const codes = [400, 401, 403, 404, 429, 500];
    for (const code of codes) {
      const res = apiError("error message", code);
      expect(res.status).toBe(code);
    }
  });

  it("Access-Control-Allow-Origin is '*' on error responses too", () => {
    const res = apiError("Not found", 404);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  it("does NOT include Cache-Control on error responses", () => {
    // apiError intentionally omits Cache-Control — errors should not be cached
    const res = apiError("Server error", 500);
    expect(res.headers.get("Cache-Control")).toBeNull();
  });
});

// ── apiOptions — CORS preflight contract ──

describe("apiOptions CORS preflight contract", () => {
  it("status is 204 No Content", () => {
    expect(apiOptions().status).toBe(204);
  });

  it("Access-Control-Allow-Origin is *", () => {
    expect(apiOptions().headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  it("Access-Control-Allow-Methods includes GET and OPTIONS", () => {
    const methods = apiOptions().headers.get("Access-Control-Allow-Methods") ?? "";
    expect(methods).toContain("GET");
    expect(methods).toContain("OPTIONS");
  });

  it("Access-Control-Allow-Headers includes Content-Type and Authorization", () => {
    const allowed = apiOptions().headers.get("Access-Control-Allow-Headers") ?? "";
    expect(allowed).toContain("Content-Type");
    expect(allowed).toContain("Authorization");
  });

  it("Access-Control-Max-Age is 86400 (24 hours)", () => {
    expect(apiOptions().headers.get("Access-Control-Max-Age")).toBe("86400");
  });

  it("body is empty (no content on 204)", async () => {
    const body = await apiOptions().text();
    expect(body).toBe("");
  });

  it("consistent — multiple calls return same header values", () => {
    const r1 = apiOptions();
    const r2 = apiOptions();
    expect(r1.headers.get("Access-Control-Allow-Origin"))
      .toBe(r2.headers.get("Access-Control-Allow-Origin"));
    expect(r1.headers.get("Access-Control-Max-Age"))
      .toBe(r2.headers.get("Access-Control-Max-Age"));
  });
});

// ── Integration: generateApiKey → hashApiKey consistency ──

describe("generateApiKey / hashApiKey round-trip", () => {
  it("keyHash in generateApiKey output matches hashApiKey(rawKey)", () => {
    for (let i = 0; i < 3; i++) {
      const { rawKey, keyHash } = generateApiKey();
      expect(hashApiKey(rawKey)).toBe(keyHash);
    }
  });

  it("different raw keys from generateApiKey always have different hashes", () => {
    const results = Array.from({ length: 5 }, () => generateApiKey());
    const hashes = results.map((r) => r.keyHash);
    const unique = new Set(hashes);
    expect(unique.size).toBe(5);
  });
});
