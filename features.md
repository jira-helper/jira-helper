# Jira Helper — Features

> Auto-generated from `src/**/feature.md` files. Do not edit manually.
> Run `npm run docs:features` to regenerate.

---
<!-- source: src/column-limits-module/feature.md -->
# Column group WIP limits (CONWIP)

Set one shared work-in-progress limit across several columns so cards in those columns count together, with optional rules by swimlane and issue type.

## What it does

- Groups columns under a name and a single maximum number of issues that may sit in that group at once.
- Optionally counts only issues in certain swimlanes, or all swimlanes.
- Optionally counts only selected issue types for that group.
- Optionally picks a color for the group’s column header; if you skip it, a color is chosen from the group name.
- On the board you see how full each group is compared with its limit, and clear visual feedback when a group is over the limit.

## How to set up

1. Open **Board settings** for your Scrum or Kanban board (you need permission to edit the board configuration).
2. Go to the **Columns** tab.
3. Open **Column group WIP limits** (the exact wording may follow your Jira language).
4. In the dialog, drag columns into named groups. For each group set the limit, and optionally color, issue types, and which swimlanes count toward that group’s total.
5. Click **Save** to store the configuration for everyone on this board, or **Cancel** to close without saving.

Only board administrators (or whoever can change board configuration in your Jira) can save these settings.

## Behavior on the board

- A **current / limit** style badge appears on the first column of each group so you see usage at a glance.
- Column headers are styled so the group is easy to recognize.
- When a group exceeds its limit, affected column areas get a **red** background so the overload stands out; swimlane rules you configured still apply to what is counted.
- Counting of issues follows the same rules as your board’s issue count settings (for example whether sub-tasks are included), consistent with Jira’s board behavior.

---

<!-- source: src/person-limits-module/feature.md -->
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

---

<!-- source: src/wiplimit-on-cells/feature.md -->
# WIP limits by cells

Put a single work-in-progress limit on a custom block of board cells (where a column meets a swimlane), with a clear outline, optional counters per cell, and visible “over limit” styling.

## What it does

- Lets you name a **range** of cells and set one shared limit for all issues that sit inside those cells.
- You choose which column–swimlane intersections belong to the range; you can turn the numeric badge on or off for individual cells in the range.
- Optionally limits counting to certain issue types only.
- You can mark a range as **visually disabled**: it shows a striped “off” style and does not behave like an active limit badge.
- Issues in every cell of the range count together toward that one limit.

## How to set up

1. Open **Board settings**.
2. Go to the **Columns** tab.
3. Click **Edit WIP limits by cells**.
4. Add, edit, or remove ranges. For each range set a name, the limit, whether it is disabled for display, optional issue types, and a table of swimlane/column pairs; use the per-cell option to show or hide the indicator on that cell.
5. Click **Save** to store for the board, or **Cancel** to leave without saving.

Saved ranges are applied board-wide for everyone who views the board with the extension.

## Behavior on the board

- The covered block of cells is outlined with a **dashed blue border** so the shape is obvious.
- On cells where you enabled the indicator, a badge shows **how many issues** are in the range versus the **limit**, with color reflecting under, at, or over limit.
- When the range is **over** the limit, those cells get a **semi-transparent red** background.
- **Disabled** ranges show a hatched overlay so you can see the area is intentionally not enforced as an active limit.

Issue counting respects your board’s settings (for example sub-task handling), like other WIP features in the extension.

---

<!-- source: src/swimlane-wip-limits-module/feature.md -->
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

---

<!-- source: src/features/field-limits-module/feature.md -->
# WIP limits by field values

Turn a field shown on your board cards into a capacity-style limit: count or sum how issues contribute by field value (or by whether the field is present), scoped to columns and swimlanes, with badges beside the board and a tint on cards that tip the limit over.

## What it does

- Each rule picks a **field** from your board’s **card layout** (only fields that actually appear on cards can be used).
- You choose how issues contribute: for example **only if the field is filled**, **exactly one value**, **any of several values**, or **sum of numbers** on matching cards—the dialog explains the meaning of each mode when you configure it.
- You give the rule a **short label** for the badge, set the numeric **limit**, and optionally a **badge color**, plus optional **column** and **swimlane** filters so the rule only applies where you need it.
- The badge shows **current vs limit** with colors for under, at, and over capacity.

## How to set up

