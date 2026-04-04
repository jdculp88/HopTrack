# HopTrack Launch Checklist
**Created Sprint 50 — Updated Sprint 149 (The Launchpad)**
**Owner:** Morgan | **Last updated:** 2026-04-04
**Rule:** Nothing ships until this doc is green.

> This is a living document. Items are marked ✅ COMPLETE, 🔄 IN PROGRESS, or ⬜ PENDING.

---

## 1. App Quality

| Item | Status | Owner | Notes |
|------|--------|-------|-------|
| E2E smoke tests passing (Playwright) | 🔄 | Casey / Reese | Specs exist in `e2e/`, soft-fail in CI (S76) — needs CI Supabase |
| Core-flows tests passing | 🔄 | Casey / Reese | `e2e/core-flows.spec.ts` written (S31) |
| Brewery-admin tests passing | 🔄 | Casey / Reese | `e2e/brewery-admin-flows.spec.ts` written (S44) |
| Unit test framework (Vitest) | 🔄 | Reese / Casey | **Sprint 77** — setup + 15 critical path tests |
| Zero P0 bugs open | ✅ | Casey | Confirmed Sprint 76 retro — zero P0s |
| Zero `motion.button` in codebase | ✅ | Jordan | Swept S30 + S51 |
| Zero hardcoded `#D4A843` in app interior | ✅ | Jordan | Swept S30 |
| Zero `alert()` / `confirm()` dialogs | ✅ | Jordan | Banned since Sprint 16 |
| All dead-end buttons gated with "Coming soon" | ✅ | Avery | Delete Account + others (S30) |
| Rate limits on all mutating endpoints | ✅ | Riley | 8 endpoints rate-limited (S44) |
| Rate limits on auth endpoints | ✅ | Riley / Sam | **S77 audit:** Auth is Supabase-native (rate-limited upstream). `/api/auth/welcome` rate-limited (5/min). `check-username` already limited (20/min). |
| `loading.tsx` on every data page (~98% coverage) | ✅ | Avery | S15 sweep + S23 + S51 extras + S149 (brand loyalty, punch) |
| `error.tsx` on all route groups | ✅ | Avery | `(app)`, `(brewery-admin)`, `(superadmin)`, `(auth)` (S23) |
| Sentry error reporting active | ✅ | Riley | Configured S13, reporting live |
| No `as any` casts in critical paths | 🔄 | Jordan | Reduced S57 (~250→~30 in critical paths), 292 files total still have casts |
| TypeScript build passes with no errors | ✅ | Avery | **Confirmed S77** — `npm run build` passes clean (64 pages, 0 errors) |
| All loading skeletons use `<Skeleton />` component | ✅ | Avery | Standard component `@/components/ui/SkeletonLoader` |
| CI/CD pipeline running | ✅ | Quinn / Riley | GitHub Actions CI on push to main (S76) |
| Custom 404 page (branded) | ✅ | Avery | **Sprint 149** — `app/not-found.tsx`, beer-themed, brand-styled |
| Font `display: swap` on all fonts | ✅ | Avery | **Sprint 149** — JetBrains Mono was blocking render |
| UserAvatar uses `next/image` | ✅ | Avery | **Sprint 149** — WebP/AVIF negotiation, lazy loading, responsive sizing |
| Health check endpoint (`/api/health`) | ✅ | Riley | **Sprint 149** — Supabase connectivity check, latency, version tracking |

---

## 2. Infrastructure

| Item | Status | Owner | Notes |
|------|--------|-------|-------|
| All 47 migrations applied to remote (001–047) | ✅ | Riley | Applied through S62 (047 = FK fix) |
| PGRST schema cache cleared after FK migrations | ✅ | Riley | `NOTIFY pgrst, 'reload schema';` run after 033, 040/041, 047 |
| VAPID keys generated and in `.env.local` | ✅ | Riley | Generated S16 |
| Supabase service role key (server-only) | ✅ | Riley | Used in `lib/supabase/service.ts`, never in client |
| Supabase anon key in env | ✅ | Riley | Standard setup |
| `NEXT_PUBLIC_SUPABASE_URL` set | ✅ | Riley | |
| Sentry DSN set in env | ✅ | Riley | `NEXT_PUBLIC_SENTRY_DSN` |
| Anthropic API key set (for HopRoute) | ✅ | Riley | Used in HopRoute generate endpoint |
| Storage buckets created with RLS | ✅ | Riley | `avatars` (030), `session-photos` (037) |
| Realtime enabled on `beers`, `beer_pour_sizes` | ✅ | Riley | TV Board subscription (S16/S19) |
| `proxy.ts` in place (no `middleware.ts`) | ✅ | Riley | Convention enforced since S12 |
| GitHub Actions CI pipeline | ✅ | Quinn | `.github/workflows/ci.yml` — lint, type check, build, E2E (S76) |
| Staging CI pipeline | ✅ | Quinn | `.github/workflows/staging.yml` — lint, type check, build (S76) |
| Staging environment documented | ✅ | Quinn | `docs/staging-environment.md` (S76) |
| Staging Supabase provisioned | ✅ | Joshua | **Paid tier provisioned (S77)** — team has access |
| Production environment variables documented | ✅ | Riley | `.env.production.example` created (S77/S79) |
| Supabase connection pooling configured | ⬜ | Riley | Verify for production load |
| CDN / edge caching configured | 🔄 | Riley | ISR configured on brewery pages (S49), Vercel edge review pending |
| Uptime monitoring configured | 🔄 | Riley | Health check endpoint live (S149); wire to Better Uptime / UptimeRobot |

