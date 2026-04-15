# Multi-Location Brand Rollup

*How HopTrack represents a brand with multiple brewery locations.* Owned by [Avery](../../.claude/agents/avery.md). Product context: [Morgan](../../CLAUDE.md). Brewery-ops context: [Drew](../../.claude/agents/drew.md).

**Back to [architecture](README.md) · [wiki home](../README.md).**

---

## The arc

The Multi-Location arc ran Sprints 114-137 (the CLOSED arc in [history/README.md](../history/README.md)). It was the single biggest architectural shift in HopTrack's life: going from "a brewery is an account" to "a brand owns locations, each of which has taps, staff, and customers." The umbrella requirement is [REQ-072](../requirements/REQ-072-multi-location-brewery-support.md).

## The data model at the top level

```
brand
  └── location (1-to-many)
        ├── staff (location-scoped)
        ├── tap_list
        ├── menu
        └── sessions
brand_catalog_beers (one inventory, all locations pull from it)
brand_loyalty_passport (stamps earn-anywhere, redeem-anywhere)
brand_team_members (owner / brand-manager / regional-manager)
```

Full schema lives in [supabase/migrations/](../../supabase/migrations/). The clean-slate passes are migrations **072** (multi-location schema, [Sprint 114](../history/retros/sprint-114-retro.md)), **077** (catalog, [Sprint 119](../history/retros/sprint-119-retro.md)), **080** (team roles, [Sprint 122](../history/retros/sprint-122-retro.md)), **082** (brand loyalty, [Sprint 125](../history/retros/sprint-125-retro.md)).

## The big rules

1. **Brand is the billing boundary.** One subscription, multiple locations. Add-on per location. See [billing-and-stripe.md](billing-and-stripe.md) and [REQ-089](../requirements/REQ-089-stripe-billing.md).
2. **Catalog is the beer boundary.** A brand has a single `brand_catalog_beers` table; locations pull into their tap lists from the catalog. See [REQ-072](../requirements/REQ-072-multi-location-brewery-support.md) and the catalog UI ([Sprint 119](../history/retros/sprint-119-retro.md)).
3. **Loyalty is the customer boundary.** Drinkers earn and redeem across locations via brand_loyalty_passport. See [REQ-096](../requirements/REQ-096-brand-loyalty.md).
4. **Team roles are the access boundary.** Three tiers — Owner / Brand Manager / Regional Manager ([REQ-095](../requirements/REQ-095-brand-team-roles.md)) — with Regional Manager location-scoped. Audit log tracks sensitive actions.
5. **CRM is the intelligence boundary.** Brand CRM aggregates across locations ([Sprint 129](../history/retros/sprint-129-retro.md)) without breaking location-level privacy between brewery owners who don't share a brand.

## Brewery-admin nav structure

Reorganized in [Sprint 133](../history/retros/sprint-133-retro.md) ([REQ-094](../requirements/REQ-094-brewery-admin-nav.md)) into 6 groups:

- **Overview** — dashboard, Brewery Health, Magic Number.
- **Content** — tap list, menu, catalog, announcements.
- **Engage** — promotions, challenges, mug clubs, CRM.
- **Insights** — analytics, KPIs, benchmarks.
- **Operations** — staff, POS, locations.
- **Account** — billing, team, settings.

Collapsible sidebar; mobile "More" sheet. Propagated to every brand location via the nav context fix in [Sprint 123](../history/retros/sprint-123-retro.md).

## Propagation

When an Owner ships a change (nav layout, tap-list template, loyalty rules), Brand Manager and location admins see the "propagated" badge. Tests: [lib/__tests__/brand-propagation.test.ts](../../lib/__tests__/brand-propagation.test.ts).

## Tap network

[Sprint 118](../history/retros/sprint-118-retro.md) built the brand-level tap list management — unified catalog, location matrix, push-to-locations, batch edit. The catalog underneath is [Sprint 119](../history/retros/sprint-119-retro.md).

## Storefront (consumer-facing)

Public brewery pages ([Sprint 131](../history/retros/sprint-131-retro.md), [REQ-097](../requirements/REQ-097-storefront.md)) are brand-aware. Tier-gated premium sections.

## Test battery

The multi-location arc has the biggest coverage in the repo. The full set from [testing/coverage-map.md](../testing/coverage-map.md):

- [brand-auth.test.ts](../../lib/__tests__/brand-auth.test.ts)
- [brand-billing.test.ts](../../lib/__tests__/brand-billing.test.ts)
- [brand-crm.test.ts](../../lib/__tests__/brand-crm.test.ts)
- [brand-digest.test.ts](../../lib/__tests__/brand-digest.test.ts)
- [brand-loyalty.test.ts](../../lib/__tests__/brand-loyalty.test.ts)
- [brand-onboarding.test.ts](../../lib/__tests__/brand-onboarding.test.ts)
- [brand-propagation.test.ts](../../lib/__tests__/brand-propagation.test.ts)
- [brand-routes-use-shared-auth.test.ts](../../lib/__tests__/brand-routes-use-shared-auth.test.ts)
- [brand-team-activity.test.ts](../../lib/__tests__/brand-team-activity.test.ts)
- [brand-tier-gates.test.ts](../../lib/__tests__/brand-tier-gates.test.ts)

## Lessons and scars

- [Sprint 123 retro](../history/retros/sprint-123-retro.md) — RLS recursion fix, 16 API routes standardized.
- [Sprint 126 retro](../history/retros/sprint-126-retro.md) — Joshua's "worst sprint" feedback. Proximity feature shipped but the brewery page crashed. Hardened in S127.
- [Sprint 127 retro](../history/retros/sprint-127-retro.md) — "The Reckoning." P0 perks crash fixed (33-sprint-old bug).
- [Sprint 147 retro](../history/retros/sprint-147-retro.md) — Brand Team RLS bug fixed, 14 sprints after introduction.

## Cross-links

- [auth-and-rls.md](auth-and-rls.md) — how brand roles are enforced.
- [billing-and-stripe.md](billing-and-stripe.md) — the billing boundary.
- [intelligence-layer.md](intelligence-layer.md) — brand-level Magic Number and Health Score.
- [REQ-072 Multi-Location Brewery Support](../requirements/REQ-072-multi-location-brewery-support.md).
