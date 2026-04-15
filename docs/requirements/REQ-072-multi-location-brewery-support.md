# REQ-072: Multi-Location Brewery Support

**Feature:** F-017
**Author:** Morgan (PM), with input from Jordan (Architecture), Taylor (Revenue), Drew (Brewery Ops), Alex (UX), Sam (BA)
**Date:** 2026-03-31
**Status:** Documented — queued for The Flywheel arc (Sprints 91-96)
**Priority:** P2
**Effort:** L (6+ sprints — schema, permissions, billing, analytics aggregation, consumer pages)
**Requested by:** Joshua (founder)

---

## 1. Problem Statement

A growing number of craft breweries operate multiple taproom locations under a single brand (e.g., BrewDog, Olde Mecklenburg, Wicked Weed, Sierra Nevada). Today, HopTrack treats every brewery listing as an independent entity — each with its own subscription, its own admin, its own analytics. A multi-location brand owner would need to:

- Claim each location separately
- Pay full subscription price per location
- Switch between completely independent dashboards
- Manually compare performance across locations
- Maintain separate loyalty programs, branding, and staff lists

This is expensive, fragmented, and operationally painful. No brewery chain owner would adopt HopTrack under these conditions.

**Joshua's vision:** "If I'm BrewDog and I'm everywhere but I'm still just BrewDog, I should be able to add a location to my brewery-admin for a small additional fee per location."

---

## 2. Goals

1. **One brand, many locations** — a single "brand" entity groups multiple brewery locations under unified ownership
2. **Brand-level dashboard** — consolidated analytics, KPIs, and management across all locations
3. **Per-location management** — each location retains its own tap list, events, staff, and local operations
4. **Tiered pricing** — base subscription (Cask or Barrel) + per-location add-on fee
5. **Consumer brand page** — unified brand page showing all locations, plus individual location pages
6. **Zero impact on single-location breweries** — optional feature, no schema breakage

---

## 3. Data Model

### 3.1 New Table: `brewery_brands`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Brand ID |
| `name` | text | Brand name (e.g., "BrewDog") |
| `slug` | text (unique) | URL slug for brand page |
| `description` | text | Brand description / story |
| `logo_url` | text | Brand logo (shared across locations) |
| `cover_image_url` | text | Brand hero image |
| `website_url` | text | Brand website |
| `created_by` | uuid (FK → profiles) | Brand creator (primary owner) |
| `subscription_tier` | text | Brand-level subscription (cask / barrel) |
| `stripe_customer_id` | text | Brand-level Stripe customer |
| `created_at` | timestamptz | Created timestamp |

### 3.2 Modified Table: `breweries`

| New Column | Type | Description |
|------------|------|-------------|
| `brand_id` | uuid (FK → brewery_brands, nullable) | Links location to brand. NULL = independent brewery (no change) |

### 3.3 New Table: `brand_accounts`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Account ID |
| `user_id` | uuid (FK → profiles) | User |
| `brand_id` | uuid (FK → brewery_brands) | Brand |
| `role` | text | `owner` / `regional_manager` / `viewer` |
| `created_at` | timestamptz | Created timestamp |

**Permission inheritance:** A brand `owner` automatically has `owner` access to ALL locations under that brand. A `regional_manager` can be scoped to specific locations (future enhancement). Individual `brewery_accounts` still work for location-specific staff.

---

## 4. Billing Model

### 4.1 Pricing Structure

| Component | Price | Notes |
|-----------|-------|-------|
| Brand subscription (base) | Cask ($149/mo) or Barrel (custom) | Required to enable multi-location |
| Per additional location | ~$29-49/mo per location | Small add-on per location, stacks |
| First location | Included in base | Brand subscription covers HQ/primary |

**Example:** BrewDog with 5 US locations on Cask tier:
- Base: $149/mo
- 4 additional locations × $39/mo = $156/mo
- Total: $305/mo ($3,660/yr)

### 4.2 Billing Rules

- Brand subscription is the "parent" Stripe subscription
- Additional locations are line items or separate subscription items
- Removing a location removes the add-on at period end
- Downgrading from multi-location → single requires removing all but one location
- Free tier / Tap tier cannot have multi-location (minimum Cask)

