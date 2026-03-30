import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPushToUser } from "@/lib/push";

// GET /api/sessions/[id]/participants — list participants for a session
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: participants, error } = await (supabase as any)
    .from("session_participants")
    .select("id, session_id, user_id, invited_by, status, created_at")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!participants || participants.length === 0) return NextResponse.json([]);

  // Enrich with profiles
  const userIds = [...new Set(participants.map((p: any) => p.user_id))];
  const { data: profiles } = await (supabase as any)
    .from("profiles")
    .select("id, username, display_name, avatar_url")
    .in("id", userIds);

  const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));

  const enriched = participants.map((p: any) => ({
    ...p,
    profile: profileMap.get(p.user_id) ?? null,
  }));

  return NextResponse.json(enriched);
}

// POST /api/sessions/[id]/participants — invite a friend to the session
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify session ownership
  const { data: session } = await (supabase as any)
    .from("sessions")
    .select("user_id, brewery_id, brewery:breweries(name)")
    .eq("id", sessionId)
    .single();

  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  if (session.user_id !== user.id)
    return NextResponse.json({ error: "Only the session owner can invite participants" }, { status: 403 });

  const { user_id: inviteeId } = await request.json();
  if (!inviteeId) return NextResponse.json({ error: "user_id is required" }, { status: 400 });
  if (inviteeId === user.id)
    return NextResponse.json({ error: "You cannot invite yourself" }, { status: 400 });

  // Verify accepted friendship — can only invite friends (S38-003)
  const { data: friendship } = await (supabase as any)
    .from("friendships")
    .select("id, status")
    .or(
      `and(requester_id.eq.${user.id},addressee_id.eq.${inviteeId}),and(requester_id.eq.${inviteeId},addressee_id.eq.${user.id})`
    )
    .eq("status", "accepted")
    .single();

  if (!friendship) {
    return NextResponse.json({ error: "You can only invite friends to your session" }, { status: 403 });
  }

  const { data: participant, error } = await (supabase as any)
    .from("session_participants")
    .insert({ session_id: sessionId, user_id: inviteeId, invited_by: user.id })
    .select("id, session_id, user_id, invited_by, status, created_at")
    .single();

  if (error) {
    if (error.code === "23505")
      return NextResponse.json({ error: "User already invited to this session" }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Notify the invitee
  const { data: inviterProfile } = await (supabase as any)
    .from("profiles")
    .select("display_name, username")
    .eq("id", user.id)
    .single();

  const inviterName = inviterProfile?.display_name || inviterProfile?.username || "Someone";
  const breweryName = session.brewery?.name ?? null;
  const notifBody = breweryName
    ? `${inviterName} invited you to their session at ${breweryName}`
    : `${inviterName} invited you to their home session`;

  await (supabase as any).from("notifications").insert({
    user_id: inviteeId,
    type: "group_invite",
    title: "You're invited! 🍺",
    body: notifBody,
    data: { session_id: sessionId, invited_by: user.id },
  });

  sendPushToUser(supabase, inviteeId, {
    title: "You're invited! 🍺",
    body: notifBody,
    data: { url: "/notifications" },
  }).catch(() => {});

  return NextResponse.json(participant, { status: 201 });
}

// DELETE /api/sessions/[id]/participants?user_id=X — leave or remove a participant
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const targetUserId = searchParams.get("user_id") || user.id;

  // Can remove self, or session owner can remove anyone
  const { data: session } = await (supabase as any)
    .from("sessions")
    .select("user_id")
    .eq("id", sessionId)
    .single();

  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  if (targetUserId !== user.id && session.user_id !== user.id) {
    return NextResponse.json({ error: "Not authorized to remove this participant" }, { status: 403 });
  }

  const { error } = await (supabase as any)
    .from("session_participants")
    .delete()
    .eq("session_id", sessionId)
    .eq("user_id", targetUserId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
