# Sprint 38 — Tighten the Ship

**Theme:** Fix what the audits found. Every bug we ship is a bug we pitch.
**Status:** Complete
**Date:** 2026-03-30
**Sprint Lead:** Morgan

---

## Context

Before we build HopRoute we need the foundation to be airtight. Jordan and Sam ran a full audit of Sprints 34–37 and found real issues: non-atomic XP writes, N+1 loops, privacy gaps in group sessions, and rate limiting holes on expensive GET endpoints. This sprint fixes all of them before the product gets in front of paying customers.

Drew says: "A bad demo is worse than no demo." This sprint makes the demo bulletproof.

---

## Audit Findings Being Addressed

### CRITICAL

**S38-001 — Fix referral XP race condition** (Jordan + Avery)
`/api/referrals` POST reads XP then adds 250 — classic read/modify/write race. Must use `increment_xp` RPC.

**S38-002 — Batch mention notifications (N+1 fix)** (Jordan + Avery)
`/api/sessions/[id]/comments` loops `await` inside `for...of` for mention notifications. Batch-insert all mention notifications in one query, fire push notifications in parallel with `Promise.all`.

**S38-003 — Validate friendship before group invite** (Avery)
`/api/sessions/[id]/participants` POST lets session owners invite anyone — including strangers. Must verify accepted friendship before allowing invite.

**S38-004 — Check session active before status PATCH** (Avery)
`/api/sessions/[id]/participants/status` allows accepting invites to ended sessions. Add `is_active` check before allowing status update.

---

### HIGH

**S38-005 — Rate limit heavy GET endpoints** (Riley)
`/api/feed`, `/api/pint-rewind`, `/api/brewery/[id]/digest`, `/api/users/search` have no rate limiting. Users search fires on every keystroke — no debounce on the server side.

Limits:
- `/api/feed` — 30/min per IP
- `/api/pint-rewind` — 10/min per IP
- `/api/users/search` — 60/min per IP (high, but debounced client-side)
- `/api/brewery/[id]/digest` — 10/min per IP

**S38-006 — First_referral notification action link** (Avery)
The `first_referral` notification has no CTA. Add a "View Invite Stats" link that navigates to Settings → Invite Friends section.

---

### P1 UX

**S38-007 — Leaderboard page** (Avery)
Top 20 users by XP this month + all-time. Social proof, drives competition, supports sales demo.

Route: `/app/(app)/leaderboard/page.tsx`
API: `/api/leaderboard` — GET, `?period=monthly|alltime`
Nav: Add "Leaderboard" to Explore page (or tab within it)

**S38-008 — Report page empty state** (Avery)
If `visits90 === 0`, show a friendly "No visitor data yet" card instead of a grid of zeroes.

---

### P2 Polish

**S38-009 — Session rate limit bump** (Riley)
10/hr is too aggressive for power users. Raise to 20/hr.

**S38-010 — Participant cleanup on session end** (Avery)
When a session ends, delete all `session_participants` with `status = 'pending'`. Accepted participants are kept for history.

---

## Key Architectural Changes
- `increment_xp` RPC used in referrals (matches session-end pattern)
- Mention notifications: batch `INSERT INTO notifications` + `Promise.all` for push
- `/api/sessions/[id]/participants` POST validates friendship via `friendships` table
- `/api/sessions/[id]/participants/status` checks `is_active` before update
- Rate limiting applied to 4 heavy GET endpoints
- `/leaderboard` route + API endpoint added
- Session end: deletes pending participants on close

---

## Team Notes
- **Jordan:** "The `as any` situation is a tech debt bomb. We're not fixing all 178 this sprint but we need a plan. I'm proposing we type the 5 most critical API routes in Sprint 39 as part of the HopRoute infrastructure work."
- **Sam:** "The group invite friendship check is not optional. We've seen what happens when social platforms let strangers send you things."
- **Riley:** "Rate limits on GETs should have been in S36. On me."
- **Casey:** "I'm adding the group invite flow to the Playwright spec this sprint."
- **Taylor:** "Leaderboard is pure engagement fuel. That goes in the demo."
