# Sprint 94 — The Club 🍻
**PM:** Morgan | **Arc:** The Flywheel (Sprint 4 of 6)
**Date:** 2026-04-01
**Planned by:** Morgan + Sage

> Digital Mug Clubs (F-020) — give brewery owners a tool that replaces paper sign-up sheets and spreadsheets with a real digital membership program. Plus unit test coverage for recently extracted libs, and backlog polish.

---

## Context

Sprint 93 closed the full QA audit (30/30 items), shipped the ad engine foundation (F-028), and rate-limited all mutation endpoints. The codebase is the cleanest it's ever been. Zero P0 bugs. 149 tests passing. Build clean.

Now we build the next revenue lever: **Mug Clubs**. Every brewery owner knows what a mug club is — annual memberships with perks. Most manage them on paper or spreadsheets. We're going to make it digital, trackable, and valuable.

**Tier gating:** Mug Clubs are a **Cask/Barrel** feature. Tap tier sees the section with an upgrade CTA. Free tier doesn't see it. *(We now have test data at every tier — migration 062.)*

---

## Sprint 94 Goals

### Goal 1: Digital Mug Clubs — Schema & API (F-020)
**Owner:** Avery 💻 | **Reviewer:** Jordan 🏛️ | **Infra:** Quinn ⚙️

**Migration 063: `mug_clubs` + `mug_club_members`**

```
mug_clubs:
  id              uuid PK default gen_random_uuid()
  brewery_id      uuid FK → breweries NOT NULL
  name            text NOT NULL (e.g. "Barrel Society", "Mug Club 2026")
  description     text
  annual_fee      numeric(10,2) NOT NULL
  max_members     int (NULL = unlimited)
  perks           jsonb NOT NULL DEFAULT '[]'
  is_active       boolean NOT NULL DEFAULT true
  created_at      timestamptz DEFAULT now()
  updated_at      timestamptz DEFAULT now()

mug_club_members:
  id              uuid PK default gen_random_uuid()
  mug_club_id     uuid FK → mug_clubs NOT NULL
  user_id         uuid FK → profiles NOT NULL
  status          text NOT NULL DEFAULT 'active' CHECK (status IN ('active','expired','cancelled'))
  joined_at       timestamptz DEFAULT now()
  expires_at      timestamptz
  notes           text

  UNIQUE(mug_club_id, user_id)
```

RLS: brewery admins can CRUD their own clubs + members. Consumers can read clubs for breweries they visit. Superadmin full access.

