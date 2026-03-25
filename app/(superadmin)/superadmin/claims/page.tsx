import { createClient } from "@/lib/supabase/server";
import { ClaimsClient } from "./ClaimsClient";

export const metadata = { title: "Claims Queue" };

export default async function ClaimsQueuePage() {
  const supabase = await createClient();

  const { data: claims } = (await supabase
    .from("brewery_claims")
    .select(
      `
      *,
      brewery:breweries(id, name, city, state),
      claimant:profiles!brewery_claims_user_id_fkey(id, display_name, username),
      account:brewery_accounts!inner(role)
    `
    )
    .order("created_at", { ascending: false })) as any;

  // Flatten account.role onto each claim for the client component
  const flatClaims = ((claims as any[]) ?? []).map((c: any) => ({
    ...c,
    role: c.account?.role ?? "owner",
  }));

  return <ClaimsClient initialClaims={flatClaims} />;
}
