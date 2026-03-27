import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { BoardClient } from "./BoardClient";

export const metadata = { title: "The Board — HopTrack" };

export default async function BoardPage({ params }: { params: Promise<{ brewery_id: string }> }) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify brewery access
  const { data: account } = await supabase
    .from("brewery_accounts").select("role")
    .eq("user_id", user.id).eq("brewery_id", brewery_id).single() as any;
  if (!account) notFound();

  // Get brewery info
  const { data: brewery } = await supabase
    .from("breweries").select("id, name, cover_image_url")
    .eq("id", brewery_id).single() as any;

  // Get on-tap beers ordered by display_order
  const { data: beers } = await (supabase as any)
    .from("beers").select("*")
    .eq("brewery_id", brewery_id)
    .eq("is_on_tap", true)
    .order("display_order", { ascending: true })
    .order("name") as any;

  // Get upcoming events
  const { data: events } = await (supabase as any)
    .from("brewery_events").select("id, title, event_date, start_time")
    .eq("brewery_id", brewery_id)
    .eq("is_active", true)
    .gte("event_date", new Date().toISOString().split("T")[0])
    .order("event_date", { ascending: true })
    .limit(3) as any;

  return (
    <BoardClient
      breweryId={brewery_id}
      breweryName={brewery?.name ?? "Unknown Brewery"}
      initialBeers={(beers as any[]) ?? []}
      events={(events as any[]) ?? []}
    />
  );
}
