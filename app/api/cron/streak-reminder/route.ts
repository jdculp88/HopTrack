// Streak Reminder Cron — Sprint 157
// Owner: Riley (Infrastructure / DevOps)
//
// Sends push notifications to users whose streaks are at risk (>= 3-day
// streak with no session today). Secured by CRON_SECRET.
// Designed to run once daily in the evening (e.g., 7pm ET via GitHub Actions).

import { NextRequest } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { sendPushToUser } from "@/lib/push";
import { apiSuccess, apiUnauthorized, apiServerError } from "@/lib/api-response";
import { rateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const limited = rateLimitResponse(req, "cron-streak-reminder", {
    limit: 1,
    windowMs: 10 * 60 * 1000,
  });
  if (limited) return limited;

  // ── Auth: CRON_SECRET header ──
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[streak-reminder] CRON_SECRET not configured");
    return apiServerError("CRON_SECRET not configured");
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return apiUnauthorized();
  }

  try {
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Get today's midnight in UTC for the date boundary
    const now = new Date();
    const todayMidnight = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );

    // Find users with active streaks >= 3 days
    const { data: streakUsers, error: streakError } = await serviceClient
      .from("profiles")
      .select("id, current_streak, display_name")
      .gte("current_streak", 3)
      .limit(5000);

    if (streakError) {
      console.error("[streak-reminder] Failed to query profiles:", streakError.message);
      return apiServerError("Failed to query profiles");
    }

    if (!streakUsers || streakUsers.length === 0) {
      return apiSuccess({ notified: 0, checked: 0 });
    }

    // For each user, check if they have a session today
    let notified = 0;
    let checked = 0;

    for (const user of streakUsers) {
      checked++;

      // Check for any session started today
      const { count } = await serviceClient
        .from("sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("started_at", todayMidnight.toISOString());

      // If they have a session today, their streak is safe
      if (count && count > 0) continue;

      // Streak is at risk — send push notification
      try {
        await sendPushToUser(serviceClient, user.id, {
          title: "Your streak is at risk! \uD83D\uDD25",
          body: `Check in today to keep your ${user.current_streak}-day streak alive!`,
          tag: "streak-reminder",
          data: { url: "/home" },
        });
        notified++;
      } catch (pushErr: any) {
        console.error(`[streak-reminder] Push failed for ${user.id}:`, pushErr.message);
      }
    }

    console.log(
      `[streak-reminder] Checked ${checked} users, notified ${notified} at-risk streaks`,
    );

    return apiSuccess({ notified, checked });
  } catch (err: any) {
    console.error("[streak-reminder] Unexpected error:", err);
    return apiServerError("streak-reminder cron failed");
  }
}
