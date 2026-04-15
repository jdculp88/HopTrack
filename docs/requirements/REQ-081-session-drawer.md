# REQ-081: Session Drawer Overhaul

**Status:** COMPLETE
**Sprint:** 96 (The Lockdown)
**Feature:** F-032

## Overview
Complete redesign of the active session drawer UX, introducing a SessionContext for global state management, minimize mode for background sessions, and proper cancel flow with hard-delete cleanup.

## Requirements
- SessionContext: React context providing session state (active session, beers logged, brewery) to all components
- Minimize mode: user can collapse active session to a floating bubble, continue browsing, and re-expand
- Cancel flow: cancel session triggers hard-delete of session record and all associated beer logs
- Beer log persistence: beers logged during session survive drawer minimize/expand cycles
- Drawer states: expanded (full drawer), minimized (floating bubble), closed (no session)
- Active session bubble: shows brewery name, beer count, elapsed time
- Re-expand: tapping minimized bubble restores full drawer with all state intact

## Acceptance Criteria
- Starting a session opens drawer in expanded state
- Minimize button collapses to floating bubble without losing state
- Bubble shows brewery name and beer count
- Tapping bubble restores full drawer with all logged beers intact
- Cancel session prompts inline confirmation (AnimatePresence)
- Confirming cancel hard-deletes session + beer logs from database
- SessionContext accessible from any component (feed, brewery page, etc.)
- No orphaned records after cancel (session + beer_logs both deleted)
- Drawer persists across page navigation (context-based, not route-based)

## Technical Notes
- `SessionContext` provider wraps app layout, holds session ID, brewery, beer log array
- Minimize state stored in context (not localStorage) — lost on page refresh by design
- Cancel hard-delete uses single API call that cascades: DELETE session WHERE id = X (FK cascade handles beer_logs)
- Floating bubble uses fixed positioning with `z-50` to stay above all content
- Beer log array in context is source of truth during active session; synced to DB on each log

---

## RTM Links

### Implementation
[components/session/](../../components/), [lib/session-flow](../../lib/)

### Tests
[session-flow.test.ts](../../lib/__tests__/session-flow.test.ts)

### History
- [retro](../history/retros/sprint-96-retro.md)
- [plan](../history/plans/sprint-96-plan.md)

## See also
[REQ-025](REQ-025-sessions-tap-wall.md)

> Added 2026-04-15 during the wiki reorg — see the [RTM](README.md) for the master table.
