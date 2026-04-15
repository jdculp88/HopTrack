# REQ-008 — XP & Leveling System
**Status:** Built
**Priority:** Now
**Owner:** Sam (BA), Jordan (Dev)
**Sprint:** 1

## Summary
HopTrack uses an experience point (XP) system to reward user engagement and progression. Every action in the app earns XP — from basic check-ins to adding photos, writing reviews, and unlocking achievements. XP accumulates on the user's profile and maps to one of 20 named levels, starting at "Hop Curious" and culminating in "Grand Cicerone." Level and progress are surfaced on the user profile and feed into the leaderboard ranking system.

## XP Earning Rules

| Action | XP Earned | Notes |
|--------|-----------|-------|
| Check-in (base) | +10 | Awarded for every submitted check-in |
| New beer (first time) | +5 | Beer not previously checked in by this user |
| New brewery (first time) | +10 | Brewery not previously visited by this user |
| Rating added | +2 | Any numeric rating attached to check-in |
| Comment written | +3 | Non-empty comment field |
| Photo attached | +5 | Photo URL present on check-in |
| Bronze achievement | +50 | On unlock |
| Silver achievement | +100 | On unlock |
| Gold achievement | +200 | On unlock |
| Platinum achievement | +500 | On unlock |

**Maximum XP from a single check-in (without achievement bonuses):** 35 XP (base 10 + new beer 5 + new brewery 10 + rating 2 + comment 3 + photo 5).

XP calculation is handled by `calculateCheckinXP()` in `/Users/jdculp/Projects/hoptrack/lib/xp/index.ts`. Achievement XP is awarded separately when the achievement is unlocked, not as part of the check-in calculation.

## Level Definitions

All 20 levels are defined in the `LEVELS` constant in `/Users/jdculp/Projects/hoptrack/lib/xp/index.ts`.

| Level | Name | XP Required | XP Range |
|-------|------|-------------|----------|
| 1 | Hop Curious | 0 | 0 – 99 |
| 2 | Tasting Notes | 100 | 100 – 249 |
| 3 | Draft Dweller | 250 | 250 – 499 |
| 4 | Brew Buddy | 500 | 500 – 999 |
| 5 | Regular | 1,000 | 1,000 – 1,749 |
| 6 | Pint Pilgrim | 1,750 | 1,750 – 2,749 |
| 7 | Tap Room Traveler | 2,750 | 2,750 – 3,999 |
| 8 | Craft Connoisseur | 4,000 | 4,000 – 5,499 |
| 9 | Brew Hound | 5,500 | 5,500 – 7,499 |
| 10 | Cask Master | 7,500 | 7,500 – 9,999 |
| 11 | Cellar Keeper | 10,000 | 10,000 – 12,999 |
| 12 | Grain & Glory | 13,000 | 13,000 – 16,499 |
| 13 | Fermentation Sage | 16,500 | 16,500 – 20,499 |
| 14 | Yeast Whisperer | 20,500 | 20,500 – 24,999 |
| 15 | Liquid Librarian | 25,000 | 25,000 – 30,499 |
| 16 | Hop Alchemist | 30,500 | 30,500 – 36,999 |
| 17 | Brewmaster | 37,000 | 37,000 – 44,499 |
| 18 | Craft Legend | 44,500 | 44,500 – 52,999 |
| 19 | Hopvangelist | 53,000 | 53,000 – 62,499 |
| 20 | Grand Cicerone | 62,500 | 62,500+ (max) |

At level 20 the progress bar is permanently full (100%) and `xpToNext` is 0.

## Level Progress Calculation

`getLevelProgress(xp)` returns four values:

- `current` — the full level object for the user's current level
- `next` — the full level object for the next level, or `null` at max level
- `progress` — integer 0–100 representing how far through the current level's XP band the user is
- `xpToNext` — raw XP needed to reach the next level

Formula: `progress = round((xp - current.xp_required) / (next.xp_required - current.xp_required) * 100)`, capped at 100.

## Database Storage

XP and level are stored on `public.profiles`:

```
profiles.xp     INT  default 0
profiles.level  INT  default 1
```

Both columns are updated server-side after each check-in submission.

## Acceptance Criteria

| # | Criterion | Status |
|---|-----------|--------|
| 1 | XP awarded for check-in base action (+10) | ✅ Built |
| 2 | Bonus XP for new beer (+5) and new brewery (+10) | ✅ Built |
| 3 | Bonus XP for rating (+2), comment (+3), photo (+5) | ✅ Built |
| 4 | Achievement XP awarded on unlock (50/100/200/500 by tier) | ✅ Built |
| 5 | `getLevelFromXP()` returns correct level for any XP value | ✅ Built |
| 6 | `getLevelProgress()` returns progress 0–100 and xpToNext | ✅ Built |
| 7 | Level 20 returns progress=100 and xpToNext=0 | ✅ Built |
| 8 | `profiles.xp` and `profiles.level` persist correctly in DB | ✅ Built |
| 9 | User profile page displays current level name and XP progress bar | ⏳ Needs QA |
| 10 | Progress bar visually reflects `getLevelProgress().progress` value | ⏳ Needs QA |
| 11 | "X XP to [next level name]" label shown below progress bar | ⏳ Needs QA |
| 12 | Level name appears on user profile card and leaderboard rows | ⏳ Needs QA |
| 13 | XP gain is shown in the Step 5 celebration screen after a check-in | ⏳ Needs QA |
| 14 | Level-up event triggers a distinct visual celebration when threshold is crossed | 🔄 In progress |
| 15 | Leaderboard ranks users by total XP descending | ⏳ Needs QA |

## Notes (Sam — BA)
> The level names are brand voice assets — do not change them without sign-off from Alex (UI/UX). Taylor (Sales) has specifically called out "Grand Cicerone" and "Hopvangelist" as talking points in demos.
>
> The XP values were balanced for a casual user hitting Level 5 ("Regular") after roughly 40–50 check-ins. Rebalancing requires re-running the math against the full 20-level table.

---

## RTM Links

### Implementation
[lib/xp](../../lib/), [lib/xp-variable](../../lib/)

### Tests
[xp.test.ts](../../lib/__tests__/xp.test.ts), [xp-variable.test.ts](../../lib/__tests__/xp-variable.test.ts)

### History
- [retro](../history/retros/sprint-13-retro.md)
- [plan](../history/plans/sprint-13-plan.md)

## See also
[REQ-106](REQ-106-sensory-vibe.md) *(variable XP)*

> Added 2026-04-15 during the wiki reorg — see the [RTM](README.md) for the master table.