---

## 3. Billing

| Item | Status | Owner | Notes |
|------|--------|-------|-------|
| Stripe account created | ⬜ | Taylor / Joshua | **Blocked** — needs business entity (LLC). Joshua learning process |
| `STRIPE_SECRET_KEY` in env | ⬜ | Riley | Blocked on Stripe account |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in env | ⬜ | Riley | Blocked on Stripe account |
| Stripe webhook secret in env | ⬜ | Riley | Blocked on Stripe account |
| Webhook registered in Stripe dashboard | ⬜ | Riley | Blocked on Stripe account |
| Tap tier product + price created in Stripe ($49/mo, $470/yr) | ⬜ | Taylor | Blocked on Stripe account |
| Cask tier product + price created in Stripe ($149/mo, $1,430/yr) | ⬜ | Taylor | Blocked on Stripe account |
| Barrel tier (custom) contact flow configured | ⬜ | Taylor | Route to `sales@hoptrack.beer` |
| Trial flow tested end-to-end (14-day) | 🔄 | Casey | Trial badge + countdown in sidebar; Stripe trial period config pending |
| Upgrade CTA → billing page flow tested | ✅ | Casey | `/brewery-admin/[id]/billing` live (S31) |
| Subscription cancel flow | ✅ | Avery | **Built Sprint 75** — `/api/billing/cancel`, inline AnimatePresence confirmation |
| Billing portal (Stripe Customer Portal) | ✅ | Avery | **Built Sprint 75** — `/api/billing/portal` endpoint live |
| Webhook handlers (sub lifecycle) | ✅ | Avery | **Built Sprint 75** — `checkout.session.completed`, `invoice.payment_failed`, `invoice.paid`, `customer.subscription.trial_will_end` |
| Monthly/annual billing toggle | ✅ | Avery | **Built Sprint 75** — BillingClient with interval toggle |

---

## 4. Content & Data

| Item | Status | Owner | Notes |
|------|--------|-------|-------|
| Demo breweries seeded (3 Asheville) | ✅ | Riley | Mountain Ridge, River Bend, Smoky Barrel — migration 024 |
| Demo beers with prices + glass types | ✅ | Riley | 20 beers, 74 pour size rows — migrations 024, 029 |
| Demo board stats (sessions + beer_logs) | ✅ | Riley | Migration 027 |
| Real brewery data — 59+ breweries seeded | ✅ | Riley | Sprint 41, real OpenBreweryDB data |
| City coverage — 10 cities with brewery data | ✅ | Riley | S41 master plan |
| TestFlight test account works | 🔄 | Casey | `testflight@hoptrack.beer` / `HopTrack2026!` — seed 008 |
| HopRoute AI brewery crawl working end-to-end | ✅ | Avery | Sprint 40 — generate → live mode → achievements |
| `hop_routes`, `hop_route_stops`, `hop_route_stop_beers` populated | ✅ | Riley | Migrations 040, 041 |
| Beer of the Week set for launch day | ⬜ | Jamie | Set `is_featured = true` on a standout beer |
| Editorial content (seasonal beers, curated collections) | ✅ | Jamie | 6 curated collections hardcoded (S54) |

---

## 5. Legal

