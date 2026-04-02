import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { BrandSettingsClient } from "./BrandSettingsClient";
import { verifyBrandAccess } from "@/lib/brand-auth";

export const metadata = { title: "Brand Settings" };

export default async function BrandSettingsPage({ params }: { params: Promise<{ brand_id: string }> }) {
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
    .select("*")
    .eq("id", brand_id)
    .single() as any);

  if (!brand) notFound();

  // Fetch locations
  const { data: locations } = await (supabase
    .from("breweries")
    .select("id, name, city, state, cover_image_url")
    .eq("brand_id", brand_id)
    .order("name") as any);

  return (
    <BrandSettingsClient
      brand={brand as any}
      locations={(locations as any) ?? []}
      userRole={brandRole as any}
      userId={user.id}
    />
  );
}
