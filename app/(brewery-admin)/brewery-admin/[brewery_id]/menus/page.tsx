import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MenusClient } from "./MenusClient";

export const metadata = { title: "Menus | HopTrack" };

export default async function MenusPage({ params }: { params: Promise<{ brewery_id: string }> }) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: account } = await supabase
    .from("brewery_accounts").select("role")
    .eq("user_id", user.id).eq("brewery_id", brewery_id).single() as any;
  if (!account) redirect("/brewery-admin");

  const { data: menus } = await (supabase
    .from("brewery_menus")
    .select("*")
    .eq("brewery_id", brewery_id)
    .order("display_order") as any);

  return <MenusClient breweryId={brewery_id} initialMenus={menus ?? []} />;
}