| Item | Status | Owner | Notes |
|------|--------|-------|-------|
| Terms of Service page live (`/terms`) | ✅ | Jamie | Placeholder live (S31) — **needs legal review** |
| Privacy Policy page live (`/privacy`) | ✅ | Jamie | Built S14 — **needs legal review** |
| Cookie notice / consent banner | ✅ | Avery / Alex | **Built Sprint 77** — `CookieConsent` component, localStorage, accept/decline |
| GDPR compliance review | ⬜ | Sam | Assess EU exposure, add consent management if needed |
| CCPA compliance (California) | ⬜ | Sam | Assess if user base hits CA threshold |
| ToS + Privacy linked on signup form | ✅ | Avery | Added S31 |
| Delete Account flow (data erasure) | ✅ | Avery | **Built Sprint 60** — inline DELETE confirmation, cascade-delete API, `admin.deleteUser` |
| Data retention policy documented | ⬜ | Sam | Define how long sessions/logs are kept |
| Business entity / LLC formed | ⬜ | Joshua | **In progress** — Taylor creating formation guide (S77) |
| App Store developer agreement accepted | ⬜ | Joshua | **Deferred** — web-first, app later |

---

## 6. SEO

| Item | Status | Owner | Notes |
|------|--------|-------|-------|
| `metadataBase` set in `app/layout.tsx` | ✅ | Jamie | `https://hoptrack.beer` — added S50 |
| Default `title` and `description` | ✅ | Jamie | Set in `app/layout.tsx` |
| OpenGraph tags (`og:type`, `og:locale`, `og:site_name`) | ✅ | Jamie | Updated S50 |
| Twitter Card meta | ✅ | Jamie | Added S50 |
| `app/sitemap.ts` — Next.js sitemap generator | ✅ | Jamie | Created S50, includes dynamic brewery pages |
| `app/robots.ts` — crawl rules | ✅ | Jamie | Created S50, disallows admin/api routes |
| OG image for homepage | ✅ | Jamie | **Built Sprint 60** — `app/og/route.tsx` edge ImageResponse (1200×630) |
| OG images for individual brewery pages | ✅ | Jamie | **Built Sprint 60** — `?type=brewery&brewery=Name&city=City,ST` variant |
| Canonical URLs on all pages | 🔄 | Avery | `metadataBase` set; verify no duplicate content |
| Page titles unique on all routes | 🔄 | Avery | Audit `title` exports per page |
| `<title>` template: `%s \| HopTrack` | ✅ | Avery | Set in root layout |
| Structured data (JSON-LD) for brewery pages | 🔄 | Avery | **Sprint 77** — `LocalBusiness` schema |
| Google Search Console verified | ⬜ | Jamie | Submit sitemap after launch |

---

## 7. App Store

| Item | Status | Owner | Notes |
|------|--------|-------|-------|
| Apple Developer account ($99/yr) | ⬜ | Joshua | **Deferred** — web-first approach, app comes later |
| App icons (1024×1024 + all sizes) | 🔄 | Alex | `app/icon.tsx` + `app/apple-icon.tsx` (S22) — verify export sizes |
| App Store screenshots (6.7", 5.5", iPad) | ⬜ | Alex | Deferred — web-first |
| App Store metadata (name, subtitle, description) | 🔄 | Jamie | Doc created S14 — finalize copy |
| App Store keywords | ⬜ | Jamie | Deferred — web-first |
| App Store category: Food & Drink | ⬜ | Jamie | Deferred — web-first |
| Privacy policy URL in App Store Connect | ✅ | Jamie | `/privacy` page exists |
| Support URL in App Store Connect | ✅ | Jamie | `help@hoptrack.beer` + `/help` page (S50) |
| Age rating configured | ⬜ | Jamie | Deferred — web-first |
| Capacitor configured (`capacitor.config.ts`) | ✅ | Alex | Bundle ID: `beer.hoptrack.app` (S14) |
| Xcode signing configured | ⬜ | Alex | Deferred — web-first |
| TestFlight build uploaded | ⬜ | Alex | Deferred — web-first |
| TestFlight test account verified | 🔄 | Casey | Seed 008 account created; needs device test |

---

## 8. Marketing

