import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PintRewindClient } from "./PintRewindClient";

export const metadata = { title: "Pint Rewind" };

export default async function PintRewindPage({ params }: { params: Promise<{ brewery_id: string }> }) {
  const { brewery_id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: account } = await supabase
    .from("brewery_accounts").select("role")
    .eq("user_id", user.id).eq("brewery_id", brewery_id).single();
  if (!account) redirect("/brewery-admin");

  const { data: brewery } = await supabase
    .from("breweries").select("name").eq("id", brewery_id).single();

  // Last 30 days — sessions
  // eslint-disable-next-line react-hooks/purity
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: sessions30 } = await supabase
    .from("sessions")
    .select("id, user_id, started_at, ended_at")
    .eq("brewery_id", brewery_id)
    .eq("is_active", false)
    .gte("started_at", since30)
    .order("started_at") as any;

  // Last 30 days — beer logs
  const { data: beerLogs30 } = await supabase
    .from("beer_logs")
    .select("id, beer_id, rating, quantity, logged_at, user_id, beer:beers(name, style)")
    .eq("brewery_id", brewery_id)
    .gte("logged_at", since30)
    .order("logged_at") as any;

  // All-time — sessions
  const { data: sessionsAll } = await supabase
    .from("sessions")
    .select("id, user_id, started_at, ended_at")
    .eq("brewery_id", brewery_id)
    .eq("is_active", false)
    .order("started_at") as any;

  // All-time — beer logs
  const { data: beerLogsAll } = await supabase
    .from("beer_logs")
    .select("id, beer_id, rating, quantity, logged_at, user_id, beer:beers(name, style)")
    .eq("brewery_id", brewery_id)
    .order("logged_at") as any;

  // Most loyal visitor (all-time) — user with most sessions
  const visitorCounts: Record<string, number> = {};
  ((sessionsAll as any[]) ?? []).forEach((s: any) => {
    if (s.user_id) visitorCounts[s.user_id] = (visitorCounts[s.user_id] ?? 0) + 1;
  });
  const topVisitorId = Object.entries(visitorCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  let topVisitor = null;
  if (topVisitorId) {
    const { data: profile } = await supabase
      .from("profiles").select("username, avatar_url").eq("id", topVisitorId).single();
    topVisitor = profile ? { ...profile, count: visitorCounts[topVisitorId] } : null;
  }

  return (
    <PintRewindClient
      breweryName={brewery?.name ?? "Your Brewery"}
      sessions30={(sessions30 as any[]) ?? []}
      beerLogs30={(beerLogs30 as any[]) ?? []}
      sessionsAll={(sessionsAll as any[]) ?? []}
      beerLogsAll={(beerLogsAll as any[]) ?? []}
      topVisitor={topVisitor}
    />
  );
}
