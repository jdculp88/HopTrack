# BUG-003 — Check-In "Back to Feed" Button Has No Destination
**Status:** Open
**Priority:** High
**Reported:** 2026-03-23
**Reported By:** Morgan (Project Owner)
**Assigned To:** Jordan (Dev), Alex (UI/UX) for destination decision

## Description
After completing a check-in (Step 5 — celebration screen), the "Back to Feed" button closes the modal but does not navigate the user anywhere meaningful. The destination after a successful check-in needs to be decided and implemented.

## Steps to Reproduce
1. Complete a check-in through all 5 steps
2. Click "Back to Feed" on the celebration screen
3. User is left on whatever page was open when they started the check-in

## Expected Behavior
User is taken to a defined destination after a successful check-in.

## Options for Discussion (tomorrow's meeting)
| Option | Pro | Con |
|--------|-----|-----|
| **A — Home feed** | Sees their new check-in at the top of the feed | May feel abrupt |
| **B — Their profile** | Sees updated stats, XP, achievements | Less social |
| **C — The brewery page** | Contextually relevant | Might feel like a detour |
| **D — The beer page** | Shows their rating in context | Only works if a beer was selected |
| **E — Stay on current page, refresh** | Least disruptive | No reward feeling |

## Notes
- "Log Another Beer" button already resets the modal correctly — only the exit destination needs deciding
- Decision deferred to team — added to tomorrow's agenda
