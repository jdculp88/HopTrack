import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/beer-lists/[listId]/items — add beer to list
export async function POST(
  req: Request,
  { params }: { params: Promise<{ listId: string }> },
) {
  const { listId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify ownership
  const { data: list } = await (supabase as any)
    .from("beer_lists")
    .select("id")
    .eq("id", listId)
    .eq("user_id", user.id)
    .single();
  if (!list) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { beer_id, note } = body;
  if (!beer_id) return NextResponse.json({ error: "beer_id required" }, { status: 400 });

  // Get next position
  const { data: items } = await (supabase as any)
    .from("beer_list_items")
    .select("position")
    .eq("list_id", listId)
    .order("position", { ascending: false })
    .limit(1);
  const nextPos = items?.[0] ? items[0].position + 1 : 0;

  const { data, error } = await (supabase as any)
    .from("beer_list_items")
    .insert({ list_id: listId, beer_id, note: note?.trim() || null, position: nextPos })
    .select("*, beer:beers(id, name, style, abv, avg_rating)")
    .single();

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Beer already in list" }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}

// DELETE /api/beer-lists/[listId]/items?itemId=X — remove beer from list
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ listId: string }> },
) {
  const { listId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const itemId = url.searchParams.get("itemId");
  if (!itemId) return NextResponse.json({ error: "itemId required" }, { status: 400 });

  // Verify ownership via list
  const { data: list } = await (supabase as any)
    .from("beer_lists")
    .select("id")
    .eq("id", listId)
    .eq("user_id", user.id)
    .single();
  if (!list) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { error } = await (supabase as any)
    .from("beer_list_items")
    .delete()
    .eq("id", itemId)
    .eq("list_id", listId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
