# Sprint 117 Retro — "The Dashboard"

**Facilitated by:** Morgan 🗂️
**Date:** 2026-04-02
**Arc:** Multi-Location (Sprints 114-137)

---

## What We Shipped

**Brand Dashboard** — Aggregated analytics across all brand locations at `/brewery-admin/brand/[brand_id]/dashboard`. Today's Snapshot bar, 5 KPI cards with WoW trend, cross-location visitors metric, per-location breakdown with animated progress bars, top beers grouped by name across locations, weekly trend sparkline, recent activity feed. Two new API endpoints: brand analytics + brand active sessions.

**Consumer Brand Page Map** — Interactive Leaflet map on `/brand/[slug]` with gold HopTrack pins. Auto-centers and auto-zooms to fit all locations. SSR-safe via BrandMapClient wrapper.

**Brand Nav Update** — "Brand Settings" → "Brand Dashboard" as the default brand entry point in brewery admin nav. Brand group header in switcher dropdown links to dashboard.

---

## What Went Well

- **Clean aggregation pattern** — `.in("brewery_id", locationIds)` with `Promise.all` parallel fetch. Scales to 10-20 locations easily. (Jordan)
- **Cross-location visitors metric** — The killer insight that justifies per-location pricing. (Sam, Taylor)
- **Zero migrations** — Pure application code sprint. No schema changes needed. (Riley, Quinn)
- **Build passes clean** — All new routes compile, zero console errors on brewery admin. (Casey)
- **Consumer map reuse** — Existing `BreweryMap` component dropped in with minimal adaptation. (Avery)
- **Fast delivery** — 7 new files, 2 modifications, full feature delivered in one sprint. (Avery)

## What Could Be Better

- **Duplicated aggregation logic** — Analytics computation exists in both the API route and the server page. Should DRY up in Sprint 118. (Jordan)
- **No seed brand data** — Can't browser-test the brand dashboard without creating a brand manually. Need seed brand + locations. (Casey)
- **No unit test coverage** — Brand analytics aggregation (cross-location visitors, beer name grouping) needs Vitest tests. (Reese)
- **OpenStreetMap tiles** — Free but visually plain. Consider Mapbox styling eventually. (Alex)

## The Roast 🔥

- Casey: Joshua picked dashboard over billing. Character development.
- Jordan: Avery duplicated analytics logic. Jordan took a walk.
- Alex: OpenStreetMap tiles are ugly. Alex is choosing peace.
- Drew: 11 seed customers drinking on a Monday. Fictional intervention needed.
- Taylor: Morgan picked the exact roadmap sprint number. Jordan should blink twice.
- Morgan: "...this is a living document."

---

## Sprint 117 — By the Numbers

| Metric | Count |
|--------|-------|
| New files | 7 |
| Modified files | 2 |
| New migrations | 0 |
| New API endpoints | 2 |
| New pages | 1 (+ loading skeleton) |
| Enhanced pages | 1 |
| Nav updates | 1 |
| Build status | Clean ✅ |
| Console errors | 0 |

---

## Carry-forward → Sprint 118
- Seed a brand with multiple locations for regression testing
- Vitest coverage for brand analytics aggregation
- DRY up duplicated analytics code (API route vs server page)
- Per-location billing add-on ($29-49/location Stripe integration)

---

## Team Credits

- **Morgan** 🗂️ — Sprint planning, coordination, ceremony
- **Sage** 📋 — Notes, definition of done tracking
- **Jordan** 🏛️ — Architecture review, aggregation pattern design
- **Avery** 💻 — All implementation (APIs, dashboard, map, nav, skeleton)
- **Alex** 🎨 — Dashboard feel approval, map UX
- **Casey** 🔍 — QA sign-off, regression gap flagged
- **Reese** 🧪 — Test coverage gap flagged
- **Riley** ⚙️ — Infra review, no changes needed
- **Quinn** ⚙️ — Migration state verified, RLS chain confirmed
- **Sam** 📊 — Business value analysis, cross-location insight
- **Taylor** 💰 — Revenue impact, sales demo potential
- **Drew** 🍻 — Ops validation, location breakdown approved
- **Jamie** 🎨 — Brand moment approval, consumer map UX
