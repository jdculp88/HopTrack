# REQ-089 — Stripe Billing + E2E
**Status:** ✅ Complete · **Sprints:** 41-50 (Make It Crisp arc) · **Backfilled:** 2026-04-15

## Summary
Brewery billing via Stripe — checkout, webhooks, tier enforcement, trial lifecycle. Evolved into brand-level billing in Sprint 121 (REQ-072 arc).

## Acceptance Criteria
- [x] Stripe checkout and webhook receivers.
- [x] Three tiers: Tap ($49), Cask ($149), Barrel (custom).
- [x] Trial lifecycle with expiration warnings.
- [x] Later consolidated into brand billing in Sprint 121.

## Implementation
- Primary: [lib/stripe](../../lib/), [app/api/stripe/](../../app/)
- Brand-level: [lib/brand-billing](../../lib/)
- Webhooks: [app/api/webhooks/](../../app/)

## Tests
- Unit: [stripe.test.ts](../../lib/__tests__/stripe.test.ts), [brand-billing.test.ts](../../lib/__tests__/brand-billing.test.ts)
- Lifecycle cron: [cron-trial-lifecycle.test.ts](../../lib/__tests__/cron-trial-lifecycle.test.ts)

## History
- Arc plan: [sprint-41-50-master-plan.md](../history/plans/sprint-41-50-master-plan.md)
- Retros: across sprints 41-50 — see [history/README.md](../history/README.md)

## See also
- [architecture/billing-and-stripe.md](../architecture/billing-and-stripe.md) · [sales/pricing-and-tiers.md](../sales/pricing-and-tiers.md) · [REQ-082](REQ-082-tier-feature-matrix.md)
