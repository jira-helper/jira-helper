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
- Icons support animations: pulse, breathe, blink, blinkFast, shake
- Subtask sources: direct subtasks, epic children, linked issues (each can be toggled)
- Multiple conditions can be active simultaneously — all matching icons appear on the card

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
   - **All:** icon appears only if every subtask matches
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
