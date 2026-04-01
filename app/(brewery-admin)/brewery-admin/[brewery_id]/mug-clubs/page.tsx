import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MugClubsClient } from "./MugClubsClient";

export const metadata = { title: "Mug Clubs" };

export default async function MugClubsPage({ params }: { params: Promise<{ brewery_id: string }> }) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: account } = await supabase
    .from("brewery_accounts").select("role")
    .eq("user_id", user.id).eq("brewery_id", brewery_id).single() as any;
  if (!account) redirect("/brewery-admin");

  // Fetch brewery tier for gating
  const { data: brewery } = await supabase
    .from("breweries").select("subscription_tier")
    .eq("id", brewery_id).single() as any;

  const tier = brewery?.subscription_tier ?? "free";

  // Fetch mug clubs with member counts
  const { data: clubs } = await supabase
    .from("mug_clubs")
    .select("*, member_count:mug_club_members(count)")
    .eq("brewery_id", brewery_id)
    .order("created_at", { ascending: false }) as any;

  const formatted = (clubs ?? []).map((c: any) => ({
    ...c,
    member_count: c.member_count?.[0]?.count ?? 0,
  }));

  return (
    <MugClubsClient
      breweryId={brewery_id}
      tier={tier}
      initialClubs={formatted}
    />
  );
}