1. Open **Board settings**.
2. Open the **Card layout** tab (so the fields you want are on the card).
3. Click **Edit WIP limits by field**.
4. Add, edit, or delete limits: select the field, calculation mode, values (if required), display name, limit, and optional column/swimlane scope and badge color.
5. Save from the modal so the configuration is stored on the board for everyone using the extension.

Only people who can edit the board configuration can save.

## Behavior on the board

- A row of **badges** appears in the toolbar area above the columns—one per configured limit—with the label and colors you chose.
- When a limit is **exceeded**, cards that **count toward** that limit get a shared **red tint** so overloaded buckets stand out.
- Counts update as cards move, using the board’s issue statistics settings (such as excluding sub-tasks when your board is set up that way).

---

<!-- source: src/card-colors/feature.md -->
# Card Colors

Makes your Jira **Card Colors** rules easier to see by optionally filling the whole issue card with a soft tint of the same color, not just the thin strip on the left.

## What it does

- Uses the same JQL-based card colors you already set in Jira; only changes how strongly the color shows (full card vs. strip only).
- Applies a light, readable background tint that matches each card’s assigned color.
- Leaves **flagged** cards looking normal so urgency markers stay obvious.
- Leaves cards alone when they already show special highlighting (for example WIP limit warnings), so those warnings stay visible.

## How to set up

1. Open your board.
2. Go to **Board settings** (gear on the board).
3. Open the **Card Colors** tab (the native Jira screen where you define colors with JQL).
4. Above the color rules table, find the **Fill whole card** option (with a short before/after explanation in the tooltip).

Only people who can change board settings—typically **board admins**—can turn this on or off. It is saved with the board like other board settings.

## Behavior on the board

When **Fill whole card** is enabled, each issue card on the board can show a gentle full-card tint that follows your Card Colors rules. The left color strip from Jira remains; the rest of the card gains a matching light background. Flagged cards and cards with certain other highlights keep their normal styling. When the option is off, cards look like standard Jira (strip only).

---

<!-- source: src/swimlane-histogram-module/feature.md -->
# Swimlane Histogram

Shows a small **bar chart** beside each swimlane name so you can see at a glance how work in that swimlane is **spread across columns** on the board.

## What it does

- For every swimlane, counts how many issues sit in each column and draws one compact chart per swimlane header.
- Bar height reflects each column’s share of that swimlane’s issues (tallest bar = largest share).
- Hovering (or focusing) the chart shows each column’s name and issue count.
- Uses neutral gray bars: lighter placeholders for empty columns, darker where there are issues.
- Updates automatically as the board changes.

## How to set up

There is nothing to configure. The chart appears automatically on supported board views when you use swimlanes.

## Behavior on the board

Next to each swimlane title you see a horizontal row of thin columns matching your board columns. The mini chart summarizes distribution for issues in that swimlane only. On some **simplified or alternate board layouts**, the chart may not appear; use the usual detailed Scrum/Kanban board view to see it.

---

<!-- source: src/blur-for-sensitive/feature.md -->
# Data Blurring

**Privacy and presentation mode:** hides readable text and blurs many images on Jira so you can share your screen or demo the product without exposing issue titles, keys, names, or descriptions—layout stays in place, content is not legible.

## What it does

- Applies a strong “smudge” effect to text and a blur to relevant images across Jira—not only on boards but also issue views, search, backlog, and parts of settings screens.
- Remembers your choice: once turned on, new Jira tabs and reloads keep blur applied until you turn it off.
- Can be toggled from the browser extension without opening Jira’s board settings.

## How to set up

1. On a Jira page where the extension is active, **right-click** the page (or use your browser’s page context menu for that tab).
2. Find the extension entry **Blur secret data** and use it as a **checkbox**: checked = blur on, unchecked = blur off.

There is no switch inside **Board settings** in Jira. The setting persists between page loads.

## Behavior on the board

With blur on, board and backlog cards show smudged text instead of readable summaries; details stay unreadable while columns and card positions still line up. Turn blur off from the same menu item when you are done presenting or sharing your screen.

---

<!-- source: src/features/additional-card-elements/feature.md -->
# Additional Card Elements

Adds optional labels and status cues on board and backlog cards so you can see links, aging, deadlines, and simple rule-based signals at a glance.

## What it does

### Issue Links Display

- Shows linked issues as compact badges under the card summary.
- You can define several rules (link type, direction, optional filters) so only the links you care about appear.
- Optional colors and multi-line text for how each linked issue is shown.

### Days in Column

- Shows how long the issue has been in its current column as a badge on the card.
- Warning levels can be set globally or per column (e.g. turn “attention” styling on after a chosen number of days).

