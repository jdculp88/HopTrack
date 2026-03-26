import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { beer_id } = await request.json();
  if (!beer_id) {
    return NextResponse.json({ error: "beer_id required" }, { status: 400 });
  }

  const { data, error } = await (supabase as any)
    .from("wishlist")
    .upsert({ user_id: user.id, beer_id }, { onConflict: "user_id,beer_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ wishlistItem: data }, { status: 201 });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { beer_id } = await request.json();
  if (!beer_id) {
    return NextResponse.json({ error: "beer_id required" }, { status: 400 });
  }

  const { error } = await (supabase as any)
    .from("wishlist")
    .delete()
    .eq("user_id", user.id)
    .eq("beer_id", beer_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ action: "removed" });
}
