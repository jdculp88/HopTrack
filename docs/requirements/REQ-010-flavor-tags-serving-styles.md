# REQ-010 — Flavor Tags & Serving Styles
**Status:** Built
**Priority:** Now
**Owner:** Sam (BA), Jordan (Dev), Alex (UI/UX)
**Sprint:** 1

## Summary
Two companion UI components used in Step 3 of the check-in modal that allow users to describe how a beer tasted and how it was served. Both fields are optional. Flavor tags are multi-select with a maximum cap. Serving style is a single-select with four options. Both values are stored on the `checkins` table and can be used for search filtering and analytics in future sprints.

---

## Feature 1: Flavor Tag Picker

### Overview
A horizontally-wrapping set of pill-shaped toggle buttons. Users tap tags to select them and tap again to deselect. The component enforces a maximum selection limit and provides haptic feedback on selection (where supported by the device).

**Component:** `/Users/jdculp/Projects/hoptrack/components/checkin/FlavorTagPicker.tsx`

### Tag List (20 tags, fixed)
| # | Tag | # | Tag |
|---|-----|---|-----|
| 1 | Hoppy | 11 | Spicy |
| 2 | Citrusy | 12 | Earthy |
| 3 | Malty | 13 | Piney |
| 4 | Smooth | 14 | Tropical |
| 5 | Bitter | 15 | Coffee |
| 6 | Roasty | 16 | Chocolate |
| 7 | Fruity | 17 | Caramel |
| 8 | Sour | 18 | Floral |
| 9 | Sweet | 19 | Grassy |
| 10 | Dry | 20 | Crisp |

The tag list is defined as a fixed constant (`ALL_TAGS`) in the component. Tags are not user-defined and cannot be extended from the UI.

### Selection Rules
- **Default maximum:** 6 tags per check-in (configurable via `max` prop, defaults to 6).
- Tags beyond the maximum are rendered with `opacity-40` and `pointer-events-none` — they cannot be tapped until the user deselects a current tag.
- Selection count is displayed as `{selected}/{max} selected` in the bottom-right corner of the tag grid.

### Interaction & Visual Design
- Selected tag: gold-tinted background (`#D4A843/20`), gold border, gold text, checkmark prefix (`✓`).
- Unselected tag: surface background, muted border, secondary text; border and text shift on hover.
- Disabled (cap reached) tag: 40% opacity, non-interactive.
- Tap animation: spring scale to 0.92 on press (`framer-motion whileTap`).
- Haptic feedback: `navigator.vibrate(20)` fires on selection (silently no-ops on unsupported devices).
- Checkmark animates in with a spring scale from 0 on selection.

### Database Storage
Tags are stored on the check-in as a Postgres text array:
```sql
checkins.flavor_tags  text[]
```
The `FlavorTag` type in `/Users/jdculp/Projects/hoptrack/types/database` is a union of all 20 tag strings. Only valid tags from `ALL_TAGS` are accepted.

---

## Feature 2: Serving Style Picker

### Overview
A full-width row of four equal-width card buttons. Only one style can be active at a time. The component defaults to `draft` pre-selected when the check-in modal opens.

**Component:** `/Users/jdculp/Projects/hoptrack/components/checkin/ServingStylePicker.tsx`

### Serving Style Options

| Value | Label | Emoji |
|-------|-------|-------|
| `draft` | Draft | 🍺 |
| `bottle` | Bottle | 🍾 |
| `can` | Can | 🥫 |
| `cask` | Cask | 🪣 |

The options are defined as a fixed constant (`STYLES`) in the component. Each option renders as a tall card with the emoji centered above the label text.

### Selection Rules
- Single-select only — selecting a style deselects the previous one.
- The initial state in `CheckinModal` is `"draft"`.
- No "none" option — a serving style is always sent unless the user intentionally overrides the default.

### Interaction & Visual Design
- Selected style card: gold-tinted background (`#D4A843/15`), gold border, gold text.
- Unselected style card: surface background, muted border, secondary text; border and text shift on hover.
- Tap animation: spring scale to 0.90 on press (`framer-motion whileTap`).

