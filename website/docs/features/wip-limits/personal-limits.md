---
sidebar_position: 3
---

# Personal WIP Limits

## Overview

Personal WIP Limits control how many issues each teammate can have in progress at once. Each person gets avatar badges on the board showing their current load against the limit, with color-coded status and optional card highlighting when overloaded.

Use this to balance workload across the team, spot overload before standups, and focus on one person's issues with a single click. The feature appears on **Board** view and is configured in **Board Settings → Columns tab**.

**Prerequisites:**
- **Board admin** permissions are required to configure limits
- Each teammate must have a **Jira avatar photo** set (the default silhouette is not rendered as a badge)
- The teammate must be a Jira user visible in the board's user picker

<!-- SCREENSHOT: Personal WIP limits configuration modal showing the person search field, Max issues input, and scope filters -->
<!-- SCREENSHOT: Board view toolbar area showing avatar badges in green, yellow, and red states -->
<!-- SCREENSHOT: Board view with red-highlighted cards belonging to an over-limit person -->

## User Jobs

### Add a limit for a person

**Goal:** Set a WIP cap for a specific teammate.

1. Open **Board Settings** → **Columns** tab.
2. Click **Manage per-person WIP-limits**.
3. In the modal, use the **person search** field — start typing a name and select the user from the dropdown.
4. Set the **Max issues at work** number (minimum 1).
5. Click **Add limit**, then click **Save** to persist for all board users.
6. The avatar badge appears near the board title area immediately after saving.

### Configure scope: columns, swimlanes, issue types

**Goal:** Narrow the limit to specific columns, swimlanes, or issue types.

1. In the limit form, locate the scope filters:
   - **Columns** — toggle off **All columns** and select specific columns.
   - **Swimlanes** — toggle off **All swimlanes** and select specific swimlanes.
   - **Issue types** — toggle off **Count all issue types**, select a project, then pick types.
2. Only issues matching all active filters count toward the limit.
3. Multiple limits for the same person with different scopes are allowed (e.g. 3 issues in "In Progress" + 2 bugs anywhere).
4. Click **Save** to apply.

### Create shared limits (multiple people share one counter)

**Goal:** One WIP counter pooled across several people — each person sees the same shared total on their badge.

**How shared limits work:** When you configure multiple people with the same scope and limit value, all their assigned issues contribute to a single pooled counter. Each person's avatar badge displays the **same pooled count** against the **same shared limit**, not individual per-person counts.

1. In the per-person limits modal, add a limit for person A with a specific scope and limit value.
2. Add another limit for person B with the **identical scope** and **same limit number**.
3. The two limits are automatically recognized as a shared limit group — all issues assigned to any person in the group count toward the single shared counter.
4. Each person's badge shows `pooled_count / shared_limit` (e.g. both avatars show `7 / 10`).
5. Click **Save** to apply.

### Filter board by person

**Goal:** Show only issues that count toward a specific person's limit.

1. On the board, click a person's **avatar badge**.
2. The board filters to show only issues falling under that limit's scope.
3. All other cards are hidden.
4. Click the same avatar badge again to clear the filter and show all cards.
5. If a person has multiple limits, each limit has its own avatar badge with independent filtering.

### Board view: avatar badges and card highlighting

**Goal:** Monitor team workload at a glance.

1. Configured limits appear as **avatar badges** (Jira profile picture + count) in the board toolbar area.
2. Each badge shows **current / limit** (e.g. `2 / 5`).
3. Color coding:
   - **Green** — under the limit
   - **Yellow** — at the limit
   - **Red** — over the limit, with cards counting toward this limit highlighted with a red background
4. Issues assigned to the person that fall within the limit's scope are counted. Jira avatar is required for display.

## Troubleshooting

### Badges are not showing for some users

1. **No Jira avatar photo:** If the user has a default silhouette instead of a photo, the badge is not rendered. Have the user upload a profile photo in their Jira profile settings.
2. **User not found:** Ensure the user exists in Jira and is visible in the board's user picker. Deactivated users are not shown.
3. **No matching issues:** The badge only appears if there are issues assigned to the person within the limit scope. If all their issues are in excluded columns or filtered out by issue type scope, the badge shows `0 / limit` — but may appear small.
4. **Board view compatibility:** Badges appear only on board detail view (`?view=detail`). They do not appear on Backlog, Planning, or Simplified views.

### Badge count doesn't match expected number

1. **Scope filters:** Review the columns, swimlanes, and issue type filters for the limit. Only issues matching all three filter categories are counted.
2. **Assignee field:** The count uses Jira's Assignee field. Verify the issue is actually assigned to the person (not unassigned or assigned to someone else).
3. **Shared limit behavior:** If the limit is shared, the count shown on each person's badge is the pooled total for the entire group, not their individual count. This is intentional.

### Can't find a person in the search dropdown

1. The person must be a Jira user with access to the board's project.
2. User picker only shows users who have browsed that Jira instance at least once.
3. Type at least 2 characters to trigger the search.

## Related Features

- [Column Group WIP Limits](/docs/features/wip-limits/column-limits) — shared limits across multiple columns
- [Swimlane WIP Limits](/docs/features/wip-limits/swimlane-limits) — per-swimlane caps
- [Days in Column](/docs/features/card-information/days-in-column) — track how long issues stay in a column

## See Also

- [Atlassian: Manage board users](https://support.atlassian.com/jira-software-cloud/docs/manage-board-users/) — add or remove users from a board
