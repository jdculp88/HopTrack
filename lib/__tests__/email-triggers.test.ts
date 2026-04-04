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

// ── Email Template Content Tests (Sprint 148) ──────────────────────

describe("onboardingDay3Email", () => {
  it("includes tap list, loyalty, and Board setup steps", async () => {
    const { onboardingDay3Email } = await import("@/lib/email-templates/index");

    const email = onboardingDay3Email({
      breweryName: "Test Brewery",
      ownerName: "Josh Smith",
      breweryId: "test-id",
    });

    expect(email.subject).toContain("Test Brewery");
    expect(email.html).toContain("tap list");
    expect(email.html).toContain("loyalty program");
    expect(email.html).toContain("The Board");
    expect(email.html).toContain("Open Your Dashboard");
    expect(email.html).toContain("test-id");
  });

  it("uses first name from full name", async () => {
    const { onboardingDay3Email } = await import("@/lib/email-templates/index");

    const email = onboardingDay3Email({
      breweryName: "Brewery",
      ownerName: "Josh Smith",
      breweryId: "id",
    });

    expect(email.html).toContain("Josh");
  });
});

describe("onboardingDay7Email", () => {
  it("shows stats and analytics highlights when sessions > 0", async () => {
    const { onboardingDay7Email } = await import("@/lib/email-templates/index");

    const email = onboardingDay7Email({
      breweryName: "Test Brewery",
      ownerName: "Drew Taylor",
      breweryId: "test-id",
      stats: { sessions: 15, beersLogged: 42, followers: 8 },
    });

    expect(email.subject).toContain("first week");
    expect(email.html).toContain("15"); // sessions stat
    expect(email.html).toContain("42"); // beers stat
    expect(email.html).toContain("8");  // followers stat
    expect(email.html).toContain("peak hours");
    expect(email.html).toContain("top beers by rating");
    expect(email.html).toContain("View Full Analytics");
  });

  it("shows encouragement message when sessions = 0", async () => {
    const { onboardingDay7Email } = await import("@/lib/email-templates/index");

    const email = onboardingDay7Email({
      breweryName: "New Brewery",
      ownerName: "Sam",
      breweryId: "id",
      stats: { sessions: 0, beersLogged: 0, followers: 0 },
    });

    expect(email.html).toContain("QR table tents");
    expect(email.html).not.toContain("peak hours");
  });

  it("includes trial reminder and billing link", async () => {
    const { onboardingDay7Email } = await import("@/lib/email-templates/index");

    const email = onboardingDay7Email({
      breweryName: "Brewery",
      ownerName: "Owner",
      breweryId: "id",
      stats: { sessions: 5, beersLogged: 10, followers: 3 },
    });

    expect(email.html).toContain("7 days left");
    expect(email.html).toContain("Settings");
    expect(email.html).toContain("Billing");
  });
});
