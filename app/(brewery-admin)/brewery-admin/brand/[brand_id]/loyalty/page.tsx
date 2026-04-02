import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { verifyBrandAccess } from "@/lib/brand-auth";
import { BrandLoyaltyClient } from "./BrandLoyaltyClient";

export const metadata = { title: "Brand Loyalty" };

export default async function BrandLoyaltyPage({ params }: { params: Promise<{ brand_id: string }> }) {
  const { brand_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const brandRole = await verifyBrandAccess(supabase, brand_id, user.id);
  if (!brandRole) redirect("/brewery-admin");

  // Fetch brand with tier
  const { data: brand } = await (supabase
    .from("brewery_brands")
    .select("id, name, subscription_tier")
    .eq("id", brand_id)
    .single() as any);

  if (!brand) notFound();

  // Tier gate — requires cask or barrel
  const tier = (brand as any).subscription_tier ?? "free";
  const hasAccess = tier === "cask" || tier === "barrel";

  return (
    <BrandLoyaltyClient
      brandId={brand_id}
      brandName={(brand as any).name}
      tier={tier}
      hasAccess={hasAccess}
    />
  );
}
