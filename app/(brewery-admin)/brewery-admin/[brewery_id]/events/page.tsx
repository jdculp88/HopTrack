import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { EventsClient } from "./EventsClient";

export const metadata = { title: "Events" };

export default async function EventsPage({ params }: { params: Promise<{ brewery_id: string }> }) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: account } = await supabase
    .from("brewery_accounts").select("role")
    .eq("user_id", user.id).eq("brewery_id", brewery_id).single() as any;
  if (!account) redirect("/brewery-admin");

  const { data: events } = await supabase
    .from("brewery_events").select("*")
    .eq("brewery_id", brewery_id)
    .order("event_date", { ascending: true }) as any;

  return <EventsClient breweryId={brewery_id} initialEvents={(events as any[]) ?? []} />;
}
