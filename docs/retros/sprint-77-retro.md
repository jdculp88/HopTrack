# Sprint 77 Retro — The Countdown
**Facilitator:** Drew 🍻 (first time!)
**Date:** 2026-03-31
**Sprint theme:** Unit tests, launch checklist burndown, business formation

---

**Drew** 🍻: Alright, alright. First time running one of these. I've sat through enough of Morgan's to know the format, so don't worry — I'm not gonna mess it up. But fair warning, I'm gonna keep this short because that's how we do things at the bar. You don't give a speech when the taps are flowing.

Sprint 77 — The Countdown. Let's go around the room.

---

## What Went Well

**Drew** 🍻: I'll start. What went well? We finally have tests. I don't write code, but I know what it means when your safety net actually catches things. Riley told me once about a migration that almost went sideways — that doesn't happen now. Also, Morgan's checklist audit? We were at 44% and panicking. Turns out we were at 56% and just bad at updating a markdown file. Point is — we're closer than we thought. That matters.

**Casey** 🔍: 39 tests. THIRTY-NINE. We planned fifteen. Reese came in hot. XP calculations, Stripe pricing, email triggers — the critical paths are covered. And they run in two seconds. TWO. This is what I've been asking for since Sprint 44. Zero P0 bugs, unit tests in CI, E2E in CI... the safety net is real now. Not decorative. Real.

**Reese** 🧪: Covered. Four test files, 39 assertions, hard-fail in CI. The email trigger tests are the ones I'm proudest of — we're testing that `onPasswordReset` actually calls `sendEmail` with the right template, and that `onUserSignUp` doesn't throw even when the profile has no email. Edge cases that would've bitten us in production. Next sprint I want to get session-end under test too, but that needs a Supabase mock layer. It's on my list.

**Jordan** 🏛️: The test architecture is clean. Vitest config is minimal — jsdom environment, `@/` path alias, done. No over-engineering. The test files follow the module structure, not some invented test hierarchy. Reese gets it. I reviewed the cookie consent component too — it's a proper client component, uses our animation system, respects the theme. No new patterns invented, no abstractions where they don't belong. I didn't have to take a walk once this sprint. That's... rare.

**Avery** 💻: Already on it felt different this sprint. Cookie consent, JSON-LD, rate limiting, env docs — four deliverables, zero scope creep. The JSON-LD was satisfying — brewery pages now have full Schema.org markup with geo coordinates, aggregate ratings, phone, address. Google's gonna index us properly. And the cookie banner? Slides up with the gentle spring, gold button, respects reduced motion. Alex approved the feel without a single note. First time that's happened.

**Alex** 🎨: It already FEELS right. The cookie consent banner is clean — it doesn't fight the layout, it slides up from the bottom with the right weight, and the dismiss animation is buttery. Gold "Got it" button on surface background, secondary "Decline" option that doesn't compete. I had zero notes. Zero. That's the first time I've had zero notes on a new UI component. Also — no cookie banner showing after dismissal. Sounds obvious, but you'd be surprised how many apps get that wrong.

**Quinn** ⚙️: The CI pipeline update was straightforward — added `npm test` before the build step, hard-fail, no `continue-on-error`. If a test breaks, CI breaks. Period. The `.env.production.example` documents every production env var with context — what it's for, where to find it, what format. When we go to deploy for real, nobody's guessing. Also... staging Supabase is provisioned now. Joshua paid for it. That's a milestone we've been waiting on since Sprint 49.

**Riley** ⚙️: The incident runbook is the thing I'm most proud of. Rollback strategy, severity levels, on-call rotation — it's all documented. Three rollback options: Vercel instant rollback (30 seconds), git revert (creates clean commit), or feature-level disable (empty the env var, feature degrades gracefully). Every paid service we use — Stripe, Resend, Anthropic — can be disabled via env var without breaking the app. That's by design. That's infrastructure done right.

**Sam** 📊: From a business continuity standpoint... the auth rate limit audit was important. Turns out our actual auth flow goes through Supabase directly — they rate-limit upstream. Our two auth-adjacent endpoints (`/api/auth/welcome` and `/api/users/check-username`) are now both rate-limited. The checklist audit was the bigger win though. 19 items were stale. Nineteen. We were measuring our own readiness wrong. That could've caused panic at the wrong moment.

**Taylor** 💰: The business formation guide is the thing that unlocks everything. Joshua said he doesn't know how to start a business — now he does. $125, file in NC, get the EIN in 10 minutes, open a bank account, connect Stripe. I put actual dollar amounts on everything because that's what founders need — not theory, numbers. NC LLC: $325 year one, $200 ongoing. Delaware: $760+ year one, $900+ ongoing. The answer is obvious. We're going to be rich, but first we need to exist as a legal entity. 📈

