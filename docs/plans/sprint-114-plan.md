# Sprint 114 — The Operator
**Date:** 2026-04-01
**PM:** Morgan
**Arc:** Multi-Location (Sprints 114-137)
**Theme:** Make brewery operations actually work + fix every bug on the board + start Multi-Location

---

## Goals

### Goal 1: Staff Redemption System (P0)
**Owner:** Avery (build) / Jordan (architecture review) / Riley (migration)

- **Migration 070:** `puncher` role added to `brewery_accounts`, `promotion` type for redemption codes, `pos_reference` auto-generated on confirmation, `promo_description` column, RLS policies for staff code confirmation
- **POS trigger:** `trg_pos_reference` auto-generates `HT-XXXX` format code on confirmation for POS system reference
- **Confirm endpoint:** Expanded from owner-only to owner/manager/staff/puncher roles. Now returns POS reference code in response
- **Generate endpoint:** Updated to support `promotion` type codes with 5-char format. Validates promotion active status and redemption limits
- **CodeEntry component:** Bar staff interface — large code input, auto-uppercase, success state shows customer name + reward + POS reference (copyable). At `/brewery-admin/[brewery_id]/punch/`
- **Code format:** 5-char alphanumeric (A-Z, 2-9, no ambiguous chars) — fast to type, secure with 5-min expiry

### Goal 2: Brewery Admin User Management (P0)
**Owner:** Avery (build)

- **Staff API:** Full CRUD at `/api/brewery/[brewery_id]/staff/` — list, add (by email/username), change role, remove. Owner/manager access control
- **StaffManager component:** Integrated into brewery Settings page. Lists staff with avatar/role, inline add form, role dropdown (owner only), inline remove confirmation. Role descriptions explain permissions
- **Roles:** Owner (full access), Manager (full except billing/danger), Staff (dashboard + confirmations), Puncher (code confirmation only)

### Goal 3: Bug Fixes (P0)
**Owner:** Avery

1. **Wishlist -> Explore:** `filter=wishlist` URL param now works. Modified `/api/wishlist/on-tap` to return all brewery IDs when no brewery_id specified. ExploreClient reads filter param, fetches matching brewery IDs, filters list. "On My Wishlist" chip added to Explore filters panel
2. **You Tab YOUR ACTIVITY empty state:** Root cause — `fetchFeedSessions` returns mixed user+friend sessions (limit 20), friends crowd out user's own. Fix: Added `fetchUserSessions()` dedicated query for You tab. HomeFeed now receives separate `userSessions` prop
3. **You Tab spacing:** Root container `space-y-5` -> `space-y-6` (24px). Removed `mt-1 mb-1` from Wrapped CTA (redundant with space-y)
4. **Explore leaderboard:** Removed confusing standalone Trophy link from Explore header. Leaderboard is accessible from the main nav
5. **Caching:** Set `staleTimes.static: 0` (was 30s) to eliminate remaining stale page issues

### Goal 4: Smarter Search (P1)
**Owner:** Avery (API) / Riley (migration)

- **Migration 071:** Three PostgreSQL functions using pg_trgm: `search_beers_fuzzy()`, `search_breweries_fuzzy()`, `search_all()`. Fuzzy matching with similarity > 0.15, combined with ILIKE fallback, ordered by relevance
- **Search API:** Unified `/api/search?q=query` endpoint. Tries RPC first, falls back to ILIKE. Returns grouped beer + brewery results
- **SearchTypeahead component:** Reusable typeahead with debounced search, grouped dropdown (beers/breweries), keyboard navigation, click-outside close, loading states, empty states, full ARIA

### Goal 5: Multi-Location Foundation (P1)
**Owner:** Jordan (architecture) / Riley (migration)

- **Migration 072:** `brewery_brands` table (name, slug, logo, owner), `brand_accounts` table (brand membership with roles: owner, regional_manager), `brand_id` column on `breweries`. RLS policies. Zero impact on single-location breweries
- **Types updated:** `BreweryBrand`, `BrandAccount`, `BrandAccountRole` interfaces. Database interface registered

### Backlog Captured
- **F-031:** AI Business Suggestions — proactive dashboard recommendations for brewery owners. Added to roadmap research doc

---

## Key Changes

### New Files
| File | Description |
|------|-------------|
| `supabase/migrations/070_staff_roles_and_promo_codes.sql` | Staff roles + promo codes migration |
| `supabase/migrations/071_smart_search.sql` | Fuzzy search functions (pg_trgm) |
| `supabase/migrations/072_multi_location_schema.sql` | Multi-location brand schema |
| `app/api/brewery/[brewery_id]/staff/route.ts` | Staff management CRUD API |
| `app/api/search/route.ts` | Unified typeahead search API |
| `app/(brewery-admin)/brewery-admin/[brewery_id]/punch/page.tsx` | Staff code entry page |
| `components/brewery-admin/StaffManager.tsx` | Staff management UI |
| `components/brewery-admin/CodeEntry.tsx` | Redemption code entry UI |
| `components/ui/SearchTypeahead.tsx` | Reusable typeahead search component |

### Modified Files
| File | Change |
|------|--------|
| `app/api/wishlist/on-tap/route.ts` | Returns all brewery IDs when no brewery_id param |
| `app/api/brewery/[brewery_id]/redemptions/confirm/route.ts` | Staff/manager/puncher roles, promotion type, POS reference |
| `app/api/redemptions/generate/route.ts` | 5-char codes, promotion type support |
| `app/(app)/explore/ExploreClient.tsx` | Wishlist filter, removed leaderboard link |
| `app/(app)/home/YouTabContent.tsx` | Spacing fix (space-y-6, Wrapped CTA margin) |
| `app/(app)/home/HomeFeed.tsx` | userSessions prop for dedicated You tab sessions |
| `app/(app)/home/page.tsx` | fetchUserSessions() added to parallel data fetch |
| `app/(brewery-admin)/.../settings/BrewerySettingsClient.tsx` | StaffManager section added |
| `lib/queries/feed.ts` | fetchUserSessions() function added |
| `next.config.ts` | staleTimes.static: 0 |
| `types/database.ts` | Puncher role, promo code fields, brand types |
| `docs/plans/roadmap-research-2026-q2.md` | F-031 captured |

---

## Team Credits

- **Morgan** 🗂️ — Sprint planning, priority triage, kept the scope honest
- **Sage** 📋 — Sprint plan documentation, ticket specs
- **Jordan** 🏛️ — Architecture review on multi-location schema, identified You tab session fetch gap
- **Avery** 💻 — All implementation: bug fixes, staff system, search, multi-location types
- **Riley** ⚙️ — Three migrations (070, 071, 072), pg_trgm functions, POS reference trigger
- **Quinn** ⚙️ — Migration review, RLS policy design
- **Casey** 🔍 — Bug triage, caching investigation
- **Alex** 🎨 — CodeEntry and StaffManager UI design, spacing fixes
- **Drew** 🍻 — Staff workflow validation ("puncher at the bar makes sense, 5 chars is fast enough")
- **Sam** 📊 — Wishlist filter requirements, search UX research
- **Taylor** 💰 — Multi-location pricing validation ($29-49/location add-on approved)
