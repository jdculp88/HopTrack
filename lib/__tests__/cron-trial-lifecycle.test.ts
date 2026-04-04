// Trial Lifecycle Cron unit tests — Reese + Riley, Sprint 147
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ──

vi.mock("@/lib/rate-limit", () => ({
  rateLimitResponse: vi.fn(() => null),
}));

const mockOnTrialWarning = vi.fn().mockResolvedValue(undefined);
const mockOnTrialExpired = vi.fn().mockResolvedValue(undefined);
vi.mock("@/lib/email-triggers", () => ({
  onTrialWarning: (...args: unknown[]) => mockOnTrialWarning(...args),
  onTrialExpired: (...args: unknown[]) => mockOnTrialExpired(...args),
}));

// Build a deeply chainable Supabase query mock using Proxy
// Every method returns itself, and awaiting resolves to { data }
function buildQueryChain(data: any[] = []): any {
  const resolved = { data };
  return new Proxy(function () {}, {
    get(_target, prop) {
      if (prop === "then") return (resolve: any) => resolve(resolved);
      // Return a function that returns the same proxy (chainable)
      return vi.fn().mockReturnValue(buildQueryChain(data));
    },
    apply() {
      return buildQueryChain(data);
    },
  }) as any;
}

const mockUpdate = vi.fn().mockReturnValue(buildQueryChain());
const mockFrom = vi.fn().mockImplementation(() => {
  const chain = buildQueryChain([]);
  chain.update = mockUpdate;
  return chain;
});

// Wrap mockFrom to support .update on the returned chain
const mockFromWithUpdate = vi.fn().mockImplementation((...args: any[]) => {
  const result = mockFrom(...args);
  return {
    ...result,
    select: vi.fn().mockReturnValue(buildQueryChain([])),
    update: mockUpdate,
  };
});

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from: mockFrom })),
}));

import { POST } from "@/app/api/cron/trial-lifecycle/route";

// ── Helpers ──
function buildRequest(secret?: string): Request {
  const headers = new Headers();
  if (secret) headers.set("authorization", `Bearer ${secret}`);
  return new Request("http://localhost/api/cron/trial-lifecycle", {
    method: "POST",
    headers,
  });
}

function setupMockResponses(warningData: any[] = [], expiredData: any[] = []) {
  let callCount = 0;
  mockFrom.mockImplementation((table: string) => {
    if (table === "breweries") {
      callCount++;
      // Calls 1-2: warning queries (null tier, free tier)
      // Calls 3-4: expired queries (null tier, free tier)
      const data = callCount <= 2 ? warningData : expiredData;
      const chain = buildQueryChain(data);
      return { select: vi.fn().mockReturnValue(chain), update: mockUpdate };
    }
    return { select: vi.fn().mockReturnValue(buildQueryChain([])), update: mockUpdate };
  });
}

// ── Tests ──

describe("POST /api/cron/trial-lifecycle", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, CRON_SECRET: "test-secret-123" };
    // Default: no matching breweries
    setupMockResponses([], []);
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

  it("returns success with zero counts when no breweries match", async () => {
    const res = await POST(buildRequest("test-secret-123"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.warnings.found).toBe(0);
    expect(body.warnings.sent).toBe(0);
    expect(body.expired.found).toBe(0);
    expect(body.expired.sent).toBe(0);
  });

  it("calls onTrialWarning for breweries approaching expiry", async () => {
    const warningBrewery = { id: "brew-1", name: "Test Brewery", trial_ends_at: new Date().toISOString() };
    setupMockResponses([warningBrewery], []);

    const res = await POST(buildRequest("test-secret-123"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(mockOnTrialWarning).toHaveBeenCalledWith("brew-1");
    expect(body.warnings.sent).toBeGreaterThanOrEqual(1);
  });

  it("calls onTrialExpired for expired breweries", async () => {
    const expiredBrewery = { id: "brew-2", name: "Expired Brewery", trial_ends_at: new Date().toISOString() };
    setupMockResponses([], [expiredBrewery]);

    const res = await POST(buildRequest("test-secret-123"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(mockOnTrialExpired).toHaveBeenCalledWith("brew-2");
    expect(body.expired.sent).toBeGreaterThanOrEqual(1);
  });

  it("continues processing when an individual email fails", async () => {
    const breweries = [
      { id: "brew-a", name: "A", trial_ends_at: new Date().toISOString() },
      { id: "brew-b", name: "B", trial_ends_at: new Date().toISOString() },
    ];

    mockOnTrialWarning
      .mockRejectedValueOnce(new Error("Email service down"))
      .mockResolvedValueOnce(undefined);

    setupMockResponses(breweries, []);

    const res = await POST(buildRequest("test-secret-123"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(mockOnTrialWarning).toHaveBeenCalledTimes(2);
    expect(body.warnings.sent).toBe(1);
  });

  it("deduplicates breweries found in both null and free tier queries", async () => {
    const brewery = { id: "brew-dup", name: "Duped", trial_ends_at: new Date().toISOString() };
    // Both queries return the same brewery — should only process once
    setupMockResponses([brewery], []);

    const res = await POST(buildRequest("test-secret-123"));
    expect(res.status).toBe(200);
    const body = await res.json();
    // Despite appearing in both null-tier and free-tier queries, only called once
    expect(mockOnTrialWarning).toHaveBeenCalledTimes(1);
    expect(body.warnings.found).toBe(1);
  });
});
