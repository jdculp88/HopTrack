import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getStripe } from "@/lib/stripe";
import { propagateBrandTier, revertBrandTier } from "@/lib/brand-billing";

// force-dynamic removed — all routes are dynamic by default with cacheComponents (Sprint 158)

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: any;

  if (webhookSecret) {
    // Verify signature when secret is configured
    try {
      const stripe = getStripe();
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: any) {
      console.error("[webhook] Signature verification failed:", err.message);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } else {
    // Dev/stub mode — parse without verification
    try {
      event = JSON.parse(body);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
  }

  const supabase = await createClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const meta = session.metadata ?? {};

        if (meta.type === "brand" && meta.brand_id) {
          // ─── Brand checkout ───
          const serviceClient = createServiceClient();

          await (serviceClient
            .from("brewery_brands")
            .update({
              stripe_customer_id: session.customer as string,
              subscription_tier: (meta.tier || "barrel") as any,
              trial_ends_at: null,
            })
            .eq("id", meta.brand_id) as any);

          // Propagate tier to all brand locations
          await propagateBrandTier(
            serviceClient,
            meta.brand_id,
            (meta.tier || "barrel") as any
          );

          console.info(`[webhook] Brand ${meta.brand_id} subscribed to ${meta.tier}`);
        } else if (meta.brewery_id) {
          // ─── Brewery checkout (existing) ───
          await supabase
            .from("breweries")
            .update({
              stripe_customer_id: session.customer as string,
              subscription_tier: (meta.tier || "tap") as "free" | "tap" | "cask" | "barrel",
              trial_ends_at: null,
            })
            .eq("id", meta.brewery_id);

          console.info(`[webhook] Brewery ${meta.brewery_id} subscribed to ${meta.tier}`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object;
        const meta = sub.metadata ?? {};
        const isActive = sub.status === "active" || sub.status === "trialing";

        if (meta.type === "brand" && meta.brand_id) {
          // ─── Brand subscription updated ───
          const serviceClient = createServiceClient();
          const tier = isActive ? (meta.tier || "barrel") : "free";

          await (serviceClient
            .from("brewery_brands")
            .update({ subscription_tier: tier as any })
            .eq("id", meta.brand_id) as any);

          if (isActive) {
            await propagateBrandTier(serviceClient, meta.brand_id, tier as any);
          } else {
            await revertBrandTier(serviceClient, meta.brand_id);
          }
        } else if (meta.brewery_id) {
          // ─── Brewery subscription updated (existing) ───
          await supabase
            .from("breweries")
            .update({
              subscription_tier: (isActive ? (meta.tier || "tap") : "free") as "free" | "tap" | "cask" | "barrel",
            })
            .eq("id", meta.brewery_id);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const meta = sub.metadata ?? {};

        if (meta.type === "brand" && meta.brand_id) {
          // ─── Brand subscription deleted ───
          const serviceClient = createServiceClient();

          await (serviceClient
            .from("brewery_brands")
            .update({ subscription_tier: "free" as any })
            .eq("id", meta.brand_id) as any);

          await revertBrandTier(serviceClient, meta.brand_id);

          console.info(`[webhook] Brand ${meta.brand_id} subscription cancelled — downgraded to free`);
        } else if (meta.brewery_id) {
          // ─── Brewery subscription deleted (existing) ───
          await supabase
            .from("breweries")
            .update({ subscription_tier: "free" })
            .eq("id", meta.brewery_id);

          console.info(`[webhook] Brewery ${meta.brewery_id} subscription cancelled — downgraded to free`);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        if (!invoice.subscription) break;

        // Try brewery lookup first
        const { data: brewery } = await supabase
          .from("breweries")
          .select("id, name")
          .eq("stripe_customer_id", invoice.customer)
          .single() as any;

        if (brewery) {
          console.warn(`[webhook] Payment failed for brewery ${brewery.id} (${brewery.name}). Attempt: ${invoice.attempt_count}`);
        } else {
          // Try brand lookup
          const { data: brand } = await supabase
            .from("brewery_brands")
            .select("id, name")
            .eq("stripe_customer_id", invoice.customer)
            .single() as any;

          if (brand) {
            console.warn(`[webhook] Payment failed for brand ${brand.id} (${brand.name}). Attempt: ${invoice.attempt_count}`);
          }
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object;

        // Try brewery lookup first
        const { data: brewery } = await supabase
          .from("breweries")
          .select("id, subscription_tier")
          .eq("stripe_customer_id", invoice.customer)
          .single() as any;

        if (brewery) {
          console.info(`[webhook] Invoice paid for brewery ${brewery.id}. Tier: ${brewery.subscription_tier}`);
        } else {
          // Try brand lookup
          const { data: brand } = await supabase
            .from("brewery_brands")
            .select("id, subscription_tier")
            .eq("stripe_customer_id", invoice.customer)
            .single() as any;

          if (brand) {
            console.info(`[webhook] Invoice paid for brand ${brand.id}. Tier: ${brand.subscription_tier}`);
          }
        }
        break;
      }

      case "customer.subscription.trial_will_end": {
        const sub = event.data.object;
        const meta = sub.metadata ?? {};

        if (meta.type === "brand" && meta.brand_id) {
          console.info(`[webhook] Trial ending soon for brand ${meta.brand_id}`);
        } else if (meta.brewery_id) {
          console.info(`[webhook] Trial ending soon for brewery ${meta.brewery_id}`);
        }
        break;
      }

      default:
        // Unhandled event type — ignore
        break;
    }
  } catch (err: any) {
    console.error("[webhook] Handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
