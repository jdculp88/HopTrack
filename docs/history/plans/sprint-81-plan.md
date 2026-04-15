# Sprint 81 — The Challenge
**PM:** Morgan | **Arch:** Jordan | **Dev:** Avery | **QA:** Casey + Reese
**Arc:** Stick Around (Sprints 79-84)
**Theme:** Brewery-created challenges that drive repeat visits and deepen engagement

> "This is the feature that turns one-time visitors into regulars." — Sam

---

## Goals

### Goal 1: Challenge System — Database + API (Riley + Quinn)
**Feature:** F-009 Collaborative Challenges | **REQ:** REQ-056

Migration 054: `challenges` and `challenge_participants` tables.

**`challenges` table:**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| brewery_id | uuid FK → breweries | ON DELETE CASCADE |
| name | text NOT NULL | e.g., "IPA Explorer" |
| description | text | e.g., "Try all 5 of our IPAs" |
| icon | text | Emoji (🍺, 🏆, 🔥, etc.) |
| challenge_type | text | `beer_count`, `style_variety`, `visit_streak`, `specific_beers` |
| target_value | integer | e.g., 5 beers, 3 visits |
| target_beer_ids | uuid[] | For `specific_beers` type — which beers to try |
| reward_description | text | e.g., "Free pint of your choice" |
| reward_xp | integer DEFAULT 100 | XP bonus on completion |
| reward_loyalty_stamps | integer DEFAULT 0 | Bonus loyalty stamps on completion |
| starts_at | timestamptz | NULL = always active |
| ends_at | timestamptz | NULL = no expiration |
| is_active | boolean DEFAULT true | |
| max_participants | integer | NULL = unlimited |
| created_at | timestamptz DEFAULT now() | |

**`challenge_participants` table:**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| challenge_id | uuid FK → challenges | ON DELETE CASCADE |
| user_id | uuid FK → profiles | ON DELETE CASCADE |
| current_progress | integer DEFAULT 0 | |
| completed_at | timestamptz | NULL = in progress |
| joined_at | timestamptz DEFAULT now() | |
| UNIQUE(challenge_id, user_id) | | One entry per user per challenge |

**RLS Policies:**
- SELECT challenges: anyone (public brewery content)
- INSERT/UPDATE/DELETE challenges: brewery admin (via brewery_accounts join)
- SELECT challenge_participants: own rows + brewery admin
- INSERT challenge_participants: authenticated users (join a challenge)
- UPDATE challenge_participants: service role only (progress updated server-side)

**Challenge Types (V1):**
1. `beer_count` — "Try N beers from our tap list" (any beers at this brewery)
2. `specific_beers` — "Try these specific beers" (uses target_beer_ids array)
3. `visit_streak` — "Visit N times" (N sessions at this brewery)
4. `style_variety` — "Try N different styles" (unique style count from sessions)

---

### Goal 2: Brewery Admin — Challenge Management (Avery + Jordan)

New page: `app/(brewery-admin)/brewery-admin/[brewery_id]/challenges/`

**Features:**
- Challenge list with active/expired/draft tabs
- Create challenge form:
  - Name, description, icon picker (emoji grid)
  - Challenge type selector (4 types with inline explanation)
  - Target value input (contextual: "How many beers?" / "How many visits?")
  - Beer picker for `specific_beers` type (searchable, multi-select from tap list)
  - Reward fields (description text + optional XP bonus + optional loyalty stamps)
  - Optional date range (starts_at / ends_at)
  - Optional participant cap
- Edit/delete with inline AnimatePresence confirmation (no `confirm()`)
- Per-challenge stats: participants, completion rate, average progress
- Participant list with progress bars

**API Routes:**
- `GET /api/brewery/[brewery_id]/challenges` — list all challenges
- `POST /api/brewery/[brewery_id]/challenges` — create challenge
- `PATCH /api/brewery/[brewery_id]/challenges` — update challenge (body includes challenge_id)
- `DELETE /api/brewery/[brewery_id]/challenges` — delete challenge (body includes challenge_id)
- `GET /api/brewery/[brewery_id]/challenges/participants` — participant stats

---

### Goal 3: Consumer App — Challenge Discovery + Progress (Avery + Alex)

**Brewery Detail Page (`app/(app)/brewery/[id]/`):**
- New "Challenges" section between beers and reviews
- Active challenge cards with:
  - Icon + name + description
  - Progress ring (circular SVG, gold fill)
  - "X/Y beers" or "X/Y visits" progress text
  - "Join Challenge" button (if not joined)
  - Reward preview badge
  - Participant count + friend avatars (if friends are participating)
  - Time remaining badge (if ends_at set)
- Completed challenges show gold checkmark + "Completed!" badge

**Challenge Detail Drawer (`components/challenges/ChallengeDetailDrawer.tsx`):**
- Full challenge info
- Progress checklist (which beers tried, which visits counted)
- Friends participating with their progress
- Reward details
- Share button

**Progress Tracking (automatic):**
- Session-end API (`/api/sessions/end`) — UPDATED to check active challenges
- On session end: query user's active challenges at this brewery
- Increment progress based on challenge_type:
  - `beer_count`: count distinct beers logged in this session
  - `specific_beers`: check if any logged beers match target_beer_ids
  - `visit_streak`: increment visit count
  - `style_variety`: count new unique styles from this session
- If progress >= target_value → mark completed, award XP + loyalty stamps
- Fire `AchievementCelebration` overlay on completion

**Consumer API Routes:**
- `POST /api/challenges/join` — join a challenge (body: challenge_id)
- `GET /api/challenges/my-challenges` — user's active + completed challenges

