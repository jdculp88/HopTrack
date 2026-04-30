import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { rateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const rl = rateLimitResponse(req, "billing-portal", { limit: 5, windowMs: 60_000 });
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

    // Stub when Stripe not configured
    if (!isStripeConfigured()) {
      return NextResponse.json({
        url: `/brewery-admin/${brewery_id}/billing?demo=1`,
        demo: true,
      });
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
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hoptrack.beer";

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: brewery.stripe_customer_id,
      return_url: `${baseUrl}/brewery-admin/${brewery_id}/billing`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err: any) {
    console.error("[billing/portal]", err);
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 });
  }
}
