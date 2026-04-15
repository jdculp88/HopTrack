# The Overhaul — Sprint 104-113 Arc Plan

**Arc:** The Overhaul
**Duration:** 10 sprints (104-113)
**Theme:** Fix everything. Modernize everything. Ship the highest quality craft beer app in the world.
**Approved by:** Joshua (founder) — "I want to be like did I hire people from Wispflow, Spotify, and Robinhood to work here"
**Follows:** Ship Shape arc (98-103, COMPLETE)
**Precedes:** Multi-Location arc (114-137, deferred from 104-127)
**No retros mid-arc** — party when we're done

---

## North Star

When The Overhaul is complete, every engineer who opens this codebase should feel like they're reading Spotify-level code. Every user should feel like they're using a Robinhood-level product. Every brewery owner should feel like they're using enterprise software that was built specifically for them.

- **Zero compromise on quality.** Not "good enough for a startup." Actually good.
- **Production-grade everything.** Security headers, typed APIs, tested flows, real CI.
- **Nothing off limits** — except features Joshua explicitly reserved for October.
- **Spotify-level architecture.** Clean separations, typed contracts, nothing over 400 lines.

---

## The Team

| Person | Role | Sprints |
|--------|------|---------|
| Morgan 🗂️ | Arc lead, planning, coordination | All |
| Sage 📋 | Specs, documentation, notes | All |
| Jordan 🏛️ | Architecture review, patterns | All |
| Avery 💻 | Implementation — code changes | All |
| Casey 🔍 | QA sign-off, test strategy | 104, 105, 111, 113 |
| Reese 🧪 | Test writing, coverage | 105, 111, 113 |
| Alex 🎨 | UI/UX, feel, animations | 108, 109, 112 |
| Sam 📊 | Accessibility, API contracts | 104, 107, 109 |
| Riley ⚙️ | Security, infra, env validation | 104, 107, 110 |
| Quinn ⚙️ | DB indexes, RLS, migrations | 104, 107 |
| Drew 🍻 | Brewery ops UX validation | 108, 110, 111 |
| Taylor 💰 | Demo mode, sales flows | 112 |
| Jamie 🎨 | Brand audit, OG, screenshots | 112 |

---

## Phase 1: Foundation (104-105)

### Sprint 104 — The Audit
**Theme:** Find every crack and seal it. No new features — only foundations.

**Deliverables:**
- [ ] Security headers: `X-Content-Type-Options`, `X-Frame-Options` (SAMEORIGIN on app routes), `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` added to `next.config.ts`
- [ ] `lib/env.ts` — `validateEnv()` that checks all required env vars at startup, throws with clear message on missing
- [ ] `reactStrictMode: true` in `next.config.ts` (dev double-render catches bugs before prod)
- [ ] Console.log cleanup — remove all debug `console.log()` from production API paths (POS webhooks, settings, stats routes)
- [ ] `@axe-core/react` integrated for dev-mode accessibility warnings
- [ ] Full database query performance audit — `EXPLAIN ANALYZE` on top queries documented
- [ ] RLS policy audit — every table verified correct
- [ ] Supabase Edge Functions audit — documented or removed if stale

**Exit criteria:** No console.log in production paths. Security headers verified. validateEnv documented.

---

### Sprint 105 — The Test Wall
**Theme:** Real tests that actually catch real bugs.

**Deliverables:**
- [ ] `msw` (Mock Service Worker) installed and configured for E2E tests
- [ ] Test factory helpers: `createMockUser()`, `createMockBrewery()`, `createMockSession()`, `createMockBeer()`
- [ ] API route test suite — every route gets happy-path + auth-failure + validation tests
- [ ] Component test infrastructure: `@testing-library/react` + Vitest for TSX
- [ ] 200+ new unit tests (target: 318 → 520+)
- [ ] `continue-on-error` removed from Playwright CI step (MSW provides real mocking)
- [ ] Coverage report added to CI (`vitest --coverage`)

**Exit criteria:** 520+ tests passing. CI hard-fails on test failure. Coverage report in CI artifacts.

---

## Phase 2: Code Quality (106-107)

### Sprint 106 — The Split
**Theme:** Every file a joy to read. No monoliths.

