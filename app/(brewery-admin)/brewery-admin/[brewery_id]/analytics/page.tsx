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
  const [
    { data: sessions },
    { data: beerLogs },
    { data: breweryVisits },
    { data: loyaltyCards },
    { data: loyaltyRedemptions },
    { data: followers },
  ] = await Promise.all([
    supabase
      .from("sessions")
      .select("id, user_id, started_at, ended_at, is_active")
      .eq("brewery_id", brewery_id)
      .eq("is_active", false)
      .order("started_at") as any,
    supabase
      .from("beer_logs")
      .select("id, beer_id, rating, quantity, logged_at, user_id, beer:beers(name, style)")
      .eq("brewery_id", brewery_id)
      .order("logged_at") as any,
    supabase
      .from("brewery_visits")
      .select("user_id, total_visits")
      .eq("brewery_id", brewery_id) as any,
    supabase
      .from("loyalty_cards")
      .select("user_id")
      .eq("brewery_id", brewery_id) as any,
    supabase
      .from("loyalty_redemptions")
      .select("id, redeemed_at")
      .eq("brewery_id", brewery_id) as any,
    supabase
      .from("brewery_follows")
      .select("id, created_at")
      .eq("brewery_id", brewery_id) as any,
  ]);

  // Build profile lookup for top customers
  const userSessionCounts: Record<string, number> = {};
  ((sessions as any[]) ?? []).forEach((s: any) => {
    if (s.user_id) userSessionCounts[s.user_id] = (userSessionCounts[s.user_id] ?? 0) + 1;
  });
  const topUserIds = Object.entries(userSessionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id]) => id);

  const { data: topProfiles } = topUserIds.length > 0
    ? await supabase
        .from("profiles")
        .select("id, display_name, username")
        .in("id", topUserIds) as any
    : { data: [] };

  const profileLookup: Record<string, { display_name?: string; username?: string }> = {};
  ((topProfiles as any[]) ?? []).forEach((p: any) => {
    profileLookup[p.id] = { display_name: p.display_name, username: p.username };
  });

  return (
    <AnalyticsClient
      breweryId={brewery_id}
      sessions={(sessions as any[]) ?? []}
      beerLogs={(beerLogs as any[]) ?? []}
      breweryVisits={(breweryVisits as any[]) ?? []}
      loyaltyCards={(loyaltyCards as any[]) ?? []}
      loyaltyRedemptions={(loyaltyRedemptions as any[]) ?? []}
      followers={(followers as any[]) ?? []}
      profiles={profileLookup}
      userSessionCounts={userSessionCounts}
    />
  );
}
