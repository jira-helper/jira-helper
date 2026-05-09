---
sidebar_position: 4
---

# Issue Condition Checks

## Overview

Issue Condition Checks puts custom icon badges on board cards when the issue (or related work) matches a JQL condition you define. Unlike Jira's card colors, which apply full-card backgrounds per rule, these are small inline icons that can carry tooltip text, animations, and color — perfect for highlighting specific properties that Jira doesn't surface visually on cards.

**Why:** Standard Jira boards don't let you add custom visual signals per arbitrary JQL conditions. With Condition Checks, you can flag issues that have blockers, lack estimates, belong to a specific release, or meet any queryable condition — all as visible icons on the card.

**Where:** Board Settings → Jira Helper → Additional Card Elements → Issue Condition Checks.

**How it works:**
- Each condition check has: name, JQL query, icon (30+ choices), color (optional background), tooltip text, animation (optional)
- Two modes:
  - **Simple:** the condition matches when the card itself satisfies the JQL
  - **Subtasks-aware:** the condition checks the card + its subtasks, epic children, or linked issues
- Subtask match mode: `any` (at least one child matches) or `all` (every child matches)
  - When the card has **zero subtasks** and mode is `all`, the condition does *not* match (vacuous truth is not applied — there must be at least one subtask)
- Icons support animations: pulse, breathe, blink, blinkFast, shake
- Subtask sources: direct subtasks, epic children, linked issues (each can be toggled)
- Multiple conditions can be active simultaneously — all matching icons appear on the card

<!-- SCREENSHOT: Board settings panel — Issue Condition Checks section with two configured conditions: "Blocked" (warning icon, red, blink animation) and "Missing Estimate" (clock icon, yellow) -->

---

## Prerequisites

- **Board edit permissions** to create or modify condition checks
- Familiarity with [JQL syntax](/docs/advanced/jql-reference) — every condition uses a JQL query

---

## Common JQL Recipes

| Use Case | JQL | Mode | Icon Suggestion |
|---|---|---|---|
| Blocked issues | `status = Blocked` | Simple | ⚠️ warning |
| Missing story points | `"Story Points" is EMPTY` | Simple | 📋 clipboard |
| Missing estimates | `timeestimate is EMPTY` | Simple | ⏱️ clock |
| Release-flagged | `fixVersion in unreleasedVersions()` | Simple | 🚀 rocket |
| Overdue | `duedate < now() AND resolution is EMPTY` | Simple | 🔴 fire |
| Has unresolved blockers | `issueLinkType = "is blocked by"` | Simple | 🔒 lock |
| Flagged (attention needed) | `Flagged = "Yes"` | Simple | 🚩 flag |
| Subtask blocked (any) | Issue JQL: _empty_, Subtask JQL: `status = Blocked`, mode: any | With subtasks | ⚠️ warning |
| All subtasks completed | Issue JQL: _empty_, Subtask JQL: `status = Done`, mode: all | With subtasks | ✅ check |

> Copy any JQL above, paste it into a condition check, and test it first in Jira's Issue Navigator to verify it returns the expected issues.

---

## User Jobs

### Add a condition: name, JQL, icon, color, tooltip

**Goal:** Create a new condition check that displays an icon on matching cards.

1. Open board settings → **Jira Helper** → **Additional Card Elements** tab.
2. Ensure **Enable additional card elements** is checked.
3. Scroll to **Issue Condition Checks** and click **Add Condition Check**.
4. Fill in the configuration:
   - **Name:** a label for this condition (shown only in settings)
   - **JQL:** the Jira Query Language condition to match (e.g., `status = Blocked` or `labels = urgent`)
   - **Icon:** choose from 30+ icons (warning, bug, rocket, fire, lock, eye, bell, lightning, and many more)
   - **Color:** pick a background color for the icon badge (hex format), or leave undefined for no background
   - **Tooltip:** text shown on hover (e.g., "This issue is blocked")
5. Click save. Cards matching the JQL now display the selected icon.

