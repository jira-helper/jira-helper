# Per-person WIP limits

Cap how many issues each teammate may have in progress on the board, with a quick visual status and an optional way to focus only on issues that count toward someone’s limit.

## What it does

- Defines one or more limits per person, each with its own maximum and scope.
- **Scope** means which columns and swimlanes count (and optionally which issue types). Leaving selections empty typically means “everything on the board” for that limit.
- On the board each configured person gets a compact indicator next to the board title area.

## How to set up

1. Open **Board settings** for the board.
2. Open the **Columns** tab.
3. Click **Manage per-person WIP-limits**.
4. In the modal, search for a user, set the maximum number of issues, and narrow columns, swimlanes, and issue types if needed. Add, edit, or remove rows as required.
5. Click **Save** to apply for everyone on this board, or **Cancel** to discard changes.

Only people who can edit the board configuration can save.

## Behavior on the board

- Small **avatar badges** show each person’s load: green when under the limit, yellow at the limit, red when over.
- Issues that count toward a limit and push that person **over** the cap can get a **red highlight** on the card (when that option applies).
- **Clicking a person’s badge** toggles a filter so you only see issues that fall under that limit’s scope—useful for standups or checking overload.
- When filtering is on, parts of the board that do not match may be hidden until you click again to clear the filter.
