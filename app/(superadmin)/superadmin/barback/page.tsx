import { createServiceClient } from "@/lib/supabase/service";
import { BarbackClient } from "./BarbackClient";

export const metadata = { title: "Barback — Beer Review Queue" };

export default async function BarbackPage() {
  const supabase = createServiceClient();

  const [
    { count: totalSources },
    { count: enabledSources },
    { count: pendingCount },
    { count: promotedCount },
    { data: costData },
    { data: lastCrawlRow },
    { data: recentJobs },
    { data: pendingBeers },
  ] = await Promise.all([
    supabase
      .from("crawl_sources")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("crawl_sources")
      .select("id", { count: "exact", head: true })
      .eq("crawl_enabled", true),
    supabase
      .from("crawled_beers")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("crawled_beers")
      .select("id", { count: "exact", head: true })
      .eq("status", "promoted"),
    supabase
      .from("crawl_jobs")
      .select("cost_usd"),
    supabase
      .from("crawl_jobs")
      .select("completed_at")
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })
      .limit(1),
    supabase
      .from("crawl_jobs")
      .select("*, brewery:breweries(name, city, state)")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("crawled_beers")
      .select("*, brewery:breweries(name, city, state)")
      .eq("status", "pending")
      .order("confidence", { ascending: false }),
  ]);

  const totalCost = (costData ?? []).reduce(
    (sum: number, row: any) => sum + (Number(row.cost_usd) || 0),
    0
  );

  const lastCrawlDate = lastCrawlRow?.[0]?.completed_at ?? null;

  return (
    <BarbackClient
      stats={{
        totalSources: totalSources ?? 0,
        enabledSources: enabledSources ?? 0,
        pendingCount: pendingCount ?? 0,
        promotedCount: promotedCount ?? 0,
        totalCost,
        lastCrawlDate,
      }}
      initialJobs={(recentJobs as any[]) ?? []}
      initialPending={(pendingBeers as any[]) ?? []}
    />
  );
}
