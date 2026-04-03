import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPushToUser } from "@/lib/push";
import type { PushPayload } from "@/lib/push";
import { computeSegment, type CustomerSegment } from "@/lib/crm";
import { requireAuth, requireBreweryAdmin } from "@/lib/api-helpers";
import { apiUnauthorized, apiForbidden, apiBadRequest, apiSuccess } from "@/lib/api-response";

type Tier = "all" | CustomerSegment;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  // Verify brewery admin
  const account = await requireBreweryAdmin(supabase, user.id, brewery_id);
  if (!account) return apiForbidden();

  const { tier, subject, body: messageBody } = await request.json() as {
    tier: Tier;
    subject: string;
    body: string;
  };

  if (!subject?.trim() || !messageBody?.trim()) {
    return apiBadRequest("Subject and body are required");
  }

  // Rate limit: max 5 sends per brewery per hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count: recentSendCount } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("type", "brewery_message")
    .gte("created_at", oneHourAgo)
    .contains("data", { brewery_id } as any);

  if ((recentSendCount ?? 0) >= 5) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Max 5 messages per hour." },
      { status: 429, headers: { "X-RateLimit-Remaining": "0" } }
    );
  }

  // Fetch brewery name
  const { data: brewery } = await supabase
    .from("breweries").select("name").eq("id", brewery_id).single() as any;
  const breweryName = brewery?.name ?? "A brewery";

  // Fetch all completed sessions for this brewery
  const { data: sessions } = await supabase
    .from("sessions")
    .select("user_id")
    .eq("brewery_id", brewery_id)
    .eq("is_active", false) as any;

  // Aggregate visit counts per user
  const visitCounts = new Map<string, number>();
  for (const s of (sessions ?? []) as any[]) {
    if (!s.user_id) continue;
    visitCounts.set(s.user_id, (visitCounts.get(s.user_id) ?? 0) + 1);
  }

  // Filter by segment (using unified CRM logic)
  const targetUsers: string[] = [];
  for (const [userId, visits] of visitCounts) {
    // Don't message yourself
    if (userId === user.id) continue;

    if (tier === "all" || computeSegment(visits) === tier) {
      targetUsers.push(userId);
    }
  }

  if (targetUsers.length === 0) {
    return apiBadRequest("No customers in this segment");
  }

  // Create notifications in batch
  const notifications = targetUsers.map((userId) => ({
    user_id: userId,
    type: "brewery_message" as const,
    title: subject.trim(),
    body: `${breweryName}: ${messageBody.trim()}`,
    data: { brewery_id, tier },
  }));

  // Insert in batches of 100 to avoid payload limits
  let inserted = 0;
  for (let i = 0; i < notifications.length; i += 100) {
    const batch = notifications.slice(i, i + 100);
    const { error } = await supabase.from("notifications").insert(batch);
    if (error) {
      console.error("Failed to insert notification batch:", error.message);
    } else {
      inserted += batch.length;
    }
  }

  // Fire Web Push notifications for users with push subscriptions
  let pushCount = 0;
  const pushPayload: PushPayload = {
    title: subject.trim(),
    body: `${breweryName}: ${messageBody.trim()}`,
    tag: `brewery-message-${brewery_id}`,
    data: { url: `/brewery/${brewery_id}` },
  };

  // Send push in batches — don't let one failure break the loop
  for (const userId of targetUsers) {
    try {
      const sent = await sendPushToUser(supabase, userId, pushPayload);
      pushCount += sent;
    } catch (err) {
      console.error(`[push] Failed for user ${userId}:`, (err as Error).message);
    }
  }

  return apiSuccess({ success: true, count: inserted, push_count: pushCount });
}
