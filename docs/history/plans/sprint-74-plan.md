# Sprint 74: First Impressions
**PM:** Morgan | **Created:** 2026-03-31
**Theme:** Brewery onboarding wizard + push notification wiring
**Size:** Small (focused, 2 goals)

> "A brewery's first 10 minutes on HopTrack decide if they stay. Let's make those 10 minutes flawless." — Morgan

---

## Overview

The codebase is clean. Build is green. Docs are current. Now we build the two things that matter most before closing our first paying brewery:

1. **Onboarding Wizard** — After a brewery claims their account, walk them through setup so they hit the ground running. Taylor says this is the first thing a paying brewery touches. If it's confusing, we lose them.
2. **Push Notification Wiring** — The plumbing exists (`lib/push.ts`, `push_subscriptions` table, VAPID keys, `/api/push/subscribe`). The Messages page exists (`brewery-admin/[id]/messages`). What's missing: when a brewery owner sends a message, it should also fire Web Push to customers who have notifications enabled. Wire it up.

---

## Goal 1: Brewery Onboarding Wizard

**Context:** After claiming via `/brewery-admin/claim`, an owner lands on the dashboard with zero configuration. No logo, empty tap list, no loyalty program. They need a guided setup experience that makes them feel like a pro in under 5 minutes.

| # | Ticket | Owner | Priority |
|---|--------|-------|----------|
| 1 | Create `components/brewery-admin/OnboardingWizard.tsx` — 4-step wizard (Logo, Tap List, Loyalty, Preview). Stepper UI at top. AnimatePresence step transitions. Persists progress to localStorage so they can resume. | Avery (build) / Alex (design) | P0 |
| 2 | **Step 1 — Upload Logo:** Reuse existing logo upload from Settings. Drag-and-drop zone, preview, upload to `avatars` bucket. Skip button for later. | Avery | P0 |
| 3 | **Step 2 — Add Your First Beers:** Simplified tap list entry (name, style, ABV). "Add beer" inline form. Minimum 1 beer to proceed, or skip. Writes to `beers` table with `brewery_id`. | Avery | P0 |
| 4 | **Step 3 — Loyalty Basics:** Toggle loyalty on/off. Set stamp goal (e.g., "10 visits = free pint"). Simple — not the full loyalty config. Writes to `brewery_loyalty_programs`. | Avery | P1 |
| 5 | **Step 4 — Preview Your Board:** Read-only preview of The Board with whatever they just configured. "Looks great!" CTA to finish. Links to full Board page. | Avery / Alex | P1 |
| 6 | Show the wizard automatically on first login after claim approval. Detection: check if brewery has 0 beers + no logo. Dismissible — sets `onboarding_complete` flag in localStorage (and optionally in `breweries` table). | Avery | P0 |
| 7 | Jordan reviews component architecture — ensure wizard steps are extracted into individual components (`OnboardingStepLogo.tsx`, etc.), not one monolith. | Jordan (review) | P0 |

**Design Notes (Alex):**
- Dark theme, consistent with brewery admin. Gold accent for progress stepper.
- `rounded-2xl` cards per step. Spring transitions between steps.
- Mobile-first — brewery owners will do this on their phone at the bar.
- Never `motion.button`. Use `<button>` with inner `<motion.div>` for press states.

**Definition of Done:** A brewery owner who just got their claim approved sees a 4-step wizard. They can upload a logo, add beers, configure basic loyalty, and preview their Board. They can skip any step. The wizard doesn't show again after completion.

---

## Goal 2: Push Notification Wiring

**Context:** Infrastructure from Sprint 14:
- `lib/push.ts` — `sendPushToUser()` and `sendPushNotification()` (web-push library, VAPID configured)
- `/api/push/subscribe` — client subscription endpoint (POST/DELETE)
- `push_subscriptions` table — stores user endpoints + keys
- `public/sw.js` — service worker handles push events

