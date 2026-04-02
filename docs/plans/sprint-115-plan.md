# Sprint 115 Plan — The Brand
**Date:** 2026-04-01
**Arc:** Multi-Location (Sprint 2 of ~24)
**Planned by:** Morgan + Sage
**Architecture review:** Jordan

---

## Sprint Goal
Make brands real. By end of sprint, a brewery owner can create a brand, add a second location, switch between locations in the admin dashboard, and manage brand settings. The consumer brand page gets a basic version.

**Depends on:** Migration 072 (Sprint 114) — `brewery_brands`, `brand_accounts`, `breweries.brand_id`

---

## Goals

### Goal 1: Brand Creation Flow (P0)
**Owner:** Avery (build) · Jordan (architecture review) · Alex (UX)
**Route:** Triggered from brewery admin Settings page

**Flow:**
1. Owner visits Settings → sees "Create Brand" CTA (only if `brand_id` is NULL)
2. Wizard-style modal: Brand name, slug (auto-generated from name, editable), logo upload, description
3. On submit:
   - Creates `brewery_brands` row with `owner_id = current user`
   - Creates `brand_accounts` row (role: `owner`)
   - Sets `brand_id` on current brewery
4. Success state shows "Brand created! You can now add more locations."

**API:** `POST /api/brands` — creates brand + first location link in a transaction
**Component:** `components/brewery-admin/BrandCreateWizard.tsx`
**Validation:** Slug uniqueness check (debounced, like username check)

### Goal 2: Add Location to Brand (P0)
**Owner:** Avery (build) · Drew (ops validation)

**Two paths:**
- **Path A — Claim existing listing:** Search for unclaimed brewery → claim it → set `brand_id`
- **Path B — Create new listing:** Inline form for new location (name, address, GPS) → creates brewery → sets `brand_id`

**API:**
- `POST /api/brands/[brand_id]/locations` — add existing brewery to brand (requires brand owner)
- `POST /api/brands/[brand_id]/locations/new` — create new brewery under brand

**Component:** `components/brewery-admin/AddLocationFlow.tsx`
**Guard:** Only brand owners can add locations. Must have active Cask or Barrel subscription (or trial).

### Goal 3: Brand-Level Role Propagation (P0)
**Owner:** Avery (API) · Quinn (RLS review)

**Rules:**
- Brand `owner` → automatic `owner` access to ALL locations under brand
- Brand `regional_manager` → automatic `manager` access to ALL locations under brand
- When a location is added to a brand, existing brand accounts get `brewery_accounts` rows created
- When a location is removed, brand-propagated `brewery_accounts` rows are cleaned up

**API:** Role propagation logic in a shared function (`lib/brand-roles.ts`)
**Migration 073:** Add `propagated_from_brand` boolean to `brewery_accounts` (default false) — distinguishes brand-inherited access from direct grants, enables clean removal

### Goal 4: Location Selector in Brewery Admin (P1)
**Owner:** Avery (build) · Alex (design)

**Behavior:**
- If user has access to multiple breweries (via brand or direct), show a dropdown in the brewery-admin sidebar/nav
- Dropdown shows brewery name + city for each location
- Selection persists in localStorage + URL
- Brand name shown as group header in dropdown
- Single-location users see no change (dropdown hidden)

**Component:** `components/brewery-admin/LocationSelector.tsx`
**Placement:** Brewery admin sidebar, above nav links

### Goal 5: Brand Settings Page (P1)
**Owner:** Avery
**Route:** `/brewery-admin/brand/[brand_id]/settings`

**Features:**
- Edit brand name, slug, logo, description, website URL
- View all locations under the brand (cards with name, city, status)
- Remove location from brand (reverts to independent, with inline confirmation)
- Manage brand accounts (add/remove regional managers)

**API:**
- `PATCH /api/brands/[brand_id]` — update brand details
- `DELETE /api/brands/[brand_id]/locations/[brewery_id]` — remove location from brand
- `GET/POST/DELETE /api/brands/[brand_id]/accounts` — manage brand-level accounts

### Goal 6: Consumer Brand Page — Basic (P2)
**Owner:** Avery · Alex (design)
**Route:** `/brand/[slug]`

**MVP version:**
- Brand hero: logo, name, description
- Location cards: brewery name, city, state, link to brewery detail page
- "X locations" count
- No map yet (Sprint 116+), no aggregated stats yet

**SEO:** `generateMetadata` with brand name + location count

---

## Migration 073 (if needed)
**Owner:** Riley · Quinn

```sql
-- Add propagated_from_brand flag to brewery_accounts
ALTER TABLE brewery_accounts
ADD COLUMN propagated_from_brand boolean NOT NULL DEFAULT false;

-- Index for cleanup queries
CREATE INDEX idx_brewery_accounts_propagated
ON brewery_accounts (brand_id) WHERE propagated_from_brand = true;
```

This flag lets us distinguish "you have access because you're a brand owner" from "you have access because the brewery owner added you directly." Critical for clean removal when a location leaves a brand.

---

## What's NOT in this sprint
- Brand dashboard with aggregated analytics (Sprint 116)
- Map on consumer brand page (Sprint 116)
- Per-location billing add-on (Sprint 117)
- Shared beer catalog across locations (Sprint 118+)
- Brand-wide loyalty programs (Sprint 119+)

---

## Acceptance Criteria
1. ✅ Owner can create a brand from an existing claimed brewery
2. ✅ Brand owner can add locations (claim existing or create new)
3. ✅ Brand roles propagate to location-level `brewery_accounts`
4. ✅ Location selector appears for multi-location users, hidden for single-location
5. ✅ Brand settings page allows editing brand details and managing locations
6. ✅ Consumer brand page shows brand info and location list
7. ✅ Removing a location reverts it to independent (brand-propagated access cleaned up)
8. ✅ Single-location breweries are completely unaffected
9. ✅ All new APIs follow standardized JSON envelope pattern
10. ✅ Zero P0 bugs at sprint close

---

## Team Assignments
| Person | Role This Sprint |
|--------|-----------------|
| Morgan | Sprint planning, priority calls, blocker resolution |
| Sage | Spec review, documentation, retro prep |
| Jordan | Architecture review on all brand APIs + role propagation |
| Avery | All implementation (Goals 1-6) |
| Riley | Migration 073 |
| Quinn | RLS review, role propagation validation |
| Alex | UX for wizard, location selector, brand page |
| Casey | QA on all flows, edge case identification |
| Reese | Test coverage for brand APIs |
| Sam | User journey validation, acceptance criteria review |
| Drew | Multi-location ops validation (does this map to real brands?) |
| Taylor | Pricing validation (tier gating on brand features) |
| Jamie | Brand page visual review |

---

*This is a living document.* 🍺
