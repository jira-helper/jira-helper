# WIP limits by cells

Put a single work-in-progress limit on a custom block of board cells (where a column meets a swimlane), with a clear outline, optional counters per cell, and visible “over limit” styling.

## What it does

- Lets you name a **range** of cells and set one shared limit for all issues that sit inside those cells.
- You choose which column–swimlane intersections belong to the range; you can turn the numeric badge on or off for individual cells in the range.
- Optionally limits counting to certain issue types only.
- You can mark a range as **visually disabled**: it shows a striped “off” style and does not behave like an active limit badge.
- Issues in every cell of the range count together toward that one limit.

## How to set up

1. Open **Board settings**.
2. Go to the **Columns** tab.
3. Click **Edit WIP limits by cells**.
4. Add, edit, or remove ranges. For each range set a name, the limit, whether it is disabled for display, optional issue types, and a table of swimlane/column pairs; use the per-cell option to show or hide the indicator on that cell.
5. Click **Save** to store for the board, or **Cancel** to leave without saving.

Saved ranges are applied board-wide for everyone who views the board with the extension.

## Behavior on the board

- The covered block of cells is outlined with a **dashed blue border** so the shape is obvious.
- On cells where you enabled the indicator, a badge shows **how many issues** are in the range versus the **limit**, with color reflecting under, at, or over limit.
- When the range is **over** the limit, those cells get a **semi-transparent red** background.
- **Disabled** ranges show a hatched overlay so you can see the area is intentionally not enforced as an active limit.

Issue counting respects your board’s settings (for example sub-task handling), like other WIP features in the extension.
