# Sprint 125 — The Passport 🛂
**Arc:** Multi-Location (Sprints 114-137)
**Theme:** Brand-wide loyalty programs — earn anywhere, redeem anywhere
**Date:** 2026-04-02

## The Problem
Loyalty is per-brewery today. A brand with 3 locations has 3 separate loyalty programs — customers earn stamps at one location and start from zero at another. Brand owners want ONE program across all their locations. Customers want their stamps to follow them.

## What We're Building

### 1. Migration 082 — Brand Loyalty Schema
**New table: `brand_loyalty_programs`**
- `id` (uuid, PK)
- `brand_id` (uuid, FK → brewery_brands, ON DELETE CASCADE)
- `name` (text, default 'Brand Loyalty')
- `description` (text)
- `stamps_required` (int, default 10)
- `reward_description` (text, default 'Free pint at any location')
- `is_active` (boolean, default true)
- `earn_per_session` (int, default 1) — stamps per check-in
- `created_at` (timestamptz)
- Unique constraint: one active program per brand

**New table: `brand_loyalty_cards`**
- `id` (uuid, PK)
- `user_id` (uuid, FK → auth.users)
- `brand_id` (uuid, FK → brewery_brands, ON DELETE CASCADE)
- `program_id` (uuid, FK → brand_loyalty_programs, ON DELETE CASCADE)
- `stamps` (int, default 0) — current toward reward
- `lifetime_stamps` (int, default 0) — all-time
- `last_stamp_at` (timestamptz)
- `last_stamp_brewery_id` (uuid, FK → breweries) — which location they last visited
- `created_at` (timestamptz)
- Unique constraint: (user_id, brand_id)

**New table: `brand_loyalty_redemptions`**
- `id` (uuid, PK)
- `card_id` (uuid, FK → brand_loyalty_cards, ON DELETE CASCADE)
- `user_id` (uuid, FK → auth.users)
- `brand_id` (uuid, FK → brewery_brands)
- `brewery_id` (uuid, FK → breweries) — which location redeemed at
- `program_id` (uuid, FK → brand_loyalty_programs)
- `redeemed_at` (timestamptz, default now())

**RLS Policies:**
- Users see own cards/redemptions
- Brand owners/managers see all cards for their brand (via `is_brand_manager_or_owner()`)
- Staff at any brand location can view cards (for redemption confirmation)

**Seed data:** Pint & Pixel brand loyalty program (10 stamps, "Free pint at any Pint & Pixel"), a few test cards with stamps

### 2. Brand Loyalty Library — `lib/brand-loyalty.ts`
- `getBrandLoyaltyProgram(supabase, brandId)` — fetch active brand program
- `getBrandLoyaltyCard(supabase, userId, brandId)` — fetch or null
- `awardBrandStamp(supabase, userId, brandId, breweryId)` — increment stamps, create card if needed, returns { card, isRewardReady }
- `redeemBrandReward(supabase, cardId, breweryId)` — decrement stamps, insert redemption, returns redemption record
- `migrateLoyaltyToBrand(supabase, brandId)` — one-time: sum existing per-location stamps into brand card (brand setup utility)

### 3. Session End Integration
Update `/api/sessions/[id]/end` to check if session's brewery belongs to a brand with an active brand loyalty program:
- If yes: call `awardBrandStamp()` instead of (or in addition to) per-location stamp
- If no: existing per-location loyalty behavior unchanged
- Push notification: "You earned a stamp on your [Brand Name] Passport! (X/Y)"

### 4. API Endpoints

**Brand Loyalty Admin (3 routes):**
- `GET /api/brand/[brand_id]/loyalty` — fetch program + cards + recent redemptions
- `POST /api/brand/[brand_id]/loyalty` — create/update program (brand owner/manager only)
- `PATCH /api/brand/[brand_id]/loyalty` — toggle active, update settings

**Consumer:**
- `GET /api/brand/[brand_id]/loyalty/card` — fetch current user's brand card + program info

