import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ClaimBreweryClient } from "./ClaimBreweryClient";

export const metadata = { title: "Claim Your Brewery | HopTrack" };

export default async function ClaimBreweryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // If the user already has a verified brewery account, send them to the dashboard
  const { data: existing } = (await supabase
    .from("brewery_accounts")
    .select("brewery_id")
    .eq("user_id", user.id)
    .eq("verified", true)
    .limit(1)) as any;

  const firstId = (existing as any[])?.[0]?.brewery_id;
  if (firstId) redirect(`/brewery-admin/${firstId}`);

  // Check for a pending claim so we can show status instead of search form
  const { data: pendingClaimRaw } = (await supabase
    .from("brewery_claims")
    .select("id, status, created_at, brewery:breweries(name, city, state)")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)) as any;

  const pendingClaim = (pendingClaimRaw as any[])?.[0] ?? null;

  return (
    <ClaimBreweryClient
      userEmail={user.email ?? ""}
      pendingClaim={pendingClaim}
    />
  );
}
