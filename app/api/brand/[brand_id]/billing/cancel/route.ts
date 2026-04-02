import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyBrandAccess } from "@/lib/brand-auth";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { revertBrandTier } from "@/lib/brand-billing";
import { rateLimitResponse } from "@/lib/rate-limit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ brand_id: string }> }
) {
  const rl = rateLimitResponse(req, "brand-billing-cancel", { limit: 5, windowMs: 60_000 });
  if (rl) return rl;

  try {
    const { brand_id } = await params;

    // Auth guard — must be brand owner
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await verifyBrandAccess(supabase, brand_id, user.id);
    if (role !== "owner") {
      return NextResponse.json({ error: "Only brand owners can manage billing" }, { status: 403 });
    }

    // Demo mode — simulate cancel
    if (!isStripeConfigured()) {
      await (supabase
        .from("brewery_brands")
        .update({ subscription_tier: "free" } as any)
        .eq("id", brand_id) as any);

      await revertBrandTier(supabase, brand_id);

      return NextResponse.json({ cancelled: true, demo: true });
    }

    const { data: brand } = await supabase
      .from("brewery_brands")
      .select("stripe_customer_id")
      .eq("id", brand_id)
      .single() as any;

    if (!brand?.stripe_customer_id) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
    }

    const stripe = getStripe();

    // Find active subscription for this brand customer
    const subscriptions = await stripe.subscriptions.list({
      customer: brand.stripe_customer_id,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
    }

    // Cancel at period end — brand keeps access until billing period ends
    await stripe.subscriptions.update(subscriptions.data[0].id, {
      cancel_at_period_end: true,
    });

    console.info(`[brand-billing/cancel] Brand ${brand_id} scheduled for cancellation at period end`);

    return NextResponse.json({ cancelled: true });
  } catch (err: any) {
    console.error("[brand-billing/cancel]", err);
    return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 });
  }
}
