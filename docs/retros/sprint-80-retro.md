# Sprint 80 Retro — The Untappd Killer
**Facilitated by Morgan** 🗂️ | Sprint Date: 2026-03-31

---

## What We Shipped

Sprint 80 delivered the embeddable beer menu widget system — the feature that makes breweries switch from Untappd.

| Deliverable | Status |
|---|---|
| Embeddable Beer Menu Widget (`/embed/[brewery_id]/menu`) | Shipped |
| Public API (`/api/public/brewery/[id]/menu`) | Shipped |
| Embed Script (`public/embed.js`) | Shipped |
| Brewery Admin Embed Configurator (`brewery-admin/[id]/embed`) | Shipped |
| Embed button on Tap List page | Shipped |
| Test/Preview Page (`/embed/test`) | Shipped |
| Brewery Profile Redesign (`brewery-welcome/[id]`) | Shipped |
| Heist Brewery — 35 beers seeded (Migration 052) | Shipped |
| Style grouping with section headers | Shipped |
| Style pill tags (color-coded by family) | Shipped |
| CORS + iframe headers in `next.config.ts` | Shipped |
| Dashboard redirect loop fix (P0 bug) | Shipped |
| `scroll-behavior: smooth` Next.js 16 fix | Shipped |

---

## The Bug — Post-Mortem

### What happened
The brewery admin dashboard was caught in an infinite redirect loop — blinking on and off, never loading. The server logs showed `GET /brewery-admin/[id]` and `GET /brewery-admin` alternating every ~1 second, hammering the server endlessly.

### Root cause
**The dashboard page was querying a column that doesn't exist on the table.**

In `app/(brewery-admin)/brewery-admin/[brewery_id]/page.tsx`, line 31:
```typescript
.select("role, verified, subscription_tier")
.eq("user_id", user.id)
.eq("brewery_id", brewery_id)
.single()
```

`subscription_tier` lives on the **`breweries`** table (added in Migration 045). It does NOT exist on `brewery_accounts`. PostgREST returned an error (400: column not found), `.single()` resolved to `{ data: null }`, and the page hit:
```typescript
if (!account) redirect("/brewery-admin");
```

This sent the user to `/brewery-admin/page.tsx` (the index), which queries `brewery_accounts` correctly (without `subscription_tier`), finds the account, and redirects right back to `/brewery-admin/[id]`. Infinite loop.

### Contributing factor
**Next.js 16's `scroll-behavior: smooth` detection.** Our `globals.css` has `html { scroll-behavior: smooth; }` without the corresponding `data-scroll-behavior="smooth"` attribute on `<html>`. Next.js 16 detects this mismatch and triggers route transition interference, which amplified the redirect loop by causing additional re-navigations.

### Why it wasn't caught earlier
1. The column mismatch was introduced in Sprint 79 when the ROI card was wired in — `subscription_tier` was needed for tier-aware ROI calculations, but it was read from `account` instead of `brewery`
2. The bug may have been intermittent — sometimes PostgREST caches schema and the query might have worked if the column name was coincidentally valid in cache
3. No unit test covers the dashboard page's account query
4. The redirect went to `/brewery-admin` which has its own redirect back — the loop made it hard to see the actual error

### The fix (3 changes)
1. **Removed `subscription_tier` from the `brewery_accounts` query** — read it from `brewery` instead (where it actually lives)
2. **Changed `.single()` to `.maybeSingle()`** — prevents PostgREST error on 0 rows
3. **Changed fallback redirect from `/brewery-admin` to `/brewery-admin/claim`** — breaks the redirect cycle (claim page has a different exit path)
4. **Added `data-scroll-behavior="smooth"` to `<html>`** — fixes Next.js 16 route transition interference

### How we prevent this
1. **Column-table validation:** When selecting from a table, verify the columns exist on THAT table, not a related one
2. **Redirect cycle awareness:** Never redirect from Page A → Page B if Page B redirects back to Page A under the same conditions
3. **PostgREST error logging:** Consider logging PostgREST errors in auth-check queries instead of silently redirecting

---

## Team Voices

**Morgan** 🗂️: "We shipped an entire embed system AND found a P0 redirect loop AND fixed it in the same sprint. That's the kind of day that makes you love this team."

**Jordan** 🏛️: "The column mismatch is a pattern I've seen before — you add a field to one table, reference it from a query on a different table, and PostgREST doesn't catch it at build time. The fix is simple but the lesson is real: know your schema. I'm going to do a sweep of all `.select()` calls against their actual tables."

**Avery** 💻: "Built 15 files, seeded 35 beers, fixed a redirect loop, and the embed looks incredible. Already on it for the next one."

**Riley** ⚙️: "The `.single()` vs `.maybeSingle()` distinction is exactly the kind of thing that bites you in production. `.single()` is an assertion — it EXPECTS exactly one row. If you're not sure, use `.maybeSingle()`. I want to audit every `.single()` call in the codebase."

**Quinn** ⚙️: "The migration was clean. `subscription_tier` on `breweries` table, not `brewery_accounts`. The query was wrong from the start. Let me check the migration state first." *(classic Quinn)*

**Casey** 🔍: "Zero P0 bugs open right now. ZERO. We found one, we killed it, it's dead. The redirect loop was nasty — it was hammering the server with hundreds of requests per minute. In production that could have been a self-inflicted DDoS."

**Alex** 🎨: "The style pills look gorgeous. IPA green, stout espresso, sour berry — every beer has its color identity. The Playfair italic section headers with the accent-colored divider lines? *Chef's kiss.* This doesn't look like a beer menu widget. It looks like a premium restaurant menu."

**Taylor** 💰: "This is what we show Heist. 35 beers, grouped by style, color-coded pills, cream theme, 'Powered by HopTrack' footer. They paste two lines of code and their website has the best beer menu in Charlotte. We're going to be rich."

**Drew** 🍻: "I looked at Heist's Untappd embed and then I looked at ours. I felt that physically. Ours is so much better it's not even the same category. The style grouping alone — IPAs & Pale Ales, Lagers, Stouts, Sours — that's how a real taproom menu should read."

**Sam** 📊: "The redirect loop bug is a textbook case of 'query the wrong table, get null, redirect, loop.' From a business continuity standpoint, if this had hit production, brewery owners would have been locked out of their dashboard. Good catch, good fix, good post-mortem."

**Jamie** 🎨: "The embed test page with the mock browser chrome? The fake URL bar showing 'heistbrewery.com/beer-menu'? That's not just a tool — that's a sales demo. Screenshot that and put it in the pitch deck."

---

## Sprint 80 Numbers
- **Files created:** 15
- **Files modified:** 5
- **Migration:** 052 (35 Heist beers)
- **Beers seeded:** 35
- **Style families:** 6 (IPA, Lager, Stout, Sour, Porter, Saison)
- **Bugs fixed:** 2 (redirect loop + scroll-behavior)
- **Build status:** Clean
- **P0 bugs open:** 0

---

## What's Next — Sprint 81
TBD. The embed is shipped. Heist has beers. The dashboard works. Time to sell.

---

*"We can do better than this." — Joshua, looking at Untappd's embed. He was right.* 🍺
