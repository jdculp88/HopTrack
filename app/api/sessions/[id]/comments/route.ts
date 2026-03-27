import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPushToUser } from "@/lib/push";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: comments, error } = await (supabase as any)
    .from("session_comments")
    .select("id, session_id, user_id, body, created_at, profile:profiles!user_id(id, username, display_name, avatar_url)")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(comments ?? []);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { body } = await request.json();
  if (!body || typeof body !== "string" || body.trim().length === 0) {
    return NextResponse.json({ error: "Comment body is required" }, { status: 400 });
  }
  if (body.length > 500) {
    return NextResponse.json({ error: "Comment must be 500 characters or less" }, { status: 400 });
  }

  // Insert the comment
  const { data: comment, error } = await (supabase as any)
    .from("session_comments")
    .insert({ session_id: sessionId, user_id: user.id, body: body.trim() })
    .select("id, session_id, user_id, body, created_at, profile:profiles!user_id(id, username, display_name, avatar_url)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notify the session owner (if not self-commenting)
  const { data: session } = await (supabase as any)
    .from("sessions")
    .select("user_id, brewery_id")
    .eq("id", sessionId)
    .single();

  if (session && session.user_id !== user.id) {
    // Get commenter's display name
    const { data: commenterProfile } = await (supabase as any)
      .from("profiles")
      .select("display_name, username")
      .eq("id", user.id)
      .single();

    const commenterName = commenterProfile?.display_name || commenterProfile?.username || "Someone";

    // Create in-app notification
    await (supabase as any)
      .from("notifications")
      .insert({
        user_id: session.user_id,
        type: "session_comment",
        title: "New comment",
        body: `${commenterName} commented on your session`,
        data: { session_id: sessionId, commenter_id: user.id },
      });

    // Send push notification (respects user preferences)
    const { data: ownerPrefs } = await (supabase as any)
      .from("profiles")
      .select("notification_preferences")
      .eq("id", session.user_id)
      .single();

    const prefs = ownerPrefs?.notification_preferences ?? {};
    if (prefs.friend_activity !== false) {
      await sendPushToUser(supabase, session.user_id, {
        title: "New comment",
        body: `${commenterName} commented on your session`,
        data: { url: `/home` },
      });
    }
  }

  return NextResponse.json(comment, { status: 201 });
}
