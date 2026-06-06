---
---

import {ConwipBoardMockup} from '@site/src/components/ConwipBoardMockup';

# Column Group WIP Limits (CONWIP)

| | |
|---|---|
| Where configured | «Board Settings» → «Columns» → «Column group WIP limits»<br/>**or** Board toolbar → «Jira Helper» → «Column WIP Limits» tab |
| Where visible | Board (detail view) |
| Settings apply to | For the whole team |

## Purpose

Group multiple columns under a single work-in-progress limit, so cards across those columns count toward a shared cap. Optional scope by swimlane and issue type, plus visual per-group coloring and overload alerts.

<ConwipBoardMockup />

*Left:* group «Ready to Test + Testing» — 3 tickets, limit 5 (within limit). *Right:* group «Code review + In progress» — 5 tickets, limit 3 (overload).

## How to configure

### Where to find settings

The column WIP limits dialog opens in two ways:

**Via «Board Settings»:**

1. Open **«Board settings»** for your Scrum or Kanban board.
2. Go to the **«Columns»** tab.
3. Click **«Column group WIP limits»**.

**Via the Jira Helper panel on the board:**

1. On the board toolbar, open the **«Jira Helper»** panel.
2. Switch to the **«Column WIP Limits»** tab.

Both methods open the same dialog.

### How to configure

In the dialog you can:

- **Create a group**: drag a column into the empty area and name the group. The group gets a shared WIP limit — issues across all group columns are counted together.
- **Add columns to a group**: drag more columns from the list into a group.
- **Set a limit**: enter the maximum number of issues allowed across the group's columns.
- **Choose a color**: pick a color for the group's column headers — helps visually distinguish groups on the board. If skipped, a color is chosen automatically from the group name.
- **Choose swimlane scope**: restrict the limit to specific swimlanes.
- **Choose issue types**: specify which issue types (Bug, Task, Story, etc.) count toward the group's limit.

Click **«Save»** to store the configuration for the entire team on this board.

## How to use

- On the board, each column group shows a **current / limit** badge on its first column header.
- Grouped column headers are styled with the group's color so the group is easy to identify.
- When a group exceeds its limit, affected column areas turn red to make the overload obvious.
- If subtask counting is enabled in the board's column settings, subtasks are also counted toward the limit.

## Usage scenarios

- "I want to limit the total work-in-progress across Dev + Code Review + Testing as one shared cap."
- "I want bugs in the development columns to count separately from feature tasks."
