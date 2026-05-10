# Column Group WIP Limits (CONWIP)

| | |
|---|---|
| Where configured | Board Settings → Columns → Column group WIP limits<br/>**or** Board toolbar → Jira Helper → Column WIP Limits tab |
| Where visible | Board (detail view) |
| Settings apply to | For the whole team |(`subgroupsJH`) |

## Purpose

Group multiple columns under a single work-in-progress limit, so cards across those columns count toward a shared cap. Optional scope by swimlane and issue type, plus visual per-group coloring and overload alerts.

## How to configure

You can open the column WIP limits dialog either from **Board Settings** or directly from the **board view**:

- **Board Settings** (steps 1–3 below): for administrators who want to manage the full board configuration in one place.
- **Board view**: open the **Jira Helper** panel on the board toolbar and switch to the **Column WIP Limits** tab. This opens the same configuration dialog without leaving the board.

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

## See also

- [Swimlane WIP Limits](/docs/features/wip-limits/swimlane-limits)
- [Per-person WIP Limits](/docs/features/wip-limits/personal-limits)
- [WIP Limits by Cells](/docs/features/wip-limits/cell-limits)
- [General Settings](/docs/settings)
