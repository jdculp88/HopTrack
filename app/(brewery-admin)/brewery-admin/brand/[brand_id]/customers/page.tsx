import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { verifyBrandAccessWithScope } from "@/lib/brand-auth";
import { buildBrandCustomerList, findRegularsAtOtherLocations } from "@/lib/brand-crm";
import { BrandCustomersClient } from "./BrandCustomersClient";

export const revalidate = 30;

export async function generateMetadata({ params }: { params: Promise<{ brand_id: string }> }) {
  const { brand_id } = await params;
  const supabase = await createClient();
  const { data } = await (supabase
    .from("brewery_brands")
    .select("name")
    .eq("id", brand_id)
    .single() as any);
  return { title: `${data?.name ?? "Brand"} Customers — HopTrack` };
}

export default async function BrandCustomersPage({ params }: { params: Promise<{ brand_id: string }> }) {
  const { brand_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const access = await verifyBrandAccessWithScope(supabase, brand_id, user.id);
  if (!access || !["owner", "brand_manager", "regional_manager"].includes(access.role)) redirect("/brewery-admin");

  // Fetch brand + locations
  const [{ data: brand }, { data: locations }] = await Promise.all([
    supabase.from("brewery_brands").select("id, name").eq("id", brand_id).single() as any,
    supabase.from("breweries").select("id, name").eq("brand_id", brand_id).order("name") as any,
  ]);

  if (!brand) redirect("/brewery-admin");

  let locationIds = (locations ?? []).map((l: any) => l.id);

  // Apply location_scope for regional managers
  if (access.locationScope) {
    const scopeSet = new Set(access.locationScope);
    locationIds = locationIds.filter((id: string) => scopeSet.has(id));
  }

  if (locationIds.length === 0) {
    return (
      <BrandCustomersClient
        brandId={brand_id}
        brandName={brand.name}
        customers={[]}
        locations={[]}
        crossLocationCount={0}
        regularsAtOtherLocations={[]}
      />
    );
  }

  const locationMap = new Map((locations ?? []).map((l: any) => [l.id, l.name])) as Map<string, string>;

  // Fetch data in parallel
  const [
    { data: breweryVisits },
    { data: brandLoyaltyCards },
  ] = await Promise.all([
    supabase
      .from("brewery_visits")
      .select("user_id, brewery_id, total_visits, unique_beers_tried, first_visit_at, last_visit_at")
      .in("brewery_id", locationIds)
      .limit(50000) as any,
    supabase
      .from("brand_loyalty_cards")
      .select("user_id, stamps")
      .eq("brand_id", brand_id)
      .limit(50000) as any,
  ]);

  // Get profiles for all unique users
  const userIds = [...new Set((breweryVisits ?? []).map((v: any) => v.user_id).filter(Boolean))];
  const { data: profiles } = userIds.length > 0
    ? await (supabase.from("profiles").select("id, display_name, username, avatar_url").in("id", userIds).limit(50000) as any)
    : { data: [] };

  const customers = buildBrandCustomerList(
    breweryVisits ?? [],
    profiles ?? [],
    locationMap,
    brandLoyaltyCards ?? []
  );

  const regularsAtOtherLocations = findRegularsAtOtherLocations(
    breweryVisits ?? [],
    profiles ?? [],
    locationIds,
    locationMap
  ).slice(0, 5);

  const crossLocationCount = customers.filter((c) => c.isCrossLocation).length;

  return (
    <BrandCustomersClient
      brandId={brand_id}
      brandName={brand.name}
      customers={customers}
      locations={(locations ?? []).filter((l: any) => locationIds.includes(l.id)).map((l: any) => ({ id: l.id, name: l.name }))}
      crossLocationCount={crossLocationCount}
      regularsAtOtherLocations={regularsAtOtherLocations}
    />
  );
}
