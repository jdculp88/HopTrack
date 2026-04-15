# Sprint 128 — The Menu

**Theme:** Full menu upload system for brewery owners (REQ-070)
**Arc:** Multi-Location (Sprints 114-137)
**Owner:** Morgan
**Date:** 2026-04-02

---

## Why This Sprint

Taylor has flagged menu uploads as a **sales blocker** twice. Every brewery demo hits the same objection: "but we're a brewpub — where's our food menu?" The current single-image upload (Sprint 83) isn't enough. Breweries need to showcase their full food & drink program.

Also fixing the brand page 0-locations RLS bug carried from Sprint 127.

---

## Sprint Goals

### Goal 0: Brand Page RLS Fix (carry-over from S127)
**Owner:** Riley + Quinn
**Scope:** Supabase dashboard audit — check RLS policies on `breweries` table that block server-side queries by `brand_id`. Fix or add policy. Verify brand page renders locations.

### Goal 1: Menu Schema & Storage (Migration 086)
**Owner:** Quinn (Infra Engineer)
**Scope:**
- `brewery_menus` table:
  - `id` UUID PK (default gen_random_uuid())
  - `brewery_id` FK to breweries (NOT NULL)
  - `category` text NOT NULL (one of: 'food', 'happy_hour', 'wine', 'cocktail', 'non_alcoholic', 'seasonal', 'kids', 'brunch')
  - `title` text (optional custom label)
  - `image_urls` text[] NOT NULL DEFAULT '{}' (up to 3 per category)
  - `display_order` int NOT NULL DEFAULT 0
  - `is_active` boolean NOT NULL DEFAULT true
  - `created_at` timestamptz DEFAULT now()
  - `updated_at` timestamptz DEFAULT now()
  - UNIQUE constraint on (brewery_id, category)
- RLS policies:
  - Public SELECT where `is_active = true`
  - Brewery staff INSERT/UPDATE/DELETE (via `brewery_accounts` check)
- Storage: reuse `brewery-covers` bucket with path `{brewery_id}/menus/{category}/{filename}`
- Register `BreweryMenu` in `types/database.ts`

### Goal 2: Admin Menu Management UI
**Owner:** Avery (Dev Lead), Jordan (Architecture review)
**Scope:**
- New page: `/brewery-admin/[brewery_id]/menus/` with `MenusClient.tsx`
- 8 category cards in a responsive grid (2-col mobile, 3-col tablet, 4-col desktop)
- Each card shows: category icon + label, thumbnail preview (first image), image count badge, active/inactive toggle, edit button
- Edit mode per category: upload up to 3 images (extend `MenuUpload` for multi-image), drag-to-reorder images, delete individual images, custom title field
- Display order: drag-to-reorder categories (or simple up/down arrows)
- "Menus" nav link added to `BreweryAdminNav` (with UtensilsCrossed icon)
- API endpoints:
  - `GET /api/brewery/[brewery_id]/menus` — list all menus for this brewery
  - `POST /api/brewery/[brewery_id]/menus` — create/update a menu category (upsert by category)
  - `DELETE /api/brewery/[brewery_id]/menus/[menu_id]` — delete a menu category
  - `PATCH /api/brewery/[brewery_id]/menus/reorder` — update display_order for all categories

### Goal 3: Consumer Menu Display
**Owner:** Avery (Dev Lead), Alex (UX review)
**Scope:**
- `BreweryMenusSection` component on brewery detail page
  - Shows below tap list section
  - Horizontal scroll category pills (only active categories)
  - Image grid per selected category (1-3 images)
  - Tap image → `FullScreenDrawer` gallery with swipe navigation
  - Hidden entirely if brewery has no active menus
  - AnimatePresence transitions between categories
  - `card-bg-featured` background treatment
- Update brewery detail page query to fetch from `brewery_menus`
- `loading.tsx` skeleton for menu section

