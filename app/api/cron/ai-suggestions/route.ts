import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { rateLimitResponse } from "@/lib/rate-limit";
import { generateAISuggestions } from "@/lib/ai-promotions";

// POST /api/cron/ai-suggestions — weekly AI suggestion generation for premium breweries
// Secured by CRON_SECRET header. Called by GitHub Actions on a weekly schedule.
export async function POST(req: Request) {
  // Rate limit: 1 call per 10 minutes (safety valve)
  const limited = rateLimitResponse(req, "cron-ai-suggestions", {
    limit: 1,
    windowMs: 10 * 60 * 1000,
  });
  if (limited) return limited;

  // Auth: CRON_SECRET header
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[ai-suggestions-cron] CRON_SECRET not configured");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Find all Cask/Barrel breweries (only premium tiers get AI suggestions)
  const { data: breweries } = await supabase
    .from("breweries")
    .select("id, name")
    .in("subscription_tier", ["cask", "barrel"])
    .eq("verified", true) as any;

  if (!breweries?.length) {
    return NextResponse.json({
      success: true,
      message: "No premium breweries found",
      generated: 0,
      failed: 0,
    });
  }

  let generated = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const brewery of breweries as any[]) {
    try {
      await generateAISuggestions(brewery.id);
      generated++;
    } catch (err: any) {
      failed++;
      errors.push(`${brewery.name}: ${err.message}`);
      console.error(`[ai-suggestions-cron] Failed for brewery ${brewery.id}:`, err.message);
    }
  }

  console.info(
    `[ai-suggestions-cron] Complete: ${generated} generated, ${failed} failed out of ${breweries.length} breweries`
  );

  return NextResponse.json({
    success: true,
    generated,
    failed,
    total: breweries.length,
    ...(errors.length > 0 ? { errors } : {}),
  });
}
