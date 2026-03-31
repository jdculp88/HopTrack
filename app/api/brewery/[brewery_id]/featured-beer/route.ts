import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/brewery/[brewery_id]/featured-beer — set a beer as featured (or clear)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { brewery_id } = await params;

  // Verify brewery admin
  const { data: account } = await supabase
    .from("brewery_accounts")
    .select("role")
    .eq("user_id", user.id)
    .eq("brewery_id", brewery_id)
    .single() as any;

  if (!account) {
    return NextResponse.json({ error: "Not authorized for this brewery" }, { status: 403 });
  }

  const { beer_id } = await request.json();

  // Clear all featured beers for this brewery first
  await supabase
    .from("beers")
    .update({ is_featured: false })
    .eq("brewery_id", brewery_id)
    .eq("is_featured", true);

  // If a beer_id was provided, set it as featured
  if (beer_id) {
    const { error } = await supabase
      .from("beers")
      .update({ is_featured: true })
      .eq("id", beer_id)
      .eq("brewery_id", brewery_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ action: beer_id ? "featured" : "cleared" });
}
