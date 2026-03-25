import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { LoyaltyClient } from "./LoyaltyClient";

export const metadata = { title: "Loyalty & Promotions" };

export default async function LoyaltyPage({ params }: { params: Promise<{ brewery_id: string }> }) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: account } = await supabase
    .from("brewery_accounts").select("role")
    .eq("user_id", user.id).eq("brewery_id", brewery_id).single() as any;
  if (!account) notFound();

  const { data: programs } = await supabase
    .from("loyalty_programs").select("*")
    .eq("brewery_id", brewery_id)
    .order("created_at", { ascending: false }) as any;

  const { data: promotions } = await supabase
    .from("promotions").select("*")
    .eq("brewery_id", brewery_id)
    .order("created_at", { ascending: false }) as any;

  const { data: beers } = await supabase
    .from("beers").select("id, name").eq("brewery_id", brewery_id).eq("is_on_tap", true) as any;

  return (
    <LoyaltyClient
      breweryId={brewery_id}
      initialPrograms={(programs as any[]) ?? []}
      initialPromotions={(promotions as any[]) ?? []}
      beers={(beers as any[]) ?? []}
    />
  );
}
