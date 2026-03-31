# HopTrack URL Reference
**Last Updated:** 2026-03-24 (Sprint 6)
**Dev Server:** `http://localhost:3000`
**Production:** TBD (Vercel)

> This document is updated every sprint as new routes ship. Always current.

---

## 🌐 Public / Marketing

| URL | Description | Auth Required | Status |
|-----|-------------|:---:|--------|
| `/` | Landing page — hero, features, CTA, footer | ❌ | ✅ Live |

---

## 🔐 Auth

| URL | Description | Auth Required | Status |
|-----|-------------|:---:|--------|
| `/login` | Email/password + Google OAuth sign in | ❌ | ✅ Live |
| `/signup` | 2-step registration (account → profile) | ❌ | ✅ Live |
| `/auth/callback` | OAuth redirect handler | ❌ | ✅ Live |

---

## 📱 Consumer App — Main Routes

| URL | Description | Auth Required | Status |
|-----|-------------|:---:|--------|
| `/home` | Social feed, XP bar, weekly stats, check-in cards | ✅ | ✅ Live |
| `/explore` | Brewery discovery, search, list/map toggle | ✅ | ✅ Live |
| `/friends` | Leaderboards, friend list, pending requests | ✅ | ✅ Live |
| `/achievements` | Achievement grid, tier filters, progress | ✅ | ✅ Live |
| `/notifications` | Activity notifications, mark-all-read | ✅ | ✅ Live |
| `/settings` | Profile editor, theme toggle, sign out | ✅ | ✅ Live |

---

## 📱 Consumer App — Dynamic Routes

| URL Pattern | Description | Auth Required | Status |
|-------------|-------------|:---:|--------|
| `/profile/[username]` | User profile — banner, stats, achievements, beer journal | ✅ | ✅ Live |
| `/brewery/[id]` | Brewery detail — hero, stats bar, tap list, loyalty card, top visitors | ✅ | ✅ Live |
| `/beer/[id]` | Beer detail — ratings, flavor cloud, check-in feed | ✅ | ✅ Live |

