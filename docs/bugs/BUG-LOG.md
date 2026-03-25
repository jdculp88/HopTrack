
---

## BUG-004 — Hydration Mismatch on Body Element
**Status:** ✅ Fixed
**Found by:** User (screenshot)
**Date:** 2026-03-24
**Severity:** Low (warning only, no UX impact)

### Description
React hydration error caused by browser extensions (Grammarly, others) injecting `data-*` attributes onto the `<body>` tag after server render. Client HTML doesn't match server HTML, triggering React's hydration warning overlay in development.

### Root Cause
Browser extensions modify the DOM before React hydrates. Common culprits: Grammarly (`data-gr-ext-installed`), password managers, ad blockers.

### Fix
Added `suppressHydrationWarning` to `<body>` in `app/layout.tsx`. This tells React to ignore attribute mismatches on the body element — safe because these attributes come from extensions, not our code.

### File Changed
- `app/layout.tsx` line 52

---

## BUG-005 — Unconfigured Image Host: i.pravatar.cc
**Status:** ✅ Fixed
**Found by:** User (screenshot)
**Date:** 2026-03-24
**Severity:** High (runtime crash — broke brewery pages with test user avatars)

### Description
Next.js `<Image>` component threw a runtime error when loading avatar URLs from `i.pravatar.cc` because the hostname was not in the `remotePatterns` allowlist in `next.config.ts`.

### Root Cause
Seed 005 added avatar URLs using `https://i.pravatar.cc/150?u=[email]` for all 12 test users. The `next.config.ts` only allowed `images.unsplash.com`, `*.supabase.co`, and `lh3.googleusercontent.com`.

### Fix
Added `i.pravatar.cc` to `remotePatterns` in `next.config.ts`.

### File Changed
- `next.config.ts` — added pravatar hostname to `images.remotePatterns`

### Notes
- Casey: add "verify all new image domains are in next.config.ts remotePatterns" to the pre-PR checklist

---

## BUG-006 — Banner Text Not Readable Over Hero Image
**Status:** ✅ Fixed
**Found by:** User (screenshot)
**Date:** 2026-03-24
**Severity:** Medium (brand/readability issue)

### Description
Brewery name and location text on the hero banner was not legible against the cover photo. The gradient overlay was too weak in the middle (`via-[#0F0E0C]/30`), letting too much of the image show through behind the text.

### Fix
Strengthened the gradient: `via-[#0F0E0C]/60 to-[#0F0E0C]/20` — darker in the mid-section where text lives, lighter at the top to preserve the image.

### File Changed
- `app/(app)/brewery/[id]/page.tsx` line 73

---

## BUG-007 — Kernel Panic Porter Showing Wrong Image (Squirrel 🐿️)
**Status:** ✅ Fixed
**Found by:** User (screenshot)
**Date:** 2026-03-24
**Severity:** Low (test data / cosmetic)

### Description
The Unsplash photo ID used for Kernel Panic Porter returned an unrelated photo (a squirrel) instead of a dark beer. Unsplash photo IDs are not stable across all query parameters.

### Fix
Replaced with a verified dark porter/stout image URL.

### Files Changed
- `supabase/seeds/004_brewery_branding.sql`
- Fix SQL run directly in Supabase

---

## BUG-008 — Stack Overflow Sour Image Failed to Load
**Status:** ✅ Fixed
**Found by:** User (screenshot)
**Date:** 2026-03-24
**Severity:** Low (test data / cosmetic)

### Description
The cover image for Stack Overflow Sour failed to load — the Unsplash URL returned a 404 or non-image response.

### Fix
Replaced with a verified sour/fruited beer image URL.

### Files Changed
- `supabase/seeds/004_brewery_branding.sql`
- Fix SQL run directly in Supabase

### Notes
Casey: add "verify all Unsplash image URLs return expected content before merging seed files" to QA checklist.
