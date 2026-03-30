import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { BeerListDetailClient } from "./BeerListDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ listId: string }>;
}) {
  const { listId } = await params;
  const supabase = await createClient();
  const { data } = await (supabase as any)
    .from("beer_lists")
    .select("title")
    .eq("id", listId)
    .single();
  return { title: data?.title ?? "Beer List" };
}

export default async function BeerListDetailPage({
  params,
}: {
  params: Promise<{ listId: string }>;
}) {
  const { listId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: list } = await (supabase as any)
    .from("beer_lists")
    .select(
      "id, title, description, is_public, user_id, created_at, items:beer_list_items(id, beer_id, position, note, beer:beers(id, name, style, abv, avg_rating)), profile:profiles!user_id(id, username, display_name, avatar_url)"
    )
    .eq("id", listId)
    .single();

  if (!list) notFound();

  const isOwner = user.id === list.user_id;

  // Private lists only viewable by owner
  if (!list.is_public && !isOwner) notFound();

  return (
    <BeerListDetailClient
      list={list}
      isOwner={isOwner}
      currentUserId={user.id}
    />
  );
}
