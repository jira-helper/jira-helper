# Additional Card Elements

Adds optional labels and status cues on board and backlog cards so you can see links, aging, deadlines, and simple rule-based signals at a glance.

## What it does

### Issue Links Display

- Shows linked issues as compact badges under the card summary.
- You can define several rules (link type, direction, optional filters) so only the links you care about appear.
- Optional colors and multi-line text for how each linked issue is shown.

### Days in Column

- Shows how long the issue has been in its current column as a badge on the card.
- Warning levels can be set globally or per column (e.g. turn “attention” styling on after a chosen number of days).

### Days to Deadline

- Shows a badge driven by a date or date-time field you pick on the issue.
- Display options include: always show, show only when the date is within a number of days or already past, or show only when overdue.
- Optional warning styling before the deadline is missed.

### Condition Checks

- Shows small icons on the card when the issue (or related work you include in the rule) matches a condition you define.
- Rules can optionally include sub-tasks, epic children, or linked issues, depending on how you set them up.
- Each rule can have its own icon, tooltip text, color, and optional animation.

**Other behavior**

- In backlog view, only issue link badges are shown.

## How to set up

1. Open your Jira board, then open **Jira Helper** board settings.
2. Open the tab **Additional Card Elements**.
3. Turn the feature on with the main enable option.
4. Choose **which columns** should show the extra badges on cards.
5. Optionally enable **Show links in backlog** so link badges appear on backlog cards.
6. Configure each area (links, days in column, deadline field and modes, condition rules) in the corresponding sections. Use **Reset all settings** if you want to return everything in this tab to defaults.

Settings apply per board. Board administrators can change them.

## Behavior on the board

- In **selected columns**, cards show the badges you configured: links under the summary; days-in-column and/or deadline near the end of the card; condition icons where the layout provides space at the bottom of the card.
- If **Show links in backlog** is on, **backlog** cards show link badges in a horizontal strip; other badge types stay on the main board only.
