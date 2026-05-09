---
sidebar_position: 1
---

# Sub-tasks Progress

## Overview

The Sub-tasks Progress feature adds a compact progress bar (and optional numeric counters) to board cards, showing completion status for child work: subtasks, epic children, linked issues, and external links.

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

### Choose issue sources: subtasks, epic children, linked issues

**Goal:** Define what counts as "child work" for the progress calculation.

1. In the settings, find the **Counting** section.
2. Toggle each source independently:
   - **Epic issues:** count issues in the same epic
   - **Epic linked issues:** count issues linked to epic children via specific link types
   - **Sub-tasks:** count direct Jira subtasks of the card
   - **Issue linked issues:** count issues linked to the card (optionally filtered by link type)
   - **Subtasks linked issues:** count issues linked to subtasks
   - **External links:** count issues linked to the card via external links
   - **Epic external links:** count external links on epic children
3. For linked-issue sources, you can optionally restrict by link type and direction.

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

### Configure grouping and ignored groups

**Goal:** Split the progress bar into color-coded segments by a field (e.g., by assignee or project).

1. In the settings, find the **Grouping** section.
2. Toggle **Enable group by field** to activate segmentation.
3. Select a **Grouping Field** from the dropdown: `project`, `assignee`, `reporter`, `priority`, `creator`, `issueType`, or a custom field.
4. Add **Ignored Groups** — specific field values to exclude from the bar (e.g., exclude a specific assignee who is on leave).
5. Configure display options:
   - **Show groups as counters:** display numeric counts instead of bars for each group
   - **Hide if completed:** hide groups where all work is done
   - **Show only incomplete:** display only groups with pending work
   - **Custom groups:** define named groups with their own JQL-like filters and colors
6. For each group field value (or custom group), you can set:
   - **Pending color:** the bar/segment color for incomplete work
   - **Done color:** the bar/segment color for completed work

### Board view: compact colored progress bar

**Goal:** Read completion status directly from board cards.

1. Look at cards in the selected columns. Each card shows a progress bar below the summary.
2. **Without grouping:** a single colored bar with segments for todo (gray), in progress (blue), done (green), and blocked (red). Numerical counters (e.g., `3/5`) may also appear depending on settings.
3. **With grouping:** the bar is split into colored segments, one per group. Each segment shows that group's completion proportion.
4. **Hover** a segment to see a tooltip with the group name and counts (e.g., `Alice: 2/4 done`).
5. If blocked detection is enabled, a warning indicator (⚠️) appears on the card when any child work is blocked or flagged, along with a short hint text.
6. After updating issue statuses, the progress bar refreshes to reflect the new state when the board updates.
