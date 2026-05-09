---
sidebar_position: 1
---

# SLA Line

## Overview

Horizontal reference line on Jira's **Control Chart** report showing a service-level agreement threshold. Displays a shaded band, legend entry, and percentile label for work at or under the target.

**Why:** Jira's Control Chart has no built-in SLA line. Without it, you must mentally compare each data point to your SLA target — error-prone and slow. The SLA Line adds a persistent visual threshold so you can instantly see how much work meets the SLA and how much exceeds it.

**Where:** Reports → Control Chart (for any board) → SLA field in the chart options area. The line appears as a horizontal overlay on the chart.

**How it works:**
- Enter a numeric SLA value in days
- The chart updates on blur (when you click away from the SLA field) with a horizontal reference line, shaded band, and percentile label
- Save the value to board properties to persist it for all board users (requires edit permissions)
- Without edit permissions, the SLA value is session-only

<!-- SCREENSHOT: Control Chart with SLA line — a horizontal dashed line at 10 days with a light shaded band below it, legend entry "SLA (68%)", and percentile label "68% of issues complete within SLA" -->

---

## Prerequisites

- Access to the board's **Reports → Control Chart** (available on Scrum and Kanban boards)
- To **persist** the SLA value: **board edit permissions** (stored in [board properties](/docs/settings#board-properties-team-shared))
- Without edit permissions: you can still set and use the SLA line, but it resets when you leave the page

---

## User Jobs

### Set SLA value in days

**Goal:** See how much work falls within a target time frame.

1. Navigate to your board → **Reports** → **Control Chart**.
2. In the chart options area below the chart, locate the **SLA** field.
3. Enter a numeric value in **days** (e.g., `10` for a 10-day SLA).
   - Accepted values: positive integers and decimals (e.g., `1`, `7`, `14.5`). Negative values and zero are ignored.
   - Empty field removes the SLA line.
4. Click or tab **away from the field** (on blur). The chart updates:
   - A horizontal **reference line** at the SLA value
   - A **shaded band** beneath the line for quick visual assessment
   - A legend entry labelled **SLA**
   - A **percentile label** indicating the share of completed items at or under the threshold (e.g., `72%`)

### Save SLA to board property (requires edit permissions)

**Goal:** Persist the SLA value so it loads automatically for everyone using this board.

1. After setting the SLA value, click **Save** below the SLA field.
2. The value is written to the board's Jira properties.
3. On subsequent visits by any board member, the SLA line restores automatically.
4. If you lack **edit board** permissions, the **Save** button is hidden — the SLA is session-only and resets when you navigate away.

### Read the chart with SLA line

**Goal:** Interpret the Control Chart with SLA context.

1. When SLA is set, the **Control Chart** shows:
   - A horizontal **reference line** at the SLA threshold (in days)
   - A **shaded band** beneath the line — data points in the band are within SLA
   - A legend entry labelled **SLA**
   - A **percentile label** showing the share of completed work that meets the SLA (e.g., `85% of 142 issues`)
2. Data points above the line exceed the SLA — these are items that took longer than the target.
3. **Hover** the SLA line to see the exact percentile value.

---

## Edge Cases

| Scenario | Behavior |
|---|---|
| SLA = 0 | Line at zero, percentile = 0% (no item completes in zero time). Shaded band and legend still render. |
| SLA = empty | SLA line is removed entirely — the chart shows no SLA overlay. |
| SLA = negative (e.g., `-5`) | Value is ignored. Same as empty. |
| 0% of issues within SLA | Line shown, percentile label reads "0%". Shaded band has zero height. |
| Board has no completed issues | Percentile label shows "N/A" — percentile cannot be calculated with no data points. |
| Decimals (e.g., `2.5`) | Accepted. Line drawn at 2.5 days. Percentile reflects partial-day precision. |

---

## Troubleshooting

### Save button not visible

The **Save** button only appears if you have **board edit permissions** in Jira. Without them, you can still use the SLA line during your session, but the value will not persist. Ask your Jira board administrator to set the SLA value on your behalf.

### SLA line not appearing after typing a value

The line updates **on blur** — click or tab away from the SLA input field to trigger the update. The line does not update while you're actively typing.

### Percentile shows "N/A"

This occurs when the Control Chart has no completed issues to calculate against. Switch the chart's time range or ensure there are resolved issues in the selected period.

### Line appears at wrong position

The SLA value is in **calendar days**, not business days. A 5-day SLA draws a line at the 5-day mark on the chart's y-axis. Confirm your SLA target is expressed in calendar days.

---

## See Also

- [Scale Ruler (Control Chart Grid)](/docs/features/control-chart/scale-ruler) — measurement overlay on the same chart
- [Settings: Board Properties](/docs/settings#board-properties-team-shared)
- [Jira Help: Control Chart](https://support.atlassian.com/jira-software-cloud/docs/view-and-understand-the-control-chart/)
- [FAQ](/docs/advanced/faq)
