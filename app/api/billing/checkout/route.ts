import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, STRIPE_PRICES, isStripeConfigured } from "@/lib/stripe";
import { rateLimitResponse } from "@/lib/rate-limit";
import { checkBrandCovered } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  const rl = rateLimitResponse(req, "billing-checkout", { limit: 5, windowMs: 60_000 });
  if (rl) return rl;
  try {
    const { brewery_id, tier, interval = "monthly" } = await req.json() as {
      brewery_id: string;
      tier: "tap" | "cask";
      interval?: "monthly" | "annual";
    };

    if (!brewery_id || !tier || !["tap", "cask"].includes(tier)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (!["monthly", "annual"].includes(interval)) {
      return NextResponse.json({ error: "Invalid billing interval" }, { status: 400 });
    }

    // Auth guard — must be brewery admin
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

    // Block checkout if brewery is covered by brand subscription
    const brandCheck = await checkBrandCovered(supabase, brewery_id);
    if (brandCheck.covered) {
      return NextResponse.json(
        { error: `This location's billing is managed by ${brandCheck.brandName}. Contact your brand administrator.` },
        { status: 403 }
      );
    }

    const { data: brewery } = await supabase
      .from("breweries")
      .select("name, stripe_customer_id")
      .eq("id", brewery_id)
      .single() as any;

    // Stub response when Stripe is not configured
    if (!isStripeConfigured()) {
      return NextResponse.json({
        url: `/brewery-admin/${brewery_id}/billing?demo=1`,
        demo: true,
      });
    }

    const stripe = getStripe();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://app.hoptrack.beer";

    // Select the correct price ID based on tier + interval
    const priceKey = `${tier}_${interval}` as keyof typeof STRIPE_PRICES;
    const priceId = STRIPE_PRICES[priceKey];

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer: brewery?.stripe_customer_id || undefined,
      customer_email: !brewery?.stripe_customer_id ? user.email : undefined,
      metadata: { brewery_id, user_id: user.id, tier, interval },
      subscription_data: {
        metadata: { brewery_id, tier, interval },
        trial_period_days: 0, // trial already tracked via brewery.created_at
      },
      success_url: `${baseUrl}/brewery-admin/${brewery_id}/billing?success=1`,
      cancel_url: `${baseUrl}/brewery-admin/${brewery_id}/billing?cancelled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("[billing/checkout]", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
