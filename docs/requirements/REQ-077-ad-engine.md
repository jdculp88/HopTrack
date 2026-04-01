# REQ-077: Ad Engine

**Status:** COMPLETE
**Sprint:** 93 (The Hardening)
**Feature:** F-028

## Overview
Geo-targeted advertising system that serves brewery ads in the consumer feed, with full impression/click tracking, brewery admin creation UI, and tier-based access control.

## Requirements
- Migration 061: `brewery_ads` table with title, body, image_url, cta_url, geo targeting (lat/lng/radius), budget, status, start/end dates
- 7 API endpoints: CRUD for ads, serve (geo-filtered), record impression, record click
- Geo-targeted serving: ads served to consumers within configured radius using haversine
- Impression tracking: logged per user per ad with dedup (one per 24h)
- Click tracking: logged per user per ad with timestamp
- Feed integration: `BreweryAdFeedCard` rendered in home feed between organic content
- Brewery admin creation UI: form with title, body, image upload, CTA URL, radius, budget, date range
- Tier gating: ad creation restricted to Cask and Barrel tiers
- Superadmin: ad review/approval queue (ads require approval before serving)

## Acceptance Criteria
- Cask/Barrel brewery admin can create, edit, pause, and delete ads
- Ads appear in consumer feed only when within geographic radius and date range
- Impressions and clicks tracked with accurate dedup
- Free/Tap tier sees upgrade prompt on ad creation page
- Ad card in feed has clear "Sponsored" label and distinct visual treatment
- Superadmin can approve/reject pending ads
- Rate limiting on impression/click endpoints prevents abuse

## Technical Notes
- `brewery_ads` table: RLS scoped to brewery admins (own ads) + superadmin (all)
- Serving query joins user location with ad geo config using haversine WHERE clause
- Feed interleaving: ad inserted every N organic cards (configurable, default every 5th)
- Budget is tracked but not billed in Phase 1 (display metric only)
- 7 endpoints all under `/api/brewery/[brewery_id]/ads/`
