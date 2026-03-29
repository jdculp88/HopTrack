import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { BillingClient } from "./BillingClient";

export const metadata = { title: "Billing & Plans" };

export default async function BillingPage({ params }: { params: Promise<{ brewery_id: string }> }) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: account } = await supabase
    .from("brewery_accounts").select("role")
    .eq("user_id", user.id).eq("brewery_id", brewery_id).single() as any;
  if (!account) redirect("/brewery-admin");

  const { data: brewery } = await supabase
    .from("breweries").select("*").eq("id", brewery_id).single() as any;
  if (!brewery) notFound();

  return <BillingClient brewery={brewery as any} />;
}
