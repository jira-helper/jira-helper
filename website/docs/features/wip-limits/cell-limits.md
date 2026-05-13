---
---

import {CellWipMockup} from '@site/src/components/CellWipMockup';

# WIP Limits by Cells

| | |
|---|---|
| Where configured | «Board Settings» → «Columns» → «Edit WIP limits by cells» |
| Where visible | Board (detail view) |
| Settings apply to | For the whole team |

## Purpose

Define a single work-in-progress limit for a custom block of board cells (column–swimlane intersections). The covered area is outlined, optional per-cell counters show usage, and overloaded cells are visually highlighted. Ranges can be marked as disabled for visual-only grouping.

<CellWipMockup />

The cell at **Team Backend × In Progress** has a WIP limit of 3 — it currently holds 4 issues (overload, dashed border, red badge **4/3**).

## How to configure

### Where to find settings

1. Open **«Board settings»**.
2. Go to the **«Columns»** tab.
3. Click **«Edit WIP limits by cells»**.

### How to configure

In the dialog you can add, edit, or delete ranges. For each range:

- **Set a name**: a label for the range.
- **Set a limit**: the numeric cap for all issues inside the range.
- **Mark as disabled**: toggle a hatched overlay with no active WIP behavior — useful for visual grouping without enforcing limits.
- **Choose issue types**: optionally narrow which issue types count toward the limit.
- **Define cells**: use the table of swimlane–column pairs to select which cells belong to the range. For each cell, toggle the indicator badge on or off.

Click **«Save»** to store for everyone on the board, or **«Cancel»** to discard.

## How to use

- The covered block of cells is outlined with a **dashed blue border** so the range shape is clear.
- On cells with the indicator enabled, a badge shows **current / limit** with color: green (under), yellow (at), red (over).
- When the range exceeds its limit, all cells in the range get a **semi-transparent red** background.
- **Disabled** ranges display a **hatched overlay** and show no active WIP behavior — useful for marking areas without enforcing limits.
- All issues within the range's cells count toward the **single shared limit**.

## Usage scenarios

- "I want to cap the total number of issues across the 'In Progress' column and 'Frontend' swimlane at 5."
- "I want to visually group a block of cells without enforcing a limit by marking it as disabled."
- "I want to count only bugs inside a specific cell range."
- "I want different cell ranges with independent limits for different parts of the board."
