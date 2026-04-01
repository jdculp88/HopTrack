import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { rateLimitResponse } from "@/lib/rate-limit";

// GET — list photos for a session
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("session_photos")
    .select("id, photo_url, created_at, user_id")
    .eq("session_id", id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST — add a photo to a session
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const rl = rateLimitResponse(req, 'sessions/photos', { limit: 20, windowMs: 60_000 })
  if (rl) return rl

  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check session belongs to user
  const { data: session } = await supabase
    .from("sessions")
    .select("id, user_id")
    .eq("id", id)
    .single();

  if (!session || (session as any).user_id !== user.id) {
    return NextResponse.json({ error: "Not your session" }, { status: 403 });
  }

  // Check photo limit (5 per session)
  const { count } = await supabase
    .from("session_photos")
    .select("id", { count: "exact", head: true })
    .eq("session_id", id);

  if ((count ?? 0) >= 5) {
    return NextResponse.json({ error: "Maximum 5 photos per session" }, { status: 400 });
  }

  const { photo_url } = await req.json();
  if (!photo_url) {
    return NextResponse.json({ error: "photo_url required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("session_photos")
    .insert({ session_id: id, user_id: user.id, photo_url })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// DELETE — remove a photo (own photos only)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { photoId } = await req.json();
  if (!photoId) return NextResponse.json({ error: "photoId required" }, { status: 400 });

  await supabase
    .from("session_photos")
    .delete()
    .eq("id", photoId)
    .eq("user_id", user.id)
    .eq("session_id", sessionId);

  return NextResponse.json({ success: true });
}
