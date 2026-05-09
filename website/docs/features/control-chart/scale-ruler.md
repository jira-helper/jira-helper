# Scale Ruler (Control Chart Grid)

## Overview

Measurement overlay on Jira's **Control Chart** report. Adds horizontal guide lines at Fibonacci or linear intervals to help read lead/cycle time against story-point–style steps.

---

## User Jobs

### Enable grid overlay

**Goal:** Show horizontal guide lines on the Control Chart.

1. Open **Reports** for your board → choose **Control Chart**.
2. In the chart options area, check the **grid overlay** checkbox.
3. Horizontal guide lines appear over the chart area.

### Select preset: Fibonacci (1,2,3,5 / 1,2,3,5,8) or Linear

**Goal:** Choose interval spacing for the grid lines.

1. With the grid enabled, use the **preset selector** in the chart options.
2. Available presets:
   - **Fibonacci (1,2,3,5)** – 4 guide lines
   - **Fibonacci (1,2,3,5,8)** – 5 guide lines
   - **Linear** – evenly spaced lines (step size configurable)
3. Lines reposition immediately when you switch presets.

### Drag/resize the overlay position

**Goal:** Align grid lines with chart data points.

1. Drag the grid overlay vertically to reposition it against the chart's y-axis.
2. Resize the overlay height to control line density.
3. Position and size persist per session.

### Reports view: guide lines with SP/days labels

**Goal:** Read the chart with measurement context.

1. Each horizontal guide line is labelled with the interval value (e.g. `1`, `2`, `3`, `5` days).
2. The labels help map vertical scatter positions to day counts or story point equivalents.
3. The grid is purely visual — it does not affect chart data or axis scaling.
