import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ExploreClient } from "./ExploreClient";
import { SkeletonCard } from "@/components/ui/SkeletonLoader";

export const metadata = { title: "Explore" };

export default async function ExplorePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch breweries for the list view (initial load)
  const { data: breweriesRaw } = await supabase
    .from("breweries")
    .select("*")
    .not("latitude", "is", null)
    .limit(50);
  const breweries = breweriesRaw as any[];

  // User's visited brewery IDs
  const { data: visits } = await supabase
    .from("brewery_visits")
    .select("brewery_id")
    .eq("user_id", user.id);

  const visitedIds = new Set((visits as any[] ?? []).map((v: any) => v.brewery_id));

  // Brewery IDs that have a Beer of the Week (is_featured = true)
  const { data: featuredBeers } = await supabase
    .from("beers")
    .select("brewery_id")
    .eq("is_featured", true)
    .eq("is_active", true);

  const botwBreweryIds = [...new Set((featuredBeers ?? []).map((b: any) => b.brewery_id))] as string[];

  // Brewery IDs with upcoming events
  const today = new Date().toISOString().split("T")[0];
  const { data: upcomingEventBreweries } = await supabase
    .from("brewery_events")
    .select("brewery_id")
    .eq("is_active", true)
    .gte("event_date", today);

  const eventBreweryIds = [...new Set((upcomingEventBreweries ?? []).map((e: any) => e.brewery_id))] as string[];

  // Follower counts per brewery
  const { data: followCounts } = await supabase
    .from("brewery_follows")
    .select("brewery_id");

  const followerCountMap: Record<string, number> = {};
  for (const f of (followCounts ?? []) as any[]) {
    followerCountMap[f.brewery_id] = (followerCountMap[f.brewery_id] ?? 0) + 1;
  }

  // Recently visited breweries (from user's sessions, last 10 unique)
  const { data: recentSessions } = await supabase
    .from("sessions")
    .select("brewery_id, started_at")
    .eq("user_id", user.id)
    .not("brewery_id", "is", null)
    .order("started_at", { ascending: false })
    .limit(50);

  const recentBreweryIds: string[] = [];
  const seenRecent = new Set<string>();
  for (const s of (recentSessions ?? []) as any[]) {
    if (s.brewery_id && !seenRecent.has(s.brewery_id)) {
      seenRecent.add(s.brewery_id);
      recentBreweryIds.push(s.brewery_id);
      if (recentBreweryIds.length >= 10) break;
    }
  }

  return (
    <Suspense fallback={<div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({length:6}).map((_,i)=><SkeletonCard key={i}/>)}</div>}>
      <ExploreClient
        breweries={(breweries ?? []).map((b) => ({
          ...b,
          user_visit: visitedIds.has(b.id) ? { brewery_id: b.id } : undefined,
        }))}
        hasBeerOfTheWeek={botwBreweryIds}
        hasUpcomingEvents={eventBreweryIds}
        followerCounts={followerCountMap}
        recentBreweryIds={recentBreweryIds}
      />
    </Suspense>
  );
}
