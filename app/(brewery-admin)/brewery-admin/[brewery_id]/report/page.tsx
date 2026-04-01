import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { ReportClient } from "./ReportClient";

export const metadata = { title: "HopTrack Report" };

export default async function ReportPage({ params }: { params: Promise<{ brewery_id: string }> }) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: account } = await supabase
    .from("brewery_accounts")
    .select("role")
    .eq("user_id", user.id)
    .eq("brewery_id", brewery_id)
    .single();
  if (!account) redirect("/brewery-admin");

  const { data: brewery } = await supabase
    .from("breweries")
    .select("id, name, city, state, cover_image_url")
    .eq("id", brewery_id)
    .single();
  if (!brewery) notFound();

  // Sessions — last 90 days
  // eslint-disable-next-line react-hooks/purity
  const since90 = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  // eslint-disable-next-line react-hooks/purity
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  // eslint-disable-next-line react-hooks/purity
  const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: sessions90 } = await supabase
    .from("sessions")
    .select("id, user_id, started_at, ended_at")
    .eq("brewery_id", brewery_id)
    .eq("is_active", false)
    .gte("started_at", since90);

  const { data: beerLogs90 } = await supabase
    .from("beer_logs")
    .select("id, beer_id, rating, quantity, logged_at, user_id, beer:beers(id, name, style)")
    .eq("brewery_id", brewery_id)
    .gte("logged_at", since90);

  // Top customers (by session count)
  const { data: topCustomerProfiles } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url")
    .in(
      "id",
      [...new Set((sessions90 ?? []).map((s: any) => s.user_id))].slice(0, 20)
    );

  // Compute metrics server-side
  const allSessions = sessions90 ?? [];
  const allLogs = beerLogs90 ?? [];

  const visits7 = allSessions.filter((s: any) => s.started_at >= since7).length;
  const visits30 = allSessions.filter((s: any) => s.started_at >= since30).length;
  const visits90 = allSessions.length;

  const uniqueVisitors90 = new Set(allSessions.map((s: any) => s.user_id)).size;
  const visitorCounts = new Map<string, number>();
  allSessions.forEach((s: any) => {
    visitorCounts.set(s.user_id, (visitorCounts.get(s.user_id) ?? 0) + 1);
  });
  const repeatVisitors = [...visitorCounts.values()].filter((c) => c >= 2).length;
  const repeatPct = uniqueVisitors90 > 0 ? Math.round((repeatVisitors / uniqueVisitors90) * 100) : 0;

  const ratedLogs = allLogs.filter((l: any) => l.rating != null);
  const avgRating =
    ratedLogs.length > 0
      ? Math.round((ratedLogs.reduce((s: number, l: any) => s + l.rating, 0) / ratedLogs.length) * 10) / 10
      : null;

  // Top beers by pours
  const beerPours = new Map<string, { name: string; style: string | null; pours: number; totalRating: number; ratingCount: number }>();
  allLogs.forEach((l: any) => {
    if (!l.beer_id) return;
    const entry = beerPours.get(l.beer_id) ?? { name: l.beer?.name ?? "Unknown", style: l.beer?.style ?? null, pours: 0, totalRating: 0, ratingCount: 0 };
    entry.pours += l.quantity ?? 1;
    if (l.rating != null) { entry.totalRating += l.rating; entry.ratingCount++; }
    beerPours.set(l.beer_id, entry);
  });
  const topBeers = [...beerPours.entries()]
    .sort((a, b) => b[1].pours - a[1].pours)
    .slice(0, 5)
    .map(([id, v]) => ({
      id,
      name: v.name,
      style: v.style,
      pours: v.pours,
      avgRating: v.ratingCount > 0 ? Math.round((v.totalRating / v.ratingCount) * 10) / 10 : null,
    }));

  // Peak hours (last 90 days)
  const hourCounts = new Array(24).fill(0);
  allSessions.forEach((s: any) => { hourCounts[new Date(s.started_at).getHours()]++; });

  // Top 3 customers by visit count
  const customerVisitCounts = [...visitorCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const profileMap = new Map((topCustomerProfiles ?? []).map((p: any) => [p.id, p]));
  const topCustomers = customerVisitCounts.map(([uid, count]) => ({
    profile: (profileMap.get(uid) as { id: string; username: string; display_name: string | null; avatar_url: string | null } | undefined) ?? null,
    visits: count,
  }));

  return (
    <ReportClient
      brewery={brewery}
      metrics={{ visits7, visits30, visits90, uniqueVisitors90, repeatPct, avgRating }}
      topBeers={topBeers}
      hourCounts={hourCounts}
      topCustomers={topCustomers}
      generatedAt={new Date().toISOString()}
    />
  );
}
