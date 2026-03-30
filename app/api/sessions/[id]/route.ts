import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PATCH /api/sessions/[id] — update session fields (note, share_to_feed)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const { data, error } = await (supabase as any)
    .from("sessions")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
