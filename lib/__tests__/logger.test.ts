/**
 * Tests for lib/logger.ts — Sprint 104 (The Audit)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createLogger, logger } from "@/lib/logger";

describe("createLogger", () => {
  let stdoutSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // In production mode, logger writes to stdout
    (process.env as Record<string, string>).NODE_ENV = "production";
    stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    (process.env as Record<string, string>).NODE_ENV = "test";
  });

  it("creates a logger with the given context", () => {
    const log = createLogger("MyContext");
    log.info("test message");

    expect(stdoutSpy).toHaveBeenCalledOnce();
    const written = JSON.parse(stdoutSpy.mock.calls[0][0] as string);
    expect(written.context).toBe("MyContext");
    expect(written.message).toBe("test message");
    expect(written.level).toBe("info");
  });

  it("includes a timestamp", () => {
    const log = createLogger("TimestampTest");
    log.info("ts check");

    const written = JSON.parse(stdoutSpy.mock.calls[0][0] as string);
    expect(written.timestamp).toBeDefined();
    expect(new Date(written.timestamp).getTime()).toBeGreaterThan(0);
  });

  it("includes optional data payload", () => {
    const log = createLogger("DataTest");
    log.warn("something happened", { breweryId: "123", count: 5 });

    const written = JSON.parse(stdoutSpy.mock.calls[0][0] as string);
    expect(written.data).toEqual({ breweryId: "123", count: 5 });
  });

  it("logs at all levels", () => {
    const log = createLogger("LevelsTest");
    log.debug("debug msg");
    log.info("info msg");
    log.warn("warn msg");
    log.error("error msg");

    expect(stdoutSpy).toHaveBeenCalledTimes(4);
    const levels = stdoutSpy.mock.calls.map((call: unknown[]) => JSON.parse(call[0] as string).level);
    expect(levels).toEqual(["debug", "info", "warn", "error"]);
  });

  it("exports a default logger with HopTrack context", () => {
    logger.info("default logger test");

    const written = JSON.parse(stdoutSpy.mock.calls[0][0] as string);
    expect(written.context).toBe("HopTrack");
  });

  it("handles undefined data gracefully", () => {
    const log = createLogger("UndefinedData");
    expect(() => log.info("no data")).not.toThrow();

    const written = JSON.parse(stdoutSpy.mock.calls[0][0] as string);
    expect(written.data).toBeUndefined();
  });
});
