import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { weeklyDigestEmail } from "@/lib/email-templates";
import { calculateDigestStats } from "@/app/api/brewery/[brewery_id]/digest/route";
import { rateLimitResponse } from "@/lib/rate-limit";

// POST /api/cron/weekly-digest — send weekly digest emails to all eligible breweries
// Secured by CRON_SECRET header. Called by GitHub Actions on a weekly schedule.
export async function POST(req: Request) {
  // Rate limit: 1 call per 10 minutes (safety valve against accidental re-runs)
  const limited = rateLimitResponse(req, "cron-weekly-digest", {
    limit: 1,
    windowMs: 10 * 60 * 1000,
  });
  if (limited) return limited;

  // ── Auth: CRON_SECRET header ──
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[weekly-digest] CRON_SECRET not configured");
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 },
    );
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  // ── Find all claimed (verified) breweries with activity in the last 7 days ──
  // First: get brewery IDs that had at least 1 session this week
  const { data: activeSessions } = await supabase
    .from("sessions")
    .select("brewery_id")
    .eq("is_active", false)
    .gte("started_at", weekAgo) as any;

  const activeBreweryIds = [
    ...new Set((activeSessions ?? []).map((s: any) => s.brewery_id)),
  ].filter(Boolean) as string[];

  if (activeBreweryIds.length === 0) {
    return NextResponse.json({
      success: true,
      message: "No active breweries this week",
      sent: 0,
      failed: 0,
    });
  }

  // Filter to verified (claimed) breweries only
  const { data: breweries } = await supabase
    .from("breweries")
    .select("id, name")
    .eq("verified", true)
    .in("id", activeBreweryIds) as any;

  if (!breweries?.length) {
    return NextResponse.json({
      success: true,
      message: "No claimed breweries with activity",
      sent: 0,
      failed: 0,
    });
  }

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const brewery of breweries as any[]) {
    try {
      // Find brewery owner
      const { data: accounts } = await supabase
        .from("brewery_accounts")
        .select("user_id, role")
        .eq("brewery_id", brewery.id)
        .eq("role", "owner") as any;

      if (!accounts?.length) {
        // No owner — skip (manager-only breweries don't get digest)
        continue;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, email")
        .eq("id", accounts[0].user_id)
        .single() as any;

      if (!profile?.email) {
        console.warn(
          `[weekly-digest] No email for owner of brewery ${brewery.id}`,
        );
        continue;
      }

      // Calculate stats
      const { stats } = await calculateDigestStats(brewery.id);

      // Build and send email
      const template = weeklyDigestEmail({
        breweryName: brewery.name,
        ownerName: profile.display_name || "Brewmaster",
        breweryId: brewery.id,
        stats,
      });

      const result = await sendEmail({
        to: profile.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      if (result.success) {
        sent++;
      } else {
        failed++;
        errors.push(`${brewery.name}: send failed`);
      }
    } catch (err: any) {
      failed++;
      errors.push(`${brewery.name}: ${err.message}`);
      console.error(
        `[weekly-digest] Failed for brewery ${brewery.id}:`,
        err.message,
      );
    }
  }

  console.info(
    `[weekly-digest] Complete: ${sent} sent, ${failed} failed out of ${breweries.length} eligible`,
  );

  return NextResponse.json({
    success: true,
    sent,
    failed,
    total: breweries.length,
    ...(errors.length > 0 ? { errors } : {}),
  });
}
