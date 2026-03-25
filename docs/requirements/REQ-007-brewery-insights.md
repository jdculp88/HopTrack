# REQ-007 — Brewery Location Insights & Beer Suggestions
**Status:** Planned
**Priority:** Later
**Owner:** Sam (BA), Riley (Infra)
**Sprint:** 3–4

## Summary
Premium analytics feature for brewery accounts. Aggregates anonymized check-in data by geography to surface actionable insights — e.g. "Kolsch is the #1 style in your area but you don't carry one."

## Insight Types
| Insight | Example |
|---------|---------|
| Trending styles nearby | "IPA check-ins up 34% within 5 miles this month" |
| Gap analysis | "You don't carry a Sour — it's the #3 style in your zip code" |
| Seasonal timing | "Oktoberfest beers peak in your area Sept 15 – Oct 31" |
| Competitive benchmark | "Your avg rating (4.1) is above the local average (3.8)" |
| Best day/time to promote | "Friday 5–8pm accounts for 40% of local check-ins" |

## Data Model
```sql
brewery_insights (
  id, brewery_id, insight_type, title, body, data jsonb,
  generated_at, expires_at, is_read
)
```

## Delivery
- Weekly email digest to brewery admin
- In-app insights panel in brewery dashboard
- "New insight" badge on dashboard nav

## Privacy
- All geographic aggregations anonymized (min. 10 check-ins before surfacing)
- No individual user data exposed to breweries
- Compliant with GDPR/CCPA

## Monetization (Sam)
> This is the flagship **Premium** tier feature. Suggested pricing:
> - Free tier: basic check-in counts only
> - Pro ($29/mo): full insights dashboard + weekly email
> - Enterprise ($99/mo): API access + custom date ranges + competitor benchmarking

## Acceptance Criteria
- [ ] Weekly insights generated for all Pro+ brewery accounts
- [ ] Gap analysis identifies top 3 missing styles
- [ ] Insights displayed in brewery admin dashboard
- [ ] Email digest formatted and delivered via Resend
- [ ] All data anonymized, no individual user exposure
- [ ] Minimum sample size (10 check-ins) enforced before surfacing insights
