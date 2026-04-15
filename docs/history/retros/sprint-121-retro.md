# Sprint 121 Retro — The Ledger
**Facilitator:** Morgan
**Date:** 2026-04-02
**Arc:** Multi-Location (Sprints 114-137)

## The Sprint
Brand-level billing and subscriptions. One Stripe customer per brand. Base subscription + per-location add-ons ($39/location/mo). All locations inherit the brand tier. The #1 blocker for Barrel tier sales — gone.

## What Shipped
- **Migration 079** — Brand billing columns on `brewery_brands`: subscription_tier, stripe_customer_id, trial_ends_at, billing_email
- **`lib/brand-billing.ts`** — Tier propagation logic: propagateBrandTier, revertBrandTier, getBrandLocationCount, syncLocationTierOnBrandJoin/Leave
- **`lib/stripe.ts`** — STRIPE_BRAND_PRICES (4 env vars), BRAND_ADDON_INFO ($39/mo, $374/yr, 20% savings)
- **3 Brand Billing API routes** — `/api/brand/[brand_id]/billing/checkout` (2 line items: base + per-location add-on), `/portal`, `/cancel` (cancel at period end)
- **Webhook dual-path** — `type: "brand"` metadata discriminator routes brand vs brewery subscriptions. Service role client for cross-brewery propagation.
- **Brand Billing page** — `/brewery-admin/brand/[brand_id]/billing/` with active subscription card (stats grid, cancel flow), location roster (green checkmarks), pricing card (monthly/annual toggle, per-location breakdown), feature list (Barrel column)
- **Brand Billing nav link** — CreditCard icon in brand nav section
- **Per-brewery billing redirect** — When location is covered by brand subscription, shows "covered by [Brand Name]'s brand subscription" banner with link to brand billing
- **Location tier sync** — Adding location to subscribed brand inherits tier. Removing location reverts to free (unless has own direct subscription).
- **14 new tests** — STRIPE_BRAND_PRICES, BRAND_ADDON_INFO, propagateBrandTier, revertBrandTier, getBrandLocationCount, syncLocationTierOnBrandJoin/Leave
- **Env vars** — 4 new brand Stripe price ID placeholders in .env.local.example

## Who Built What

**Avery** 💻 — Built everything: migration 079, brand-billing.ts, 3 API routes, webhook dual-path, BrandBillingClient, nav link, per-brewery redirect, location sync, tests.
> "Already on it. All twelve of them."

**Jordan** 🏛️ — Architecture review. The `type: "brand"` metadata discriminator and brand-billing.ts mirroring brand-propagation.ts patterns.
> "I didn't have to take a walk. The patterns rhyme."

**Riley** ⚙️ — Migration 079 pushed clean. Service role client decision for webhook propagation.
> "The migration pipeline is real now."

**Quinn** ⚙️ — Reviewed propagation logic. Flagged syncLocationTierOnBrandLeave checking for direct stripe_customer_id.
> "Let me check the migration state first. ...Clean."

**Alex** 🎨 — Brand Billing page layout. Active subscription card with gold border, stats grid, pricing breakdown.
> "It already FEELS like enterprise software."

**Casey** 🔍 — Caught the 404 (migration not pushed yet). Zero P0 bugs.
> "Zero P0 bugs open. ZERO."

**Sam** 📊 — Validated per-location add-on math and pricing UI clarity.
> "From a business continuity standpoint... operators need to see exactly what they're paying per location."

**Drew** 🍻 — Validated per-brewery redirect banner. Prevents operator confusion on franchise billing.
> "I felt that physically."

**Taylor** 💰 — This is the Barrel tier unlock. Consolidated billing closes enterprise deals.
> "We're going to be rich." 📈

**Jamie** 🎨 — Brand Billing nav link in gold.
> "Chef's kiss." 🤌

**Reese** 🧪 — 730 → 744 tests. 14 new across 2 files. All passing.
> "Covered."

**Sage** 📋 — Sprint notes: 9 new files, 7 modified, 1 migration.
> "I've got the notes."

**Morgan** 🗂️ — Scoped 3 options, plan approved, built and verified same session.
> "This is a living document. And now it has a checkout button."

## The Numbers
- **Files:** 9 new, 7 modified, 1 migration
- **Tests:** 730 → 744 (14 new)
- **Build:** Clean
- **Lint errors (new files):** 0

## What Went Well
- Clean architecture — brand-billing.ts mirrors brand-propagation.ts
- Webhook dual-path with `type: "brand"` metadata discriminator is elegant
- Per-brewery redirect prevents operator confusion
- Location add/remove automatically syncs tier
- Demo mode works end-to-end without Stripe keys
- Build and tests green on first run

## What Could Be Better
- Migration needs to be pushed before testing new brand pages (404 on first visit)
- Brand billing base price is "Custom" (Barrel tier) — define actual base once Taylor finalizes sales deck
- launch.json PATH issue blocked preview_start — dev environment quirk

## The Founder Roast
Joshua clicked Brand Billing approximately 0.3 seconds after the nav link appeared. The man has the reaction time of a cat seeing a laser pointer. He found the 404 faster than Casey found the root cause. Then he said "close the sprint" with the confidence of someone who knows exactly what they built. We're going to be rich.

## Up Next
- **Sprint 122** — The Staff Room (brand team management & permissions)
- **Sprint 123** — TBD (arc continues through Sprint 137)
