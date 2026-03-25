# Sprint 10 Planning Meeting
**Date:** 2026-03-25
**Attendees:** Full team — Morgan, Sam, Alex, Jordan, Riley, Casey, Taylor, Drew, Jamie
**Facilitator:** Morgan
**Scribe:** Sam

---

## Sprint 9 Close-Out

Morgan: All three open PRs are confirmed merged to main. Sprint 9 is officially closed. Final shipped list:

| Item | Status |
|------|--------|
| S9-003: Loyalty QR code | ✅ |
| S9-004: iOS safe area | ✅ |
| S9-006: Pint Rewind share card | ✅ |
| S9-007: Reactions on check-ins | ✅ |
| S9-008: Timezone utils | ✅ |
| S9-009: Superadmin user list | ✅ |
| REQ-013: Check-in decoupled from beer | ✅ |

**Carry-forward from S9:**
- S9-001: Staging migrations (Riley — still needs to run `supabase-setup.mjs` against staging)
- S9-002: Photo uploads (blocked on S9-001)
- S9-005: Push notifications
- Date utils cleanup (`lib/dates.ts` applied across app)

---

## Sprint 10 Theme

**"Sessions & Tap Wall — The Core Product Overhaul"**

> Sprint goal: A user opens HopTrack, taps +, checks in to a brewery in under 3 seconds, sees the full tap list, logs beers as they have them, and ends their session with a recap. The experience feels native, instant, and addictive.

This is our most important sprint since Sprint 1. We are rebuilding the bread-and-butter consumer flow from the ground up.

---

## The REQ-025 Briefing

Morgan walked the team through REQ-025 (Sessions & Tap Wall) in full. Key decisions made in this meeting:

### Decision 1 — DB strategy
**Resolved:** New `sessions` and `beer_logs` tables. Legacy `checkins` table preserved for backward compatibility. Backfill migration deferred to Sprint 11.

Riley: Migration file `006_sessions_beer_logs.sql`. I can have the tables ready by day 1. RLS policies drafted alongside.

### Decision 2 — Phase scoping
We agreed to phase the build:

**Phase 1 (Sprint 10):** New check-in entry → session start → Tap Wall → beer logging → quick rating → session tray → session end → recap. Full consumer experience.

**Phase 2 (Sprint 11):** Brewery dashboard and analytics updated to query `sessions`/`beer_logs`. Pint Rewind updated to use session data. `checkins` table deprecated.

### Decision 3 — Backward compat in feed
Jordan: The home feed will query both `sessions` (new) and `checkins` (legacy) and merge them into one stream sorted by date. Session cards will show "3 beers at Stone Brewing" style. Legacy check-in cards render as-is. No visual regression.

### Decision 4 — Auto-close timing
Drew raised the brewery festival case. **Resolution:** 6 hours default, but user can set this to 2h, 4h, 6h, or 8h in settings. Server-side Edge Function handles expiry.

### Decision 5 — Active Session Banner placement
Alex: The banner goes between the page content and the bottom nav — fixed position, always above the nav. Slim gold pill. Does not overlay page content (nav stays at same height, banner inserts above it).

---

## Sprint 10 Ticket Breakdown

### 🔴 P0 — Core Sessions & Tap Wall

| ID | Title | Owner | Est |
|----|-------|-------|-----|
| S10-001 | Migration 006: `sessions` + `beer_logs` tables + RLS | Riley | Day 1 |
| S10-002 | `POST /api/sessions` — start session | Jordan | Day 1 |
| S10-003 | `GET /api/sessions/active` — get active session | Jordan | Day 1 |
| S10-004 | `POST /api/sessions/[id]/beers` — log beer to session | Jordan | Day 2 |
| S10-005 | `PATCH /api/sessions/[id]/end` — end session, calc XP + achievements | Jordan | Day 3 |
| S10-006 | `PATCH /api/beer-logs/[id]` — update beer log (rating, note) | Jordan | Day 2 |
| S10-007 | `useSession` hook | Jordan | Day 2 |
| S10-008 | `CheckinEntryDrawer` — lean brewery selection, instant check-in | Jordan + Alex | Day 3 |
| S10-009 | `TapWallSheet` — tap list with log actions + session tray | Jordan + Alex | Day 4–5 |
| S10-010 | `ActiveSessionBanner` — persistent gold pill above bottom nav | Alex + Jordan | Day 4 |
| S10-011 | `QuickRatingSheet` — stars + optional note, slide-up | Alex + Jordan | Day 5 |
| S10-012 | `SessionRecapSheet` — celebration, XP, achievements, share | Alex + Jordan | Day 5 |
| S10-013 | Wire `AppNav` to show `ActiveSessionBanner` when session active | Jordan | Day 4 |

### 🟡 P1 — Feed + Profile Integration

| ID | Title | Owner | Est |
|----|-------|-------|-----|
| S10-014 | Update `HomeFeed` to render sessions alongside legacy check-ins | Jordan | Day 6 |
| S10-015 | `CheckinCard` updated — handle "3 beers at Brewery" session format | Alex + Jordan | Day 6 |
| S10-016 | `BreweryPage` — surface "Continue your session →" CTA when active session at this brewery | Jordan | Day 6 |
| S10-017 | XP remap — award XP on session end, per beer logged, per rating | Jordan | Day 5 |
| S10-018 | Achievement eval moved to session end | Jordan | Day 5 |

