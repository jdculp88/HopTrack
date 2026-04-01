import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { EmbedConfigClient } from "./EmbedConfigClient";

export const metadata = { title: "Embed Widget — HopTrack" };

interface Props {
  params: Promise<{ brewery_id: string }>;
}

export default async function EmbedPage({ params }: Props) {
  const { brewery_id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify brewery ownership
  const { data: account } = await supabase
    .from("brewery_accounts")
    .select("role")
    .eq("user_id", user.id)
    .eq("brewery_id", brewery_id)
    .maybeSingle() as any;

  // Also allow superadmins
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single() as any;

  if (!account && profile?.role !== "superadmin") redirect("/brewery-admin");

  const { data: brewery } = await (supabase as any)
    .from("breweries")
    .select("id, name, city, state")
    .eq("id", brewery_id)
    .maybeSingle();

  if (!brewery) redirect("/brewery-admin");

  return (
    <EmbedConfigClient
      breweryId={brewery.id}
      breweryName={brewery.name}
      breweryCity={brewery.city}
      breweryState={brewery.state}
    />
  );
}
