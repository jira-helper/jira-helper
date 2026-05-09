---
sidebar_position: 1
---

# Column Group WIP Limits (CONWIP)

## Overview

Column Group WIP Limits let you group multiple columns under a shared work-in-progress limit (CONWIP — Constant Work In Progress). Instead of setting a limit per column, you define a single limit for a group of columns, and all issues in those columns count toward it together.

Use this when you want to cap the total number of issues across a workflow stage that spans multiple columns (for example "In Progress" + "Review" + "QA" as one group). The feature appears on **Board** view and is configured in **Board Settings → Columns tab**.

## User Jobs

### Create a column group

**Goal:** Group several columns and set their shared WIP limit.

1. Open **Board Settings** → **Columns** tab.
2. Click **Column group WIP limits** to open the configuration dialog.
3. Drag columns into a group. Each group gets a default name you can rename.
4. Set the **Max issues** number for the group.
5. Optionally set a **custom hex color** for the group header (see below).
6. Click **Save** to store the configuration. The board updates immediately.

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
2. Enter a **hex color** value (e.g. `#ff5630`) or use the picker.
3. The group's column header renders with this color on the board.
4. If no color is set, a color is derived automatically from the group name.

### Board view: usage at a glance

**Goal:** Monitor group fullness on the board.

1. On the board, the **first column** of each group displays a **current / limit** badge on its header (e.g. `7 / 10`).
2. The column group header has a colored background matching the group's assigned color.
3. When the group **exceeds** its limit, the column area gets a **red background** to signal overload.
4. Swimlane and issue type filters are respected — not all visible issues necessarily count toward the badge.
