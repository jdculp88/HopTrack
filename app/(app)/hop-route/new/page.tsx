import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { HopRouteNewClient } from "./HopRouteNewClient";

export const metadata = { title: "Plan a HopRoute — HopTrack" };

export default async function HopRouteNewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Pre-load taste DNA for auto-population
  const { data: beerLogs } = await supabase
    .from("beer_logs")
    .select("rating, beer:beers(style)")
    .eq("user_id", user.id)
    .not("rating", "is", null)
    .order("logged_at", { ascending: false })
    .limit(100);

  const styleMap = new Map<string, { total: number; count: number }>();
  for (const log of beerLogs ?? []) {
    const style = (log.beer as any)?.style;
    if (!style || !log.rating) continue;
    const existing = styleMap.get(style) ?? { total: 0, count: 0 };
    styleMap.set(style, { total: existing.total + log.rating, count: existing.count + 1 });
  }

  const tasteDna = Array.from(styleMap.entries())
    .map(([style, { total, count }]) => ({ style, avg_rating: +(total / count).toFixed(2) }))
    .sort((a, b) => b.avg_rating - a.avg_rating)
    .slice(0, 8);

  return <HopRouteNewClient tasteDna={tasteDna} />;
}
