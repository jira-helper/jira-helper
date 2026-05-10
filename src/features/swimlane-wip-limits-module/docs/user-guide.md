# Swimlane WIP Limits

| | |
|---|---|
| Where configured | Board Settings → Swimlanes → Configure WIP Limits |
| Where visible | Board (detail view) |
| Settings apply to | For the whole team |(`jiraHelperSwimlaneSettings`) |

## Purpose

Give each swimlane row its own work-in-progress cap. Lanes like "Expedite" can follow different WIP rules from the rest of the board. Optionally narrow counting to specific issue types per lane. Complements column-group limits for layered WIP control.

## How to configure

1. Open **Board settings**.
2. Go to the **Swimlanes** tab.
3. Set Jira's swimlane strategy to **Custom** using the native swimlane strategy control. This feature requires **Custom** strategy.
4. Click **Configure WIP Limits**.
5. In the modal, each swimlane on the board has a row: set the **limit** and optionally choose **issue types** to narrow what counts. Click **OK** to save all changes, or **Cancel** to discard.

Board administrators (or users with board configuration access) can save.

## How to use

- When a swimlane has a limit, its header displays a **count / limit** badge.
- If the lane exceeds its limit, the header is **highlighted** in red to draw attention.
- Lanes without an active limit behave like normal Jira swimlanes.
- Completed issues are excluded from counting; subtask handling follows the same board-wide convention as other WIP features.

## Usage scenarios

- "I want my Expedite lane limited to 3 items, while the main development lanes use column-group limits."
- "I want to count only bugs in a specific swimlane toward its WIP limit."
- "I want to see at a glance which swimlanes are overloaded."

## Troubleshooting

- **Configure WIP Limits button is missing**: ensure the swimlane strategy is set to **Custom** in Jira's native swimlane configuration.
- **Badge shows zero**: confirm that issues exist in the swimlane and that issue-type filters are not excluding all issues.
- **Count mismatch**: the extension respects Jira's board-level issue counting settings (e.g., subtask exclusion). Adjust those in Jira's general board configuration.
- **Settings not saving**: verify that you have board configuration permissions in Jira.

## See also

- [Column Group WIP Limits](/docs/features/wip-limits/column-limits)
- [Per-person WIP Limits](/docs/features/wip-limits/personal-limits)
- [WIP Limits by Field](/docs/features/wip-limits/field-limits)
- [General Settings](/docs/settings)
