import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { BrandBillingClient } from "./BrandBillingClient";
import { verifyBrandAccess } from "@/lib/brand-auth";

export const metadata = { title: "Brand Billing" };

export default async function BrandBillingPage({ params }: { params: Promise<{ brand_id: string }> }) {
  const { brand_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify brand membership (shared utility — handles RLS fallback)
  const brandRole = await verifyBrandAccess(supabase, brand_id, user.id);
  if (!brandRole) redirect("/brewery-admin");

  // Fetch brand with billing fields
  const { data: brand } = await (supabase
    .from("brewery_brands")
    .select("id, name, slug, subscription_tier, stripe_customer_id, trial_ends_at, billing_email, created_at, owner_id")
    .eq("id", brand_id)
    .single() as any);

  if (!brand) notFound();

  // Fetch locations
  const { data: locations } = await (supabase
    .from("breweries")
    .select("id, name, city, state, subscription_tier")
    .eq("brand_id", brand_id)
    .order("name") as any);

  return (
    <BrandBillingClient
      brand={brand as any}
      locations={(locations as any) ?? []}
      userRole={brandRole as any}
    />
  );
}
