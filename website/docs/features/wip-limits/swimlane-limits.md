---
sidebar_position: 2
---

# Swimlane WIP Limits

## Overview

Swimlane WIP Limits give each swimlane row its own work-in-progress cap. You can set different limits for different lanes — for example, an "Expedite" lane with a low limit and a "Normal" lane with a higher one.

This complements [Column Group WIP Limits](/docs/features/wip-limits/column-limits): you can use both simultaneously for layered WIP control. When both are active, each limit is enforced independently — an issue can be counted by both a swimlane limit and a column group limit at the same time.

The feature appears on **Board** view and is configured in **Board Settings → Swimlanes tab**.

**Prerequisites:**
- **Board admin** permissions are required to configure limits
- Jira's swimlane strategy must be set to **Custom** (the feature does not work with Query-based, Assignee-based, Story-based, or Epic-based swimlanes)
- Each swimlane you want to limit must exist as a custom swimlane in Jira's Swimlanes tab

<!-- SCREENSHOT: Board Settings → Swimlanes tab, showing the "Configure WIP Limits" button location beneath the swimlane list -->
<!-- SCREENSHOT: Swimlane WIP configuration modal with limit fields, column selectors, and issue type filters -->
<!-- SCREENSHOT: Board view with swimlane headers showing count/limit badges and red highlighting on an over-limit swimlane -->

## User Jobs

### Set a WIP limit per swimlane

**Goal:** Assign a numeric WIP cap to one or more swimlanes.

1. Open **Board Settings** → **Swimlanes** tab.
2. Ensure Jira's swimlane strategy is set to **Custom** (this feature requires Custom swimlanes).
3. Click **Configure WIP Limits** — this button appears in the toolbar area of the Swimlanes tab, next to the swimlane strategy selector.
4. In the modal, for each swimlane enter a **limit** number. Leave blank for no limit.
5. Click **OK** to save all changes at once.

### Choose which columns count toward the limit

**Goal:** Limit counting to specific columns within a swimlane.

1. In the swimlane WIP configuration modal, click a swimlane's **columns** selector.
2. The default is **All columns** — every column counts.
3. Deselect **All columns** and pick specific columns instead.
4. Only issues in the selected columns count toward that swimlane's limit.
5. Click **OK** to save.

### Filter by issue types

**Goal:** Count only certain issue types within a swimlane's limit.

1. In the swimlane WIP configuration modal, open the **issue type** filter for a swimlane.
2. Toggle off **Count all issue types**.
3. Select specific issue types (Bug, Story, Task, etc.).
4. Setting **no types** disables the limit entirely for that swimlane.
5. Click **OK** to save.

### Remove or disable a limit

**Goal:** Stop enforcing a WIP limit for a swimlane.

1. Open **Board Settings** → **Swimlanes** tab and click **Configure WIP Limits**.
2. To **remove** a limit: clear the limit field for that swimlane (delete the number so the field is empty) and click **OK**. The badge and limit enforcement disappear.
3. To **temporarily disable**: clear the limit field, save, and re-enter the number later when you want to re-enable. There is no separate enable/disable toggle — deleting the limit value is the only way to deactivate it.
4. Click **OK** to save changes.

### Board view: monitor swimlane load

**Goal:** See each swimlane's WIP status on the board.

1. Each swimlane with a configured limit shows a **count / limit** badge on its header (e.g. `3 / 5`).
2. When a swimlane is **over** its limit, the header is highlighted with a red background.
3. Lanes without a configured limit show no badge and behave normally.
4. Counting respects the column and issue type filters you saved.

## Edge Cases

- **Non-Custom swimlanes error:** If Jira's swimlane strategy is set to anything other than Custom (e.g. Assignee-based), the modal displays an error message prompting you to switch to Custom swimlanes. Limits cannot be configured until you do.
- **Negative or zero limits:** The limit field accepts only positive integers. Entering 0 or a negative number is rejected. Use 1 as the minimum limit.
- **Empty limit field:** Leaving a swimlane's limit field blank means no limit is enforced for that swimlane. The badge does not appear.
- **Swimlane is deleted:** If a swimlane is removed from the board after you configured a limit for it, the stale configuration is ignored silently. Configured limits persist in board properties but have no effect.
- **Interaction with Column Group WIP Limits:** Both features operate independently. An issue can exceed one type of limit while respecting the other. Red highlighting may overlap on the board.
- **Swimlane strategy changed after config:** If swimlane limits are configured and the swimlane strategy is later changed from Custom to another type (e.g. Assignee-based), the limits are preserved in board properties but stop being enforced. Badges disappear from the board. Restoring the strategy to Custom re-activates the previously configured limits without re-entering them.

## Troubleshooting

### Badges are not appearing on the board

1. Verify the swimlane strategy is set to **Custom** in Board Settings → Swimlanes.
2. Confirm you saved the limits (clicked **OK** in the modal).
3. Ensure the limit field is not blank for the swimlane you expect badges on.
4. Check that you are on the board detail view (`?view=detail`) — badges do not appear on Backlog, Planning, or other views.
5. Refresh the board page after saving.

### "Configure WIP Limits" button is missing

1. Ensure you have **board admin** permissions.
2. Verify you are on the **Swimlanes** tab of Board Settings (not Columns or Card Layout).
3. The button only appears when the swimlane strategy is **Custom**.

### Limits are not counting correctly

1. Review your **column filters** — if specific columns are selected, only those columns count. Try "All columns" to verify.
2. Review your **issue type filters** — if specific types are selected, only those types count.
3. Issues on sub-swimlanes or parent swimlanes are counted per their swimlane, not aggregated.

## Related Features

- [Column Group WIP Limits](/docs/features/wip-limits/column-limits) — shared limits across multiple columns (CONWIP)
- [Personal WIP Limits](/docs/features/wip-limits/personal-limits) — per-person workload balance
- [Cell WIP Limits](/docs/features/wip-limits/cell-limits) — limits on column+swimlane intersections

## See Also

- [Atlassian: Configure swimlanes](https://support.atlassian.com/jira-software-cloud/docs/configure-swimlanes/) — official Jira swimlane documentation
