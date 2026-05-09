---
sidebar_position: 3
---

# Features Overview

Jira Helper is a browser extension that brings professional Kanban capabilities to Jira: WIP limits on columns, swimlanes, and people; full-card color highlighting; Gantt timelines; and analytics overlays. It solves the gap between Jira's flexible issue tracking and the structured workflow controls teams need to manage flow, spot bottlenecks, and prevent overload.

All features are optional and configurable per board. Settings are shared with your team (via Jira board properties) or kept personal (local storage), depending on the feature. See [Board Properties & Local Storage](/docs/settings) for the full breakdown.

> **New to Jira Helper?** Start with the [Quick Start guide](/docs/getting-started/quick-start).

**Jira terms used below:**
- **JQL** — Jira Query Language; a SQL-like syntax for filtering issues (e.g., `priority = High`)
- **Swimlane** — horizontal rows on a board that categorize issues by assignee, epic, or custom criteria

<!-- SCREENSHOT: An annotated Jira board with several Jira Helper features active — column WIP badges, colored cards, days-in-column labels, swimlane histogram -->

---

## WIP Limits

Control work-in-progress at multiple levels to prevent team overload and identify bottlenecks.

- **[Column Group WIP Limits](/docs/features/wip-limits/column-limits)** — Share a single WIP cap across multiple columns (CONWIP: Constant Work In Progress). Use when your workflow stage spans several columns and you want to limit total work in that stage.
- **[Swimlane WIP Limits](/docs/features/wip-limits/swimlane-limits)** — Set per-lane caps (e.g., 3 for Expedite, 10 for Normal). Allows different throughput constraints for different work streams on the same board.
- **[Personal WIP Limits](/docs/features/wip-limits/personal-limits)** — Cap how many issues each team member can have in progress at once. Helps balance workload and prevents single-person bottlenecks.
- **[Field Value WIP Limits](/docs/features/wip-limits/field-limits)** — Allocate capacity based on any issue field value (e.g., max 5 per component, max 3 per priority). Use for cross-cutting capacity constraints.
- **[Cell WIP Limits](/docs/features/wip-limits/cell-limits)** — Set WIP limits on column + swimlane intersections for fine-grained control. Useful when different swimlanes have different flow rules within the same column.

## Board Visualization

Improve board readability with visual cues that surface priority, distribution, and status.

- **[Card Colors](/docs/features/board-visualization/card-colors)** — Fill the entire card background with the color defined by Jira's native Card Colors JQL rules. Makes priority and type distinctions immediately obvious on crowded boards, where Jira's default thin left-edge strip is easy to miss.
- **[Swimlane Histogram](/docs/features/board-visualization/swimlane-histogram)** — Bar chart showing issue distribution across swimlanes. Quickly identify overloaded lanes and uneven work distribution.

## Card Information

Surface additional metadata directly on issue cards to reduce clicks and improve context.

- **[Days in Column](/docs/features/card-information/days-in-column)** — Shows how long each issue has been sitting in its current column. Helps identify stuck items and aging work that may need attention.
- **[Days to Deadline](/docs/features/card-information/days-to-deadline)** — Countdown to the issue due date with color coding (green → yellow → red as deadline approaches). Keeps deadlines visible without opening each issue.
- **[Issue Links Display](/docs/features/card-information/issue-links-display)** — Show linked issue keys and summaries directly on cards. Eliminates the need to open an issue just to see what it's linked to.
- **[Issue Condition Checks](/docs/features/card-information/issue-condition-checks)** — Display custom icon badges on cards based on JQL conditions (e.g., a warning icon when no reviewer is assigned). Use for automated compliance indicators.

## Progress & Planning

Track work completion and visualize timelines beyond the board view.

- **[Sub-tasks Progress](/docs/features/sub-tasks-progress)** — Progress bars on parent cards showing the ratio of completed subtasks or epic children. Instantly see how close a parent issue is to completion without drilling down.
- **[Gantt Chart](/docs/features/gantt-chart)** — Interactive timeline on any issue page showing related tasks (subtasks, epics, linked issues) with zoom, pan, status breakdown, and configurable date sources. Useful for release planning and dependency tracking.

## Analytics

Overlay reference lines and measurement tools on Jira's native charts for better estimation and SLA analysis.

- **[SLA Line](/docs/features/control-chart/sla-line)** — Add a percentile reference line (e.g., 85th percentile) to Jira's Control Chart. Visualize how your actual cycle times compare to your SLA targets.
- **[Scale Ruler](/docs/features/control-chart/scale-ruler)** — Overlay a measurement grid on the Control Chart for estimation analysis and forecasting.

## Utilities

Productivity aids that don't fit into the workflow categories above.

- **[Flag on Issue Panel](/docs/features/flag-issue)** — Add visual flag indicators to issue panels for quick urgency scanning.
- **[Comment Templates](/docs/features/issue-templates/comment-templates)** — Save and insert reusable comment templates with a single click. Reduce repetitive typing for status updates, QA sign-offs, or Go/No-Go messages.
- **[Data Blurring](/docs/features/data-blurring)** — Blur sensitive text (issue keys, summaries, names) on the board. Useful for screenshots during presentations or screen sharing without exposing customer data.
- **[Local Settings](/docs/features/local-settings)** — Language and personal preferences stored in your browser only.

## See Also

- [Quick Start](/docs/getting-started/quick-start)
- [Installation](/docs/getting-started/installation)
- [Board Properties & Local Storage](/docs/settings)
- [JQL Reference](/docs/advanced/jql-reference)
- [FAQ](/docs/advanced/faq)
