// GET /api/health — Health check endpoint for uptime monitoring
// Sprint 149 — The Launchpad (Riley)
// Sprint 151 — The Ops Room: added `checks` object for richer monitoring

import { createServiceClient } from "@/lib/supabase/service";
import { createLogger } from "@/lib/logger";
import { isEmailConfigured } from "@/lib/email";

const logger = createLogger("Health");

function getServiceChecks() {
  return {
    email: isEmailConfigured() ? "configured" : "not_configured",
    cron: process.env.CRON_SECRET ? "configured" : "not_configured",
    sentry: process.env.NEXT_PUBLIC_SENTRY_DSN ? "configured" : "not_configured",
  };
}

export async function GET() {
  const start = Date.now();

  try {
    const supabase = createServiceClient();
    const { error } = await (supabase as any)
      .from("breweries")
      .select("id", { count: "exact", head: true })
      .limit(1);

    const latencyMs = Date.now() - start;

    if (error) {
      logger.error("Database health check failed", { error: error.message });
      return Response.json(
        {
          status: "degraded",
          database: "unreachable",
          checks: getServiceChecks(),
          latency_ms: latencyMs,
          timestamp: new Date().toISOString(),
        },
        { status: 503, headers: { "Cache-Control": "no-store" } }
      );
    }

    return Response.json(
      {
        status: "healthy",
        database: "connected",
        checks: getServiceChecks(),
        latency_ms: latencyMs,
        timestamp: new Date().toISOString(),
        version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "dev",
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    logger.error("Health check exception", { error: String(err) });
    return Response.json(
      {
        status: "unhealthy",
        error: "Service unavailable",
        timestamp: new Date().toISOString(),
      },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
