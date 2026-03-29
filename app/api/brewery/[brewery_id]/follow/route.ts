import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET — check if current user follows this brewery + get follow count
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Follow count (public)
  const { count } = await (supabase as any)
    .from("brewery_follows")
    .select("id", { count: "exact", head: true })
    .eq("brewery_id", brewery_id);

  // User's follow status
  let isFollowing = false;
  if (user) {
    const { data } = await (supabase as any)
      .from("brewery_follows")
      .select("id")
      .eq("user_id", user.id)
      .eq("brewery_id", brewery_id)
      .single();
    isFollowing = !!data;
  }

  return NextResponse.json({ isFollowing, count: count ?? 0 });
}

// POST — follow a brewery
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await (supabase as any)
    .from("brewery_follows")
    .insert({ user_id: user.id, brewery_id });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ message: "Already following" }, { status: 200 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}

// DELETE — unfollow a brewery
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await (supabase as any)
    .from("brewery_follows")
    .delete()
    .eq("user_id", user.id)
    .eq("brewery_id", brewery_id);

  return NextResponse.json({ success: true });
}
