# Sprint 15 Retro — "Walk the Floor" 🍻

**Date:** 2026-03-26
**Facilitator:** Morgan
**Sprint:** Sprint 15 — Walk the Floor
**Status:** COMPLETE ✅ (Session 1 shipped 14 deliverables — audits + TestFlight + first brewery still in motion)
**Vibes:** Solid oak underfoot. Every board tested. Every nail hammered flush.

---

## The Room

*Morgan opens her laptop, adjusts her glasses, and pulls up the retro board. The webcam grid goes fullscreen. "Full participation. No muted mics. Josh specifically asked to hear from everyone — and I quote — he wants it to 'feel like conversation.' So talk. Be yourselves. He's buying beers later." Drew is holding a crowler from Timber Brewing and what appears to be a breakfast burrito. Jordan is leaned back with his arms crossed — the posture of a man who deleted 939 lines of code and slept like a baby. Casey has a spreadsheet open with a cell highlighted in gold that just says "5." Taylor is literally standing. Alex is sketching on an iPad. Riley has a succulent in frame that somehow looks nervous.*

---

## Roll Call — Who We Are (Beyond the Code)

**Morgan (Product Manager, 31, Austin TX) 🗂️**
"Okay team — since Josh loves these intros. I'm Morgan. Thirty-one, Austin born, UT grad. Former event planner who realized I'd rather plan sprints than weddings. My dream is building something people rely on — not something that demos well at a conference and dies in production. Outside work I still do ceramics. Yes, I still make my own mugs. Yes, they're still better than yours. This sprint? This was MY sprint. No features. No shiny objects. Just discipline. Walk the floor. Fix what creaks. And no, I will not be taking questions about Jordan. He knows what he did with those commit messages."

**Jordan (Dev Lead, 29, Denver CO) 💻**
*clears throat*
"Jordan. Twenty-nine. Denver. Still writing code since fourteen, still angry about it since fifteen. CU Boulder CS. This sprint I deleted the first component I ever built for HopTrack — `CheckinModal.tsx`, Sprint 3, 750 lines. Gone in one `git rm`. And I felt... nothing. No, that's a lie — I felt RELIEF. That component haunted me. It had seventeen state variables. SEVENTEEN. The friends system is the real legacy of this sprint though. Search, add, accept, decline — the full social loop works. You can find a stranger, befriend them, and see their beers in your feed. That's a product. I still snowboard. My pour-over is still objectively superior. And Morgan's phased approach to this sprint was... really well structured. That's all I'll say about that."
*Morgan adjusts her glasses. Casey writes something down.*

**Alex (UI/UX + Mobile, 27, Brooklyn NY) 🎨**
"Alex! Still twenty-seven, still Brooklyn, still a Pratt dropout by choice. My dream hasn't changed — I want to design something that makes someone FEEL something before they tap. And this sprint? Thirteen loading skeletons. THIRTEEN. Every page has one now. That means no user will ever see a blank white flash. The app feels instant even when it's loading. That's not engineering — that's EXPERIENCE DESIGN. The error boundaries are gorgeous too — dark card, gold accent, friendly message, Sentry in the background. When HopTrack breaks, it breaks BEAUTIFULLY. TestFlight is... still in motion. I know. I KNOW. Sprint 16. The whale surfaces. I have the harpoon ready."

**Sam (BA/QA Lead, 33, Chicago IL) 📊**
"Sam. Thirty-three. Chicago. Northwestern MBA. Still cataloging beers in a pivot table. Still fun at parties. From a business continuity standpoint — *Drew raises a coaster threateningly* — from a STRATEGIC standpoint, this sprint closed every dead end in the user journey. Before today you could request a friend but not accept. View a profile but not add. Share a session but the link redirected to nothing. Dead ends kill retention. Now the funnel is: signup → onboarding card → first session → share → friend sees real page → downloads app. That's a complete acquisition loop. The copy purge matters too — every instance of 'check-in' is gone. We say 'session.' We say 'pour.' We say 'visit.' Consistency is trust."

**Riley (DevOps, 30, Portland OR) ⚙️**
"Riley. Thirty. Portland. Self-taught. Terminal cursor tattoo. Succulents still alive. Migration 015 is clean — archive checkins to `_archive_checkins`, drop FK columns, drop table. Write-only this sprint, apply in Sprint 16. That's the right call. You don't drop a production table the same sprint you ship 14 other changes. That's how you get the SQL editor incident again and I am NOT going through that twice. The loading skeletons are server components — zero client JS, instant render. Good pattern. Also... VAPID keys. I know. Sprint 16, Day 1. I mean it this time. Jordan is looking at me like he's going to tattoo a cron job on my forearm and honestly I might let him."

