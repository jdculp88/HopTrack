# REQ-025 — Sessions & Tap Wall
**Status:** Spec — Ready for build
**Priority:** P0 — Core product
**Owner:** Morgan (PM), Alex (Design), Jordan (Dev), Riley (Infra), Sam (BA/QA)
**Sprint:** 10
**Created:** 2026-03-25
**Replaces / Supersedes:** REQ-011 (Check-In Modal Flow), REQ-013 (Check-in / Beer Review Separation)

---

## The Problem

The current 5-step check-in wizard conflates three separate user moments into one sequential form:
1. **"I'm here"** — arriving at a brewery
2. **"I'm drinking this"** — ordering and having a beer
3. **"Here's what I thought"** — reflecting on the experience

By forcing these into one upfront flow, we create friction at the most important moment: when a user is standing at the bar, pint in hand, wanting to quickly log their experience. A busy bar on a Friday night is not the place for a 5-step form.

Additionally, the current model assumes one brewery visit = one check-in = one beer. Real behavior is multi-beer, multi-hour, and non-linear.

---

## The Vision

**Checking in should take 3 seconds. Logging a beer should take 2. Rating is always optional and always async.**

The new model is built around a **session** — an open-ended brewery visit that the user can add to freely throughout their time there. Arriving, ordering beers, rating them, and sharing all happen as separate, lightweight moments instead of one front-loaded wizard.

The **Tap Wall** is the live, interactive view of what's on at that brewery during an active session — a scrollable tap list where each beer has a single "I'm having this" action.

---

## Mental Model Shift

| Old | New |
|-----|-----|
| Check-in = one event with all data upfront | Check-in = session start (lightweight) |
| Beer must be logged at check-in time | Beer is logged anytime during the session |
| Rating required as part of the flow | Rating is always optional, always async |
| One beer per check-in | Many beers per session |
| Modal closes after submit | Session stays open; you can always add more |
| Confetti at the form | Confetti at the end of the session |

---

## Process Flows

### Flow A — Arrive & Check In (new primary flow)

```
User taps ＋ FAB
    ↓
GPS detects nearby brewery
    ↓
  ┌──────────────────────────────────┐
  │  One-tap confirm                 │
  │  "You're at Stone Brewing →"     │
  └──────────────────────────────────┘
    ↓ (or: search for brewery manually)
Session starts — instant
    ↓
App transitions to Tap Wall for that brewery
    ↓
Active session indicator appears in bottom nav / home feed
```

**Time target: < 3 seconds from tap to checked in**

---

### Flow B — Log a Beer (Tap Wall)

```
User is in active session → navigates to Tap Wall
    ↓
Sees brewery's tap list — all active beers
Each beer card has: name, style, ABV, community rating, "I'm having this →"
    ↓
User taps "I'm having this →" on a beer
    ↓
Beer is instantly logged to session (optimistic update)
Card animates to "logged" state — gold border, checkmark
    ↓
Optional: quick rating prompt slides up (stars only)
    ↓
User dismisses or rates (both are fine)
    ↓
Session tray at bottom updates: "3 beers at Stone Brewing"
```

**Time target: < 2 seconds from tap to logged**

---

### Flow C — Rate a Beer (ambient, async)

```
Option 1 — From feed:
  Soft nudge card: "How was [Beer Name]? ★☆☆☆☆"
  User taps stars inline → saved → nudge dismissed

Option 2 — From Tap Wall:
  Tap a logged beer → QuickRatingSheet slides up
  Stars + optional short note → save → sheet closes

Option 3 — From beer detail page:
  "Rate this beer" section — always available
  Stars + optional note → saved
```

**Rating should always feel lightweight — never more than 2 taps to complete**

---

### Flow D — End Session

```
Trigger: user taps "End session" on session tray
  OR: auto-closes after 4 hours of inactivity
    ↓
Session Recap Sheet appears
  Shows: brewery name, time spent, beers logged, avg personal rating, XP earned
  Achievement unlocks rendered here (not at check-in)
  Confetti fires here
    ↓
CTA: "Share your session" → Pint Rewind share card
CTA: "Done" → closes, session archived
```

---

### Flow E — No Active Session (legacy path preserved)

Users who don't want to use the Tap Wall can still log a quick beer directly:
```
Tap ＋ → "Just log a beer" →
  Select brewery → select beer → optional rating → done
```
This creates a session + beer log in one action (same DB result, simplified UI path).

---

## User Interface Specifications

### 1. Check-In Entry (replaces Step 1 of old modal)

**Trigger:** Tapping ＋ FAB from anywhere in the app

**Behavior:**
- Full-screen drawer opens (same `FullScreenDrawer` shell)
- GPS starts immediately on open
- If 1 brewery detected within 0.5 miles: show prominent single-tap confirm card
  - Card shows: brewery name (large), distance, "Check in here →" button (full width, gold)
  - Secondary link: "Not here? Search" — expands to search input
