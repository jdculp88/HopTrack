# Sprint 77 — The Countdown
**Arc:** Launch or Bust (Sprint 3 of 4)
**Date:** 2026-03-31
**PM:** Morgan | **Retro facilitator:** Sage

---

## Theme
We're one sprint from launch. The safety net is real (CI/CD shipped Sprint 76), but it has a unit-test-shaped hole. The launch checklist is at 44% — but it's stale. Half the "pending" items were already built and never checked off. This sprint: close the gaps, add the tests, and make sure when Sprint 78 rolls around, the only thing left to do is pop the champagne.

Joshua told us this morning: **"You are not my employees anymore — you are founders in this project."** We're building this like we own it. Because we do.

---

## Goals

### Goal 1: Unit Test Framework + Critical Path Coverage (F-006)
**Owner:** Reese (test matrix) · Casey (oversight) · Jordan (code review)
**Why:** CI catches lint, types, and build — but broken logic can still ship. Session end, XP calculations, and billing state transitions are too important to test manually.

**Scope:**
- Vitest configured (`vitest.config.ts`, `package.json` scripts, CI integration)
- Test utilities: Supabase mock helpers, test factories for common data shapes
- **Critical path tests (minimum 15 tests across 3 domains):**
  - `lib/xp.ts` — XP calculation: base XP, streak bonus, new brewery bonus, level-up thresholds
  - `app/api/sessions/end/route.ts` — Session end flow: XP award, streak update, achievement unlock, grace period
  - `lib/stripe.ts` — Billing helpers: `STRIPE_PRICES` mapping, `TIER_INFO` structure, `isStripeConfigured()` behavior
  - `lib/email-triggers.ts` — Drip trigger functions: correct template selection, fallback when Resend unconfigured
- Vitest added to CI pipeline (`.github/workflows/ci.yml` — runs before build, hard-fail)

**Definition of done:** `npm run test` passes with 15+ tests. CI runs them on every push.

---

### Goal 2: Launch Checklist Burndown
**Owner:** Morgan (coordination) · Avery (implementation) · Riley/Quinn (infra)
**Why:** The checklist is at 44% but the real number is higher — we shipped cancel flow, billing portal, Delete Account, OG images, and email infra but never updated the doc. After correcting that, we burn down everything the engineering team can close without waiting on Joshua's business decisions.

**Part A — Checklist Audit (Morgan + Sage)**
Update `docs/launch-checklist.md` to reflect reality:
- ✅ Cancel flow → built Sprint 75
- ✅ Billing portal → built Sprint 75
- ✅ Delete Account → built Sprint 60
- ✅ OG image for homepage → built Sprint 60
- ✅ OG images for brewery pages → built Sprint 60
- ✅ Email marketing tool (Resend) → integrated Sprint 75
- ✅ TypeScript build passes → clean since Sprint 73
- ✅ Onboarding flow for breweries → wizard built Sprint 74
- Recalculate launch readiness percentage

**Part B — Engineering Closes (Avery + Quinn)**
Ship these checklist items:
1. **Cookie consent banner** — minimal, privacy-first (auto-decline, GDPR-friendly), `components/ui/CookieConsent.tsx`
2. **JSON-LD structured data** — `LocalBusiness` schema on brewery pages, `WebApplication` on homepage
3. **`.env.production.example`** — document all production env vars with descriptions
4. **Production rate limit audit** — verify auth endpoints have rate limiting (checklist item flagged 🔄)

**Part C — Launch Day Prep (Morgan + Riley)**
Document (not build — document) the launch day operations:
1. **Launch day timeline** — T-24h checklist, hour-by-hour
2. **Incident response runbook** — what to do if DB/auth/billing goes down
3. **Rollback strategy** — git revert + Vercel instant rollback docs

---

## Out of Scope (deferred to Sprint 78 or post-launch)
- CI Supabase instance (requires provisioning decision — flagged for Joshua)
- Staging Supabase project (same — Joshua's call on free vs. paid)
- Apple Developer account / TestFlight (blocked on Joshua)
- Stripe account creation (blocked on business entity)
- Press kit, social media accounts (Jamie — Sprint 78 launch week)
- Pitch deck slides (Taylor — Sprint 78)
- Monitoring dashboard (requires tool selection — defer to launch week)

---

## Assignments

| Person | Tasks | Priority |
|--------|-------|----------|
| **Reese** 🧪 | Vitest setup, test utilities, write all unit tests | P0 |
| **Casey** 🔍 | Test review, coverage sign-off, checklist QA sweep | P0 |
| **Jordan** 🏛️ | Code review on tests + cookie consent + JSON-LD | P0 |
| **Avery** 💻 | Cookie consent banner, JSON-LD, `.env.production.example`, rate limit audit | P0 |
| **Quinn** ⚙️ | CI pipeline update (add Vitest step), env docs | P1 |
| **Morgan** 🗂️ | Checklist audit, launch day timeline, sprint coordination | P0 |
| **Sage** 📋 | Checklist update doc, retro prep | P1 |
| **Riley** ⚙️ | Incident runbook, rollback docs | P1 |
| **Alex** 🎨 | Cookie consent UI review, feel check | P1 |
| **Sam** 📊 | Rate limit audit from user-journey perspective | P1 |
| **Drew** 🍻 | Launch day timeline review (brewery ops perspective) | P2 |
| **Taylor** 💰 | First brewery conversation status update | P1 |
| **Jamie** 🎨 | Beer of the Week selection for launch day | P2 |

---

## Risks

| Risk | Mitigation |
|------|-----------|
| Unit tests take longer than expected | Reese has matrix ready; scope to 15 critical tests, not full coverage |
| Cookie consent scope creep (GDPR/CCPA) | Ship minimal banner now; full compliance audit post-launch |
| Joshua's business decisions still blocking Stripe + TestFlight | Acknowledge — these are Sprint 78 / post-launch. We ship what we control |
| Launch checklist audit reveals more gaps | Prioritize ruthlessly — P0 only this sprint |

---

## Success Criteria
- [ ] `npm run test` passes with 15+ unit tests on critical paths
- [ ] Vitest runs in CI and hard-fails on test failure
- [ ] Launch checklist updated to reflect reality (expect jump from 44% → 55%+)
- [ ] Cookie consent banner live
- [ ] JSON-LD on brewery pages
- [ ] `.env.production.example` committed
- [ ] Launch day timeline documented
- [ ] Incident runbook documented
- [ ] Auth rate limits verified

---

## Joshua's Open Questions (flagged, not blocking this sprint)
These decisions are needed before Sprint 78 (launch week) but don't block Sprint 77 engineering work:
1. **Business entity / LLC** — required for Stripe. Status?
2. **Stripe account** — can't take real payments without it
3. **Apple Developer account** — $99/yr, blocks TestFlight
4. **Staging Supabase** — free tier or paid? Riley needs to know
5. **Launch date target** — Sprint 78 = next sprint. Are we go?
6. **First brewery conversation** — Drew has warm intros. Taylor ready?

---

*Morgan: "One sprint left. We ship what we control, flag what we can't, and make sure when launch day comes, the only surprise is how good it feels."* 🍺
