import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cacheLife, cacheTag } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyBrandAccessWithScope } from "@/lib/brand-auth";
import { buildBrandCustomerList, findRegularsAtOtherLocations } from "@/lib/brand-crm";
import { BrandCustomersClient } from "./BrandCustomersClient";

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

async function fetchCachedCustomersData(brandId: string, locationIds: string[]) {
  "use cache";
  cacheLife("hop-realtime");
  cacheTag(`brand-${brandId}`);

  const service = createServiceClient();

  // Fetch brand + locations
  const [{ data: brand }, { data: locations }] = await Promise.all([
    service.from("brewery_brands").select("id, name").eq("id", brandId).single() as any,
    service.from("breweries").select("id, name").eq("brand_id", brandId).order("name") as any,
  ]);

  if (!brand) return { brand: null, locations: [], customers: [], crossLocationCount: 0, regularsAtOtherLocations: [] };

  if (locationIds.length === 0) {
    return { brand, locations: locations ?? [], customers: [], crossLocationCount: 0, regularsAtOtherLocations: [] };
  }

  const locationMap = new Map((locations ?? []).map((l: any) => [l.id, l.name])) as Map<string, string>;

  // Fetch data in parallel
  const [
    { data: breweryVisits },
    { data: brandLoyaltyCards },
  ] = await Promise.all([
    service
      .from("brewery_visits")
      .select("user_id, brewery_id, total_visits, unique_beers_tried, first_visit_at, last_visit_at")
      .in("brewery_id", locationIds)
      .limit(50000) as any,
    service
      .from("brand_loyalty_cards")
      .select("user_id, stamps")
      .eq("brand_id", brandId)
      .limit(50000) as any,
  ]);

  // Get profiles for all unique users
  const userIds = [...new Set((breweryVisits ?? []).map((v: any) => v.user_id).filter(Boolean))];
  const { data: profiles } = userIds.length > 0
    ? await (service.from("profiles").select("id, display_name, username, avatar_url").in("id", userIds).limit(50000) as any)
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

  return { brand, locations: locations ?? [], customers, crossLocationCount, regularsAtOtherLocations };
}

export default async function BrandCustomersPage({ params }: { params: Promise<{ brand_id: string }> }) {
  const { brand_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const access = await verifyBrandAccessWithScope(supabase, brand_id, user.id);
  if (!access || !["owner", "brand_manager", "regional_manager"].includes(access.role)) redirect("/brewery-admin");

  // Resolve location scope for regional managers
  let scopedLocationIds: string[] = [];
  if (access.locationScope) {
    scopedLocationIds = access.locationScope;
  } else {
    // Fetch all location IDs for the brand
    const service = createServiceClient();
    const { data: locs } = await (service.from("breweries").select("id").eq("brand_id", brand_id).order("name") as any);
    scopedLocationIds = (locs ?? []).map((l: any) => l.id);
  }

  const cached = await fetchCachedCustomersData(brand_id, scopedLocationIds);

  if (!cached.brand) redirect("/brewery-admin");

  if (scopedLocationIds.length === 0) {
    return (
      <BrandCustomersClient
        brandId={brand_id}
        brandName={cached.brand.name}
        customers={[]}
        locations={[]}
        crossLocationCount={0}
        regularsAtOtherLocations={[]}
      />
    );
  }

  return (
    <BrandCustomersClient
      brandId={brand_id}
      brandName={cached.brand.name}
      customers={cached.customers}
      locations={cached.locations.filter((l: any) => scopedLocationIds.includes(l.id)).map((l: any) => ({ id: l.id, name: l.name }))}
      crossLocationCount={cached.crossLocationCount}
      regularsAtOtherLocations={cached.regularsAtOtherLocations}
    />
  );
}
