# Billing & Stripe

*How HopTrack charges breweries.* Owned by [Jordan](../../.claude/agents/jordan.md). Sales context: [Taylor](../../.claude/agents/taylor.md).

**Back to [architecture](README.md) · [wiki home](../README.md).**

---

## Tiers

Three tiers, aligned with the sales doc in [sales/pricing-and-tiers.md](../sales/pricing-and-tiers.md):

| Tier | Price | Who it's for |
|---|---|---|
| **Tap** | $49/mo | Single-location breweries |
| **Cask** | $149/mo | Premium — analytics, AI promotions, brand features |
| **Barrel** | custom | Enterprise / brand rollups |

Tier → feature mapping lives in [lib/tier-gates](../../lib/). Tests: [lib/__tests__/tier-gates.test.ts](../../lib/__tests__/tier-gates.test.ts). Feature-matrix requirement: [REQ-082](../requirements/REQ-082-tier-feature-matrix.md).

## Lifecycle

1. **Trial start** — new brewery gets a 14-day trial on Tap. Onboarding flow ([Sprint 145](../history/retros/sprint-145-retro.md)) captures intent but not card.
2. **Trial warning** — `trial-lifecycle.yml` cron runs daily and fires warning emails at T-3 and T-1 days.
3. **Conversion** — Stripe Checkout session. Webhook marks the subscription active, tier flips from `trial` to `tap`/`cask`/`barrel`.
4. **Renewal** — Stripe handles it. Webhook updates `subscription_current_period_end`.
5. **Cancellation / failed payment** — grace period (24h), then `checkBrandCovered` gates start failing (Sprint 152).

## Brand-level billing

[Sprint 121](../history/retros/sprint-121-retro.md) consolidated billing from per-location to brand-level ([REQ-072](../requirements/REQ-072-multi-location-brewery-support.md)). A brand has one Stripe subscription that covers all its locations; per-location add-ons ($39/mo) billed separately. The `checkBrandCovered` helper ([Sprint 152](../history/retros/sprint-152-retro.md)) enforces coverage at the API layer — 4 API guards + UI disabled states.

Tests: [lib/__tests__/brand-billing.test.ts](../../lib/__tests__/brand-billing.test.ts), [lib/__tests__/brand-tier-gates.test.ts](../../lib/__tests__/brand-tier-gates.test.ts), [lib/__tests__/stripe.test.ts](../../lib/__tests__/stripe.test.ts).

## Webhooks

Handled at `app/api/webhooks/stripe/`. Idempotent via Stripe event IDs. The Sprint 121 migration added a dual-path webhook that handles both brand and legacy per-location payloads during the transition.

Events we listen to:

- `checkout.session.completed`
- `customer.subscription.updated` / `created` / `deleted`
- `invoice.payment_succeeded` / `payment_failed`

## Failed-payment behavior

We grant a short grace window to avoid single-failure lockouts. After the window, the brewery's premium features degrade gracefully — Cask-only analytics dim, AI promotions pause, brand features go read-only. Core functionality (tap list, check-ins, loyalty) stays up. The brewery sees a billing banner with a re-auth CTA.

## Refunds + manual adjustments

Handled in the Stripe dashboard by Joshua (and eventually [Taylor](../../.claude/agents/taylor.md) when she gets the keys). Never via API — that's in the [compliance guardrails](../compliance/README.md).

## Cross-links

- [sales/pricing-and-tiers.md](../sales/pricing-and-tiers.md) — sales view.
- [product/tiers-and-pricing.md](../product/tiers-and-pricing.md) — strategy view.
- [REQ-089 Stripe Billing](../requirements/REQ-089-stripe-billing.md).
- [operations/ci-cd.md](../operations/ci-cd.md) — trial-lifecycle cron.
- [REQ-072 Multi-Location](../requirements/REQ-072-multi-location-brewery-support.md).
