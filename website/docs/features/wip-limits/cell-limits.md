---
sidebar_position: 5
---

# Cell WIP Limits

## Overview

Cell WIP Limits put a single work-in-progress cap on a specific intersection of columns and swimlanes — for example, limit the "In Progress × Expedite" cell to 3 issues. You define a named range that covers one or more column + swimlane pairs, and all issues in those cells count together toward one limit.

Use this for fine-grained WIP control at the cell level, beyond what column groups or swimlane limits can provide. The feature appears on **Board** view and is configured in **Board Settings → Columns tab**.

**Prerequisites:**
- **Board admin** permissions are required to configure limits
- The columns and swimlanes you want to apply limits to must exist on the board

<!-- SCREENSHOT: Cell WIP limits configuration modal showing the range list with name, limit, enabled toggle, and cells table -->
<!-- SCREENSHOT: Board view showing dashed blue borders around cell ranges with badges and red tint overlay on exceeded ranges -->
<!-- SCREENSHOT: Annotated board view pointing out: dashed border, badge, red background, disabled range hatching -->

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

## How Limits Interact

Cell WIP Limits coexist with other WIP limit types. When multiple limit types apply to the same issues, each is enforced independently:

| Limit type | Interaction with Cell Limits |
|---|---|
| **Column Group WIP Limits** | Separate counters. An issue can be counted by both a cell limit and a column group limit simultaneously. Exceeding one does not affect the other. |
| **Swimlane WIP Limits** | Separate counters. Cell limits are more granular (specific column within a swimlane), swimlane limits are broader (entire row). |
| **Personal WIP Limits** | Independent. A person's issues may be counted by cell limits (by cell position) and personal limits (by assignee) simultaneously. |

Visual feedback (red highlighting, badges) from different limit types may overlap on the same card or cell. Each limit's visual indicators are rendered independently.

## Edge Cases

- **Column or swimlane removed after range is configured:** If a column or swimlane covered by a cell range is deleted from the board, the range becomes invalid for those cells. The range still exists in settings but the missing cells are silently excluded from counting.
- **Range with no cells selected:** A range must have at least one cell selected to be active. If all cells are removed, the range shows `0 / limit` and effectively does nothing.
- **Disabled range visual:** Disabled ranges display a striped overlay — this is purely visual feedback. It does not count issues or contribute to any board behavior.

## Troubleshooting

### Cell range visual (dashed border) is not visible

1. Ensure the range is **Enabled** (toggle on in the configuration modal).
2. Verify you selected at least one column+swimlane cell pair in the cells table.
3. The columns and swimlanes must exist on the current board. Deleted or renamed columns/swimlanes break the range.
4. Refresh the board page after saving configuration.

### Count doesn't match expected number

1. Check the **issue type filter** — only matching types are counted.
2. Verify the range covers the correct cells. Issues outside the selected column+swimlane intersection are not counted.
3. The count includes only issues visible on the current board view (Quick Filters may hide issues).
4. Check if other limit types are affecting the same issues — counts are per-limit-type, not combined.

### "Edit WIP limits by cells" button is missing

1. Ensure you have **board admin** permissions.
2. You must be on the **Columns** tab of Board Settings (not Card Layout or Swimlanes).

## Related Features

- [Column Group WIP Limits](/docs/features/wip-limits/column-limits) — shared limits across multiple columns
- [Swimlane WIP Limits](/docs/features/wip-limits/swimlane-limits) — per-swimlane caps
- [Personal WIP Limits](/docs/features/wip-limits/personal-limits) — per-person workload balance
- [Field Value WIP Limits](/docs/features/wip-limits/field-limits) — capacity allocation by field values

## See Also

- [Atlassian: Configure columns](https://support.atlassian.com/jira-software-cloud/docs/configure-columns/) — official Jira column documentation
- [Atlassian: Configure swimlanes](https://support.atlassian.com/jira-software-cloud/docs/configure-swimlanes/) — official Jira swimlane documentation
