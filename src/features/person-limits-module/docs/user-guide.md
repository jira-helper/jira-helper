# Per-person WIP Limits

| | |
|---|---|
| Where configured | Board Settings → Columns → Manage per-person WIP-limits<br/>**or** Board toolbar → Jira Helper → Per-person WIP Limits tab |
| Where visible | Board (detail view) |
| Settings apply to | For the whole team |

## Purpose

Cap how many issues each teammate can have in progress on the board. Each limit has its own maximum and scope (columns, swimlanes, issue types). The board shows avatar badges with counters, highlights overloaded cards, and supports one-click filtering to focus on a person's workload.

## How to configure

### Where to find settings

The per-person WIP limits dialog opens in two ways:

**Via Board Settings:**

1. Open **Board settings**.
2. Go to the **Columns** tab.
3. Click **Manage per-person WIP-limits**.

**Via the Jira Helper panel on the board:**

1. On the board toolbar, open the **Jira Helper** panel.
2. Switch to the **Per-person WIP Limits** tab.

Both methods open the same dialog.

### How to configure

In the modal you can:

- **Add a limit**: find a user by name, set the **max number of issues**, and optionally narrow the scope by **columns**, **swimlanes**, and **issue types**.
- **Add multiple people**: include several people in one limit and choose the mode:
  - **Shared**: the limit applies to everyone combined. Example: limit 5 across 4 people — one shared counter for the group.
  - **Per-user**: each person gets their own limit. Example: limit 5 across 4 people — each person gets 5.
- **Edit a limit**: click **Edit** on an existing limit row and update the parameters.
- **Delete a limit**: click **Delete** on a limit row to remove it.
- **Create multiple limits per person**: you can define several limits with different scopes for the same person. Each limit is counted and displayed independently.

Click **Save** to apply for everyone on the board, or **Cancel** to discard all unsaved changes.

## How to use

- Avatar badges appear in the toolbar area above the board, showing each person's **current / limit** count.
- Badge colors: **green** (under limit), **yellow** (at limit), **red** (over limit).
- When a person exceeds a limit, their cards that contribute to that limit are highlighted in **red**.
- **Click a badge** to filter the board — only cards matching that limit's scope remain visible. Click again to clear the filter.

## Usage scenarios

- "I want to see who is overloaded at a glance during standup."
- "I want to limit developers to 3 tasks in progress, regardless of column."
- "I want to count only bugs for a particular person's limit."
- "I want to filter the board to show only items assigned to a specific team member."

## See also

- [Column Group WIP Limits](/docs/features/wip-limits/column-limits)
- [Swimlane WIP Limits](/docs/features/wip-limits/swimlane-limits)
- [WIP Limits by Field](/docs/features/wip-limits/field-limits)
- [General Settings](/docs/settings)
