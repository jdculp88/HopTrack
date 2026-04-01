import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { buildCustomerProfile } from "@/lib/crm";
import { CustomerProfileClient } from "./CustomerProfileClient";

export async function generateMetadata({ params }: { params: Promise<{ brewery_id: string; user_id: string }> }) {
  const { user_id } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", user_id).single() as any;
  return { title: `${(profile as any)?.display_name ?? "Customer"} — Customer Profile` };
}

export default async function CustomerProfilePage({ params }: { params: Promise<{ brewery_id: string; user_id: string }> }) {
  const { brewery_id, user_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify brewery admin access
  const { data: account } = await supabase
    .from("brewery_accounts").select("role")
    .eq("user_id", user.id).eq("brewery_id", brewery_id).maybeSingle() as any;
  if (!account) redirect("/brewery-admin");

  // Fetch customer profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, username, avatar_url")
    .eq("id", user_id)
    .single() as any;

  if (!profile) redirect(`/brewery-admin/${brewery_id}/customers`);

  // Fetch all data in parallel
  const [
    { data: sessions },
    { data: beerLogs },
    { data: loyaltyCard },
    { data: follow },
  ] = await Promise.all([
    supabase
      .from("sessions")
      .select("id, started_at, ended_at")
      .eq("brewery_id", brewery_id)
      .eq("user_id", user_id)
      .eq("is_active", false)
      .order("started_at", { ascending: false }) as any,
    supabase
      .from("beer_logs")
      .select("beer_id, rating, quantity, beer:beers(name, style)")
      .eq("brewery_id", brewery_id)
      .eq("user_id", user_id) as any,
    supabase
      .from("loyalty_cards")
      .select("stamps_earned")
      .eq("brewery_id", brewery_id)
      .eq("user_id", user_id)
      .maybeSingle() as any,
    supabase
      .from("brewery_follows")
      .select("id")
      .eq("brewery_id", brewery_id)
      .eq("user_id", user_id)
      .maybeSingle() as any,
  ]);

  // Transform beer logs for the profile builder
  const transformedLogs = ((beerLogs as any[]) ?? []).map((l: any) => ({
    beer_id: l.beer_id,
    beer_name: l.beer?.name ?? "Unknown",
    beer_style: l.beer?.style ?? "",
    rating: l.rating ?? 0,
    quantity: l.quantity ?? 1,
  }));

  const customerProfile = buildCustomerProfile({
    profile: profile as any,
    sessions: ((sessions as any[]) ?? []).map((s: any) => ({
      id: s.id,
      started_at: s.started_at,
      ended_at: s.ended_at,
    })),
    beerLogs: transformedLogs,
    loyaltyCard: loyaltyCard as any,
    isFollowing: !!follow,
  });

  // Recent sessions for timeline (with beer details)
  const { data: recentSessions } = await supabase
    .from("sessions")
    .select("id, started_at, ended_at, beer_logs(id, beer_id, rating, quantity, beer:beers(name, style))")
    .eq("brewery_id", brewery_id)
    .eq("user_id", user_id)
    .eq("is_active", false)
    .order("started_at", { ascending: false })
    .limit(20) as any;

  return (
    <CustomerProfileClient
      profile={customerProfile}
      breweryId={brewery_id}
      recentSessions={((recentSessions as any[]) ?? []).map((s: any) => ({
        id: s.id,
        started_at: s.started_at,
        ended_at: s.ended_at,
        beers: ((s.beer_logs as any[]) ?? []).map((l: any) => ({
          name: l.beer?.name ?? "Unknown",
          style: l.beer?.style ?? "",
          rating: l.rating ?? 0,
          quantity: l.quantity ?? 1,
        })),
      }))}
    />
  );
}
