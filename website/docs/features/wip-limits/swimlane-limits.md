---
---

import {SwimlaneWipMockup} from '@site/src/components/SwimlaneWipMockup';

# Swimlane WIP Limits

| | |
|---|---|
| Where configured | «Board Settings» → «Swimlanes» → «Configure WIP Limits» |
| Where visible | Board (detail view) |
| Settings apply to | For the whole team |

## Purpose

Give each swimlane row its own work-in-progress cap. Optionally narrow counting to specific issue types per lane. Complements column-group limits for layered WIP control.

<SwimlaneWipMockup />

*Top:* Team Frontend — 2 issues, limit 5 (within limit). *Bottom:* Team Backend — 4 issues, limit 3 (overload, red highlight).

## How to configure

### Where to find settings

1. Open **«Board settings»**.
2. Go to the **«Swimlanes»** tab.
3. Set Jira's swimlane strategy to **«Custom»** using the native swimlane strategy control. This feature requires **«Custom»** strategy.
4. Click **«Configure WIP Limits»**.

### How to configure

In the modal, each swimlane on the board has a row where you can:

- **Set a limit**: enter the maximum number of issues allowed in the swimlane.
- **Choose issue types**: optionally narrow counting to specific issue types (Bug, Task, Story, etc.).

Click **«OK»** to save all changes, or **«Cancel»** to discard.

## How to use

- When a swimlane has a limit, its header displays a **count / limit** badge.
- If the lane exceeds its limit, the header is **highlighted** in red to draw attention.
- Lanes without an active limit behave like normal Jira swimlanes.
- Completed issues are excluded from counting; subtask handling follows the same board-wide convention as other WIP features.

## Usage scenarios

- "I want to set a separate WIP limit for each swimlane."
- "I want to count only bugs in a specific swimlane toward its WIP limit."
- "I want to see at a glance which swimlanes are overloaded."
