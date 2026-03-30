import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PromotionsClient } from "./PromotionsClient";

export const metadata = { title: "Promotions — HopTrack" };

export default async function PromotionsPage({ params }: { params: Promise<{ brewery_id: string }> }) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify admin access
  const { data: account } = await (supabase as any)
    .from("brewery_accounts")
    .select("id")
    .eq("brewery_id", brewery_id)
    .eq("user_id", user.id)
    .single();

  if (!account) redirect(`/brewery-admin/${brewery_id}`);

  const { data: brewery } = await (supabase as any)
    .from("breweries")
    .select("id, name, hop_route_eligible, hop_route_offer, vibe_tags")
    .eq("id", brewery_id)
    .single();

  return <PromotionsClient brewery={brewery} />;
}
