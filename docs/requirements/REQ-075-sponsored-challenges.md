# REQ-075: Sponsored Challenges

**Status:** COMPLETE
**Sprint:** 91 (The Spotlight)
**Feature:** F-027

## Overview
Brewery-created sponsored challenges with geographic discovery, allowing breweries to promote challenges to nearby consumers. Includes impression/click analytics and tier-based access control.

## Requirements
- Brewery admin creation UI: title, description, challenge type, target, reward, budget, radius
- Geographic discovery: haversine distance calculation to surface nearby sponsored challenges
- Sponsored badge and visual differentiation from regular challenges
- Impression tracking: logged when challenge appears in discovery feed
- Click tracking: logged when user taps into challenge detail
- Analytics dashboard: impressions, clicks, CTR, completions, cost-per-completion
- Tier gating: sponsored challenges available to Cask and Barrel tiers only
- Migration 060: `sponsored_challenges` table with budget, radius, and analytics columns

## Acceptance Criteria
- Brewery admin (Cask+) can create sponsored challenge with geographic radius
- Consumers within radius see sponsored challenges in discovery feed
- Sponsored challenges display distinct visual treatment (badge, highlight)
- Impressions and clicks tracked accurately with deduplication
- Analytics page shows real-time stats for active sponsored challenges
- Free/Tap tier breweries see upgrade prompt when attempting to create
- Haversine calculation returns correct results for edge cases (cross-meridian, poles)

## Technical Notes
- Haversine formula implemented in SQL for distance filtering (WHERE clause)
- Impression/click dedup: one per user per challenge per 24h window
- Budget is display-only in Phase 1 (no actual billing against budget)
- Discovery query: `SELECT ... WHERE haversine(user_lat, user_lng, brewery_lat, brewery_lng) <= radius`
