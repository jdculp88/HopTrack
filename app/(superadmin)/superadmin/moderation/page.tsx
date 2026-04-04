/**
 * Superadmin Review Moderation — Sprint 156 (The Triple Shot)
 *
 * Fetches flagged reviews from both beer_reviews and brewery_reviews,
 * presents them for admin action (clear or remove).
 */

import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { ShieldAlert } from "lucide-react";
import { ModerationClient } from "./ModerationClient";

export const metadata = { title: "Review Moderation" };

interface FlaggedReview {
  id: string;
  review_type: "beer" | "brewery";
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
  is_flagged: boolean;
  flag_reason: string | null;
  flagged_by: string | null;
  flagged_at: string | null;
  moderation_status: string | null;
  moderated_at: string | null;
  moderated_by: string | null;
  reviewer_name: string | null;
  reporter_name: string | null;
}

export default async function ModerationPage() {
  const supabase = await createClient();

  // Fetch flagged beer reviews
  const { data: beerReviews } = await (supabase as any)
    .from("beer_reviews")
    .select(`
      id, rating, comment, created_at, user_id,
      is_flagged, flag_reason, flagged_by, flagged_at,
      moderation_status, moderated_at, moderated_by,
      profile:profiles!beer_reviews_user_id_fkey(display_name, username)
    `)
    .eq("is_flagged", true)
    .order("flagged_at", { ascending: false })
    .limit(100);

  // Fetch flagged brewery reviews
  const { data: breweryReviews } = await (supabase as any)
    .from("brewery_reviews")
    .select(`
      id, rating, comment, created_at, user_id,
      is_flagged, flag_reason, flagged_by, flagged_at,
      moderation_status, moderated_at, moderated_by,
      profile:profiles!brewery_reviews_user_id_fkey(display_name, username)
    `)
    .eq("is_flagged", true)
    .order("flagged_at", { ascending: false })
    .limit(100);

  // Collect reporter IDs for name lookup
  const reporterIds = new Set<string>();
  for (const r of [...(beerReviews ?? []), ...(breweryReviews ?? [])]) {
    if (r.flagged_by) reporterIds.add(r.flagged_by);
  }

  // Fetch reporter profiles
  const reporterMap = new Map<string, string>();
  if (reporterIds.size > 0) {
    const { data: reporters } = await (supabase as any)
      .from("profiles")
      .select("id, display_name, username")
      .in("id", Array.from(reporterIds));
    for (const p of reporters ?? []) {
      reporterMap.set(p.id, p.display_name ?? p.username ?? "Unknown");
    }
  }

  // Merge into unified shape
  const flagged: FlaggedReview[] = [
    ...(beerReviews ?? []).map((r: any) => ({
      id: r.id,
      review_type: "beer" as const,
      rating: r.rating,
      comment: r.comment,
      created_at: r.created_at,
      user_id: r.user_id,
      is_flagged: r.is_flagged,
      flag_reason: r.flag_reason,
      flagged_by: r.flagged_by,
      flagged_at: r.flagged_at,
      moderation_status: r.moderation_status,
      moderated_at: r.moderated_at,
      moderated_by: r.moderated_by,
      reviewer_name: r.profile?.display_name ?? r.profile?.username ?? "Unknown",
      reporter_name: r.flagged_by ? (reporterMap.get(r.flagged_by) ?? "Unknown") : null,
    })),
    ...(breweryReviews ?? []).map((r: any) => ({
      id: r.id,
      review_type: "brewery" as const,
      rating: r.rating,
      comment: r.comment,
      created_at: r.created_at,
      user_id: r.user_id,
      is_flagged: r.is_flagged,
      flag_reason: r.flag_reason,
      flagged_by: r.flagged_by,
      flagged_at: r.flagged_at,
      moderation_status: r.moderation_status,
      moderated_at: r.moderated_at,
      moderated_by: r.moderated_by,
      reviewer_name: r.profile?.display_name ?? r.profile?.username ?? "Unknown",
      reporter_name: r.flagged_by ? (reporterMap.get(r.flagged_by) ?? "Unknown") : null,
    })),
  ].sort((a, b) => {
    const aDate = a.flagged_at ?? a.created_at;
    const bDate = b.flagged_at ?? b.created_at;
    return new Date(bDate).getTime() - new Date(aDate).getTime();
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader
        title="Review Moderation"
        subtitle="Review and act on flagged content"
        icon={ShieldAlert}
      />
      <ModerationClient initialReviews={flagged} />
    </div>
  );
}
