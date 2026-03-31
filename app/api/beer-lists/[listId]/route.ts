import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/beer-lists/[listId] — single list with items
export async function GET(
  req: Request,
  { params }: { params: Promise<{ listId: string }> },
) {
  const { listId } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("beer_lists")
    .select("*, items:beer_list_items(id, beer_id, position, note, beer:beers(id, name, style, abv, avg_rating)), profile:profiles!user_id(username, display_name, avatar_url)")
    .eq("id", listId)
    .single();

  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

// PATCH /api/beer-lists/[listId] — update list metadata
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ listId: string }> },
) {
  const { listId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const updates: Record<string, any> = {};
  if (body.title !== undefined) updates.title = body.title.trim();
  if (body.description !== undefined) updates.description = body.description?.trim() || null;
  if (body.is_public !== undefined) updates.is_public = body.is_public;
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("beer_lists")
    .update(updates)
    .eq("id", listId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/beer-lists/[listId] — delete entire list
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ listId: string }> },
) {
  const { listId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("beer_lists")
    .delete()
    .eq("id", listId)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
