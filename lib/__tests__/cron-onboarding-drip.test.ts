// Onboarding Drip Cron unit tests — Reese + Parker, Sprint 147
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ──

vi.mock("@/lib/rate-limit", () => ({
  rateLimitResponse: vi.fn(() => null),
}));

const mockOnOnboardingDay3 = vi.fn().mockResolvedValue(undefined);
const mockOnOnboardingDay7 = vi.fn().mockResolvedValue(undefined);
vi.mock("@/lib/email-triggers", () => ({
  onOnboardingDay3: (...args: unknown[]) => mockOnOnboardingDay3(...args),
  onOnboardingDay7: (...args: unknown[]) => mockOnOnboardingDay7(...args),
}));

// Default mock: no accounts found
const mockSelect = vi.fn().mockReturnValue({
  eq: vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      gte: vi.fn().mockReturnValue({
        lt: vi.fn().mockResolvedValue({ data: [] }),
      }),
    }),
  }),
});
const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from: mockFrom })),
}));

import { POST } from "@/app/api/cron/onboarding-drip/route";

// ── Helpers ──
function buildRequest(secret?: string): Request {
  const headers = new Headers();
  if (secret) headers.set("authorization", `Bearer ${secret}`);
  return new Request("http://localhost/api/cron/onboarding-drip", {
    method: "POST",
    headers,
  });
}

// ── Tests ──

describe("POST /api/cron/onboarding-drip", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, CRON_SECRET: "test-secret-123" };
  });

  // ── Auth tests ──

  it("returns 500 when CRON_SECRET is not configured", async () => {
    delete process.env.CRON_SECRET;
    const res = await POST(buildRequest("anything"));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Server misconfigured");
  });

  it("returns 401 when authorization header is missing", async () => {
    const res = await POST(buildRequest());
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 401 when authorization header has wrong secret", async () => {
    const res = await POST(buildRequest("wrong-secret"));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  // ── Core logic ──

  it("returns success with zero counts when no accounts match", async () => {
    const res = await POST(buildRequest("test-secret-123"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.day3.found).toBe(0);
    expect(body.day3.sent).toBe(0);
    expect(body.day7.found).toBe(0);
    expect(body.day7.sent).toBe(0);
  });

  it("sends day-3 email for accounts verified 3 days ago", async () => {
    const day3Account = { brewery_id: "brew-day3", verified_at: new Date().toISOString() };
    let callCount = 0;

    mockFrom.mockImplementation(() => {
      callCount++;
      // First from() call is for day-3 query, second for day-7
      const data = callCount === 1 ? [day3Account] : [];
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              gte: vi.fn().mockReturnValue({
                lt: vi.fn().mockResolvedValue({ data }),
              }),
            }),
          }),
        }),
      };
    });

    const res = await POST(buildRequest("test-secret-123"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(mockOnOnboardingDay3).toHaveBeenCalledWith("brew-day3");
    expect(body.day3.found).toBe(1);
    expect(body.day3.sent).toBe(1);
  });

  it("sends day-7 email for accounts verified 7 days ago", async () => {
    const day7Account = { brewery_id: "brew-day7", verified_at: new Date().toISOString() };
    let callCount = 0;

    mockFrom.mockImplementation(() => {
      callCount++;
      const data = callCount === 2 ? [day7Account] : [];
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              gte: vi.fn().mockReturnValue({
                lt: vi.fn().mockResolvedValue({ data }),
              }),
            }),
          }),
        }),
      };
    });

    const res = await POST(buildRequest("test-secret-123"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(mockOnOnboardingDay7).toHaveBeenCalledWith("brew-day7");
    expect(body.day7.found).toBe(1);
    expect(body.day7.sent).toBe(1);
  });

  it("continues processing when an individual day-3 email fails", async () => {
    const accounts = [
      { brewery_id: "brew-a", verified_at: new Date().toISOString() },
      { brewery_id: "brew-b", verified_at: new Date().toISOString() },
    ];
    let callCount = 0;

    mockOnOnboardingDay3
      .mockRejectedValueOnce(new Error("Email service down"))
      .mockResolvedValueOnce(undefined);

    mockFrom.mockImplementation(() => {
      callCount++;
      const data = callCount === 1 ? accounts : [];
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              gte: vi.fn().mockReturnValue({
                lt: vi.fn().mockResolvedValue({ data }),
              }),
            }),
          }),
        }),
      };
    });

    const res = await POST(buildRequest("test-secret-123"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(mockOnOnboardingDay3).toHaveBeenCalledTimes(2);
    // One succeeded, one failed
    expect(body.day3.sent).toBe(1);
  });

  it("response shape includes day3 and day7 sections", async () => {
    const res = await POST(buildRequest("test-secret-123"));
    const body = await res.json();
    expect(body).toHaveProperty("success");
    expect(body).toHaveProperty("day3");
    expect(body).toHaveProperty("day7");
    expect(body.day3).toHaveProperty("found");
    expect(body.day3).toHaveProperty("sent");
    expect(body.day7).toHaveProperty("found");
    expect(body.day7).toHaveProperty("sent");
  });
});
