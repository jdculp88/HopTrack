# Sprint 125 Retro — The Passport 🛂
**Facilitated by:** Morgan 🗂️
**Date:** 2026-04-02
**Theme:** Brand-wide loyalty programs — earn anywhere, redeem anywhere

## What Shipped
- Migration 082: `brand_loyalty_programs`, `brand_loyalty_cards`, `brand_loyalty_redemptions` + RLS + Pint & Pixel seed
- `lib/brand-loyalty.ts` — 5 core functions (get program, get card, award stamp, redeem reward, migrate)
- Session end integration — auto-awards brand stamps + push notifications
- 4 brand loyalty API endpoints (admin CRUD, consumer card, redemption support)
- Brand Loyalty admin page with program setup, migration tool, top customers, recent redemptions
- `BrandLoyaltyStampCard` consumer component (passport variant with brand styling)
- Brewery detail page shows brand loyalty card when brand program active (replaces per-location)
- Brand page (`/brand/[slug]`) shows loyalty passport section
- Redemption code system updated for `brand_loyalty_reward` type
- Brand admin nav: "Brand Loyalty" link (desktop + mobile)
- Tier gating: Cask/Barrel only (per-location loyalty unchanged on all tiers)
- 22 new tests (799 → 821)

## Stats
- **Files:** 10 new, 7 modified, 1 migration
- **Tests:** 821/821 passing
- **Build:** Clean
- **TypeScript:** Clean
- **Lint:** 0 new errors

## Who Built What
- **Morgan** — Sprint scoping, ceremony, retro facilitation
- **Sage** — Sprint plan verification, scope tracking
- **Jordan** — Architecture review: parallel system design (brand loyalty alongside per-location), session-end integration review
- **Avery** — All implementation: migration, library, APIs, admin page, consumer card, nav, session integration, redemption updates
- **Alex** — Visual review: BrandLoyaltyStampCard design (Building2 icon, passport branding, tier gate screen)
- **Casey** — Test spec, edge case identification (cross-location redemption, migration aggregation)
- **Reese** — 22 tests: type verification, mock patterns, reward math, migration logic
- **Drew** — Real-world validation: "stamps follow you" pitch, migration tool importance
- **Taylor** — Revenue positioning: Barrel tier killer feature, brand-wide loyalty as the close
- **Sam** — Business continuity: per-location loyalty untouched, progressive enhancement
- **Jamie** — Brand language: "Passport" naming, icon differentiation
- **Riley** — Migration review: clean schema, proper FKs, SECURITY DEFINER reuse
- **Quinn** — Migration state verification, seed data validation

## The Roast
- Joshua asked for "scope it lets roll" — Morgan had the plan written before he finished typing
- Jordan didn't take a single walk this sprint. Casey is concerned he might be ill.
- Avery said "Already on it" exactly once. Character growth.
- Drew pitched the feature to an imaginary brewery owner during the retro. Taylor wrote it down.
- The launch.json needed three attempts to find where node lives. Riley is pretending that didn't happen.

## Key Decisions
- Brand loyalty is a parallel system — does NOT modify existing per-location loyalty tables
- Brand loyalty card takes precedence on brewery detail page when brand has active program
- Migration tool is additive (sums location stamps into brand card, preserves existing)
- Tier gating at Cask/Barrel — no regression for Free/Tap tiers
- `earn_per_session` field allows brands to award 1-3 stamps per visit (flexible)
- Redemption codes support cross-location confirmation (staff at any brand location can confirm)
