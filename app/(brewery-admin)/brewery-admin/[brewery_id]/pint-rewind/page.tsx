import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { PintRewindClient } from "./PintRewindClient";

export const metadata = { title: "Pint Rewind" };

export default async function PintRewindPage({ params }: { params: Promise<{ brewery_id: string }> }) {
  const { brewery_id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: account } = await (supabase as any)
    .from("brewery_accounts").select("role")
    .eq("user_id", user.id).eq("brewery_id", brewery_id).single();
  if (!account) notFound();

  const { data: brewery } = await (supabase as any)
    .from("breweries").select("name").eq("id", brewery_id).single();

  // Last 30 days
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: checkins30 } = await (supabase as any)
    .from("checkins")
    .select("id, created_at, rating, user_id, beer_id, beer:beers(name, style)")
    .eq("brewery_id", brewery_id)
    .gte("created_at", since30)
    .order("created_at") as any;

  // All-time
  const { data: checkinsAll } = await (supabase as any)
    .from("checkins")
    .select("id, created_at, rating, user_id, beer_id, beer:beers(name, style)")
    .eq("brewery_id", brewery_id)
    .order("created_at") as any;

  // Most loyal visitor (all-time) — user with most check-ins
  const visitorCounts: Record<string, number> = {};
  (checkinsAll ?? []).forEach((c: any) => {
    if (c.user_id) visitorCounts[c.user_id] = (visitorCounts[c.user_id] ?? 0) + 1;
  });
  const topVisitorId = Object.entries(visitorCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  let topVisitor = null;
  if (topVisitorId) {
    const { data: profile } = await (supabase as any)
      .from("profiles").select("username, avatar_url").eq("id", topVisitorId).single();
    topVisitor = profile ? { ...profile, count: visitorCounts[topVisitorId] } : null;
  }

  return (
    <PintRewindClient
      breweryName={brewery?.name ?? "Your Brewery"}
      checkins30={(checkins30 as any[]) ?? []}
      checkinsAll={(checkinsAll as any[]) ?? []}
      topVisitor={topVisitor}
    />
  );
}
