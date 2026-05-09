---
sidebar_position: 2
---

# Swimlane Histogram (Chart Bar)

## Overview

The Swimlane Histogram adds a compact bar chart next to each swimlane header on the board, showing how issues in that swimlane are distributed across columns.

**Why:** In boards with many swimlanes (assignee, epic, or custom), it is hard to see at a glance whether work is balanced or bottlenecks are forming. The histogram provides instant per-swimlane distribution data without scrolling or counting.

**Where:** Appears automatically on board detail views (`?view=detail`) when swimlanes are active. No settings panel or configuration needed.

**How it works:**
- For each swimlane, the chart counts issues in every column
- Bars are drawn proportionally — the tallest bar represents the column with the most issues
- Gray bars: darker bars indicate columns with issues, lighter placeholders for empty columns
- Hover a bar to see a tooltip with the column name and exact issue count
- Refreshes automatically when the board changes (drag-and-drop, filter changes, etc.)

**Limitations:** Does not appear on simplified or alternate board views (`?view=planning`, `?view=summary`).

---

## User Jobs

### Zero-config (no settings needed)

**Goal:** See the histogram without any setup.

- Open any board with swimlanes enabled in the standard detail view.
- The histogram is visible next to each swimlane header immediately — no board settings, toggles, or configuration required.
- The feature activates automatically on boards where `?view=detail` is active (the default board view).

### Board view: histogram bars, hover for tooltip with issue count

**Goal:** Interpret the per-swimlane issue distribution.

1. Look at the swimlane header row. On the right side of the header, a horizontal row of thin vertical bars is displayed — one bar per board column.
2. Compare bar heights: a taller bar means a larger share of that swimlane's issues reside in the corresponding column.
3. **Hover** any bar to reveal a tooltip showing:
   - The column name
   - The exact number of issues in that column for this swimlane
4. Use the histogram to spot imbalances at a glance:
   - A swimlane with all issues stacked in one column might indicate a bottleneck
   - A swimlane with issues spread evenly may indicate balanced flow
5. After dragging a card to another column or changing swimlane assignments, the histogram refreshes automatically to reflect the new distribution.
