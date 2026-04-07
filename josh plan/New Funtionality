New Funtionality
1. Regonial compliance some areas dont allow happy hour deals lets review and make sure we are not breaking the law anywhere
2. If you are managing your subscription through a brand I think your plan types should be the same across all locations
Slow system - what can we do to speed it up in the short term


-=-==-= What I see: -=-=-=-=

I really dont see that anything changed... We said we were going to do a ton and then it seems like everything is the same except now there is a another wrap section for the week or whatever.  I know we did the research but I dont feel like anything changed for the better maybe backend got cleaner but our front end is still very washed out and one dimentional. maybe we focused to much on the profile for this arc and need a pass on the friends, discover, and you sections.  

The your 4 favorites is wayyyyy to big its weird

What are the 4 letter acronyms why would the user know what those are. 

We need to think about how we are displaying ceertain things.  Beers and brewery lists are so smooshed together and are just not designed well. We need to rethink this look and feel. Image 1

Look how washed out everything is on the friends discover and you pages how smooshed everything is i want this all to be state of the art. image 2

Brain dump:  

The board different formats that you can select in the settings for the board think this through design different options for the user to select

Explore as a list - currently the huge cards are just obnoxious we should think through how we display these more as a list (with some live data) for example
Name of the brewery Beers on tap, live drinkers, poured today 
location - Tags of type of brewery and maybe some other meta data

Organized sections 

Beers on brewery profiles as list organized 


---- THE RESEARCH  ------
Morgan 📐: Yes. Agreed. The consumer app hasn't had a ground-up rethink since Sprint 63 (topo themes, card-bg system) — 96 sprints ago. We've been building brewery revenue + platform. Time to make the drinker side sing.

Alex 🎨: FINALLY. The bones are great — the MOTION is underused. We have View Transitions (S157), haptics (S154), Framer Motion, scroll-snap, cacheComponents. The consumer app still feels like a well-organized dashboard. It should feel like a Friday night.

Finley 🎯: Hierarchy's the issue. Home feed is 3 tabs, then it just keeps going. Profile has 6 sections competing. Explore's been added to so many times it's a Christmas tree. Need an IA audit — what would this look like if we designed for an iPhone 16 Pro in 2026, not retrofitted from 2025?

Sam 📊: We have KPIs for breweries (S124). For drinkers, the profile is a stats wall without narrative. Strava says "You PR'd." Spotify says "Top 5% Stevie Wonder listener." Ours says "47 beers." That's not a story.

Jamie 🎨: Card-bg system is four years old in app-years. Time to layer in mesh gradients, depth, iconography variety — without breaking dark+gold.

Drew 🍻: As a user — the app is solid, but it doesn't make me want to open it between brewery visits. That's the unlock.

Avery 🏛️: Technically we're ready. Platform's not blocking a single thing.

Dakota 💻: Tell me what to build.

Morgan 📐: Launching four deep research agents in parallel right now. Five minutes, then I'll come back with findings + proposed facelift tracks.


Ran 4 agents
Ran 4 agents

Morgan 📐: Research is back — four deep threads, five hundred-plus specific patterns. The team's been reading. Calling the huddle.

Alex 🎨: I'm losing my mind. The iOS 26 Liquid Glass floating tab bar pattern alone is a game-changer — backdrop-blur-xl + saturation boost, minimizes on scroll, 16px floating offset. We already have View Transitions, haptics, and card-bg-*. We can ship the sensory layer in one sprint.

Finley 🎯: The Profile restructure is the clearest win. Six stacked sections → 4 tabs (Activity / Stats / Lists / Breweries) with horizontal swipe + URL hash sync. That's not a facelift — that's solving the Christmas tree. Same pattern for Explore (4 mode pills: Near Me / Trending / Following / Styles) and brewery detail (hero + sticky tabs).