**Redemption:**
- Update `/api/redemptions/generate` to support `type: 'brand_loyalty_reward'` with brand_id
- Update `/api/brewery/[brewery_id]/redemptions/confirm` to handle brand loyalty codes (decrement brand card stamps)

### 5. Brand Loyalty Admin Page
`/brewery-admin/brand/[brand_id]/loyalty/` — New page in brand admin nav

**Sections:**
- **Program Setup:** name, stamps required, reward description, earn_per_session, active toggle
- **Migration Tool:** "Import existing location stamps" button — sums per-location cards into brand cards (one-time, with confirmation)
- **Loyalty Dashboard:** Top customers (sorted by lifetime stamps), recent redemptions across all locations
- **Per-Location Breakdown:** Which locations are earning the most stamps
- **QR Code:** Brand-wide QR linking to brand page (for printing at all locations)

### 6. Consumer-Facing UI Updates

**Brewery Detail Page (`/brewery/[id]`):**
- If brewery belongs to a brand with active brand loyalty: show `BrandLoyaltyStampCard` instead of per-location card
- Card shows brand name, "Earn at any [Brand] location", stamp grid, progress
- "Last stamped at [Location Name]" footer
- Redemption code generation when ready

**Brand Page (`/brand/[slug]`):**
- Brand loyalty card section (if program active + user logged in)
- "Earn stamps at any location" messaging
- Location list with "Visit to earn" CTA

**LoyaltyStampCard Enhancement:**
- New `variant="brand"` prop — shows brand styling (gold border, multi-location badge)
- Location breadcrumb on stamps (tiny location initial on each filled stamp)

### 7. Redemption Code Updates
- `redemption_codes.type` gets new value: `'brand_loyalty_reward'`
- `redemption_codes.brand_id` (nullable FK) — new column for brand-scoped codes
- Staff at ANY brand location can confirm brand loyalty codes
- POS reference includes brand name + location name

### 8. Nav & Routing
- "Brand Loyalty" link in brand admin nav (between "Brand Team" and "Brand Catalog")
- Trophy icon (matching per-location loyalty nav)

### 9. Tests (Target: 15-20 new)
- `lib/__tests__/brand-loyalty.test.ts` — awardBrandStamp, redeemBrandReward, migrateLoyaltyToBrand
- `lib/__tests__/brand-loyalty-api.test.ts` — API route coverage
- `lib/__tests__/brand-loyalty-session.test.ts` — session end brand stamp awarding
- Edge cases: brand with no program, inactive program, stamp overflow, concurrent redemptions

## Tier Gating
- Brand-wide loyalty requires brand subscription (Cask or Barrel tier)
- Free/Tap brands see "Upgrade to unlock brand-wide loyalty" in nav
- Per-location loyalty remains available on all tiers (no regression)

## What We're NOT Building (Deferred)
- Cross-brand loyalty (earn at Brand A, redeem at Brand B) — not a real use case
- Tiered rewards (bronze/silver/gold loyalty levels) — future sprint
- Brand-level promotions (brand-wide happy hours) — separate feature
- Auto-stamp on session end for per-location loyalty — existing gap, not in scope

## Files Changed (Estimated)
- **New:** 8-10 files (migration, lib, admin page, API routes, brand stamp card component)
- **Modified:** 6-8 files (session end API, redemption APIs, brewery detail page, brand page, nav, types)
- **Migration:** 1 (082)
- **Tests:** 15-20 new (target 815-820 total)

## Team
- **Morgan** — Sprint scoping, ceremony
- **Jordan** — Architecture review (brand loyalty data model, session end integration)
- **Avery** — All implementation
- **Alex** — Brand loyalty card design, stamp grid variant
- **Casey** — Test spec, edge cases (multi-location redemption scenarios)
- **Reese** — Test implementation
- **Drew** — Real-world validation (brewery group loyalty workflows)
- **Taylor** — Revenue positioning (Barrel tier feature highlight)