### Configure subtask awareness

**Goal:** Show the condition icon when subtasks, epic children, or linked issues match, rather than (or in addition to) the card itself.

1. In a condition check, change the mode from **Simple** to **With subtasks**.
2. Set the **Issue JQL** — the condition the parent card must satisfy.
3. Set the **Subtask JQL** — the condition subtasks/children must satisfy.
4. Configure **Subtask match mode:**
   - **Any:** icon appears if at least one subtask matches
   - **All:** icon appears only if every subtask matches (and at least one subtask exists)
5. Configure **Subtask sources** (which child work to check):
   - **Direct subtasks:** standard Jira subtasks (default: on)
   - **Epic children:** issues linked via Epic Link field (default: on)
   - **Linked issues:** issues linked via Jira issue links (default: off)
6. The icon now appears only when the subtask-level condition is met.

### Choose animation

**Goal:** Add motion to draw attention to matching cards.

1. In a condition check, find the **Animation** dropdown.
2. Choose from:
   - `none` — static icon (default)
   - `pulse` — gentle pulsing effect
   - `breathe` — slow fade in/out
   - `blink` — on/off blinking
   - `blinkFast` — rapid blinking
   - `shake` — short vibration
3. The animation runs continuously while the condition matches.

### Board view: icon badges on matching cards

**Goal:** See condition check icons on board cards.

1. Look at cards in the selected columns. Matching cards display icon badges near the bottom of the card.
2. Each active condition check adds its own icon. Multiple icons can appear on the same card.
3. **Hover** an icon to see its tooltip text explaining the condition.
4. If the card no longer matches the JQL (e.g., status changed, label removed), the icon disappears automatically when the board refreshes.
5. If animations are configured, the icon animates in place to draw attention.

<!-- SCREENSHOT: Board card showing three condition check icons: a red warning icon (pulse animation), a yellow clock icon, and a blue rocket icon, all aligned near the card bottom -->

---

## Performance Considerations

- Each active condition check makes a separate Jira API call for every visible card. With **5+ active conditions on a 50-card board**, loading may take 2–4 seconds.
- Subtask-aware conditions are more expensive than Simple conditions — they fetch subtask/children data in addition to the card. Limit the number of subtask-aware checks to the most critical signals (e.g., "has blocked subtask") and use Simple mode where possible.
- If board performance degrades, disable condition checks you no longer use rather than leaving them active.

---

## Troubleshooting

### Icon not showing on a card that should match

- Test the JQL directly in Jira's **Issues → Search for issues** page. If it returns zero results there, it will match zero cards on the board.
- For **all** subtask mode: the card must have at least one subtask — a card with zero subtasks never matches in `all` mode.
- Check that the card's column is selected in **Column Settings** under Additional Card Elements.
- If using subtask sources, verify the source toggles are on. **Linked issues** are off by default.

### JQL query returns errors

- Unquoted values with spaces cause parse errors: `status = In Progress` → `status = "In Progress"`
- Field names are case-sensitive: `story points is EMPTY` → `"Story Points" is EMPTY`
- Test in Jira's Issue Navigator first — the error messages there are more detailed than in the extension

### Animation not visible

- Animations use CSS; they may be disabled at the OS level (Windows: "Turn off all unnecessary animations" in Ease of Access settings)
- Some animations (`blinkFast`, `shake`) are deliberately aggressive — if they seem broken, switch to `pulse` to verify the animation engine works

---

## See Also

- [Issue Links Display](/docs/features/card-information/issue-links-display) — in-card link badges
- [Days in Column](/docs/features/card-information/days-in-column) — aging badge on cards
- [Flag on Issue Panel](/docs/features/flag-issue) — auto-highlight flagged work
- [JQL Reference](/docs/advanced/jql-reference) — JQL syntax guide
- [Settings: Board Properties](/docs/settings#board-properties-team-shared)
- [Atlassian: Advanced JQL](https://support.atlassian.com/jira-software-cloud/docs/advanced-search-reference-jql-fields/)
