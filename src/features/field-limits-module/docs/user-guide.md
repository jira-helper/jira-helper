# WIP Limits by Field Values

| | |
|---|---|
| Where configured | Board Settings → Card layout → Edit WIP limits by field |
| Where visible | Board (detail view) |
| Settings apply to | For the whole team |(`fieldLimitsJH`) |

## Purpose

Turn a card field into a capacity-style limit. Count or sum how issues contribute by field value (or by whether the field is present), scoped to columns and swimlanes. Badges beside the board show current-vs-limit, and cards are tinted when a limit is exceeded.

## How to configure

### How to open settings

1. Open **Board settings**.
2. Go to the **Card layout** tab. Ensure the field you want to use is visible on the board cards.
3. Click **Edit WIP limits by field**.

### What you can configure

In the dialog you can add, edit, or delete rules. For each rule:

- **Select a field**: choose a field from the board's card layout.
- **Choose a calculation mode**: pick how issues contribute — field is filled, exact match, any of selected values, or sum of numeric values.
- **Specify values**: if the mode requires it, set which values to match.
- **Set a display name**: a short label shown on the badge above the board.
- **Set a limit**: the numeric cap for the rule.
- **Choose a badge color**: optionally pick a color for the badge.
- **Set column scope**: optionally restrict to specific columns.
- **Set swimlane scope**: optionally restrict to specific swimlanes.

Click **Save** to store, or **Cancel** to discard.

## How to use

- A row of **badges** appears in the toolbar area above the board — one per configured rule — with the label and colors you chose.
- Badge colors show status: **green** (under limit), **yellow** (at limit), **red** (over limit).
- When a limit is **exceeded**, cards that count toward that rule get a **red tint** so overloaded buckets stand out.
- Counts update as cards move, respecting Jira's board-level issue-counting settings.

## Usage scenarios

- "I want to limit how many high-priority issues are in progress, based on the Priority field."
- "I want to sum story points in a column to enforce a capacity limit."
- "I want to count how many issues have a specific label and cap that number."
- "I want separate badges for different field values visible at the top of the board."

## See also

- [Column Group WIP Limits](/docs/features/wip-limits/column-limits)
- [Swimlane WIP Limits](/docs/features/wip-limits/swimlane-limits)
- [Per-person WIP Limits](/docs/features/wip-limits/personal-limits)
- [General Settings](/docs/settings)
