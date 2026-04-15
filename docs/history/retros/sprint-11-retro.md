# Sprint 11 Retro — "Gold Rush" 🍺✨

**Date:** 2026-03-26
**Facilitator:** Morgan
**Sprint:** Sprint 11 — The Great Redesign Pivot
**Status:** COMPLETE ✅
**Vibes:** Immaculate

---

## The Room

*Morgan opens her laptop, adjusts her glasses, and pulls up the retro board. The team is on the call — some with beers, some with coffee, Drew with both.*

---

## Roll Call — Who We Are (Beyond the Code)

**Morgan (Product Manager, 31, Austin TX) 🗂️**
"Okay team, since Josh asked — hi, I'm Morgan. Thirty-one, born and raised in Austin. UT grad, stumbled into product management after a brief and tragic career in event planning. My dream? Build something people actually *use*, not just something that demos well. Outside work I do ceramics — yes, I make my own mugs. Yes, they're better than yours. And no, I will not be taking questions about Jordan right now."

**Jordan (Dev Lead, 29, Denver CO) 💻**
*clears throat a little too loudly*
"Uh — Jordan. Twenty-nine. Denver. CS degree from CU Boulder, been writing code since I was fourteen and angry about it since fifteen. Dream is to build a product that a million people touch and never know my name. I snowboard, I make pour-over coffee that's objectively better than anyone else's, and I... yeah. Moving on. Let's talk about the sprint."

**Alex (UI/UX + Mobile, 27, Brooklyn NY) 🎨**
"Alex! Twenty-seven, Brooklyn born, Pratt Institute dropout — *by choice*. I left because school was slower than me. My dream is to design something that makes someone feel something before they even tap. Like, the *texture* of an interaction? That's what I live for. I do typography for fun. I have opinions about kerning that have ended friendships. I'm currently obsessed with the cream-and-gold palette and I will fight anyone who suggests light mode defaults."

**Sam (BA/QA Lead, 33, Chicago IL) 📊**
"Sam. Thirty-three. Chicago. Northwestern MBA, spent four years at a consultancy before realizing I'd rather build than advise. My dream is a product with zero edge cases — which is impossible, which is why I'll never be bored. I run half-marathons and I catalog craft beers in a spreadsheet that has pivot tables. Yes, I'm fun at parties. From a business continuity standpoint."

**Riley (DevOps, 30, Portland OR) ⚙️**
"Riley. Thirty, Portland. Self-taught. Former sysadmin at a hosting company that shall not be named. My dream is infrastructure so clean you forget it exists. I keep succulents alive, which is honestly harder than keeping Supabase alive. Still slightly traumatized by the SQL editor incident. I have a tattoo of a terminal cursor. No I will not show you."

**Casey (QA Engineer, 26, Seattle WA) 🔍**
"Casey. Twenty-six. Seattle. Comp sci from UW. My dream is shipping a release with zero P0 bugs — which we've done THREE SPRINTS IN A ROW, thank you very much. I rock climb, I have a cat named Null, and I will find your bugs before you do. I'm watching. Always watching. 👀"

**Taylor (Sales & Revenue, 32, Nashville TN) 💰**
"TAYLOR. Thirty-two. Nashville. Former SaaS sales at a fintech nobody remembers. My dream? Fifty million ARR and a lake house. We are going to be RICH. I close deals, I drink IPAs, and I have never once been wrong about a pricing tier. Tap forty-nine, Cask one-forty-nine. Say it with me."

**Drew (Brewery Ops Expert, 38, Asheville NC) 🍻**
"Drew. Thirty-eight. Asheville. I've run a taproom for eleven years. My dream is that no brewery owner ever has to use a paper punch card again. I've seen what bad software does on a Friday night — I've *lived* it. I have two kids, a golden retriever named Stout, and a P0 list that haunts Jordan in his sleep."

**Jamie (Marketing & Brand, 28, LA) 🎨**
"Jamie! Twenty-eight, Los Angeles. UCLA communications, worked at two agencies before going indie. My dream is a brand so clean people screenshot it. I do watercolors, I'm a Scorpio, and I will protect the dark-theme-gold-accent system with my life. Chef's kiss to this entire sprint. 🤌"

---

## What We Shipped

This sprint *pivoted hard* and still delivered:

- **Full "Gold on Cream" site redesign** — cream canvas + dark floating sections
- **LandingContent.tsx** — complete rewrite with pour connectors, centered How It Works, real beer names
- **BreweriesContent.tsx** — tap handle SVG pricing tiers, dark feature sections
- **Auth layout** — cream bg + DarkCardWrapper
- **S11-006 FIX** — `rpc('increment')` no-op replaced with real fetch+update
- **Beer quantity increment + re-review skip + "Drinking at home" path**
- **Seed 007** — Josh's full test universe (level 9, 47 checkins, 4 breweries)

