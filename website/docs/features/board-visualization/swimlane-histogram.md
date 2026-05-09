---
sidebar_position: 2
---

# Swimlane Histogram (Chart Bar)

## Overview

The Swimlane Histogram adds a compact bar chart next to each swimlane header on the board, showing how issues in that swimlane are distributed across columns.

**Why:** In boards with many swimlanes (assignee, epic, or custom), it is hard to see at a glance whether work is balanced or bottlenecks are forming. The histogram provides instant per-swimlane distribution data without scrolling or counting.

**Where:** Appears automatically on board detail views (`?view=detail`) when swimlanes are active. No settings panel or configuration needed — zero configuration, zero admin intervention.

**How it works:**
- For each swimlane, the chart counts issues in every column
- Bars are drawn proportionally — the tallest bar represents the column with the most issues
- Gray bars: darker bars indicate columns with issues, lighter placeholders for empty columns
- Hover a bar to see a tooltip with the column name and exact issue count
- Refreshes automatically when the board changes (drag-and-drop, filter changes, etc.)

**Nature of the feature:** The histogram is a **read-only, non-interactive** visualization. You cannot click bars to filter, drag to reorder, or configure anything. It purely displays issue distribution data for quick visual assessment.

**Prerequisites:**
- Swimlanes must be active on the board (any swimlane strategy works)
- The board must be in **detail view** (`?view=detail`)

**Limitations:** Does not appear on simplified or alternate board views (`?view=planning`, `?view=summary`).

<!-- SCREENSHOT: Annotated board view showing a swimlane header with the histogram bar chart on the right side, with hover tooltip visible -->
<!-- SCREENSHOT: Board with many columns showing horizontal scroll behavior of the histogram -->

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

## Edge Behavior

- **Empty swimlane:** A swimlane with no issues displays all bars in a light gray placeholder style — all bars are rendered at the same minimal height. No tooltips are available since there are no issue counts.
- **Many columns:** Boards with a large number of columns (15+) may cause the histogram to extend wide. The bars compress but remain distinguishable. If necessary, scroll the board horizontally — the histogram scrolls with the swimlane header.
- **Single issue:** A swimlane with only one issue shows one dark bar (for the column containing the issue) and all other bars in light gray.

## Technical Notes

- **Refresh triggers:** The histogram recalculates and re-renders on: drag-and-drop card moves, Quick Filter changes, swimlane strategy changes, board reloads, and JQL filter updates.
- **Data source:** Issue counts are derived from the visible DOM — the histogram reads what is currently rendered on the board. It does not query Jira's API separately.
- **Performance:** Rendering is lightweight and has no noticeable impact on boards with fewer than 500 visible cards.

## Troubleshooting

### Histogram is not appearing

1. Ensure you are in **board detail view** (`?view=detail`). The histogram does not render on Backlog (`?view=detail&layout=list`), Planning, or Summary views.
2. Swimlanes must be **active** on the board. If the board has no swimlane rows (e.g. swimlane is set to "None"), the histogram has nothing to render.
3. The feature is automatic and has no settings toggle — if it's not appearing, check that jira-helper is installed and enabled.
4. Refresh the board page.

### Histogram shows no bars (blank area)

1. If the board has swimlanes but **no issues** are visible (empty board, all issues filtered out), the histogram renders empty.
2. Quick Filters may be hiding all issues — clear all filters to verify.

### Tooltip is not showing on hover

1. Hover must be directly over a bar. Light gray placeholder bars for empty columns do not show tooltips.
2. If a bar is very short (very few issues in that column), the hover target is small — try hovering at the very top of the bar.
3. Browser extensions or ad blockers that interfere with tooltip rendering may cause issues — test in an incognito window.

## Related Features

- [Card Colors](/docs/features/board-visualization/card-colors) — full card highlighting based on JQL
- [Column Group WIP Limits](/docs/features/wip-limits/column-limits) — CONWIP limits with visual column grouping
- [Swimlane WIP Limits](/docs/features/wip-limits/swimlane-limits) — per-swimlane WIP caps

## See Also

- [Atlassian: Configure swimlanes](https://support.atlassian.com/jira-software-cloud/docs/configure-swimlanes/) — official Jira swimlane documentation
