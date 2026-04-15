# Sprint 126 Retro — The Geo
**Facilitated by:** Morgan 🗂️
**Date:** 2026-04-02
**Verdict:** Our worst sprint yet. Honest about it. Learning from it.

---

## What We Shipped
- Migration 083: Pint & Pixel brand tier fix (free → barrel) + loyalty seed slug fix
- Migration 084: Session geolocation columns (session_latitude, session_longitude)
- BrandLocationsClient: geo-sorted locations grid with distance badges + nearest banner
- BreweryMap: "you are here" blue dot + smart bounds
- Brand nearby locations API
- Breweries API: brand join for nearby detection
- CheckinEntryDrawer: brand name labels + groupNearbyByBrand utility
- Session location capture: coordinates passed through hook → API → DB
- 13 new tests (821 → 834), build clean

## What Went Wrong

### P0: Brewery detail page crashes for brand-linked breweries
"Objects are not valid as a React child (found: object with keys {title, description})" — exposed when Joshua linked Pint & Pixel breweries to the brand. Pre-existing bug but we should have caught it before shipping brand loyalty features.

### P1: Brand page shows 0 locations
The geo features render correctly but depend on breweries having `brand_id` set. The seed data never linked breweries to the brand — the `brand_id` column existed but was null. We built a beautiful UI on top of empty data.

### P1: Feature feels disconnected
Joshua: "Seems like a new complication for the user... not cohesive with what we already have." The brand page proximity features add a new path but don't integrate smoothly with the existing brewery flow.

### P2: Tests pass but app breaks
834 tests passing. Zero of them test "can a user view a brand-linked brewery page?" Unit tests cover math and utilities. Nobody tested the actual user journey.

---

## The Team Speaks

**Morgan** 🗂️: "This is on me. I scoped a feature sprint when we should have done a data integrity sprint first. The brand system has been accumulating seed data gaps since Sprint 115 and I kept pushing features on top of them. Joshua is right — we need maturity, not velocity."

**Jordan** 🏛️: "I had to take a walk. We built 4 new files, modified 8, added an API endpoint, and none of us asked 'does the brand page actually have data to show?' I reviewed the architecture but not the data pipeline. That's a failure of process, not code."

**Avery** 💻: "I built everything the plan said. But the plan didn't say 'verify the seed data first.' I should have pushed back when I saw the brand page rendering 0 locations during development. Already on it — won't happen again."

**Casey** 🔍: "Zero P0 bugs open right now... because I wasn't looking at the right things. Our test suite tests functions, not flows. 834 passing tests gave us false confidence. I need page-level smoke tests that actually render every page with real data states."

**Reese** 🧪: "Not covered. That's my line. This was not covered. We need Playwright tests that walk the actual user journey — start on Explore, click a brewery, check in, view brand page. If the page crashes, the test fails. No more 'tests pass but app breaks.'"

**Sam** 📊: "From a business continuity standpoint... if this was a real brewery owner hitting the brand page and seeing 0 locations, they'd close the tab. We need to think about the user's actual experience, not just whether our functions return the right values."

**Riley** ⚙️: "The migration pipeline worked clean. 082 and 083 pushed fine after we fixed the tracking gap. But I should have flagged that the brand loyalty seed used the wrong slug — that's a data integrity issue that sat for a whole sprint."

**Drew** 🍻: "I felt that physically. Joshua's right — when he changes something and it breaks something else, that's not a mature product. A brewery owner would uninstall. We need to stop adding features and start making what we have bulletproof."

**Taylor** 💰: "We're going to be rich... but not if the product breaks when someone tries to use it. Every feature we ship that doesn't work is worse than not shipping it at all. Fix the foundation."

**Jamie** 🎨: "The blue dot and nearest banner look great. When they work. Chef's kiss that tastes like nothing because there's no food on the plate."

**Quinn** ⚙️: "Let me check the migration state first — that's my line. I checked the migrations but not the data they produce. Migration 083 created the loyalty program but nobody verified the brand had locations. Data validation should be part of migration testing."

**Sage** 📋: "I've got the notes. And the notes say we need a different kind of sprint next. Not features. Foundations."

---

## Joshua's Feedback (direct quotes)
- "Seems like a lot of this feature just doesn't work"
- "The map doesn't work, the locations don't load anything"
- "Seems like a new complication for the user... not cohesive with what we already have"
- "We need more maturity in our coding"
- "We change one thing and break something somewhere else"
- "We are adding a lot of paths and not making functionality cohesive"
- "We are saying that all tests pass and then I immediately find issues"
- "I would call this sprint our worst yet"

---

## Action Items

### Immediate (Sprint 127)
1. **Fix the brewery detail page crash** — P0, brand-linked breweries are broken
2. **Fix brand page data pipeline** — Ensure seed data links breweries to brand properly
3. **Page-level smoke tests** — Every page must render without crashing for all data states (empty, partial, full, brand-linked)
4. **User journey E2E test** — Playwright test: Explore → brewery → check in → brand page → loyalty
5. **Seed data audit** — Verify all brand entities have consistent, complete data

### Process Changes
6. **"Can I test this?" gate** — Before closing any sprint, Morgan must verify Joshua can actually walk through the feature end-to-end
7. **Data-first development** — Verify data pipeline before building UI
8. **Integration tests > unit tests** — Shift test investment toward page renders and API flows, not just utility functions

---

## Roast Corner

**Drew on the team:** "We built a GPS system for a car with no wheels."

**Casey on Casey:** "834 tests. Zero useful ones. I'm writing my resignation from the 'zero P0s' club."

**Jordan on Avery:** "Avery built everything perfectly. Everything that was perfectly wrong."

**Taylor on the sprint:** "Sprint 126: The Geo. More like The Geo-Nowhere."

**Jamie on the blue dot:** "The blue dot is gorgeous. It's floating over a map with nothing on it. Modern art."

**Sam on test confidence:** "Our test suite is like a bouncer who checks IDs at the front door but doesn't notice the building is on fire."

**Morgan on Morgan:** "I presented 3 options and should have presented a 4th: 'Fix what's broken first.' This is a living document, and today it's on life support."

---

## Stats
- **Files created:** 4 (BrandLocationsClient, nearby API, migration 083, migration 084, geo tests)
- **Files modified:** 8
- **Tests:** 821 → 834 (+13)
- **Bugs found by Joshua:** 3 (tier gate, brewery page crash, brand page empty)
- **Bugs found by tests:** 0
- **Sprint grade:** D-

---

*Sprint 127 will be different. — Morgan* 🗂️
