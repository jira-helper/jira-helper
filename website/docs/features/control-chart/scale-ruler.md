---
sidebar_position: 2
---

# Scale Ruler (Control Chart Grid)

## Overview

Measurement overlay on Jira's **Control Chart** report. Adds horizontal guide lines at Fibonacci or linear intervals to help read lead/cycle time against story-point–style steps.

**Why:** The Control Chart's y-axis shows days, but interpreting where a data point falls between axis labels requires squinting. The Scale Ruler overlays reference lines at configurable intervals so you can instantly map scatter positions to day values.

**Where:** Reports → Control Chart → Grid Overlay checkbox in the chart options area.

**How it works:**
- Toggle the grid overlay on/off via a checkbox in the chart options
- Choose from Fibonacci (1,2,3,5 or 1,2,3,5,8) or Linear presets
- Drag the overlay vertically to align it with the chart's y-axis
- Resize the overlay height to control line density
- Position and size persist per session only (not saved to board properties)

<!-- SCREENSHOT: Control Chart with grid overlay enabled — horizontal dotted lines across the chart labelled "1", "2", "3", "5" (Fibonacci preset), overlay positioned to align with y-axis ticks -->

---

## Prerequisites

- Access to the board's **Reports → Control Chart**
- The Control Chart must have data points rendered (at least one completed issue in the selected time range)
- Fibonacci presets are best suited for time ranges under 20 days; use Linear mode for longer timeframes

---

## Configuration Reference

| Preset | Lines | Step Size | Best For |
|---|---|---|---|
| **Fibonacci (1,2,3,5)** | 4 | N/A — fixed intervals | Short cycles: 1–2 week sprints |
| **Fibonacci (1,2,3,5,8)** | 5 | N/A — fixed intervals | Medium cycles: 2–3 week sprints |
| **Linear** | variable | Configurable (e.g., 1, 2, 5, 10) | Long cycles or custom granularity |

For **Linear** preset, the step size field accepts positive integers. A step of `1` places lines at every day mark; a step of `10` places lines every 10 days.

---

## User Jobs

### Enable the grid overlay

**Goal:** Show horizontal guide lines on the Control Chart.

1. Navigate to your board → **Reports** → **Control Chart**.
2. In the chart options area below the chart, locate the **Grid overlay** checkbox.
3. Check the box.
4. Horizontal guide lines appear over the chart area.

### Select a preset: Fibonacci or Linear

**Goal:** Choose interval spacing for the grid lines.

1. With the grid enabled, use the **preset selector** in the chart options.
2. Available presets:
   - **Fibonacci (1,2,3,5)** — 4 guide lines at days 1, 2, 3, 5
   - **Fibonacci (1,2,3,5,8)** — 5 guide lines at days 1, 2, 3, 5, 8
   - **Linear** — evenly spaced lines (step size configurable)
3. Lines reposition immediately when you switch presets.

### Drag and resize the overlay

**Goal:** Align grid lines with chart data points.

1. **Drag:** Move your cursor to the **top edge** of the grid overlay — the cursor changes to a grab icon. Click and drag the top edge to reposition the overlay vertically against the chart's y-axis.
2. **Resize:** Drag the overlay's bottom edge to adjust its height and line density.
3. Position and size persist within the current session. Refreshing the page or navigating away resets them to default values.

### Read the chart with scale lines

**Goal:** Interpret the Control Chart with measurement context.

1. Each horizontal guide line is labelled with the interval value (e.g., `1`, `2`, `3`, `5` days).
2. The labels help map vertical scatter positions to day counts or story point equivalents.
3. The grid is purely visual — it does not affect chart data, axis scaling, or Control Chart calculations.

---

## Troubleshooting

### Grid overlay checkbox has no effect

- The Control Chart must have actual data rendered. If the chart is empty (no issues completed in the selected time range), the grid cannot be overlaid. Change the chart's time range or switch to a board with recent activity.
- Ensure the Jira Helper extension is active on the page. Check the extension icon in the browser toolbar — if grayed out, click it and select the site.

### Grid lines don't align with axis labels

- **Drag the top edge** of the grid overlay to align it with the chart's zero/axis origin. The overlay starts at a default position that may not match your chart's rendering.
- Zoom level can affect alignment — try refreshing the page at 100% browser zoom.
- The grid is placed on top of the chart using page styling. If the Control Chart itself has custom styling or plugins, the overlay may need manual repositioning.

### Drag handle not responding

- The drag zone is the **top edge** of the overlay, not the entire overlay area. Move your cursor to the very top border — the cursor changes to a grab/grabbing icon when you're over the drag handle (see [Drag and resize the overlay](#drag-and-resize-the-overlay)).
- If still unresponsive, try clicking the top edge once to give it focus before dragging.

### Lines or labels missing after switching presets

- Switching presets resets the overlay position. Re-drag the overlay to realign it.
- If labels are clipped, resize the overlay taller to increase line spacing.

---

## See Also

- [SLA Line](/docs/features/control-chart/sla-line) — SLA threshold on the same chart
- [Jira Help: Control Chart](https://support.atlassian.com/jira-software-cloud/docs/view-and-understand-the-control-chart/)
- [FAQ](/docs/advanced/faq)