- If 2+ breweries detected: show list of nearby options (current behavior)
- If no GPS / denied: show search input only
- On brewery confirm: session is created instantly, drawer transitions to Tap Wall (no intermediate step)
- **No beer selection at this stage. No rating at this stage.**

---

### 2. Tap Wall Sheet

**Trigger:** Auto-opens after check-in; or from Active Session Banner; or from brewery detail page during active session

**Layout:**
```
┌─────────────────────────────────────┐
│  ← Back    STONE BREWING           │
│            Active session • 1:23   │
├─────────────────────────────────────┤
│  [search beers]                     │
├─────────────────────────────────────┤
│  🍺 Arrogant Bastard Ale            │
│  American Strong Ale  7.2% ABV      │
│  ★ 4.3 community · 47 check-ins    │
│                 [I'm having this →] │
├─────────────────────────────────────┤
│  ✓ Hazy IPA (logged · ★★★★☆)      │  ← logged beers show gold state
│  Hazy IPA  6.8% ABV                 │
│  [Edit rating]                      │
├─────────────────────────────────────┤
│  ... more beers ...                 │
├─────────────────────────────────────┤
│  + I had something not listed       │
└─────────────────────────────────────┘
│  SESSION TRAY ▲                     │
│  2 beers · Stone Brewing · 1h 14m  │
│  [End session]                      │
└─────────────────────────────────────┘
```

**Tap Wall behavior:**
- Beers are fetched from `GET /api/beers?brewery_id={id}` (same as today)
- Logged beers (within this session) are shown with a gold "logged" state at the top of the list
- "I'm having this →" button: optimistic update → POST `/api/sessions/{id}/beers` → success state
- If beer list is empty: empty state + "Add a beer" CTA (same as today)
- Search filters the list client-side

---

### 3. Active Session Banner

**Location:** Persistent, appears above bottom nav while session is active
**Design:** Slim gold pill — `[🍺 Stone Brewing · 2 beers · tap to continue →]`
**Behavior:** Tapping opens Tap Wall for the active session
**Dismissal:** Only dismisses when session is explicitly ended or auto-expires

---

### 4. Quick Rating Sheet

**Trigger:** After tapping "I'm having this →"; or tapping a logged beer in the Tap Wall
**Design:** Bottom sheet, 40% screen height
```
┌────────────────────────────────────┐
│  How was Arrogant Bastard Ale?     │
│  ★ ★ ★ ★ ☆  (tap to rate)        │
│                                    │
│  [Optional: Add a note...]         │
│                                    │
│  [Save]         [Skip]             │
└────────────────────────────────────┘
```
- Stars are the only required interaction
- Note is optional (textarea, 1 row)
- "Skip" dismisses without saving a rating (beer log remains, just no rating)
- No flavor tags, no serving style at this stage — that detail can be added from beer detail page

---

### 5. Session Recap Sheet

**Trigger:** User taps "End session" or auto-close
**Design:** Full-screen, celebration aesthetic (consistent with current Step 5)
```
┌────────────────────────────────────┐
│         SESSION COMPLETE  🎉       │
│                                    │
│      🍺  Stone Brewing             │
│         1 hour 47 minutes          │
│                                    │
│    3 beers · Avg ★ 4.1             │
│                                    │
│  [Beer 1 name]  ★ ★ ★ ★ ★         │
│  [Beer 2 name]  ★ ★ ★ ☆ ☆         │
│  [Beer 3 name]  (no rating)        │
│                                    │
│  ✨ +350 XP earned                 │
│  🏆 Achievement unlocked!          │
│     "Hop Head" — 10 different IPAs │
│                                    │
│  [Share your session →]            │
│  [Done]                            │
└────────────────────────────────────┘
```
- Confetti fires on open
- Achievement unlocks shown here (moved from instant check-in)
- "Share your session" triggers Pint Rewind share card (REQ-005 integration)

---

## Database Schema Changes

### New table: `sessions`

```sql
CREATE TABLE sessions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  brewery_id    uuid NOT NULL REFERENCES breweries(id) ON DELETE CASCADE,
  started_at    timestamptz NOT NULL DEFAULT now(),
  ended_at      timestamptz,
  is_active     boolean NOT NULL DEFAULT true,
  share_to_feed boolean NOT NULL DEFAULT true,
  note          text,
  xp_awarded    integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- RLS: users can read/write their own sessions
-- Brewery admins can read sessions for their brewery (analytics)
```

### New table: `beer_logs`

