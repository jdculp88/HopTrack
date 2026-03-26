import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Beer, Users, Star, TrendingUp, Award, Calendar, ArrowUpRight, List } from "lucide-react";
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
    { data: recentCheckins },
    { data: loyaltyProgram },
    { data: promotions },
    { data: allCheckinStats },
    { data: topBeers },
  ] = await Promise.all([
    supabase.from("breweries").select("*").eq("id", brewery_id).single() as any,

    supabase.from("beers").select("*").eq("brewery_id", brewery_id) as any,

    // Recent 10 for feed display
    supabase
      .from("checkins")
      .select("*, profile:profiles(display_name, username, avatar_url), beer:beers(name, style)")
      .eq("brewery_id", brewery_id)
      .order("created_at", { ascending: false })
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

    // All checkins for aggregate stats (no limit)
    supabase
      .from("checkins")
      .select("id, user_id, rating, created_at")
      .eq("brewery_id", brewery_id) as any,

    // Top beers by check-in count
    supabase
      .from("checkins")
      .select("beer_id, beer:beers(name, style), rating")
      .eq("brewery_id", brewery_id)
      .not("beer_id", "is", null) as any,
  ]);

  // ── Compute stats from full dataset ─────────────────────────────────────────
  const allCheckins = (allCheckinStats as any[]) ?? [];
  const totalCheckins = allCheckins.length;
  const uniqueVisitors = new Set(allCheckins.map((c: any) => c.user_id)).size;
  const ratings = allCheckins.filter((c: any) => c.rating > 0).map((c: any) => c.rating);
  const avgRating = ratings.length > 0
    ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1)
    : null;

  // This month vs last month
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thisMonthCheckins = allCheckins.filter((c: any) => new Date(c.created_at) >= thisMonthStart).length;
  const lastMonthCheckins = allCheckins.filter((c: any) => {
    const d = new Date(c.created_at);
    return d >= lastMonthStart && d < thisMonthStart;
  }).length;
  const monthTrend = lastMonthCheckins > 0
    ? Math.round(((thisMonthCheckins - lastMonthCheckins) / lastMonthCheckins) * 100)
    : null;

  // Top 3 beers
  const beerMap: Record<string, { name: string; style: string; count: number; totalRating: number }> = {};
  ((topBeers as any[]) ?? []).forEach((c: any) => {
    if (!c.beer_id) return;
    if (!beerMap[c.beer_id]) beerMap[c.beer_id] = { name: c.beer?.name ?? "Unknown", style: c.beer?.style ?? "", count: 0, totalRating: 0 };
    beerMap[c.beer_id].count++;
    if (c.rating > 0) beerMap[c.beer_id].totalRating += c.rating;
  });
  const topBeersList = Object.values(beerMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const onTapCount = ((beers as any[]) ?? []).filter((b: any) => b.is_on_tap).length;
  const totalBeers = ((beers as any[]) ?? []).length;

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
            label: "Total Check-ins",
            value: totalCheckins.toLocaleString(),
            icon: Beer,
            note: monthTrend !== null
              ? `${monthTrend >= 0 ? "+" : ""}${monthTrend}% vs last month`
              : "all time",
            positive: monthTrend !== null && monthTrend >= 0,
          },
          {
            label: "Unique Visitors",
            value: uniqueVisitors.toLocaleString(),
            icon: Users,
            note: `${thisMonthCheckins} visits this month`,
            positive: true,
          },
          {
            label: "Beers on Tap",
            value: `${onTapCount}/${totalBeers}`,
            icon: List,
            note: `${totalBeers - onTapCount} inactive`,
            positive: true,
          },
          {
            label: "Avg Rating",
            value: avgRating ? `${avgRating} ★` : "—",
            icon: Star,
            note: `from ${ratings.length} rated check-ins`,
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

        {/* Recent Check-ins */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>Recent Check-ins</h2>
              <Link href={`/brewery-admin/${brewery_id}/analytics`}
                className="text-xs flex items-center gap-1 transition-opacity hover:opacity-70"
                style={{ color: "var(--color-accent-gold)" }}>
                View all <ArrowUpRight size={12} />
              </Link>
            </div>
            <div className="space-y-3">
              {((recentCheckins as any[]) ?? []).length === 0 ? (
                <div className="rounded-2xl p-8 text-center border" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
                  <p className="text-3xl mb-2">🍺</p>
                  <p className="font-display" style={{ color: "var(--color-text-primary)" }}>No check-ins yet</p>
                  <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>Share your HopTrack page to get started!</p>
                </div>
              ) : (
                ((recentCheckins as any[]) ?? []).map((c: any) => (
                  <div key={c.id} className="flex items-center gap-3 p-4 rounded-2xl border"
                    style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ background: "var(--color-surface-2)", color: "var(--color-text-secondary)" }}>
                      {(c.profile?.display_name ?? c.user_id?.slice(0, 1) ?? "?")[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--color-text-primary)" }}>
                        {c.profile?.display_name ?? "Guest"}
                      </p>
                      <p className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>
                        {c.beer?.name ?? "Brewery visit"}{c.beer?.style ? ` · ${c.beer.style}` : ""}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {c.rating > 0 && (
                        <p className="text-sm font-mono" style={{ color: "var(--color-accent-gold)" }}>★ {c.rating}</p>
                      )}
                      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                        {formatDateShort(c.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Beers */}
          {topBeersList.length > 0 && (
            <div>
              <h2 className="font-display text-lg font-bold mb-4" style={{ color: "var(--color-text-primary)" }}>Top Beers This Period</h2>
              <div className="space-y-3">
                {topBeersList.map((beer, i) => (
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
                        {beer.count} check-in{beer.count !== 1 ? "s" : ""}
                      </p>
                      {beer.totalRating > 0 && (
                        <p className="text-xs" style={{ color: "var(--color-accent-gold)" }}>
                          ★ {(beer.totalRating / beer.count).toFixed(1)} avg
                        </p>
                      )}
                    </div>
                  </div>
                ))}
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
