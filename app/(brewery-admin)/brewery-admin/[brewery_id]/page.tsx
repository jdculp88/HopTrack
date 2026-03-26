import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Beer, Users, Star, TrendingUp, Award, Calendar, ArrowUpRight, List, Clock } from "lucide-react";
import { formatDateShort } from "@/lib/dates";

export async function generateMetadata({ params }: { params: Promise<{ brewery_id: string }> }) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("breweries").select("name").eq("id", brewery_id).single();
  return { title: `${(data as any)?.name ?? "Brewery"} Dashboard — HopTrack` };
}

export default async function BreweryDashboardPage({ params }: { params: Promise<{ brewery_id: string }> }) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify access
  const { data: account } = await supabase
    .from("brewery_accounts")
    .select("role, verified")
    .eq("user_id", user.id)
    .eq("brewery_id", brewery_id)
    .single() as any;
  if (!account) notFound();

  // Fetch all data in parallel
  const [
    { data: brewery },
    { data: beers },
    { data: recentSessions },
    { data: loyaltyProgram },
    { data: promotions },
    { data: allSessions },
    { data: allBeerLogs },
  ] = await Promise.all([
    supabase.from("breweries").select("*").eq("id", brewery_id).single() as any,

    supabase.from("beers").select("*").eq("brewery_id", brewery_id) as any,

    // Recent 10 sessions with beer logs for feed display
    supabase
      .from("sessions")
      .select("*, profile:profiles(display_name, username, avatar_url), beer_logs(id, beer_id, rating, quantity, beer:beers(name, style))")
      .eq("brewery_id", brewery_id)
      .eq("is_active", false)
      .order("started_at", { ascending: false })
      .limit(10) as any,

    supabase
      .from("loyalty_programs")
      .select("*, loyalty_cards(count)")
      .eq("brewery_id", brewery_id)
      .eq("is_active", true)
      .single() as any,

    supabase
      .from("promotions")
      .select("*")
      .eq("brewery_id", brewery_id)
      .eq("is_active", true) as any,

    // All sessions for aggregate stats
    supabase
      .from("sessions")
      .select("id, user_id, started_at, ended_at, is_active")
      .eq("brewery_id", brewery_id)
      .eq("is_active", false) as any,

    // All beer logs for rating + top beer stats
    supabase
      .from("beer_logs")
      .select("id, beer_id, rating, quantity, logged_at, beer:beers(name, style)")
      .eq("brewery_id", brewery_id) as any,
  ]);

  // ── Compute stats from sessions + beer_logs ────────────────────────────────
  const sessions = (allSessions as any[]) ?? [];
  const beerLogs = (allBeerLogs as any[]) ?? [];

  const totalVisits = sessions.length;
  const totalBeersLogged = beerLogs.reduce((sum: number, l: any) => sum + (l.quantity ?? 1), 0);
  const uniqueVisitors = new Set(sessions.map((s: any) => s.user_id)).size;
  const ratings = beerLogs.filter((l: any) => l.rating > 0).map((l: any) => l.rating);
  const avgRating = ratings.length > 0
    ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1)
    : null;

  // This month vs last month (by session visits)
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thisMonthVisits = sessions.filter((s: any) => new Date(s.started_at) >= thisMonthStart).length;
  const lastMonthVisits = sessions.filter((s: any) => {
    const d = new Date(s.started_at);
    return d >= lastMonthStart && d < thisMonthStart;
  }).length;
  const monthTrend = lastMonthVisits > 0
    ? Math.round(((thisMonthVisits - lastMonthVisits) / lastMonthVisits) * 100)
    : null;

  // Top 3 beers from beer_logs
  const beerMap: Record<string, { name: string; style: string; count: number; totalRating: number }> = {};
  beerLogs.forEach((l: any) => {
    if (!l.beer_id) return;
    if (!beerMap[l.beer_id]) beerMap[l.beer_id] = { name: l.beer?.name ?? "Unknown", style: l.beer?.style ?? "", count: 0, totalRating: 0 };
    beerMap[l.beer_id].count += l.quantity ?? 1;
    if (l.rating > 0) beerMap[l.beer_id].totalRating += l.rating;
  });
  const topBeersList = Object.values(beerMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const onTapCount = ((beers as any[]) ?? []).filter((b: any) => b.is_on_tap).length;
  const totalBeerCount = ((beers as any[]) ?? []).length;

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto pt-16 lg:pt-8">

      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-mono uppercase tracking-wider mb-1" style={{ color: "var(--color-accent-gold)" }}>
          {(account as any)?.role === "owner" ? "Owner" : "Manager"} · {(account as any)?.verified ? "Verified ✓" : "Pending Verification"}
        </p>
        <h1 className="font-display text-3xl lg:text-4xl font-bold" style={{ color: "var(--color-text-primary)" }}>
          {(brewery as any)?.name}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
          {(brewery as any)?.city}, {(brewery as any)?.state} · {(brewery as any)?.brewery_type?.replace(/_/g, " ")}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Total Visits",
            value: totalVisits.toLocaleString(),
            icon: Users,
            note: monthTrend !== null
              ? `${monthTrend >= 0 ? "+" : ""}${monthTrend}% vs last month`
              : `${thisMonthVisits} this month`,
            positive: monthTrend === null || monthTrend >= 0,
          },
          {
            label: "Beers Logged",
            value: totalBeersLogged.toLocaleString(),
            icon: Beer,
            note: `across ${totalVisits} visits`,
            positive: true,
          },
          {
            label: "Beers on Tap",
            value: `${onTapCount}/${totalBeerCount}`,
            icon: List,
            note: `${totalBeerCount - onTapCount} inactive`,
            positive: true,
          },
          {
            label: "Avg Rating",
            value: avgRating ? `${avgRating} ★` : "—",
            icon: Star,
            note: `from ${ratings.length} reviews`,
            positive: true,
          },
        ].map(({ label, value, icon: Icon, note, positive }) => (
          <div key={label} className="rounded-2xl p-5 border" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>{label}</p>
              <Icon size={16} style={{ color: "var(--color-accent-gold)" }} />
            </div>
            <p className="font-display text-3xl font-bold" style={{ color: "var(--color-text-primary)" }}>{value}</p>
            <p className="text-xs mt-1" style={{ color: positive ? "var(--color-text-muted)" : "#ef4444" }}>{note}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Recent Sessions */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>Recent Visits</h2>
              <Link href={`/brewery-admin/${brewery_id}/analytics`}
                className="text-xs flex items-center gap-1 transition-opacity hover:opacity-70"
                style={{ color: "var(--color-accent-gold)" }}>
                View all <ArrowUpRight size={12} />
              </Link>
            </div>
            <div className="space-y-3">
              {((recentSessions as any[]) ?? []).length === 0 ? (
                <div className="rounded-2xl p-8 text-center border" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
                  <p className="text-3xl mb-2">🍺</p>
                  <p className="font-display" style={{ color: "var(--color-text-primary)" }}>No visits yet</p>
                  <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>Share your HopTrack page to get started!</p>
                </div>
              ) : (
                ((recentSessions as any[]) ?? []).map((s: any) => {
                  const sessionBeerLogs = (s.beer_logs as any[]) ?? [];
                  const beerCount = sessionBeerLogs.reduce((sum: number, l: any) => sum + (l.quantity ?? 1), 0);
                  const sessionRatings = sessionBeerLogs.filter((l: any) => l.rating > 0);
                  const sessionAvg = sessionRatings.length > 0
                    ? (sessionRatings.reduce((a: number, l: any) => a + l.rating, 0) / sessionRatings.length).toFixed(1)
                    : null;
                  const topBeerName = sessionBeerLogs.length > 0
                    ? (sessionBeerLogs[0]?.beer?.name ?? "Unnamed Beer")
                    : null;

                  return (
                    <div key={s.id} className="flex items-center gap-3 p-4 rounded-2xl border"
                      style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{ background: "var(--color-surface-2)", color: "var(--color-text-secondary)" }}>
                        {(s.profile?.display_name ?? s.user_id?.slice(0, 1) ?? "?")[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: "var(--color-text-primary)" }}>
                          {s.profile?.display_name ?? "Guest"}
                        </p>
                        <p className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>
                          {beerCount > 0
                            ? `${beerCount} beer${beerCount !== 1 ? "s" : ""}${topBeerName ? ` · ${topBeerName}` : ""}`
                            : "Brewery visit"
                          }
                          {sessionBeerLogs.length > 1 && ` +${sessionBeerLogs.length - 1} more`}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {sessionAvg && (
                          <p className="text-sm font-mono" style={{ color: "var(--color-accent-gold)" }}>★ {sessionAvg}</p>
                        )}
                        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                          {formatDateShort(s.started_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Top Beers */}
          {topBeersList.length > 0 && (
            <div>
              <h2 className="font-display text-lg font-bold mb-4" style={{ color: "var(--color-text-primary)" }}>Top Beers</h2>
              <div className="space-y-3">
                {topBeersList.map((beer, i) => {
                  const ratedCount = beerLogs.filter((l: any) => l.beer_id && beerMap[l.beer_id]?.name === beer.name && l.rating > 0).length;
                  return (
                    <div key={beer.name} className="flex items-center gap-4 p-4 rounded-2xl border"
                      style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
                      <span className="font-display text-2xl font-bold w-8 flex-shrink-0"
                        style={{ color: i === 0 ? "#FFD700" : i === 1 ? "#C0C0C0" : "#CD7F32" }}>
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate" style={{ color: "var(--color-text-primary)" }}>{beer.name}</p>
                        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{beer.style}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-mono font-bold" style={{ color: "var(--color-text-primary)" }}>
                          {beer.count} pour{beer.count !== 1 ? "s" : ""}
                        </p>
                        {beer.totalRating > 0 && ratedCount > 0 && (
                          <p className="text-xs" style={{ color: "var(--color-accent-gold)" }}>
                            ★ {(beer.totalRating / ratedCount).toFixed(1)} avg
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">

          {/* Loyalty */}
          <div className="rounded-2xl p-5 border" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold" style={{ color: "var(--color-text-primary)" }}>Loyalty Program</h3>
              <Award size={16} style={{ color: "var(--color-accent-gold)" }} />
            </div>
            {loyaltyProgram ? (
              <>
                <p className="font-medium text-sm mb-1" style={{ color: "var(--color-text-primary)" }}>{(loyaltyProgram as any).name}</p>
                <p className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>
                  {(loyaltyProgram as any).stamps_required} stamps → {(loyaltyProgram as any).reward_description}
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Active</span>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm mb-3" style={{ color: "var(--color-text-muted)" }}>No loyalty program yet.</p>
                <Link href={`/brewery-admin/${brewery_id}/loyalty`}
                  className="text-xs font-medium" style={{ color: "var(--color-accent-gold)" }}>
                  + Create program →
                </Link>
              </>
            )}
          </div>

          {/* Active Promotions */}
          <div className="rounded-2xl p-5 border" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold" style={{ color: "var(--color-text-primary)" }}>Promotions</h3>
              <TrendingUp size={16} style={{ color: "var(--color-accent-gold)" }} />
            </div>
            {((promotions as any[]) ?? []).length > 0 ? (
              <div className="space-y-2">
                {((promotions as any[]) ?? []).map((p: any) => (
                  <div key={p.id} className="p-3 rounded-xl" style={{ background: "var(--color-surface-2)" }}>
                    <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{p.title}</p>
                    {p.ends_at && (
                      <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "var(--color-text-muted)" }}>
                        <Calendar size={10} />
                        Ends {formatDateShort(p.ends_at)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No active promotions.</p>
            )}
            <Link href={`/brewery-admin/${brewery_id}/loyalty`}
              className="text-xs font-medium mt-3 block" style={{ color: "var(--color-accent-gold)" }}>
              Manage promotions →
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl p-5 border" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
            <h3 className="font-display font-bold mb-3" style={{ color: "var(--color-text-primary)" }}>Quick Actions</h3>
            <div className="space-y-2">
              {[
                { href: `/brewery-admin/${brewery_id}/tap-list`, label: "Manage tap list" },
                { href: `/brewery-admin/${brewery_id}/analytics`, label: "View analytics" },
                { href: `/brewery-admin/${brewery_id}/loyalty`, label: "Loyalty & promotions" },
                { href: `/brewery-admin/${brewery_id}/pint-rewind`, label: "Pint Rewind" },
                { href: `/brewery-admin/${brewery_id}/settings`, label: "Edit brewery profile" },
                { href: `/brewery/${brewery_id}`, label: "View public page ↗", external: true },
              ].map(({ href, label, external }) => (
                <Link key={href} href={href} target={external ? "_blank" : undefined}
                  className="block text-sm py-1.5 transition-opacity hover:opacity-70"
                  style={{ color: "var(--color-text-secondary)" }}>
                  → {label}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
