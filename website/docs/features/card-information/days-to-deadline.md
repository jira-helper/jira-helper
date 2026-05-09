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
  - **Red:** deadline is overdue (always red, regardless of thresholds)
  - **Yellow:** "Today" (0 days) or "Tomorrow" (1 day) — always yellow, regardless of threshold settings
  - **Yellow:** warning threshold reached (days remaining ≤ configured threshold)
  - **Blue:** all other cases (deadline is further away)
- Text format examples: `⏰ X days overdue`, `⏰ Due today!`, `⏰ Due tomorrow`, `⏰ X days left`
- Not displayed in backlog view

---

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
   - **Less than X days or overdue:** badge appears only when the deadline is within X days or already past. An additional field lets you set X. If X is empty, only overdue issues are shown.
   - **Overdue only:** badge appears exclusively on overdue issues. Warning threshold is not applied in this mode.

### Configure warning threshold (yellow)

**Goal:** Set when approaching deadlines turn yellow.

1. In **Warning threshold**, enter the number of days. When remaining days ≤ this threshold, the badge turns yellow.
2. Leave empty to disable yellow highlighting.
3. **Note:** "Today" (0 days) and "Tomorrow" (1 day) are always yellow regardless of threshold.

### Board view: ⏰ badge with color coding

**Goal:** Read deadline urgency directly from board cards.

1. Look at cards in the selected columns. A ⏰ badge appears near the end of the card (after the Days in Column badge if both are enabled).
2. Interpret the badge:
   - **⏰ X days overdue** (red background) — deadline has passed, take immediate action
   - **⏰ Due today!** (red text on yellow background) — urgent, due today
   - **⏰ Due tomorrow** (yellow background) — approaching rapidly
   - **⏰ X days left** (yellow background) — within warning threshold
   - **⏰ X days left** (blue background) — comfortable buffer remaining
3. Click into any red or yellow card to review and reschedule or escalate as needed.
