---
sidebar_position: 2
---

# Swimlane WIP Limits

## Overview

Swimlane WIP Limits give each swimlane row its own work-in-progress cap. You can set different limits for different lanes — for example, an "Expedite" lane with a low limit and a "Normal" lane with a higher one.

This complements Column Group WIP Limits: you can use both simultaneously for layered WIP control. The feature appears on **Board** view and is configured in **Board Settings → Swimlanes tab**.

## User Jobs

### Set a WIP limit per swimlane

**Goal:** Assign a numeric WIP cap to one or more swimlanes.

1. Open **Board Settings** → **Swimlanes** tab.
2. Ensure Jira's swimlane strategy is set to **Custom** (this feature requires Custom swimlanes).
3. Click **Configure WIP Limits** to open the modal.
4. For each swimlane, enter a **limit** number. Leave blank for no limit.
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

### Board view: monitor swimlane load

**Goal:** See each swimlane's WIP status on the board.

1. Each swimlane with a configured limit shows a **count / limit** badge on its header (e.g. `3 / 5`).
2. When a swimlane is **over** its limit, the header is highlighted with a red background.
3. Lanes without a configured limit show no badge and behave normally.
4. Counting respects the column and issue type filters you saved.
