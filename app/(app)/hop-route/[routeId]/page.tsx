import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { HopRouteCardClient } from "./HopRouteCardClient";

export const metadata = { title: "HopRoute — HopTrack" };

export default async function HopRoutePage({ params }: { params: Promise<{ routeId: string }> }) {
  const { routeId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: route, error } = await supabase
    .from("hop_routes")
    .select(`
      id, title, location_city, stop_count, group_size, vibe, transport, status,
      created_at, started_at, completed_at,
      hop_route_stops(
        id, stop_order, arrival_time, departure_time,
        travel_to_next_minutes, reasoning_text, social_context,
        is_sponsored, checked_in, checked_in_at,
        brewery:breweries(id, name, city, state, latitude, longitude, cover_image_url, brewery_type, hop_route_offer),
        hop_route_stop_beers(id, beer_id, beer_name, reason_text, beer:beers(style))
      )
    `)
    .eq("id", routeId)
    .eq("user_id", user.id)
    .order("stop_order", { referencedTable: "hop_route_stops", ascending: true })
    .single();

  if (error || !route) notFound();

  return <HopRouteCardClient route={route as any} userId={user.id} />;
}
