# REQ-011 — Check-In Modal Flow
**Status:** Built
**Priority:** Now
**Owner:** Sam (BA), Jordan (Dev), Alex (UI/UX)
**Sprint:** 1

## Summary
The check-in modal is the central interaction in HopTrack — it is how users log that they visited a brewery and drank a beer. It is a 5-step full-screen drawer with animated step transitions and a progress indicator. Each step builds on the previous: the user selects where they are, what they drank, how they'd rate it, who they were with, then lands on a celebration screen. On completion, XP is awarded, achievements are evaluated, and a confetti animation fires. The modal resets to Step 1 each time it is opened.

**Component:** `/Users/jdculp/Projects/hoptrack/components/checkin/CheckinModal.tsx`

---

## Modal Shell

### Container
- Rendered as a `FullScreenDrawer` — a full-screen bottom sheet/modal that slides up over the current page.
- Steps are wrapped in `AnimatePresence` with `mode="wait"`, so the exiting step fully animates out before the entering step animates in.
- Each step slides in from the right (`x: 20 → 0`) and slides out to the left (`x: 0 → -20`).

### Header (persistent across all steps)
- **Left control:** X icon on Step 1 (closes and dismisses the modal); ChevronLeft (back arrow) on Steps 2–4 (navigates to previous step). Step 5 has no back/close control.
- **Progress indicator:** A row of 4 pill-shaped segments (one per step 1–4). Completed steps show a wide gold pill; the current step shows a semi-transparent gold pill; upcoming steps show a short dark pill. Step 5 (celebration) is not represented in the progress bar.
- **Right spacer:** Empty `w-10` div to balance the header layout.

### State
All check-in state is managed in a single `CheckinState` object:

| Field | Type | Default |
|-------|------|---------|
| `brewery` | `Brewery \| null` | `null` |
| `beers` | `Beer[]` | `[]` |
| `rating` | `number` | `0` |
| `comment` | `string` | `""` |
| `flavorTags` | `FlavorTag[]` | `[]` |
| `servingStyle` | `ServingStyle \| null` | `"draft"` |
| `photoUrl` | `string \| null` | `null` |
| `taggedFriends` | `string[]` | `[]` |
| `shareToFeed` | `boolean` | `true` |

State is reset to these defaults every time the modal opens.

---

## Step 1 — Brewery Selection

**Heading:** "Where are you?"
**Subheading:** "Find or search for a brewery."

### GPS Auto-Detection
- On modal open, the app requests the device's geolocation (`navigator.geolocation.getCurrentPosition`).
- If location is granted, `getBreweriesByLocation(lat, lng, radius=5)` queries the Open Brewery DB API for breweries within 5 miles.
- If exactly **one** brewery is returned within range, an **auto-detected banner** appears above the search box.
  - Banner shows: MapPin icon, "Auto-detected" label (green), brewery name, "Yes!" and "No" buttons.
  - "Yes!" immediately selects that brewery and advances to Step 2.
  - "No" dismisses the banner; the user proceeds to manual search.
- If 2+ breweries are found, they populate the "Nearby" list (no auto-detect banner).
- If geolocation is denied or unavailable, the flow continues silently with no nearby list.

### Search
- Text input with a Search icon (switches to animated spinner while fetching).
- Debounce: 300ms after the last keystroke before firing the search request.
- Search calls `searchBreweries(query)` against the Open Brewery DB API.
- Results replace the nearby list while the query is non-empty; the nearby list re-appears when the input is cleared.

### Results List
- Each result: colored gradient avatar (generated from brewery name), brewery name (bold), city + state + brewery type (muted).
- Tapping any result selects that brewery and advances to Step 2.
- If search returns zero results: "No breweries found. Add a new brewery →" link (link is built; add-brewery flow is a future feature).

---

## Step 2 — Beer Selection

**Heading:** "What did you have?"
**Subheading:** "Select one or more beers."
**Supertitle:** Selected brewery name in gold.

### Beer List
- Fetched via `GET /api/beers?brewery_id={id}` on step mount.
- Each beer card shows: checkmark/beer-emoji avatar, beer name, style badge, ABV, average rating (if available).
- Multi-select: tapping a beer card toggles its selection state. Selected cards show gold styling and a checkmark.
- Search filter: text input filters the displayed list client-side (no additional API call).
- Empty state: if no beers exist for the brewery, displays an empty-state illustration with "Be the first to add a beer here!" and an "+ Add a beer" link.

### Navigation
- A sticky "Continue" button appears at the bottom once at least one beer is selected.
- Button label: `"Continue with {n} beer{s}"` (pluralized).
- If the brewery has no beers, the button reads `"Skip (log brewery visit only)"` and is always visible.
- The button advances to Step 3.
- "+ I had something not listed" link is always visible at the bottom of the list (add-beer flow is a future feature).

---

## Step 3 — Rate & Review

**Heading:** "How was {beer name}?" (falls back to "How was your drink?" if no beer selected)
**Supertitle:** Selected brewery name in gold.

