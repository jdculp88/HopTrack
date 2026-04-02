# Sprint 129 Retro — "The Transfer"

**Facilitated by:** Morgan 🗂️
**Date:** 2026-04-02
**Arc:** Multi-Location (Sprint 16 of ~24)

---

## What Shipped

Sprint 129 — **The Transfer** — Cross-Location Customer Intelligence.

Brand owners can now see WHO their cross-location customers are, view per-customer profiles across all locations, and surface insights like "regulars at one location who haven't visited others."

### Deliverables
- **`lib/brand-crm.ts`** — 3 pure functions: `buildBrandCustomerList`, `buildBrandCustomerProfile`, `findRegularsAtOtherLocations`. Reuses `computeSegment()`, `computeEngagementScore()` from `lib/crm.ts`.
- **`lib/brand-auth.ts`** — `verifyBrandAccessWithScope()` returns `{ role, locationScope }` for regional manager scoping. Additive — doesn't break existing `verifyBrandAccess()`.
- **2 API endpoints:** `GET /api/brand/[brand_id]/customers` (list with search/segment/sort/pagination) and `GET /api/brand/[brand_id]/customers/[user_id]` (full cross-location profile).
- **Brand Customer List page** — segment filter pills (All/New/Regular/Power/VIP/Cross-Location), sort controls, "Cross-Location Visitors" highlight card, "Regulars at Your Other Locations" insight card.
- **Brand Customer Profile page** — header with brand segment badge + cross-location badge, stats grid (visits/locations/beers/rating), location breakdown cards (per-location visits/beers/favorite), journey timeline with location-colored dots, taste profile, favorite beers, brand loyalty card status.
- **Loading skeletons** for both pages.
- **Nav update** — "Brand Customers" link in desktop sidebar (between Reports and Team) + mobile tab strip.
- **Migration 087** — `idx_brewery_visits_brewery_id` index for fast cross-location queries.
- **13 new tests** in `lib/__tests__/brand-crm.test.ts` (874 total).

### Key Design Decisions
1. **No new tables** — all data exists in `brewery_visits`, `sessions`, `beer_logs`. Just aggregation + presentation.
2. **`brewery_visits` for list, raw sessions for detail** — pre-aggregated table keeps list fast; detail page needs full timeline.
3. **"Cross-Location" is a UI filter, not a real segment** — doesn't pollute the visit-count-based segment taxonomy.
4. **`verifyBrandAccessWithScope` is additive** — new function alongside existing `verifyBrandAccess`, no breaking changes.
5. **Regional manager scoping** — `location_scope` array filters which locations' customers are visible throughout.

---

## Team Credits

- **Jordan** 🏛️ — Architecture review, approved pure function approach, minimal schema changes
- **Avery** 💻 — Built everything: 10 files, 2 mods, 1 migration. Fixed type error in 30 seconds.
- **Sam** 📊 — Validated the "Regulars at Other Locations" insight as the key business value
- **Alex** 🎨 — Location dot color system, journey timeline visual design
- **Casey** 🔍 — QA sign-off, zero P0s
- **Reese** 🧪 — 13 new tests, 874 total. Covered.
- **Riley** ⚙️ — Migration 087 review (index-only, lowest risk)
- **Quinn** ⚙️ — Migration state verification
- **Drew** 🍻 — Real-world validation (wants events next sprint, 3x deferred)
- **Taylor** 💰 — Barrel-tier demo validation, demo script update queued
- **Jamie** 🎨 — Color system approval (gold/purple/teal insight cards)
- **Sage** 📋 — Notes, scope tracking, deferred options doc updated

---

## The Roast 🔥

- Drew has asked for events three sprints in a row. Joshua keeps picking other things. Drew is "starting to think you just enjoy watching me beg."
- Avery's `Map<unknown, unknown>` type error lasted 30 seconds. Jordan still had to take a walk.
- Avery pointed out Jordan's own brand analytics route has the exact same uncast Map pattern. Jordan chose silence.
- Casey noticed the preview server failed three times. "Who's running something on port 3000?"
- Taylor has called every feature since Sprint 119 "the Barrel-tier differentiator." Sam says it's funnier every time.
- Morgan smiled at Jordan's silence. (Documented. Canonical.)

---

## Stats

| Metric | Value |
|--------|-------|
| New Files | 10 |
| Modified Files | 2 |
| Migration | 087 (index only) |
| Tests | 861 → 874 (+13) |
| Build | Clean |
| P0 Bugs | 0 |
| Deferred Items Resolved | The Transfer (2x deferred, SHIPPED) |

---

## Action Items

- [ ] Run migration 086 + 087 on production Supabase
- [ ] Verify brand page locations render after RLS fix (S128 carry)
- [ ] Taylor: update demo script with customer intelligence walkthrough
- [ ] Drew: events next sprint? (3x deferred and counting)

---

## Carry-Forward

- S128: brand-level menu propagation (each location manages menus independently)
- S128: PDF support in categorized menu system
- S128: menus in embeddable widget
- S127: Leaflet lazy-load (dev-only, low priority)
- S127: JSONB type safety audit
