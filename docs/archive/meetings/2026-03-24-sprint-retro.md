# HopTrack Sprint Retrospective — Sprints 1 & 2
**Date:** 2026-03-24 (end of day)
**Facilitator:** Casey (QA)
**Format:** Start / Stop / Continue + Feelings Check + Action Items
**Attendees:** Morgan · Sam · Alex · Jordan · Riley · Taylor · Drew · Casey · Jamie

---

## Feelings Check ☀️

*Casey: "Before we dig in — quick one-word check-in. How's everyone feeling coming out of today?"*

| Person | Word | Note |
|--------|------|------|
| **Morgan** | *Energized* | "We built a brewery dashboard in one session. That's wild." |
| **Sam** | *Anchored* | "Requirements validation showed we're tighter than I expected. Good bones." |
| **Alex** | *Proud* | "The CSS variable migration was 31 files in one script. That's beautiful engineering." |
| **Jordan** | *Tired (good tired)* | "Two full dashboards, a loyalty system, analytics charts. Send help. Also send beer." |
| **Riley** | *Ready* | "Infrastructure is holding clean. The Supabase setup is solid. Ready to scale." |
| **Taylor** | *Excited* | "I have a brewery pitch deck half-written in my head and I haven't even been here a day." |
| **Drew** | *Impressed* | "I've seen a lot of 'brewery software.' This is the first one that doesn't feel like it was built by someone who has never been in a taproom." |
| **Casey** | *Cautiously optimistic* | "Build is green, but I haven't done a live click-through yet. Optimism pending confirmation." |
| **Jamie** | *On fire* | "'Pint Rewind.' That's all I have to say. It's happening." |

---

## ✅ What Went Well

### MORGAN
> "The pace is incredible. We're building fast without feeling chaotic. The documentation discipline — bugs, requirements, meeting notes — means I always know where we are. I don't feel lost even when I'm not in the code."

### SAM
> "Requirements validation worked really well as a process. Checking every AC against what shipped caught the gap on REQ-002 (brewery images still need the upload UI). Without that check we might have closed it accidentally. Let's keep doing this every sprint end."

### ALEX
> "The design system is paying dividends. Because we invested in CSS variables and the `@theme` block early, the 31-file color migration took one Python script instead of three days of manual work. The theme toggle shipped fast because the foundation was right."

### JORDAN
> "The `as any` casting pattern in Supabase is ugly but pragmatic. It let us ship fast without fighting the type system. We should revisit proper typing in a later sprint when things calm down, but it was the right call for now."

### RILEY
> "The Supabase schema design is clean. RLS policies are in place on every new table we added today. We haven't cut security corners to go fast — that's important and easy to skip. Proud of that."

### TAYLOR
> "The competitive analysis gave me everything I need. Having Drew in the room was a force multiplier — his credibility stories about the taproom are the anecdotes that close deals. He's going on the sales calls."

### DREW
> "The brewery test seed was a nice touch. Pint & Pixel Brewing with 'Debug IPA' and 'Merge Conflict Märzen' — Morgan's going to laugh when he logs in. Good energy."

### CASEY
> "The bug documentation process worked. Three bugs were filed with clear reproduction steps, root cause hypotheses, and fix options. BUG-003 even had a decision table for the team. All three were fixed and closed same session. That's the process working."

### JAMIE
> "First day and I already have a 1,200-word brand guide that the team actually wants to use. That's not always the case. The fact that the name, palette, and type system were already strong gave me a real foundation instead of a blank page."

---

## 🔄 What Could Be Better

### MORGAN
> "I want to see the app in a browser, not just in my imagination. We need a `npm run dev` reminder and ideally screenshots or a live demo link in retros going forward. — **Action: Jordan adds a 'how to run' section to URL-REFERENCE.md**"

### SAM
> "REQ-002 still has open acceptance criteria — the brewery image upload and the consumer-facing tap list on the brewery detail page. Those aren't done. I want to make sure we don't start Sprint 3 without closing REQ-002 first. **Sprint 3 should start with closing REQ-002 gaps, not opening new work.**"

### ALEX
> "The brewery admin UI is functional but it's using `var(--...)` inline styles everywhere instead of Tailwind classes. It works, but it's inconsistent with the rest of the codebase. We should do a pass and align it. Not urgent but worth noting — **Action: Alex + Jordan do a UI polish pass on brewery admin in Sprint 3 backlog.**"

### JORDAN
> "Type safety is getting messier each sprint. We have `as any` everywhere. I know we removed the Database generic for a reason, but we should schedule a half-day to properly type the Supabase responses. Not this sprint but Sprint 4 at the latest. **Action: Sam add to Sprint 4 backlog as tech debt.**"

