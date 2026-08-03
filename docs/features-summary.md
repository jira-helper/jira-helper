# Jira Helper Features

[Русская версия](./features-summary.ru.md)

A browser extension that enhances Jira with advanced visualization, WIP-limits, and workflow management tools.

---

## WIP-Limits and Flow Management

### Column WIP-Limits (CONWIP)
Set shared WIP limits across multiple columns to visualize Kanban-style combined constraints. When exceeded, column backgrounds turn red.

### Swimlane WIP-Limits
Exclude specific swimlanes (like Expedite) from column WIP calculations. Tasks in special swimlanes have their own limits.

### Personal WIP-Limits
Set per-person work-in-progress limits to balance workload across team members. Supports multi-person limits with shared or per-user modes.

### Field Value WIP-Limits
Limit work by field values for Capacity Allocation. Count cards by specific field values or sum numeric fields like Story Points.

### Cell WIP-Limits
Set limits on specific cells (column + swimlane intersections) or groups of cells.

---

## Board Visualization

### Card Colors
Full card highlighting based on JQL queries instead of just the left strip. Makes card categories immediately visible.

### Swimlane Chart Bar
Visual chart showing issue count distribution across columns for each swimlane. Hover to see details.

### Flag Indicator
Display issue flags on the issue detail panel (not just on the board).

### Data Blurring
Hide sensitive data when presenting your board to colleagues. Enable via context menu.

---

## Task Progress and Relationships

### Sub-tasks Progress
Progress bar on cards showing completion status of child tasks, subtasks within epics, or linked issues. Supports grouping by fields (Assignee, Project, etc.) and status progress mapping to To Do / In Progress / Done buckets.

### Issue Links Display
Show related issues directly on cards based on link types (Parent, Blocker, etc.) with optional JQL filtering.

### Days in Column
Badge showing how many days an issue has been in the current column. Configurable warning (yellow) and danger (red) thresholds per column.

### Days to Deadline
Badge showing remaining days until due date. Highlights overdue (red) and approaching deadlines (yellow).

---

## Analytics

### SLA Line for Control Chart
Add a Service Level Agreement threshold line to the Control Chart with automatic percentile calculation.

### Control Chart Ruler
Overlay measurement scales (Fibonacci, linear, etc.) to analyze if estimation scales match actual lead times.

---

## Issue Page

### Gantt Chart
Horizontal timeline on the classic issue view for related tasks, with date/status mappings, status progress mapping, bar colors, quick filters, and a local Feature enabled toggle.

### Comment Templates
Reusable comment snippets from the comment editor toolbar, with optional watchers and a local Feature enabled toggle.

## Templates

### Description Template
Save and reuse issue description templates. Stored locally in your browser for quick access during issue creation.

## Other

### Local Settings
Choose the extension UI language (Auto / English / Russian). Stored in your browser.

---

## Technical

### Request Identification
All extension requests include a special header `browser-plugin: jira-helper/{version}` for easy identification by Jira administrators.

---

## Compatibility

- Chrome 88+
- Firefox 58+
- Edge 88+ (Chromium)
- Jira Server / Data Center (Jira Cloud is not supported)

Full user docs: https://jira-helper.github.io/jira-helper/