---

## 5. Brewery Admin Flows

### 5.1 Brand Creation Flow

1. Existing brewery owner navigates to Settings → "Create Brand"
2. Enters brand name, description, uploads brand logo
3. Current brewery becomes the first (primary) location
4. Brand dashboard becomes available
5. Billing upgrades to Cask minimum if not already

### 5.2 Adding a Location

1. From brand dashboard → "Add Location"
2. **Option A: Claim existing listing** — search our 7,177 breweries, claim an unclaimed listing under this brand
3. **Option B: Create new listing** — enter address, details for a new location not yet in our DB
4. Location inherits brand logo/identity but gets its own tap list, events, staff
5. Billing adds per-location fee

### 5.3 Brand Dashboard (New Route: `/brewery-admin/brand/[brand_id]/`)

**Top-level brand view:**
- Brand KPI cards: total visits (all locations), total loyalty members, total revenue estimate, location count
- Location cards grid: each location shows mini-stats (visits, top beer, loyalty members)
- Performance comparison: which location is outperforming, which needs attention
- Brand-wide analytics: aggregated charts across all locations
- Brand-wide loyalty: (future) unified loyalty program option

**Location selector:** Sidebar or top nav shows brand name + dropdown of locations. Selecting a location scopes to `/brewery-admin/[brewery_id]/` (existing admin, unchanged).

### 5.4 Location-Scoped Admin (Existing, Unchanged)

Each location retains its existing brewery-admin pages:
- Tap list (unique per location — locations may have different beers on tap)
- Events (local events)
- Loyalty (per-location OR brand-wide, configurable)
- Analytics (location-specific)
- Staff (location-specific `brewery_accounts`)
- Messages (location-specific customer base)
- Settings (location address, phone, hours)

### 5.5 Shared vs. Per-Location

| Feature | Shared (Brand) | Per-Location |
|---------|----------------|-------------|
| Brand name & logo | ✅ | Inherits, can override |
| Beer catalog | ✅ (master list) | Tap list = subset of catalog |
| Loyalty program | Configurable | Default: per-location |
| Events | ❌ | ✅ |
| Staff / accounts | Brand-level roles exist | Location staff too |
| Analytics | Aggregated view | Individual view |
| Promotions | Brand-wide option | Location-specific option |
| Messages | Brand-wide option | Location-specific option |
| Subscription | Brand-level billing | Add-on per location |

---

## 6. Consumer-Facing Pages

### 6.1 Brand Page (`/brand/[slug]`)

- Brand hero (logo, cover image, description)
- "X Locations" with map showing all pins
- Nearest location highlighted (geolocation)
- Overall brand stats: total check-ins, average rating, popular beers
- Location cards: tap, click to visit individual location page
- Brand-wide achievements (future): "Visit 5 BrewDog locations"

### 6.2 Location Page (Existing `/brewery/[id]`, enhanced)

- Shows "Part of [Brand Name]" badge linking to brand page
- "Other [Brand] Locations" section at bottom
- Everything else unchanged (tap list, reviews, events, etc.)

---

## 7. Technical Considerations

### 7.1 Migration Strategy

- New migration: `brewery_brands` table + `brand_accounts` table
- ALTER `breweries`: add nullable `brand_id` FK
- No data migration needed — all existing breweries remain `brand_id = NULL` (independent)
- RLS: brand owners can read/write all locations under their brand

### 7.2 Analytics Aggregation

- Brand dashboard queries: `WHERE brewery_id IN (SELECT id FROM breweries WHERE brand_id = $1)`
- Consider materialized view or cron-based rollup for performance at scale
- ROI card and digest emails: brand-level variants

### 7.3 Beer Catalog Sharing

- New concept: "brand beer catalog" — beers created at brand level
- Each location's tap list references beers from the shared catalog
- A beer brewed at one location but not on tap at another still exists in the catalog
- Locations can also have location-exclusive beers

### 7.4 Search & Discovery

- Brand search: searching "BrewDog" should show the brand page, not 5 duplicate listings
- Location search: searching "BrewDog Charlotte" should show the Charlotte location
- HopRoute: routes to individual locations, not brands

---

