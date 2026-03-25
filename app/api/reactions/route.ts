import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { checkin_id, type } = await request.json();
  if (!checkin_id || !type) {
    return NextResponse.json({ error: "checkin_id and type required" }, { status: 400 });
  }

  // Toggle: remove if already exists, add if not
  const { data: existing } = await supabase
    .from("reactions")
    .select("id")
    .eq("user_id", user.id)
    .eq("checkin_id", checkin_id)
    .eq("type", type)
    .single();

  if (existing) {
    await supabase.from("reactions").delete().eq("id", existing.id);
    return NextResponse.json({ action: "removed" });
  }

  const { data, error } = await supabase
    .from("reactions")
    .insert({ user_id: user.id, checkin_id, type })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ action: "added", reaction: data }, { status: 201 });
}
