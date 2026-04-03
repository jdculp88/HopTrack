import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";
import { requireAuth } from "@/lib/api-helpers";
import { apiUnauthorized, apiSuccess, apiServerError } from "@/lib/api-response";

// GET /api/rewards — fetch user's rewards, loyalty cards, and available promotions
export async function GET(req: Request) {
  const limited = rateLimitResponse(req, "rewards", { limit: 30 });
  if (limited) return limited;

  const supabase = await createClient();
  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  try {
    const [
      { data: codes },
      { data: loyaltyCards },
      { data: followedBreweryIds },
    ] = await Promise.all([
      // All redemption codes for this user
      supabase
        .from("redemption_codes")
        .select("*, brewery:breweries(id, name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50) as any,

      // Loyalty cards with program details
      supabase
        .from("loyalty_cards")
        .select("*, program:loyalty_programs(id, stamps_required, reward_description, is_active), brewery:breweries(id, name)")
        .eq("user_id", user.id) as any,

      // Brewery follows (for available promotions)
      supabase
        .from("brewery_follows")
        .select("brewery_id")
        .eq("user_id", user.id) as any,
    ]);

    // Fetch active promotions from followed breweries
    const breweryIds = (followedBreweryIds ?? []).map((f: any) => f.brewery_id);
    let promotions: any[] = [];
    if (breweryIds.length > 0) {
      const now = new Date().toISOString();
      const { data } = await supabase
        .from("promotions")
        .select("*, brewery:breweries(id, name)")
        .in("brewery_id", breweryIds)
        .eq("is_active", true)
        .lte("starts_at", now)
        .gte("ends_at", now)
        .order("ends_at", { ascending: true })
        .limit(20) as any;
      promotions = data ?? [];
    }

    const now = new Date();
    const allCodes = (codes ?? []) as any[];

    // Split codes into active (pending + not expired) and history
    const activeCodes = allCodes.filter(
      (c: any) => c.status === "pending" && new Date(c.expires_at) > now
    );
    const history = allCodes.filter(
      (c: any) => c.status !== "pending" || new Date(c.expires_at) <= now
    );

    // Filter to active loyalty cards with active programs
    const activeCards = ((loyaltyCards ?? []) as any[]).filter(
      (c: any) => c.program?.is_active
    );

    return apiSuccess({
      active_codes: activeCodes,
      history,
      loyalty_cards: activeCards,
      available_promotions: promotions,
    });
  } catch {
    return apiServerError("Failed to fetch rewards");
  }
}