**API Endpoints (6):**
| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/brewery/[id]/mug-clubs` | List brewery's clubs (public read) |
| POST | `/api/brewery/[id]/mug-clubs` | Create club (admin, Cask/Barrel) |
| PATCH | `/api/brewery/[id]/mug-clubs/[clubId]` | Update club (admin) |
| DELETE | `/api/brewery/[id]/mug-clubs/[clubId]` | Delete club (admin, inline confirm) |
| GET | `/api/brewery/[id]/mug-clubs/[clubId]/members` | List members (admin) |
| POST | `/api/brewery/[id]/mug-clubs/[clubId]/members` | Add member (admin) |

All mutation endpoints rate-limited using `rateLimitResponse()` pattern.

---

### Goal 2: Mug Club — Brewery Admin UI
**Owner:** Avery 💻 | **Design:** Alex 🎨

**New page:** `app/(brewery-admin)/brewery-admin/[brewery_id]/mug-clubs/`

- `MugClubsClient.tsx` — main client component
- Club list view: cards showing name, member count, annual fee, active/inactive badge
- Create/edit club: inline form (AnimatePresence slide-down, not a modal)
  - Name, description, annual fee, max members (optional), perks builder
  - Perks builder: add/remove perks as text items (stored as jsonb array of strings)
- Member management: expandable member list per club
  - Add member: search existing HopTrack users by username/name
  - Member row: avatar, name, status badge, joined date, expires date, remove button
  - Inline delete confirmation (AnimatePresence, Cancel + Confirm)
- Empty state: friendly message + "Create Your First Mug Club" CTA
- Tier gate: Tap tier → show section with upgrade banner. Free → hidden.

**Nav update:** Add "Mug Clubs" to `BreweryAdminNav.tsx` (between Loyalty and Promotions)

---

### Goal 3: Mug Club — Consumer-Facing
**Owner:** Avery 💻 | **Design:** Alex 🎨

**On brewery detail page** (`app/(app)/brewery/[id]/`):
- New "Mug Club" section (below Loyalty, above Events)
- Shows active clubs: name, description, annual fee, perks list, member count
- "Join Club" button → for now, shows toast "Contact the brewery to join" (payment integration deferred to Stripe phase)
- Members see their status: "You're a member — expires Dec 2026" badge
- Empty state if brewery has no active clubs: section hidden entirely

---

### Goal 4: Unit Test Coverage
**Owner:** Reese 🧪 | **Reviewer:** Casey 🔍

Action item from Sprint 93 retro:

1. **`lib/pint-rewind.ts`** — test aggregation logic (top styles, top breweries, streak calculation, edge cases with empty data)
2. **`lib/wrapped.ts`** — test `fetchWrappedStats()` data shaping, null handling
3. **`lib/roi.ts`** — test `calculateROI()` edge cases (no loyalty program, no data, free tier, paid tiers)
4. **Mug club API** — basic CRUD tests for the new endpoints

Target: 149 → ~170+ tests

---

### Goal 5: Backlog Polish
**Owner:** Avery 💻

1. **BL-005: Menu upload PGRST204 fix** — schema cache issue with `menu_image_url`. Try `NOTIFY pgrst, 'reload schema';` via migration, or add column re-declaration if needed.
2. **BL-004: Lint cleanup** — knock out the 74 pre-existing lint errors. CI should be green without noise.

---

## What We're NOT Doing This Sprint

- **Payment collection for mug clubs** — membership fee is tracked but payment is handled outside HopTrack for now (Stripe phase later). We're building the management tool first.
- **F-029 Promotion Hub** — pushed to Sprint 95. Ad engine + sponsored challenges work independently for now.
- **F-017 Multi-location** — Sprint 95-96.
- **F-014 Keg tracking** — Sprint 95-96.

---

## Team Assignments

| Person | Responsibility |
|--------|---------------|
| **Morgan** 🗂️ | Sprint coordination, spec review, retro |
| **Sage** 📋 | Plan prep, ticket specs, retro notes |
| **Jordan** 🏛️ | Architecture review (schema, API shape, RLS) |
| **Avery** 💻 | Goals 1-3, Goal 5 (build everything) |
| **Quinn** ⚙️ | Migration 063, RLS policies |
| **Alex** 🎨 | UI/UX review (admin + consumer mug club) |
| **Casey** 🔍 | QA sign-off, regression |
| **Reese** 🧪 | Goal 4 (unit tests) |
| **Sam** 📊 | Acceptance criteria validation |
| **Drew** 🍻 | Mug club UX validation (real brewery perspective) |
| **Taylor** 💰 | Revenue model validation (Cask/Barrel gating) |
| **Jamie** 🎨 | Brand consistency check |
| **Riley** ⚙️ | Migration review, infra oversight |

---

## Test Plan

- [ ] Migration 063 applies cleanly
- [ ] Mug club CRUD works end-to-end (create, edit, delete with inline confirm)
- [ ] Tier gating: Cask/Barrel can create clubs, Tap sees upgrade CTA, Free hidden
- [ ] Member management: add by username search, remove with confirmation
- [ ] Consumer brewery page shows active mug clubs
- [ ] Consumer sees "member" badge if they belong to a club
- [ ] "Join Club" shows appropriate toast (contact brewery)
- [ ] All new endpoints rate-limited
- [ ] RLS: admin can only manage own brewery's clubs
- [ ] Pint Rewind + Wrapped + ROI unit tests pass
- [ ] BL-005 menu upload save works
- [ ] Lint errors reduced to 0
- [ ] Existing 149 tests still pass
- [ ] `npm run build` clean

---

## Success Criteria

1. A Barrel-tier brewery owner can create a mug club, add members, and manage perks
2. A consumer visiting a brewery page can see available mug clubs and their perks
3. Test count reaches 170+
4. Zero lint errors in CI
5. BL-005 resolved

---

*This is a living document.* 🍺
