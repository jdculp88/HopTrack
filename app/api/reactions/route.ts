import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const rl = rateLimitResponse(request, "reactions", { limit: 60, windowMs: 60_000 });
  if (rl) return rl;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { session_id, beer_log_id, type } = await request.json();

  if (!session_id || !type) {
    return NextResponse.json({ error: "session_id and type required" }, { status: 400 });
  }

  // Toggle: remove if already exists, add if not
  const { data: existing } = await (supabase as any)
    .from("reactions")
    .select("id")
    .eq("user_id", user.id)
    .eq("session_id", session_id)
    .eq("type", type)
    .single();

  if (existing) {
    await (supabase as any).from("reactions").delete().eq("id", existing.id);
    return NextResponse.json({ action: "removed" });
  }

  const insertData: Record<string, any> = { user_id: user.id, session_id, type };
  if (beer_log_id) insertData.beer_log_id = beer_log_id;

  const { data, error } = await (supabase as any)
    .from("reactions")
    .insert(insertData)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ action: "added", reaction: data }, { status: 201 });
}
