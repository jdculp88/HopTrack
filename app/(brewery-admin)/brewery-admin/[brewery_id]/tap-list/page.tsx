import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TapListClient } from "./TapListClient";

export const metadata = { title: "Tap List" };

export default async function TapListPage({ params }: { params: Promise<{ brewery_id: string }> }) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: account } = await supabase
    .from("brewery_accounts").select("role")
    .eq("user_id", user.id).eq("brewery_id", brewery_id).single() as any;
  if (!account) redirect("/brewery-admin");

  const [{ data: beers }, { data: brewery }] = await Promise.all([
    supabase
      .from("beers").select("*")
      .eq("brewery_id", brewery_id)
      .order("display_order", { ascending: true })
      .order("name") as any,
    supabase
      .from("breweries").select("brand_id")
      .eq("id", brewery_id)
      .single() as any,
  ]);

  return <TapListClient breweryId={brewery_id} initialBeers={(beers as any[]) ?? []} brandId={brewery?.brand_id ?? null} />;
}
