// AI Suggestions Cron unit tests — Reese + Dakota, Sprint 147
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ──

vi.mock("@/lib/rate-limit", () => ({
  rateLimitResponse: vi.fn(() => null),
}));

const mockGenerateAISuggestions = vi.fn().mockResolvedValue(undefined);
vi.mock("@/lib/ai-promotions", () => ({
  generateAISuggestions: (...args: unknown[]) => mockGenerateAISuggestions(...args),
}));

// Supabase service client mock
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: vi.fn(() => ({ from: mockFrom })),
}));

import { POST } from "@/app/api/cron/ai-suggestions/route";

// ── Helpers ──
function buildRequest(secret?: string): Request {
  const headers = new Headers();
  if (secret) headers.set("authorization", `Bearer ${secret}`);
  return new Request("http://localhost/api/cron/ai-suggestions", {
    method: "POST",
    headers,
  });
}

function setupBreweryMock(breweries: any[] | null) {
  mockFrom.mockImplementation(() => ({
    select: vi.fn().mockReturnValue({
      in: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: breweries }),
      }),
    }),
  }));
}

// ── Tests ──

describe("POST /api/cron/ai-suggestions", () => {
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

  it("returns zero generated when no premium breweries exist", async () => {
    setupBreweryMock([]);

    const res = await POST(buildRequest("test-secret-123"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.generated).toBe(0);
    expect(body.message).toContain("No premium breweries");
  });

  it("generates suggestions for each cask/barrel brewery", async () => {
    setupBreweryMock([
      { id: "brew-cask", name: "Cask Brewery" },
      { id: "brew-barrel", name: "Barrel Brewery" },
    ]);

    const res = await POST(buildRequest("test-secret-123"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.generated).toBe(2);
    expect(body.failed).toBe(0);
    expect(body.total).toBe(2);
    expect(mockGenerateAISuggestions).toHaveBeenCalledWith("brew-cask");
    expect(mockGenerateAISuggestions).toHaveBeenCalledWith("brew-barrel");
  });

  it("continues processing when one brewery fails", async () => {
    setupBreweryMock([
      { id: "brew-ok", name: "Good Brewery" },
      { id: "brew-fail", name: "Bad Brewery" },
      { id: "brew-ok2", name: "Also Good" },
    ]);

    mockGenerateAISuggestions
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("AI service timeout"))
      .mockResolvedValueOnce(undefined);

    const res = await POST(buildRequest("test-secret-123"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.generated).toBe(2);
    expect(body.failed).toBe(1);
    expect(body.total).toBe(3);
    expect(body.errors).toHaveLength(1);
    expect(body.errors[0]).toContain("Bad Brewery");
  });

  it("does not include errors array when all succeed", async () => {
    setupBreweryMock([{ id: "brew-1", name: "Test" }]);

    const res = await POST(buildRequest("test-secret-123"));
    const body = await res.json();
    expect(body.errors).toBeUndefined();
  });

  it("response shape includes generated, failed, and total fields", async () => {
    setupBreweryMock([{ id: "brew-1", name: "Test" }]);

    const res = await POST(buildRequest("test-secret-123"));
    const body = await res.json();
    expect(body).toHaveProperty("success", true);
    expect(body).toHaveProperty("generated");
    expect(body).toHaveProperty("failed");
    expect(body).toHaveProperty("total");
  });
});
