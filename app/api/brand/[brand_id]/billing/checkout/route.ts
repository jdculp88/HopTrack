import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyBrandAccess } from "@/lib/brand-auth";
import { getStripe, STRIPE_BRAND_PRICES, isStripeConfigured } from "@/lib/stripe";
import { getBrandLocationCount } from "@/lib/brand-billing";
import { rateLimitResponse } from "@/lib/rate-limit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ brand_id: string }> }
) {
  const rl = rateLimitResponse(req, "brand-billing-checkout", { limit: 5, windowMs: 60_000 });
  if (rl) return rl;

  try {
    const { brand_id } = await params;
    const { interval = "monthly" } = await req.json() as {
      interval?: "monthly" | "annual";
    };

    if (!brand_id) {
      return NextResponse.json({ error: "brand_id required" }, { status: 400 });
    }

    if (!["monthly", "annual"].includes(interval)) {
      return NextResponse.json({ error: "Invalid billing interval" }, { status: 400 });
    }

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

    const { data: brand } = await supabase
      .from("brewery_brands")
      .select("name, stripe_customer_id")
      .eq("id", brand_id)
      .single() as any;

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Demo mode
    if (!isStripeConfigured()) {
      return NextResponse.json({
        url: `/brewery-admin/brand/${brand_id}/billing?demo=1`,
        demo: true,
      });
    }

    const stripe = getStripe();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://app.hoptrack.beer";

    // Calculate location count for add-on pricing
    const locationCount = await getBrandLocationCount(supabase, brand_id);
    const addonQuantity = Math.max(0, locationCount - 1); // First location included in base

    // Build line items: base subscription + per-location add-ons
    const basePriceId = interval === "annual"
      ? STRIPE_BRAND_PRICES.barrel_annual
      : STRIPE_BRAND_PRICES.barrel_monthly;

    const addonPriceId = interval === "annual"
      ? STRIPE_BRAND_PRICES.location_addon_annual
      : STRIPE_BRAND_PRICES.location_addon_monthly;

    const lineItems: any[] = [{ price: basePriceId, quantity: 1 }];

    if (addonQuantity > 0) {
      lineItems.push({ price: addonPriceId, quantity: addonQuantity });
    }

    const metadata = {
      brand_id,
      user_id: user.id,
      tier: "barrel",
      interval,
      type: "brand", // Critical: webhook uses this to route brand vs brewery
    };

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: lineItems,
      customer: brand.stripe_customer_id || undefined,
      customer_email: !brand.stripe_customer_id ? user.email : undefined,
      metadata,
      subscription_data: {
        metadata,
        trial_period_days: 0,
      },
      success_url: `${baseUrl}/brewery-admin/brand/${brand_id}/billing?success=1`,
      cancel_url: `${baseUrl}/brewery-admin/brand/${brand_id}/billing?cancelled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("[brand-billing/checkout]", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
