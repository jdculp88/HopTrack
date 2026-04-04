// GET /api/health — Health check endpoint for uptime monitoring
// Sprint 149 — The Launchpad (Riley)

import { createServiceClient } from "@/lib/supabase/service";
import { createLogger } from "@/lib/logger";

const logger = createLogger("Health");

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
