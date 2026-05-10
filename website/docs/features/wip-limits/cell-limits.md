# WIP Limits by Cells

| | |
|---|---|
| Where configured | Board Settings → Columns → Edit WIP limits by cells |
| Where visible | Board (detail view) |
| Settings apply to | For the whole team |(`wipLimitCells`) |

## Purpose

Define a single work-in-progress limit for a custom block of board cells (column–swimlane intersections). The covered area is outlined, optional per-cell counters show usage, and overloaded cells are visually highlighted. Ranges can be marked as disabled for visual-only grouping.

## How to configure

1. Open **Board settings**.
2. Go to the **Columns** tab.
3. Click **Edit WIP limits by cells**.
4. Add, edit, or delete ranges. For each range set:
   - **Name** — a label for the range.
   - **Limit** — the numeric cap for all issues inside the range.
   - **Disabled** — mark as visually disabled (hatched overlay, no active WIP behavior).
   - **Issue types** — optionally narrow which issue types count.
   - **Cells** — a table of swimlane–column pairs that define the range. For each cell, toggle the indicator badge on or off.
5. Click **Save** to store for everyone on the board, or **Cancel** to discard.

Only board administrators (or users with board configuration access) can save.

## How to use

- The covered block of cells is outlined with a **dashed blue border** so the range shape is clear.
- On cells with the indicator enabled, a badge shows **current / limit** with color: **green** (under), **yellow** (at), **red** (over).
- When the range exceeds its limit, all cells in the range get a **semi-transparent red** background.
- **Disabled** ranges display a **hatched overlay** and show no active WIP behavior — useful for marking areas without enforcing limits.
- All issues within the range's cells count toward the **single shared limit**.

## Usage scenarios

- "I want to cap the total number of issues across the 'In Progress' column and 'Frontend' swimlane at 5."
- "I want to visually group a block of cells without enforcing a limit by marking it as disabled."
- "I want to count only bugs inside a specific cell range."
- "I want different cell ranges with independent limits for different parts of the board."

## See also

- [Column Group WIP Limits](/docs/features/wip-limits/column-limits)
- [Swimlane WIP Limits](/docs/features/wip-limits/swimlane-limits)
- [Per-person WIP Limits](/docs/features/wip-limits/personal-limits)
- [General Settings](/docs/settings)
