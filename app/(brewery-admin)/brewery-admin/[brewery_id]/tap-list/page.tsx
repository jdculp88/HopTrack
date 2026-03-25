import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
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
  if (!account) notFound();

  const { data: beers } = await supabase
    .from("beers").select("*")
    .eq("brewery_id", brewery_id)
    .order("is_on_tap", { ascending: false })
    .order("name") as any;

  return <TapListClient breweryId={brewery_id} initialBeers={(beers as any[]) ?? []} />;
}