### Goal 4: Public API Update
**Owner:** Avery
**Scope:**
- Update `GET /api/v1/breweries/[brewery_id]/menu` to include `brewery_menus` data alongside existing beer/item data
- New field in response: `menus: [{ category, title, image_urls, display_order }]`
- Backward compatible — existing `menu_image_url` field stays

### Goal 5: Tests
**Owner:** Reese (QA Automation)
**Scope:**
- `lib/__tests__/menus.test.ts` — menu API validation, category constraints, image URL limits
- Menu admin page smoke tests
- Consumer display render tests
- Target: 10+ new tests (846 → 856+)

---

## What We're NOT Doing

- PDF menu support in the new system (existing PDF upload from S83 stays as-is)
- Brand-level menu management (future sprint — propagate menus across locations)
- Menu item data entry (typed dishes with prices) — this is image-based only
- Embed widget menu section (future enhancement)

---

## Categories (8 total)

| Key | Label | Icon |
|-----|-------|------|
| `food` | Food Menu | UtensilsCrossed |
| `happy_hour` | Happy Hour | Clock |
| `wine` | Wine List | Wine |
| `cocktail` | Cocktail Menu | Martini |
| `non_alcoholic` | Non-Alcoholic | GlassWater |
| `seasonal` | Seasonal / Special | Sparkles |
| `kids` | Kids Menu | Baby |
| `brunch` | Brunch | Coffee |

---

## File Plan

### New Files
- `supabase/migrations/086_brewery_menus.sql`
- `app/(brewery-admin)/brewery-admin/[brewery_id]/menus/page.tsx`
- `app/(brewery-admin)/brewery-admin/[brewery_id]/menus/MenusClient.tsx`
- `app/(brewery-admin)/brewery-admin/[brewery_id]/menus/loading.tsx`
- `app/api/brewery/[brewery_id]/menus/route.ts`
- `app/api/brewery/[brewery_id]/menus/[menu_id]/route.ts`
- `app/api/brewery/[brewery_id]/menus/reorder/route.ts`
- `components/brewery/BreweryMenusSection.tsx`
- `lib/__tests__/menus.test.ts`

### Modified Files
- `types/database.ts` — add BreweryMenu interface
- `components/brewery-admin/BreweryAdminNav.tsx` — add Menus link
- `app/(app)/brewery/[id]/page.tsx` — add BreweryMenusSection
- `app/api/v1/breweries/[brewery_id]/menu/route.ts` — add menus data
- `components/ui/MenuUpload.tsx` — extend for multi-image support

---

## Team Assignments

| Who | What |
|-----|------|
| **Morgan** | Sprint plan, coordination, retro |
| **Sage** | Spec review, test plan |
| **Quinn** | Migration 086, RLS policies, storage paths |
| **Riley** | RLS fix (brand page S127 carry-over), infra review |
| **Avery** | Admin UI, consumer display, API endpoints |
| **Jordan** | Architecture review, pattern enforcement |
| **Alex** | UX review on consumer menu display, category icons |
| **Casey** | QA sign-off |
| **Reese** | Test automation |
| **Drew** | Validate: "Does this solve the food menu problem?" |
| **Taylor** | Validate: "Can I demo this to a brewpub?" |
| **Sam** | Acceptance criteria, edge cases |

---

## Success Criteria

- [ ] Brewery owner can upload up to 3 images per menu category (8 categories)
- [ ] Brewery owner can toggle categories active/inactive
- [ ] Brewery owner can reorder categories
- [ ] Consumer sees menu section on brewery detail page with category pills
- [ ] Tapping an image opens full-screen gallery
- [ ] No menus = section hidden (no empty state noise)
- [ ] Brand page shows locations (RLS fix verified)
- [ ] Public API returns menu data
- [ ] 10+ new tests passing
- [ ] Drew says "yes, this is what they need"
- [ ] Taylor says "I can sell with this"
