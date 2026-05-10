# Column Group WIP Limits (CONWIP)

| | |
|---|---|
| Where configured | Board Settings → Columns → Column group WIP limits |
| Where visible | Board (detail view) |
| Settings apply to | For the whole team |(`subgroupsJH`) |

## Purpose

Group multiple columns under a single work-in-progress limit, so cards across those columns count toward a shared cap. Optional scope by swimlane and issue type, plus visual per-group coloring and overload alerts.

## How to configure

1. Open **Board settings** for your Scrum or Kanban board (requires board configuration permissions).
2. Go to the **Columns** tab.
3. Click **Column group WIP limits**.
4. In the dialog, drag columns into named groups. For each group set the **limit**, and optionally the **color**, **issue types**, and **swimlane** scope.
5. Click **Save** to store the configuration for everyone on this board, or **Cancel** to discard.

Only board administrators (or users with board configuration access) can save.

## How to use

- On the board, each column group shows a **current / limit** badge on its first column header.
- Grouped column headers are styled with the group's color so the group is easy to identify.
- When a group exceeds its limit, affected column areas turn **red** to make the overload obvious.
- Issue counting follows Jira's board statistics settings (e.g., subtask inclusion).

## Usage scenarios

- "I want to limit the total work-in-progress across Dev + Code Review + Testing as one shared cap."
- "I want bugs in the development columns to count separately from feature tasks."
- "I want my expedite swimlane excluded from certain column group limits."

## Troubleshooting

- **The group badge shows no count**: verify that the columns in the group contain issues, and that swimlane/issue-type filters are not excluding everything.
- **Color does not appear**: check that a color is set for the group; if left unset, a color is derived from the group name.
- **Settings not saving**: confirm you have board configuration permissions in Jira.
- **Sub-task counting seems off**: the extension follows Jira's board-level issue counting settings; adjust those in Jira's general board configuration.

## See also

- [Swimlane WIP Limits](/docs/features/wip-limits/swimlane-limits)
- [Per-person WIP Limits](/docs/features/wip-limits/personal-limits)
- [WIP Limits by Cells](/docs/features/wip-limits/cell-limits)
- [General Settings](/docs/settings)
