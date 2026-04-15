# Realtime

*How HopTrack does live tap lists, presence, and "Drinking Now".* Owned by [Riley](../../.claude/agents/riley.md).

**Back to [architecture](README.md) · [wiki home](../README.md).**

---

## Supabase Realtime — since Sprint 156

Realtime arrived in [Sprint 156 — The Triple Shot](../history/retros/sprint-156-retro.md) ([REQ-101](../requirements/REQ-101-supabase-realtime.md)). Before that, tap-list updates polled. Now they push.

Two channel kinds:

1. **Postgres changes** — subscribe to `tap_lists` and related tables for live tap updates.
2. **Presence** — "Drinking Now" feature tracks who's at a brewery right now. Presence state is ephemeral; nothing persists.

## The subscription shape

Client code uses the `useRealtime` hook family in [hooks/](../../hooks/) rather than subscribing to Supabase directly. This keeps cleanup correct and lets us swap transport if needed. Coverage: [lib/__tests__/realtime-hook.test.ts](../../lib/__tests__/realtime-hook.test.ts).

## What's realtime-backed

- **Tap list board** ([REQ-006](../requirements/REQ-006-tv-display.md)) — TV displays update without refresh when a brewery owner changes the tap list.
- **Drinking Now** — presence on brewery pages.
- **Session OG cards** — triggered on session completion to generate a share image. See [lib/__tests__/session-og.test.ts](../../lib/__tests__/session-og.test.ts).
- **Trending content** ([REQ-102](../requirements/REQ-102-engagement-engine.md)) — leverages real-time aggregations, not just cron snapshots.

## What's explicitly NOT realtime

- Feed — hybrid SSR + `use cache` + client revalidation ([REQ-104](../requirements/REQ-104-intelligence-layer.md)).
- Stats — cron-driven snapshots (nightly [stats-snapshot.yml](../../.github/workflows/stats-snapshot.yml)).
- Achievements — evaluated at event time, not streamed.

## Reconnection + flaky networks

The hook family handles drop-and-reconnect with backoff. Presence state is re-established on reconnect. When the connection can't be had, components fall back to a stale-but-readable view rather than a blank screen.

## Scale notes

Supabase Realtime has a per-project connection cap. At launch we're well under. Riley tracks the number on the [uptime dashboard](../operations/uptime-monitoring.md); we plan for a second cluster when we cross 80% of the cap.

## Cross-links

- [api-layer.md](api-layer.md) — the HTTP path.
- [operations/uptime-monitoring.md](../operations/uptime-monitoring.md).
- [hoptrack-codebase-map skill](../../.claude/skills/hoptrack-codebase-map/SKILL.md) — hook file locations.
