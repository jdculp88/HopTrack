# Sprint 133 — The Cleanup
**Theme:** Brewery admin nav reorganization
**Status:** COMPLETE
**Date:** 2026-04-02 (retroactive)

---

## Goals
- Reorganize 22 flat brewery admin nav items into semantic groups
- Build collapsible desktop sidebar with persistent state
- Create mobile "More" bottom sheet for overflow navigation
- DRY brand nav link JSX

## Key Deliverables
- `NAV_GROUPS` data structure: 6 semantic groups (Content, Engage, Insights, Operations, Account + Overview standalone)
  - Content: Tap List, Menus, Board, Embed
  - Engage: Messages, Loyalty, Mug Clubs, Challenges, Promo Hub, Ad Campaigns
  - Insights: Analytics, Customers, Sessions, Report, Pint Rewind
  - Operations: Events, Table Tent, POS Sync
  - Account: Settings, Billing, Resources
- Collapsible desktop sidebar (AnimatePresence expand/collapse, localStorage persistence via `ht-nav-groups` key, auto-expand for active page's group)
- `BRAND_NAV_ITEMS` array DRY'd 110+ lines of repeated brand link JSX into 7-item `.map()`
- Mobile priority strip (Overview, Tap List, Analytics, Messages, Loyalty, Settings) + "More" bottom sheet (AnimatePresence slide-up, grouped items, backdrop overlay, tap-outside-to-close)

## Results
- 1 modified file, 1 new test file, 0 migrations
- 18 new tests (956 -> 974 total)
- KNOWN: Brand Team page shows 0 members (pre-existing RLS query issue)