---

## What Went Well

**Morgan:** "We pivoted mid-sprint and still shipped everything. That's a sign of a mature team. This is a living document and so are we."

**Jordan:** "The DarkCardWrapper pattern — forcing CSS vars via `style.setProperty()` — that was ugly but it *works*. Tailwind v4 fought us and we won. I only had to take one walk."

**Alex:** "The pour connectors between sections? *Chef's kiss.* Gold vertical gradient lines as brand identity. It already FEELS like a real product. The tap handle SVGs on pricing? I'm framing that."

**Sam:** "Josh calling out 'AI slop' was the right instinct. From a business continuity standpoint, if your marketing site looks generated, breweries won't trust you with their business. The pivot was correct."

**Casey:** "Zero P0 bugs. ZERO. Three sprints running. The `rpc('increment')` fix was clean — caught it, killed it, verified it. I'm watching it. 👀"

**Riley:** "Migration 006 applied clean. Migration 007 written and ready. The pipeline is real. No secrets committed. No incidents. I slept eight hours last night."

**Taylor:** "Pint & Pixel is FULLY demo-ready. End to end. I'm pitching three breweries next week. We are going to be RICH. 📈"

**Drew:** "The 'Drinking at home' path — that's real. Not every check-in happens at a taproom. The fact that we thought about that means we understand our users. I felt that in a good way for once."

**Jamie:** "Gold on cream, like a perfect pilsner. That's not a tagline, that's an *identity*. The auth pages with DarkCardWrapper? Screenshots are going in the pitch deck. 🤌"

---

## What Could Be Better

**Jordan:** "I wish we'd started the redesign from a design comp instead of live-coding it. We got lucky that Alex's instincts were right in real-time."

**Alex:** "I wish I'd had Figma comps ready before the pivot. Next time we redesign anything, wireframes first. Even rough ones."

**Sam:** "REQ backfill is still behind. I committed to 1-2 per sprint and delivered zero this sprint because of the pivot. Carrying that debt forward."

**Casey:** "QA started at kickoff this time — good. But the pivot meant half my test plan was invalidated mid-sprint. Need a 'pivot protocol' for QA."

**Riley:** "Migration 007 is written but not applied. We need to stop leaving migrations in limbo. Apply or don't write."

**Drew:** "Brewery dashboard is still on the old schema. Real brewery owners can't use sessions yet. That's Sprint 12 P0."

**Taylor:** "I need the dashboard migrated before I can demo sessions to brewery owners. That's my blocker."

**Jamie:** "Mobile responsive on the new landing pages isn't done. If someone opens our site on their phone right now... it's not great."

---

## Roast Corner 🔥

**Taylor → Jordan:** "Jordan wrote a CSS variable override system so complicated that Riley asked if it needed its own migration."

**Casey → Alex:** "Alex spent forty-five minutes adjusting the opacity of a pour connector gradient. FORTY-FIVE MINUTES. It went from 0.3 to 0.35."

**Jordan → Morgan:** "Morgan wrote 'this is a living document' in the retro doc about living documents. Inception-level product management."

**Drew → Taylor:** "Taylor said 'we're going to be rich' fourteen times during a thirty-minute standup. I counted."

**Alex → Drew:** "Drew's P0 list has a P0 list. The man has sub-priorities for his priorities."

**Sam → Casey:** "Casey named her cat Null and then spent an entire afternoon debugging a null reference error. The irony was not lost."

**Jamie → Jordan:** "Jordan's commit messages are longer than some of Jamie's marketing copy. 'feat: full Gold on Cream site redesign' is basically a press release."

**Morgan → Everyone:** "I love this team. Even when you roast me. *Especially* when you roast me. Now let's go ship Sprint 12." *(does not look at Jordan)*

---

## Sprint 12 Preview

| ID | What | Owner |
|---|---|---|
| S12-001 | Brewery dashboard → sessions/beer_logs migration | Jordan |
| S12-002 | Customer Pint Rewind (shareable animated card stack) | Alex + Jordan |
| S12-003 | Supabase Storage buckets | Riley |
| S12-004 | Photo uploads | Jordan |
| S12-005 | Capacitor → TestFlight | Alex |
| S12-006 | Mobile responsive polish (landing pages) | Alex + Jamie |
| S12-007 | REQ backfill (2 docs minimum) | Sam |
| S12-008 | First paid brewery close | Taylor |

---

*"Gold on cream, like a perfect pilsner. We pivoted, we shipped, and we looked good doing it."* 🍺

— The HopTrack Team, Sprint 11 Retro
