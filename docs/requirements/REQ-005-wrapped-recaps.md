# REQ-005 — Wrapped-Style Recaps
**Status:** Planned
**Priority:** Later
**Owner:** Riley (Infra), Jordan (Dev), Alex (UI/UX)
**Sprint:** 3

## Summary
Spotify Wrapped-style recap cards for consumers (weekly/monthly/yearly) and breweries. Shareable as a PNG image. Primary virality and re-engagement driver.

## Consumer Recap Includes
- Total check-ins for period
- Top brewery visited
- Favorite beer style
- XP earned
- New achievements unlocked
- Unique breweries visited
- Total miles traveled (if location enabled)
- Most-used flavor tags
- "You were in the top X% of HopTrack users this year"

## Brewery Recap Includes
- Total check-ins logged at their brewery
- Most popular beer
- Busiest day/hour
- New unique visitors
- Average rating
- Top regular (most check-ins)

## Delivery
- **Weekly:** Push notification + in-app card, Sunday evening
- **Monthly:** Email + in-app, 1st of each month
- **Yearly:** Email + in-app + shareable PNG, January 1st

## Shareable Card
- Generated server-side using `satori` (Vercel OG image library)
- Downloadable PNG + native share sheet
- HopTrack branding + user's name/avatar
- URL: `/api/recap/[userId]/[year]` returns PNG

## Infrastructure (Riley)
- Supabase Edge Function cron: weekly Sunday 8pm, monthly 1st 9am, yearly Jan 1 10am
- Aggregation queries pre-computed and cached in `user_recaps` table
- Email via Resend

## Acceptance Criteria
- [ ] Weekly recap card in home feed
- [ ] Monthly recap notification
- [ ] Yearly recap shareable PNG
- [ ] Brewery yearly recap in brewery admin dashboard
- [ ] "Top X% of users" percentile calculation
