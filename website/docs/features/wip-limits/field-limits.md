---
sidebar_position: 4
---

# Field Value WIP Limits (Capacity Allocation)

## Overview

Field Value WIP Limits let you cap the number of issues (or sum of numeric values) grouped by a field's value. Instead of counting all cards in a column, you define rules based on fields that appear on your cards — for example, limit the number of issues with "Priority = Critical" to 2, or cap the total story points in "In Progress" to 20.

Use this for capacity allocation (burn rate limits by team, sprint, or priority level). The feature appears on **Board** view and is configured in **Board Settings → Card Layout tab**.

**Prerequisites:**
- **Board admin** permissions are required to configure limits
- The field you want to use must be present on the card layout (configured in Board Settings → Card Layout)
- For **Sum numbers** mode, the field must be a numeric field (e.g. Story Points, Original Estimate)

<!-- SCREENSHOT: Field value WIP limits configuration form showing field selector, calculation mode dropdown, limit input, label, and color picker -->
<!-- SCREENSHOT: Board toolbar area showing field limit badges with custom labels and colors -->
<!-- SCREENSHOT: Board view with red-tinted cards when a field value limit is exceeded -->

## User Jobs

### Add a rule: pick a field and calculation mode

**Goal:** Define a field-based limit rule.

1. Open **Board Settings** → **Card Layout** tab.
2. Ensure the field you want to use is already on your card layout.
3. Click **Edit WIP limits by field**.
4. Click **Add limit** and configure:
   - **Field** — select a field from the card layout.
   - **Calculation mode** — choose how issues contribute (see quick-reference table below).
5. For **Exact value** and **Any of values**, enter the matching value(s).
6. Set the **Limit** number.
7. Click **Add limit**, then **Save** to persist.

### Calculation modes quick reference

| Mode | What it counts | Example use |
|---|---|---|
| **Has field value** | Issues where the field has any value (not empty) | "Limit issues with Priority set to 5" |
| **Exact value** | Issues matching exactly one value | "Limit bugs with Priority = Critical to 2" |
| **Any of values** | Issues matching any of several values | "Limit issues for Team Alpha or Team Beta to 8" |
| **Sum numbers** | Sum of numeric field values instead of issue count | "Limit total story points in In Progress to 20" |

### Manage, edit, or delete rules

**Goal:** Modify or remove an existing field limit rule.

1. Open **Board Settings** → **Card Layout** tab → click **Edit WIP limits by field**.
2. The modal lists all existing rules.
3. To **edit** a rule: modify its fields (limit value, label, colors, scope) inline, then click **Save**.
4. To **delete** a rule: click the **Delete** (trash) icon next to the rule. Confirm deletion.
5. All changes require clicking **Save** to persist.

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

## Matching Semantics

- **Has field value:** matches if the field is non-empty (any value at all). Empty/blank fields are excluded.
- **Exact value:** matches if the field value equals the configured value. Matching is **case-insensitive** and ignores leading/trailing whitespace. For example, configuring `Critical` matches `critical`, `CRITICAL`, and `  Critical  `.
- **Any of values:** same case-insensitive, whitespace-tolerant matching as Exact value, applied to each configured value independently. An issue matches if its field value matches any one of the list.
- **Exact value** and **Any of values** work with both text-type and select-type fields (dropdowns, radio buttons, labels). For Jira select fields, matching is done against the option's display label.

## Edge Cases

- **Multiple rules match the same card:** If several field limit rules match the same card (e.g. one rule on Priority and another on Components), the card is counted by both rules independently. The card may appear red-tinted from one exceeded limit while being under another.
- **Sum numbers with non-numeric values:** If a card's field value is non-numeric (text, empty, or missing) when using Sum numbers mode, the card is **skipped** for that limit and a warning icon is shown on the badge. The limit total only sums cards with valid numeric values.
- **Field removed from card layout:** If a field is removed from the card layout after a rule was created, the rule continues to exist in settings but no longer matches any cards — effectively a no-op until the field is restored to the layout.
- **Empty field value:** For "Has field value" mode, blank/empty fields are not counted. For "Exact value" and "Any of values", a blank value can be explicitly matched by entering an empty string.

## Troubleshooting

### Badge shows 0 but I expect issues to be counted

1. Verify the field is on the **card layout** (Board Settings → Card Layout). Rules only evaluate fields visible on cards.
2. Check the **column and swimlane scope** — issues outside the selected scope are not counted.
3. For "Exact value" mode: ensure the value matches (matching is case-insensitive, but extra spaces or punctuation differences still count).
4. For "Any of values" mode: check each value individually.

### Rule doesn't appear on the board

1. Confirm you clicked **Save** after adding or editing rules.
2. Reload the board page after saving — changes are applied on next page load.
3. Check that you are on the board detail view (not Backlog or Planning).

### Count is always 0

1. For "Has field value": the field must be non-empty on matching issues.
2. For "Sum numbers": the field must contain a valid number, not text or empty. Cards with non-numeric values are skipped and trigger a warning icon on the badge.
3. The field might be present on the card layout but empty on all visible issues.

### Warning icon appears on a Sum numbers badge

- A warning icon on the badge means one or more cards have non-numeric values in the summed field and were skipped. Hover the badge to see how many cards were skipped. Fix the field values on those cards (or choose a different field).

## Related Features

- [Column Group WIP Limits](/docs/features/wip-limits/column-limits) — CONWIP limits across multiple columns
- [Swimlane WIP Limits](/docs/features/wip-limits/swimlane-limits) — per-swimlane caps
- [Personal WIP Limits](/docs/features/wip-limits/personal-limits) — per-person workload balance
- [Cell WIP Limits](/docs/features/wip-limits/cell-limits) — limits on column+swimlane intersections

## See Also

- [Atlassian: Configure card layout](https://support.atlassian.com/jira-software-cloud/docs/configure-the-card-layout-for-your-board/) — how to add fields to Jira cards
