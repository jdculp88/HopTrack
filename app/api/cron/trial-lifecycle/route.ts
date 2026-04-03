// Trial Lifecycle Cron — Sprint 145 (The Revenue Push)
// Owner: Riley (Infrastructure / DevOps)
//
// Sends trial warning emails (3 days left) and trial expired emails.
// Secured by CRON_SECRET. Called by GitHub Actions or Vercel cron.

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { onTrialWarning, onTrialExpired } from "@/lib/email-triggers";
import { rateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const limited = rateLimitResponse(req, "cron-trial-lifecycle", {
    limit: 1,
    windowMs: 10 * 60 * 1000,
  });
  if (limited) return limited;

  // ── Auth: CRON_SECRET header ──
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[trial-lifecycle] CRON_SECRET not configured");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = await createClient();
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // ── Trial Warning: trial_ends_at within 3 days, not yet warned ──
    const { data: warningBreweries } = await supabase
      .from("breweries")
      .select("id, name, trial_ends_at")
      .not("trial_ends_at", "is", null)
      .lte("trial_ends_at", threeDaysFromNow.toISOString())
      .gt("trial_ends_at", now.toISOString())
      .is("trial_warning_sent_at", null)
      .is("subscription_tier", null) as any;

    // Also catch free tier (some may have explicit 'free' string)
    const { data: warningBreweriesFree } = await supabase
      .from("breweries")
      .select("id, name, trial_ends_at")
      .not("trial_ends_at", "is", null)
      .lte("trial_ends_at", threeDaysFromNow.toISOString())
      .gt("trial_ends_at", now.toISOString())
      .is("trial_warning_sent_at", null)
      .eq("subscription_tier", "free") as any;

    const allWarning = [
      ...((warningBreweries as any[]) ?? []),
      ...((warningBreweriesFree as any[]) ?? []),
    ];
    // Deduplicate by id
    const warningMap = new Map(allWarning.map((b) => [b.id, b]));
    const uniqueWarning = [...warningMap.values()];

    let warningSent = 0;
    for (const brewery of uniqueWarning) {
      try {
        await onTrialWarning(brewery.id);
        // Mark as sent to prevent duplicate sends
        await supabase
          .from("breweries")
          .update({ trial_warning_sent_at: now.toISOString() })
          .eq("id", brewery.id);
        warningSent++;
      } catch (err: any) {
        console.error(`[trial-lifecycle] Warning failed for ${brewery.id}:`, err.message);
      }
    }

    // ── Trial Expired: trial_ends_at has passed, not yet notified ──
    const { data: expiredBreweries } = await supabase
      .from("breweries")
      .select("id, name, trial_ends_at")
      .not("trial_ends_at", "is", null)
      .lte("trial_ends_at", now.toISOString())
      .is("trial_expired_sent_at", null)
      .is("subscription_tier", null) as any;

    const { data: expiredBreweriesFree } = await supabase
      .from("breweries")
      .select("id, name, trial_ends_at")
      .not("trial_ends_at", "is", null)
      .lte("trial_ends_at", now.toISOString())
      .is("trial_expired_sent_at", null)
      .eq("subscription_tier", "free") as any;

    const allExpired = [
      ...((expiredBreweries as any[]) ?? []),
      ...((expiredBreweriesFree as any[]) ?? []),
    ];
    const expiredMap = new Map(allExpired.map((b) => [b.id, b]));
    const uniqueExpired = [...expiredMap.values()];

    let expiredSent = 0;
    for (const brewery of uniqueExpired) {
      try {
        await onTrialExpired(brewery.id);
        await supabase
          .from("breweries")
          .update({ trial_expired_sent_at: now.toISOString() })
          .eq("id", brewery.id);
        expiredSent++;
      } catch (err: any) {
        console.error(`[trial-lifecycle] Expired failed for ${brewery.id}:`, err.message);
      }
    }

    console.log(`[trial-lifecycle] Warning: ${warningSent}/${uniqueWarning.length}, Expired: ${expiredSent}/${uniqueExpired.length}`);

    return NextResponse.json({
      success: true,
      warnings: { found: uniqueWarning.length, sent: warningSent },
      expired: { found: uniqueExpired.length, sent: expiredSent },
    });
  } catch (err: any) {
    console.error("[trial-lifecycle] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
