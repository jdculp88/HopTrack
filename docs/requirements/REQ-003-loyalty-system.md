# REQ-003 — Brewery Loyalty System
**Status:** Planned
**Priority:** Next Sprint
**Owner:** Sam (BA), Jordan (Dev), Riley (Infra)
**Sprint:** 2

## Summary
Breweries can create and manage loyalty programs. Consumers earn stamps on check-ins and redeem rewards. Digital replacement for paper punch cards with dynamic discount capabilities.

## Brewery Controls
- Create loyalty program with custom rules (e.g. "every 5th check-in = free pint")
- Set discount offers: percent off, fixed amount off, BOGO, free item
- Set redemption limits and expiry dates
- Push targeted offers to users who have previously visited
- Toggle program active/inactive

## Consumer Experience
- Loyalty card visible on brewery detail page and in user profile
- Stamps animate in on each qualifying check-in
- Redemption: one tap → QR code → staff scans → reward applied
- Notification when reward is earned

## Schema Additions
```sql
loyalty_programs (id, brewery_id, name, stamps_required, reward_description, is_active, created_at)
loyalty_cards    (id, user_id, brewery_id, stamp_count, lifetime_stamps, created_at, updated_at)
loyalty_rewards  (id, user_id, brewery_id, program_id, earned_at, redeemed_at, qr_token)
promotions       (id, brewery_id, beer_id, title, discount_type, discount_value, starts_at, ends_at, redemption_limit, redemptions_count)
```

## QR Redemption Flow
1. User taps "Redeem" on earned reward
2. App generates QR encoding signed JWT: `{user_id, brewery_id, reward_id, exp: +5min}`
3. Staff scans QR with brewery staff PWA
4. Server validates JWT, marks reward redeemed
5. Both user and brewery see confirmation

## Acceptance Criteria
- [ ] Brewery admin can create/edit/delete loyalty programs
- [ ] Stamps increment automatically on qualifying check-ins
- [ ] QR code generated for earned rewards
- [ ] Staff PWA (or web page) can scan and validate QR
- [ ] Redemption is idempotent (double-scan does nothing)
- [ ] Push notification when stamp milestone reached
- [ ] Promotions appear on beer cards with 'DEAL' badge and countdown

## Notes (Sam — BA)
> Loyalty programs are the primary hook for brewery account upgrades. Free tier gets 1 active program. Paid tier gets unlimited programs + targeted push offers + analytics dashboard.
