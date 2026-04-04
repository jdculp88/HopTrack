/**
 * Email Health Endpoint Tests — Sprint 151 (The Ops Room)
 *
 * Tests the /api/health/email endpoint for T-24h launch checklist verification.
 * Validates CRON_SECRET auth pattern and response shape.
 *
 * Riley + Dakota
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ──

const { mockLogger } = vi.hoisted(() => ({
  mockLogger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

vi.mock("@/lib/logger", () => ({
  createLogger: vi.fn(() => mockLogger),
}));

vi.mock("@/lib/email", () => ({
  isEmailConfigured: vi.fn(() => false),
}));

import { GET } from "@/app/api/health/email/route";
import { isEmailConfigured } from "@/lib/email";

// ── Helpers ──

function makeRequest(headers: Record<string, string> = {}): Request {
  return new Request("http://localhost:3000/api/health/email", {
    method: "GET",
    headers,
  });
}

async function parseResponse(res: Response) {
  const body = await res.json();
  return { status: res.status, body };
}

// ── Tests ──

describe("GET /api/health/email", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "test-cron-secret";
  });

  describe("Auth", () => {
    it("returns 500 when CRON_SECRET is not configured", async () => {
      delete process.env.CRON_SECRET;

      const { status, body } = await parseResponse(
        await GET(makeRequest())
      );

      expect(status).toBe(500);
      expect(body.error).toBe("Server misconfigured");
    });

    it("returns 401 when no auth header is provided", async () => {
      const { status, body } = await parseResponse(
        await GET(makeRequest())
      );

      expect(status).toBe(401);
      expect(body.error).toBe("Unauthorized");
    });

    it("returns 401 when auth header is invalid", async () => {
      const { status } = await parseResponse(
        await GET(makeRequest({ authorization: "Bearer wrong-secret" }))
      );

      expect(status).toBe(401);
    });

    it("returns 200 with valid CRON_SECRET", async () => {
      const { status } = await parseResponse(
        await GET(makeRequest({ authorization: "Bearer test-cron-secret" }))
      );

      expect(status).toBe(200);
    });
  });

  describe("Response shape", () => {
    it("returns expected fields when email is not configured", async () => {
      (isEmailConfigured as any).mockReturnValue(false);

      const { body } = await parseResponse(
        await GET(makeRequest({ authorization: "Bearer test-cron-secret" }))
      );

      expect(body.configured).toBe(false);
      expect(body.fromEmail).toBeNull();
      expect(body.templateCount).toBe(11);
      expect(body.triggerCount).toBe(11);
      expect(body.timestamp).toBeTruthy();
    });

    it("returns fromEmail when email is configured", async () => {
      (isEmailConfigured as any).mockReturnValue(true);
      process.env.RESEND_FROM_EMAIL = "HopTrack <hello@hoptrack.beer>";

      const { body } = await parseResponse(
        await GET(makeRequest({ authorization: "Bearer test-cron-secret" }))
      );

      expect(body.configured).toBe(true);
      expect(body.fromEmail).toBe("HopTrack <hello@hoptrack.beer>");
    });
  });
});
