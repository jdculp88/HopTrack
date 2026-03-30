import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Tier = "all" | "vip" | "power_user" | "regular" | "new";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify brewery admin
  const { data: account } = await supabase
    .from("brewery_accounts").select("role")
    .eq("user_id", user.id).eq("brewery_id", brewery_id).single() as any;
  if (!account) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { tier, subject, body: messageBody } = await request.json() as {
    tier: Tier;
    subject: string;
    body: string;
  };

  if (!subject?.trim() || !messageBody?.trim()) {
    return NextResponse.json({ error: "Subject and body are required" }, { status: 400 });
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

  // Filter by tier
  const targetUsers: string[] = [];
  for (const [userId, visits] of visitCounts) {
    // Don't message yourself
    if (userId === user.id) continue;

    if (tier === "all") {
      targetUsers.push(userId);
    } else if (tier === "vip" && visits >= 10) {
      targetUsers.push(userId);
    } else if (tier === "power_user" && visits >= 5 && visits <= 9) {
      targetUsers.push(userId);
    } else if (tier === "regular" && visits >= 2 && visits <= 4) {
      targetUsers.push(userId);
    } else if (tier === "new" && visits === 1) {
      targetUsers.push(userId);
    }
  }

  if (targetUsers.length === 0) {
    return NextResponse.json({ error: "No customers in this segment", count: 0 }, { status: 400 });
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
    const { error } = await (supabase as any).from("notifications").insert(batch);
    if (error) {
      console.error("Failed to insert notification batch:", error.message);
    } else {
      inserted += batch.length;
    }
  }

  return NextResponse.json({ success: true, count: inserted });
}
