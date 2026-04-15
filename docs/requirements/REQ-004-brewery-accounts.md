# REQ-004 — Brewery Accounts & Verification
**Status:** Planned
**Priority:** Next Sprint
**Owner:** All
**Sprint:** 2

## Summary
Allow real breweries to claim their profile, manage their tap list, access analytics, and control loyalty programs. Verification prevents fraudulent claims.

## Verification Tiers
| Tier | Method | Badge | Turnaround |
|------|--------|-------|------------|
| Bronze | Email domain matches brewery website URL | ✓ Claimed | Instant |
| Silver | Upload business license or EIN document | ✓ Verified | 24–48hrs |
| Gold | Manual review by HopTrack team | ✓ Official | 3–5 days |

## Brewery Admin Dashboard (`/brewery-admin`)
- Tap list management (add/edit/remove beers)
- Cover photo upload
- Loyalty program builder
- Promotions / deals creator
- Analytics: check-in trends, top beers, visitor demographics
- Staff account management (invite staff with limited permissions)

## Schema Additions
```sql
brewery_accounts (id, user_id, brewery_id, role ENUM(owner, manager, staff), verified_tier, created_at)
brewery_claims   (id, user_id, brewery_id, status ENUM(pending, approved, rejected),
                  verification_method, document_url, reviewed_by, created_at, resolved_at)
```

## Roles & Permissions
| Role | Can Do |
|------|--------|
| Owner | Everything including billing and staff management |
| Manager | Tap list, loyalty, promotions, analytics |
| Staff | Scan loyalty QR codes only |

## Acceptance Criteria
- [ ] Brewery detail page shows "Claim this brewery" CTA for unclaimed breweries
- [ ] Email domain auto-verification flow
- [ ] Document upload for Silver verification
- [ ] Brewery admin dashboard accessible at `/brewery-admin`
- [ ] Owner can invite staff by email
- [ ] Verified badge displayed on brewery profile

## Notes (Riley — Infra)
> Staff app for QR scanning should be a lightweight PWA — no app store dependency. Accessible at `/staff/[brewery_id]` with a staff-role JWT. Works offline for QR validation via cached public key.

---

## RTM Links

### Implementation
[lib/brand-auth](../../lib/), [app/(brewery)/](../../app/)

### Tests
[brand-auth.test.ts](../../lib/__tests__/brand-auth.test.ts)

### History
- [retro](../history/retros/sprint-14-retro.md)
- [plan](../history/plans/sprint-14-plan.md)

> Added 2026-04-15 during the wiki reorg — see the [RTM](README.md) for the master table.
