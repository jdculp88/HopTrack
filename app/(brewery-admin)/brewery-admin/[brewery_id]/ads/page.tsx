import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdsClient } from "./AdsClient";

export const metadata = { title: "Ad Campaigns" };

export default async function AdsPage({ params }: { params: Promise<{ brewery_id: string }> }) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: account } = await supabase
    .from("brewery_accounts")
    .select("role")
    .eq("user_id", user.id)
    .eq("brewery_id", brewery_id)
    .maybeSingle() as any;

  if (!account) redirect("/brewery-admin/claim");

  const { data: brewery } = await supabase
    .from("breweries")
    .select("subscription_tier")
    .eq("id", brewery_id)
    .single() as any;

  const { data: ads } = await supabase
    .from("brewery_ads")
    .select("*")
    .eq("brewery_id", brewery_id)
    .order("created_at", { ascending: false }) as any;

  return (
    <AdsClient
      breweryId={brewery_id}
      ads={ads ?? []}
      tier={brewery?.subscription_tier ?? "free"}
    />
  );
}