## 8. Edge Cases (Sam)

- **What if a location is already claimed by someone else?** Brand owner must contact support. Superadmin can reassign.
- **What if a brand owner removes a location?** Location reverts to independent (unclaimed). Data stays.
- **What about existing loyalty stamps at a location that joins a brand?** Stamps persist. Brand can choose to unify or keep separate.
- **Can a location belong to multiple brands?** No. One brand per location.
- **What if the brand subscription lapses?** All locations downgrade to free tier. Data preserved.
- **Staff at one location — can they see other locations?** Only if they have a `brand_accounts` role. Location-only staff see only their location.

---

## 9. Acceptance Criteria

1. [ ] Brewery owner can create a brand from an existing claimed brewery
2. [ ] Brand owner can add locations (claim existing or create new)
3. [ ] Brand dashboard shows aggregated KPIs across all locations
4. [ ] Location selector allows switching between locations in brewery-admin
5. [ ] Each location retains independent tap list, events, and staff management
6. [ ] Billing adds per-location fee for additional locations beyond the first
7. [ ] Consumer brand page shows all locations with map and stats
8. [ ] Individual location pages show "Part of [Brand]" badge
9. [ ] Existing single-location breweries are completely unaffected
10. [ ] Brand-level roles (owner, regional_manager) propagate access to locations
11. [ ] Removing a location reverts it to independent brewery
12. [ ] Brand-wide beer catalog allows shared beer definitions across locations

---

## 10. Sprint Estimate

**Total effort:** 6-8 sprints across The Flywheel arc

| Phase | Sprints | Scope |
|-------|---------|-------|
| Schema + brand CRUD | 1 sprint | Migration, brand creation, add location |
| Brand dashboard | 1-2 sprints | Aggregated analytics, location cards, KPIs |
| Billing integration | 1 sprint | Per-location add-on, Stripe line items |
| Consumer brand page | 1 sprint | Brand page, location cards, map |
| Beer catalog sharing | 1 sprint | Shared catalog, per-location tap lists |
| Polish + edge cases | 1-2 sprints | Permissions, edge cases, QA |

**Depends on:** F-001 (Stripe billing — COMPLETE), F-006 (POS integration — needed for keg-level data)

---

## 11. Revenue Impact (Taylor)

Multi-location is a **Barrel tier anchor feature**. Without it, Barrel has no differentiation from Cask. With it:

- Average multi-location brand: 3-10 locations
- At $149/mo base + $39/mo per additional location: $227-$500/mo per brand
- 50 multi-location brands = $11,350-$25,000/mo additional MRR
- This is the feature that turns HopTrack from "brewery tool" to "brewery chain platform"

---

*This is a living document. — Morgan* 🗂️

---

## RTM Links

### Implementation
[lib/brand-auth](../../lib/), [lib/brand-billing](../../lib/), [lib/brand-crm](../../lib/), [lib/brand-loyalty](../../lib/), [lib/brand-team-activity](../../lib/)

### Tests
[brand-auth.test.ts](../../lib/__tests__/brand-auth.test.ts), [brand-billing.test.ts](../../lib/__tests__/brand-billing.test.ts), [brand-crm.test.ts](../../lib/__tests__/brand-crm.test.ts), [brand-propagation.test.ts](../../lib/__tests__/brand-propagation.test.ts), [brand-team-activity.test.ts](../../lib/__tests__/brand-team-activity.test.ts), [brand-tier-gates.test.ts](../../lib/__tests__/brand-tier-gates.test.ts), [brand-routes-use-shared-auth.test.ts](../../lib/__tests__/brand-routes-use-shared-auth.test.ts), [brand-onboarding.test.ts](../../lib/__tests__/brand-onboarding.test.ts), [brand-digest.test.ts](../../lib/__tests__/brand-digest.test.ts)

### History
- [retro](../history/retros/sprint-114-retro.md)
- *(no dedicated plan file)*

## See also
[REQ-095](REQ-095-brand-team-roles.md), [REQ-096](REQ-096-brand-loyalty.md), [architecture/multi-location-brand.md](../architecture/multi-location-brand.md)

> Added 2026-04-15 during the wiki reorg — see the [RTM](README.md) for the master table.