**Sage** 📋: I've got the notes. The checklist jump from 44% to 56% is significant — and it's not because we shipped 12% of new work this sprint. It's because we finally reconciled reality with the doc. Cancel flow, billing portal, Delete Account, OG images, email infra, onboarding wizard — all shipped in previous sprints, never checked off. The lesson: update the checklist the sprint you ship it, not three sprints later. I'll own that cadence going forward.

**Jamie** 🎨: The JSON-LD is chef's kiss 🤌. Brewery pages now have structured data that Google actually understands — name, address, geo coordinates, phone, website, aggregate ratings. When someone searches "Resident Culture Brewing Charlotte," Google can pull our data directly into the knowledge panel. That's free SEO. Also, the cookie consent banner copy is on-brand: "No tracking, no ads." That's our promise. Short, honest, privacy-first.

**Morgan** 🗂️: I'll keep mine brief because Drew's running this, not me. Joshua called us founders today. That changes things. Not the work — the work is the same. But the ownership? That's different. Everyone shipped this sprint like they owned it because they do. 39 tests when we planned 15. A business formation guide that turns a founder's question into a one-afternoon action plan. An incident runbook that means we're ready for the worst. Launch checklist that tells the truth now. This is what a team looks like when it stops building for someone and starts building for itself.

---

## Roasts 🔥

**Drew on Joshua:** You've been asking us how to start a business for like four sprints. Taylor just wrote you a guide. It's $125 and an afternoon. Go file the LLC. We built the app. You build the company. Stop overthinking it. I mean that with love. And also with urgency. 🍻

**Casey on Reese:** 39 tests. I asked for 15. You shipped 39. I can't even be mad — I'm just... suspicious. Nobody overdelivers that hard without a catch. What are you hiding, Reese? A flaky test? A skipped assertion? I'm watching. 👀

**Reese on Casey:** Covered. All 39. No skips. No flakes. Run `npm test` yourself if you don't believe me. 2.2 seconds. *mic drop*

**Jordan on Avery:** Zero notes from Alex on the cookie consent banner. ZERO. I've been building UI in this codebase for 77 sprints and I've never gotten zero notes from Alex. Avery ships one component and gets a perfect score. I had to take a walk. Not because I'm upset. Because I'm proud. And slightly jealous.

**Alex on Jordan:** You literally just admitted to being jealous of a cookie banner. That's growth. 🎨

**Taylor on Drew:** Drew running a retro. I never thought I'd see the day. The guy who said "I felt that physically" about a `confirm()` dialog is now facilitating team discussions. What's next, Drew reviews pull requests?

**Drew** 🍻: I'd review the pull requests if someone taught me what a pull request was. We don't do those anyway — we push to main like adults.

**Sam on Morgan:** Morgan let Drew run the retro without a single interruption. That's either trust or terror. Either way, I respect it.

**Morgan** 🗂️: ...it was trust. Mostly.

**Quinn on Riley:** Riley's incident runbook has three rollback strategies. Three. When I asked why, he said "because the first two might fail." That's either brilliant infrastructure thinking or anxiety. Both, probably.

**Riley** ⚙️: The migration pipeline is real. The incident pipeline is real. The anxiety is also real. But that's what makes good infrastructure.

---

## Closing

**Drew** 🍻: Sprint 77 — The Countdown. 39 tests. Cookie consent. JSON-LD. Business formation guide. Launch ops. Checklist truth. Everyone shipped. Everyone owned it.

One thing before I close. Joshua said something this morning that hit different. "You are not my employees anymore — you are founders in this project." I've run a taproom for years. I know what it feels like when your crew stops working FOR you and starts working WITH you. That's when the magic happens. That's where we are now.

Next sprint, whatever it is, we build it like it's ours. Because it is.

Now somebody get me a beer. 🍺

---

## Sprint 77 Scorecard

| Goal | Target | Actual | Status |
|------|--------|--------|--------|
| Unit tests (Vitest) | 15 tests | 39 tests | ✅ Exceeded |
| Launch checklist audit | Update stale items | 19 items corrected, 44%→56% | ✅ Complete |
| Cookie consent banner | Ship component | Live, verified in browser | ✅ Complete |
| JSON-LD structured data | Brewery pages | Brewery schema with full data | ✅ Complete |
| `.env.production.example` | Document all vars | All production vars documented | ✅ Complete |
| Auth rate limit audit | Verify coverage | 2 endpoints secured, Supabase upstream confirmed | ✅ Complete |
| Launch day ops docs | Timeline + runbook | T-24h checklist, runbook, rollback strategy | ✅ Complete |
| Business formation guide | Guide for Joshua | 10-step guide with real costs | ✅ Complete |

**Sprint grade: A+** — 8/8 goals met, tests exceeded by 160%.