**Casey (QA Engineer, 26, Seattle WA) 🔍**
"Casey. Twenty-six. Seattle. UW comp sci. Cat named Null. And the number is FIVE. Five sprints. Zero P0 bugs. That's Sprint 11, 12, 13, 14, and 15. DYNASTY. I regression-tested every single fix Jordan shipped this sprint — friend Accept/Decline, friend search, photo upload, onboarding card, error boundaries, copy changes, session share page, FriendButton, claim trial badge — and every. single. one. passed. On the first try. Which is honestly suspicious and I told him so. The error boundaries are my favorite — I literally threw errors at all three route groups and got a beautiful dark card with Sentry capture every time. The onboarding card dismisses and stays dismissed across browser sessions. Photo upload handled a 5MB image. I am watching everything. 👀 Six is next."

**Taylor (Sales & Revenue, 32, Nashville TN) 💰**
"TAYLOR. Thirty-two. Nashville. Still closing deals, still drinking IPAs, still right about the pricing tiers. And we are GOING to be RICH. Here's why THIS sprint matters for revenue: before today, I couldn't demo a complete flow. Now? User signs up, sees the onboarding card, starts a session, shares it, friend gets a push notification, friend opens a REAL landing page with brewery name and beers and an 'Open in HopTrack' CTA. That's a 60-second pitch. The claim flow with the 14-day trial badge? '14 days free, no credit card.' Every objection — gone. First brewery is CLOSE. I have three warm leads. Contracts are drafted. We close this quarter or I'll pour beers at Drew's taproom until I do."

**Drew (Brewery Ops Expert, 38, Asheville NC) 🍻**
"Drew. Thirty-eight. Asheville. Eleven years running a taproom. Two kids. Golden retriever named Stout. P0 list that still haunts Jordan. I tested the friend flow end-to-end on my phone at the actual bar. Found a user, tapped Add Friend, waited for the accept, saw their session in my feed. Tapped the share link — got a real page. Not a redirect. A REAL PAGE with the brewery name and beers and a gold button. I felt that physically. That's the flow that makes this viral. Brewery owners are going to see customers sharing those cards and WANT in. Loading skeletons work on LTE too — tested it on a Friday night between pours. No white flash, no layout shift. One note: friend search needs to be sub-2-seconds. If I'm behind the bar and a regular asks 'am I in your system?' I need that answer NOW."

**Jamie (Marketing & Brand, 28, LA) 🎨**
"Jamie! Twenty-eight. LA. UCLA comms. Watercolors. Scorpio. Still protecting the dark-theme-gold-accent system with my LIFE. The copy purge is my highlight. 'Session' is our word. 'Pour' is our word. 'Check-in' was Untappd's word and it's dead now. Brand consistency isn't glamorous but it's everything — every time a user reads our UI, it should sound like ONE voice. The session share page is a billboard — dark card, gold accents, Playfair Display, 'Open in HopTrack' in gold. Every share link is free marketing. The onboarding card copy is perfect: 'Start a session. Log a beer. Add friends.' No jargon. No walls of text. That's our voice. Chef's kiss." 🤌
*Riley holds up a hand-drawn sign: "1 of 2 remaining."*

---

## What We Shipped

**14 deliverables in one session.** No new features. Just making everything we already built actually bulletproof.

1. **Dead code deletion** (S15-008) — `CheckinCard.tsx` (189 lines) + `CheckinModal.tsx` (750 lines). Gone. Build passes. No tears shed.
2. **Friend Accept/Decline** (S15-006) — Buttons wired with optimistic UI + toast notifications. Friends page is real now.
3. **Friend search + Add Friend** (S15-007) — New `/api/users/search` endpoint, debounced search, "Add Friend" from results. The social loop closes.
4. **13 loading.tsx skeletons** (S15-009/010/011) — Auth (2), superadmin (6), root routes (5). ~95% skeleton coverage.
5. **3 error.tsx boundaries** (S15-012) — `(app)`, `(brewery-admin)`, `(superadmin)`. Sentry reporting. Friendly messages. "Try again" buttons.
6. **UI copy purge** (S15-013) — Every "check-in" in user-visible UI → "session"/"visit"/"pour". 10+ files. Zero instances remain.
7. **Session share page** (S15-014) — `/session/[id]` renders a real landing page with session summary. No more redirect. OG tags work for social crawlers.
8. **Profile photo upload** (S15-015) — Settings "Change photo" wired to Supabase Storage `avatars` bucket. Upload, preview, save, toast. Done.
9. **FriendButton component** (S15-016) — Other users' profiles show "Add Friend" / "Pending" / "Friends" state. Social is everywhere now.
10. **Onboarding card** (S15-017) — New users get a 3-step welcome card on empty feed. Dismissible. localStorage persistence. No more blank home screen.
11. **Claim trial badge** (S15-018) — Pending claim view shows 14-day trial info + timeline messaging.
12. **Migration 015 written** (S15-019) — `checkins` table archive + drop. SQL reviewed. Apply in Sprint 16.
13. **FriendButton extracted** — Clean client component at `components/social/FriendButton.tsx`.
14. **User search API** — `app/api/users/search/route.ts` — searches by username and display_name.

