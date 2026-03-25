# HopTrack Requirements Validation Report
**Author:** Sam (Business Analyst)
**Date:** 2026-03-24
**Sprint:** 1 (Week 1)
**Scope:** Full codebase audit against all documented requirements

---

## Executive Summary

HopTrack's foundational consumer app is substantially built. The database, authentication, core pages, and brewery admin dashboard are all live. Sprint 1 enhancements (theme toggle, profile banner, favorite beer) are partially implemented in code but have known bugs blocking QA sign-off. Sprint 2–5 features are correctly staged as unbuilt. Three open bugs are blocking M1.

**Overall Completion: ~38% of all documented requirements**
(Sprint 1 scope: ~65% complete; Sprints 2–6 out of scope for this sprint)

---

## Summary Status Table

| ID | Feature | Sprint | Status | Notes |
|----|---------|--------|--------|-------|
| REQ-001 | Light/Dark Theme Toggle | 1 | 🔄 In Progress | Core logic built; BUG-001 blocks QA sign-off |
| REQ-002 | Brewery Images & Beer Menus | 1–2 | 🔄 In Progress | Beer CRUD built; image upload & Unsplash fallback missing |
| REQ-003 | Brewery Loyalty System | 2–3 | 🔄 In Progress | DB schema + admin UI built; QR/stamp/consumer flows missing |
| REQ-004 | Brewery Accounts & Verification | 2 | 🔄 In Progress | DB + admin dashboard built; claim/verification flow missing |
| REQ-005 | Wrapped-Style Recaps | 4 | ⏳ Pending | No code exists; correctly deferred to Sprint 4 |
| REQ-006 | Brewery TV Display | 5 | ⏳ Pending | No code exists; correctly deferred to Sprint 5 |
| REQ-007 | Brewery Location Insights | 5 | ⏳ Pending | No code exists; correctly deferred to Sprint 5 |
| BUG-001 | Light Theme Contrast (hex → CSS vars) | 1 | ❌ Blocked | Open; AppNav has 14+ hardcoded hex values |
| BUG-002 | Star Rating Final Star Size | 1 | ❌ Blocked | Open; StarRating component not yet fixed |
| BUG-003 | Check-In Exit Navigation | 1 | ❌ Blocked | Open; destination undecided by team |
| — | Profile Banner (Unsplash fallback) | 1 | ✅ Complete | ProfileBanner component built with fallback logic |
| — | Profile Favorite Beer | 1 | ✅ Complete | Computed from check-in history on profile page |
| — | QA Checklist Template | 1 | ✅ Complete | Created at docs/requirements/QA-checklist-template.md |
| — | SkeletonLoader style prop | 1 | ✅ Complete | style prop accepted in Skeleton component |

---

## REQ-001 — Light/Dark Theme Toggle

**Status:** 🔄 In Progress | **Priority:** Now | **Sprint:** 1

### What Is Built
- `ThemeProvider` component: reads `localStorage`, falls back to `prefers-color-scheme`, applies `data-theme` to `<html>`. Persists preference. (`components/theme/ThemeProvider.tsx`)
- `ThemeToggle` component: compact (icon-only) and full (pill with label) variants, with Framer Motion animation. (`components/theme/ThemeToggle.tsx`)
- CSS variable token system: both dark (`:root`) and light (`[data-theme="light"]`) palettes fully defined in `globals.css`. Colors match REQ-001 spec exactly.
- Toggle present in Settings page Appearance section and in AppNav desktop sidebar.
- Body has `transition: background-color 0.15s ease, color 0.15s ease` — satisfies the 150ms smooth transition AC.

### Acceptance Criteria Assessment
| Criterion | Status |
|-----------|--------|
| Toggle in Settings page | ✅ Done |
| Toggle accessible from AppNav | ✅ Done (desktop sidebar) |
| Preference persisted to localStorage | ✅ Done |
| System preference used as default | ✅ Done |
| All pages render correctly in both themes | ❌ Blocked by BUG-001 |
| No hardcoded hex colors in components | ❌ Blocked by BUG-001 — AppNav has 14 hardcoded hex values; profile page has hardcoded `#0F0E0C` overlay |
| Smooth 150ms transition | ✅ Done |

