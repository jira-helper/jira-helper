---
sidebar_position: 3
---

# Features Overview

This page is a map of everything Jira Helper can do. Each item links to the full guide. All features are **optional**; you turn them on per board (or per issue, where noted) and configure them in the **Jira Helper** panel or in Jira board settings.

> **New here?** Install from [Installation](/docs/getting-started/installation), then try [Quick Start](/docs/getting-started/quick-start).

## WIP limits

Work-in-progress caps and workload rules on the board.

- **[Column group WIP limits (CONWIP)](/docs/features/wip-limits/column-limits)** — shared limit across grouped columns
- **[Swimlane WIP limits](/docs/features/wip-limits/swimlane-limits)** — limit issues per swimlane
- **[Personal WIP limits](/docs/features/wip-limits/personal-limits)** — per-person limits with avatar badges
- **[Field value WIP limits](/docs/features/wip-limits/field-limits)** — capacity-style limits from a field
- **[Cell WIP limits](/docs/features/wip-limits/cell-limits)** — limits for a swimlane × column cell

## Board visualization

How the board itself looks and reads.

- **[Card colors](/docs/features/board-visualization/card-colors)** — full-card tint from Jira Card Color rules
- **[Swimlane histogram](/docs/features/board-visualization/swimlane-histogram)** — column distribution bars per swimlane (no config)

## Card information

Extra badges and context on cards (detail view unless noted).

- **[Days in column](/docs/features/card-information/days-in-column)** — dwell time with warning/danger thresholds
- **[Days to deadline](/docs/features/card-information/days-to-deadline)** — countdown / overdue from a date field
- **[Issue links display](/docs/features/card-information/issue-links-display)** — related issues as chips on the card
- **[Issue condition checks](/docs/features/card-information/issue-condition-checks)** — JQL-driven icon badges

## Progress and planning

- **[Sub-tasks progress](/docs/features/sub-tasks-progress)** — progress bars and counters from subtasks, epic children, links
- **[Gantt chart](/docs/features/gantt-chart)** — timeline on the issue page (classic view)

## Control chart (reports)

On Jira’s **Control Chart** report.

- **[SLA line](/docs/features/control-chart/sla-line)** — horizontal SLA with percentile band (saved per board)
- **[Scale ruler](/docs/features/control-chart/scale-ruler)** — draggable measurement grid (session-only; not Firefox)

## Other tools

- **[Flag on issue](/docs/features/flag-issue)** — highlights flagged issues in hierarchy and panels (no config)
- **[Comment templates](/docs/features/issue-templates/comment-templates)** — reusable comment snippets from the editor toolbar
- **[Data blurring](/docs/features/data-blurring)** — blur titles and images for screen sharing (context menu)
- **[Local settings](/docs/features/local-settings)** — extension UI language (Auto / EN / RU)

## Advanced

- **[JQL reference](/docs/advanced/jql-reference)** — tips for queries used in settings
- **[FAQ](/docs/advanced/faq)** — common questions

---

**Compatibility:** Jira **Server** and **Data Center** only; **Jira Cloud** is not supported. **Browsers:** Chrome, Edge, and other Chromium-based browsers (minimum Chrome **88**), and Firefox (**58+**). **Safari** is not supported.

How settings are stored (board vs your browser) is explained in [Board properties & local storage](/docs/settings).
