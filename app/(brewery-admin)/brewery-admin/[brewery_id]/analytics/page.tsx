import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { AnalyticsClient } from "./AnalyticsClient";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage({ params }: { params: Promise<{ brewery_id: string }> }) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: account } = await supabase
    .from("brewery_accounts").select("role")
    .eq("user_id", user.id).eq("brewery_id", brewery_id).single() as any;
  if (!account) notFound();

  // Get all check-ins for this brewery (last 90 days)
  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const { data: checkins } = await supabase
    .from("checkins")
    .select("id, created_at, rating, beer_id, beer:beers(name, style)")
    .eq("brewery_id", brewery_id)
    .gte("created_at", since)
    .order("created_at") as any;

  return <AnalyticsClient breweryId={brewery_id} checkins={(checkins as any[]) ?? []} />;
}