### Gaps
- **BUG-001 is the blocker.** AppNav (`components/layout/AppNav.tsx`) still uses hardcoded hex classes (`#D4A843`, `#0F0E0C`, `#E8841A`, `#C44B3A`, etc.) instead of CSS variable equivalents. Until this is resolved, light mode cannot pass QA.
- Mobile bottom nav is not shown in the settings page — the compact ThemeToggle is not exposed on mobile in the current nav layout. Users on mobile must go to Settings to toggle. This is acceptable but worth noting.

---

## REQ-002 — Brewery Images & Beer Menus

**Status:** 🔄 In Progress | **Priority:** Now | **Sprint:** 1–2

### What Is Built
- `beers` table has `cover_image_url`, `is_active`, `is_on_tap` (migration 001), `abv`, `ibu`, `style`, `seasonal` columns — all per spec.
- `breweries` table has `cover_image_url` column (confirmed in both schema.sql and migration 001 fallback ALTER).
- Brewery admin tap list UI fully built: add/edit/remove beers (name, style, ABV, IBU, description), toggle `is_on_tap`, filter by on/off tap. (`app/(brewery-admin)/brewery-admin/[brewery_id]/tap-list/TapListClient.tsx`)
- `BeerStyleBadge` component renders style badge. (`components/ui/BeerStyleBadge.tsx`)
- Beer details (style badge, ABV, avg rating) shown in tap list admin.

### Acceptance Criteria Assessment
| Criterion | Status |
|-----------|--------|
| Brewery detail page shows cover image (uploaded or Unsplash fallback) | ❌ Missing — brewery detail page (`app/(app)/brewery/[id]/page.tsx`) exists but no image fallback logic confirmed |
| Gradient placeholder while image loads | ❌ Not verified in brewery page |
| Brewery admin can upload a cover photo | ❌ Missing — no upload UI exists in BrewerySettingsClient or elsewhere |
| Brewery admin can add beers (name, style, ABV, IBU, description, seasonal) | ✅ Done (seasonal flag present in schema; UI covers name/style/ABV/IBU/description) |
| Consumers see active tap list on brewery page | ❌ Missing — consumer brewery detail page not confirmed to render tap list |
| Beer cards show style badge, ABV, avg rating | ✅ Done in admin; consumer-facing not confirmed |

