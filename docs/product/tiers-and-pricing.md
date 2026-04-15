# Tiers & Pricing — Product View

*The strategy behind HopTrack's three tiers.* Owned by [Morgan](../../CLAUDE.md). Sales operationalization lives in [sales/pricing-and-tiers.md](../sales/pricing-and-tiers.md); billing implementation in [architecture/billing-and-stripe.md](../architecture/billing-and-stripe.md).

**Back to [product](README.md) · [wiki home](../README.md).**

---

## The three tiers

| Tier | Price | Design intent | Who signs up |
|---|---|---|---|
| **Tap** | $49/mo | The cheapest thing that's still unambiguously useful. Must stand on its own. | Single-location breweries, first-time SaaS buyers, post-trial conversions. |
| **Cask** | $149/mo | The "we're a real business" tier. Unlocks intelligence + AI + premium brand surface. | Breweries that track things, 2-5 locations, anyone who's already using Google Sheets for loyalty. |
| **Barrel** | custom | The conversation-required tier. Implies services, onboarding, maybe contracts. | 5+ location brands, distributor-adjacent, anyone with a procurement process. |

## Tier gating (how we enforce it)

- [lib/tier-gates](../../lib/) + [lib/brand-tier-gates](../../lib/) — the server-side gate.
- [REQ-082](../requirements/REQ-082-tier-feature-matrix.md) — the feature/tier matrix.
- [lib/__tests__/tier-gates.test.ts](../../lib/__tests__/tier-gates.test.ts), [lib/__tests__/brand-tier-gates.test.ts](../../lib/__tests__/brand-tier-gates.test.ts) — guards.

Grace period on failed payments is built into the tier check — see [architecture/billing-and-stripe.md](../architecture/billing-and-stripe.md).

## What moves between tiers

Decisions on what to gate at what tier are product decisions, revisited when:

- A feature's usage pattern is clearly "everyone uses it" — consider moving down.
- A feature's ROI for the brewery is outsized — consider moving up.
- Sales friction data ([first-close-simulation-report](../sales/first-close-simulation-report.md)) suggests a specific feature is blocking conversion.

Never move a feature down once breweries have paid for it — that's a refund event.

## Pricing cadence

- **Launch pricing is locked for 12 months** post-first-close.
- After 12 months, Morgan + Taylor review with actual MRR data and decide whether to raise, segment more, or hold.

## Revenue model

- **500 paid breweries × average $150 ARPU = $75K MRR** is the 6-month post-launch target. See [sales/README.md](../sales/README.md).
- Add-ons (per-location for Cask+) bend the ARPU curve.
- Churn assumption is aggressive — retention is Parker's fight.

## Cross-links

- [sales/pricing-and-tiers.md](../sales/pricing-and-tiers.md) — the tactical sales version.
- [architecture/billing-and-stripe.md](../architecture/billing-and-stripe.md) — the implementation.
- [REQ-082](../requirements/REQ-082-tier-feature-matrix.md) — the feature/tier REQ.
- [REQ-089](../requirements/REQ-089-stripe-billing.md) — the billing REQ.
