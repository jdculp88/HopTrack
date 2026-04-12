---
name: hoptrack-conventions
description: HopTrack coding conventions and enforcement rules — Next.js 16 route groups and patterns, Supabase client/server split and count query rules, Tailwind v4 CSS variables, Framer Motion rules (no motion.button), DRY required imports (requireAuth, apiSuccess, PageHeader, Card, Pill, animation presets), BANNED UI patterns (alert/confirm, raw NextResponse, inline role/tier checks, hardcoded colors), and REQUIRED patterns (loading.tsx skeletons, optimistic updates, toast notifications, inline delete confirmations). Use when writing, reviewing, refactoring, or making any code changes to HopTrack.
---

# HopTrack Conventions

These rules are non-negotiable. Read before writing a single line of code.

## Next.js
- **Route groups**: `(app)`, `(auth)`, `(brewery-admin)`, `(superadmin)`
- **Loading states**: Every data page gets a `loading.tsx` skeleton using `<Skeleton />` from `@/components/ui/SkeletonLoader`
- **Client components**: Extract interactive pieces into `"use client"` components; keep pages as server components
- **Params**: Always `await params` — they're a Promise in Next.js 16
- **proxy.ts** replaces `middleware.ts` — do NOT recreate `middleware.ts`

## Supabase
- **Client**: `createClient()` from `@/lib/supabase/client` (browser)
- **Server**: `createClient()` from `@/lib/supabase/server` (RSC/API routes)
- Always cast with `as any` where TypeScript fights the Supabase types
- **Service role key**: server-side only, NEVER in client code
- Migrations live in `supabase/migrations/` — numbered sequentially
- **NEVER use `.length` on unbounded query results for stats** — Supabase PostgREST defaults to 1000 rows. Use `{ count: "exact", head: true }` for pure counts, or add `.limit(50000)` when data must be iterated (S153 P0 fix)
- **Every displayed column needs a write path OUTSIDE of seed migrations** — when you add a stat column, rollup table, or displayed field, verify end-to-end that real users can populate it. Run the grep: `grep -rn "column_name" app/ lib/ supabase/migrations/ | grep -iE "update|insert|upsert|rpc|\.update\(|\.insert\(|\.upsert\("`. If the only hits are in seeds (074/075/076/100/104/105) or migration files labeled `*seed*` / `*boost*`, you have an orphan. Add a trigger, an RPC, or an API-route write before shipping. Regression guards: `lib/__tests__/orphaned-columns-guard.test.ts` + `lib/__tests__/stat-write-paths.test.ts` — add a row to the STAT_WRITE_PATHS table when you ship a new stat column (S177 P0 fix)

## Styling
- **Tailwind v4** — CSS-first config via `@theme {}` in `globals.css`
- **ALWAYS use CSS variables** — `var(--surface)`, `var(--border)`, `var(--text-primary)`, `var(--accent-gold)`, `var(--danger)`, `var(--text-muted)`, `var(--text-secondary)`, `var(--surface-2)`
- **NEVER hardcode colors** except `#0F0E0C` (bg) and `#D4A843` (gold) where CSS vars aren't available
- Font stack: `font-display` = Playfair Display, `font-mono` = JetBrains Mono, default = DM Sans
- Rounded corners: `rounded-2xl` for cards, `rounded-xl` for buttons/inputs

## Framer Motion
- YES: `<motion.div>` on decorative/layout elements
- NO: NEVER `motion.button` — use `<button>` with inner `<motion.div>` for animations
- Use `AnimatePresence` for enter/exit transitions
- Spring config: `{ type: "spring", stiffness: 400, damping: 30 }`

## UI Patterns — BANNED
- `alert()` — use toast or inline message
- `confirm()` — use inline confirmation with AnimatePresence slide-down
- Dead buttons — gate unbuilt features with "Coming soon" tooltip/badge
- Blank pages — every empty state needs a friendly message + CTA
- Silent failures — always surface errors to the user
- Inline `["owner", "manager"]` role checks — use `requireBreweryAdmin()` from `lib/api-helpers.ts`
- Inline `["cask", "barrel"]` tier checks — use `requirePremiumTier()` from `lib/api-helpers.ts`
- Raw `NextResponse.json({ error })` in API routes — use `apiError()`/`apiUnauthorized()`/etc. from `lib/api-response.ts`
- Inline `.split(" ")[0]` for first names — use `getFirstName()` from `lib/first-name.ts`
- Inline `initial={{ opacity: 0, y: N }}` animation objects — use presets from `lib/animation.ts`
- Duplicated tier color/rank maps — import from `lib/constants/tiers.ts`
- Duplicated pill toggle styles — import from `lib/constants/ui.ts`
- Inline card styling (`rounded-2xl border` + `var(--surface)`) — use `Card` from `components/ui/Card.tsx`

## UI Patterns — REQUIRED
- Inline delete confirmations — AnimatePresence slide-down with Cancel + Confirm
- Optimistic updates with rollback on error
- `loading.tsx` skeleton for every data page
- Error state in forms (inline, not alert)
- Toast notifications for all mutations

## DRY Patterns — REQUIRED (Sprint 134)
- **API routes**: `requireAuth()`, `requireBreweryAdmin()`, `requirePremiumTier()` from `lib/api-helpers.ts`
- **API responses**: `apiSuccess()`, `apiError()`, `apiUnauthorized()`, `apiForbidden()` from `lib/api-response.ts`
- **Page headers**: `PageHeader` component from `components/ui/PageHeader.tsx`
- **Stat grids**: `StatsGrid` component from `components/ui/StatsGrid.tsx`
- **Feed cards with accent bars**: `FeedCardWrapper` from `components/social/FeedCardWrapper.tsx`
- **Form fields**: `FormField` wrapper from `components/ui/FormField.tsx`
- **Cards**: `Card` component from `components/ui/Card.tsx` (padding: compact/default/spacious)
- **Empty states**: `EmptyState` component from `components/ui/EmptyState.tsx`
- **Badges/pills**: `Pill` component from `components/ui/Pill.tsx`
- **Animations**: presets from `lib/animation.ts` (`spring`, `transition`, `variants`, `stagger`, `cardHover`)
- **Auth pages**: `GoogleOAuthButton`, `AuthDivider`, `AuthErrorAlert` from `components/auth/`
- **Superadmin search**: `SearchForm` from `components/superadmin/SearchForm.tsx`
- **Constants**: `lib/constants/tiers.ts` (`TIER_COLORS`, `TIER_STYLES`, `RANK_STYLES`, `CATEGORY_LABELS`)
- **Constants**: `lib/constants/ui.ts` (`PILL_ACTIVE`, `PILL_INACTIVE`, `INPUT_STYLE`, `CLAIM_STATUS_STYLES`)
- **First names**: `getFirstName()` from `lib/first-name.ts`
- **Optimistic toggles**: `useOptimisticToggle` hook from `hooks/useOptimisticToggle.ts`
- **Delete confirmations**: `useDeleteConfirmation` hook from `hooks/useDeleteConfirmation.ts`

## Enforcement
Before shipping any code change, verify:
1. No BANNED patterns introduced
2. All applicable REQUIRED patterns in place
3. DRY helpers used instead of inline duplication
4. CSS variables used instead of hardcoded colors
5. `loading.tsx` added for any new data page
6. **Every displayed stat column has a non-seed write path** (S177 audit rule). If `orphaned-columns-guard.test.ts` or `stat-write-paths.test.ts` fail in CI, a display field is silently broken in prod — fix the plumbing, don't weaken the test.