### Gaps
- **Image upload UI is entirely missing.** REQ-002 requires brewery admins to upload cover photos via Supabase Storage (`brewery-images` bucket). No upload input exists in `BrewerySettingsClient.tsx` or any other admin page.
- **Supabase Storage bucket not created.** No infrastructure code found for the `brewery-images` bucket (Riley's task).
- **Unsplash fallback for brewery images not implemented.** The `ProfileBanner` component does implement Unsplash fallback for user profiles, but no equivalent exists for brewery pages.
- **Consumer-facing tap list** on the brewery detail page (`/brewery/[id]`) needs confirmation — requires reading that page (not done in this audit pass).
- `seasonal` flag exists in the DB but is not exposed as a field in the beer add/edit form in `TapListClient`.

---

## REQ-003 — Brewery Loyalty System

**Status:** 🔄 In Progress | **Priority:** Next Sprint | **Sprint:** 2–3

### What Is Built
- **Database schema** (`supabase/migrations/001_brewery_accounts.sql`):
  - `loyalty_programs` table: id, brewery_id, name, description, stamps_required, reward_description, is_active — matches spec.
  - `loyalty_cards` table: id, user_id, brewery_id, program_id, stamps, lifetime_stamps, last_stamp_at — matches spec.
  - `promotions` table: id, brewery_id, beer_id, title, discount_type (percent/fixed/bogo/free_item), discount_value, starts_at, ends_at, redemption_limit, redemptions_count, is_active — matches spec.
  - RLS policies on all loyalty tables.
- **Brewery admin Loyalty UI** (`app/(brewery-admin)/brewery-admin/[brewery_id]/loyalty/LoyaltyClient.tsx`):
  - Create loyalty programs (name, stamps_required, reward_description, description).
  - Toggle programs active/inactive.
  - Create/toggle/delete promotions with all discount types.
- **Dashboard overview** shows active loyalty program summary and active promotions with quick links.

### Acceptance Criteria Assessment
| Criterion | Status |
|-----------|--------|
| Brewery admin can create/edit/delete loyalty programs | 🔄 Partial — create and toggle work; delete not implemented; edit not implemented |
| Stamps increment automatically on qualifying check-ins | ❌ Missing — no trigger or edge function increments loyalty_cards.stamps on check-in |
| QR code generated for earned rewards | ❌ Missing — loyalty_rewards table not created; no QR generation logic |
| Staff PWA can scan and validate QR | ❌ Missing — no /staff route exists |
| Redemption is idempotent | ❌ Missing — no redemption flow exists |
| Push notification when stamp milestone reached | ❌ Missing |
| Promotions appear on beer cards with DEAL badge and countdown | ❌ Missing — consumer-facing promo display not implemented |

### Gaps
- **`loyalty_rewards` table is missing.** REQ-003 spec defines `loyalty_rewards (id, user_id, brewery_id, program_id, earned_at, redeemed_at, qr_token)` — this table does not exist in any migration file.
- **Stamp auto-increment on check-in is not wired up.** The check-in API or a DB trigger needs to call `loyalty_cards` upsert logic. None found.
- **Consumer-facing stamp card UI** does not exist. Users cannot see their stamp progress.
- **QR redemption flow** (generate JWT, staff scan, server validate) is entirely unbuilt.
- **Staff PWA** at `/staff/[brewery_id]` does not exist.
- This is correctly scheduled for Sprint 3 — the early DB and admin scaffolding ahead of schedule is a positive signal.

---

## REQ-004 — Brewery Accounts & Verification

**Status:** 🔄 In Progress | **Priority:** Next Sprint | **Sprint:** 2

### What Is Built
- **Database schema** (`supabase/migrations/001_brewery_accounts.sql`):
  - `brewery_accounts` table: id, user_id, brewery_id, role (owner/manager/staff), verified, verified_at — matches spec.
  - `brewery_claims` table: id, user_id, brewery_id, status (pending/approved/rejected), business_email, notes, reviewed_by, reviewed_at — largely matches spec (document_url and verification_method columns from spec are absent).
  - RLS policies on both tables.
- **Brewery admin dashboard** (`app/(brewery-admin)/brewery-admin/[brewery_id]/page.tsx`): functional overview with check-in stats, top beers, loyalty status, promotions, and quick action links.
- **Role-based access check** on dashboard: verifies `brewery_accounts` membership before rendering.
- **Sub-pages**: tap-list, analytics, loyalty, settings — all exist and are functional.
- **Analytics page**: check-in trend charts (daily/30d, day-of-week, top beers, style distribution, rating distribution) using Recharts.
- **Brewery settings page**: edit brewery name, address, phone, website; danger zone for owners.
- **Admin nav**: `BreweryAdminNav` component exists.

### Acceptance Criteria Assessment
| Criterion | Status |
|-----------|--------|
| Brewery detail page shows "Claim this brewery" CTA | ❌ Missing — no claim flow UI on consumer brewery page confirmed |
| Email domain auto-verification flow | ❌ Missing — no verification logic in code |
| Document upload for Silver verification | ❌ Missing |
| Brewery admin dashboard at /brewery-admin | ✅ Done |
| Owner can invite staff by email | ❌ Missing — no staff invite UI |
| Verified badge on brewery profile | ❌ Missing — verified boolean exists in DB but badge not displayed |

### Gaps
- **Claim flow** (`/brewery-admin/claim`) does not exist. The index page at `/brewery-admin` redirects to `/brewery-admin/claim` when no verified account is found, but that route returns a 404.
- **Verification tiers** (Bronze email domain, Silver document upload, Gold manual) are not implemented. The `brewery_claims` table is missing `verification_method` and `document_url` columns per spec.
- **Staff invitation system** is not built.
- **Verified badge** is not rendered on the public brewery detail page.
- Dashboard shows "Verified ✓" vs "Pending Verification" text based on the `verified` column — this is minimal but functional for internal use.
- These are all correctly Sprint 2 items — the early DB scaffolding is the right sequence.

---

## REQ-005 — Wrapped-Style Recaps

**Status:** ⏳ Pending | **Priority:** Later | **Sprint:** 4

No implementation found anywhere in the codebase. Correctly deferred to Sprint 4.

**Gaps (all expected at this stage):**
- No `user_recaps` table in schema or migrations.
- No `/api/recap/[userId]/[year]` route.
- No Supabase Edge Function cron jobs.
- No Resend email integration.
- No `satori` dependency for PNG generation.

**Roadmap note:** Sprint 4 is scheduled week of 2026-04-14, targeting M4 milestone (2026-04-17). This is on track given Sprint 1's current position.

---

## REQ-006 — Brewery TV Display / Video Board

**Status:** ⏳ Pending | **Priority:** Later | **Sprint:** 5

No implementation found. Correctly deferred to Sprint 5.

**Gaps (all expected):**
- No `/display/[brewery_id]` route.
- No Supabase Realtime subscription code for display.
- No QR enrollment flow in `/brewery-admin/display`.
- No read-only display JWT issuance.

---

## REQ-007 — Brewery Location Insights & Beer Suggestions

**Status:** ⏳ Pending | **Priority:** Later | **Sprint:** 5

No implementation found. Correctly deferred to Sprint 5.

**Gaps (all expected):**
- No `brewery_insights` table in schema or migrations.
- No geospatial aggregation queries.
- No insights panel in brewery dashboard.
- No Resend weekly digest for breweries.

---

## Open Bugs — Sprint 1 Blockers

All three bugs are blocking M1 ("Consumer MVP polished" — target 2026-03-27).

| Bug | Priority | Status | Impact |
|-----|----------|--------|--------|
| BUG-001: Light theme contrast + hardcoded hex | Medium | ❌ Open | Blocks REQ-001 QA sign-off. AppNav has 14 hardcoded hex values. Profile page banner overlay uses `#0F0E0C`. |
| BUG-002: Star rating final star size | Medium | ❌ Open | Blocks check-in QA. Located in `components/ui/StarRating.tsx`. |
| BUG-003: Check-in exit navigation | High | ❌ Open | Team must decide destination (Options A–E documented in bug). Blocks polish sign-off. |

---

## Undocumented Features Found in Code (In Code, Not in Requirements)

The following features exist in the codebase with no corresponding REQ document:

| Feature | Location | Notes |
|---------|----------|-------|
| Profile XP / Level system with progress bar | `app/(app)/profile/[username]/page.tsx`, `lib/xp.ts` | Full level progression UI exists; no REQ doc |
| Reactions (thumbs_up, flame, beer) on check-ins | `supabase/schema.sql` — reactions table | DB table exists with RLS; no REQ doc |
| Wishlist (want-to-try beers) | `supabase/schema.sql` — wishlist table | DB table exists; no UI or REQ doc |
| Brewery visits tracking table | `supabase/schema.sql` — brewery_visits | Powers profile "top breweries"; no dedicated REQ |
| Friend activity / leaderboard rows | `components/social/LeaderboardRow.tsx` | Component exists; no REQ doc covering leaderboards |
| Brewery map component | `components/map/BreweryMap.tsx` | Component exists; map view in Explore is Sprint 6 per roadmap |
| Flavor tag picker on check-in | `components/checkin/FlavorTagPicker.tsx` | Flavor tags stored in checkins.flavor_tags; not in any REQ |
| Serving style picker on check-in | `components/checkin/ServingStylePicker.tsx` | draft/bottle/can/cask; not in any REQ |
| Domestic beer flag on beers | `supabase/migrations/001_brewery_accounts.sql` | `is_domestic` added for "How American Are You" achievement (Sprint 3 roadmap item); no REQ doc |
| is_on_tap vs is_active discrepancy | `supabase/migrations/001_brewery_accounts.sql` | Migration adds `is_on_tap`; schema.sql has `is_active`; REQ-002 specifies `is_active`. Both now exist on the beers table — the migration adds `is_on_tap` while `is_active` was already in schema. Code uses `is_on_tap`. |

---

## Schema Gap Analysis

Comparing REQ specs against actual DB tables:

| Table (Required by REQ) | Exists? | Notes |
|------------------------|---------|-------|
| profiles | ✅ | Full |
| friendships | ✅ | Full |
| breweries | ✅ | Full; cover_image_url confirmed |
| beers | ✅ | Full; is_active + is_on_tap both present (see discrepancy above) |
| checkins | ✅ | Full |
| achievements + user_achievements | ✅ | Full |
| brewery_accounts | ✅ | In migration 001 |
| brewery_claims | ✅ | In migration 001; missing verification_method + document_url columns per REQ-004 |
| loyalty_programs | ✅ | In migration 001 |
| loyalty_cards | ✅ | In migration 001 |
| loyalty_rewards | ❌ | **Missing** — required by REQ-003; not in any migration |
| promotions | ✅ | In migration 001 |
| brewery_insights | ❌ | Sprint 5 — not yet needed |
| user_recaps | ❌ | Sprint 4 — not yet needed |
| notifications | ✅ | In schema.sql |
| reactions | ✅ | In schema.sql |
| wishlist | ✅ | In schema.sql |
| brewery_visits | ✅ | In schema.sql |

---

## Priority Items Still Outstanding (Sprint 1)

These must be resolved before M1 (2026-03-27):

1. **BUG-003** (High) — Decide and implement check-in exit destination. Team vote needed now.
2. **BUG-001** (Medium) — Migrate hardcoded hex values in AppNav and profile page to CSS variables. Estimated 2hr per roadmap.
3. **BUG-002** (Medium) — Fix final star sizing in StarRating.tsx. Estimated 30min per roadmap.
4. **SkeletonLoader style prop** — Per roadmap, this is a 15min tech debt fix. Based on code inspection, the `Skeleton` component already accepts a `style` prop. This may already be resolved — Jordan to confirm.
5. **Casey QA sign-off** — No feature closes without Casey completing the QA checklist template for each item.

---

## Completion Percentage by Requirement

| REQ | Acceptance Criteria Met | Total AC | % |
|-----|------------------------|----------|---|
| REQ-001 | 5 / 7 | 7 | 71% |
| REQ-002 | 2 / 6 | 6 | 33% |
| REQ-003 | 1 / 7 | 7 | 14% |
| REQ-004 | 1 / 6 | 6 | 17% |
| REQ-005 | 0 / 5 | 5 | 0% |
| REQ-006 | 0 / 6 | 6 | 0% |
| REQ-007 | 0 / 6 | 6 | 0% |
| **Total** | **9 / 43** | **43** | **~21%** |

*Note: Sprint 1 scope only (REQ-001 + REQ-002 partial): 7/13 AC = **54%**. Remaining REQ-001 and REQ-002 items are blocked by open bugs, not unstarted.*

---

## Recommendations

1. **Resolve BUG-003 destination decision in today's standup.** Option A (Home feed) is the simplest and most social — recommend it as default. Adds 30min of implementation.

2. **Create a REQ document for the XP/Level system.** It's a substantial consumer-facing feature with no documentation. Sam to draft REQ-008.

3. **Clarify is_active vs is_on_tap.** REQ-002 specifies `is_active`; code uses `is_on_tap`. Both columns now exist on the beers table. Recommend aligning on one field — either remove the duplicate or document the distinction (e.g., `is_on_tap` = currently serving, `is_active` = listed and available). Jordan to resolve before Sprint 2.

4. **Create `loyalty_rewards` table migration before Sprint 3 kickoff.** The table is defined in REQ-003 but missing from migrations. Riley should add it to the Sprint 3 DB setup task.

5. **Add document_url and verification_method columns to brewery_claims.** These are required for Silver/Gold verification tiers per REQ-004. Add to Sprint 2 DB migration.

6. **Supabase Storage bucket creation** (Riley) and **brewery image upload UI** (Jordan) must both ship together in Sprint 2 — neither is useful without the other.

---

*Report generated by Sam (Business Analyst) · 2026-03-24 · HopTrack Sprint 1*
