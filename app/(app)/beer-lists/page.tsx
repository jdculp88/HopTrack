import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BeerListsClient } from "./BeerListsClient";
import type { BeerList } from "@/types/database";

export const metadata = { title: "My Beer Lists" };

export default async function BeerListsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: lists } = await supabase
    .from("beer_lists")
    .select(
      "id, title, description, is_public, created_at, items:beer_list_items(id, beer_id, position, note, beer:beers(id, name, style, abv, avg_rating, cover_image_url, item_type, brewery:breweries(id, name)))"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <BeerListsClient
      userId={user.id}
      initialLists={(lists ?? []) as unknown as BeerList[]}
    />
  );
}
