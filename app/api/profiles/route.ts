import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (q) {
    const { data } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url, level, xp, is_public")
      .ilike("username", `%${q}%`)
      .eq("is_public", true)
      .neq("id", user.id)
      .limit(20);
    return NextResponse.json({ profiles: data ?? [] });
  }

  // Return current user's profile
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return NextResponse.json({ profile: data });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const allowed = ["display_name", "username", "bio", "home_city", "avatar_url", "is_public", "notification_preferences"];
  const updates: Record<string, any> = {};

  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  if (updates.username) {
    updates.username = updates.username.toLowerCase().replace(/[^a-z0-9_]/g, "");
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profile: data });
}