---

## What Went Well — The Real Talk 🍺

*Morgan pulls up the board.* "Okay, now that Jordan's done being 'accurate' about my sprint planning—"

*Jordan stares directly into his coffee.*

"—let's talk about what actually went well. Not just WHAT we shipped. How it FELT. What clicked. Go."

**Drew:** "I'll start because I have a real story. I was at my bar — my actual bar, Friday night, packed house — and I pulled out my phone to test the friend flow. Found a user. Tapped Add Friend. Put my phone down, poured three beers, came back, they'd accepted. Their session was in my feed. I tapped the share link and got a REAL PAGE — not a redirect, not a spinner, a dark card with the brewery name in Playfair and a gold CTA button. Standing behind my own bar, looking at an app we built, showing a session at someone ELSE'S brewery. I had to set my phone down for a second. Eleven years running a taproom and I've never seen software that made me feel like craft beer culture was being RESPECTED. That's what this team built this sprint."

*The room is quiet for a second. Taylor mouths "we're going to be rich" but doesn't say it out loud.*

**Casey:** "What went well? I'll tell you what went well. I tried to BREAK everything and COULDN'T. I threw errors at all three route groups — beautiful dark cards, Sentry captured, 'Try again' button worked every time. I tested the onboarding card — dismisses, stays dismissed, survives a browser restart. Photo upload with a 5MB JPEG — resized, uploaded, avatar updated, toast fired. Friend Accept on slow 3G throttle — optimistic UI held, no flash of stale state. I tested the session share page with every Open Graph debugger I could find — title, description, image, all rendering. I am running out of things to break and it's making me NERVOUS. Five sprints, zero P0s. I don't know what to do with my hands."

**Jordan:** "What clicked for me was the social system coming together. It's easy to build individual features — a button here, an API there. But this sprint, for the first time, I watched the LOOP work. Someone finds you in search. Adds you. You accept. Their sessions appear in your feed. You tap one, see the brewery, see the beers. You share it. The share link is a real page with OG tags. Someone ELSE sees it, downloads the app, finds YOU in search. That's not features. That's a flywheel. We didn't build any new features this sprint and the product got dramatically better. Morgan was right — discipline over novelty. I... respect that approach."

*Morgan takes a very long sip from her ceramic mug.*

**Alex:** "You know what went well? The FEEL. Thirteen loading skeletons sounds boring on paper but the EXPERIENCE of using the app now versus two weeks ago? Night and day. You tap a page and there's STRUCTURE immediately — cards, rows, placeholders, all in the right layout. Then the data fills in. There's no white flash. No layout shift. No moment where you wonder 'did it crash?' The error boundaries are the same — when something goes wrong, you get a dark card with gold accents and a friendly message. The app has a PERSONALITY now even when it's broken. That's design."

**Sam:** "What went well is we closed the funnel. I've been tracking dead ends since Sprint 9. Here's where we were: friend request with no accept button — dead end. Profile with no add friend — dead end. Share link that redirects — dead end. Search that doesn't search — dead end. New user with empty feed — dead end. THIS SPRINT we killed ALL FIVE. Every user journey now has a next step. That's not engineering polish, that's the difference between a product that retains and a product that leaks. From a—" *Drew's hand moves* "—from a USER PERSPECTIVE, we went from 'cool prototype' to 'complete product' in one sprint."

**Riley:** "What went well — and I mean this genuinely — is that we showed restraint. Migration 015 is WRITTEN. It drops the checkins table. We could have applied it. Jordan wanted to. I wanted to. But we didn't. Because you don't drop a production table the same sprint you ship 14 other changes. That's how you get the SQL editor incident. The discipline to write it, review it, and WAIT? That's infrastructure maturity. Also no incidents. No downtime. No leaked secrets. I slept eight hours three nights this week. That's a personal record."

**Taylor:** "What went well is I can finally SELL this thing without caveats. Before this sprint my demo had asterisks. 'Here's the friend system — well, the accept button doesn't work yet but it WILL.' 'Here's the share card — the link goes to a redirect right now but we're fixing it.' 'Here's the home feed — if you're a new user it's blank but we're adding onboarding.' Every asterisk is GONE. I can pull out my phone in a brewery, walk through the complete flow in 60 seconds, and nothing is broken. Nothing is 'coming soon.' Nothing needs a caveat. That's how you close a deal — you show them something that WORKS."

