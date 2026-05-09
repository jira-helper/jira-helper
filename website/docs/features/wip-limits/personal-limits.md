---
sidebar_position: 3
---

# Personal WIP Limits

## Overview

Personal WIP Limits control how many issues each teammate can have in progress at once. Each person gets avatar badges on the board showing their current load against the limit, with color-coded status and optional card highlighting when overloaded.

Use this to balance workload across the team, spot overload before standups, and focus on one person's issues with a single click. The feature appears on **Board** view and is configured in **Board Settings → Columns tab**.

## User Jobs

### Add a limit for a person

**Goal:** Set a WIP cap for a specific teammate.

1. Open **Board Settings** → **Columns** tab.
2. Click **Manage per-person WIP-limits**.
3. In the modal, use the **person search** field — start typing a name and select the user from the dropdown.
4. Set the **Max issues at work** number (minimum 1).
5. Click **Add limit**, then click **Save** to persist for all board users.
6. The avatar badge appears near the board title area immediately after saving.

### Configure scope: columns, swimlanes, issue types

**Goal:** Narrow the limit to specific columns, swimlanes, or issue types.

1. In the limit form, locate the scope filters:
   - **Columns** — toggle off **All columns** and select specific columns.
   - **Swimlanes** — toggle off **All swimlanes** and select specific swimlanes.
   - **Issue types** — toggle off **Count all issue types**, select a project, then pick types.
2. Only issues matching all active filters count toward the limit.
3. Multiple limits for the same person with different scopes are allowed (e.g. 3 issues in "In Progress" + 2 bugs anywhere).
4. Click **Save** to apply.

### Create shared limits (multiple people share one counter)

**Goal:** One WIP counter shared across several people.

1. In the per-person limits modal, add a limit for person A with a shared scope.
2. Add another limit for person B with the same scope configuration.
3. The limits count separately per person — to create a shared counter, use the same scope and limit number for each person. Each person's badge shows their own count against the shared limit value.
4. Click **Save** to apply.

### Filter board by person

**Goal:** Show only issues that count toward a specific person's limit.

1. On the board, click a person's **avatar badge**.
2. The board filters to show only issues falling under that limit's scope.
3. All other cards are hidden.
4. Click the same avatar badge again to clear the filter and show all cards.
5. If a person has multiple limits, each limit has its own avatar badge with independent filtering.

### Board view: avatar badges and card highlighting

**Goal:** Monitor team workload at a glance.

1. Configured limits appear as **avatar badges** (Jira profile picture + count) in the board toolbar area.
2. Each badge shows **current / limit** (e.g. `2 / 5`).
3. Color coding:
   - **Green** — under the limit
   - **Yellow** — at the limit
   - **Red** — over the limit, with cards counting toward this limit highlighted with a red background
4. Issues assigned to the person that fall within the limit's scope are counted. Jira avatar is required for display.
