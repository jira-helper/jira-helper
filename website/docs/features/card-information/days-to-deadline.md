---
sidebar_position: 2
---

# Days to Deadline

## Overview

The Days to Deadline badge shows remaining time before an issue's deadline as a color-coded badge with a ⏰ emoji. Overdue issues, today's deadlines, and approaching deadlines are visually distinct at a glance.

**Why:** Deadline awareness on the board itself eliminates the need to inspect each issue individually to check due dates. The badge makes overdue and soon-to-be-overdue issues instantly visible.

**Where:** Board Settings → Jira Helper → Additional Card Elements → Days to Deadline section. The badge appears on cards in selected columns only.

**How it works:**
- Reads a date or date-time field from the issue (configurable — typically "Due Date")
- Three display modes control when the badge is shown: always, less than X days or overdue, or overdue only
- Color scheme:
  - **Red badge** — deadline is overdue (always red, regardless of thresholds)
  - **Yellow badge with "Due today!" text in red** — deadline is today (0 days)
  - **Yellow badge** — deadline is tomorrow (1 day) or within the warning threshold
  - **Blue badge** — all other cases (deadline is further away)
- Text format examples: `⏰ X days overdue`, `⏰ Due today!`, `⏰ Due tomorrow`, `⏰ X days left`
- Not displayed in backlog view
- Badge appears next to the [Days in Column](/docs/features/card-information/days-in-column) badge when both are enabled

**Prerequisites:**
- **Board admin** permissions are required to enable and configure the feature
- The feature must be enabled under **Additional Card Elements** in the Jira Helper settings panel
- At least one **date or datetime field** must exist in your Jira project for the field selector to populate options

<!-- SCREENSHOT: Badge states side-by-side on board cards: ⏰ 3 days overdue (red), ⏰ Due today! (yellow+red text), ⏰ Due tomorrow (yellow), ⏰ 5 days left (yellow), ⏰ 10 days left (blue) -->
<!-- SCREENSHOT: Jira Helper settings panel → Additional Card Elements tab → Days to Deadline section showing field selector, display mode, and warning threshold -->

## User Jobs

### Select a deadline field (date field from project)

**Goal:** Choose which Jira field contains the deadline date to track.

1. Open board settings → **Jira Helper** → **Additional Card Elements** tab.
2. Ensure **Enable additional card elements** is checked.
3. Scroll to the **Days to Deadline Badge** section.
4. Check **Show days to deadline badge**.
5. From the **Field Selection** dropdown, choose the field that stores deadline dates. The list auto-populates with date, datetime, and string fields from your Jira project.
6. If no field is selected, the badge is not displayed.

### Choose display mode

**Goal:** Control when the deadline badge appears on cards.

1. In the Days to Deadline settings, locate **Display Mode**.
2. Select one of three options:
   - **Always** (default): badge appears on every card that has a deadline value set
   - **Less than X days or overdue:** badge appears only when the deadline is within X days or already past. An additional field lets you set X. If X is empty, the field shows "X is empty" and behaves the same as **Overdue only** — only overdue issues get a badge.
   - **Overdue only:** badge appears exclusively on overdue issues (deadline is past). Warning threshold is not applied in this mode and only the red overdue badge is shown.

### Configure warning threshold (yellow)

**Goal:** Set when approaching deadlines turn yellow.

1. In **Warning threshold**, enter the number of days. When remaining days ≤ this threshold, the badge turns yellow.
2. Leave empty to disable yellow highlighting.
3. **Note:** "Today" (0 days) and "Tomorrow" (1 day) are always yellow regardless of threshold. "Today" additionally shows "Due today!" in red text on the yellow background to emphasize urgency.

### Board view: ⏰ badge with color coding

**Goal:** Read deadline urgency directly from board cards.

1. Look at cards in the selected columns. A ⏰ badge appears near the end of the card (after the Days in Column badge if both are enabled).
2. Interpret the badge:
   - **⏰ X days overdue** (red background) — deadline has passed, take immediate action
   - **⏰ Due today!** (yellow background with red text) — urgent, due today
   - **⏰ Due tomorrow** (yellow background) — approaching rapidly
   - **⏰ X days left** (yellow background) — within warning threshold
   - **⏰ X days left** (blue background) — comfortable buffer remaining
3. Click into any red or yellow card to review and reschedule or escalate as needed.

## Display Mode Reference

| Mode | When badge appears | Warning threshold applies? |
|---|---|---|
| **Always** | Card has a deadline value set | Yes |
| **Less than X days or overdue** | Days remaining ≤ X, **or** deadline is past. If X is empty, falls back to overdue-only behavior. | Yes |
| **Overdue only** | Deadline is past | No — only red overdue badge is shown |

## Troubleshooting

### Field dropdown is empty (no fields to select)

1. The field selector populates with **date, datetime, and string fields** from the Jira project linked to the board.
2. If no date fields exist in the project, the dropdown is empty. Create a date custom field in Jira project settings first.
3. Ensure jira-helper has access to the project's field metadata — a board refresh may be needed after creating new fields.

### Badge is not appearing on a card

1. Verify the selected **deadline field** actually has a value on that issue. If the field is empty/unset, no badge is shown.
2. Check the **Display Mode** — in "Less than X days" mode, the badge only appears when deadline is close or overdue. In "Overdue only" mode, only past-deadline issues show badges.
3. Confirm the card's column is selected in the **Column Settings** section of Additional Card Elements.
4. Badges appear only on board detail view, not Backlog.

### Badge shows wrong colors or text

1. **Overdue badges are always red** — this overrides any yellow warning threshold.
2. **Today (0 days) and Tomorrow (1 day)** always display yellow, regardless of warning threshold. "Today" additionally shows red text for "Due today!".
3. The deadline date is compared against the **current day boundary** in the Jira instance timezone. If your local timezone differs from the server, the "today/tomorrow/overdue" classification may shift.

### "⏰ Due today!" text is hard to read (red text on yellow)

1. The red text on yellow background combination is intentional to emphasize urgency for same-day deadlines.
2. If readability is an issue, consider using the browser's zoom feature or adjusting Jira's board card width in Board Settings.

## Related Features

- [Days in Column](/docs/features/card-information/days-in-column) — how long issues have been in their current column (badge appears next to this one)
- [Issue Condition Checks](/docs/features/card-information/issue-condition-checks) — custom icon badges via JQL
- [Personal WIP Limits](/docs/features/wip-limits/personal-limits) — per-person workload monitoring

## See Also

- [Atlassian: Configure custom fields](https://support.atlassian.com/jira-software-cloud/docs/configure-custom-fields/) — how to add date fields to Jira
