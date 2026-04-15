# HopTrack Brewery Ops Review — Drew's Hands-On Assessment

**Reviewer:** Drew (Industry Expert, former brewery owner)
**Date:** 2026-03-24
**Scope:** Brewery owner / admin experience end-to-end
**Format:** Honest operational assessment from the perspective of a working brewery owner

---

## Executive Summary

The bones of the HopTrack brewery owner experience are excellent. The dashboard feels operationally relevant, the loyalty stamp card is a genuine differentiator, and the claim flow works. With two to three weeks of focused brewery-admin work — specifically on tap list management and loyalty program configuration — this product would be ready for a real brewery pilot.

Two items are P0 before any brewery signs up: **tap list CRUD must be complete**, and the **loyalty program must be configurable by the owner.** Everything else is polish.

---

## What Works Well

### Dashboard Stats

The headline stats panel is exactly what a brewery owner wants to see first thing in the morning:

- Total check-ins
- Unique visitors
- Average rating
- Month-over-month trend

This is operationally relevant data. Brewery owners are not looking at vanity metrics — they want to know if people came in, if they came back, and whether they left happy. This nails it.

**Recommendation:** Keep these stats at the top. Do not bury them under navigation.

### Top 3 Beers with Medal Colors

Seeing the top-performing beers with gold/silver/bronze medal treatment is a smart design choice. Owners love knowing what's working. This also has practical value — if a beer is consistently top 3, that informs batch sizing, featured tap placement, and social media content.

**No changes needed here.** This is a feature owners will reference daily.

### Loyalty Stamp Card Visual

The stamp card UI is genuinely beautiful. When I saw it, my first thought was: "Customers will show this to their friends." That's the goal. It has the tactile, rewarding quality that punch cards have always had — but digital and trackable.

This is a **differentiator**. No generic loyalty SaaS product makes this feel this good. Do not let it get deprioritized.

### Claim Flow

The brewery claim flow is straightforward and clear. Owner submits a claim, it goes into a review queue, and the dashboard state reflects pending/approved status. For a V1, this is sufficient.

---

## Tap List Review — Critical Path

### Why This Matters

Brewery owners use the tap list every single day. When a keg kicks, they pull it. When a seasonal goes on, they add it. When they're pouring a special cask for one night, they need to flag it. The tap list is not a secondary feature — it is the operational heartbeat of the brewery dashboard.

### Current State Assessment

The tap list displays existing beers. The critical question is whether owners can:

| Action | Status |
|---|---|
| Add a new beer to the tap list | Needs verification |
| Edit an existing beer (name, style, ABV, description) | Needs verification |
| Mark a beer as on-tap or off-tap | Needs verification |
| Reorder tap list entries | Needs verification |
| Remove a beer from the tap list | Needs verification |

If any of these actions are missing or broken, **this is a P0 blocker before any brewery signs up.**

A brewery owner who cannot manage their own tap list will not use this product. Full stop. They'll go back to a Google Sheet or a chalkboard.

### Recommendation

Dedicate at least half a sprint to tap list CRUD before launch. Suggested scope:

- Add beer form (name, style, ABV, IBU, description, on-tap toggle)
- Edit beer form (same fields, pre-populated)
- On/Off tap toggle — must be a single tap/click, not buried in an edit form
- Reorder via drag-and-drop or up/down arrows
- Delete with confirmation (not an `alert()` — see below)
- Optimistic UI updates — when an owner toggles a beer off-tap, it should reflect immediately without a page reload

### Flag for Jordan

**Tap list management is the single most-used feature in this product for brewery owners.** If it is not complete before outreach begins, we risk a bad first impression with the exact audience we need to convert.

---

## Loyalty Program Review

### What Owners Can Currently Do

Brewery owners can **view** the loyalty program configuration from the dashboard. They can see how many stamps are required for a reward, what the reward is, and what the stamp card looks like.

### What They Cannot Currently Do

They **cannot configure** any of it. Specifically missing:

| Missing Feature | Impact |
|---|---|
| Stamps required (configurable) | Every brewery wants a different threshold. 5, 8, 10 — this must be their choice. |
| Reward description (editable) | "Free pint" vs "10% off" vs "Merch item" — owner must control this. |
| Active / inactive toggle | Owners need to pause the program seasonally or during events. |

