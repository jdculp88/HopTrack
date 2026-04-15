# Sprint 118 — The Tap Network
**Theme:** Brand-level tap list management across all locations
**Arc:** Multi-Location (Sprint 5 of 24)
**PM:** Morgan

---

## Goals

### Goal 1: Brand Tap List Dashboard
New page at `/brewery-admin/brand/[brand_id]/tap-list/` — a unified view of every beer across all brand locations.

**Features:**
- **Master beer catalog** — all beers across all locations, grouped by lowercase name (same beer at different locations = one row)
- **Per-beer location matrix** — colored dots showing which locations have each beer on tap, off tap, 86'd, or not listed
- **Filter pills** — All / On Tap / Off Tap / Shared / Unique + text search
- **Batch edit mode** — select multiple beers, then Put On Tap / Take Off Tap / 86 / Un-86 across all their locations at once
- **Push to locations** — expand any beer → "Push to N more locations" → pick targets → clone beer + pour sizes
- **Stats per beer** — total pours + avg rating across all locations
- **Stats bar** — On Tap / Off Tap / Unique Beers / Shared counts

### Goal 2: Brand Tap List API
- `GET /api/brand/[brand_id]/tap-list` — aggregated beer catalog with per-location status + pour stats
- `POST /api/brand/[brand_id]/tap-list/push` — clone beer(s) from source to target locations (with pour sizes)
- `PATCH /api/brand/[brand_id]/tap-list/batch` — batch update is_on_tap/is_86d across locations

### Goal 3: Brand Dashboard Integration
- **Tap List nav link** — gold-bordered button in brand dashboard header (alongside Settings)
- **Tap Overview card** — clickable card on dashboard showing On Tap / Off Tap / Unique / Shared counts, links to tap list page

---

## Architecture Decisions

- **No migration needed** — beers table already has brewery_id, is_on_tap, is_86d, all required fields
- **Push = clone** — pushing a beer creates a NEW beer record at the target brewery with the same name/style/abv/ibu/description/glass_type. Each location independently manages their copy (prices, pour sizes, on-tap status). This matches real brewery operations: same recipe, different prices per taproom.
- **Grouping by `name.toLowerCase().trim()`** — same pattern already used in brand analytics top beers
- **Auth** — brand owner or regional_manager (existing brand_accounts check)
- **Dedup on push** — won't create a duplicate if a beer with the same name (case-insensitive) already exists at the target location

---

## Files Created
- `app/api/brand/[brand_id]/tap-list/route.ts` — GET aggregated catalog
- `app/api/brand/[brand_id]/tap-list/push/route.ts` — POST push/clone beer to locations
- `app/api/brand/[brand_id]/tap-list/batch/route.ts` — PATCH batch status updates
- `app/(brewery-admin)/brewery-admin/brand/[brand_id]/tap-list/page.tsx` — server page
- `app/(brewery-admin)/brewery-admin/brand/[brand_id]/tap-list/BrandTapListClient.tsx` — interactive client
- `app/(brewery-admin)/brewery-admin/brand/[brand_id]/tap-list/loading.tsx` — skeleton loader

## Files Modified
- `app/(brewery-admin)/brewery-admin/brand/[brand_id]/dashboard/page.tsx` — tap stats fetch + Tap List nav link
- `app/(brewery-admin)/brewery-admin/brand/[brand_id]/dashboard/BrandDashboardClient.tsx` — Tap Overview card

---

## Team Credits
- **Morgan** 🗂️ — Sprint scoping, plan, coordination
- **Jordan** 🏛️ — Architecture review (clone-on-push pattern, no migration needed)
- **Avery** 💻 — All implementation (3 API routes, page + client, dashboard integration)
- **Drew** 🍻 — Validated real-world model (same beer, different prices per taproom)
- **Alex** 🎨 — Location color dots, push modal, batch action bar design
