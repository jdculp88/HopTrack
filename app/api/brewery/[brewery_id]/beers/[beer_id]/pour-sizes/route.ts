import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// ── GET /api/brewery/[brewery_id]/beers/[beer_id]/pour-sizes ─────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ brewery_id: string; beer_id: string }> }
) {
  const { brewery_id, beer_id } = await params;
  const supabase = await createClient();

  // Verify caller is a brewery admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: account } = await (supabase as any)
    .from("brewery_accounts").select("role")
    .eq("user_id", user.id).eq("brewery_id", brewery_id).single();
  if (!account) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data, error } = await (supabase as any)
    .from("beer_pour_sizes")
    .select("*")
    .eq("beer_id", beer_id)
    .order("display_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// ── POST /api/brewery/[brewery_id]/beers/[beer_id]/pour-sizes ────────────────
// Replaces ALL pour sizes for a beer (delete + re-insert).
// Body: Array<{ label: string; oz: number | null; price: number; display_order: number }>
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ brewery_id: string; beer_id: string }> }
) {
  const { brewery_id, beer_id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: account } = await (supabase as any)
    .from("brewery_accounts").select("role")
    .eq("user_id", user.id).eq("brewery_id", brewery_id).single();
  if (!account) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Verify beer belongs to this brewery
  const { data: beer } = await (supabase as any)
    .from("beers").select("id").eq("id", beer_id).eq("brewery_id", brewery_id).single();
  if (!beer) return NextResponse.json({ error: "Beer not found" }, { status: 404 });

  const sizes = await req.json() as Array<{
    label: string;
    oz: number | null;
    price: number;
    display_order: number;
  }>;

  // Delete existing, then insert new
  await (supabase as any).from("beer_pour_sizes").delete().eq("beer_id", beer_id);

  if (sizes.length > 0) {
    const rows = sizes.map((s, i) => ({
      beer_id,
      label: s.label.trim(),
      oz: s.oz ?? null,
      price: s.price,
      display_order: i,
    }));
    const { error } = await (supabase as any).from("beer_pour_sizes").insert(rows);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return updated list
  const { data } = await (supabase as any)
    .from("beer_pour_sizes")
    .select("*")
    .eq("beer_id", beer_id)
    .order("display_order", { ascending: true });

  return NextResponse.json(data ?? []);
}
