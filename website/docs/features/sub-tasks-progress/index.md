---
sidebar_position: 1
---

# Card Progress Bars

The Sub-tasks Progress feature adds compact progress bars (and optional numeric counters) to board cards, showing completion status for child work: subtasks, epic children, linked issues, and external links.

**Why:** Monitoring epic or task progress normally requires opening each issue individually. Inline progress bars let team leads and team members see completion at a glance directly on the board, with support for grouping by assignee, project, or other fields.

**Where:** Board Settings → Jira Helper → Sub-tasks Progress tab. Progress bars appear on cards in selected columns.

**How it works:**
- Work is split into four progress buckets: **todo**, **inProgress**, **done**, **blocked**
- Status-to-bucket mapping is configurable — you decide which Jira statuses count as todo, in progress, done, or blocked
- Issue sources are independently togglable: subtasks, epic children, linked issues (with optional link-type filter), external links
- Progress can be shown as a single combined bar or as a multi-segment split bar
- **Grouping** (by assignee, project, reporter, priority, issue type, or custom fields) splits the bar into colored segments per group
- Group display modes: colored bars, simple counters, or both; groups can be hidden when completed or shown only for incomplete work
- Blocked detection: Jira flags and `is blocked by` links can automatically mark issues as blocked and show warning hints on parent cards
- Settings are per board, stored in board properties