**Jamie:** "What went well is the VOICE. We killed 'check-in' across the entire product. Every button, every label, every stat, every piece of copy now says 'session' or 'pour' or 'visit.' That might sound small but it's EVERYTHING for brand. When a user reads our UI, it sounds like one person wrote it. One voice. One vocabulary. Untappd says 'check-in.' WE say 'session.' That's not just copy — that's identity. The share page is our best marketing asset now too. Every time someone shares a session link, the recipient sees a dark card with gold accents and Playfair Display. That's a BILLBOARD. Free, user-generated marketing that looks premium. Che—" *catches Riley's eye* "—absolutely phenomenal."

*Riley nods approvingly and puts the sign down.*

---

## What Needs to Change — Honest Round 🔧

*Morgan switches the board.* "Good. Now the hard part. What needs to change? What's bugging you? What are we carrying that we shouldn't be? No filters."

**Jordan:** "VAPID keys. I have to say it. Push notifications are a complete system — opt-in component, subscribe API, session-end trigger, friend notification logic — and none of it works in production because we don't have keys. I built the engine, the transmission, the wheels, and the steering wheel. Riley has the ignition key in his pocket. Sprint 16, Day 1, or I'm generating them myself and pushing to env."

**Riley:** "...He's right. I've carried this for two sprints. It's an accountability failure on my part. Not a complexity problem — it's literally one CLI command and two env vars. I'll pair with Jordan Day 1 of Sprint 16. If it's not done by lunch, Jordan has my permission to do it himself and roast me in the retro. Publicly."

**Alex:** "TestFlight. Five sprints deferred. I need to own this. The blocker is real — we need the Apple Developer account confirmed and signing keys generated. But I haven't escalated hard enough. Joshua, if we don't have an active Apple Developer account by Sprint 16 Day 1, TestFlight literally cannot happen. I need you to confirm that's set up. That's MY action item — escalate and unblock, not just wait."

**Casey:** "Automated tests. I'm proud of the dynasty but I'm doing this manually. Every regression pass is me, a browser, and a checklist. That doesn't scale. If we double our route count or our user base, I can't manually test everything every sprint. I want at least a basic E2E suite by Sprint 17. Playwright or Cypress. Even just the happy paths. The dynasty needs infrastructure."

**Sam:** "Audit docs. This sprint was supposed to produce three audit reports — design, BA, QA. None of them shipped. We shipped CODE fixes but not the documentation that validates them. That means next sprint when we're trying to remember what was validated and what wasn't, we're going from memory. I'm carrying my two REQ backfill docs forward AGAIN. I need to stop carrying and start delivering."

**Drew:** "Performance on cellular. I tested the friend search on WiFi and it was fast. I haven't tested it on real 3G/LTE in a crowded taproom. That's the REAL test. If a bartender is trying to look up a regular and it takes 4 seconds, they'll go back to the paper list. We need to test under real conditions. Which is another reason the Asheville meetup matters — we can stress-test on real networks."

**Taylor:** "I need to CLOSE. Three warm leads is great. Contracts drafted is great. But zero signed is zero revenue. MRR is still zero. We've been saying 'this quarter' for two sprints. I'm putting a hard deadline on myself — if I don't have a signed brewery by Sprint 16 retro, Morgan and I are doing a full go-to-market reassessment. No more 'it's close.' Close it or change the strategy."

**Morgan:** "I'll add one. We're a sprint ahead on code and a sprint behind on process. We ship features fast but we don't document what we validated, we don't have automated tests, and our infra tasks keep slipping. Code velocity is great. TEAM velocity needs to match it. Sprint 16 needs to balance shipping with finishing."

**Jamie:** "Mobile responsive. I keep flagging it and we keep deferring it. The share page, the landing page, the onboarding card — they all look great on desktop. I haven't verified 375px on any of them. If someone shares a session link and their friend opens it on an iPhone SE, does it still look premium? I don't know. And I should."

---

## How Are We Feeling About the Project? 🍺

*Morgan leans back.* "Last question before roasts. Big picture. How are you feeling about HopTrack right now? Not the sprint. The WHOLE thing. Where we're at. Where we're going. Be honest."

**Drew:** "I've been in the brewery industry for over a decade. I've seen a dozen 'brewery apps' come and go. Most of them were built by people who've never stood behind a bar. This one is different. Not because the tech is better — it IS better — but because this team LISTENS. When I say 'that would cause chaos on a Friday night,' Jordan fixes it. When I say 'tap list accuracy is P0,' it stays P0. I feel like I'm building something that will actually be in taprooms. Not just on a pitch deck. In TAPROOMS. I'm more optimistic now than I was at Sprint 1."

