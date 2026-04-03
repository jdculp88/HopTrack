# Sprint 138 — The Bartender
**Theme:** Real-world ops hardening
**Status:** COMPLETE
**Date:** 2026-04-02 (retroactive)

---

## Goals
- Fix CI test file type errors blocking the pipeline
- Build bartender quick-access workflow (simplified nav for staff role)
- Deploy smarter search across the app (GlobalSearch overlay + SearchTypeahead)
- Add per-location analytics toggle for brand managers

## Key Deliverables
- CI fix: 19 test file type errors -> 0 across 6 files (Vitest globals, readonly casts, namespace imports, Proxy typing)
- Bartender Quick-Access: Punch added to Operations nav (ScanLine icon), staff-role simplified nav (Overview + Punch only for staff users, desktop + mobile), CodeEntry polished (ScanLine header, auto-focus, Enter hint), staff quick-action card on dashboard
- GlobalSearch overlay (Cmd/K shortcut, backdrop blur, mobile + desktop), SearchTypeahead deployed in AppShell header + Explore page (was built S114, never wired), API ranking improved (ILIKE sorts by name length ASC), recent searches (localStorage, max 5, deduped)
- `LocationSelector` pill component (respects locationScope for regional managers), 3 brand analytics APIs updated with `?location=` param + server-side validation, brand dashboard + reports wired with refetch pattern

## Results
- 3 new files, ~15 modified, 0 migrations
- 22 new tests (1056 -> 1078 total)
- KNOWN: Brand Team page shows 0 members (pre-existing RLS query issue)
