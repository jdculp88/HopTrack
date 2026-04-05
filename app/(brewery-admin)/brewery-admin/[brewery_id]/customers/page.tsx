import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CustomersClient } from "./CustomersClient";
import { identifyWinBackCandidates } from "@/lib/win-back";

export const metadata = { title: "Customer Insights" };

interface CustomerRow {
  user_id: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
  visits: number;
  last_visit: string;
  favorite_beer: string | null;
}

export default async function CustomersPage({ params }: { params: Promise<{ brewery_id: string }> }) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: account } = await supabase
    .from("brewery_accounts").select("role")
    .eq("user_id", user.id).eq("brewery_id", brewery_id).single() as any;
  if (!account) redirect("/brewery-admin");

  // Fetch all completed sessions for this brewery with profile info
  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, user_id, started_at, ended_at, profile:profiles!user_id(display_name, username, avatar_url)")
    .eq("brewery_id", brewery_id)
    .eq("is_active", false)
    .order("started_at", { ascending: false })
    .limit(50000) as any;

  // Fetch beer_logs to compute favorite beer per user
  const { data: beerLogs } = await supabase
    .from("beer_logs")
    .select("user_id, beer:beers(name)")
    .eq("brewery_id", brewery_id)
    .limit(50000) as any;

  // Aggregate per user
  const userMap = new Map<string, {
    user_id: string;
    display_name: string;
    username: string;
    avatar_url: string | null;
    visits: number;
    last_visit: string;
    beerCounts: Map<string, number>;
  }>();

  for (const s of (sessions ?? []) as any[]) {
    const uid = s.user_id;
    const profile = s.profile;
    if (!uid || !profile) continue;

    const existing = userMap.get(uid);
    if (existing) {
      existing.visits += 1;
      if (s.started_at > existing.last_visit) {
        existing.last_visit = s.started_at;
      }
    } else {
      userMap.set(uid, {
        user_id: uid,
        display_name: profile.display_name ?? "Unknown",
        username: profile.username ?? "",
        avatar_url: profile.avatar_url ?? null,
        visits: 1,
        last_visit: s.started_at,
        beerCounts: new Map(),
      });
    }
  }

  // Aggregate beer counts per user
  for (const log of (beerLogs ?? []) as any[]) {
    const uid = log.user_id;
    const beerName = log.beer?.name;
    if (!uid || !beerName) continue;
    const entry = userMap.get(uid);
    if (entry) {
      entry.beerCounts.set(beerName, (entry.beerCounts.get(beerName) ?? 0) + 1);
    }
  }

  // Build final customer rows
  const customers: CustomerRow[] = Array.from(userMap.values()).map((u) => {
    let favBeer: string | null = null;
    let maxCount = 0;
    for (const [beer, count] of u.beerCounts) {
      if (count > maxCount) {
        maxCount = count;
        favBeer = beer;
      }
    }
    return {
      user_id: u.user_id,
      display_name: u.display_name,
      username: u.username,
      avatar_url: u.avatar_url,
      visits: u.visits,
      last_visit: u.last_visit,
      favorite_beer: favBeer,
    };
  });

  // Win-Back Intelligence (Sprint 159)
  const winBackCandidates = await identifyWinBackCandidates(brewery_id);

  // Get subscription tier for feature gating
  const { data: breweryData } = await supabase
    .from("breweries").select("subscription_tier").eq("id", brewery_id).single() as any;
  const subscriptionTier = breweryData?.subscription_tier ?? "free";

  return (
    <CustomersClient
      customers={customers}
      winBackCandidates={winBackCandidates}
      subscriptionTier={subscriptionTier}
      breweryId={brewery_id}
    />
  );
}
