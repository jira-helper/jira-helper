---
sidebar_position: 1
---

# Column Group WIP Limits (CONWIP)

## Overview

Column Group WIP Limits let you group multiple columns under a shared work-in-progress limit (**CONWIP** — Constant Work In Progress). Instead of setting a limit per column, you define a single limit for a group of columns, and all issues in those columns count toward it together.

**Why this matters:** Individual column limits break when a workflow stage naturally spans multiple columns (e.g., "In Progress" → "Review" → "QA"). A CONWIP group caps the total work in the entire stage, which is how most teams actually manage flow.

**Where it appears:** The feature activates on the **Board** view. Configuration is done through **Board Settings → Columns** tab, in the extension's settings dialog.

## Prerequisites

- **Board administrator** permissions on the target Jira board (required to save configuration to board properties)
- Jira Helper extension [installed](/docs/getting-started/installation) and enabled
- A Scrum or Kanban board with at least **two columns**

## Constraints

- A column can belong to **at most one group**. You cannot place the same column in two different groups.
- The maximum number of column groups is determined by the number of columns on your board (one group needs at least one column).
- Settings are stored as **board properties** — all team members with board access see the same groups and limits.

<!-- SCREENSHOT: The column group configuration dialog with drag-and-drop interface, showing two groups created: "Development (3 columns)" and "Testing (2 columns)" with max limits set -->

---

## User Jobs

### Create a column group

**Goal:** Group several columns and set their shared WIP limit.

1. Open **Board Settings** → **Columns** tab.
2. Click **Column group WIP limits** to open the configuration dialog.
3. Drag columns into a group. Each group gets a default name you can rename.
4. Set the **Max issues** number for the group.
5. Optionally set a **custom hex color** for the group header (see [Set a custom group header color](#set-a-custom-group-header-color)).
6. Click **Save** to store the configuration. The board updates immediately.

### Edit a column group

**Goal:** Change a group's name, limit, member columns, or filters.

1. Open the column group configuration dialog (Board Settings → Columns → Column group WIP limits).
2. Modify any group: rename it, change the **Max issues** value, drag columns in or out, adjust swimlane/issue type filters.
3. Click **Save**. The board reflects changes immediately.

### Delete a column group

**Goal:** Remove a group and free its columns.

1. In the column group configuration dialog, locate the group to delete.
2. Click the **delete icon** (trash/X) on the group header.
3. The group's columns return to the ungrouped pool.
4. Click **Save** to finalize.

<!-- SCREENSHOT: Configuration dialog with a delete icon (X) highlighted on a group header, and columns flowing back to the available pool -->

### Configure swimlane scoping

**Goal:** Choose which swimlanes count toward the group's limit.

1. In the column group configuration dialog, click a group's **swimlane** filter.
2. Choose **All swimlanes** (default) to count issues from every swimlane, or select specific swimlanes.
3. Only issues in the selected swimlanes are counted toward the limit.
4. Click **Save** to apply.

### Filter by issue types

**Goal:** Count only certain issue types toward the group's limit.

1. In the column group dialog, click the **issue type** filter for a group.
2. Toggle **Count all issue types** off.
3. Select a **project** and pick specific issue types (Bug, Story, Task, etc.).
4. Only matching issue types are counted. Other issues in the group's columns are ignored.
5. Click **Save** to apply.

### Set a custom group header color

**Goal:** Give the column group a distinct header color for quick visual identification.

1. In the column group dialog, click the **color picker** for the group.
2. Enter a **hex color** value (e.g., `#ff5630`) or use the picker.
3. The group's column header renders with this color on the board.
4. If no color is set, a color is derived automatically from the group name.

### Board view: monitoring

**Goal:** See group fullness and overload state on the board.

1. On the board, the **first column** of each group displays a **current / limit** badge on its header (e.g. `7 / 10`).
2. The column group header has a colored background matching the group's assigned color.
3. When the group **exceeds** its limit, the column area gets a **red background** to signal overload.
4. Swimlane and issue type filters are respected — not all visible issues necessarily count toward the badge.

<!-- SCREENSHOT: Board view showing a column group "Development" with "7 / 10" badge in green, and "Testing" group with "12 / 8" badge in red with red background highlighting overload -->

---

## Walkthrough Example

**Scenario:** Your team's workflow has three columns for the development stage: "In Progress", "Code Review", and "QA". You want a shared limit of 8 issues across all three columns.

1. Open your board → click **Board Settings** → **Columns** tab → **Column group WIP limits**
2. Drag "In Progress", "Code Review", and "QA" into a new group
3. Rename the group to **Development**
4. Set **Max issues** to `8`
5. Optionally set the group color to `#0052cc` (blue)
6. Click **Save**

Result: The "In Progress" column header now shows e.g. `6 / 8`. When your team pulls the 9th issue into any of the three columns, the group turns red, signaling overload.

---

## Troubleshooting

### Badge count doesn't match visible card count

1. Check the group's **swimlane filter** — issues in excluded swimlanes are not counted
2. Check the group's **issue type filter** — only selected issue types contribute to the count
3. The badge counts issues across **all columns** in the group, not just the column where the badge appears
4. Sub-tasks may be excluded depending on your filter configuration

### Group color/counter not rendering on the board

1. **Refresh** the board page (F5) — the DOM may need a reload after settings save
2. Check that the group has at least **one column** assigned (empty groups don't render)
3. Verify the extension is **enabled** and you're on a **board view** (not backlog)
4. If columns were renamed in Jira after group creation, the old column references may be broken — delete and recreate the group

### Settings not saving / "Save" button does nothing

1. Confirm you have **board administrator** permissions (board property writes fail silently without admin)
2. Check that all groups have a **Max issues** value set (blank limit = invalid group)
3. Try refreshing the page and re-entering the settings dialog

### Column already belongs to another group

Each column can belong to **at most one group**. If you see a column greyed out in the available pool, it's already in a group. Remove it from its current group first, then drag it to the new one.

## See Also

- [Swimlane WIP Limits](/docs/features/wip-limits/swimlane-limits) — per-swimlane caps, complementing column group limits
- [Personal WIP Limits](/docs/features/wip-limits/personal-limits) — per-person workload caps
- [Cell WIP Limits](/docs/features/wip-limits/cell-limits) — column + swimlane intersection limits
- [Board Properties & Local Storage](/docs/settings) — understand where settings are stored
- [Quick Start](/docs/getting-started/quick-start) — your first WIP limit in 2 minutes
- [FAQ](/docs/advanced/faq) — common questions and known limitations
