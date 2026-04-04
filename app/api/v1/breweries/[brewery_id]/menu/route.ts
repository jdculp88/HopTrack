// GET /api/v1/breweries/:brewery_id/menu — Full menu (all item types, grouped)
// Sprint 85 — The Pipeline (Avery)

import { createClient } from "@/lib/supabase/server";
import { apiResponse, apiError, apiOptions } from "@/lib/api-keys";
import { rateLimitResponse } from "@/lib/rate-limit";

export const OPTIONS = apiOptions;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const rl = rateLimitResponse(req, "v1:breweries:menu", { limit: 20, windowMs: 60_000 });
  if (rl) return rl;

  const { brewery_id } = await params;
  const supabase = await createClient();

  const [breweryRes, beersRes, eventsRes, menusRes] = await Promise.all([
    (supabase as any)
      .from("breweries")
      .select("id, name, city, state, brewery_type, description, cover_image_url, website_url, phone, latitude, longitude, menu_image_url")
      .eq("id", brewery_id)
      .maybeSingle(),
    (supabase as any)
      .from("beers")
      .select("id, name, style, abv, ibu, description, is_featured, avg_rating, total_ratings, item_type, category, glass_type")
      .eq("brewery_id", brewery_id)
      .eq("is_active", true)
      .eq("is_on_tap", true)
      .order("item_type")
      .order("name"),
    (supabase as any)
      .from("brewery_events")
      .select("id, title, description, event_date, start_time, end_time, event_type")
      .eq("brewery_id", brewery_id)
      .eq("is_active", true)
      .gte("event_date", new Date().toISOString().split("T")[0])
      .order("event_date", { ascending: true })
      .limit(10),
    (supabase as any)
      .from("brewery_menus")
      .select("category, title, image_urls, display_order")
      .eq("brewery_id", brewery_id)
      .eq("is_active", true)
      .order("display_order"),
  ]);

  if (!breweryRes.data) return apiError("Brewery not found", 404, "not_found");

  // Fetch pour sizes
  const beerIds = (beersRes.data ?? []).map((b: any) => b.id);
  const pourSizesMap: Record<string, any[]> = {};
  if (beerIds.length > 0) {
    const { data: pourSizes } = await (supabase as any)
      .from("beer_pour_sizes")
      .select("beer_id, label, oz, price, display_order")
      .in("beer_id", beerIds)
      .order("display_order", { ascending: true });
    if (pourSizes) {
      for (const ps of pourSizes) {
        if (!pourSizesMap[ps.beer_id]) pourSizesMap[ps.beer_id] = [];
        pourSizesMap[ps.beer_id].push({ label: ps.label, oz: ps.oz, price: ps.price });
      }
    }
  }

  // Group by item_type
  const items = (beersRes.data ?? []).map((beer: any) => ({
    ...beer,
    pour_sizes: pourSizesMap[beer.id] ?? [],
  }));

  const grouped: Record<string, any[]> = {};
  for (const item of items) {
    const type = item.item_type ?? "beer";
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(item);
  }

  return apiResponse({
    brewery: breweryRes.data,
    menu: grouped,
    menus: menusRes.data ?? [],
    events: eventsRes.data ?? [],
  }, {
    total_items: items.length,
    categories: Object.keys(grouped),
    featured: items.find((b: any) => b.is_featured)?.name ?? null,
  }, 200, 300);
}