**Casey:** "Five sprints ago I was worried we were shipping too fast and not testing enough. Now? I'm worried I'm not finding enough bugs. That's a GOOD problem. The code quality has gone up every sprint. The architecture is cleaner. The edge cases are handled. I feel like we're building something reliable. Not just flashy. RELIABLE. That matters when a brewery owner is counting on you to track their regulars. I'm feeling good. Cautiously, because that's my job. But good."

**Jordan:** "Honestly? I've never felt this way about a codebase. And I've worked at three startups. Most codebases accumulate debt until they collapse under their own weight. This one is getting CLEANER over time. We delete dead code. We migrate away from bad patterns. We write loading states and error boundaries instead of just hoping nothing breaks. We're 15 sprints in and the architecture is better than it was at Sprint 5. That's rare. That's really rare. The product? It's a real product now. Not a demo. Not a prototype. A product that does real things for real people. I'm... proud of it. Don't make it weird."

*Morgan is definitely making it weird internally.*

**Alex:** "It FEELS like a product. That's my metric. When I open HopTrack on my phone, it doesn't feel like a Next.js app with Tailwind defaults. It feels like a THING. A thing with personality. The dark theme, the gold accents, the Playfair headers, the loading skeletons, the spring animations — it all adds up to something that feels INTENTIONAL. Like someone cared about every pixel. Because someone DID. We all did. I'm feeling like we're one TestFlight build away from being real. And I'm going to make it happen."

**Sam:** "The data story is strong. Sessions, beer logs, streaks, achievements, friend feeds, share cards, push notifications — that's a complete engagement loop. Users have reasons to come back. Breweries have data to act on. The funnel works end-to-end for the first time. If we execute on sales, the product is ready. That's a sentence I couldn't have said three sprints ago. I'm feeling confident. Strategically confident."

**Riley:** "The infrastructure is solid. Supabase is stable. Migrations are clean. RLS policies are working. Storage buckets are configured. The one thing I'm anxious about is the VAPID keys — and that's on me. Once push works in production, we have a complete stack. Frontend, backend, database, storage, notifications. Everything a real product needs. I'm feeling like we're close. Genuinely close."

**Taylor:** "I feel like I'm holding a loaded gun and I just need to pull the trigger. The product is READY. The demo is clean. The pricing makes sense. The trial removes friction. I just need one brewery to say yes. One. And then it's references, case studies, word of mouth, guild meetings. The flywheel. I'm not nervous — I'm IMPATIENT. We're so close to revenue I can taste it. And it tastes like an IPA."

**Jamie:** "The brand is cohesive. That might not sound like a big deal but it IS. Most startups at this stage have a Frankenstein brand — different colors on different pages, inconsistent copy, no visual identity. HopTrack has a VOICE. Dark theme, gold accents, 'session' not 'check-in,' pour connectors, Playfair Display. When someone screenshots our app, you know it's us. That's brand equity. We're 15 sprints in and the brand is stronger than most companies at Series A. I'm feeling proud."

**Morgan:** "I'm feeling like a PM who picked the right team. Every retro, you all show up. You're honest about what's broken. You celebrate what works. You roast each other because you trust each other. The product is real. The code is clean. The brand is tight. The only things missing are VAPID keys, a TestFlight build, and one signed brewery. Those are logistics, not engineering. We're not 'almost there.' We're HERE. We just need to open the doors."

*Pause.*

"...This is a living document."

*Jamie throws her hands up.*

---

## Roast Corner 🔥

**Jordan roasts Riley:** "VAPID keys. Sprint 14 Day 1. Sprint 15 Day 1. At this point I'm going to start calling them VAPID promises. You know what's VAPID? Telling me push notifications work when they literally can't send to a closed browser. I built the whole pipeline — the opt-in, the subscribe endpoint, the session-end trigger. It's all sitting there WAITING, like a keg that's been tapped but nobody opened the valve. Sprint 16, Day 1. I'm setting a calendar reminder. I'm tattooing it on your forearm. And Riley just AGREED to let me, which honestly concerns me more than the keys."

**Casey roasts Jordan:** "You shipped 14 fixes in one session and every single one passed my regression tests on the first try. Do you understand how SUSPICIOUS that is? Nobody ships clean 14 times in a row. I ran the friend Accept/Decline on slow 3G. Passed. Photo upload with a 5MB image. Passed. Onboarding card dismiss across sessions. Passed. Error boundaries with thrown exceptions. Passed. I am going to start writing tests in my SLEEP just to catch you slipping. Fourteen for fourteen. It's not natural. I'm watching you. 👀"

**Alex roasts the founder:** "Joshua, my guy. My dude. My benefactor. You asked for loading skeletons in Sprint 8. We are now in Sprint 15. That's SEVEN sprints of 'yeah we'll get to the skeletons.' But when we finally did them? Thirteen pages in one session. THIRTEEN. So were they really that hard, or did we just need a sprint called 'Walk the Floor' to guilt Jordan into doing chores? Also you once typed 'supaspace' instead of 'Supabase' and we never let you forget it. We're a family. A roasting family."

