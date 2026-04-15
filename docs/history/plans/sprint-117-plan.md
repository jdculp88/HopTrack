# Sprint 117 — The Dashboard

**Arc:** Multi-Location (Sprints 114-137)
**Theme:** Make multi-location brands tangible — aggregated analytics for owners, interactive map for consumers
**Date:** 2026-04-02

---

## Goals

### Goal 1: Brand Dashboard (Brewery Admin)
Create `/brewery-admin/brand/[brand_id]/page.tsx` — the brand-level dashboard with aggregated analytics across all locations.

**Components:**
- Brand hero header (logo, name, location count)
- Today's Snapshot bar (total visits, beers poured, active now across all locations)
- KPI grid (this week visits, total sessions, unique visitors, followers)
- Per-location breakdown card (which location drives the most traffic)
- Top Beers across all locations (grouped by beer name)
- Weekly trend sparkline
- Cross-location unique visitors metric
- Recent activity feed (aggregated across locations)

**API:**
- `GET /api/brand/[brand_id]/analytics` — aggregated stats across all brand locations
- `GET /api/brand/[brand_id]/sessions/active` — real-time active session count

**Architecture notes (Jordan):**
- All queries use `.in("brewery_id", locationIds)` pattern
- Reuse `Sparkline`, `RecentActivityFeed` from existing `DashboardClient`
- Skip ROI card and POS card (brewery-scoped, not brand-level)
- Access guard: verify `brand_accounts` membership (owner or regional_manager)

### Goal 2: Consumer Brand Page Map
Add interactive `BreweryMap` to `/brand/[slug]` consumer page, showing all brand locations on a map.

**Components:**
- Dynamic import of existing `BreweryMap` component (SSR-safe)
- Map positioned between brand hero and location grid
- Location data already fetched (latitude, longitude in current query)
- Type adaptation: cast location data to satisfy `BreweryWithStats` shape

### Goal 3: Brand Nav Update
- Update `BreweryAdminNav` to link to brand dashboard as top-level entry point
- Brand dashboard becomes the default landing when navigating to a brand

---

## What's NOT in this sprint
- Sprint 118: Per-location billing add-on ($29-49/location Stripe integration)
- Sprint 119+: Shared beer catalog across locations
- Sprint 120+: Brand-wide loyalty programs

---

## Team
- **Morgan** — Sprint coordination, plan, retro
- **Jordan** — Architecture review, pattern enforcement
- **Avery** — Implementation (dashboard, API, map, nav)
- **Alex** — Dashboard feel, map UX, responsive layout
- **Casey** — QA sign-off
- **Reese** — Test coverage for new API endpoints

---

## Definition of Done
- [ ] Brand dashboard page loads with aggregated stats for all locations
- [ ] Per-location breakdown shows traffic distribution
- [ ] Top beers aggregated across locations
- [ ] Active sessions counter works across all brand locations
- [ ] Consumer brand page shows interactive map with gold pins
- [ ] Map auto-centers and auto-zooms to fit all locations
- [ ] Brand admin nav links to dashboard as default
- [ ] Access guard on brand dashboard (brand_accounts membership required)
- [ ] Loading skeleton on brand dashboard
- [ ] Mobile responsive
