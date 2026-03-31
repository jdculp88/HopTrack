import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/wishlist/on-tap?brewery_id=X — beers on user's wishlist that are currently on tap
export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const breweryId = url.searchParams.get("brewery_id");
  if (!breweryId) return NextResponse.json({ error: "brewery_id required" }, { status: 400 });

  // Get user's wishlist beer IDs
  const { data: wishlist } = await supabase
    .from("wishlist")
    .select("beer_id")
    .eq("user_id", user.id);

  if (!wishlist || wishlist.length === 0) {
    return NextResponse.json({ matches: [], count: 0 });
  }

  const wishlistBeerIds = wishlist.map((w: any) => w.beer_id);

  // Get beers at this brewery that are on the wishlist and not 86'd
  const { data: matches } = await supabase
    .from("beers")
    .select("id, name, style, abv")
    .eq("brewery_id", breweryId)
    .in("id", wishlistBeerIds)
    .or("is_86d.is.null,is_86d.eq.false");

  return NextResponse.json({
    matches: matches ?? [],
    count: (matches ?? []).length,
  });
}
