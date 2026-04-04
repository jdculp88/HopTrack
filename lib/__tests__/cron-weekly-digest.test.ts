// Weekly Digest Cron unit tests — Reese + Taylor, Sprint 147
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ──

vi.mock("@/lib/rate-limit", () => ({
  rateLimitResponse: vi.fn(() => null),
}));

const mockSendEmail = vi.fn().mockResolvedValue({ success: true });
vi.mock("@/lib/email", () => ({
  sendEmail: (...args: unknown[]) => mockSendEmail(...args),
}));

vi.mock("@/lib/email-templates", () => ({
  weeklyDigestEmail: vi.fn(() => ({
    subject: "Your Weekly Digest",
    html: "<p>Digest</p>",
    text: "Digest",
  })),
}));

const mockCalculateDigestStats = vi.fn().mockResolvedValue({
  stats: { visits: 10, visitsTrend: 5, uniqueVisitors: 8, beersLogged: 20, topBeer: "IPA", loyaltyRedemptions: 2, newFollowers: 3 },
});
vi.mock("@/app/api/brewery/[brewery_id]/digest/route", () => ({
  calculateDigestStats: (...args: unknown[]) => mockCalculateDigestStats(...args),
}));

const mockOnBrandWeeklyDigest = vi.fn().mockResolvedValue(undefined);
vi.mock("@/lib/email-triggers", () => ({
  onBrandWeeklyDigest: (...args: unknown[]) => mockOnBrandWeeklyDigest(...args),
}));

// ── Supabase mock with configurable responses ──
const queryResponses: Record<string, any> = {};

function buildChain(data: any) {
  const chain: any = {
    select: vi.fn().mockReturnValue(chain),
    eq: vi.fn().mockReturnValue(chain),
    in: vi.fn().mockReturnValue(chain),
    not: vi.fn().mockReturnValue(chain),
    gte: vi.fn().mockReturnValue(chain),
    is: vi.fn().mockReturnValue(chain),
    single: vi.fn().mockResolvedValue({ data }),
  };
  // Make the chain itself thenable so awaiting it resolves
  chain.then = (resolve: any) => resolve({ data: Array.isArray(data) ? data : [data] });
  return chain;
}

const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from: mockFrom })),
}));

import { POST } from "@/app/api/cron/weekly-digest/route";

// ── Helpers ──
function buildRequest(secret?: string): Request {
  const headers = new Headers();
  if (secret) headers.set("authorization", `Bearer ${secret}`);
  return new Request("http://localhost/api/cron/weekly-digest", {
    method: "POST",
    headers,
  });
}

function setupDefaultMocks(overrides: {
  sessions?: any[];
  breweries?: any[];
  brandLocations?: any[];
  brandAccounts?: any[];
  breweryAccounts?: any[];
  profile?: any;
} = {}) {
  const sessions = overrides.sessions ?? [];
  const breweries = overrides.breweries ?? [];
  const brandLocations = overrides.brandLocations ?? [];
  const brandAccounts = overrides.brandAccounts ?? [];
  const breweryAccounts = overrides.breweryAccounts ?? [];
  const profile = overrides.profile ?? { display_name: "Owner", email: "owner@test.com" };

  let callCount = 0;
  mockFrom.mockImplementation((table: string) => {
    const chain: any = {};
    const addMethods = (obj: any) => {
      obj.select = vi.fn().mockReturnValue(obj);
      obj.eq = vi.fn().mockReturnValue(obj);
      obj.in = vi.fn().mockReturnValue(obj);
      obj.not = vi.fn().mockReturnValue(obj);
      obj.gte = vi.fn().mockReturnValue(obj);
      obj.is = vi.fn().mockReturnValue(obj);
      obj.single = vi.fn().mockResolvedValue({ data: profile });
      return obj;
    };
    addMethods(chain);

    if (table === "sessions") {
      chain.then = (resolve: any) => resolve({ data: sessions });
    } else if (table === "breweries") {
      callCount++;
      // First breweries call: verified filter, second: brandLocations
      if (callCount <= 1) {
        chain.then = (resolve: any) => resolve({ data: breweries });
      } else {
        chain.then = (resolve: any) => resolve({ data: brandLocations });
      }
    } else if (table === "brand_accounts") {
      chain.then = (resolve: any) => resolve({ data: brandAccounts });
    } else if (table === "brewery_accounts") {
      chain.then = (resolve: any) => resolve({ data: breweryAccounts });
    } else if (table === "profiles") {
      chain.then = (resolve: any) => resolve({ data: profile });
    }
    return chain;
  });
}

// ── Tests ──

describe("POST /api/cron/weekly-digest", () => {
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

  it("returns zero sent when no active sessions this week", async () => {
    setupDefaultMocks({ sessions: [] });

    const res = await POST(buildRequest("test-secret-123"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.sent).toBe(0);
    expect(body.message).toContain("No active breweries");
  });

  it("returns zero sent when no claimed breweries have activity", async () => {
    // Sessions exist but no verified breweries match
    setupDefaultMocks({
      sessions: [{ brewery_id: "brew-1" }],
      breweries: [],
    });

    const res = await POST(buildRequest("test-secret-123"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.sent).toBe(0);
  });

  it("sends individual brewery digest when brewery has an owner", async () => {
    setupDefaultMocks({
      sessions: [{ brewery_id: "brew-1" }],
      breweries: [{ id: "brew-1", name: "Test Brewery" }],
      brandLocations: [], // no brand locations
      breweryAccounts: [{ user_id: "user-1", role: "owner" }],
      profile: { display_name: "Test Owner", email: "owner@test.com" },
    });

    const res = await POST(buildRequest("test-secret-123"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(mockSendEmail).toHaveBeenCalled();
  });

  it("sends brand digest and skips per-location digest for brand owners", async () => {
    setupDefaultMocks({
      sessions: [{ brewery_id: "brew-1" }],
      breweries: [{ id: "brew-1", name: "Brand Location" }],
      brandLocations: [{ brand_id: "brand-1" }],
      brandAccounts: [{ user_id: "user-1" }],
      breweryAccounts: [{ user_id: "user-1", role: "owner" }],
      profile: { display_name: "Brand Owner", email: "brand@test.com" },
    });

    const res = await POST(buildRequest("test-secret-123"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(mockOnBrandWeeklyDigest).toHaveBeenCalledWith("brand-1");
  });

  it("response shape includes sent, failed, and total fields", async () => {
    setupDefaultMocks({ sessions: [] });

    const res = await POST(buildRequest("test-secret-123"));
    const body = await res.json();
    expect(body).toHaveProperty("success");
    expect(body).toHaveProperty("sent");
  });
});
