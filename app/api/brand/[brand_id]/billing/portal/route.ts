import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { rateLimitResponse } from "@/lib/rate-limit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ brand_id: string }> }
) {
  const rl = rateLimitResponse(req, "brand-billing-portal", { limit: 5, windowMs: 60_000 });
  if (rl) return rl;

  try {
    const { brand_id } = await params;

    // Auth guard — must be brand owner
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: brandAccount } = await supabase
      .from("brand_accounts")
      .select("role")
      .eq("user_id", user.id)
      .eq("brand_id", brand_id)
      .single() as any;

    if (!brandAccount || brandAccount.role !== "owner") {
      return NextResponse.json({ error: "Only brand owners can manage billing" }, { status: 403 });
    }

    // Demo mode
    if (!isStripeConfigured()) {
      return NextResponse.json({
        url: `/brewery-admin/brand/${brand_id}/billing?demo=1`,
        demo: true,
      });
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
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://app.hoptrack.beer";

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: brand.stripe_customer_id,
      return_url: `${baseUrl}/brewery-admin/brand/${brand_id}/billing`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err: any) {
    console.error("[brand-billing/portal]", err);
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 });
  }
}
