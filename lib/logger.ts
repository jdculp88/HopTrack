/**
 * Structured logger — Sprint 104 (The Audit)
 * Outputs JSON-compatible structured logs for Vercel Log Drain + Sentry.
 * In development: colorized, human-readable output.
 * In production: structured JSON for log aggregation.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogPayload {
  level: LogLevel;
  message: string;
  context?: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

function formatLog(level: LogLevel, context: string, message: string, data?: Record<string, unknown>): LogPayload {
  return {
    level,
    message,
    context,
    data,
    timestamp: new Date().toISOString(),
  };
}

function write(level: LogLevel, context: string, message: string, data?: Record<string, unknown>) {
  const payload = formatLog(level, context, message, data);

  if (process.env.NODE_ENV === "development") {
    const prefix = `[${payload.context}]`;
    const msg = data ? `${message} ${JSON.stringify(data, null, 2)}` : message;
    switch (level) {
      case "debug": console.debug(prefix, msg); break;
      case "info":  console.info(prefix, msg);  break;
      case "warn":  console.warn(prefix, msg);  break;
      case "error": console.error(prefix, msg); break;
    }
  } else {
    // Production: structured JSON to stdout — picked up by Vercel Log Drain
    process.stdout.write(JSON.stringify(payload) + "\n");
  }
}

/**
 * Create a namespaced logger for a specific module/route.
 *
 * @example
 * const logger = createLogger("POS Webhook")
 * logger.info("Square event received", { eventType: payload.type })
 * logger.error("Sync failed", { breweryId, error: err.message })
 */
export function createLogger(context: string) {
  return {
    debug: (message: string, data?: Record<string, unknown>) => write("debug", context, message, data),
    info:  (message: string, data?: Record<string, unknown>) => write("info",  context, message, data),
    warn:  (message: string, data?: Record<string, unknown>) => write("warn",  context, message, data),
    error: (message: string, data?: Record<string, unknown>) => write("error", context, message, data),
  };
}

/** Default application logger */
export const logger = createLogger("HopTrack");
