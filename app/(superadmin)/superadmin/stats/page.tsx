import { createClient } from "@/lib/supabase/server";
import { BarChart2, Users, Beer, Building2, CheckCheck, TrendingUp } from "lucide-react";

export const metadata = { title: "Platform Stats" };

export default async function PlatformStatsPage() {
  const supabase = await createClient();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalUsers },
    { count: totalBreweries },
    { count: totalBeers },
    { count: totalCheckins },
    { count: checkinsLast30 },
    { count: checkinsLast7 },
    { count: newUsersLast30 },
    { count: verifiedBreweries },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }) as any,
    supabase.from("breweries").select("id", { count: "exact", head: true }) as any,
    supabase.from("beers").select("id", { count: "exact", head: true }) as any,
    supabase.from("checkins").select("id", { count: "exact", head: true }) as any,
    supabase.from("checkins").select("id", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo) as any,
    supabase.from("checkins").select("id", { count: "exact", head: true }).gte("created_at", sevenDaysAgo) as any,
    supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo) as any,
    supabase.from("brewery_accounts").select("id", { count: "exact", head: true }).eq("verified", true) as any,
  ]);

  // Top breweries by check-ins
  const { data: topBreweriesRaw } = await supabase
    .from("checkins")
    .select("brewery_id, brewery:breweries(name, city, state)")
    .order("created_at", { ascending: false })
    .limit(500) as any;

  const breweryCheckMap: Record<string, { name: string; city: string; count: number }> = {};
  for (const c of (topBreweriesRaw ?? []) as any[]) {
    if (!c.brewery_id) continue;
    if (!breweryCheckMap[c.brewery_id]) {
      breweryCheckMap[c.brewery_id] = {
        name: c.brewery?.name ?? "Unknown",
        city: [c.brewery?.city, c.brewery?.state].filter(Boolean).join(", "),
        count: 0,
      };
    }
    breweryCheckMap[c.brewery_id].count++;
  }
  const topBreweries = Object.entries(breweryCheckMap)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10);

  // Top beers by check-ins
  const { data: topBeersRaw } = await supabase
    .from("checkins")
    .select("beer_id, beer:beers(name, style)")
    .not("beer_id", "is", null)
    .limit(500) as any;

  const beerCheckMap: Record<string, { name: string; style: string; count: number }> = {};
  for (const c of (topBeersRaw ?? []) as any[]) {
    if (!c.beer_id) continue;
    if (!beerCheckMap[c.beer_id]) {
      beerCheckMap[c.beer_id] = {
        name: c.beer?.name ?? "Unknown",
        style: c.beer?.style ?? "",
        count: 0,
      };
    }
    beerCheckMap[c.beer_id].count++;
  }
  const topBeers = Object.entries(beerCheckMap)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10);

  const STAT_CARDS = [
    { label: "Total Users", value: (totalUsers ?? 0).toLocaleString(), icon: Users, sub: `+${newUsersLast30 ?? 0} last 30 days` },
    { label: "Total Breweries", value: (totalBreweries ?? 0).toLocaleString(), icon: Building2, sub: `${verifiedBreweries ?? 0} verified` },
    { label: "Total Beers", value: (totalBeers ?? 0).toLocaleString(), icon: Beer, sub: "in database" },
    { label: "Total Check-ins", value: (totalCheckins ?? 0).toLocaleString(), icon: CheckCheck, sub: `${checkinsLast30 ?? 0} last 30 days` },
    { label: "Check-ins (7d)", value: (checkinsLast7 ?? 0).toLocaleString(), icon: TrendingUp, sub: "last 7 days" },
    { label: "Verified Breweries", value: (verifiedBreweries ?? 0).toLocaleString(), icon: Building2, sub: `of ${totalBreweries ?? 0} total` },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BarChart2 size={15} style={{ color: "var(--text-muted)" }} />
          <p className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Platform
          </p>
        </div>
        <h1 className="font-display text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Platform Stats
        </h1>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, sub }) => (
          <div
            key={label}
            className="rounded-xl border p-4 space-y-1"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
              <Icon size={13} />
              <span className="text-xs font-mono uppercase tracking-wider">{label}</span>
            </div>
            <p className="font-display text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              {value}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Breweries */}
        <div>
          <h2 className="text-xs font-mono uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
            Top Breweries by Check-ins
          </h2>
          <div
            className="rounded-xl border overflow-hidden"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            {topBreweries.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>No data yet</p>
            ) : (
              topBreweries.map(([id, b], i) => (
                <div
                  key={id}
                  className="flex items-center gap-3 px-4 py-3"
                  style={{ borderTop: i > 0 ? "1px solid var(--border)" : undefined }}
                >
                  <span className="text-xs font-mono w-5 text-right flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{b.name}</p>
                    {b.city && <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{b.city}</p>}
                  </div>
                  <span className="text-sm font-mono flex-shrink-0" style={{ color: "var(--accent-gold)" }}>
                    {b.count}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Beers */}
        <div>
          <h2 className="text-xs font-mono uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
            Top Beers by Check-ins
          </h2>
          <div
            className="rounded-xl border overflow-hidden"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            {topBeers.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>No data yet</p>
            ) : (
              topBeers.map(([id, b], i) => (
                <div
                  key={id}
                  className="flex items-center gap-3 px-4 py-3"
                  style={{ borderTop: i > 0 ? "1px solid var(--border)" : undefined }}
                >
                  <span className="text-xs font-mono w-5 text-right flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{b.name}</p>
                    {b.style && <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{b.style}</p>}
                  </div>
                  <span className="text-sm font-mono flex-shrink-0" style={{ color: "var(--accent-gold)" }}>
                    {b.count}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
