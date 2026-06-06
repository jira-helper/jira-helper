# Swimlane WIP limits

Give each swimlane row its own work-in-progress cap and optional issue-type rules, shown on the lane header—useful lanes like “Expedite” can follow different WIP rules from the rest of the board.

## What it does

- Sets a numeric limit per swimlane, or leaves a lane without a limit.
- Optionally counts only certain issue types in that lane.
- Complements **column group** limits: you can combine broad column rules with per-lane caps for special rows.
- Finished work is not counted toward these limits; sub-tasks follow the same counting convention as elsewhere on the board for WIP features.

## How to set up

1. Open **Board settings**.
2. Open the **Swimlanes** tab.
3. Set Jira’s swimlane strategy to **Custom** using the native swimlane strategy control on that page. This feature requires **Custom** swimlane strategy.
4. Click **Configure WIP Limits**.
5. In the modal, each swimlane on the board has a row: set the limit and choose issue types if you want to narrow what counts. Use **OK** to save all changes, or **Cancel** to close without saving.

Board administrators (or anyone with board configuration access) can save.

## Behavior on the board

- When a swimlane has a limit, its header shows a **count / limit** badge.
- If the lane is **over** the limit, the header is **highlighted** so the overload is obvious.
- Counting respects the lane and issue-type rules you saved; lanes without an active limit behave like normal Jira swimlanes aside from other WIP features you may use.