---

### Goal 4: Feed Integration (Avery + Alex)

**New Feed Card: `ChallengeFeedCard`**
- Shows when a friend completes a challenge OR hits a milestone (50%, 75%)
- Card design: `card-bg-achievement` background, challenge icon, brewery name, progress ring
- "🏆 [Friend] completed [Challenge Name] at [Brewery]!"
- "🔥 [Friend] is 75% through [Challenge Name] at [Brewery]!"
- EmojiPulse reactions enabled

**FeedItem union update:**
```typescript
| { type: "challenge_complete"; data: FriendChallengeEvent; sortDate: string }
```

**Feed query:** `fetchFriendChallengeEvents()` in `lib/queries/feed.ts`

---

### Goal 5: Tests + QA (Casey + Reese)

**Vitest unit tests:**
- Challenge progress calculation logic (all 4 types)
- XP + loyalty stamp award on completion
- Edge cases: challenge ended mid-progress, beer 86'd from target list, max participants reached

**Manual QA (Casey):**
- Full happy path: create → join → progress → complete → celebration
- Sad paths: expired challenge, full challenge, brewery with no beers
- Mobile: progress ring rendering, drawer gestures
- Challenge shows correctly on brewery detail + feed

---

## Architecture Notes (Jordan)

- Progress tracking hooks into session-end API (the hub — see feedback_session_end_api.md)
- Challenge progress is server-side only — no client-side manipulation
- `target_beer_ids` uses Postgres uuid[] array — efficient for `specific_beers` lookups
- RLS ensures users can't inflate their own progress
- XP award uses existing `awardXP()` pattern from session-end
- AchievementCelebration overlay reused for challenge completion (already built Sprint 47)
- No new achievement definitions needed in V1 — challenges ARE the gamification layer
- Future: F-015 (sponsored challenges in Discover feed) builds directly on this schema

## Design Notes (Alex)

- Progress ring: circular SVG with `stroke-dasharray` animation, gold (`var(--accent-gold)`) fill
- Challenge cards: `card-bg-achievement` background class (already exists)
- Icon picker: 16 curated emojis in a 4x4 grid (🍺 🏆 🔥 ⭐ 🎯 🍻 🌟 💪 🎉 🏅 👑 🍁 ❄️ ☀️ 🌙 🎃)
- Mobile-first: challenge cards stack vertically, progress ring scales down
- Join button: spring animation on tap, optimistic add to participant list
- Completion: confetti burst via existing `AchievementCelebration` component

## Drew's Validation

Real-world challenge ideas brewery owners would actually run:
- "IPA Explorer" — Try all 5 IPAs ($0 reward cost, drives sampling)
- "Weekend Warrior" — Visit 3 Saturdays in a row (drives repeat visits)
- "Style Safari" — Try 8 different styles (drives full menu exploration)
- "Seasonal Sprint" — Try all 4 seasonal releases before they're gone (urgency)
- "Bring a Friend" — Visit with 3 different friends (viral growth)

These map cleanly to our 4 challenge types. Drew says: "This is what a brewery owner would set up in 2 minutes on a slow Tuesday."

## Sprint Velocity

| Task | Owner | Effort |
|------|-------|--------|
| Migration 054 + RLS | Quinn | S |
| Challenges CRUD API (5 routes) | Avery | M |
| Brewery admin challenges page | Avery | L |
| Consumer brewery detail integration | Avery | M |
| ChallengeDetailDrawer | Avery | M |
| Session-end progress tracking | Avery + Jordan | M |
| ChallengeFeedCard + feed query | Avery | S |
| Consumer join/my-challenges API | Avery | S |
| Progress ring SVG component | Alex direction, Avery builds | S |
| Vitest: challenge logic tests | Reese | S |
| Manual QA pass | Casey | M |
| Sprint plan + retro | Sage | S |

**Total: 1 sprint (aggressive but scoped)**

---

## What This Enables

- Brewery owners have a powerful new engagement tool in their dashboard
- Users have a reason to come back (progress, rewards, social proof)
- Feed gets a new high-engagement card type
- Foundation for F-015 (sponsored challenges) in a future sprint
- Loyalty integration deepens (stamps as rewards)
- Drew can demo this to real brewery owners immediately

---

## Out of Scope (Future Sprints)

- F-015: Sponsored challenges in Discover feed (Sprint 83-84?)
- Collaborative/team challenges (friends working together toward a shared goal)
- Challenge templates (pre-built challenges brewery owners can one-click deploy)
- Challenge analytics dashboard (detailed funnel: viewed → joined → completed)
- Push notifications for challenge milestones ("You're 1 beer away!")
- "Bring a Friend" challenge type (requires group session detection)

---

---

## Sprint 81 — Completion Summary ✅ (2026-03-31)

All 13 deliverables shipped. 29/29 tests passing. Migration 054 live in production.

**What shipped vs. what the plan said:**
- Progress ring (circular SVG): delivered as an animated linear progress bar instead — same info, simpler implementation, Alex approved the feel
- ChallengeDetailDrawer: built as a bottom-sheet slide-up (AnimatePresence spring) with full join CTA, goal, and reward — clean
- Milestone cards (50%/75% friend progress): deferred to future sprint — completions only in V1

**Jordan's note:** "Progress tracking pattern is sound. Session-end is correctly the hub. Schema is clean and future-proof for F-015."

**Drew's verdict:** "If I had this at my brewery right now, I'd set up three challenges before close tonight."

**Taylor's take:** "This is a Cask-tier feature. This is why you pay $149."

*This is a living document.* 🍺