**Deliverables:**
- [ ] `SessionRecapSheet.tsx` (964 lines) → `RecapHeader`, `RecapPhotoGallery`, `RecapAchievements`, `RecapStats` (each <280 lines)
- [ ] `TapWallSheet.tsx` (943 lines) → `TapWallHeader`, `TapWallBeerList`, `TapWallSearch`, `TapWallActions`
- [ ] `ClaimBreweryClient.tsx` (964 lines) → `ClaimSearchStep`, `ClaimVerifyStep`, `ClaimConfirmStep`
- [ ] `BoardClient.tsx` (834 lines) → `BoardHeader`, `BoardTapList`, `BoardEvents`, `BoardStats`
- [ ] `BarbackClient.tsx` (799 lines) → `BarbackOverview`, `BarbackReviewTable`, `BarbackBatchActions`
- [ ] `brewery/[id]/page.tsx` (821 lines) → server component + `BreweryHero`, `BreweryTapList`, `BreweryReviews`
- [ ] Typed Supabase helpers: `SessionWithJoins`, `BeerWithBrewery`, `BreweryWithStats`, `ProfileWithStats` — proper interfaces so `as any` is never needed for these shapes
- [ ] `as any` reduced from 449 → <100

**Exit criteria:** No component over 400 lines. TypeScript stricter. Zero regression on existing tests.

---

### Sprint 107 — The Standard
**Theme:** One pattern for everything. Everywhere.

**Deliverables:**
- [ ] `lib/api-response.ts` — `apiSuccess<T>()`, `apiError()`, `apiValidationError()` with typed JSON envelope `{ data, meta, error }`
- [ ] All 100 API routes migrated to use `apiSuccess` / `apiError` — no more raw `Response.json({ error: "..." })`
- [ ] `lib/logger.ts` — structured logger with Vercel-compatible JSON output (`logger.info()`, `logger.warn()`, `logger.error()`)
- [ ] All remaining `console.log/warn/error` in API routes replaced with `logger.*`
- [ ] Form validation: single pattern across all forms — inline, real-time, with `aria-describedby` error linking
- [ ] Rate limiting: audit all 100 routes — every write endpoint that doesn't already have rate limiting gets it
- [ ] Error sanitization: no Supabase internals, no stack traces, no raw DB errors in client responses

**Exit criteria:** Every route uses standard response envelope. Logger in use. Rate limiting complete.

---

## Phase 3: UI & UX (108-109)

### Sprint 108 — The Feel
**Theme:** It needs to FEEL like an app built by a team that cares.

**Deliverables:**
- [ ] 4px spacing grid enforced: `gap-1` (4px), `gap-2` (8px), `gap-3` (12px), `gap-4` (16px), `gap-6` (24px), `gap-8` (32px) — audit and correct inconsistencies
- [ ] Card padding standardized: `p-4` for standard cards, `p-3` for compact, `p-5` for hero — documented in design system
- [ ] Touch target audit: every interactive element ≥44px height/width — fix all violations
- [ ] Bottom sheet drag dismiss: `dragConstraints`, `dragElastic: 0.1`, velocity-based snap-to-close
- [ ] Empty states: every empty state gets an icon/illustration + action CTA — no plain text empties
- [ ] Gold-on-dark contrast: audit every `text-[--accent-gold]` on dark bg — ensure 4.5:1 WCAG AA
- [ ] Loading skeletons: gold shimmer (`shimmer` keyframe) on all skeleton components
- [ ] `DM Sans` loaded via `next/font/google` instead of Fontshare external link (performance + reliability)

**Exit criteria:** Alex signs off. Touch targets 100% compliant. Skeletons on-brand.

---

### Sprint 109 — The Access
**Theme:** Every user. Not just sighted keyboard users.

**Deliverables:**
- [ ] `aria-label` on every icon-only button (`<button aria-label="Close">`, `<button aria-label="86 this beer">`, etc.)
- [ ] `aria-live="polite"` on feed refresh areas, toast notifications, session status
- [ ] `role="dialog"` + `aria-modal="true"` + `aria-labelledby` on all modals and drawers
- [ ] `aria-describedby` wired to form error messages for every form field with validation
- [ ] Semantic HTML audit: replace `<div onClick>` patterns with `<button>` elements
- [ ] Keyboard navigation: tab order, star rating keyboard input (arrow keys), carousel keyboard nav
- [ ] Focus trap: verify `Modal` and `FullScreenDrawer` have working focus traps
- [ ] Focus restoration: all modals/drawers restore focus to trigger on close
- [ ] `@axe-core/react` zero violations on all critical paths (home, brewery detail, session flow, profile)
- [ ] Screen reader test of: check-in flow, brewery detail, loyalty redemption

**Exit criteria:** Sam + Casey sign off. axe-core 0 violations on critical paths. WCAG AA certified.

---

## Phase 4: Performance & Resilience (110-111)

### Sprint 110 — The Speed
**Theme:** Fast on 3G. Sub-second on LTE. Bulletproof on bad WiFi.

