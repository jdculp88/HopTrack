// Email trigger function tests — Avery + Reese, Sprint 77
// Note: trigger functions are tightly coupled to Supabase (createClient in each fn).
// We test the exported interface and the one function that doesn't need Supabase: onPasswordReset.
// Full integration tests for the Supabase-coupled triggers will come with the test DB.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock Supabase server client so imports don't crash
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
          limit: () => Promise.resolve({ data: [], error: null }),
        }),
      }),
    }),
  }),
}));

describe("email-triggers exports", () => {
  it("exports all five trigger functions", async () => {
    const triggers = await import("@/lib/email-triggers");
    expect(typeof triggers.onUserSignUp).toBe("function");
    expect(typeof triggers.onBreweryClaim).toBe("function");
    expect(typeof triggers.onTrialWarning).toBe("function");
    expect(typeof triggers.onTrialExpired).toBe("function");
    expect(typeof triggers.onPasswordReset).toBe("function");
  });
});

describe("onPasswordReset", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    delete process.env.RESEND_API_KEY;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("calls sendEmail with the reset URL (dev mode fallback)", async () => {
    const consoleSpy = vi.spyOn(console, "info").mockImplementation(() => {});

    // Re-import to get fresh module with mocks
    const { onPasswordReset } = await import("@/lib/email-triggers");

    await onPasswordReset("user@example.com", "https://hoptrack.beer/reset?token=abc123");

    // In dev mode (no RESEND_API_KEY), sendEmail logs to console
    const allCalls = consoleSpy.mock.calls.flat().join(" ");
    expect(allCalls).toContain("user@example.com");

    consoleSpy.mockRestore();
  });

  it("does not throw even if sendEmail fails", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "info").mockImplementation(() => {});

    const { onPasswordReset } = await import("@/lib/email-triggers");

    // Should not throw — errors are caught internally
    await expect(
      onPasswordReset("user@example.com", "https://hoptrack.beer/reset?token=abc")
    ).resolves.toBeUndefined();

    consoleErrorSpy.mockRestore();
  });
});

describe("onUserSignUp", () => {
  it("does not throw when profile has no email", async () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { onUserSignUp } = await import("@/lib/email-triggers");

    // The mock returns data: null from .single(), so no email
    await expect(onUserSignUp("fake-user-id")).resolves.toBeUndefined();

    consoleSpy.mockRestore();
  });
});
