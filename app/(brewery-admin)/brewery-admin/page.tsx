import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Redirect /brewery-admin to the first brewery
export default async function BreweryAdminIndexPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: accounts } = await supabase
    .from("brewery_accounts")
    .select("brewery_id")
    .eq("user_id", user.id)
    .eq("verified", true)
    .limit(1) as any;

  const firstId = (accounts as any[])?.[0]?.brewery_id;
  if (firstId) redirect(`/brewery-admin/${firstId}`);
  else redirect("/brewery-admin/claim");
}
