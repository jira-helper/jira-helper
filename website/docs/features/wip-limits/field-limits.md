---
sidebar_position: 4
---

# Field Value WIP Limits (Capacity Allocation)

## Overview

Field Value WIP Limits let you cap the number of issues (or sum of numeric values) grouped by a field's value. Instead of counting all cards in a column, you define rules based on fields that appear on your cards — for example, limit the number of issues with "Priority = Critical" to 2, or cap the total story points in "In Progress" to 20.

Use this for capacity allocation (burn rate limits by team, sprint, or priority level). The feature appears on **Board** view and is configured in **Board Settings → Card Layout tab**.

## User Jobs

### Add a rule: pick a field and calculation mode

**Goal:** Define a field-based limit rule.

1. Open **Board Settings** → **Card Layout** tab.
2. Ensure the field you want to use is already on your card layout.
3. Click **Edit WIP limits by field**.
4. Click **Add limit** and configure:
   - **Field** — select a field from the card layout.
   - **Calculation mode** — choose how issues contribute:
     - **Has field value** — counts issues where the field has any value.
     - **Exact value** — counts issues with one specific field value.
     - **Any of values** — counts issues matching any of several values.
     - **Sum numbers** — sums numeric field values instead of counting issues.
5. For **Exact value** and **Any of values**, enter the matching value(s).
6. Set the **Limit** number.
7. Click **Add limit**, then **Save** to persist.

### Configure display: label and badge color

**Goal:** Make the limit badge recognizable on the board.

1. In the field limit form, enter a **Short label** (e.g. "Critical Bugs").
2. Optionally set a **badge color** via the color picker or hex value.
3. The label and color appear on the board's toolbar badge.
4. Click **Save** to apply.

### Configure column and swimlane scope

**Goal:** Apply the limit only to specific columns or swimlanes.

1. In the field limit form, locate the **columns** and **swimlanes** selectors.
2. By default the limit applies to **all columns** and **all swimlanes**.
3. Deselect **All columns** / **All swimlanes** and pick specific ones to narrow scope.
4. Only issues in the selected scope count toward the limit.
5. Click **Save** to apply.

### Board view: toolbar badges and card tinting

**Goal:** Monitor field-based capacity on the board.

1. Configured field limits appear as **badges** in a row above the board columns.
2. Each badge shows **current / limit** in the colors you chose.
3. When a limit is **exceeded**, cards that count toward that limit get a **red tint** (semi-transparent overlay) so overloaded buckets stand out.
4. Counts update in real time as cards move across columns.
