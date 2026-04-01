import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const { brewery_id } = await params;

  const supabase = await createClient();

  // Fetch brewery, beers, pour sizes, and events in parallel
  const [breweryRes, beersRes, eventsRes] = await Promise.all([
    (supabase as any)
      .from("breweries")
      .select("id, name, city, state, brewery_type, description, cover_image_url, website_url, phone, latitude, longitude")
      .eq("id", brewery_id)
      .maybeSingle(),
    (supabase as any)
      .from("beers")
      .select("id, name, style, abv, ibu, description, is_featured, avg_rating, total_ratings, price_per_pint, glass_type")
      .eq("brewery_id", brewery_id)
      .eq("is_on_tap", true)
      .order("display_order", { ascending: true })
      .order("name"),
    (supabase as any)
      .from("brewery_events")
      .select("id, title, event_date, start_time")
      .eq("brewery_id", brewery_id)
      .gte("event_date", new Date().toISOString().split("T")[0])
      .order("event_date", { ascending: true })
      .limit(5),
  ]);

  if (!breweryRes.data) {
    return NextResponse.json(
      { error: "Brewery not found" },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  // Fetch pour sizes for all on-tap beers
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
        pourSizesMap[ps.beer_id].push({
          label: ps.label,
          oz: ps.oz,
          price: ps.price,
        });
      }
    }
  }

  // Attach pour sizes to beers
  const beers = (beersRes.data ?? []).map((beer: any) => ({
    ...beer,
    pour_sizes: pourSizesMap[beer.id] ?? [],
  }));

  const response = {
    brewery: breweryRes.data,
    beers,
    events: eventsRes.data ?? [],
    meta: {
      beer_count: beers.length,
      featured_beer: beers.find((b: any) => b.is_featured)?.name ?? null,
    },
  };

  return NextResponse.json(response, {
    headers: {
      ...CORS_HEADERS,
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
