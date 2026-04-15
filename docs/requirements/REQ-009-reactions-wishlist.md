# REQ-009 — Reactions & Wishlist
**Status:** Partially Built (DB schema complete; UI partially implemented)
**Priority:** Now
**Owner:** Sam (BA), Jordan (Dev), Alex (UI/UX)
**Sprint:** 2

## Summary
Two social engagement features that extend the core check-in feed. **Reactions** allow users to respond to a friend's check-in with one of three emoji reactions (👍 thumbs up, 🔥 flame, 🍺 beer mug) — similar to quick emoji reacts on messaging platforms. **Wishlist** allows users to bookmark beers they want to try, creating a personal "want to drink" list accessible from their profile. Both features have their database tables and RLS policies fully defined. UI work is partially complete.

---

## Feature 1: Reactions

### Behavior
- Any authenticated user can react to any publicly shared check-in.
- Three reaction types are supported: `thumbs_up` (👍), `flame` (🔥), and `beer` (🍺).
- A user can leave all three reaction types on a single check-in simultaneously (unique constraint is per user + check-in + type, not per user + check-in).
- Clicking the same reaction a second time removes it (toggle behavior).
- Reaction counts are displayed publicly on check-in cards in the feed.
- Reactions are read-publicly: any visitor can see reaction counts. Only the owner of the reaction can add/remove it (enforced by RLS).

### Database Schema
```sql
public.reactions (
  id         uuid PRIMARY KEY default uuid_generate_v4(),
  user_id    uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  checkin_id uuid REFERENCES public.checkins(id) ON DELETE CASCADE NOT NULL,
  type       text CHECK (type IN ('thumbs_up', 'flame', 'beer')) NOT NULL,
  created_at timestamptz default now() NOT NULL,
  UNIQUE (user_id, checkin_id, type)
)
```

Index: `reactions_checkin_idx` on `(checkin_id)` for fast per-check-in aggregation.

### RLS Policies
- **Select:** public — reactions are viewable by everyone.
- **All (insert/update/delete):** restricted to `auth.uid() = user_id`.

---

## Feature 2: Wishlist

### Behavior
- Any authenticated user can add a beer to their personal wishlist.
- Each wishlist entry is tied to a specific beer (not just a style or brewery).
- An optional free-text `note` field allows the user to record context (e.g., "Friend recommended this", "Saw it on tap at FoamFest").
- A beer can only appear once per user's wishlist (enforced by unique constraint on `user_id, beer_id`).
- The wishlist is private — only the owning user can view or manage their own wishlist (RLS enforces this).
- Adding a beer to the wishlist should be accessible from beer detail pages and check-in search results.
- Checking in a beer that is on the user's wishlist should prompt the user to remove it from the wishlist (or auto-remove — TBD with Jordan).

### Database Schema
```sql
public.wishlist (
  id         uuid PRIMARY KEY default uuid_generate_v4(),
  user_id    uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  beer_id    uuid REFERENCES public.beers(id) ON DELETE CASCADE NOT NULL,
  note       text,
  created_at timestamptz default now() NOT NULL,
  UNIQUE (user_id, beer_id)
)
```

Index: `wishlist_user_idx` on `(user_id)` for fast per-user queries.

### RLS Policies
- **All (select/insert/update/delete):** restricted to `auth.uid() = user_id`. Wishlist is fully private.

---

## Acceptance Criteria

| # | Criterion | Status |
|---|-----------|--------|
| **Reactions — DB & Backend** | | |
| 1 | `reactions` table exists in Supabase with correct columns and unique constraint | ✅ Built |
| 2 | RLS: anyone can SELECT reactions; only owner can INSERT/DELETE | ✅ Built |
| 3 | Index on `checkin_id` for performant aggregation queries | ✅ Built |
| 4 | API endpoint to add a reaction (POST) | ⏳ Needs build |
| 5 | API endpoint to remove a reaction (DELETE), idempotent | ⏳ Needs build |
| 6 | API endpoint to fetch reaction counts grouped by type for a check-in | ⏳ Needs build |
| **Reactions — UI** | | |
| 7 | Reaction bar visible on check-in cards in the home feed | ⏳ Needs build |
| 8 | Three reaction buttons rendered: 👍, 🔥, 🍺 with counts | ⏳ Needs build |
| 9 | User's active reactions are highlighted (filled/colored state) | ⏳ Needs build |
| 10 | Tapping a reaction toggles it on/off with optimistic update | ⏳ Needs build |
| 11 | Reaction counts update without full page reload | ⏳ Needs build |
| 12 | Reactions are hidden or replaced with a sign-in prompt for unauthenticated visitors | ⏳ Needs build |
| **Wishlist — DB & Backend** | | |
| 13 | `wishlist` table exists in Supabase with correct columns and unique constraint | ✅ Built |
| 14 | RLS: only owner can select/insert/update/delete their wishlist | ✅ Built |
| 15 | Index on `user_id` for fast user wishlist queries | ✅ Built |
| 16 | API endpoint to add a beer to wishlist (POST), idempotent on duplicate | ⏳ Needs build |
| 17 | API endpoint to remove a beer from wishlist (DELETE) | ⏳ Needs build |
| 18 | API endpoint to fetch user's wishlist (GET), returns beers with brewery info | ⏳ Needs build |
| **Wishlist — UI** | | |
| 19 | "Want to Try" / bookmark button on beer detail page | ⏳ Needs build |
| 20 | Button reflects current wishlist state (saved vs. unsaved) on load | ⏳ Needs build |
| 21 | Wishlist tab or section visible on user profile page | ⏳ Needs build |
| 22 | Wishlist entries show beer name, brewery, style, and optional note | ⏳ Needs build |
| 23 | User can delete a beer from the wishlist list view | ⏳ Needs build |
| 24 | Optional note can be added/edited from the wishlist entry | ⏳ Needs build |
| 25 | Checking in a beer already on the wishlist prompts removal from wishlist | ⏳ Needs build |

## Open Questions
1. **Auto-remove on check-in:** Should completing a check-in for a wishlisted beer auto-remove it, or prompt the user? Needs decision from Jordan + Alex before Step 5 (celebration screen) is finalized.
2. **Wishlist privacy:** Currently fully private per RLS. Should there be a future "public wishlist" option so friends can see what you want to try? Flag for Sprint 3 planning.
3. **Reaction notifications:** Should the check-in owner receive a notification when their check-in gets a reaction? Notification table exists — this is an additive feature once the reaction API is built.

## Notes (Sam — BA)
> For Taylor (Sales): Reactions are a key social stickiness feature — they give users a reason to open the app even when they're not at a brewery. Wishlist is a natural upsell hook: "See what your friends want to try and plan your next outing together."
>
> For Casey (QA): The unique constraint `(user_id, checkin_id, type)` means a user CAN have all three reaction types on one check-in simultaneously. Test this explicitly — the toggle should only remove the specific type tapped, not all reactions from that user on that check-in.

---

## RTM Links

### Implementation
[components/ui/WishlistButton.tsx](../../components/ui/WishlistButton.tsx), [lib/share](../../lib/)

### Tests
[share.test.ts](../../lib/__tests__/share.test.ts) ⚠️ partial coverage

### History
- [retro](../history/retros/sprint-13-retro.md)
- [plan](../history/plans/sprint-13-plan.md)

## See also
[REQ-012](REQ-012-beer-wishlist.md)

> Added 2026-04-15 during the wiki reorg — see the [RTM](README.md) for the master table.
