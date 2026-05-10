# Sub-tasks Progress

| | |
|---|---|
| Где настраивается | Board Settings → Sub-tasks progress tab |
| Где видно | Board (card detail view in tracked columns) |
| Settings apply to | For the whole team ||

## Цель

Show stacked progress bars and/or compact counters on board cards for child and linked work — sub-tasks, epic children, linked issues, and optional external links — in To Do, In Progress, Done, and Blocked buckets at a glance.

## Как настроить

1. Open your Jira board and click **Jira Helper** next to the sidebar.
2. Open the **Sub-tasks progress** tab.
3. Turn the feature on. Use **Reset all settings** to restore defaults.
4. Under **Tracked columns**, choose which board columns show progress on cards.
5. In the **Counting** section, enable desired sources: epic children, sub-tasks, linked issues (optionally filtered by link type), and external links.
6. Configure **Grouping**: select a default grouping field (project, assignee, issue type, etc.), define ignored groups, and create custom groups with names, rules, bar-vs-counter style, colors, and visibility.
7. Map Jira **statuses** to the four progress categories (to do, in progress, done, blocked). Statuses left unmapped are excluded from totals.
8. Optionally enable **Blocked/Flagged** handling to count flagged issues as blocked and show warning hints on cards.
9. Adjust **Colors** — choose a preset scheme or a custom palette.

Settings are per board and saved by users with board-editing permission.

## Как использовать

- In tracked board columns, each card displays configured progress bars and/or counters.
- The progress strip shows stacked segments (green = done, blue = in progress, gray = to do, red = blocked) or a single combined bar.
- Numeric counters show counts for each status category.
- Groups can be configured to hide when all items are complete or to show only incomplete work.
- If blocked/flagged handling is enabled, warning text appears on the card when related issues are blocked or flagged.

## Сценарии использования

- **Team lead monitoring:** See progress of epics and stories directly from the board without opening each issue.
- **Workload distribution:** Group progress by assignee or project to understand task distribution.
- **Bottleneck detection:** Spot blocked subtasks via warning indicators on the parent card.
- **Cross-project tracking:** Use linked issues to track progress across projects.

## Устранение неполадок

- **Progress bar not appearing:** Verify the feature is enabled and the column is in the tracked columns list.
- **Wrong category for a status:** Check the status-to-progress mapping in settings; ensure the correct status names are assigned.
- **Issues not counted:** Confirm the relevant source (sub-tasks, epic children, links) is enabled and that statuses are mapped.
- **Performance concerns:** Limit the number of tracked columns and sources to reduce Jira API load.

## См. также

- [Card Colors](/docs/features/board-visualization/card-colors)
- [Column Limits](/docs/features/wip-limits/column-limits)
