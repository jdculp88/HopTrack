// GET /api/health/email — Email infrastructure health check
// Sprint 151 — The Ops Room (Riley + Dakota)
// Secured by CRON_SECRET. Used for T-24h launch checklist verification.

import { NextResponse } from "next/server";
import { isEmailConfigured } from "@/lib/email";
import { createLogger } from "@/lib/logger";

const logger = createLogger("EmailHealth");

export async function GET(req: Request) {
  // Auth: CRON_SECRET header (same pattern as cron endpoints)
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    logger.error("CRON_SECRET not configured");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const configured = isEmailConfigured();
  const fromEmail = process.env.RESEND_FROM_EMAIL || "HopTrack <josh@hoptrack.beer>";

  return NextResponse.json(
    {
      configured,
      fromEmail: configured ? fromEmail : null,
      templateCount: 11,
      triggerCount: 11,
      timestamp: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