### Days to Deadline

- Shows a badge driven by a date or date-time field you pick on the issue.
- Display options include: always show, show only when the date is within a number of days or already past, or show only when overdue.
- Optional warning styling before the deadline is missed.

### Condition Checks

- Shows small icons on the card when the issue (or related work you include in the rule) matches a condition you define.
- Rules can optionally include sub-tasks, epic children, or linked issues, depending on how you set them up.
- Each rule can have its own icon, tooltip text, color, and optional animation.

**Other behavior**

- In backlog view, only issue link badges are shown.

## How to set up

1. Open your Jira board, then open **Jira Helper** board settings.
2. Open the tab **Additional Card Elements**.
3. Turn the feature on with the main enable option.
4. Choose **which columns** should show the extra badges on cards.
5. Optionally enable **Show links in backlog** so link badges appear on backlog cards.
6. Configure each area (links, days in column, deadline field and modes, condition rules) in the corresponding sections. Use **Reset all settings** if you want to return everything in this tab to defaults.

Settings apply per board. Board administrators can change them.

## Behavior on the board

- In **selected columns**, cards show the badges you configured: links under the summary; days-in-column and/or deadline near the end of the card; condition icons where the layout provides space at the bottom of the card.
- If **Show links in backlog** is on, **backlog** cards show link badges in a horizontal strip; other badge types stay on the main board only.

---

<!-- source: src/features/sub-tasks-progress/feature.md -->
# Sub-tasks progress

Shows stacked progress bars and/or compact counters on board cards for child and linked work—sub-tasks, epic children, issue links, and optional external links—so you can see To Do, In Progress, Done, and Blocked at a glance.

## What it does

- Splits work into **four buckets**: to do, in progress, done, and blocked, based on how you map Jira **statuses** into those buckets (and you can leave some statuses out of the totals).
- Lets you choose **what to count**: for example epic children, sub-tasks, linked issues (with optional restriction by **link type**), and optional “external” linked items—each can be turned on or off.
- Supports **grouping**—for example by project, assignee, or issue type—or custom groupings using a field or a filter, with separate styling for bars vs simple counters.
- Can show **multi-segment bars**, a **single** combined bar, and/or **numeric counters**; you can hide groups when everything is complete or show only incomplete work.
- Optionally treats Jira **flags** and **blocked-by** style links as blocked in the counts and can show **short warning hints** on the card when something relevant is blocked or flagged.
- **Colors** can follow a preset scheme or a custom palette for the segments.

## How to set up

1. Open your Jira board and go to **Jira Helper** board settings.
2. Open the tab **Sub-tasks progress**.
3. Turn the feature on. Use **Reset all settings** if you want to restore this tab’s defaults.
4. Under **columns** (or the equivalent multi-select for tracked columns), choose **which columns show progress on cards**.
5. In the counting section, enable the **sources** you want (epic children, sub-tasks, links, external links, etc.) and link-type filters if offered.
6. Configure **grouping**: default grouping field, any ignored groups, and custom groups (names, what defines the group, bar vs counter, colors, when to hide or show).
7. Map **statuses** to the four progress categories; adjust **colors** if you use custom schemes.
8. Optionally turn on **blocked / flagged** handling and related warnings.

Settings are **per board** in Jira Helper. People who can change Jira Helper settings for that board can save these options.

## Behavior on the board

- In **tracked columns**, each card gets the progress strip and/or counters you configured, grouped as in your settings.
- Blocked and flagged behavior only appears if you enable those options; warning text appears on the card when the rules apply.

---

<!-- source: src/issue/feature.md -->
# Issue view helpers

Makes it easier to spot flagged work in the issue hierarchy and gives you a quick control to hide or show the right-hand panel on the classic full issue layout.

## What it does

- Highlights rows in the **issue hierarchy** (linked issues, sub-tasks, epic children) when those issues are **flagged** in Jira, and shows a **flag icon** next to them.
- On the **issue you have open**, when it is flagged, also surfaces the flag near the usual header area (priority / type region) in the **classic** issue view.
- Adds a small **collapse / expand** control for the **right sidebar** on the legacy issue screen so you can reclaim horizontal space and bring the sidebar back when needed.

## How to set up

There is nothing to configure. These helpers run automatically on issue pages and in the board’s issue panel. No board-level or extension settings are required.

## Behavior on the board