### Why This Is a Differentiator

Every brewery I've talked to has asked some version of: "Can I run my own loyalty program without paying for a third-party app?" HopTrack's answer should be yes — and right now it's almost yes.

The stamp card UI is already done and it's beautiful. The missing piece is giving the owner control over the rules. This is not a hard feature — it's a form with three fields. But it is the feature that will close deals on sales calls.

### Flag for Jordan

**A loyalty program edit form is needed before the first brewery onboards.** This is not a nice-to-have. Owners will ask about this on day one. The current read-only view will be a source of confusion ("why can I see it but not change it?").

Suggested form fields:
- Stamps required for reward (number input, min 1, max 20)
- Reward description (text input, max 100 chars)
- Program active (toggle, defaults to true)
- Save button with toast confirmation

---

## The "Remove Brewery Account" Alert() Button

This is a UX issue that needs to be fixed before any professional brewery sees this product.

**Current behavior:** Clicking "Remove brewery account" triggers a browser `alert()` dialog.

**Why this is a problem:** Browser `alert()` dialogs are a signal that something was built quickly and never refined. No professional SaaS product uses them. To a brewery owner evaluating whether to trust HopTrack with their customer data and loyalty program, this sends the wrong signal entirely.

**Recommended replacement (Option A — lower friction):**

Remove the button entirely from the dashboard. Replace with:

> To remove your brewery account, contact us at support@hoptrack.beer. We'll process your request within 2 business days.

**Recommended replacement (Option B — modal confirmation):**

Replace the `alert()` with a proper modal:

```
[Modal]
Remove Brewery Account

This will permanently remove your brewery from HopTrack, including
all check-in history, ratings, and loyalty data.

This action cannot be undone.

Type your brewery name to confirm: [text input]

[Cancel]  [Remove Account — destructive button]
```

Option A is faster to ship and may actually be preferable — account deletion should involve a human review anyway. Option B is more polished if self-serve deletion is a hard requirement.

**Priority:** Fix before any brewery signs up. This is not P0 (it won't block the first demo) but it is P1.

---

## Analytics Page Audit

The analytics page needs a thorough audit. Brewery owners make real operational decisions based on data — scheduling staff, ordering ingredients, planning events. The analytics page should answer these questions:

| Question | Required Data | Present? |
|---|---|---|
| How have check-ins trended over 30 days? | 30-day trend line chart | Needs verification |
| What are our busiest days of the week? | Day-of-week heatmap or bar chart | Needs verification |
| What styles are most popular with our visitors? | Top beer styles by check-in | Needs verification |
| How are visitors rating us? | Rating distribution (1–5 stars) | Needs verification |
| Are we growing month over month? | MoM % change | Needs verification |

If any of these are missing, they should be added to the analytics roadmap. The dashboard headline stats cover the "what" — the analytics page needs to answer the "why" and "when."

---

## Three Things Needed Before First Brewery Onboards

These are the minimum requirements for a brewery pilot. Not a full product launch — a pilot with one real brewery.

### 1. Tap List CRUD Must Be Complete

A brewery owner must be able to add, edit, reorder, and toggle beers on their tap list without contacting support. This is non-negotiable operational functionality.

**Owner:** Jordan
**Timeline:** At least half a sprint dedicated to this

### 2. Loyalty Program Must Be Configurable

The loyalty program edit form must exist so owners can set their own stamp threshold, reward description, and active status.

**Owner:** Jordan
**Timeline:** Can ship in the same sprint as tap list work

### 3. Settings Save Must Give Clear Feedback

This is now done — toast notifications are implemented. Confirming this is checked off.

**Status: COMPLETE**

---

## Drew's Overall Verdict

The HopTrack brewery admin experience is further along than most early-stage products I've seen. The UI feels intentional, not thrown together. The stats are the right stats. The loyalty stamp card is genuinely exciting.

The gap between "demo-ready" and "pilot-ready" is two to three weeks of focused work on tap list management and loyalty program configuration. These are not hard problems — they're known features that just need to be built.

Once those are done, I'd be comfortable sitting across from a brewery owner and saying: "Here's your dashboard. Here's your tap list. Here's how your loyalty program works. Let's run a pilot." That's the goal.

---

*Review conducted by Drew. Document written 2026-03-24.*
