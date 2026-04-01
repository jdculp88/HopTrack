import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ChallengesClient } from "./ChallengesClient";

export default async function ChallengesPage({
  params,
}: {
  params: Promise<{ brewery_id: string }>;
}) {
  const { brewery_id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: account } = await (supabase
    .from("brewery_accounts")
    .select("role, brewery:breweries(id, name, subscription_tier)")
    .eq("user_id", user.id)
    .eq("brewery_id", brewery_id)
    .in("role", ["owner", "manager"])
    .single() as any);

  if (!account) redirect("/brewery-admin");

  // Fetch challenges with participant counts
  const { data: challenges } = await (supabase
    .from("challenges")
    .select(`
      *,
      participant_count:challenge_participants(count),
      completed_count:challenge_participants(count)
    `)
    .eq("brewery_id", brewery_id)
    .order("created_at", { ascending: false }) as any);

  // Fetch tap list beers for the "specific_beers" challenge type picker
  const { data: beers } = await (supabase
    .from("beers")
    .select("id, name, style")
    .eq("brewery_id", brewery_id)
    .eq("is_on_tap", true)
    .order("name") as any);

  const formatted = (challenges ?? []).map((c: any) => ({
    ...c,
    participant_count: c.participant_count?.[0]?.count ?? 0,
    completed_count: c.completed_count?.[0]?.count ?? 0,
  }));

  const subscriptionTier = (account.brewery as any)?.subscription_tier ?? "free";

  return (
    <ChallengesClient
      breweryId={brewery_id}
      initialChallenges={formatted}
      tapListBeers={beers ?? []}
      subscriptionTier={subscriptionTier}
    />
  );
}
