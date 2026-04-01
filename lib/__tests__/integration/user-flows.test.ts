/**
 * Integration tests for full user flows — Reese, Sprint 111 (The Shield)
 * Tests retry + rate limit + error boundary utilities working together.
 */
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { withRetry, RetryError, abortOn4xx } from "@/lib/retry";
import { parseRetryAfter } from "@/components/ui/RateLimitBanner";

// ── parseRetryAfter ──────────────────────────────────────────────────────────

describe("parseRetryAfter", () => {
  it("parses a valid numeric Retry-After header", () => {
    const headers = new Headers({ "Retry-After": "30" });
    expect(parseRetryAfter(headers)).toBe(30);
  });

  it("parses zero correctly", () => {
    const headers = new Headers({ "Retry-After": "0" });
    expect(parseRetryAfter(headers)).toBe(0);
  });

  it("returns null when Retry-After header is absent", () => {
    const headers = new Headers();
    expect(parseRetryAfter(headers)).toBeNull();
  });

  it("returns null when Retry-After is a non-numeric string", () => {
    const headers = new Headers({ "Retry-After": "soon" });
    expect(parseRetryAfter(headers)).toBeNull();
  });

  it("returns null for empty string value", () => {
    const headers = new Headers({ "Retry-After": "" });
    expect(parseRetryAfter(headers)).toBeNull();
  });

  it("parses large values", () => {
    const headers = new Headers({ "Retry-After": "3600" });
    expect(parseRetryAfter(headers)).toBe(3600);
  });
});

// ── abortOn4xx — cross-cutting ───────────────────────────────────────────────

describe("abortOn4xx — cross-cutting scenarios", () => {
  it("returns true for 401 Unauthorized", () => {
    expect(abortOn4xx({ status: 401 })).toBe(true);
  });

  it("returns true for 403 Forbidden", () => {
    expect(abortOn4xx({ status: 403 })).toBe(true);
  });

  it("returns true for 404 Not Found", () => {
    expect(abortOn4xx({ status: 404 })).toBe(true);
  });

  it("returns false for 429 Too Many Requests — should retry with backoff", () => {
    expect(abortOn4xx({ status: 429 })).toBe(false);
  });

  it("returns false for 500 Internal Server Error — should retry", () => {
    expect(abortOn4xx({ status: 500 })).toBe(false);
  });
});

// ── Integrated: retry + abortOn4xx ──────────────────────────────────────────

describe("withRetry + abortOn4xx integration", () => {
  it("does not retry on 404 (aborted immediately)", async () => {
    const fn = vi.fn().mockRejectedValue({ status: 404 });
    await expect(
      withRetry(fn, {
        maxAttempts: 5,
        initialDelay: 0,
        jitter: 0,
        shouldAbort: abortOn4xx,
      })
    ).rejects.toThrow(RetryError);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries on 429 (not aborted)", async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce({ status: 429 })
      .mockRejectedValueOnce({ status: 429 })
      .mockResolvedValue("ok");

    const result = await withRetry(fn, {
      maxAttempts: 3,
      initialDelay: 0,
      jitter: 0,
      shouldAbort: abortOn4xx,
    });

    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("retries on 500 (not aborted) and eventually succeeds", async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce({ status: 500 })
      .mockResolvedValue("recovered");

    const result = await withRetry(fn, {
      maxAttempts: 3,
      initialDelay: 0,
      jitter: 0,
      shouldAbort: abortOn4xx,
    });

    expect(result).toBe("recovered");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("exhausts retries on repeated 500s and throws RetryError", async () => {
    const fn = vi.fn().mockRejectedValue({ status: 500 });

    await expect(
      withRetry(fn, {
        maxAttempts: 3,
        initialDelay: 0,
        jitter: 0,
        shouldAbort: abortOn4xx,
      })
    ).rejects.toThrow(RetryError);

    expect(fn).toHaveBeenCalledTimes(3);
  });
});

// ── Simulated: session check-in flow ────────────────────────────────────────

describe("Simulated session check-in flow", () => {
  it("handles transient network errors and succeeds on retry", async () => {
    let callCount = 0;
    const simulateCheckin = async () => {
      callCount++;
      if (callCount < 3) throw new Error("Network error");
      return { sessionId: "abc123", xp: 25 };
    };

    const result = await withRetry(simulateCheckin, {
      maxAttempts: 3,
      initialDelay: 0,
      jitter: 0,
    });

    expect(result.sessionId).toBe("abc123");
    expect(result.xp).toBe(25);
    expect(callCount).toBe(3);
  });

  it("surfaces RetryError after persistent failures", async () => {
    const simulateCheckin = async () => {
      throw new Error("Supabase unreachable");
    };

    let caught: RetryError | null = null;
    try {
      await withRetry(simulateCheckin, { maxAttempts: 3, initialDelay: 0, jitter: 0 });
    } catch (e) {
      caught = e as RetryError;
    }

    expect(caught).toBeInstanceOf(RetryError);
    expect(caught!.attempts).toBe(3);
    expect((caught!.lastError as Error).message).toBe("Supabase unreachable");
  });
});
