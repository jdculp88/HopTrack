import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/wishlist/on-tap?brewery_id=X — beers on user's wishlist that are currently on tap
// GET /api/wishlist/on-tap (no brewery_id) — all brewery IDs with wishlisted beers on tap
export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const breweryId = url.searchParams.get("brewery_id");

  // Get user's wishlist beer IDs
  const { data: wishlist } = await supabase
    .from("wishlist")
    .select("beer_id")
    .eq("user_id", user.id);

  if (!wishlist || wishlist.length === 0) {
    return breweryId
      ? NextResponse.json({ matches: [], count: 0 })
      : NextResponse.json({ brewery_ids: [], count: 0 });
  }

  const wishlistBeerIds = wishlist.map((w: any) => w.beer_id);

  // If no brewery_id, return all brewery IDs that have wishlisted beers on tap
  if (!breweryId) {
    const { data: onTapBeers } = await supabase
      .from("beers")
      .select("brewery_id")
      .in("id", wishlistBeerIds)
      .or("is_86d.is.null,is_86d.eq.false");

    const breweryIds = [...new Set((onTapBeers ?? []).map((b: any) => b.brewery_id).filter(Boolean))];
    return NextResponse.json({ brewery_ids: breweryIds, count: breweryIds.length });
  }

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