### Database Storage
Serving style is stored as a constrained text column:
```sql
checkins.serving_style  text CHECK (serving_style IN ('draft', 'bottle', 'can', 'cask'))
```
The `ServingStyle` type in `/Users/jdculp/Projects/hoptrack/types/database` is the union `'draft' | 'bottle' | 'can' | 'cask'`.

---

## Acceptance Criteria

| # | Criterion | Status |
|---|-----------|--------|
| **Flavor Tags** | | |
| 1 | All 20 tags render in the tag picker | ✅ Built |
| 2 | Tapping an unselected tag selects it (gold styling + checkmark) | ✅ Built |
| 3 | Tapping a selected tag deselects it | ✅ Built |
| 4 | No more than 6 tags can be selected simultaneously | ✅ Built |
| 5 | Tags beyond the cap are visually disabled (40% opacity, non-interactive) | ✅ Built |
| 6 | Selection counter displays `{n}/6 selected` | ✅ Built |
| 7 | Haptic vibration (20ms) fires on selection on supported devices | ✅ Built |
| 8 | Checkmark animates in on selection, out on deselection | ✅ Built |
| 9 | Selected tags are saved to `checkins.flavor_tags` as a text array | ✅ Built |
| 10 | `max` prop is configurable (component accepts any positive integer) | ✅ Built |
| 11 | Flavor tags display on the check-in detail / feed card after submission | ⏳ Needs QA |
| **Serving Style** | | |
| 12 | All four serving style options render (Draft, Bottle, Can, Cask) | ✅ Built |
| 13 | Exactly one style can be selected at a time | ✅ Built |
| 14 | Draft is pre-selected when the check-in modal opens | ✅ Built |
| 15 | Tapping a style deselects the previous selection | ✅ Built |
| 16 | Selected style card shows gold styling | ✅ Built |
| 17 | Tap animation (scale 0.90) fires on all four options | ✅ Built |
| 18 | Selected serving style is saved to `checkins.serving_style` | ✅ Built |
| 19 | Serving style displays on the check-in detail / feed card after submission | ⏳ Needs QA |
| **General** | | |
| 20 | Both fields are optional — omitting them does not block submission | ✅ Built |
| 21 | Both pickers render correctly at 375px viewport width (mobile) | ⏳ Needs QA |
| 22 | Both pickers render correctly in dark theme and (future) light theme | ⏳ Needs QA |

## Notes (Sam — BA)
> For Casey (QA): The max-cap behavior on flavor tags is purely client-side — verify that a malformed API request cannot bypass the 6-tag limit by submitting more than 6 values directly. The DB schema uses `text[]` with no array length constraint, so enforcement must be in the API layer as well.
>
> For Taylor (Sales): Flavor tags are a differentiator for beer geeks — the 20-tag vocabulary was chosen to cover the most common beer flavor profiles without being overwhelming. "Hoppy, Citrusy, Tropical" covers IPAs; "Roasty, Coffee, Chocolate" covers stouts; "Sour, Fruity, Dry" covers the sour/wild category. This is a natural talking point when showing the check-in flow.
>
> Future consideration: Aggregate flavor tag data by brewery/beer could power a "flavor profile" visualization on beer and brewery detail pages.

---

## RTM Links

### Implementation
[lib/beer-sensory](../../lib/), [lib/srm-colors](../../lib/)

### Tests
[beer-sensory.test.ts](../../lib/__tests__/beer-sensory.test.ts), [srm-colors.test.ts](../../lib/__tests__/srm-colors.test.ts)

### History
- [retro](../history/retros/sprint-13-retro.md)
- [plan](../history/plans/sprint-13-plan.md)

## See also
[REQ-116](REQ-116-sensory-layer.md) *(SRM + aroma/taste/finish)*

> Added 2026-04-15 during the wiki reorg — see the [RTM](README.md) for the master table.