### Rating
- 5-star `StarRating` component (`size="xl"`).
- Optional — users can skip rating and still proceed.
- Rating label appears below the stars when a rating is selected:
  - 1 star: "Disappointing 😕"
  - 2 stars: "Not great 🤔"
  - 3 stars: "Pretty good 😊"
  - 4 stars: "Really good! 😄"
  - 5 stars: "Outstanding! 🤩"

### Flavor Tags
- Label: "Flavor notes (optional)"
- `FlavorTagPicker` component — 20 tags, max 6 selectable. See REQ-010 for full specification.

### Serving Style
- Label: "How was it served?"
- `ServingStylePicker` component — Draft / Bottle / Can / Cask. See REQ-010 for full specification.

### Comment
- Label: "Leave a note (optional)"
- Free-text `<textarea>`, 3 rows.
- Placeholder: `"Great with the nachos, perfect for a summer afternoon..."`
- No character limit enforced in the UI (DB stores as `text`).

### Photo
- Camera icon button labelled "Add a photo".
- Tapping triggers the device file picker (native image capture on mobile).
- Photo upload implementation is present but not fully wired — see acceptance criteria.

### Navigation
- Sticky "Continue" button advances to Step 4. No fields are required on this step.

---

## Step 4 — Tag Friends & Share

**Heading:** "Almost there!"
**Subheading:** "Tag friends and confirm your check-in."

### Summary Card
A read-only recap of the check-in so far:
- Brewery name and location (city, state)
- Selected beers (comma-separated names)
- Star rating (read-only `StarRating`, `size="sm"`)
- Comment excerpt (italic, truncated to 2 lines with `line-clamp-2`)

### Tag Friends
- Section heading with Users icon: "Who were you with? (optional)"
- Current state: placeholder text "Friend tagging coming soon!" — UI is not functional yet.
- When built: should search friends list, allow multi-select, store selected user IDs in `checkins.checked_in_with` (uuid[]).

### Share Toggle
- Toggle switch labelled "Share to feed" / "Let friends see your check-in".
- Default: ON (gold). Toggling off sets `share_to_feed: false` on the check-in, which hides it from the social feed (user can still see their own check-in on their profile).

### Submit
- "🍺 Log Check-In" button.
- While submitting: button shows a spinning Loader2 icon and "Logging..." text; button is disabled.
- On success: advances to Step 5.
- On failure: no error UI is currently implemented (see open questions).

---

## Step 5 — Celebration

This step is triggered by a successful `submitCheckin()` response. The progress bar is hidden on this step.

### Animations
- Screen scales in from 0.9 on mount (spring animation).
- Beer mug icon circle scales in with a slight delay.
- Text block fades and slides up from y=20 with a further delay.

### Content
- Gold "Check-in logged!" label (monospace, uppercase).
- Large "Cheers! 🥂" heading.
- Summary line: "At {brewery name} — {first beer name}" (where available).

### Confetti
- `canvas-confetti` fires immediately when `setStep(5)` is called, with gold and amber particles (`#D4A843`, `#E8841A`), 120 particles, spread 80, origin y=0.6.

### Achievement Unlocks
- If `result.newAchievements` is non-empty, each unlocked achievement renders as an `AchievementUnlock` card showing the achievement icon, name, tier, and XP gained.
- Cards stack vertically.

### Exit Actions
- **"Back to Feed"** (primary gold button): closes the modal and navigates to:
  - `/beer/{id}` if a beer was selected
  - `/brewery/{id}` if only a brewery was selected
  - `/home` as fallback
- **"Log Another Beer"** (secondary button): resets all state to defaults and returns to Step 1 without closing the modal.

---

## Acceptance Criteria

