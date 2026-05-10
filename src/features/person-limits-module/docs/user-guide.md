# Per-person WIP Limits

| | |
|---|---|
| Where configured | Board Settings → Columns → Manage per-person WIP-limits |
| Where visible | Board (detail view) |
| Settings apply to | For the whole team |(`personLimitsSettings`) |

## Purpose

Cap how many issues each teammate can have in progress on the board. Each limit has its own maximum and scope (columns, swimlanes, issue types). The board shows avatar badges with counters, highlights overloaded cards, and supports one-click filtering to focus on a person's workload.

## How to configure

### Where to find settings

1. Open **Board settings** for the board.
2. Go to the **Columns** tab.
3. Click **Manage per-person WIP-limits**.

### How to configure

In the modal you can:

- **Search for a user**: find a teammate by name to create a limit for them.
- **Set a maximum**: enter the maximum number of issues the person can have in progress.
- **Narrow by columns**: restrict the limit to specific columns (e.g., "In Progress" only).
- **Narrow by swimlanes**: restrict the limit to specific swimlanes (e.g., "Frontend" only).
- **Narrow by issue types**: count only specific issue types (e.g., Bug, Task).
- **Add a limit**: click **Add limit** to save the entry. Use **Edit** to modify or **Delete** to remove existing limits.
- **Create multiple limits per person**: combine different scopes for the same person — each limit is counted and displayed independently.

#### Scope examples

| Desired behavior | How to set |
|---|---|
| Max 5 issues across the entire board | Limit: 5, all filters on "All" |
| Max 3 issues in "In Progress" | Limit: 3, Columns: In Progress |
| Max 2 bugs in "Code Review" | Limit: 2, Columns: Code Review, Issue types: Bug |
| Max 4 issues in the Frontend swimlane | Limit: 4, Swimlanes: Frontend |

Click **Save** to apply for everyone on the board, or **Cancel** to discard all unsaved changes.

## How to use

- Avatar badges appear in the toolbar area above the board, showing each person's **current / limit** count.
- Badge colors: **green** (under limit), **yellow** (at limit), **red** (over limit).
- When a person exceeds a limit, their cards that contribute to that limit are highlighted in **red**.
- **Click a badge** to filter the board — only cards matching that limit's scope remain visible. Click again to clear the filter.

## Usage scenarios

- "I want to see who is overloaded at a glance during standup."
- "I want to limit developers to 3 tasks in progress, regardless of column."
- "I want to count only bugs for a particular person's limit."
- "I want to filter the board to show only items assigned to a specific team member."

## See also

- [Column Group WIP Limits](/docs/features/wip-limits/column-limits)
- [Swimlane WIP Limits](/docs/features/wip-limits/swimlane-limits)
- [WIP Limits by Field](/docs/features/wip-limits/field-limits)
- [General Settings](/docs/settings)
