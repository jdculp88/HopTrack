import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/beer-lists?userId=X — list user's beer lists (public if not self)
export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");

  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  let query = supabase
    .from("beer_lists")
    .select("*, items:beer_list_items(id, beer_id, position, note, beer:beers(id, name, style, abv, avg_rating))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  // If not the owner, only show public lists
  if (!user || user.id !== userId) {
    query = query.eq("is_public", true);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data ?? []);
}

// POST /api/beer-lists — create a new beer list
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, is_public } = body;

  if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const { data, error } = await supabase
    .from("beer_lists")
    .insert({ user_id: user.id, title: title.trim(), description: description?.trim() || null, is_public: is_public ?? true })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
