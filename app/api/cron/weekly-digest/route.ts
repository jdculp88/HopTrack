import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { weeklyDigestEmail } from "@/lib/email-templates";
import { calculateDigestStats } from "@/app/api/brewery/[brewery_id]/digest/route";
import { onBrandWeeklyDigest } from "@/lib/email-triggers";
import { rateLimitResponse } from "@/lib/rate-limit";
import { generateDigestRecommendations } from "@/lib/digest-recommendations";

// POST /api/cron/weekly-digest — send weekly digest emails to all eligible breweries
// Secured by CRON_SECRET header. Called by GitHub Actions on a weekly schedule.
export async function POST(req: Request) {
  // Rate limit: 1 call per 10 minutes (safety valve against accidental re-runs)
  const limited = rateLimitResponse(req, "cron-weekly-digest", {
    limit: 1,
    windowMs: 10 * 60 * 1000,
  });
  if (limited) return limited;

  // ── Auth: CRON_SECRET header ──
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[weekly-digest] CRON_SECRET not configured");
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 },
    );
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  // ── Find all claimed (verified) breweries with activity in the last 7 days ──
  // First: get brewery IDs that had at least 1 session this week
  const { data: activeSessions } = await supabase
    .from("sessions")
    .select("brewery_id")
    .eq("is_active", false)
    .gte("started_at", weekAgo) as any;

  const activeBreweryIds = [
    ...new Set((activeSessions ?? []).map((s: any) => s.brewery_id)),
  ].filter(Boolean) as string[];

  if (activeBreweryIds.length === 0) {
    return NextResponse.json({
      success: true,
      message: "No active breweries this week",
      sent: 0,
      failed: 0,
    });
  }

  // Filter to verified (claimed) breweries only
  const { data: breweries } = await supabase
    .from("breweries")
    .select("id, name, subscription_tier")
    .eq("verified", true)
    .in("id", activeBreweryIds) as any;

  if (!breweries?.length) {
    return NextResponse.json({
      success: true,
      message: "No claimed breweries with activity",
      sent: 0,
      failed: 0,
    });
  }

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  // ── Brand digests — process first to build dedup set ──
  // Brand owners get a brand digest instead of per-location digests
  let brandSent = 0;
  let brandFailed = 0;
  const brandOwnerUserIds = new Set<string>();

  // Find brands with active locations this week
  const { data: brandLocations } = await supabase
    .from("breweries")
    .select("brand_id")
    .in("id", activeBreweryIds)
    .not("brand_id", "is", null) as any;

  const activeBrandIds = [
    ...new Set((brandLocations ?? []).map((b: any) => b.brand_id).filter(Boolean)),
  ] as string[];

  for (const brandId of activeBrandIds) {
    try {
      // Find brand owner to build dedup set
      const { data: brandAccounts } = await supabase
        .from("brand_accounts")
        .select("user_id")
        .eq("brand_id", brandId)
        .eq("role", "owner") as any;

      if (brandAccounts?.length) {
        brandAccounts.forEach((ba: any) => brandOwnerUserIds.add(ba.user_id));
      }

      await onBrandWeeklyDigest(brandId);
      brandSent++;
    } catch (err: any) {
      brandFailed++;
      errors.push(`brand ${brandId}: ${err.message}`);
      console.error(`[weekly-digest] Failed for brand ${brandId}:`, err.message);
    }
  }

  // ── Batch-fetch brewery owners and profiles (avoid N+1 per-brewery queries) ──
  const breweryIds = (breweries as any[]).map((b: any) => b.id);
  const { data: allOwnerAccounts } = await supabase
    .from("brewery_accounts")
    .select("brewery_id, user_id, role")
    .in("brewery_id", breweryIds)
    .eq("role", "owner") as any;

  const ownerByBrewery = new Map<string, string>();
  for (const acct of (allOwnerAccounts ?? []) as any[]) {
    if (!ownerByBrewery.has(acct.brewery_id)) {
      ownerByBrewery.set(acct.brewery_id, acct.user_id);
    }
  }

  const ownerIds = [...new Set(ownerByBrewery.values())];
  const { data: ownerProfiles } = ownerIds.length > 0
    ? await supabase
        .from("profiles")
        .select("id, display_name, email")
        .in("id", ownerIds) as any
    : { data: [] };

  const profileByUserId = new Map<string, any>();
  const profileList = Array.isArray(ownerProfiles) ? ownerProfiles : ownerProfiles ? [ownerProfiles] : [];
  for (const p of profileList as any[]) {
    if (p?.id) profileByUserId.set(p.id, p);
  }

  // ── Per-brewery digests — skip brand owners (they got the brand digest) ──
  for (const brewery of breweries as any[]) {
    try {
      const ownerId = ownerByBrewery.get(brewery.id);
      if (!ownerId) {
        // No owner — skip (manager-only breweries don't get digest)
        continue;
      }

      // Dedup: skip if this owner already received a brand digest
      if (brandOwnerUserIds.has(ownerId)) {
        continue;
      }

      const profile = profileByUserId.get(ownerId);
      if (!profile?.email) {
        console.warn(
          `[weekly-digest] No email for owner of brewery ${brewery.id}`,
        );
        continue;
      }

      // Calculate stats
      const { stats } = await calculateDigestStats(brewery.id);

      // Sprint 159: Generate recommendations for paid tiers
      const tier = brewery.subscription_tier ?? "free";
      const isPaid = tier === "tap" || tier === "cask" || tier === "barrel";
      let recommendations;
      if (isPaid) {
        try {
          // Quick count of VIPs who haven't visited in 14+ days
          const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString();
          const { data: allBrewerySessions } = await supabase
            .from("sessions")
            .select("user_id, started_at")
            .eq("brewery_id", brewery.id)
            .eq("is_active", false)
            .limit(50000) as any;

          let vipsNotVisiting = 0;
          if (allBrewerySessions) {
            const userVisits = new Map<string, { count: number; last: string }>();
            for (const s of allBrewerySessions as any[]) {
              const existing = userVisits.get(s.user_id);
              if (!existing) {
                userVisits.set(s.user_id, { count: 1, last: s.started_at });
              } else {
                existing.count++;
                if (s.started_at > existing.last) existing.last = s.started_at;
              }
            }
            for (const [, data] of userVisits) {
              if (data.count >= 10 && data.last < twoWeeksAgo) vipsNotVisiting++;
            }
          }

          recommendations = generateDigestRecommendations({
            breweryId: brewery.id,
            topBeer: stats.topBeer,
            visits: stats.visits,
            visitsTrend: stats.visitsTrend,
            followerGrowth: stats.newFollowers,
            loyaltyRedemptions: stats.loyaltyRedemptions,
            kpis: null, // Keep it lightweight — full KPI calc is expensive per-brewery in a cron loop
            vipsNotVisiting,
          });
        } catch {
          // Don't fail the digest over recommendations
          recommendations = undefined;
        }
      }

      // Build and send email
      const template = weeklyDigestEmail({
        breweryName: brewery.name,
        ownerName: profile.display_name || "Brewmaster",
        breweryId: brewery.id,
        stats,
        recommendations,
      });

      const result = await sendEmail({
        to: profile.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      if (result.success) {
        sent++;
      } else {
        failed++;
        errors.push(`${brewery.name}: send failed`);
      }
    } catch (err: any) {
      failed++;
      errors.push(`${brewery.name}: ${err.message}`);
      console.error(
        `[weekly-digest] Failed for brewery ${brewery.id}:`,
        err.message,
      );
    }
  }

  console.info(
    `[weekly-digest] Complete: ${sent} brewery + ${brandSent} brand sent, ${failed + brandFailed} failed out of ${breweries.length} breweries + ${activeBrandIds.length} brands`,
  );

  return NextResponse.json({
    success: true,
    sent: sent + brandSent,
    failed: failed + brandFailed,
    total: breweries.length + activeBrandIds.length,
    brewerySent: sent,
    brandSent,
    ...(errors.length > 0 ? { errors } : {}),
  });
}