Sam 📊: The KPI research broke my brain. Current HopTrack drinker stats: "47 beers logged." Spotify: "You're in the top 0.5% of Taylor Swift listeners." That's not more data — that's framing. Beer Personality as a 4-letter archetype (Adventurous/Loyal × Bitter/Balanced × Hoppy/Malty × Social/Solo = 16 archetypes), Four Favorites pinned on every profile (Letterboxd's viral hit), percentile framing ("Top 3% of Hop Hunters"), rarity scores ("Only 47 users have tried this beer"). This is the WOW layer.

Jamie 🎨: Mesh gradients + noise textures on hero surfaces without breaking dark+gold brand. Audio system (5 sounds: pour, clink, unlock, error, success) — most apps are silent, this alone shifts "dashboard" → "Friday night." And we need to commission a mascot. Duolingo's Duo proves baby-schema characters drive emotional attachment we do not currently have.

Drew 🍻: Real drinker take — half-star ratings (0.5 increments, 10-point scale like Letterboxd), mood tags (crushable/contemplative/celebratory/cozy/adventurous), "Your Beer Thursday" stat (favorite drinking day). That makes me open the app on a Tuesday when I'm not drinking. That's the unlock.

Dakota 💻: Can build all of it. Give me tickets.

Avery 🏛️: Technically unblocked. View Transitions enabled (S157), motion/react migrated (S157), cacheComponents done (S158), haptics shipped (S154). Foundation is ready for this.



-0-0-0 THE SCOPE 0-0-0-


Morgan 📐: Here's the proposal — The Facelift Arc, 3 sprints:

Sprint 160 — The Vibe 🎵
Sensory layer. Liquid Glass floating nav (backdrop-blur, scroll-to-minimize, glass pill), mesh gradients + noise textures on all cards, variable XP rewards (±20% variance, 5% lucky, 1% golden), celebration trifecta (confetti + sound + haptic) on milestones, Arc-style phase animations on CTAs, audio system (5 sounds), haptics on tab changes, long-press context menus everywhere, horizontal swipe between Feed sub-tabs.
Leads: Alex + Jamie + Dakota.

Sprint 161 — The Identity 🎭
Stats that WOW. Beer Personality 4-letter archetype ("You're The Hop Hunter"), Four Favorites pinned on profile, half-star ratings (0.5 increments), percentile framing + rarity scores, temporal stories ("Your Beer Thursday"), "Your Round" weekly hero page (Wrapped-of-the-Week), shareable stat cards (OG images, Instagram Story format), count-up animations.
Leads: Sam + Finley + Dakota.

Sprint 162 — The Flow 🌊
IA restructure. Profile: 6 sections → 4 tabs. Explore: flat → 4 mode pills. Brewery detail: long scroll → hero + sticky tabs. Persistent active session sheet (iOS 26 accessory). Command palette bottom sheet (long-press FAB). Arc-style floating search pill. Progressive feature reveal by milestones. View Transitions expansion.
Leads: Finley + Alex + Dakota.


🥃 Option A: The Glass — Facelift Arc Track 2 (planned continuation)
The motion + liquid glass layer we've been promising.

Active Session Detent Sheet (deferred from S160 per Avery's scope call) — iOS-style 3-detent sheet for in-progress sessions (peek/half/full), replacing the current MinimizedSessionBar as the primary session surface
Liquid Glass rollout — extend the treatment Alex shipped on MinimizedSessionBar to BottomNav, Modal headers, sheet chrome, toasts
Motion consistency pass — audit AnimatePresence usage, shared element transitions across the 4 new tab surfaces (Profile/Explore/Brewery/rest)
PillTabs adoption audit — Finley wants to deploy the S160 primitive to 3-4 more places (Discover, Notifications, Settings)
Why now: The Facelift Arc is supposed to be 3 contiguous sprints. Breaking it up kills the momentum we built in S160.

🏛️ Option B: The Shell — Brewery Admin Facelift (Track 3 pulled forward)
Same treatment S160 gave the consumer app, but for brewery owners.

Brewery admin IA restructure (22 nav items → tabbed dashboard)
Apply PillTabs to Analytics, Customers, Messages, Content
Liquid Glass on brewery-admin chrome
Mobile-first bottom nav for brewery owners (currently desktop-optimized)
Finley's research from S160 flagged brewery admin as Drew's biggest "feels dated" complaint
Why now: Taylor's getting close to warm intros. Brewery admin is what gets demoed. First impression matters.

💰 Option C: The Closer II — Revenue Readiness Round 2
Pure sales-enablement sprint.

Trial-to-paid conversion flows (currently weak)
Self-serve claim → demo → checkout polish
"Book a demo" scheduler integration
ROI case study template (need first customer to populate, but infrastructure first)
Pricing page A/B experimentation setup
Joshua's LLC + Stripe are still blocking — this sprint is useless until those land
Why now: Nothing matters if we can't close. Taylor's been holding GTM for 17 sprints.


_+_+__++_ THE ASK =0=00==0==0

Three living documents are tracking the research:

docs/plans/design-research-2026-facelift.md (553 lines, touched today) — Alex's thread is fully documented: Apple Design Awards 2024-2025, Duolingo patterns, mesh gradients, micro-interactions, onboarding standards, nav patterns, dark mode, sources. Deep, referenced, alive.

docs/plans/deferred-sprint-options.md — The actual living backlog. Tracks every sprint's unselected options since Sprint 117, with status (OPEN / BUILT / PARTIAL / BACKLOGGED). The Identity and The Glass are both there, marked OPEN, for S162.

The "carry forward" rule is memorialized as feedback_carry_options_forward.md — the S161 rule you established.

Bad news — three of the four threads got short-changed
Remember Morgan said: "Research doc is saved at docs/plans/design-research-2026-facelift.md (Alex's thread). I'll consolidate the other three threads into the same file once you vote."

She never did that consolidation. The file only has Alex's thread. Here's what's missing in depth:

Thread	What's preserved	What's lost
Alex (mobile/glass)	✅ Full 553-line deep research	Nothing
Finley (IA restructure)	Option summary only ("Profile 6 → 4 tabs, Explore flat → 4 mode pills")	WHY those numbers, what patterns from which apps, the decision logic
Sam (KPI framing / archetypes)	Option summary only ("Beer Personality, Four Favorites, percentile framing")	The Spotify Wrapped "top 0.5%" framing logic, Letterboxd Four Favorites mechanics, why 16 archetypes not 8, rarity score math
Jamie (sensory / mascot / audio)	Partially in Alex's doc (mesh gradients + mascot section)	The 5-sound audio system research, specific sound design references, mascot candidate analysis
What this means practically
When you eventually ship The Identity, Sam and Dakota will be rebuilding the WHY from scratch. The patterns ("Beer Personality 4-letter archetype") are preserved as a NAME, but not as researched design rationale. They'll get there, but they'll repeat research Morgan already did.

What I'd do
Tell Morgan: "Close the loop. Go back to the Facelift research threads, consolidate Finley's IA research, Sam's KPI/archetype research, and Jamie's audio/mascot research into design-research-2026-facelift.md. Before I pick S162 options, I want the full research package so whoever builds The Identity has the same depth Alex got for The Vibe."

This is a 30-minute task for Morgan. It makes the research asset 4x more valuable.

One bigger thought: the deferred-options tracker is honestly one of the better artifacts I've seen from HopTrack. It's doing real strategic memory work — telling you which ideas keep coming back ("The Stage" deferred 4 times, "The Playwright" deferred 5 times before shipping), which are dead, which are OPEN. That's the kind of living document Morgan keeps talking about. More of that. Less one-time research docs.




