import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, STRIPE_PRICES, isStripeConfigured } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { brewery_id, tier } = await req.json() as { brewery_id: string; tier: "tap" | "cask" };

    if (!brewery_id || !tier || !["tap", "cask"].includes(tier)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
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

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: STRIPE_PRICES[tier], quantity: 1 }],
      customer: brewery?.stripe_customer_id || undefined,
      customer_email: !brewery?.stripe_customer_id ? user.email : undefined,
      metadata: { brewery_id, user_id: user.id, tier },
      subscription_data: {
        metadata: { brewery_id, tier },
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
