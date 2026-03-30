import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/hop-route/[routeId] — fetch a saved route with stops and beers
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ routeId: string }> }
) {
  const { routeId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: route, error } = await (supabase as any)
    .from("hop_routes")
    .select(`
      id, title, location_city, location_lat, location_lng,
      stop_count, group_size, vibe, transport, status,
      created_at, started_at, completed_at,
      hop_route_stops(
        id, stop_order, arrival_time, departure_time,
        travel_to_next_minutes, reasoning_text, social_context,
        is_sponsored, checked_in, checked_in_at,
        brewery:breweries(id, name, city, state, latitude, longitude, cover_image_url),
        hop_route_stop_beers(id, beer_id, beer_name, reason_text)
      )
    `)
    .eq("id", routeId)
    .eq("user_id", user.id)
    .order("stop_order", { referencedTable: "hop_route_stops", ascending: true })
    .single();

  if (error || !route) {
    return NextResponse.json({ error: "Route not found" }, { status: 404 });
  }

  return NextResponse.json(route);
}
