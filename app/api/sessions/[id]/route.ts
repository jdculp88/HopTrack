import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";

// PATCH /api/sessions/[id] — update session fields (note, share_to_feed)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const limited = rateLimitResponse(req, "session-update", { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const updates: Record<string, any> = {};

  if (body.note !== undefined) updates.note = body.note || null;
  if (body.share_to_feed !== undefined) updates.share_to_feed = body.share_to_feed;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("sessions")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/sessions/[id] — cancel session (hard delete, no XP awarded)
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const limited = rateLimitResponse(_req, "session-delete", { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify the user owns this session and it's still active
  const { data: session, error: fetchError } = await supabase
    .from("sessions")
    .select("id, user_id, is_active")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (!session.is_active) {
    return NextResponse.json({ error: "Session is already ended" }, { status: 400 });
  }

  // Delete beer_logs for this session (cascade)
  await supabase.from("beer_logs").delete().eq("session_id", id);

  // Clean up session_participants
  await supabase.from("session_participants").delete().eq("session_id", id);

  // Delete the session itself
  const { error: deleteError } = await supabase
    .from("sessions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  // Decrement total_checkins since the session creation incremented it
  // Non-critical — if RPC doesn't exist or fails, skip silently
  try {
    await supabase.rpc("decrement_checkins" as any, { p_user_id: user.id }); // supabase rpc not in generated types
  } catch {
    // skip
  }

  return NextResponse.json({ success: true });
}
