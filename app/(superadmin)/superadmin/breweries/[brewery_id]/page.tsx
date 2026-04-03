import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { redirect, notFound } from "next/navigation";
import { fetchBreweryDetail } from "@/lib/superadmin-brewery";
import { BreweryDetailClient } from "./BreweryDetailClient";

export async function generateMetadata({ params }: { params: Promise<{ brewery_id: string }> }) {
  const { brewery_id } = await params;
  const service = createServiceClient();
  const { data } = await service.from("breweries").select("name").eq("id", brewery_id).single() as any;
  return { title: `${data?.name ?? "Brewery"} — Superadmin` };
}

export default async function BreweryDetailPage({ params }: { params: Promise<{ brewery_id: string }> }) {
  const { brewery_id } = await params;

  // Auth check (layout already does this, but defense in depth)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_superadmin")
    .eq("id", user.id)
    .single() as any;

  if (!profile?.is_superadmin) redirect("/home");

  const service = createServiceClient();
  const data = await fetchBreweryDetail(service, brewery_id);

  if (!data) notFound();

  return <BreweryDetailClient data={data} />;
}
