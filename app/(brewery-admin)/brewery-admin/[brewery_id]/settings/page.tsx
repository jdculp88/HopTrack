import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { BrewerySettingsClient } from "./BrewerySettingsClient";

export const metadata = { title: "Brewery Settings" };

export default async function BrewerySettingsPage({ params }: { params: Promise<{ brewery_id: string }> }) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: account } = await supabase
    .from("brewery_accounts").select("role")
    .eq("user_id", user.id).eq("brewery_id", brewery_id).single() as any;
  if (!account) notFound();

  const { data: brewery } = await supabase
    .from("breweries").select("*").eq("id", brewery_id).single() as any;

  return <BrewerySettingsClient brewery={brewery as any} role={(account as any).role} />;
}
