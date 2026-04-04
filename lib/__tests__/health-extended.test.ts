/**
 * Health Endpoint Extended Tests — Sprint 151 (The Ops Room)
 *
 * Tests the `checks` object added to /api/health response.
 * Validates service configuration visibility for monitoring tools.
 *
 * Riley + Dakota
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ──

const { mockLogger, mockFrom } = vi.hoisted(() => ({
  mockLogger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
  mockFrom: vi.fn(),
}));

vi.mock("@/lib/logger", () => ({
  createLogger: vi.fn(() => mockLogger),
}));

vi.mock("@/lib/email", () => ({
  isEmailConfigured: vi.fn(() => false),
}));

// Proxy-based Supabase chain builder (canonical pattern)
function buildQueryChain(data: any = null, error: any = null): any {
  const resolved = { data, error };
  return new Proxy(function () {}, {
    get(_target, prop) {
      if (prop === "then") return (resolve: any) => resolve(resolved);
      return vi.fn().mockReturnValue(buildQueryChain(data, error));
    },
    apply() {
      return buildQueryChain(data, error);
    },
  }) as any;
}

vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: vi.fn(() => ({ from: mockFrom })),
}));

import { GET } from "@/app/api/health/route";
import { isEmailConfigured } from "@/lib/email";

// ── Helpers ──

async function parseResponse(res: Response) {
  const body = await res.json();
  return { status: res.status, body };
}

// ── Tests ──

describe("GET /api/health — checks object", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue(buildQueryChain(null, null));
    // Reset env vars
    delete process.env.CRON_SECRET;
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;
  });

  it("includes checks object in healthy response", async () => {
    const { body } = await parseResponse(await GET());

    expect(body.checks).toBeDefined();
    expect(body.checks).toHaveProperty("email");
    expect(body.checks).toHaveProperty("cron");
    expect(body.checks).toHaveProperty("sentry");
  });

  it("reports email as not_configured when RESEND_API_KEY is absent", async () => {
    (isEmailConfigured as any).mockReturnValue(false);

    const { body } = await parseResponse(await GET());

    expect(body.checks.email).toBe("not_configured");
  });

  it("reports email as configured when RESEND_API_KEY is present", async () => {
    (isEmailConfigured as any).mockReturnValue(true);

    const { body } = await parseResponse(await GET());

    expect(body.checks.email).toBe("configured");
  });

  it("reports cron as not_configured when CRON_SECRET is absent", async () => {
    delete process.env.CRON_SECRET;

    const { body } = await parseResponse(await GET());

    expect(body.checks.cron).toBe("not_configured");
  });

  it("reports cron as configured when CRON_SECRET is present", async () => {
    process.env.CRON_SECRET = "test-secret";

    const { body } = await parseResponse(await GET());

    expect(body.checks.cron).toBe("configured");
  });

  it("reports sentry as not_configured when DSN is absent", async () => {
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;

    const { body } = await parseResponse(await GET());

    expect(body.checks.sentry).toBe("not_configured");
  });

  it("reports sentry as configured when DSN is present", async () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = "https://test@sentry.io/123";

    const { body } = await parseResponse(await GET());

    expect(body.checks.sentry).toBe("configured");
  });

  it("includes checks object in degraded response", async () => {
    mockFrom.mockReturnValue(
      buildQueryChain(null, { message: "connection refused" })
    );

    const { body } = await parseResponse(await GET());

    expect(body.status).toBe("degraded");
    expect(body.checks).toBeDefined();
    expect(body.checks).toHaveProperty("email");
  });
});
