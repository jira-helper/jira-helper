# WIP Limits by Field Values

| | |
|---|---|
| Where configured | Board Settings → Card layout → Edit WIP limits by field |
| Where visible | Board (detail view) |
| Settings apply to | For the whole team |(`fieldLimitsJH`) |

## Purpose

Turn a card field into a capacity-style limit. Count or sum how issues contribute by field value (or by whether the field is present), scoped to columns and swimlanes. Badges beside the board show current-vs-limit, and cards are tinted when a limit is exceeded.

## How to configure

1. Open **Board settings**.
2. Go to the **Card layout** tab. Ensure the field you want to use is visible on the board cards.
3. Click **Edit WIP limits by field**.
4. Add, edit, or delete rules. For each rule:
   - **Field** — select a field from the board's card layout.
   - **Calculation mode** — choose how issues contribute: field is filled, exact match, any of selected values, or sum of numeric values.
   - **Values** — if the mode requires it, specify which values to match.
   - **Display name** — a short label for the badge.
   - **Limit** — the numeric cap.
   - **Badge color**, **Column scope**, **Swimlane scope** — optional.
5. Click **Save** to store, or **Cancel** to discard.

Only board administrators (or users with board configuration access) can save.

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
