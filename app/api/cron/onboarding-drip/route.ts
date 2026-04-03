// Onboarding Drip Cron — Sprint 145 (The Revenue Push)
// Owner: Parker (Customer Success) + Dakota (Dev Lead)
//
// Sends day-3 and day-7 onboarding emails to newly verified breweries.
// Secured by CRON_SECRET. Designed to run daily.

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { onOnboardingDay3, onOnboardingDay7 } from "@/lib/email-triggers";
import { rateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const limited = rateLimitResponse(req, "cron-onboarding-drip", {
    limit: 1,
    windowMs: 10 * 60 * 1000,
  });
  if (limited) return limited;

  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[onboarding-drip] CRON_SECRET not configured");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = await createClient();
    const now = new Date();

    // Day 3: verified_at was 3 days ago (within a 24-hour window)
    const day3Start = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString();
    const day3End = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();

    const { data: day3Accounts } = await supabase
      .from("brewery_accounts")
      .select("brewery_id, verified_at")
      .eq("verified", true)
      .eq("role", "owner")
      .gte("verified_at", day3Start)
      .lt("verified_at", day3End) as any;

    let day3Sent = 0;
    for (const account of (day3Accounts as any[]) ?? []) {
      try {
        await onOnboardingDay3(account.brewery_id);
        day3Sent++;
      } catch (err: any) {
        console.error(`[onboarding-drip] Day 3 failed for ${account.brewery_id}:`, err.message);
      }
    }

    // Day 7: verified_at was 7 days ago (within a 24-hour window)
    const day7Start = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString();
    const day7End = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: day7Accounts } = await supabase
      .from("brewery_accounts")
      .select("brewery_id, verified_at")
      .eq("verified", true)
      .eq("role", "owner")
      .gte("verified_at", day7Start)
      .lt("verified_at", day7End) as any;

    let day7Sent = 0;
    for (const account of (day7Accounts as any[]) ?? []) {
      try {
        await onOnboardingDay7(account.brewery_id);
        day7Sent++;
      } catch (err: any) {
        console.error(`[onboarding-drip] Day 7 failed for ${account.brewery_id}:`, err.message);
      }
    }

    console.log(`[onboarding-drip] Day 3: ${day3Sent}/${(day3Accounts as any[])?.length ?? 0}, Day 7: ${day7Sent}/${(day7Accounts as any[])?.length ?? 0}`);

    return NextResponse.json({
      success: true,
      day3: { found: (day3Accounts as any[])?.length ?? 0, sent: day3Sent },
      day7: { found: (day7Accounts as any[])?.length ?? 0, sent: day7Sent },
    });
  } catch (err: any) {
    console.error("[onboarding-drip] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