**Deliverables:**
- [ ] Dashboard load audit: identify slowest queries, add `revalidate` + skeleton strategies
- [ ] `<Image>` audit: every `<img>` tag replaced with Next.js `<Image>` with proper `sizes` prop
- [ ] Bundle analysis: `@next/bundle-analyzer` run, identify and code-split heavy pages
- [ ] Feed performance: pagination working correctly, no N+1 queries
- [ ] Tap list quick 86: swipe-to-reveal "86 this beer" action on mobile tap list (Drew's ask)
- [ ] Offline detection: `useOnlineStatus` hook + banner when connection lost
- [ ] Service worker: verify push notification delivery and offline shell work correctly
- [ ] `revalidate` headers audit: all public GET routes returning correct cache headers

**Exit criteria:** Drew signs off on tap list. Dashboard skeleton to content <1s.

---

### Sprint 111 — The Shield
**Theme:** Error boundaries everywhere. Retry logic everywhere. Nothing dies silently.

**Deliverables:**
- [ ] `ErrorBoundary` component wrapping every page and major section
- [ ] Meaningful fallback UI for every boundary (not blank screens, not "Something went wrong")
- [ ] Retry logic on session mutations (create/end) — exponential backoff with user feedback
- [ ] Integration tests: full user flows end-to-end (sign up → first session → earn XP → level up → achievement)
- [ ] Integration tests: brewery admin flows (claim → onboarding → tap list edit → loyalty setup)
- [ ] Rate limit friendly UX: `429` responses show human message with countdown
- [ ] `try/catch` audit: every async operation has proper error recovery

**Exit criteria:** No blank error states anywhere. Integration tests passing. Casey signs off.

---

## Phase 5: Polish & Proof (112-113)

### Sprint 112 — The Shine
**Theme:** Screenshot-ready. Demo-ready. Investor-ready.

**Deliverables:**
- [ ] Brand consistency audit: every page checked — gold, dark bg, Playfair for beer names, DM Sans for body
- [ ] OG image refresh: higher-impact, more branded — brewery images use real data, better layout
- [ ] Demo mode: seed data audit — every demo flow uses polished, realistic brewery/beer/user data
- [ ] Onboarding wizard polish: sub-200ms step transitions, satisfying progress indicator
- [ ] `/for-breweries` pricing page: feature comparison table, social proof, FAQ, fast load
- [ ] App Store screenshots: every key screen export-ready (home, brewery, session, profile, admin)
- [ ] Email templates: visual refresh to match current brand — current templates haven't been updated since Sprint 75

**Exit criteria:** Taylor + Jamie sign off. Every screen looks like a product screenshot.

---

### Sprint 113 — The Proof
**Theme:** Document everything. Lock in the quality gates. Then party.

**Deliverables:**
- [ ] Full regression test run — zero failures
- [ ] Test coverage report: 700+ tests documented
- [ ] Accessibility audit re-run: all Sprint 109 findings verified resolved
- [ ] Security header verification via securityheaders.com
- [ ] Performance benchmarks documented (Core Web Vitals targets)
- [ ] CLAUDE.md updated with all architectural changes from the arc
- [ ] `docs/sprint-history.md` updated (Sprints 104-113)
- [ ] Roadmap updated: Multi-Location arc starts Sprint 114
- [ ] Git commit tagged: `v1.0.0-overhaul-complete`
- [ ] 🎉 Party

**Exit criteria:** Every exit gate from every sprint verified. Arc closed. Multi-Location unlocked.

---

## Arc-Level Exit Criteria

| Gate | Target | Current |
|------|--------|---------|
| Tests | 700+ total | ~318 |
| Component max size | 400 lines | 964 lines |
| `as any` count | <100 | 449 |
| WCAG AA | All critical paths | Partial |
| Security headers | Full suite | Partial |
| API response consistency | 100% | Inconsistent |
| Performance | Dashboard <1s | Unknown |
| Rate limiting | 100% write endpoints | ~19/30+ endpoints |
| CI enforcement | Hard-fail all gates | E2E soft-fail |
| P0 bugs | Zero | Zero ✅ |
| Lint errors | Zero | Zero ✅ |

---

## What's Off Limits (October features)

Per Joshua's direction — these are NOT in scope for The Overhaul:
- Multi-Location (starts Sprint 114)
- Advanced POS Phase 2 (keg tracking)
- Enterprise SSO / audit logs
- Any net-new consumer feature not already in the backlog

Everything else is fair game.

---

*This is a living document. Morgan owns it.*