### RILEY
> "We still haven't set up the Supabase Storage bucket for brewery images. REQ-002 AC requires it. **Action: Riley sets up `brewery-images` public bucket before Sprint 3 starts.** Five-minute task."

### TAYLOR
> "I need a `/for-breweries` landing page before I can seriously start outreach. My cold emails need somewhere to point. — **Action: Schedule `/for-breweries` marketing page for Sprint 3 backlog.**"

### DREW
> "The test seed uses fake style names in the SQL comments ('Sour Ale', 'Märzen') that don't match the BeerStyle union type. We caught it during the build but it means whoever runs the seed gets some odd type mismatches. — **Action: Jordan updates seed SQL beer styles to match type definitions.**"

### CASEY
> "We don't have a QA sign-off on anything from today yet. I shipped a QA checklist template but haven't actually used it on any of today's features. Before we close Sprint 2 I need to do click-through testing on the brewery admin. **Action: Casey completes QA checklist for brewery admin tomorrow morning before Sprint 3 planning.**"

### JAMIE
> "We don't have a logo yet. Everything in the brand guide is words and concepts. I need someone to either give me a Figma file or we need to commission something. A $50 Fiverr logo is better than no logo. **Action: Morgan decides on logo path — DIY Figma, freelancer, or AI-generated — by Sprint 3 kickoff.**"

---

## 💡 Experiments to Try in Sprint 3

| Idea | Proposed By | Verdict |
|------|------------|---------|
| Pair Jordan + Alex on UI components (dev + design in sync) | Alex | ✅ Try it |
| Daily async standup in a doc instead of a meeting | Sam | ✅ Try it — less overhead |
| Casey writes acceptance criteria BEFORE Jordan builds | Casey | ✅ This is the right order |
| Drew reviews each brewery feature for real-world validity | Drew | ✅ Yes — 15 min review each |
| Jamie writes copy for each new feature as it ships | Jamie | ✅ Copy-first thinking is good |
| Add a "fun metric" to each sprint (funniest variable name, best commit message) | Jordan | 🍺 YES |

**Sprint 3 Fun Metric:** Most creative beer name in the codebase or test data. Current leader: *"404 Wheat Not Found"*

---

## 📋 Action Items from Retro

| # | Action | Owner | When |
|---|--------|-------|------|
| 1 | Add "How to Run" section to URL-REFERENCE.md | Jordan | Now |
| 2 | Casey: QA checklist pass on brewery admin | Casey | Tomorrow AM |
| 3 | Riley: Create `brewery-images` Supabase Storage bucket | Riley | Before Sprint 3 |
| 4 | Jordan: Fix seed SQL beer styles to match BeerStyle type | Jordan | Before Sprint 3 |
| 5 | Sam: Close REQ-002 open AC before Sprint 3 new work starts | Sam | Sprint 3 kickoff |
| 6 | Alex + Jordan: Brewery admin UI polish (inline styles → consistent) | Alex | Sprint 3 backlog |
| 7 | Jordan: Add Supabase type safety to Sprint 4 tech debt | Jordan | Log now |
| 8 | Taylor: Draft `/for-breweries` page copy | Taylor | Sprint 3 |
| 9 | Morgan: Decide logo path (Figma / freelancer / AI) | Morgan | Sprint 3 kickoff |
| 10 | Casey: Write AC for Sprint 3 features BEFORE Jordan builds | Casey | Sprint 3 kickoff |

---

## 📊 Sprint Velocity

| Sprint | Items Shipped | Bugs Fixed | Files Changed | Build Status |
|--------|:---:|:---:|:---:|:---:|
| Sprint 1 | 9 | 3 | 34 | ✅ Green |
| Sprint 2 | 10 | 1 | 12 | ✅ Green |
| **Total** | **19** | **4** | **46** | ✅ |

---

## 🏆 Sprint Awards

🌟 **MVP of the Sprint:** Jordan — shipped two full dashboards, a loyalty system, 5 charts, and 4 migrations in one session while keeping the build green.

🎨 **Best New Addition:** Jamie — walked in on day one and delivered a brand guide that the whole team immediately adopted. "Pint Rewind" is canon.

🔍 **Catch of the Sprint:** Casey — retroactively documenting all three bugs with clear AC before they were even assigned. Sets the QA bar from day one.

💡 **Best Insight:** Drew — "This is the first brewery software that doesn't feel like it was built by someone who has never been in a taproom." Framing the product through the brewery owner's eyes.

🍺 **Best Beer Name:** Jordan — *"404 Wheat Not Found"* — unanimous.

---

*"We're not just building an app. We're building the infrastructure for a community."*
*— Morgan, end of day 1*
