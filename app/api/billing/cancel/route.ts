import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { rateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const rl = rateLimitResponse(req, "billing-cancel", { limit: 5, windowMs: 60_000 });
  if (rl) return rl;
  try {
    const { brewery_id } = await req.json() as { brewery_id: string };

    if (!brewery_id) {
      return NextResponse.json({ error: "brewery_id required" }, { status: 400 });
    }

    // Auth guard
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: account } = await supabase
      .from("brewery_accounts")
      .select("role")
      .eq("user_id", user.id)
      .eq("brewery_id", brewery_id)
      .single() as any;

    if (!account) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Demo mode — simulate cancel
    if (!isStripeConfigured()) {
      await supabase
        .from("breweries")
        .update({ subscription_tier: "free" })
        .eq("id", brewery_id);

      return NextResponse.json({ cancelled: true, demo: true });
    }

    const { data: brewery } = await supabase
      .from("breweries")
      .select("stripe_customer_id")
      .eq("id", brewery_id)
      .single() as any;

    if (!brewery?.stripe_customer_id) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
    }

    const stripe = getStripe();

    // Find active subscription for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: brewery.stripe_customer_id,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
    }

    // Cancel at period end — brewery keeps access until billing period ends
    await stripe.subscriptions.update(subscriptions.data[0].id, {
      cancel_at_period_end: true,
    });

    console.info(`[billing/cancel] Brewery ${brewery_id} scheduled for cancellation at period end`);

    return NextResponse.json({ cancelled: true });
  } catch (err: any) {
    console.error("[billing/cancel]", err);
    return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 });
  }
}
