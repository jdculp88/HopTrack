# HopTrack Product Meeting — Kickoff
**Date:** 2026-03-23
**Type:** Product Planning

## Attendees
- **Morgan** — Project Owner
- **Sam** — Business Analyst
- **Alex** — UI/UX Expert
- **Jordan** — Dev Lead
- **Riley** — Infrastructure Lead
- *(Casey — QA Engineer, joining soon)*

---

## Context
MVP is live. Core loop functional: check-in → XP → brewery tracking. Two distinct user types identified: **consumers** (beer drinkers) and **businesses** (breweries). Platform strategy emerging.

---

## Decisions & Initiatives

### 🔴 Now — Low Hanging Fruit
| # | Feature | Owner | Notes |
|---|---------|-------|-------|
| 1 | Light theme toggle | Alex + Jordan | Warm off-whites (#FAF7F2), same gold accent. CSS variable token swap on `data-theme`. |
| 2 | Brewery images | Jordan + Riley | Supabase Storage + Unsplash API fallback. Cache URL in DB row. |
| 3 | Favorite beer in profile | Jordan | Manual override; fallback to highest check-in count beer. Prompt after 3+ check-ins on one beer. |
| 4 | High-quality profile banner | Alex + Jordan | Unsplash API keyed on home city / top brewery type. User upload overrides. |

### 🟡 Next Sprint
| # | Feature | Owner | Notes |
|---|---------|-------|-------|
| 5 | Brewery accounts + validation | All | New `brewery_accounts` + `brewery_claims` tables. Email domain fast path; document upload fallback. Separate `(brewery)` route group. |
| 6 | Loyalty system | Sam + Jordan | `loyalty_programs`, `loyalty_cards`, `loyalty_rewards` tables. QR code redemption. Brewery-controlled rules. |
| 7 | Slow seller promotions | Sam + Jordan | `promotions` table. Brewery pushes discount offers. Gold 'DEAL' badge on beer cards. |
| 8 | "How American Are You" achievement | Jordan | `is_domestic` flag on beers. Parallel achievement track — does NOT count toward brewery/variety goals. Tiers: Domestic Curious → Red White & Brew → All-American → Uncle Sam. |

### 🟢 Later
| # | Feature | Owner | Notes |
|---|---------|-------|-------|
| 9 | Wrapped-style recaps (weekly/monthly/yearly) | Riley + Jordan | Supabase cron Edge Functions. Shareable PNG via `satori`. Drops Jan 1 for yearly. |
| 10 | TV display / video board app | Alex + Jordan | PWA at `/display/[brewery_id]`. Supabase Realtime. Read-only display token scoped to brewery. Kiosk mode (Chromebook / Fire Stick). |
| 11 | Brewery location insights | Sam + Riley | Aggregate style trends by geo. Weekly email to brewery admins. Premium tier feature. |

---

## Other Decisions
- **Domestic beers:** Do NOT count toward unique_beers, unique_breweries, or explorer/variety achievements. Parallel track only.
- **Profile favorite beer:** Show manual selection if set; else highest check-in count. Ghost card CTA if neither.
- **Brewery validation tiers:** Bronze (domain match) → Silver (document upload) → Gold (manual review). Verification badge on brewery profile.
- **TV display auth:** QR code enrolls TV as read-only token scoped to brewery_id. No login screen needed.
- **Premium tier anchor features:** Wrapped recaps, TV display, brewery location insights.

---

## Action Items
- [ ] Jordan: Implement light theme toggle + CSS variable system
- [ ] Alex + Jordan: Profile banner with Unsplash fallback
- [ ] Jordan: Favorite beer profile logic
- [ ] Sam: Draft requirements doc for Loyalty System
- [ ] Riley: Spec Supabase Storage setup for brewery images
- [ ] Morgan: Define brewery account pricing tiers
- [ ] All: Welcome Casey (QA) next sprint

---

## Next Meeting
TBD — end of first implementation sprint