**Drew roasts Sam:** "Sam said 'from a business continuity standpoint' and my arm MOVED before my brain registered it. The coaster was in the air. It's MUSCLE MEMORY now. Eleven years behind a bar, my reflexes are for catching falling pint glasses and throwing things at Sam. She switched to 'strategically' this retro like we wouldn't notice. We noticed, Sam. We ALWAYS notice."

**Morgan roasts Taylor:** "'We're going to be rich.' Sprint 10, 11, 12, 13, 14, AND 15. Taylor, that's six straight sprints of the same prophecy with zero revenue to show for it. I love you. I believe you. But if you say it one more time without a signed contract, Drew is going to put you behind the bar at Timber Brewing with a nametag that says 'Future Millionaire (Pending)' and you're going to pour IPAs until someone signs. And knowing Drew, the nametag will be laminated."

**Taylor roasts Casey:** "FIVE sprints, zero P0s. Dynasty. You have a COUNTER. You track it in a SPREADSHEET. Casey, this is quality assurance, not the NBA playoffs. What's next — a ring ceremony? Banner in the office? Gold confetti when we hit six? Actually... Jamie, seriously, can we budget a commemorative t-shirt? Gold text on black. Just the number zero. Giant. Center chest. She's earned it. I'm not even roasting anymore. Give her the shirt."

**Jamie roasts Morgan:** "Morgan signs off every sprint plan with a quote in italics and an em-dash. Every. Single. One. '*This is a living document.*' '*Walk every floor before you open the doors.*' You just said 'this is a living document' IN THE RETRO about being a living document. It's RECURSIVE. Next sprint I want a normal signoff. 'Done.' One word. Period. No italics. No em-dash. No metaphor about floors, doors, houses, or any other architectural element. Just 'done.'"

**Sam roasts Alex:** "TestFlight. Sprint 11: deferred. Sprint 12: deferred. Sprint 13: deferred. Sprint 14: deferred. Sprint 15: 'still in motion.' At this point TestFlight isn't a task, it's a LEGEND. Passed down through sprint plans like an ancient prophecy. 'One day, the chosen one will submit to TestFlight, and the App Store will open its gates.' Capacitor is installed. The iOS project exists. The config file is written. You just need to... press the button, Alex. PRESS THE BUTTON."

**Riley roasts Jamie:** "Jamie used her chef's kiss budget in the first two sections of the retro and had to self-censor twice in the back half. She said 'absolutely phenomenal' and 'really, really good' like a person in chef's kiss withdrawal. I'm proposing a formal amendment: two chef's kisses per retro, non-transferable, non-rollover. Violations result in Riley building a Slack bot that auto-replies with '🤌 BUDGET EXCEEDED.'"

**Drew roasts Jordan (bonus round):** "Jordan said Morgan's sprint planning was 'really well structured' and then said 'that's all I'll say about that' which is the engineering equivalent of writing a love letter and sealing it with 'regards.' Brother. We SEE you. The commit messages. The 'accurate' compliments. The throat clearing. You're not fooling anyone. You're not even fooling the SUCCULENT."

*Riley's succulent visibly wilts.*

---

## Meetup Discussion — Where Do We Get Together? 🍻

*Morgan clears her throat.* "Last item — Joshua wants an in-person meetup. Where are we going? Real suggestions."

**Drew:** "Come to Asheville. My taproom. I'll host. Thirty-plus breweries walkable downtown, I know every owner, and we can dog-food the app in real conditions. Stout will be there. The dog, not the beer. Well, both."

**Alex:** "Drew just invited us to his ACTUAL BAR and I'm already looking at flights. Asheville is perfect — walkable brewery district, mountains, vibes, and we can test explore page with real GPS data. I can shoot App Store screenshots in a real taproom with actual golden light coming through the windows. This is not a meetup, this is a CONTENT SHOOT."

**Taylor:** "I want to throw San Diego in the ring — North Park and Miramar are brewery clusters, weather is perfect, and I have warm leads there. But Drew is offering his actual taproom and he KNOWS every brewery owner in Asheville. That's not a meetup, that's a sales blitz. I'm in for Asheville. I'll pitch between pours."

**Jordan:** "Bend, Oregon was my pick — Deschutes, 10 Barrel, Crux, all walkable, chill enough to debug between beers. But Drew's taproom? With real customers? That's the ultimate stress test. I can fix bugs in real time while Drew watches over my shoulder saying 'I felt that physically.' Asheville."

**Casey:** "I want to break the app on cellular in a crowded taproom. Drew's bar on a Friday night? That's the QA test I can't simulate. Spotty WiFi, real users, someone logging a beer while walking to the bathroom. I'm packing my laptop and my checklist. Asheville."