- When you open an issue from the board in the **side detail panel**, flagged related items in that panel’s hierarchy are highlighted and marked with the flag icon the same way as on the full page (layout may differ slightly between **classic** and **new** issue view).
- The **right-sidebar toggle** appears on the **full issue page** and when you view an issue from **issue search**.
- The sidebar toggle is available in the **classic** issue layout.

---

<!-- source: src/charts/feature.md -->
# Control Chart enhancements

Adds visual aids on Jira’s **Control Chart** report: an SLA reference line with quick preview, and an optional measurement grid to read lead or cycle time against story-point-style steps.

## What it does

- Shows a horizontal **SLA** line on the chart with a shaded band, labels for days and how much work sits at or under that SLA, and an **SLA** entry in the chart legend.
- The line updates live as you change the SLA value.
- Lets board editors **save** an SLA value for the board so it comes back on later visits.
- Adds an optional **measurement grid** you can turn on in the chart options: Fibonacci or even-step presets, draggable and resizable so you can align horizontal lines with the chart.

## How to set up

1. Open **Reports** for your board and choose the **Control Chart** report.
2. In the chart options area, use the **SLA** field to set a target in **days**. The chart updates immediately.
3. To **save** that SLA for everyone who uses this board, click **Save** (only if you can edit the board).
4. For the grid: use the checkbox and preset controls in the chart options to show or hide the overlay and pick **Fibonacci** or **linear** spacing. Adjust position and size on the chart as needed.

## Behavior on the board / on the page

On the **Control Chart**, you see the usual Jira chart plus the extension’s SLA controls in the options column. When SLA is set, the chart shows the line, band, and legend text. With the grid enabled, horizontal guide lines sit over the chart so you can relate vertical positions to days and step patterns. Saved SLA appears next time you open this board’s Control Chart.

---

<!-- source: src/bug-template/feature.md -->
# Description template (issue create)

Speeds up filling the **Description** field when you create an issue or subtask by inserting a ready-made structure and letting you save your own text as the template next time.

## What it does

- Adds **Add template** and **Save template** next to the description field in the create dialog (pen and save icons).
- **Add template** pastes a structured bug-style outline into the description. A built-in template is provided. You can save your own to replace it.
- **Save template** saves the current description as your personal template.
- Your template is saved locally in this browser.

## How to set up

No separate extension screen. Open **Create** (issue or subtask) as usual.

- Click **Add template** to insert the template at the end of (or into) the description field.
- Edit the text, then use **Save template** if you want the current plain-text description to become the new starting template.

There are no permissions tied to Jira: the template is only on your device in this browser profile.

## Behavior on the board / on the page

Whenever the **create issue** or **create subtask** dialog is open and the description area is shown, the two buttons appear beside it. After closing and reopening the dialog, the buttons work again the same way. The rest of Jira (boards, backlog, settings) is unchanged.

---

<!-- source: src/board-settings/feature.md -->
# Board settings panel

Opens a single **Jira Helper** window from the agile board so you can adjust extension options that apply while you work on that board.

## What it does

- Shows a small **Jira Helper** control next to the board sidebar; clicking it opens a popup with **tabs**.
- Each tab is a different group of settings contributed by the extension (for example interface language, diagnostics, card extras).

## How to set up

1. Go to your **Scrum** or **Kanban** **board** (the normal agile board view).
2. Find the **Jira Helper** entry beside the left sidebar and click it.
3. Switch **tabs** at the top of the popup to reach the options you need; change settings inside each tab as described there.

## Behavior on the board / on the page

On the **board**, the helper control stays available while you navigate cards and columns. The settings popup appears on top of the board; closing it returns you to the board.

---

<!-- source: src/features/local-settings/feature.md -->
# Local settings

Chooses the **language** the Jira Helper extension uses for its own labels and messages in your browser.

## What it does

- Adds a **Local Settings** tab inside the board settings popup (opened from **Jira Helper** on the board).
- Offers **UI language**: follow the browser (**Auto**), **English**, or **Russian**.
- Remembers your choice on this browser; it does not change Jira’s own language settings.

## How to set up

1. Open your **board**, click **Jira Helper** next to the sidebar, then open the **Local Settings** tab.
2. In **UI language**, pick **Auto**, **English**, or **Russian**.

Changes apply as soon as you select an option. No separate Save step. This setting is personal and saved locally in your browser.

## Behavior on the board / on the page

After you set a language, the extension interface (board settings popup and feature labels) uses **English**, **Russian**, or the browser default when **Auto** is selected. Jira’s menus and system language are unchanged.
