import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PromotionHubClient } from "./PromotionHubClient";

export const metadata = { title: "Promotion Hub — HopTrack" };

export default async function PromotionHubPage({ params }: { params: Promise<{ brewery_id: string }> }) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify admin access
  const { data: account } = await supabase
    .from("brewery_accounts")
    .select("id")
    .eq("brewery_id", brewery_id)
    .eq("user_id", user.id)
    .single();

  if (!account) redirect(`/brewery-admin/${brewery_id}`);

  // Fetch all data in parallel
  const [
    { data: brewery },
    { data: ads },
    { data: challenges },
    { data: mugClubs },
  ] = await Promise.all([
    supabase
      .from("breweries")
      .select("id, subscription_tier, hop_route_eligible")
      .eq("id", brewery_id)
      .single(),
    supabase
      .from("brewery_ads")
      .select("id, is_active, impressions, clicks, budget_cents, spent_cents, title, created_at")
      .eq("brewery_id", brewery_id),
    supabase
      .from("challenges")
      .select("id, is_active, is_sponsored, impressions, joins_from_discovery, name, created_at, participant_count:challenge_participants(count)")
      .eq("brewery_id", brewery_id),
    supabase
      .from("mug_clubs")
      .select("id, is_active, name, annual_fee, created_at, member_count:mug_club_members(count)")
      .eq("brewery_id", brewery_id),
  ]);

  const tier = (brewery as any)?.subscription_tier ?? "free";

  // Aggregate ad stats
  const allAds = ads || [];
  const activeAds = allAds.filter(a => a.is_active);
  const adImpressions = allAds.reduce((sum, a) => sum + (a.impressions || 0), 0);
  const adClicks = allAds.reduce((sum, a) => sum + (a.clicks || 0), 0);

  // Aggregate challenge stats
  const allChallenges = (challenges || []).map(c => ({
    ...c,
    participant_count: (c.participant_count as any)?.[0]?.count ?? 0,
  }));
  const activeSponsoredChallenges = allChallenges.filter(c => c.is_active && c.is_sponsored);
  const activeStandardChallenges = allChallenges.filter(c => c.is_active && !c.is_sponsored);
  const challengeImpressions = allChallenges.reduce((sum, c) => sum + (c.impressions || 0), 0);
  const challengeJoins = allChallenges.reduce((sum, c) => sum + (c.joins_from_discovery || 0), 0);
  const challengeParticipants = allChallenges.reduce((sum, c) => sum + c.participant_count, 0);

  // Aggregate mug club stats
  const allClubs = (mugClubs || []).map(c => ({
    ...c,
    member_count: (c.member_count as any)?.[0]?.count ?? 0,
  }));
  const activeClubs = allClubs.filter(c => c.is_active);
  const totalMembers = allClubs.reduce((sum, c) => sum + c.member_count, 0);
  const projectedRevenue = allClubs.reduce((sum, c) => sum + (c.annual_fee * c.member_count), 0);

  // Build summary
  const totalActivePromotions = activeAds.length + activeSponsoredChallenges.length + activeClubs.length;
  const totalImpressions = adImpressions + challengeImpressions;
  const totalEngagement = adClicks + challengeJoins + totalMembers;

  // Build recent activity
  const recentActivity: { type: string; icon: string; text: string; time: string }[] = [];
  for (const ad of allAds.slice(0, 5)) {
    recentActivity.push({ type: "ad", icon: "📢", text: `"${ad.title}" campaign created`, time: ad.created_at });
  }
  for (const c of allChallenges.filter(c => c.is_sponsored).slice(0, 5)) {
    recentActivity.push({ type: "challenge", icon: "🏆", text: `"${c.name}" challenge · ${c.participant_count} participants`, time: c.created_at });
  }
  for (const club of allClubs.slice(0, 5)) {
    recentActivity.push({ type: "mug_club", icon: "👑", text: `"${club.name}" club · ${club.member_count} members`, time: club.created_at });
  }
  recentActivity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return (
    <PromotionHubClient
      breweryId={brewery_id}
      tier={tier}
      summary={{
        totalActivePromotions,
        totalImpressions,
        totalEngagement,
        estimatedReach: Math.round(totalImpressions * 0.6),
      }}
      ads={{
        activeCount: activeAds.length,
        totalCount: allAds.length,
        totalImpressions: adImpressions,
        totalClicks: adClicks,
        ctr: adImpressions > 0 ? Number(((adClicks / adImpressions) * 100).toFixed(1)) : 0,
      }}
      challenges={{
        activeSponsoredCount: activeSponsoredChallenges.length,
        activeStandardCount: activeStandardChallenges.length,
        totalImpressions: challengeImpressions,
        totalJoins: challengeJoins,
        totalParticipants: challengeParticipants,
      }}
      mugClubs={{
        activeCount: activeClubs.length,
        totalCount: allClubs.length,
        totalMembers,
        projectedRevenue,
      }}
      recentActivity={recentActivity.slice(0, 10)}
      hopRouteEligible={(brewery as any)?.hop_route_eligible ?? false}
    />
  );
}
