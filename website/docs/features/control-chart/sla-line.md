# SLA Line

## Overview

Horizontal reference line on Jira's **Control Chart** report showing a service-level agreement threshold. Displays a shaded band, legend entry, and percentile label for work at or under the target.

---

## User Jobs

### Set SLA value in days

**Goal:** See how much work falls within a target time frame.

1. Open **Reports** for your board → choose **Control Chart**.
2. In the chart options area, enter a value in the **SLA** field (in days).
3. The chart updates live: a horizontal line appears at the threshold with a shaded band beneath it.
4. The legend gains an **SLA** entry; hover the line to see the percentile of tasks at or under the SLA.

### Save SLA to board property (requires edit permissions)

**Goal:** Persist the SLA value so it loads automatically for everyone using this board.

1. After setting the SLA value, click **Save** below the SLA field.
2. The value is written to the board's Jira properties.
3. On subsequent visits, the SLA line restores automatically for all users.
4. Requires **edit board** permissions; without them, the Save button is hidden and the SLA is session-only.

### Reports view: SLA line with shaded band, legend, percentile label

**Goal:** Read the chart with SLA context.

1. When SLA is set, the **Control Chart** shows:
   - A horizontal **reference line** at the SLA value.
   - A **shaded band** beneath the line for quick visual assessment.
   - A legend entry labelled **SLA**.
   - A **percentile label** indicating the share of completed items at or under that threshold.
2. The line updates live as you change the value.
