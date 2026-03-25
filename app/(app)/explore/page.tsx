import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ExploreClient } from "./ExploreClient";

export const metadata = { title: "Explore" };

export default async function ExplorePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch breweries for the list view (initial load)
  const { data: breweriesRaw } = await supabase
    .from("breweries")
    .select("*")
    .not("latitude", "is", null)
    .limit(50);
  const breweries = breweriesRaw as any[];

  // User's visited brewery IDs
  const { data: visits } = await supabase
    .from("brewery_visits")
    .select("brewery_id")
    .eq("user_id", user.id);

  const visitedIds = new Set((visits as any[] ?? []).map((v: any) => v.brewery_id));

  return (
    <ExploreClient
      breweries={(breweries ?? []).map((b) => ({
        ...b,
        user_visit: visitedIds.has(b.id) ? { brewery_id: b.id } : undefined,
      }))}
    />
  );
}
