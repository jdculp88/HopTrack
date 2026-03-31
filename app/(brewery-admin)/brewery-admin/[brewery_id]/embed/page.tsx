import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { EmbedConfigClient } from "./EmbedConfigClient";

interface Props {
  params: Promise<{ brewery_id: string }>;
}

export default async function EmbedPage({ params }: Props) {
  const { brewery_id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

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