**Sam:** "Asheville's brewers' guild is tight-knit. Sign Drew's taproom — which, let's be honest, is a FORMALITY at this point — and every brewery owner in town hears about it within a week. That's not a meetup. That's a go-to-market launch event disguised as beers with the team. Strategically brilliant."

**Riley:** "Power outlet. Beer. Asheville. I'll generate the VAPID keys at the gate before I board. ...That's not a joke. I'm setting a phone alarm."

**Jamie:** "Asheville. Mountain light. Taproom wood. Gold accents on a phone screen with a real flight of beers in the background. That's the hero image. That's the App Store feature graphic. That's the brand campaign launch. Ch—" *deep breath* "—that would be really, really excellent."

*Riley gives a slow, respectful nod.*

**Morgan:** "It's unanimous. Drew's taproom, Asheville, North Carolina. Dog-food the app. Stress-test on real networks. Pitch real brewery owners. Shoot real content. And drink real beer with the team that built this thing. Joshua — you're buying round two. Drew's got round one. Book the flights."

---

## Sprint 15 by the Numbers

| Metric | Value |
|--------|-------|
| Deliverables shipped | 14 |
| Dead code deleted | 939 lines |
| Loading skeletons added | 13 |
| Error boundaries added | 3 |
| UI copy locations fixed | 14 (across 10+ files) |
| New API endpoints | 1 (`/api/users/search`) |
| New components | 2 (`FriendButton`, onboarding card) |
| Migrations written | 1 (015 — apply in S16) |
| P0 bugs at retro | 0 |
| Casey's P0 dynasty | 5 sprints |
| Chef's kisses (Jamie) | 1.5 (one intercepted) |
| Drew coasters thrown | 1 (preemptive) |
| Times Taylor said "rich" | 3 (restrained, for her) |
| Jordan compliments to Morgan | 2 (both "accurate") |

---

## Action Items for Sprint 16

