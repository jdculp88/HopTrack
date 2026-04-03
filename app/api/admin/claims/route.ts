import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { onClaimApproved, onClaimRejected } from "@/lib/email-triggers";

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify superadmin
    const { data: profile } = (await supabase
      .from("profiles")
      .select("is_superadmin")
      .eq("id", user.id)
      .single()) as any;

    if (!profile?.is_superadmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    // Accept both camelCase (claimId) and snake_case (claim_id) from clients
    const claimId: string = body.claimId ?? body.claim_id;
    const action: string = body.action;

    if (!claimId || !action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "claimId (or claim_id) and action (approve | reject) are required" },
        { status: 400 }
      );
    }

    // Fetch the claim to get brewery_id and user_id
    const { data: claim, error: claimFetchError } = (await supabase
      .from("brewery_claims")
      .select("id, brewery_id, user_id, status")
      .eq("id", claimId)
      .single()) as any;

    if (claimFetchError || !claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    if (claim.status !== "pending") {
      return NextResponse.json(
        { error: `Claim is already ${claim.status}` },
        { status: 409 }
      );
    }

    const newStatus = (action as string) === "approve" ? "approved" : "rejected";

    // Update the claim status
    const { error: claimUpdateError } = await supabase
      .from("brewery_claims")
      .update({
        status: newStatus,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", claimId);

    if (claimUpdateError) {
      return NextResponse.json(
        { error: `Failed to update claim: ${claimUpdateError.message}` },
        { status: 500 }
      );
    }

    // If approving, mark the brewery_account as verified
    if (action === "approve") {
      const { error: accountError } = await supabase
        .from("brewery_accounts")
        .update({ verified: true, verified_at: new Date().toISOString() })
        .eq("brewery_id", claim.brewery_id)
        .eq("user_id", claim.user_id);

      if (accountError) {
        // Non-fatal: log but don't fail the whole request
        console.error("Failed to verify brewery_account:", accountError.message);
      }
    }

    // Log the admin action
    await supabase.from("admin_actions").insert({
      admin_user_id: user.id,
      action_type: action === "approve" ? "claim_approved" : "claim_rejected",
      target_type: "brewery_claim",
      target_id: claimId,
      notes: `Claim for brewery ${claim.brewery_id} ${newStatus}`,
    });

    // Fire notification email to the brewery owner (non-blocking)
    if (action === "approve") {
      onClaimApproved(claimId).catch((err) =>
        console.error("[admin/claims] Approved email failed:", err)
      );
    } else {
      onClaimRejected(claimId).catch((err) =>
        console.error("[admin/claims] Rejected email failed:", err)
      );
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch (err) {
    console.error("/api/admin/claims PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
