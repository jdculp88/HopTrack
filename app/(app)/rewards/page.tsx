import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RewardsClient } from "./RewardsClient";

export const metadata = { title: "My Rewards" };

export default async function RewardsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const now = new Date();
  const nowISO = now.toISOString();

  const [
    { data: codes },
    { data: loyaltyCards },
    { data: followedBreweryIds },
  ] = await Promise.all([
    supabase
      .from("redemption_codes")
      .select("*, brewery:breweries(id, name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50) as any,

    supabase
      .from("loyalty_cards")
      .select("*, program:loyalty_programs(id, stamps_required, reward_description, is_active), brewery:breweries(id, name)")
      .eq("user_id", user.id) as any,

    supabase
      .from("brewery_follows")
      .select("brewery_id")
      .eq("user_id", user.id) as any,
  ]);

  // Active promotions from followed breweries
  const breweryIds = (followedBreweryIds ?? []).map((f: any) => f.brewery_id);
  let promotions: any[] = [];
  if (breweryIds.length > 0) {
    const { data } = await supabase
      .from("promotions")
      .select("*, brewery:breweries(id, name)")
      .in("brewery_id", breweryIds)
      .eq("is_active", true)
      .lte("starts_at", nowISO)
      .gte("ends_at", nowISO)
      .order("ends_at", { ascending: true })
      .limit(20) as any;
    promotions = data ?? [];
  }

  const allCodes = (codes ?? []) as any[];
  const activeCodes = allCodes.filter(
    (c: any) => c.status === "pending" && new Date(c.expires_at) > now
  );
  const history = allCodes.filter(
    (c: any) => c.status !== "pending" || new Date(c.expires_at) <= now
  );
  const activeCards = ((loyaltyCards ?? []) as any[]).filter(
    (c: any) => c.program?.is_active
  );

  return (
    <RewardsClient
      activeCodes={activeCodes}
      history={history}
      loyaltyCards={activeCards}
      promotions={promotions}
    />
  );
}