**Example URLs (test brewery):**
- [`/brewery/a1b2c3d4-e5f6-7890-abcd-ef1234567890`](http://localhost:3000/brewery/a1b2c3d4-e5f6-7890-abcd-ef1234567890) — Pint & Pixel Brewing Co.

---

## 🏭 Brewery Admin Dashboard

> Access via `/brewery-admin` — redirects to your first brewery or `/brewery-admin/claim`.
> Unverified accounts see a "Pending Verification" badge but have full dashboard access.
> Test brewery ID: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

| URL Pattern | Description | Auth Required | Status |
|-------------|-------------|:---:|--------|
| `/brewery-admin` | Auto-redirects to first brewery or claim page | ✅ + Brewery Account | ✅ Live |
| `/brewery-admin/claim` | Search + claim a brewery, submit verification | ✅ | ✅ Live |
| `/brewery-admin/[brewery_id]` | Overview — stats, recent check-ins, loyalty, promotions | ✅ + Brewery Account | ✅ Live |
| `/brewery-admin/[brewery_id]/tap-list` | Manage beers — add, edit, toggle on/off tap | ✅ + Brewery Account | ✅ Live |
| `/brewery-admin/[brewery_id]/analytics` | Charts — daily trend, DOW, top beers, styles, ratings | ✅ + Brewery Account | ✅ Live |
| `/brewery-admin/[brewery_id]/loyalty` | Loyalty programs + promotions builder | ✅ + Brewery Account | ✅ Live |
| `/brewery-admin/[brewery_id]/settings` | Edit brewery profile, danger zone | ✅ + Brewery Account | ✅ Live |

**Quick Links (Pint & Pixel test brewery):**
- [`/brewery-admin/a1b2c3d4-e5f6-7890-abcd-ef1234567890`](http://localhost:3000/brewery-admin/a1b2c3d4-e5f6-7890-abcd-ef1234567890) — Overview
- [`/brewery-admin/a1b2c3d4-e5f6-7890-abcd-ef1234567890/tap-list`](http://localhost:3000/brewery-admin/a1b2c3d4-e5f6-7890-abcd-ef1234567890/tap-list) — Tap List
- [`/brewery-admin/a1b2c3d4-e5f6-7890-abcd-ef1234567890/analytics`](http://localhost:3000/brewery-admin/a1b2c3d4-e5f6-7890-abcd-ef1234567890/analytics) — Analytics
- [`/brewery-admin/a1b2c3d4-e5f6-7890-abcd-ef1234567890/loyalty`](http://localhost:3000/brewery-admin/a1b2c3d4-e5f6-7890-abcd-ef1234567890/loyalty) — Loyalty & Promotions
- [`/brewery-admin/a1b2c3d4-e5f6-7890-abcd-ef1234567890/settings`](http://localhost:3000/brewery-admin/a1b2c3d4-e5f6-7890-abcd-ef1234567890/settings) — Settings

---

## 🔴 Superadmin Panel

> Requires `is_superadmin = true` on your profile. Redirects to `/home` if not authorized.
> Every mutating action is audit-logged to the `admin_actions` table.

| URL | Description | Auth Required | Status |
|-----|-------------|:---:|--------|
| `/superadmin` | Platform overview — 6 stat cards, recent admin actions | ✅ + Superadmin | ✅ Live |
| `/superadmin/claims` | Brewery claims queue — approve / reject with audit log | ✅ + Superadmin | ✅ Live |
| `/superadmin/users` | All users — search, paginated, superadmin badges | ✅ + Superadmin | ✅ Live |
| `/superadmin/breweries` | All breweries — manage, verify | ✅ + Superadmin | 🚧 Sprint 7 |
| `/superadmin/content` | Moderate check-ins, reviews, flags | ✅ + Superadmin | 🚧 Sprint 7 |
| `/superadmin/stats` | Platform-wide analytics | ✅ + Superadmin | 🚧 Sprint 7 |

**Quick Links:**
- [`/superadmin`](http://localhost:3000/superadmin) — Overview
- [`/superadmin/claims`](http://localhost:3000/superadmin/claims) — Claims Queue
- [`/superadmin/users`](http://localhost:3000/superadmin/users) — User Management

**Grant superadmin access:**
```sql
UPDATE profiles SET is_superadmin = true WHERE id = 'YOUR-UUID-HERE';
```

---

## 🔌 API Routes

### Consumer API
| Method | URL | Description | Auth | Status |
|--------|-----|-------------|:---:|--------|
| `GET` | `/api/checkins` | Paginated feed of check-ins | ✅ | ✅ Live |
| `POST` | `/api/checkins` | Create check-in, award XP, auto-stamp loyalty card | ✅ | ✅ Live |
| `GET` | `/api/breweries` | Search/nearby breweries (Open Brewery DB + cache) | ✅ | ✅ Live |
| `POST` | `/api/breweries` | Create a brewery | ✅ | ✅ Live |
| `GET` | `/api/beers` | Beers by brewery, search, style filter | ✅ | ✅ Live |
| `POST` | `/api/beers` | Create beer — brewery accounts only (403 otherwise) | ✅ + Brewery | ✅ Live |
| `GET` | `/api/profiles` | Search profiles or get own profile | ✅ | ✅ Live |
| `PATCH` | `/api/profiles` | Update profile fields | ✅ | ✅ Live |
| `GET` | `/api/friends` | List friendships + pending requests | ✅ | ✅ Live |
| `POST` | `/api/friends` | Send friend request | ✅ | ✅ Live |
| `PATCH` | `/api/friends` | Accept / block request | ✅ | ✅ Live |
| `DELETE` | `/api/friends` | Remove friendship | ✅ | ✅ Live |

### Brewery Admin API
| Method | URL | Description | Auth | Status |
|--------|-----|-------------|:---:|--------|
| `POST` | `/api/brewery-claims` | Submit a brewery claim for verification | ✅ | ✅ Live |

### Superadmin API
| Method | URL | Description | Auth | Status |
|--------|-----|-------------|:---:|--------|
| `PATCH` | `/api/admin/claims` | Approve or reject a brewery claim | ✅ + Superadmin | ✅ Live |
| `GET` | `/api/admin/stats` | Platform-wide stats | ✅ + Superadmin | ✅ Live |

### Planned API
| Method | URL | Description | Sprint |
|--------|-----|-------------|--------|
| `POST` | `/api/loyalty/redeem` | Redeem loyalty reward via QR | Sprint 7 |
| `GET` | `/api/recap/[user_id]` | Generate Pint Rewind data | Sprint 7 |
| `GET` | `/api/insights/[brewery_id]` | Brewery location intelligence | Sprint 8 |

---

## 🚧 Planned Pages

| URL | Description | Sprint | Priority |
|-----|-------------|--------|----------|
| `/display/[brewery_id]` | The Board — live TV taproom display | Sprint 8 | 🟠 Medium |
| `/recap/[period]` | Pint Rewind — shareable recap | Sprint 7 | 🟡 Medium |
| `/for-breweries` | Marketing landing for brewery owners | Sprint 7 | 🟡 Medium |
| `/superadmin/breweries` | Brewery management panel | Sprint 7 | 🔴 High |
| `/superadmin/content` | Content moderation | Sprint 7 | 🟠 Medium |

---

## 🚀 How to Run

```bash
npm install          # First time only
npm run dev          # Start dev server → http://localhost:3000
npm run dev:check    # Health check after restart
npm run dev:fresh    # Clean build (clears .next cache)
npx tsc --noEmit     # TypeScript check
```

---

## 🗄️ Database Setup — Run in Order in Supabase SQL Editor

| Step | File | Description |
|------|------|-------------|
| 1 | `supabase/schema.sql` | All 11 tables + RLS + triggers |
| 2 | `supabase/seeds/seed.sql` | 35 achievement definitions |
| 3 | `supabase/migrations/001_brewery_accounts.sql` | Brewery accounts, loyalty, promotions, claims |
| 4 | `supabase/migrations/002_superadmin.sql` | Superadmin role + audit log |
| 5 | `supabase/seeds/002_test_brewery.sql` | Pint & Pixel brewery + beers |
| 6 | `supabase/seeds/003_test_activity.sql` | Month 1 — 71 check-ins, 12 users |
| 7 | `supabase/seeds/004_brewery_branding.sql` | Beer images + rich descriptions |
| 8 | `supabase/seeds/005_user_avatars.sql` | User avatars + bios |
| 9 | `supabase/seeds/006_month2_activity.sql` | Month 2 — ~80 check-ins (Feb data) |

**Post-migration setup:**
```sql
-- Grant yourself superadmin
UPDATE profiles SET is_superadmin = true WHERE id = 'YOUR-UUID';

-- Link yourself to test brewery as owner
INSERT INTO brewery_accounts (user_id, brewery_id, role, verified, verified_at)
VALUES ('YOUR-UUID', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'owner', true, now())
ON CONFLICT (user_id, brewery_id) DO UPDATE SET role = 'owner', verified = true;
```

---

## 🗄️ Supabase Dashboard

| Resource | URL |
|----------|-----|
| Dashboard | https://supabase.com/dashboard/project/uadjtanoyvalnmlbnzxk |
| SQL Editor | https://supabase.com/dashboard/project/uadjtanoyvalnmlbnzxk/sql |
| Auth Users | https://supabase.com/dashboard/project/uadjtanoyvalnmlbnzxk/auth/users |
| Storage | https://supabase.com/dashboard/project/uadjtanoyvalnmlbnzxk/storage/buckets |
| Table Editor | https://supabase.com/dashboard/project/uadjtanoyvalnmlbnzxk/editor |
| API Docs | https://supabase.com/dashboard/project/uadjtanoyvalnmlbnzxk/api |

---

## 📁 Key Files Quick Reference

| What | Path |
|------|------|
| Global styles + theme tokens | `app/globals.css` |
| Root layout + fonts | `app/layout.tsx` |
| Route protection proxy | `proxy.ts` |
| DB types | `types/database.ts` |
| Supabase browser client | `lib/supabase/client.ts` |
| Supabase server client | `lib/supabase/server.ts` |
| XP + leveling system | `lib/xp/index.ts` |
| Achievement definitions (35) | `lib/achievements/definitions.ts` |
| Open Brewery DB client | `lib/openbrewerydb/index.ts` |
| Theme provider | `components/theme/ThemeProvider.tsx` |
| Theme toggle | `components/theme/ThemeToggle.tsx` |
| App navigation | `components/layout/AppNav.tsx` |
| Brewery admin nav | `components/brewery-admin/BreweryAdminNav.tsx` |
| Superadmin nav | `components/superadmin/SuperadminNav.tsx` |
| Check-in modal | `components/checkin/CheckinModal.tsx` |
| Loyalty stamp card | `components/loyalty/LoyaltyStampCard.tsx` |
| Star rating | `components/ui/StarRating.tsx` |
| Schema | `supabase/schema.sql` |
| Migration 001 | `supabase/migrations/001_brewery_accounts.sql` |
| Migration 002 | `supabase/migrations/002_superadmin.sql` |
| Roadmap | `docs/roadmap.md` |
| Brand identity | `docs/strategy/BRAND-IDENTITY-V1.md` |
| Competitive analysis | `docs/strategy/competitive-differentiation.md` |
| Sales playbook | `docs/sales/sales-playbook-v1.md` |
| Bug log | `docs/bugs/BUG-LOG.md` |
| Requirements | `docs/requirements/` |
| Meeting notes | `docs/meetings/` |
| Validation reports | `docs/validation/` |

---

*Updated every sprint. Last updated Sprint 6 — Jordan.*
