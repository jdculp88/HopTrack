/**
 * Health Endpoint Unit Tests — Sprint 150 (The Playwright)
 *
 * Tests the /api/health endpoint covering all 3 response states:
 * healthy (200), degraded (503), unhealthy (503).
 *
 * Dakota + Reese
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

// Proxy-based Supabase chain builder (canonical pattern from cron-trial-lifecycle)
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

// ── Helpers ──

async function parseResponse(res: Response) {
  const body = await res.json();
  return { status: res.status, body, headers: res.headers };
}

// ── Tests ──

describe("GET /api/health", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue(buildQueryChain(null, null));
  });

  describe("Healthy (200)", () => {
    it("returns 200 with healthy status when DB connects", async () => {
      mockFrom.mockReturnValue(buildQueryChain(null, null));

      const { status, body } = await parseResponse(await GET());

      expect(status).toBe(200);
      expect(body.status).toBe("healthy");
      expect(body.database).toBe("connected");
    });

    it("includes latency_ms as a number", async () => {
      const { body } = await parseResponse(await GET());

      expect(typeof body.latency_ms).toBe("number");
      expect(body.latency_ms).toBeGreaterThanOrEqual(0);
    });

    it("includes a valid ISO timestamp", async () => {
      const { body } = await parseResponse(await GET());

      expect(body.timestamp).toBeTruthy();
      expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
    });

    it("includes version field", async () => {
      const { body } = await parseResponse(await GET());

      expect(body.version).toBeTruthy();
    });

    it("sets Cache-Control: no-store header", async () => {
      const res = await GET();

      expect(res.headers.get("Cache-Control")).toBe("no-store");
    });
  });

  describe("Degraded (503) — DB error", () => {
    it("returns 503 with degraded status when Supabase returns error", async () => {
      mockFrom.mockReturnValue(
        buildQueryChain(null, { message: "connection refused" })
      );

      const { status, body } = await parseResponse(await GET());

      expect(status).toBe(503);
      expect(body.status).toBe("degraded");
      expect(body.database).toBe("unreachable");
    });

    it("includes latency_ms even on degraded response", async () => {
      mockFrom.mockReturnValue(
        buildQueryChain(null, { message: "timeout" })
      );

      const { body } = await parseResponse(await GET());

      expect(typeof body.latency_ms).toBe("number");
    });

    it("logs the error", async () => {
      mockFrom.mockReturnValue(
        buildQueryChain(null, { message: "connection refused" })
      );

      await GET();

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Database health check failed",
        expect.objectContaining({ error: "connection refused" })
      );
    });

    it("sets Cache-Control: no-store on degraded response", async () => {
      mockFrom.mockReturnValue(
        buildQueryChain(null, { message: "error" })
      );

      const res = await GET();
      expect(res.headers.get("Cache-Control")).toBe("no-store");
    });
  });

  describe("Unhealthy (503) — exception thrown", () => {
    it("returns 503 with unhealthy status on exception", async () => {
      const { createServiceClient } = await import("@/lib/supabase/service");
      (createServiceClient as any).mockImplementationOnce(() => {
        throw new Error("Service unavailable");
      });

      const { status, body } = await parseResponse(await GET());

      expect(status).toBe(503);
      expect(body.status).toBe("unhealthy");
      expect(body.error).toBe("Service unavailable");
    });

    it("includes timestamp on unhealthy response", async () => {
      const { createServiceClient } = await import("@/lib/supabase/service");
      (createServiceClient as any).mockImplementationOnce(() => {
        throw new Error("boom");
      });

      const { body } = await parseResponse(await GET());

      expect(body.timestamp).toBeTruthy();
    });

    it("logs the exception", async () => {
      const { createServiceClient } = await import("@/lib/supabase/service");
      (createServiceClient as any).mockImplementationOnce(() => {
        throw new Error("connection pool exhausted");
      });

      await GET();

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Health check exception",
        expect.objectContaining({ error: expect.stringContaining("connection pool exhausted") })
      );
    });
  });
});