The Messages page (`brewery-admin/[id]/messages`) already creates in-app `notifications` rows. It does NOT fire Web Push. That's the gap.

| # | Ticket | Owner | Priority |
|---|--------|-------|----------|
| 1 | Wire `sendPushToUser()` into `/api/brewery/[brewery_id]/messages` — after inserting notification rows, loop through target users and fire Web Push for each. Use the existing `sendPushToUser()` from `lib/push.ts`. | Avery | P0 |
| 2 | Add push payload formatting: `title` = subject, `body` = brewery name + message body, `tag` = `brewery-message-{brewery_id}` (so multiple messages from same brewery collapse), `data.url` = `/brewery/{brewery_id}`. | Avery | P0 |
| 3 | Add send progress/result feedback to `MessagesClient` — after sending, show toast with "Sent to X customers (Y push notifications delivered)". Return `push_count` from the API response. | Avery | P1 |
| 4 | Rate limit the messages endpoint — max 5 sends per brewery per hour. Prevent spam. Add `X-RateLimit-Remaining` header. | Avery / Riley | P1 |
| 5 | Handle expired subscriptions gracefully — `sendPushToUser` already cleans up 410/404 subs. Verify this works in the batch context (no thrown errors breaking the loop). | Avery | P1 |
| 6 | Casey + Reese verify: send a message from brewery admin, confirm in-app notification appears AND push notification fires on a subscribed device/browser. Test with 0 subscribers (no error). Test rate limit. | Casey / Reese | P0 |

**Definition of Done:** A brewery owner sends a message from the Messages page. Targeted customers receive both an in-app notification AND a Web Push notification (if subscribed). Rate limited. No silent failures.

---

## Owner Assignments

| Person | Role This Sprint |
|--------|-----------------|
| **Avery** | Builds both goals end-to-end |
| **Jordan** | Reviews wizard architecture, push integration patterns |
| **Alex** | Designs wizard steps, stepper UI, mobile layout |
| **Casey** | QA — acceptance testing, edge cases |
| **Reese** | QA — push notification device testing |
| **Riley** | Rate limit review, push infra validation |
| **Taylor** | Acceptance — does the onboarding feel like something you'd pay $49/mo for? |
| **Drew** | Acceptance — would this make sense at 6pm on a Friday? |
| **Morgan** | Coordination, sprint tracking |

---

## Success Criteria

| Criteria | Measurement |
|----------|-------------|
| New brewery owner completes onboarding in < 5 minutes | Taylor + Drew walkthrough |
| Wizard works on mobile (375px) | Alex + Casey verify |
| Push notifications fire on message send | Casey + Reese device test |
| Rate limit prevents spam (5/hr) | Casey test |
| No new `as any` introduced | Jordan review |
| No `motion.button` violations | Jordan review |
| Build passes clean (`npm run build`) | Avery verify before merge |

---

## NOT In Scope

- Full loyalty program configuration (that's its own sprint — wizard just does the basics)
- Email notifications (future — need email provider selected first)
- Push notification preferences/opt-out UI for consumers (already exists in Settings toggles)
- Brewery-to-individual-customer direct messaging (Messages is broadcast only for now)
- Stripe billing integration into the onboarding flow (billing is a separate concern)
- New migrations — both features work with existing tables

---

## Dependencies

- `lib/push.ts` — already built (Sprint 14), no changes needed
- `push_subscriptions` table — already exists
- `beers` table — already exists
- `brewery_loyalty_programs` table — already exists
- `avatars` storage bucket — already exists with RLS
- Messages API (`/api/brewery/[brewery_id]/messages`) — already built (Sprint 43), needs push wiring

---

## Sprint Cadence

- Push to `main` directly
- Retro at sprint end
- Small sprint — should close in 1-2 sessions
- If bugs surface during build, fix inline

---

*"The first 10 minutes. That's all we get. Let's make them count."* — Morgan