| Item | Status | Owner | Notes |
|------|--------|-------|-------|
| `/for-breweries` pricing page live | ✅ | Jamie | Pricing page with 3 tiers |
| "Check-in" copy fully replaced with "session/visit/pour" | ✅ | Avery | Swept S15 + S30 |
| QR Table Tents generator working | ✅ | Avery | 3 formats: Table Tent / Coaster / Poster (S21) |
| `/brewery-welcome/[id]` bridge page live | ✅ | Avery | Cream/gold public landing per brewery (S21) |
| The Board demo-ready (cream menu) | ✅ | Alex | Full typographic redesign S18, Board v2 |
| HopMark logo deployed across all surfaces | ✅ | Alex | Deployed S22 — AppNav, auth, Board, QR tents |
| PWA installable (manifest + service worker) | ✅ | Alex | `manifest.json` + `public/sw.js` |
| Social share cards (session OG images) | ✅ | Avery | `/session/[id]` with OG meta tags (S14) |
| Email marketing tool selected | ✅ | Jamie | **Resend integrated Sprint 75** — `lib/email.ts` with 6 templates |
| Launch announcement email draft | ⬜ | Jamie | |
| Social media accounts claimed (@hoptrack) | ⬜ | Jamie | Twitter/X, Instagram |
| App Store listing preview reviewed | ⬜ | Jamie | Deferred — web-first |
| Press kit prepared | ⬜ | Jamie | Logo assets, screenshots, one-pager |

---

## 9. Sales

| Item | Status | Owner | Notes |
|------|--------|-------|-------|
| Sales docs in `docs/sales/` | ✅ | Taylor | GTM, pitch guide, pricing, target breweries, deck outline (S17) |
| Business formation guide | 🔄 | Taylor | **Sprint 77** — step-by-step LLC guide for Joshua |
| Warm intro list ready (Drew's Asheville network) | 🔄 | Taylor / Drew | Drew has the contacts — waiting on product confidence |
| First 10 brewery targets identified | ✅ | Taylor | In `docs/sales/target-breweries.md` |
| Asheville outreach strategy documented | ✅ | Taylor | Drew-led warm intros, no cold outreach yet |
| Pitch deck ready | 🔄 | Taylor | Deck outline exists; needs slides built |
| Demo environment stable and impressive | ✅ | Avery | Demo breweries + real data + HopRoute live |
| First paid brewery closed | ⬜ | Taylor | Waiting on business entity + product confidence |
| Case study infrastructure ready | 🔄 | Taylor | Framework planned, awaiting first customer |
| Onboarding flow for new breweries | ✅ | Avery | **Built Sprint 74** — 4-step wizard (Logo → Beers → Loyalty → Preview) + email drip (S75) |
| Support email configured | ⬜ | Riley | `support@hoptrack.beer` routing |

---

## 10. Launch Day

| Item | Status | Owner | Notes |
|------|--------|-------|-------|
| Team communication channel (Slack / Discord) | ⬜ | Morgan | Set up `#launch` channel |
| Monitoring dashboard configured | ⬜ | Riley | Sentry + uptime alert dashboard |
| On-call rotation for launch week | ⬜ | Morgan | Who's watching what, what hours |
| `support@hoptrack.beer` inbox live | ⬜ | Riley | MX records + forwarding |
| `help@hoptrack.beer` inbox live | ⬜ | Riley | |
| `sales@hoptrack.beer` inbox live | ⬜ | Riley | |
| Incident response runbook | 🔄 | Riley | **Sprint 77** — documenting this sprint |
| Rollback plan documented | 🔄 | Riley | **Sprint 77** — Vercel instant rollback + git revert strategy |
| Launch day timeline (T-24h checklist) | 🔄 | Morgan | **Sprint 77** — documenting this sprint |
| Post-launch retro scheduled | ⬜ | Morgan | T+48h after launch |
| 🍺 Launch party planned | ⬜ | Everyone | Drew's taproom in Asheville — dates TBD |

---

## Quick Stats

| Category | Complete | In Progress | Pending | Total |
|----------|----------|-------------|---------|-------|
| App Quality | 16 | 5 | 1 | 22 |
| Infrastructure | 15 | 2 | 1 | 18 |
| Billing | 6 | 1 | 7 | 14 |
| Content & Data | 9 | 1 | 1 | 11 |
| Legal | 6 | 0 | 4 | 10 |
| SEO | 9 | 3 | 1 | 13 |
| App Store | 4 | 3 | 6 | 13 |
| Marketing | 9 | 0 | 3 | 12 |
| Sales | 5 | 4 | 2 | 11 |
| Launch Day | 0 | 3 | 8 | 11 |
| **TOTAL** | **79** | **22** | **34** | **135** |

**Launch readiness: 59% complete** (was 56% — Sprint 149 added 4 new items and completed 6).
**Biggest open blocks:** Billing (blocked on business entity), Launch Day (operational docs in progress).
**Note:** 7 billing items are blocked on Joshua forming the LLC. App Store items deferred (web-first).

---

*Morgan: "This is a living document. Updated Sprint 149. The Launchpad pushed us to 59% — and that is with 7 billing items blocked on LLC."* 🍺
