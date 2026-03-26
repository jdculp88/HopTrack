import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { session_id, beer_log_id, type, checkin_id } = await request.json();

  // Support both old (checkin_id) and new (session_id) patterns
  const targetId = session_id || checkin_id;
  const targetColumn = session_id ? "session_id" : "checkin_id";

  if (!targetId || !type) {
    return NextResponse.json({ error: "session_id (or checkin_id) and type required" }, { status: 400 });
  }

  // Toggle: remove if already exists, add if not
  const { data: existing } = await (supabase as any)
    .from("reactions")
    .select("id")
    .eq("user_id", user.id)
    .eq(targetColumn, targetId)
    .eq("type", type)
    .single();

  if (existing) {
    await (supabase as any).from("reactions").delete().eq("id", existing.id);
    return NextResponse.json({ action: "removed" });
  }

  const insertData: Record<string, any> = { user_id: user.id, type };
  if (session_id) {
    insertData.session_id = session_id;
    if (beer_log_id) insertData.beer_log_id = beer_log_id;
  } else {
    insertData.checkin_id = checkin_id;
  }

  const { data, error } = await (supabase as any)
    .from("reactions")
    .insert(insertData)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ action: "added", reaction: data }, { status: 201 });
}
