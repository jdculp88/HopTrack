// Email trigger functions — Sprint 75
// Called from API routes/flows to send transactional emails
// Each function handles its own data fetching and template selection

import { sendEmail } from "@/lib/email";
import {
  welcomeEmail,
  breweryWelcomeEmail,
  claimApprovedEmail,
  claimRejectedEmail,
  trialWarningEmail,
  trialExpiredEmail,
  passwordResetEmail,
  weeklyDigestEmail,
  onboardingDay3Email,
  onboardingDay7Email,
  waitlistConfirmEmail,
} from "@/lib/email-templates";
import { createClient } from "@/lib/supabase/server";

// ── Consumer sign-up ──

export async function onUserSignUp(userId: string) {
  try {
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, email")
      .eq("id", userId)
      .single() as any;

    if (!profile?.email) {
      console.warn("[email-trigger] onUserSignUp: no email for user", userId);
      return;
    }

    const template = welcomeEmail({
      displayName: profile.display_name || "Beer Lover",
    });

    await sendEmail({
      to: profile.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  } catch (err: any) {
    console.error("[email-trigger] onUserSignUp failed:", err.message);
  }
}

// ── Brewery claim/sign-up ──

export async function onBreweryClaim(breweryId: string, userId: string) {
  try {
    const supabase = await createClient();

    const [{ data: brewery }, { data: profile }] = await Promise.all([
      supabase.from("breweries").select("name").eq("id", breweryId).single() as any,
      supabase.from("profiles").select("display_name, email").eq("id", userId).single() as any,
    ]);

    if (!profile?.email) {
      console.warn("[email-trigger] onBreweryClaim: no email for user", userId);
      return;
    }

    const template = breweryWelcomeEmail({
      breweryName: brewery?.name || "Your Brewery",
      ownerName: profile.display_name || "Brewmaster",
      breweryId,
    });

    await sendEmail({
      to: profile.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  } catch (err: any) {
    console.error("[email-trigger] onBreweryClaim failed:", err.message);
  }
}

// ── Claim Approved (Sprint 145) ──

export async function onClaimApproved(claimId: string) {
  try {
    const supabase = await createClient();

    const { data: claim } = await supabase
      .from("brewery_claims")
      .select("brewery_id, user_id")
      .eq("id", claimId)
      .single() as any;

    if (!claim) return;

    const [{ data: brewery }, { data: profile }] = await Promise.all([
      supabase.from("breweries").select("name").eq("id", claim.brewery_id).single() as any,
      supabase.from("profiles").select("display_name, email").eq("id", claim.user_id).single() as any,
    ]);

    if (!profile?.email) {
      console.warn("[email-trigger] onClaimApproved: no email for user", claim.user_id);
      return;
    }

    const template = claimApprovedEmail({
      breweryName: brewery?.name || "Your Brewery",
      ownerName: profile.display_name || "Brewmaster",
      breweryId: claim.brewery_id,
    });

    await sendEmail({
      to: profile.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  } catch (err: any) {
    console.error("[email-trigger] onClaimApproved failed:", err.message);
  }
}

// ── Claim Rejected (Sprint 145) ──

export async function onClaimRejected(claimId: string) {
  try {
    const supabase = await createClient();

    const { data: claim } = await supabase
      .from("brewery_claims")
      .select("brewery_id, user_id")
      .eq("id", claimId)
      .single() as any;

    if (!claim) return;

    const [{ data: brewery }, { data: profile }] = await Promise.all([
      supabase.from("breweries").select("name").eq("id", claim.brewery_id).single() as any,
      supabase.from("profiles").select("display_name, email").eq("id", claim.user_id).single() as any,
    ]);

    if (!profile?.email) {
      console.warn("[email-trigger] onClaimRejected: no email for user", claim.user_id);
      return;
    }

    const template = claimRejectedEmail({
      breweryName: brewery?.name || "Your Brewery",
      ownerName: profile.display_name || "Brewmaster",
    });

    await sendEmail({
      to: profile.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  } catch (err: any) {
    console.error("[email-trigger] onClaimRejected failed:", err.message);
  }
}

// ── Onboarding Day 3 (Sprint 145) ──

export async function onOnboardingDay3(breweryId: string) {
  try {
    const supabase = await createClient();

    const { data: brewery } = await supabase
      .from("breweries")
      .select("name")
      .eq("id", breweryId)
      .single() as any;

    if (!brewery) return;

    const { data: accounts } = await supabase
      .from("brewery_accounts")
      .select("user_id, role")
      .eq("brewery_id", breweryId)
      .eq("role", "owner") as any;

    if (!accounts?.length) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, email")
      .eq("id", accounts[0].user_id)
      .single() as any;

    if (!profile?.email) return;

    const template = onboardingDay3Email({
      breweryName: brewery.name,
      ownerName: profile.display_name || "Brewmaster",
      breweryId,
    });

    await sendEmail({
      to: profile.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  } catch (err: any) {
    console.error("[email-trigger] onOnboardingDay3 failed:", err.message);
  }
}

// ── Onboarding Day 7 (Sprint 145) ──

export async function onOnboardingDay7(breweryId: string) {
  try {
    const supabase = await createClient();

    const { data: brewery } = await supabase
      .from("breweries")
      .select("name")
      .eq("id", breweryId)
      .single() as any;

    if (!brewery) return;

    const { data: accounts } = await supabase
      .from("brewery_accounts")
      .select("user_id, role")
      .eq("brewery_id", breweryId)
      .eq("role", "owner") as any;

    if (!accounts?.length) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, email")
      .eq("id", accounts[0].user_id)
      .single() as any;

    if (!profile?.email) return;

    // Fetch basic first-week stats
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const [sessionsRes, beersRes, followsRes] = await Promise.all([
      supabase.from("sessions").select("id", { count: "exact", head: true }).eq("brewery_id", breweryId).gte("started_at", sevenDaysAgo),
      supabase.from("beer_logs").select("id", { count: "exact", head: true }).eq("brewery_id", breweryId).gte("created_at", sevenDaysAgo),
      supabase.from("brewery_follows").select("id", { count: "exact", head: true }).eq("brewery_id", breweryId),
    ]);

    const template = onboardingDay7Email({
      breweryName: brewery.name,
      ownerName: profile.display_name || "Brewmaster",
      breweryId,
      stats: {
        sessions: sessionsRes.count ?? 0,
        beersLogged: beersRes.count ?? 0,
        followers: followsRes.count ?? 0,
      },
    });

    await sendEmail({
      to: profile.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  } catch (err: any) {
    console.error("[email-trigger] onOnboardingDay7 failed:", err.message);
  }
}

// ── Trial warning (called by scheduled job — future sprint) ──

export async function onTrialWarning(breweryId: string) {
  try {
    const supabase = await createClient();

    const { data: brewery } = await supabase
      .from("breweries")
      .select("name, created_at, trial_ends_at")
      .eq("id", breweryId)
      .single() as any;

    if (!brewery) return;

    // Calculate days remaining
    const trialEnd = brewery.trial_ends_at
      ? new Date(brewery.trial_ends_at)
      : new Date(new Date(brewery.created_at).getTime() + 14 * 24 * 60 * 60 * 1000);
    const daysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

    // Get owner email
    const { data: accounts } = await supabase
      .from("brewery_accounts")
      .select("user_id, role")
      .eq("brewery_id", breweryId)
      .eq("role", "owner") as any;

    if (!accounts?.length) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, email")
      .eq("id", accounts[0].user_id)
      .single() as any;

    if (!profile?.email) return;

    const template = trialWarningEmail({
      breweryName: brewery.name,
      ownerName: profile.display_name || "Brewmaster",
      daysLeft,
      breweryId,
    });

    await sendEmail({
      to: profile.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  } catch (err: any) {
    console.error("[email-trigger] onTrialWarning failed:", err.message);
  }
}

// ── Trial expired (called by scheduled job — future sprint) ──

export async function onTrialExpired(breweryId: string) {
  try {
    const supabase = await createClient();

    const { data: brewery } = await supabase
      .from("breweries")
      .select("name")
      .eq("id", breweryId)
      .single() as any;

    if (!brewery) return;

    const { data: accounts } = await supabase
      .from("brewery_accounts")
      .select("user_id, role")
      .eq("brewery_id", breweryId)
      .eq("role", "owner") as any;

    if (!accounts?.length) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, email")
      .eq("id", accounts[0].user_id)
      .single() as any;

    if (!profile?.email) return;

    const template = trialExpiredEmail({
      breweryName: brewery.name,
      ownerName: profile.display_name || "Brewmaster",
      breweryId,
    });

    await sendEmail({
      to: profile.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  } catch (err: any) {
    console.error("[email-trigger] onTrialExpired failed:", err.message);
  }
}

// ── Weekly digest (called by cron or manually per brewery) ──

export async function onWeeklyDigest(breweryId: string) {
  try {
    const supabase = await createClient();

    // Fetch brewery
    const { data: brewery } = await supabase
      .from("breweries")
      .select("name")
      .eq("id", breweryId)
      .single() as any;

    if (!brewery) {
      console.warn("[email-trigger] onWeeklyDigest: brewery not found", breweryId);
      return;
    }

    // Find owner via brewery_accounts
    const { data: accounts } = await supabase
      .from("brewery_accounts")
      .select("user_id, role")
      .eq("brewery_id", breweryId)
      .eq("role", "owner") as any;

    if (!accounts?.length) {
      console.warn("[email-trigger] onWeeklyDigest: no owner for brewery", breweryId);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, email")
      .eq("id", accounts[0].user_id)
      .single() as any;

    if (!profile?.email) {
      console.warn("[email-trigger] onWeeklyDigest: no email for owner of brewery", breweryId);
      return;
    }

    // Calculate stats (import dynamically to avoid circular deps)
    const { calculateDigestStats } = await import(
      "@/app/api/brewery/[brewery_id]/digest/route"
    );
    const { stats } = await calculateDigestStats(breweryId);

    const template = weeklyDigestEmail({
      breweryName: brewery.name,
      ownerName: profile.display_name || "Brewmaster",
      breweryId,
      stats,
    });

    await sendEmail({
      to: profile.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  } catch (err: any) {
    console.error("[email-trigger] onWeeklyDigest failed:", err.message);
  }
}

// ── Brand weekly digest (multi-location) ──

export async function onBrandWeeklyDigest(brandId: string) {
  try {
    const supabase = await createClient();

    // Fetch brand
    const { data: brand } = await supabase
      .from("brewery_brands")
      .select("name")
      .eq("id", brandId)
      .single() as any;

    if (!brand) {
      console.warn("[email-trigger] onBrandWeeklyDigest: brand not found", brandId);
      return;
    }

    // Find brand owner
    const { data: accounts } = await supabase
      .from("brand_accounts")
      .select("user_id, role")
      .eq("brand_id", brandId)
      .eq("role", "owner") as any;

    if (!accounts?.length) {
      console.warn("[email-trigger] onBrandWeeklyDigest: no owner for brand", brandId);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, email")
      .eq("id", accounts[0].user_id)
      .single() as any;

    if (!profile?.email) {
      console.warn("[email-trigger] onBrandWeeklyDigest: no email for owner of brand", brandId);
      return;
    }

    const { calculateBrandDigestStats } = await import("@/lib/brand-digest");
    const { stats } = await calculateBrandDigestStats(brandId);

    const { brandDigestEmail } = await import("@/lib/email-templates");
    const template = brandDigestEmail({
      brandName: brand.name,
      ownerName: profile.display_name || "Brewmaster",
      brandId,
      stats,
    });

    await sendEmail({
      to: profile.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  } catch (err: any) {
    console.error("[email-trigger] onBrandWeeklyDigest failed:", err.message);
  }
}

// ── Password reset ──

export async function onPasswordReset(email: string, resetUrl: string) {
  try {
    const template = passwordResetEmail({ resetUrl });

    await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  } catch (err: any) {
    console.error("[email-trigger] onPasswordReset failed:", err.message);
  }
}

// ── Waitlist signup (Sprint 174 — Coming Soon) ──

export async function onWaitlistSignup(
  email: string,
  name: string,
  audience: "user" | "brewery"
) {
  try {
    const template = waitlistConfirmEmail({ name, audience });

    await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  } catch (err: any) {
    console.error("[email-trigger] onWaitlistSignup failed:", err.message);
  }
}
