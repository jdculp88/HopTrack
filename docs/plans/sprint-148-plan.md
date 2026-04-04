# Sprint 148 — The Closer

**Theme:** First customer acquisition infrastructure
**Arc:** Standalone (post-hardening)
**Sprint Vote:** Joshua picked Option A (12-3-2 implied, The Closer promised since S138)

---

## Context
Sprint 147 closed with KNOWN section empty (first time in 14+ sprints), 1218 tests green, codebase hardened. The product is ready — claim funnel shipped (S145), AI features live (S146), zero known bugs (S147). Time to build the sales motion.

**Key Discovery:** Superadmin claims management already exists (`/superadmin/claims/` with approve/reject UI + nav badge). Zero work needed.

**Standing Blocker:** LLC formation + Stripe setup remains Joshua's task (guide at `docs/sales/business-formation-guide.md`).

---

## Deliverables

### 1. Demo Brewery Dashboard (HIGH)
Public, no-auth dashboard preview using Pint & Pixel seed data.

**New files:**
- `lib/constants/demo.ts` — DEMO_BREWERY_ID, DEMO_BREWERY_NAME
- `app/demo/layout.tsx` — Minimal layout (HopMark header, back link, claim CTA)
- `app/demo/dashboard/page.tsx` — Server component, service role client, ISR revalidate=60
- `app/demo/dashboard/DemoDashboardClient.tsx` — Full dashboard mirror: demo banner, Today's Snapshot, 8 KPI cards, activity feed, top beers, recent visits, ROI preview, disabled quick actions with "Claim to unlock" tooltips
- `app/demo/dashboard/loading.tsx` — Skeleton

**Modified files:**
- `components/landing/BreweriesContent.tsx` — "See it in action" CTA in hero

**Reuses:** `calculateBreweryKPIs()`, `calculateBreweryKPISparklines()`, `calculateROI()`, Sparkline, Card

### 2. Sales Pipeline on Command Center (MEDIUM)
Funnel visualization for prospect → trial → conversion tracking.

**Modified files:**
- `lib/superadmin-metrics.ts` — SalesPipelineMetrics interface + calculateSalesPipeline()
- `app/(superadmin)/superadmin/CommandCenterClient.tsx` — SalesPipeline section with funnel bars, summary stats, trial expiring alerts

### 3. Pricing Page Enhancements (MEDIUM)
Live product proof on `/for-breweries`.

**Modified files:**
- `components/landing/BreweriesContent.tsx`:
  - Live Board embed preview (iframe to Pint & Pixel embed menu)
  - Social proof updated: "7,177 breweries listed"
  - "See a live dashboard demo" link in pricing section

### 4. Drew's One-Pager (MEDIUM)
Printable/phone-friendly page for warm intros.

**New files:**
- `app/for-breweries/one-pager/page.tsx` — Print-optimized, dark+gold, QR code, pricing strip
- `app/for-breweries/one-pager/loading.tsx` — Skeleton

### 5. Email Sequence Polish (LOW)
Enhanced Day 3 + Day 7 onboarding emails with specific CTAs.

**Modified files:**
- `lib/email-templates/index.ts` — Day 3: 3 setup steps (tap list, loyalty, Board). Day 7: analytics highlights (peak hours, top beers, retention), billing nudge
- `lib/__tests__/email-triggers.test.ts` — 7 new template content tests

### 6. Tests
- `lib/__tests__/superadmin-metrics.test.ts` — 5 new sales pipeline tests
- `lib/__tests__/email-triggers.test.ts` — 7 new email template tests
- Total: 1228 tests (10 new, all pass)

---

## What Was NOT Built (Intentionally)
- No new migrations (all tables exist)
- No Stripe integration (LLC pending)
- No claims management UI (already exists at /superadmin/claims/)
- No demo view tracking (premature)
- No new email templates (enhanced existing ones)

## Files Created
- `lib/constants/demo.ts`
- `app/demo/layout.tsx`
- `app/demo/dashboard/page.tsx`
- `app/demo/dashboard/DemoDashboardClient.tsx`
- `app/demo/dashboard/loading.tsx`
- `app/for-breweries/one-pager/page.tsx`
- `app/for-breweries/one-pager/loading.tsx`
- `docs/plans/sprint-148-plan.md`

## Files Modified
- `lib/superadmin-metrics.ts` — SalesPipelineMetrics + calculateSalesPipeline()
- `app/(superadmin)/superadmin/CommandCenterClient.tsx` — SalesPipeline section
- `components/landing/BreweriesContent.tsx` — demo CTA, embed preview, social proof, demo link
- `lib/email-templates/index.ts` — Day 3 + Day 7 email enhancements
- `lib/__tests__/email-triggers.test.ts` — 7 new tests
- `lib/__tests__/superadmin-metrics.test.ts` — 5 new tests

## Metrics
- 8 new files, 6 modified
- 0 migrations
- 1228 tests (10 new, all pass)
- Build: clean
