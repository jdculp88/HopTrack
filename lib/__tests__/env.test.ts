/**
 * Tests for lib/env.ts — Sprint 104 (The Audit)
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { validateEnv, requireEnv } from "@/lib/env";

describe("validateEnv", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Isolate env for each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("passes when all required env vars are present", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key";

    expect(() => validateEnv()).not.toThrow();
  });

  it("throws when NEXT_PUBLIC_SUPABASE_URL is missing", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key";

    expect(() => validateEnv()).toThrow("NEXT_PUBLIC_SUPABASE_URL");
  });

  it("throws when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key";

    expect(() => validateEnv()).toThrow("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  });

  it("includes helpful error message with all missing vars", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key";

    let errorMessage = "";
    try {
      validateEnv();
    } catch (err) {
      errorMessage = String(err);
    }
    expect(errorMessage).toContain("NEXT_PUBLIC_SUPABASE_URL");
    expect(errorMessage).toContain("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    expect(errorMessage).toContain(".env.local.example");
  });
});

describe("requireEnv", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns the value when the var is set", () => {
    process.env.MY_TEST_VAR = "hello-world";
    expect(requireEnv("MY_TEST_VAR")).toBe("hello-world");
  });

  it("throws with the variable name when missing", () => {
    delete process.env.MY_MISSING_VAR;
    expect(() => requireEnv("MY_MISSING_VAR")).toThrow("MY_MISSING_VAR");
  });

  it("throws on empty string value", () => {
    process.env.EMPTY_VAR = "";
    expect(() => requireEnv("EMPTY_VAR")).toThrow("EMPTY_VAR");
  });
});
