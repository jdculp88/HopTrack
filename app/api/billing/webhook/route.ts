import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

// Required for Stripe webhook signature verification
export const dynamic = "force-dynamic";

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
        const { brewery_id, tier } = session.metadata ?? {};

        if (!brewery_id) break;

        // Store Stripe customer ID + activate subscription
        await supabase
          .from("breweries")
          .update({
            stripe_customer_id: session.customer,
            subscription_tier: tier || "tap",
            trial_ends_at: null, // clear trial — they're paying
          } as any)
          .eq("id", brewery_id);

        console.info(`[webhook] Brewery ${brewery_id} subscribed to ${tier}`);
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object;
        const brewery_id = sub.metadata?.brewery_id;
        if (!brewery_id) break;

        const tier = sub.metadata?.tier;
        const isActive = sub.status === "active" || sub.status === "trialing";

        await supabase
          .from("breweries")
          .update({
            subscription_tier: isActive ? (tier || "tap") : "free",
          } as any)
          .eq("id", brewery_id);

        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const brewery_id = sub.metadata?.brewery_id;
        if (!brewery_id) break;

        // Downgrade to free — read-only mode kicks in
        await supabase
          .from("breweries")
          .update({ subscription_tier: "free" } as any)
          .eq("id", brewery_id);

        console.info(`[webhook] Brewery ${brewery_id} subscription cancelled — downgraded to free`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const sub_id = invoice.subscription;

        if (!sub_id) break;

        // Look up brewery by stripe_customer_id
        const { data: brewery } = await supabase
          .from("breweries")
          .select("id, name")
          .eq("stripe_customer_id", invoice.customer)
          .single() as any;

        if (brewery) {
          console.warn(`[webhook] Payment failed for brewery ${brewery.id} (${brewery.name}). Attempt: ${invoice.attempt_count}`);
          // Stripe handles retries automatically. After final retry fails,
          // subscription.deleted event will fire and we downgrade then.
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object;

        // Confirm payment — ensure tier is still active
        const { data: brewery } = await supabase
          .from("breweries")
          .select("id, subscription_tier")
          .eq("stripe_customer_id", invoice.customer)
          .single() as any;

        if (brewery) {
          console.info(`[webhook] Invoice paid for brewery ${brewery.id}. Tier: ${brewery.subscription_tier}`);
        }
        break;
      }

      case "customer.subscription.trial_will_end": {
        const sub = event.data.object;
        const brewery_id = sub.metadata?.brewery_id;

        if (brewery_id) {
          console.info(`[webhook] Trial ending soon for brewery ${brewery_id}`);
          // Future: trigger trial warning email via email-triggers.ts
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
