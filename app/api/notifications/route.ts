import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";

// PATCH /api/notifications — mark as read (single by id, or all unread)
export async function PATCH(request: NextRequest) {
  const limited = rateLimitResponse(request, 'notifications-patch', { limit: 60, windowMs: 60 * 1000 });
  if (limited) return limited;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check if body contains an individual notification id
  let body: { id?: string } = {};
  try {
    body = await request.json();
  } catch {
    // No body = mark all as read
  }

  if (body.id) {
    // Mark single notification as read
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", body.id)
      .eq("user_id", user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    // Mark all unread notifications as read
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
