import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPushToUser } from "@/lib/push";
import { rateLimitResponse } from "@/lib/rate-limit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch comments (no profile join — session_comments FKs to auth.users, not profiles,
  // so PostgREST can't reliably resolve profiles!user_id)
  const { data: comments, error } = await supabase
    .from("session_comments")
    .select("id, session_id, user_id, body, created_at")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!comments || comments.length === 0) return NextResponse.json([]);

  // Fetch profiles for all comment authors in one query
  const userIds = [...new Set(comments.map((c: any) => c.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url")
    .in("id", userIds);

  const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));

  // Attach profile to each comment (matches the shape the client expects)
  const enriched = comments.map((c: any) => ({
    ...c,
    profile: profileMap.get(c.user_id) ?? null,
  }));

  return NextResponse.json(enriched);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const rl = rateLimitResponse(request, 'sessions/comments', { limit: 30, windowMs: 60_000 })
  if (rl) return rl

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

  // Insert the comment (no profile join — session_comments FKs to auth.users, not profiles)
  const { data: comment, error } = await supabase
    .from("session_comments")
    .insert({ session_id: sessionId, user_id: user.id, body: body.trim() })
    .select("id, session_id, user_id, body, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Attach the commenter's profile
  const { data: commenterProfileData } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url")
    .eq("id", user.id)
    .single();

  const enrichedComment = { ...comment, profile: commenterProfileData ?? null };

  // Notify the session owner (if not self-commenting)
  const { data: session } = await supabase
    .from("sessions")
    .select("user_id, brewery_id")
    .eq("id", sessionId)
    .single();

  if (session && session.user_id !== user.id) {
    // Reuse profile data already fetched above
    const commenterName = commenterProfileData?.display_name || commenterProfileData?.username || "Someone";

    // Create in-app notification
    await supabase
      .from("notifications")
      .insert({
        user_id: session.user_id,
        type: "session_comment",
        title: "New comment",
        body: `${commenterName} commented on your session`,
        data: { session_id: sessionId, commenter_id: user.id },
      });

    // Send push notification (respects user preferences)
    const { data: ownerPrefs } = await supabase
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

  // Handle @mentions — batch insert notifications, fire pushes in parallel
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;
  const mentions = [...body.matchAll(mentionRegex)].map((m: any) => m[1]);
  if (mentions.length > 0) {
    const { data: mentionedUsers } = await supabase
      .from("profiles")
      .select("id, username")
      .in("username", mentions);

    const commenterName = commenterProfileData?.display_name || commenterProfileData?.username || "Someone";

    const toNotify = ((mentionedUsers ?? []) as any[]).filter(
      (m) => m.id !== user.id && (!session || m.id !== session.user_id)
    );

    if (toNotify.length > 0) {
      // Batch-insert all mention notifications in one query
      await supabase.from("notifications").insert(
        toNotify.map((mentioned) => ({
          user_id: mentioned.id,
          type: "mention",
          title: "You were mentioned",
          body: `${commenterName} mentioned you in a comment`,
          data: { session_id: sessionId, commenter_id: user.id },
        }))
      );

      // Fire all push notifications in parallel
      await Promise.all(
        toNotify.map((mentioned) =>
          sendPushToUser(supabase, mentioned.id, {
            title: "You were mentioned",
            body: `${commenterName} mentioned you in a comment`,
            data: { url: `/home` },
          }).catch(() => {})
        )
      );
    }
  }

  return NextResponse.json(enrichedComment, { status: 201 });
}
