# Sprint 139 — The Guide
**Theme:** User guides & brewery onboarding polish
**Status:** COMPLETE
**Date:** 2026-04-03 (retroactive)

---

## Goals
- Build Tooltip and HelpIcon components for contextual help
- Redesign Resources page with tabbed layout and searchable FAQ
- Polish brewery onboarding wizard with contextual "why this matters" copy
- Wire HelpIcon to key feature pages with deep links

## Key Deliverables
- Tooltip component (CSS positioning, AnimatePresence, tap-to-toggle mobile, useId a11y)
- HelpIcon component (gold circle, tooltip + link modes)
- Resources page tabbed redesign: 4 tabs (Guides/Glassware/API/POS) with pill toggles, AnimatePresence crossfade, URL hash sync, search filter on Guides
- 23 FAQ items across 6 nav groups (Getting Started, Content, Engage, Insights, Operations, Account) with accordion pattern
- PageHeader enhanced with `helpAction` prop
- FormField enhanced with `helpText` prop
- EmptyState enhanced with `helpLink` prop
- Help nav link added to Account group
- Dashboard "Need help?" quick link
- Onboarding wizard polished: "why this matters" context on all 4 steps, "Browse setup guides" link on Preview
- HelpIcon wired to 4 feature pages (Loyalty, Analytics, POS Sync, Tap List)

## Results
- 5 new files, ~14 modified, 0 migrations
- 13 new tests (1078 -> 1091 total)
- KNOWN: Brand Team page shows 0 members (pre-existing RLS query issue)
