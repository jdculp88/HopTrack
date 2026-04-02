import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { BrandTeamClient } from "./BrandTeamClient";
import { verifyBrandAccess } from "@/lib/brand-auth";

export const metadata = { title: "Brand Team" };

export default async function BrandTeamPage({ params }: { params: Promise<{ brand_id: string }> }) {
  const { brand_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify brand membership (shared utility — handles RLS fallback)
  const brandRole = await verifyBrandAccess(supabase, brand_id, user.id);
  if (!brandRole) redirect("/brewery-admin");

  // Fetch brand
  const { data: brand } = await (supabase
    .from("brewery_brands")
    .select("id, name")
    .eq("id", brand_id)
    .single() as any);

  if (!brand) notFound();

  // Fetch locations
  const { data: locations } = await (supabase
    .from("breweries")
    .select("id, name, city, state")
    .eq("brand_id", brand_id)
    .order("name") as any);

  return (
    <BrandTeamClient
      brandId={brand_id}
      brandName={(brand as any).name}
      locations={(locations as any) ?? []}
      userRole={brandRole as any}
      userId={user.id}
    />
  );
}
