# Column group WIP limits (CONWIP)

Set one shared work-in-progress limit across several columns so cards in those columns count together, with optional rules by swimlane and issue type.

## What it does

- Groups columns under a name and a single maximum number of issues that may sit in that group at once.
- Optionally counts only issues in certain swimlanes, or all swimlanes.
- Optionally counts only selected issue types for that group.
- Optionally picks a color for the group’s column header; if you skip it, a color is chosen from the group name.
- On the board you see how full each group is compared with its limit, and clear visual feedback when a group is over the limit.

## How to set up

1. Open **Board settings** for your Scrum or Kanban board (you need permission to edit the board configuration).
2. Go to the **Columns** tab.
3. Open **Column group WIP limits** (the exact wording may follow your Jira language).
4. In the dialog, drag columns into named groups. For each group set the limit, and optionally color, issue types, and which swimlanes count toward that group’s total.
5. Click **Save** to store the configuration for everyone on this board, or **Cancel** to close without saving.

Only board administrators (or whoever can change board configuration in your Jira) can save these settings.

## Behavior on the board

- A **current / limit** style badge appears on the first column of each group so you see usage at a glance.
- Column headers are styled so the group is easy to recognize.
- When a group exceeds its limit, affected column areas get a **red** background so the overload stands out; swimlane rules you configured still apply to what is counted.
- Counting of issues follows the same rules as your board’s issue count settings (for example whether sub-tasks are included), consistent with Jira’s board behavior.
