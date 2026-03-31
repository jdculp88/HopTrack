import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PATCH /api/sessions/[id]/participants/status — accept or decline a group invite
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { status } = await request.json();
  if (!["accepted", "declined"].includes(status)) {
    return NextResponse.json({ error: "status must be 'accepted' or 'declined'" }, { status: 400 });
  }

  // Check session is still active before allowing accept (S38-004)
  const { data: session } = await supabase
    .from("sessions")
    .select("is_active")
    .eq("id", sessionId)
    .single();

  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  if (!session.is_active && status === "accepted") {
    return NextResponse.json({ error: "Cannot accept invite to an ended session" }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("session_participants")
    .update({ status })
    .eq("session_id", sessionId)
    .eq("user_id", user.id)
    .select("id, status")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Invite not found" }, { status: 404 });

  return NextResponse.json(data);
}