| # | Criterion | Status |
|---|-----------|--------|
| **Modal Shell** | | |
| 1 | Modal opens as a full-screen drawer from the bottom | ✅ Built |
| 2 | All state resets to defaults on every open | ✅ Built |
| 3 | X icon on Step 1 closes the modal | ✅ Built |
| 4 | Back arrow on Steps 2–4 navigates to the previous step | ✅ Built |
| 5 | Progress bar shows 4 segments with correct completed/current/upcoming states | ✅ Built |
| 6 | Step transitions animate in from right, out to left | ✅ Built |
| **Step 1 — Brewery** | | |
| 7 | Geolocation is requested on modal open | ✅ Built |
| 8 | Auto-detect banner appears when exactly 1 brewery is within 5 miles | ✅ Built |
| 9 | "Yes!" on auto-detect banner selects brewery and advances to Step 2 | ✅ Built |
| 10 | "No" dismisses the banner without selecting a brewery | ✅ Built |
| 11 | 2+ nearby breweries populate the "Nearby" list (no auto-detect banner) | ✅ Built |
| 12 | Geolocation denial is handled silently (no error shown to user) | ✅ Built |
| 13 | Search input fires with 300ms debounce | ✅ Built |
| 14 | Spinner replaces search icon while fetching results | ✅ Built |
| 15 | Nearby list is shown when query is empty; search results replace it when typing | ✅ Built |
| 16 | Tapping any brewery result selects it and advances to Step 2 | ✅ Built |
| 17 | Zero-result state renders "No breweries found" message | ✅ Built |
| **Step 2 — Beer** | | |
| 18 | Beer list fetches from `GET /api/beers?brewery_id=` on step mount | ✅ Built |
| 19 | Multi-select: multiple beers can be toggled simultaneously | ✅ Built |
| 20 | Selected beers show gold styling and checkmark | ✅ Built |
| 21 | Client-side search filters visible beer list | ✅ Built |
| 22 | "Continue with {n} beer(s)" button appears when at least one beer is selected | ✅ Built |
| 23 | Empty-state renders when brewery has no beers | ✅ Built |
| 24 | "Skip (log brewery visit only)" button allows brewery-only check-in | ✅ Built |
| **Step 3 — Review** | | |
| 25 | Star rating is optional; flow can proceed without a rating | ✅ Built |
| 26 | Rating label text changes per star value (1–5 scale) | ✅ Built |
| 27 | `FlavorTagPicker` renders with 20 tags and 6-tag cap | ✅ Built |
| 28 | `ServingStylePicker` renders with 4 options; Draft pre-selected | ✅ Built |
| 29 | Comment textarea is optional with correct placeholder | ✅ Built |
| 30 | "Add a photo" button is visible | ✅ Built |
| 31 | Photo upload wires to file input and stores URL in `photoUrl` state | 🔄 In progress |
| 32 | "Continue" advances to Step 4 with no required fields | ✅ Built |
| **Step 4 — Share** | | |
| 33 | Summary card displays brewery, beers, rating, and comment excerpt | ✅ Built |
| 34 | Share-to-feed toggle defaults to ON | ✅ Built |
| 35 | Toggling share-to-feed updates `shareToFeed` state | ✅ Built |
| 36 | "Log Check-In" button is disabled and shows spinner while submitting | ✅ Built |
| 37 | Friend tagging UI shows "coming soon" placeholder | ✅ Built |
| 38 | Friend tagging allows selecting from friends list and stores IDs in `checked_in_with` | ⏳ Needs build |
| 39 | Submission failure shows an error message to the user | ⏳ Needs build |
| **Step 5 — Celebration** | | |
| 40 | Confetti fires immediately on reaching Step 5 | ✅ Built |
| 41 | "Cheers!" screen renders with brewery and beer name summary | ✅ Built |
| 42 | New achievement cards render for each unlocked achievement | ✅ Built |
| 43 | XP gained is displayed on the celebration screen | ⏳ Needs build |
| 44 | "Back to Feed" navigates to beer page → brewery page → home (priority order) | ✅ Built |
| 45 | "Log Another Beer" resets state and returns to Step 1 | ✅ Built |
| **Data Integrity** | | |
| 46 | `checkins.user_id` is set to the authenticated user's ID | ✅ Built |
| 47 | `checkins.share_to_feed` reflects the Step 4 toggle | ✅ Built |
| 48 | `checkins.is_first_time` is set correctly for first-time beer visits | ⏳ Needs QA |
| 49 | `checkins.location_verified` is set when GPS auto-detection was used | ⏳ Needs QA |
| 50 | XP is calculated and written to `profiles.xp` after submission | ⏳ Needs QA |
| 51 | `profiles.level` is updated if XP crosses a level threshold | ⏳ Needs QA |
| 52 | `profiles.total_checkins`, `unique_beers`, `unique_breweries` increment correctly | ⏳ Needs QA |

## Open Questions
1. **Photo upload:** The "Add a photo" button has an `onClick` stub but no file input is wired. Jordan to confirm storage bucket and upload flow before closing AC-31.
2. **Submission error handling:** Currently silent on failure. Recommend a toast or inline error message. AC-39.
3. **XP display on Step 5:** The confetti fires and achievements show, but the raw XP number is not displayed. Should be a quick add once `submitCheckin()` returns the XP delta. AC-43.
4. **`location_verified` flag:** The schema has this column; it should be `true` when GPS auto-detection confirmed the brewery selection. Logic needs to be passed through to the API. AC-49.
5. **Offline behavior:** No offline handling is implemented. Check-ins attempted without a network connection will silently fail. Future consideration.

## Notes (Sam — BA)
> For Taylor (Sales): The 5-step flow was intentionally designed to feel like a ritual, not a form. The brewery auto-detection, the confetti, and the achievement unlocks are all moments of delight. In demos, let the flow run end-to-end — the celebration screen closes the sale.
>
> For Casey (QA): Pay particular attention to the state reset logic (AC-2). Open the modal, get halfway through a check-in, close it, and reopen — all fields must be blank. Also test the "Log Another Beer" path (AC-45) to ensure state fully resets without a modal close/reopen cycle.

---

## RTM Links

### Implementation
🪦 deprecated — see [archive/checkins-deprecation-plan.md](../archive/checkins-deprecation-plan.md)

### Tests
— (deprecated)

### History
- — (deprecated)
- *(no dedicated plan file)*

## See also
[REQ-025](REQ-025-sessions-tap-wall.md) *(replacement)*

> Added 2026-04-15 during the wiki reorg — see the [RTM](README.md) for the master table.
