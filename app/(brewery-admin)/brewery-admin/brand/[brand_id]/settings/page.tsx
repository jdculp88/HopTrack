import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { BrandSettingsClient } from "./BrandSettingsClient";

export const metadata = { title: "Brand Settings" };

export default async function BrandSettingsPage({ params }: { params: Promise<{ brand_id: string }> }) {
  const { brand_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify brand membership
  const { data: membership } = await (supabase
    .from("brand_accounts")
    .select("role")
    .eq("brand_id", brand_id)
    .eq("user_id", user.id)
    .maybeSingle() as any);

  if (!membership) redirect("/brewery-admin");

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
    .select("id, name, city, state, logo_url, cover_image_url")
    .eq("brand_id", brand_id)
    .order("name") as any);

  return (
    <BrandSettingsClient
      brand={brand as any}
      locations={(locations as any) ?? []}
      userRole={(membership as any).role}
      userId={user.id}
    />
  );
}
