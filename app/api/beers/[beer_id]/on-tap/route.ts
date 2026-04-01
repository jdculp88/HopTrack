import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { triggerWishlistOnTap } from "@/lib/smart-triggers";
import { apiUnauthorized, apiForbidden, apiNotFound } from "@/lib/api-response";

/**
 * POST /api/beers/[beer_id]/on-tap
 * Called when a beer is tapped (put on tap list).
 * Fires wishlist-on-tap smart notifications.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ beer_id: string }> }
) {
  const { beer_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiUnauthorized();

  // Get beer and brewery info
  const { data: beer } = await (supabase
    .from("beers")
    .select("id, name, brewery_id, brewery:breweries(name)")
    .eq("id", beer_id)
    .single() as any);

  if (!beer) return apiNotFound("Beer");

  // Verify user is brewery admin
  const { data: account } = await supabase
    .from("brewery_accounts")
    .select("id")
    .eq("user_id", user.id)
    .eq("brewery_id", beer.brewery_id)
    .single();

  if (!account) return apiForbidden();

  // Fire smart trigger (async, don't block response)
  const breweryName = (beer.brewery as any)?.name ?? "Unknown Brewery";
  triggerWishlistOnTap(supabase, beer_id, beer.name, beer.brewery_id, breweryName)
    .catch((err) => console.warn("[smart-trigger] wishlist_on_tap error:", err));

  return NextResponse.json({ triggered: true });
}