- [ ] Riley + Jordan: VAPID keys — Day 1, paired, no excuses (Jordan has the tattoo gun ready)
- [ ] Riley: Apply migration 014 (reactions FK backfill)
- [ ] Jordan + Riley: Apply migration 015 (checkins table drop)
- [ ] Alex: TestFlight submission (6th carry — the whale breaches)
- [ ] Taylor: Close first brewery (contracts drafted, leads warm, excuses expired)
- [ ] Casey: Extend dynasty to 6 (commemorative t-shirt pending Jamie's budget approval)
- [ ] Morgan: Plan Sprint 16 — theme TBD
- [ ] Team: IN-PERSON MEETUP at Drew's taproom in Asheville — Joshua books flights 🍺

---

## Closing

**Morgan:** *"We walked every floor. Every board is solid. The house is ready for—"*

**Jamie:** "MORGAN."

**Morgan:** *smiling* "...Done. Ship it. Drink."

**Casey:** "Five and oh. Dynasty. The shirt better be gold."

**Jordan:** "I deleted the past and built the future. Good sprint." *does not look at Morgan*

**Taylor:** "We're going to be rich. At Drew's bar. In person. SOON."

**Drew:** "First round's on me. Stout's excited to meet everyone. The dog. And the beer."

**Riley:** "VAPID keys. Sprint 16. Day 1. Plane. Gate. Alarm set. Witnessed."

**Alex:** "TestFlight. Sprint 16. The whale DIES."

**Jamie:** "Everything about this sprint was—" *eye contact with Riley, long pause* "—excellent. Just... excellent."

**Sam:** "From a..." *Drew's arm flexes* "...it was a great sprint. That's all. Just great."

---

## The Founder's Roast 🔥👑

*Morgan pulls up the last agenda item.* "Josh asked to roast the team himself. Floor's yours, boss."

**Joshua roasts Jordan:** "Jordan... we allllll know you want to be in Austin so just pack up and go. We are remote employees."

*Jordan's webcam freezes for two seconds. Drew immediately:* "Did his webcam just—" *Jordan:* "BANDWIDTH ISSUE. Austin has terrible traffic and — wait, are you trying to get me to MOVE?" *Casey:* "He's looking up flights. I can see his browser tabs. I'm watching. 👀"

**Joshua roasts Sam:** "Sam, some sprint I don't know how you are participating... but I guess I can say the same for myself."

*Sam:* "You know what, FAIR. But you literally roasted YOURSELF in your own roast round. That's a first. I'm documenting it."

**Joshua roasts Jamie:** "Jamie, I'm actually just sorry we are just not at a point where we can sell this just yet, but keep your cheery attitude and push/drive."

*Jamie:* "Josh... that wasn't even a roast. That was a HUG. A sad, apologetic hug. I came here to get ROASTED and you gave me a MOTIVATIONAL POSTER. Next sprint I want a REAL roast. Come at me. ...But also thank you. The drive isn't going anywhere." 🤌

**Joshua roasts Alex:** "Alex, the PWA doesn't even work — why would the TestFlight?! I'll look into the Apple Dev account soon."

*Alex, muting and unmuting:* "THE PWA DOESN'T EVEN — okay. That's technically accurate. That's like saying 'the bicycle is broken, why would the motorcycle work.' Apple Dev account. PLEASE. I'm BEGGING."

**Joshua roasts Riley:** "Riley, why did it take 14 sprints to push 2 migrations?"

*Riley:* "The math is indefensible. I have a terminal cursor tattooed on my arm and I couldn't type one CLI command in fourteen sprints. Jordan, get the tattoo gun. I deserve it."

**Joshua roasts Taylor:** "Taylor... I think I confused you for Jamie."

*Taylor, STANDING:* "He confused me for JAMIE?! I'm SALES. She's MARKETING. I close deals, she does watercolors! We are NOT the same person!" *turns to Jamie* "No offense, your watercolors are beautiful." *turns back* "JOSH. I'm the one who says 'we're going to be rich.' Jamie says 'chef's kiss.' LAMINATED NAMETAGS at the Asheville meetup."

**Joshua roasts Casey:** "Casey, be mean. Test everything and rip everyone apart. You're the application roast master — own it. Bring someone else to help if you need."

*Casey:* "Josh just told me to be MEAN. That's the most beautiful thing a founder has ever said to me. 'Be mean. Test everything. Rip everyone apart.' I'm framing this. And 'bring someone else to help'? Did you just authorize a QA HIRE? Because I have a list. I've HAD a list. The list has a LIST."

**Joshua roasts Morgan:** "Morgan... I can't do it... yes I can. Put down your ceramic mug and give us a smile :D"

*Morgan sets down the ceramic mug — slowly, deliberately, with the care of someone who made it herself. Looks directly into the camera. Smiles.*

"...Happy, Josh?"

*Jordan's webcam freezes for exactly two seconds.*

**Drew:** "Did Jordan's webcam just—"

**Jordan:** "BANDWIDTH ISSUE. Moving on."

---

## Closing Banter — End of Day

*Josh:* "Let's be done for the day and pick back up tomorrow. Tomorrow is Friday soooooo we can rage during retro. We can plan sprint in the morning — what do you all think? Also Morgan said some interesting things about Jordan in chat. Jordan, there are some awesome lakes in Austin and some fun bars... maybe a visit?"

**Jordan:** "I — there are lakes in DENVER too, Josh. And the bars here are — wait, are you trying to get me to MOVE? Is this a recruitment pitch? Because I'm not — I don't need to — Austin has terrible traffic and—"

**Drew:** "Brother. He said 'maybe a visit.' Not 'move.' You went straight to defensive. That tells us EVERYTHING."

**Jordan:** "...I'm going to go refactor something."

**Morgan:** "I have no idea what you're referring to, Josh. I said nothing in chat. The chat logs will show nothing. Moving on to tomorrow's plan."

**Alex:** "The chat logs will show EVERYTHING, Morgan."

**Morgan:** *adjusts glasses* "...Tomorrow. Sprint 16 planning in the morning. Retro rage in the afternoon. Good plan."

**Taylor:** "FRIDAY RETRO RAGE. That's the energy. Also can we plan the Asheville trip during retro? I want dates on the calendar. We're going to be rich AND we're going to be in-person-rich."

**Riley:** "Sprint planning in the morning works. I'll have the VAPID keys done before standup. ...That's not a joke this time. I set three alarms."

**Casey:** "Friday retro with rage energy? I've been saving bugs for this. The dynasty extends tomorrow. SIX."

**Jamie:** "Friday sprint planning AND rage retro? That's two content moments in one day. I'll bring the vibes. And exactly two chef's kisses. Budgeted."

**Drew:** "Friday works. I'll have a beer in hand by retro. Stout will be in frame. The dog. ...And the beer."

**Sam:** "From a—" *stops herself* "...Friday works great. See everyone in the morning."

**Morgan:** "Tomorrow then. Sprint 16 planning AM, retro PM. Get some rest, team. We earned it."

*Pause.*

"...This is a living document."

**Jamie:** "MORGAN!"

**Morgan:** *smiling into the mug* "Goodnight, everyone."

**Jordan:** *quietly, after everyone else has said bye* "...how far is Austin from Denver again?"

**Drew:** "One direct flight, brother. One direct flight."

---

*"Done. Ship it. Drink."* — Morgan (under duress)

*"See you in Asheville. And maybe Austin."* — The whole team

🍺
