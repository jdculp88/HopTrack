/**
 * Retry utility tests — Reese, Sprint 111 (The Shield)
 * Tests withRetry, RetryError, and abortOn4xx from lib/retry.ts
 */
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { withRetry, RetryError, abortOn4xx } from "@/lib/retry";

// ── withRetry — success cases ────────────────────────────────────────────────

describe("withRetry — success cases", () => {
  it("returns result immediately on first success", async () => {
    const fn = vi.fn().mockResolvedValue("hello");
    const result = await withRetry(fn, { initialDelay: 0 });
    expect(result).toBe("hello");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("succeeds on second attempt after first failure", async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error("transient"))
      .mockResolvedValue("ok");
    const result = await withRetry(fn, { maxAttempts: 3, initialDelay: 0, jitter: 0 });
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("succeeds on third attempt after two failures", async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error("fail 1"))
      .mockRejectedValueOnce(new Error("fail 2"))
      .mockResolvedValue("success");
    const result = await withRetry(fn, { maxAttempts: 3, initialDelay: 0, jitter: 0 });
    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(3);
  });
});

// ── withRetry — failure cases ────────────────────────────────────────────────

describe("withRetry — failure cases", () => {
  it("throws RetryError after exhausting all attempts", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("always fails"));
    await expect(
      withRetry(fn, { maxAttempts: 3, initialDelay: 0, jitter: 0 })
    ).rejects.toThrow(RetryError);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("RetryError has correct attempt count", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("fail"));
    let caught: RetryError | null = null;
    try {
      await withRetry(fn, { maxAttempts: 4, initialDelay: 0, jitter: 0 });
    } catch (e) {
      caught = e as RetryError;
    }
    expect(caught).toBeInstanceOf(RetryError);
    expect(caught!.attempts).toBe(4);
  });

  it("RetryError exposes the last error", async () => {
    const originalError = new Error("the real cause");
    const fn = vi.fn().mockRejectedValue(originalError);
    let caught: RetryError | null = null;
    try {
      await withRetry(fn, { maxAttempts: 2, initialDelay: 0, jitter: 0 });
    } catch (e) {
      caught = e as RetryError;
    }
    expect(caught!.lastError).toBe(originalError);
  });

  it("uses maxAttempts=3 by default", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("fail"));
    await expect(
      withRetry(fn, { initialDelay: 0, jitter: 0 })
    ).rejects.toThrow(RetryError);
    expect(fn).toHaveBeenCalledTimes(3);
  });
});

// ── withRetry — shouldAbort ──────────────────────────────────────────────────

describe("withRetry — shouldAbort", () => {
  it("stops immediately when shouldAbort returns true", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("abort-me"));
    await expect(
      withRetry(fn, {
        maxAttempts: 5,
        initialDelay: 0,
        jitter: 0,
        shouldAbort: () => true,
      })
    ).rejects.toThrow(RetryError);
    // Called once, then aborted on the first failure
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("continues when shouldAbort returns false", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("keep trying"));
    await expect(
      withRetry(fn, {
        maxAttempts: 3,
        initialDelay: 0,
        jitter: 0,
        shouldAbort: () => false,
      })
    ).rejects.toThrow(RetryError);
    expect(fn).toHaveBeenCalledTimes(3);
  });
});

// ── withRetry — onRetry callback ─────────────────────────────────────────────

describe("withRetry — onRetry callback", () => {
  it("calls onRetry with error, attempt, and delay", async () => {
    const error = new Error("transient");
    const fn = vi.fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValue("ok");
    const onRetry = vi.fn();

    await withRetry(fn, { maxAttempts: 3, initialDelay: 0, jitter: 0, onRetry });

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(error, 1, expect.any(Number));
  });

  it("is called once per retry, not on the final failure", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("fail"));
    const onRetry = vi.fn();

    await expect(
      withRetry(fn, { maxAttempts: 3, initialDelay: 0, jitter: 0, onRetry })
    ).rejects.toThrow(RetryError);

    // maxAttempts=3 → 2 retries (attempts 1→2 and 2→3), no retry on 3rd failure
    expect(onRetry).toHaveBeenCalledTimes(2);
  });
});

// ── withRetry — exponential backoff ─────────────────────────────────────────

describe("withRetry — exponential backoff", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("respects maxDelay cap", async () => {
    const capturedDelays: number[] = [];
    const fn = vi.fn().mockRejectedValue(new Error("fail"));

    const promise = withRetry(fn, {
      maxAttempts: 3,
      initialDelay: 5000,
      backoffFactor: 10,
      maxDelay: 1000,
      jitter: 0,
      onRetry: (_, _attempt, delay) => capturedDelays.push(delay),
    });

    // Attach rejection handler before advancing timers to prevent unhandled rejection
    const settled = promise.then(
      (v) => ({ status: "fulfilled", value: v }),
      (e) => ({ status: "rejected", reason: e })
    );

    // Drain all pending timers
    await vi.runAllTimersAsync();
    await settled;

    // All delays should be <= maxDelay
    for (const d of capturedDelays) {
      expect(d).toBeLessThanOrEqual(1000);
    }
  });
});

// ── abortOn4xx ───────────────────────────────────────────────────────────────

describe("abortOn4xx", () => {
  it("returns true for 401 Unauthorized", () => {
    const err = { status: 401 };
    expect(abortOn4xx(err)).toBe(true);
  });

  it("returns true for 403 Forbidden", () => {
    expect(abortOn4xx({ status: 403 })).toBe(true);
  });

  it("returns true for 404 Not Found", () => {
    expect(abortOn4xx({ status: 404 })).toBe(true);
  });

  it("returns false for 429 Too Many Requests (should retry)", () => {
    expect(abortOn4xx({ status: 429 })).toBe(false);
  });

  it("returns false for 500 Internal Server Error", () => {
    expect(abortOn4xx({ status: 500 })).toBe(false);
  });

  it("returns false for non-error objects", () => {
    expect(abortOn4xx(null)).toBe(false);
    expect(abortOn4xx(undefined)).toBe(false);
    expect(abortOn4xx("string error")).toBe(false);
    expect(abortOn4xx(new Error("generic"))).toBe(false);
  });

  it("handles Response objects", () => {
    const ok = new Response(null, { status: 200 });
    const notFound = new Response(null, { status: 404 });
    const tooMany = new Response(null, { status: 429 });
    const serverErr = new Response(null, { status: 500 });

    expect(abortOn4xx(ok)).toBe(false);
    expect(abortOn4xx(notFound)).toBe(true);
    expect(abortOn4xx(tooMany)).toBe(false);
    expect(abortOn4xx(serverErr)).toBe(false);
  });
});

// ── RetryError ───────────────────────────────────────────────────────────────

describe("RetryError", () => {
  it("has name RetryError", () => {
    const err = new RetryError("msg", new Error("cause"), 3);
    expect(err.name).toBe("RetryError");
  });

  it("extends Error", () => {
    const err = new RetryError("msg", null, 1);
    expect(err).toBeInstanceOf(Error);
  });

  it("stores attempts count", () => {
    const err = new RetryError("msg", null, 7);
    expect(err.attempts).toBe(7);
  });

  it("stores lastError", () => {
    const cause = new TypeError("type error");
    const err = new RetryError("msg", cause, 2);
    expect(err.lastError).toBe(cause);
  });
});