### 🟡 P1 — Carry-Forward from Sprint 9

| ID | Title | Owner | Est |
|----|-------|-------|-----|
| S10-019 | S9-001: Run staging migrations (supabase-setup.mjs against staging) | Riley | Day 1 |
| S10-020 | S9-002: Photo uploads — beer photos + brewery cover photos | Jordan | Day 6 (unblocked by S10-019) |
| S10-021 | Date utils cleanup — apply `lib/dates.ts` across app | Jordan | Day 2 |

### 🟢 P2 — Nice to Have

| ID | Title | Owner | Est |
|----|-------|-------|-----|
| S10-022 | Session auto-close Edge Function (6h inactivity, user-configurable) | Riley | If time allows |
| S10-023 | Push notifications MVP (S9-005 carry) | Riley + Jordan | If time allows |
| S10-024 | S9-005: Push notification groundwork (Edge Function setup) | Riley | If time allows |
| S10-025 | Domestic beer achievement ("How American Are You") — REQ-016 | Jordan | If time allows |

---

## Dependency Map

```
S10-001 (migration) ──┬──► S10-002 (POST sessions)
                      ├──► S10-003 (GET active)
                      ├──► S10-004 (POST beers)
                      ├──► S10-005 (end session)
                      └──► S10-006 (PATCH beer-log)

S10-002 + S10-003 ────► S10-007 (useSession hook)

S10-007 ──────────────┬──► S10-008 (CheckinEntryDrawer)
                      ├──► S10-009 (TapWallSheet)
                      ├──► S10-010 (ActiveSessionBanner)
                      ├──► S10-011 (QuickRatingSheet)
                      └──► S10-012 (SessionRecapSheet)

S10-008 + S10-009 ────► S10-013 (AppNav wiring)

S10-013 ──────────────► S10-014 (HomeFeed update)
S10-014 ──────────────► S10-015 (CheckinCard update)
S10-014 ──────────────► S10-016 (BreweryPage CTA)

S10-019 (staging) ────► S10-020 (photo uploads)
```

---

## Team Commitments

**Morgan:** Spec is locked (REQ-025). I'm available for clarifying questions daily. Will run mid-sprint check-in on day 4 to assess Phase 1 completion.

**Jordan:** I'll lead the API first (S10-001 through S10-007 by day 3), then UI implementation in sequence. Alex and I will pair on the Tap Wall — that's the piece that needs the most love.

**Alex:** TapWallSheet is my baby. I'll have Figma-quality mockups in the docs by tomorrow. The session tray, logged beer gold state, and ActiveSessionBanner all need polish specs. Jordan builds, I review, we ship it feeling right.

**Riley:** Migration 006 day 1. Staging setup day 1 (finally). Auto-close Edge Function is P2 but I'll have it drafted.

**Sam:** I'll write QA acceptance scenarios for the session state machine by day 2. The edge cases are real: app killed mid-session, duplicate taps, no brewery beers, network loss during beer log.

**Casey:** Full regression against the new flow AND the legacy check-in path. I am not signing off on this sprint until both paths are verified end-to-end. 👀

**Drew:** I want to test the Tap Wall personally before it ships. Jordan — give me a branch I can point at staging when Phase 1 is done.

**Taylor:** I've already added "average beers per session" to the pitch deck. We need that stat on the brewery dashboard. Phase 2 work, but I'm putting it in writing now.

**Jamie:** I'll update the App Store screenshots plan to include the Tap Wall once it's in staging. This is the screenshot that sells the download.

---

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Tap Wall feels slow on first load (beer fetch) | Medium | Add skeleton loader to TapWallSheet from day 1; same pattern as other pages |
| Session state gets out of sync with DB | Medium | `useSession` always reads from server on focus; optimistic updates with rollback |
| Legacy feed rendering breaks | Low | Jordan runs the existing feed tests against the new query before merging |
| Staging not ready in time for Drew's test | Medium | Riley: staging is day 1 priority, no excuses |
| Sprint scope too large | High | Phase 1 (P0) is the MVP. P1 carry-forward and P2 are explicitly cut if timeline slips |

---

## Definition of Done — Sprint 10

**Phase 1 done when:**
- [ ] User can check in to a brewery in < 3 seconds
- [ ] User can log a beer from the Tap Wall in < 2 seconds
- [ ] Quick rating works and saves to `beer_logs`
- [ ] Session Recap shows correct data and awards XP
- [ ] Active Session Banner persists correctly
- [ ] Legacy check-in feed renders with no regression
- [ ] Casey has signed off on the session state machine

**Sprint done when:**
- [ ] Phase 1 complete
- [ ] Staging migrations run (S10-019)
- [ ] `lib/dates.ts` applied across app (S10-021)
- [ ] All PRs merged to main

---

## Next Sprint Preview (Sprint 11)

- Brewery dashboard + analytics migrated to `sessions`/`beer_logs`
- `checkins` table deprecated
- Photo uploads full integration
- Session data in Pint Rewind
- Push notifications
- App Store prep continues

---

*Meeting notes — Sam, 2026-03-25*
*"We are going to be rich." — Taylor (again, every single meeting)*
