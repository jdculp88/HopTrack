# REQ-070: Non-Beer Menu Uploads for Breweries

**Status:** QUEUED
**Priority:** P1
**Category:** New Feature
**Sides:** Brewery + Consumer
**Effort:** S-M (2-3 sprints)
**Related:** REQ-058 (F-011 structured non-beer items)
**Sprint Arc:** Launch or Bust (Sprints 75-78) or Stick Around (79-84)

## Problem

Modern taprooms serve cocktails, wine, food, NA beverages, and host events. HopTrack has no way for breweries to display non-beer menus on their profile. This makes HopTrack look "beer only" to brewpubs, weakens Taylor's sales pitch, and hides the full customer offering from consumers.

Untappd charges $300/yr extra for non-beer menu support. We can offer it included.

## Solution

### Approach: Image Upload First

Breweries already have menus as printed cards, PDFs, or photos. Image upload = zero friction to get started. Structured menu entry (REQ-058) layers on top later.

### 8 Menu Categories

| Category | Description |
|----------|-------------|
| Food Menu | Main food offerings |
| Happy Hour | Time-limited specials |
| Wine List | Wine selections |
| Cocktail Menu | Mixed drinks |
| Non-Alcoholic | NA beers, sodas, mocktails |
| Seasonal/Special | Limited-time menus |
| Kids Menu | Family-friendly options |
| Brunch | Weekend brunch menus |

Up to 3 images per category. Max 8 categories. Stored in Supabase Storage `brewery-menus` bucket.

### Migration Required

New `brewery_menus` table: id, brewery_id, category, title, image_urls[], display_order, is_active, timestamps. RLS: public read active, brewery staff full CRUD.

### Brewery Admin UX

- New "Menus" tab in admin sidebar
- Grid of menu categories with thumbnails
- Upload/replace images per category (reuse ImageUpload pattern)
- Drag-to-reorder categories
- Toggle active/inactive
- Preview button

### Consumer UX (Public Profile)

- "Menus" section on brewery profile, below tap list
- Horizontal scroll category pills
- Tap category → full-screen image gallery (FullScreenDrawer)
- Hidden if no menus uploaded

### API Endpoints

- `GET /api/brewery/[brewery_id]/menus` — public
- `POST /api/brewery/[brewery_id]/menus` — authenticated
- `DELETE /api/brewery/[brewery_id]/menus/[menu_id]` — authenticated
- `PATCH /api/brewery/[brewery_id]/menus/reorder` — authenticated

## Acceptance Criteria

1. Upload up to 3 images per menu category (8 categories)
2. Supabase Storage with proper RLS
3. Reorder, toggle active/inactive, delete categories
4. Public profile shows "Menus" section with active categories
5. Full-screen image viewer on tap
6. File validation: JPEG/PNG/WebP, max 5MB per image
7. Empty state: section hidden if no menus
8. Mobile-responsive gallery
9. New migration for `brewery_menus` table + RLS
10. Lazy-load images for performance

## Relationship to REQ-058

REQ-058 proposes structured non-beer items (wine, cocktails, NA) as trackable entities in the tap list and check-in flow. That's a larger effort (4-5 sprints, multiple schema changes).

REQ-070 is the pragmatic first step: photo menus remove the sales objection now. REQ-058 builds on top later when paying breweries ask for structured tracking.

---

## RTM Links

### Implementation
[lib/menus](../../lib/)

### Tests
[menus.test.ts](../../lib/__tests__/menus.test.ts)

### History
- [retro](../history/retros/sprint-128-retro.md)
- [plan](../history/plans/sprint-82-plan.md)

> Added 2026-04-15 during the wiki reorg — see the [RTM](README.md) for the master table.
