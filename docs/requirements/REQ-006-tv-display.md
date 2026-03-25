# REQ-006 — Brewery TV Display / Video Board
**Status:** Planned
**Priority:** Later
**Owner:** Alex (UI/UX), Jordan (Dev), Riley (Infra)
**Sprint:** 3

## Summary
A live-updating display app that runs on a TV in the taproom. Shows real-time check-in activity, leaderboards, beer stats, and brewery performance. Premium brewery account feature.

## Display Panels (brewery-configurable)
- **Now Pouring** — active tap list with ratings and ABV
- **Latest Check-In** — name, beer, star rating, avatar (animated entrance)
- **Today's Leaderboard** — top drinkers today
- **Beer Stats** — today's pour count per beer, fast/slow seller indicators
- **Total Today** — aggregate check-ins, unique visitors
- **Achievement Unlock Feed** — when a patron earns an achievement at this brewery

## Setup Flow
1. Brewery admin goes to `/brewery-admin/display`
2. Clicks "Set Up Display" → generates enrollment QR code
3. On TV: navigate to `hoptrack.app/display` in Chrome kiosk mode
4. Scan QR with phone → TV authenticates as read-only display token
5. Display goes live — no further interaction needed

## Tech Notes (Riley)
- Route: `/display/[brewery_id]` — public read-only, no login screen
- Auth: read-only JWT in URL param, scoped to brewery_id, no expiry
- Data: Supabase Realtime subscriptions (zero polling)
- Recommended hardware: Chromebook or Fire Stick + Chrome in kiosk mode
- Offline resilience: last-known state shown if connection drops, reconnects automatically

## UI Notes (Alex)
- Dark background (appropriate use of dark mode — readable from 10 feet)
- Large typography, high contrast
- Animated counters, slide-in transitions for new check-ins
- Brewery logo / branding in corner
- Configurable layout: brewery chooses which panels to show

## Acceptance Criteria
- [ ] Display renders at 1080p and 4K without layout issues
- [ ] New check-ins appear within 2 seconds (Realtime)
- [ ] Brewery can configure which panels are visible
- [ ] QR enrollment flow works end to end
- [ ] Display recovers gracefully from network interruption
- [ ] Works in Chrome kiosk mode (no browser UI visible)
