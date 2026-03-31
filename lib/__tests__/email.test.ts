// Email service unit tests — Avery + Reese, Sprint 77
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("sendEmail", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    delete process.env.RESEND_API_KEY;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("falls back to console.info when RESEND_API_KEY is absent", async () => {
    const consoleSpy = vi.spyOn(console, "info").mockImplementation(() => {});

    // Dynamic import so env is read fresh
    const { sendEmail } = await import("@/lib/email");

    const result = await sendEmail({
      to: "test@example.com",
      subject: "Test Subject",
      html: "<p>Hello</p>",
      text: "Hello",
    });

    expect(result.success).toBe(true);
    expect(result.id).toBe("dev-mode");
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("logs the recipient and subject in dev mode", async () => {
    const consoleSpy = vi.spyOn(console, "info").mockImplementation(() => {});

    const { sendEmail } = await import("@/lib/email");

    await sendEmail({
      to: "brewer@hoptrack.beer",
      subject: "Welcome to HopTrack",
      html: "<p>Welcome</p>",
    });

    const allCalls = consoleSpy.mock.calls.flat().join(" ");
    expect(allCalls).toContain("brewer@hoptrack.beer");
    expect(allCalls).toContain("Welcome to HopTrack");

    consoleSpy.mockRestore();
  });
});

describe("isEmailConfigured", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns false when RESEND_API_KEY is not set", async () => {
    delete process.env.RESEND_API_KEY;
    const { isEmailConfigured } = await import("@/lib/email");
    expect(isEmailConfigured()).toBe(false);
  });

  it("returns true when RESEND_API_KEY is set", async () => {
    process.env.RESEND_API_KEY = "re_test_123";
    const { isEmailConfigured } = await import("@/lib/email");
    expect(isEmailConfigured()).toBe(true);
  });
});