```sql
CREATE TABLE beer_logs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  beer_id       uuid REFERENCES beers(id) ON DELETE SET NULL,
  brewery_id    uuid NOT NULL REFERENCES breweries(id),  -- denormalized for query perf
  rating        numeric(2,1),                             -- 0.5 increments, nullable
  flavor_tags   text[],
  serving_style text,
  comment       text,
  photo_url     text,
  logged_at     timestamptz NOT NULL DEFAULT now()
);

-- RLS: users can read/write their own beer logs
-- Brewery admins can read beer logs for their brewery
```

### Backward compatibility: `checkins` table

The existing `checkins` table is **not dropped** in Sprint 10. Existing data is preserved.
- New check-ins via the new flow write to `sessions` + `beer_logs`
- Old check-ins remain in `checkins` for display in feed and profile stats
- Migration plan (Sprint 11): backfill `sessions`/`beer_logs` from `checkins` data, then deprecate `checkins`

Migration file: `supabase/migrations/006_sessions_beer_logs.sql`

---

## API Changes

### New endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/sessions` | Start a new session (check-in). Returns session with `is_active: true` |
| GET | `/api/sessions/active` | Get current user's active session (if any) |
| PATCH | `/api/sessions/[id]/end` | End a session. Calculates XP, evaluates achievements |
| POST | `/api/sessions/[id]/beers` | Log a beer to the session |
| PATCH | `/api/beer-logs/[id]` | Update a beer log (add/edit rating, note, etc.) |

### Modified endpoints

- `GET /api/checkins` — continues to work, feeds legacy data to home feed
- Home feed query updated to merge `sessions` + legacy `checkins` for the feed

---

## New Components

| Component | Path | Description |
|-----------|------|-------------|
| `CheckinEntryDrawer` | `components/checkin/CheckinEntryDrawer.tsx` | Replaces CheckinModal step 1 — lean brewery selection only |
| `TapWallSheet` | `components/checkin/TapWallSheet.tsx` | Full tap list with log actions, session tray |
| `ActiveSessionBanner` | `components/checkin/ActiveSessionBanner.tsx` | Persistent slim banner above bottom nav |
| `QuickRatingSheet` | `components/checkin/QuickRatingSheet.tsx` | Minimal rating bottom sheet |
| `SessionRecapSheet` | `components/checkin/SessionRecapSheet.tsx` | End-of-session celebration + share |
| `BeerLogCard` | `components/checkin/BeerLogCard.tsx` | A logged beer within the Tap Wall (gold state) |

### Modified components

- `AppNav` — receives `activeSession` prop, renders `ActiveSessionBanner` when present
- `HomeFeed` — merges sessions and legacy checkins in activity stream
- `CheckinCard` — updated to render `beer_logs` count ("3 beers at Stone Brewing") not just single beer
- `BreweryPage` — detects active session and surfaces "Continue your session →" CTA

---

## Hooks

### `useSession` (new)

```ts
// hooks/useSession.ts
function useSession(): {
  activeSession: Session | null;
  startSession: (breweryId: string) => Promise<Session>;
  endSession: (sessionId: string) => Promise<SessionResult>;
  logBeer: (sessionId: string, beerId: string) => Promise<BeerLog>;
  updateBeerLog: (logId: string, updates: Partial<BeerLog>) => Promise<BeerLog>;
  loading: boolean;
}
```

---

## XP & Achievement Changes

### XP events (updated)

| Event | XP | Notes |
|-------|----|-------|
| Start a session (check-in) | 25 XP | Replaces current "check-in" XP |
| Log a beer | 15 XP per beer | New |
| Rate a beer | 10 XP per rating | New |
| First visit to a brewery | +50 XP bonus | Same as today |
| Session with 3+ beers | +25 XP bonus | New |

### Achievement evaluation
- Moved from immediate post-check-in to end-of-session
- Evaluated against full `beer_logs` set for the session
- New achievements to consider: "Session Sampler" (3+ beers in one session), "Regular" (5 sessions at the same brewery)

---

## Acceptance Criteria

### Check-in (Session Start)
| # | Criterion |
|---|-----------|
| 1 | GPS fires on drawer open; auto-confirm card shows if 1 brewery within 0.5 miles |
| 2 | Tapping confirm creates a session record and transitions to Tap Wall in < 1 second |
| 3 | No beer selection step before session start |
| 4 | Active Session Banner appears immediately after session start |
| 5 | Only one active session can exist at a time per user |
| 6 | If user already has an active session, tapping + offers "Return to [Brewery]" option |

### Tap Wall
| # | Criterion |
|---|-----------|
| 7 | Tap list loads from `/api/beers?brewery_id=` on Tap Wall open |
| 8 | "I'm having this →" button logs beer instantly (optimistic update) |
| 9 | Logged beers move to top of list with gold state and checkmark |
| 10 | Tapping a logged beer opens QuickRatingSheet |
| 11 | Session tray shows beer count and elapsed time, updates in real-time |
| 12 | "End session" on session tray opens Session Recap Sheet |
| 13 | Search filters the tap list client-side |
| 14 | Empty state renders when brewery has no beers |

