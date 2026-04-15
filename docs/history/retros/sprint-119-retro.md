# Sprint 119 Retro — The Inventory 🍺

**Date:** 2026-04-02
**Facilitator:** Morgan 🗂️
**Arc:** Multi-Location (Sprint 6 of 24)
**Theme:** Brand-Level Beer Catalog — one source of truth for beers across all locations

---

## What Shipped

- **Migration 077:** `brand_catalog_beers` table + nullable FK on `beers` + data backfill from existing brand beers
- **3 new API endpoints:** Catalog CRUD (GET/POST), single catalog beer (GET/PATCH/DELETE), add-to-locations
- **2 modified API endpoints:** Brand tap list (now catalog-backed with orphan detection), push (supports catalog mode)
- **Brand Catalog page:** Full management UI with search, filters (All/On Tap/Everywhere/Not Pushed/Seasonal/Retired), expandable rows, create/edit/retire/restore/propagate/add-to-locations
- **CatalogPickerModal:** Location tap lists get "From Catalog" button to pull from brand catalog
- **BrandTapListClient:** "Manage Catalog" link, orphan beers section, catalog-based push
- **BeerFormModal:** "Catalog Linked" badge for catalog-linked beers
- **BreweryAdminNav:** "Brand Catalog" link in brand section
- **0 breaking changes** to standalone breweries

---

## Team Credits

- **Jordan** 🏛️ — Architected the separate-table approach, reviewed schema decisions, approved the nullable FK pattern
- **Avery** 💻 — Built everything end-to-end: migration, 3 API endpoints, 2 API refactors, catalog page, picker modal, all UI modifications
- **Alex** 🎨 — Validated catalog page design language matches tap list, approved location dots and stats bar patterns
- **Sam** 📊 — Identified data integrity risk elimination as the key business value
- **Drew** 🍻 — Validated multi-taproom workflow: update once, sync everywhere
- **Casey** 🔍 — Verified 730/730 tests passing, zero P0s, flagged test gap for future sprint
- **Riley** ⚙️ — Validated migration safety: additive only, idempotent backfill, clean RLS
- **Taylor** 💰 — Identified Barrel-tier selling point for regional craft breweries
- **Jamie** 🎨 — Approved brand catalog visual identity and nav placement
- **Sage** 📋 — Sprint coordination and ceremony notes
- **Reese** 🧪 — Confirmed zero test regressions
- **Morgan** 🗂️ — Sprint planning (3 options), scoping, ceremony facilitation

---

## Metrics

| Metric | Value |
|--------|-------|
| New files | 8 |
| Modified files | 7 |
| Migrations | 1 (077) |
| New API endpoints | 3 |
| Modified API endpoints | 2 |
| Tests | 730/730 passing |
| Build | Clean (0 errors) |
| P0 bugs | 0 |

---

## The Roast 🔥

- **Casey**: Joshua voted for Option A faster than he's ever reviewed a PR. Almost like he doesn't even read them.
- **Drew**: Bold of a man who types "locao" to demand a single source of truth for beer data.
- **Jordan**: The build failed once because of a missing `any` annotation. I had to take a walk. A very short walk.
- **Taylor**: Joshua chose "The Inventory" over "The Rollout" which was literally the revenue feature. We're going to be rich... eventually.
- **Morgan**: Joshua picked the right one though. Infrastructure before revenue. This is a living document.

---

## Action Items

1. Add automated tests for catalog endpoints (future QA sprint)
2. Update API reference docs with new catalog endpoints
3. Fix launch.json PATH for preview_start tool (dev environment issue persists from S118)

---

## Key Architecture Decision

**Why a separate `brand_catalog_beers` table instead of a flag on `beers`?**

The `beers` table has an implicit `brewery_id NOT NULL` invariant. A catalog beer belongs to a brand, not a brewery. Overloading `beers` with a nullable `brewery_id` would break every RLS policy and query that assumes a beer always has a brewery. A separate table follows the established pattern (`crawled_beers` is already separate from `beers`). The nullable FK `brand_catalog_beer_id` on `beers` means standalone breweries are completely unaffected — zero-risk addition.
