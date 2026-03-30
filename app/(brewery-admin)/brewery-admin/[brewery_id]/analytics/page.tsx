import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AnalyticsClient } from "./AnalyticsClient";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage({ params }: { params: Promise<{ brewery_id: string }> }) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: account } = await supabase
    .from("brewery_accounts").select("role")
    .eq("user_id", user.id).eq("brewery_id", brewery_id).single() as any;
  if (!account) redirect("/brewery-admin");

  // Fetch ALL sessions for this brewery (client will filter by range)
  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, user_id, started_at, ended_at, is_active")
    .eq("brewery_id", brewery_id)
    .eq("is_active", false)
    .order("started_at") as any;

  // Fetch ALL beer_logs for this brewery
  const { data: beerLogs } = await supabase
    .from("beer_logs")
    .select("id, beer_id, rating, quantity, logged_at, user_id, beer:beers(name, style)")
    .eq("brewery_id", brewery_id)
    .order("logged_at") as any;

  return (
    <AnalyticsClient
      breweryId={brewery_id}
      sessions={(sessions as any[]) ?? []}
      beerLogs={(beerLogs as any[]) ?? []}
    />
  );
}
