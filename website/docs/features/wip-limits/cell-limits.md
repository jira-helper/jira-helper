---
sidebar_position: 5
---

# Cell WIP Limits

## Overview

Cell WIP Limits put a single work-in-progress cap on a specific intersection of columns and swimlanes — for example, limit the "In Progress × Expedite" cell to 3 issues. You define a named range that covers one or more column + swimlane pairs, and all issues in those cells count together toward one limit.

Use this for fine-grained WIP control at the cell level, beyond what column groups or swimlane limits can provide. The feature appears on **Board** view and is configured in **Board Settings → Columns tab**.

## User Jobs

### Define a cell range

**Goal:** Select column + swimlane pairs and set a limit for them.

1. Open **Board Settings** → **Columns** tab.
2. Click **Edit WIP limits by cells**.
3. Click **Add range**.
4. Fill in:
   - **Name** — a descriptive name for this range.
   - **WIP limit** — the maximum number of issues allowed in the range.
5. In the **cells table**, select **swimlane** and **column** pairs that belong to this range.
6. For each cell, toggle **Show badge** on or off (controls whether the count badge appears on that cell).
7. Click **Add range**, then **Save** to persist.

### Set limit and filter by issue types

**Goal:** Count only certain issue types toward the cell range limit.

1. In the cell range form, open the **issue type** filter.
2. Toggle off **Count all issue types**.
3. Select specific issue types to include (Bug, Story, Task, etc.).
4. Only matching issues in the range's cells count toward the limit.
5. Click **Save** to apply.

### Enable or disable a range

**Goal:** Temporarily turn off a cell range without deleting it.

1. In the cell ranges configuration modal, find the range you want to disable.
2. Toggle the **Enabled** switch off.
3. The range becomes **disabled** — it shows a striped/hatched visual overlay on the board and does not enforce an active limit.
4. Toggle back on to re-enable.
5. Click **Save** to apply changes.

### Board view: dashed borders, badges, and visual feedback

**Goal:** See cell range boundaries and load status on the board.

1. Each active cell range is outlined with a **dashed blue border** across the covered cells.
2. Cells with **Show badge** enabled display a **count / limit** badge.
3. Badge colors reflect status:
   - Under limit — normal color
   - At limit — yellow
   - Over limit — red
4. When the range exceeds its limit, affected cells get a **semi-transparent red background**.
5. **Disabled** ranges show a hatched/striped overlay, indicating the range is visible but not actively enforced.