<!-- SCREENSHOT: Board settings panel — Sub-tasks Progress tab with Enable toggle on, status mapping grid filled in, grouping by Assignee enabled -->

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Enable the feature](#enable-the-feature)
- [Configure which columns show progress bars](#configure-which-columns-show-progress-bars)
- [Choose issue sources](#choose-issue-sources-subtasks-epic-children-linked-issues)
- [Map statuses to progress buckets](#map-statuses-to-progress-buckets)
- [Configure grouping and custom groups](#configure-grouping-and-custom-groups)
- [Detect blocked issues via flags and links](#detect-blocked-issues-via-flags-and-links)
- [Board view: compact colored progress bar](#board-view-compact-colored-progress-bar)
- [Performance Considerations](#performance-considerations)
- [FAQ](#faq)
- [Troubleshooting](#troubleshooting)
- [See Also](#see-also)

---

## Prerequisites

- **Board edit permissions** required to configure status mappings and sources (settings stored in [board properties](/docs/settings#board-properties-team-shared))
- The board must have at least one column selected in **Column Settings** for progress bars to appear
- For epic-linked-issue sources, the issues must be linked **from** epic children **to** other issues via the specified link type and direction

---

## User Jobs

### Enable the feature

**Goal:** Turn on progress bars for the current board.

1. Open your board and click **Jira Helper** in the board toolbar.
2. Select the **Sub-tasks progress** tab.
3. Check the **Enable** toggle at the top of the panel.
4. Progress bars now appear on cards (subject to column and source configuration).

### Configure which columns show progress bars

**Goal:** Limit progress bar display to specific workflow columns.

1. In the Sub-tasks progress settings, locate the **Column Settings** section.
2. Select the columns where progress bars should appear.
3. Cards in unselected columns will not show progress bars, even if the feature is enabled.

### Choose issue sources

**Goal:** Define what counts as "child work" for the progress calculation.

1. In the settings, find the **Counting** section.
2. Toggle each source independently. Each source toggled on contributes its matching issues to the progress buckets.

#### Epic issues

Count issues in the same epic.

#### Epic linked issues

Count issues linked to epic children via specific link types. Select a **link type** (e.g., `blocks`, `relates to`) and **direction** (inward = issues that link *to* the epic child; outward = issues the epic child links *to*).

#### Sub-tasks

Count direct Jira subtasks of the card.

#### Issue linked issues

Count issues linked to the card, optionally filtered by link type and direction.

#### Subtasks linked issues

Count issues linked to subtasks, optionally filtered by link type and direction.

#### External links

Count issues linked to the card via external links (URL references).

#### Epic external links

Count external links on epic children.

### Map statuses to progress buckets

**Goal:** Define which Jira statuses count as todo, in progress, done, and blocked.

1. In the settings, find the **Status Progress Mapping** section.
2. For each Jira status in your workflow, assign it to a bucket:
   - **Todo:** not yet started
   - **In Progress:** actively being worked on
   - **Done:** completed
   - **Blocked:** impeded (optional — blocked can also be derived from flags/links)
3. Statuses not mapped to any bucket are excluded from totals.
4. The mapping respects Jira's default status categories unless overridden.

### Configure grouping and custom groups

**Goal:** Split the progress bar into color-coded segments by a field (e.g., by assignee or project).

1. In the settings, find the **Grouping** section.
2. Toggle **Enable group by field** to activate segmentation.
3. Select a **Grouping Field** from the dropdown: `project`, `assignee`, `reporter`, `priority`, `creator`, `issueType`, or a custom field.
4. Add **Ignored Groups** — specific field values to exclude from the bar (e.g., exclude a specific assignee who is on leave).
5. Configure display options:
   - **Show groups as counters:** display numeric counts instead of bars for each group
   - **Hide if completed:** hide groups where all work is done
   - **Show only incomplete:** display only groups with pending work
   - **Custom groups:** define named groups with explicit filters. Enter a **group name** (displayed on the bar) and a **filter** in the format `fieldId = "value"` (e.g., `customfield_10010 = "Frontend"` or `priority = "High"`), then pick colors
6. For each group field value (or custom group), you can set:
   - **Pending color:** the bar/segment color for incomplete work
   - **Done color:** the bar/segment color for completed work

### Detect blocked issues via flags and links

**Goal:** Automatically mark blocked child work and show a warning on the parent card.

1. In the settings, find the **Blocked issues** section.
2. Toggle **Blocked detection via flags** to mark flagged issues as blocked.
3. Toggle **Blocked detection via issue links** and select a link type (e.g., `is blocked by`) to mark issues with that link as blocked.
4. On the board, parent cards with blocked children display a ⚠️ warning indicator with a hint (e.g., "2 blocked issues").

### Board view: compact colored progress bar

**Goal:** Read completion status directly from board cards.

1. Look at cards in the selected columns. Each card shows a progress bar below the summary.
2. **Without grouping:** a single colored bar with segments for todo (gray), in progress (blue), done (green), and blocked (red). Numerical counters (e.g., `3/5`) may also appear depending on settings.
3. **With grouping:** the bar is split into colored segments, one per group. Each segment shows that group's completion proportion.
4. **Hover** a segment to see a tooltip with the group name and counts (e.g., `Alice: 2/4 done`).
5. If blocked detection is enabled, a warning indicator (⚠️) appears on the card when any child work is blocked or flagged, along with a short hint text.
6. After updating issue statuses, the progress bar refreshes to reflect the new state when the board updates.

<!-- SCREENSHOT: Board card showing a colored progress bar — green "done" segment at 60%, blue "in progress" at 25%, gray "todo" at 15%, with counter "5/8" and a ⚠️ blocked indicator -->

<!-- SCREENSHOT: Board card with grouping enabled — multi-segment bar with colored blocks per assignee, tooltip visible on hover showing "Alice: 3/4 done" -->

---

## Performance Considerations

- Each active issue source generates API requests proportional to the number of cards × children per card. On boards with **100+ cards and 3+ active sources**, progress bars may take 3–5 seconds to fully render.
- For large epics (50+ child issues), limit active sources to only the data you need. Disable **Epic linked issues** and **Epic external links** unless specifically required.
- Grouping by custom fields adds an extra API request per card to read field values. Use standard fields (assignee, priority, etc.) for better performance.

---

## FAQ

### Why are there no progress bars on my cards?

The most common causes: (1) the feature is not enabled for the board, (2) no columns are selected in **Column Settings**, (3) no issue sources are toggled on in **Counting**, (4) status mapping is incomplete — if all child statuses map to unassigned, the bar shows 0%.

### What happens when a card has zero subtasks or children?

The progress bar does not appear on the card. A bar is only rendered when at least one child issue is counted via the enabled sources.

### How do I exclude certain statuses from the progress bar?

In the **Status Progress Mapping** grid, leave the bucket column blank for statuses you want to ignore. Issues in those statuses are excluded from all progress calculations.

### Does the blocked detection auto-update if I flag/unflag an issue?

Yes — blocked status derived from Jira flags and issue links refreshes when the board updates. Flag an issue in another tab, switch back to the board, and the ⚠️ indicator appears on the parent card on next board refresh.

---

## Troubleshooting

### Progress bar shows 0% / all gray

- Check that at least one child issue has a status mapped to **Done** or **In Progress** in the status mapping
- If using linked-issue sources, verify the link type and direction are set correctly — the direction may be inverted
- Epic-linked issues require the link to be on the epic child itself, not on the epic

### Blocked indicator not showing

- Ensure at least one of **Blocked detection via flags** or **Blocked detection via issue links** is toggled on
- For link-based detection, verify the selected link type exists in your Jira instance
- The parent card must be in a selected column

### Status mapping changes not taking effect

- Click **Save** after modifying the mapping. Unsaved changes are lost on tab switch or board reload.

---

## See Also

- [Issue Links Display](/docs/features/card-information/issue-links-display) — in-card link badges
- [Issue Condition Checks](/docs/features/card-information/issue-condition-checks) — icon badges for JQL conditions
- [Flag on Issue Panel](/docs/features/flag-issue) — auto-highlight flagged work
- [Gantt Chart](/docs/features/gantt-chart) — timeline view of child work
- [Settings: Board Properties](/docs/settings#board-properties-team-shared)
- [FAQ](/docs/advanced/faq)
