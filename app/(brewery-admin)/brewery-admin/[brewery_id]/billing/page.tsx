import { Suspense } from "react";
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
    .from("breweries")
    .select("id, name, created_at, subscription_tier, stripe_customer_id, trial_ends_at, brand_id")
    .eq("id", brewery_id)
    .single() as any;
  if (!brewery) notFound();

  // Check if this brewery is covered by a brand subscription
  let brandBilling: { id: string; name: string; subscription_tier: string } | null = null;
  if (brewery.brand_id) {
    const { data: brand } = await (supabase
      .from("brewery_brands")
      .select("id, name, subscription_tier")
      .eq("id", brewery.brand_id)
      .single() as any);

    if (brand && brand.subscription_tier !== "free") {
      brandBilling = brand;
    }
  }

  return (
    <Suspense fallback={<div className="p-6" />}>
      <BillingClient brewery={brewery as any} brandBilling={brandBilling as any} />
    </Suspense>
  );
}
