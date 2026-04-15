# Sprint 132 — The Clean Slate
**Theme:** Data quality + brewery social links
**Status:** COMPLETE
**Date:** 2026-04-02 (retroactive)

---

## Goals
- Build pure formatting and validation utilities for brewery data
- Add social media link fields to brewery profiles
- Bulk-normalize all 7,177 brewery records (phone, URLs, postal codes)

## Key Deliverables
- `lib/brewery-utils.ts` — pure formatting + validation: formatPhone, normalizePhone, normalizeWebsiteUrl, normalizePostalCode, isValidState, isValidPostalCode, isValidUrl, isValidSocialUrl
- `components/ui/SocialIcons.tsx` — InstagramIcon, FacebookIcon, XTwitterIcon (lightweight SVGs with currentColor)
- Migration 088: 4 social columns (instagram_url, facebook_url, twitter_url, untappd_url) + bulk normalization of 7,177 breweries (phone digits-only, http->https, 5+4->5 postal codes)
- Brewery Settings: new "Social Links" section with 4 platform inputs + icons + validation
- Settings API: server-side social URL domain validation + auto-normalization on write
- Brewery detail page: formatted phone display + social link icons in contact section
- Public API v1: social fields added to brewery response

## Results
- 4 new files, 5 modified, 1 migration (088)
- 40 new tests (916 -> 956 total)
- KNOWN: Brand Team page shows 0 members (pre-existing RLS query issue)
