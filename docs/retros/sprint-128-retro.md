# Sprint 128 Retro — The Menu

**Facilitated by:** Morgan
**Date:** 2026-04-02
**Arc:** Multi-Location (Sprints 114-137)

---

## What Shipped

- **Migration 086** — `brewery_menus` table (8 categories, 3 images each, display order, active toggle) + breweries public SELECT RLS fix (S127 carry-over)
- **MultiImageUpload** — reusable component for 1-3 image upload with grid preview
- **3 API endpoints** — GET/POST menus, PATCH/DELETE individual, PATCH reorder (all rate-limited)
- **Admin menus page** — `/brewery-admin/[brewery_id]/menus/` with category cards, inline edit, reorder, toggle visibility, delete
- **Consumer BreweryMenusSection** — horizontal category pills, responsive image grid, full-screen gallery with navigation
- **Menus nav link** — UtensilsCrossed icon in BreweryAdminNav (desktop + mobile)
- **Public API** — `menus` array added to `/api/v1/.../menu` (backward compatible)
- **Types** — `BreweryMenu`, `MenuCategory`, `MENU_CATEGORY_LABELS`
- **15 new tests** (846 -> 861), all passing

**Files:** 9 new, 5 modified, 1 migration

---

## What Went Well

- **Taylor's blocker is gone** — menu uploads were the #1 sales objection for brewpubs, now resolved
- **RLS carry-over fixed** — breweries public SELECT policy finally in a migration file after 127 sprints
- **Clean architecture** — MultiImageUpload is reusable, API follows established patterns, upsert by UNIQUE constraint
- **Consumer UX** — section hidden when empty (no noise), full-screen gallery with swipe, responsive grid
- **Drew approved** — "This is what they need" — 8 categories cover every real brewery scenario

## What Could Be Better

- **Brand-level menu propagation** not built yet — future sprint when brand system needs it
- **No PDF support in new system** — old single-image PDF upload still works but isn't integrated with categories
- **No embed widget support** — menus don't show in the embeddable menu widget yet

## Action Items

- [ ] Run migration 086 on production Supabase
- [ ] Verify brand page locations render after RLS fix
- [ ] Taylor: update demo script with menu upload walkthrough
- [ ] Consider brand-level menu propagation for future sprint

---

## Team Credits

- **Quinn** — Migration 086, RLS fix, schema design
- **Riley** — RLS investigation, infra review
- **Avery** — Admin UI, consumer display, API endpoints, MultiImageUpload
- **Jordan** — Architecture review, approved patterns
- **Alex** — UX validation, responsive design review
- **Casey** — QA sign-off, zero P0s
- **Reese** — 15 new tests, full coverage
- **Drew** — Validated real-world brewery ops fit
- **Taylor** — Validated sales demo readiness
- **Sam** — Acceptance criteria, edge case validation
- **Sage** — Sprint notes, coordination
- **Jamie** — Brand consistency check
- **Morgan** — Sprint plan, facilitated retro

---

## Roast Corner

- Taylor got roasted for saying "sales blocker" 47 times across 3 sprints
- Jordan didn't have to take a walk — team suspects pod person
- Drew "felt that in a GOOD way" — first time in 6 sprints
- Quinn fixed a 127-sprint-old invisible bug — Riley teared up
- Joshua picked Option B on the first try — Drew: "The man is learning"

---

## Stats

| Metric | Value |
|--------|-------|
| New files | 9 |
| Modified files | 5 |
| Migrations | 1 (086) |
| API endpoints | 3 new |
| Tests | 846 -> 861 (+15) |
| P0 bugs | 0 |
| P1 bugs fixed | 1 (brand page RLS) |
| REQs completed | REQ-070 |