### Quick Rating
| # | Criterion |
|---|-----------|
| 15 | QuickRatingSheet slides up after beer is logged |
| 16 | Tapping a star saves immediately (no separate submit button) |
| 17 | "Skip" closes without saving a rating; beer log is retained |
| 18 | Optional note can be added (max 280 chars) |

### Session Recap
| # | Criterion |
|---|-----------|
| 19 | Recap shows brewery name, duration, beers logged, avg personal rating |
| 20 | XP earned is calculated and displayed |
| 21 | Achievement unlocks are shown for this session |
| 22 | Confetti fires on recap open |
| 23 | "Share your session" opens Pint Rewind share card |
| 24 | Session is marked `is_active: false` when "Done" is tapped |

### Active Session Banner
| # | Criterion |
|---|-----------|
| 25 | Banner is visible above bottom nav while session is active |
| 26 | Banner shows brewery name and beer count |
| 27 | Tapping banner opens Tap Wall |
| 28 | Banner disappears when session ends |

### Data Integrity
| # | Criterion |
|---|-----------|
| 29 | `sessions.user_id` is always the authenticated user |
| 30 | `beer_logs.session_id` always references a valid, active session |
| 31 | Session auto-closes after 4 hours of inactivity (server-side) |
| 32 | XP is written to `profiles.xp` on session end, not session start |
| 33 | Legacy `checkins` data continues to render correctly in home feed and profile |
| 34 | `profiles.total_checkins` increments on session start (1 session = 1 check-in for stat purposes) |

---

## Open Questions

1. **Auto-close timing:** 4 hours of inactivity is a starting point. Drew's input: at a brewery festival that could be 6+ hours. Should this be a user preference or a global setting?

2. **Session recovery:** If a user opens the app after their phone died mid-session, we should restore the active session state. How do we handle the elapsed time gap?

3. **Multi-brewery sessions:** Should we allow a user to end one session and immediately start another (bar crawl scenario)? Probably yes — "End session & check in somewhere else" as a combined CTA.

4. **Feed rendering:** The home feed currently renders `checkins` records. After this change it needs to render `sessions` (with `beer_logs` as a sublist). The card design needs to handle "3 beers at Stone Brewing" cleanly. Alex to spec.

5. **Brewery dashboard impact:** The analytics page currently queries `checkins`. It needs to query `sessions` + `beer_logs` after this change. Riley to assess migration complexity.

6. **Offline behavior:** If a user logs a beer and loses network, the optimistic update will show but the save will fail silently. We should queue the log locally and retry. Future sprint consideration (S11).

---

## Notes

**Morgan (PM):** This is the biggest architectural change we've made since the original build. It touches the check-in model, the feed, analytics, XP, achievements, and the brewery dashboard. It needs to be phased — Sprint 10 builds the new consumer-side flow on top of the new DB tables. Sprint 11 migrates analytics and the brewery dashboard to query the new tables. Do not rush this.

**Sam (BA):** The backward-compat requirement is non-negotiable. We have seed data and real users (eventually) who have existing check-ins. The new tables must coexist cleanly with `checkins` until the migration is complete.

**Drew (Brewery Ops):** The Tap Wall is the feature I've wanted since day one. When a brewery owner updates their tap list at 4pm, that should show up in HopTrack for people who check in at 5pm. The data freshness matters as much as the interaction.

**Riley (Infra):** Two new tables, two new API endpoints, and one migration file. The auto-close logic should be a Supabase Edge Function on a cron trigger — not a client-side timer. I'll spec the function separately.

**Casey (QA):** The session state machine needs a full regression pass. States: no session → active session → ended session. Edge cases: app killed mid-session, network loss mid-log, duplicate taps on "I'm having this" button (must be idempotent).

**Alex (Design):** The Tap Wall is the hero moment. I want the logged beer state to feel like you've claimed something — a gold glow, a satisfying haptic (web vibration API), and a micro-animation on the checkmark. The session tray should feel like a persistent companion, not a footer. I'm on it.

**Taylor (Revenue):** This makes the brewery dashboard data richer — we can show "average beers per session" which is a metric brewery owners will pay to see. The Tap Wall also creates a new upsell: Cask tier gets "featured tap" placement at the top of the Tap Wall. That's a sales line.

**Jamie (Brand):** "Your session at Stone Brewing" — that's beautiful copy. The session concept gives us language. "Start a session." "Log your pour." "End your session." Chef's kiss. 🤌

---

*REQ-025 — Sessions & Tap Wall — Created 2026-03-25 by Morgan*
*All hands spec review complete. Ready for Sprint 10.*
