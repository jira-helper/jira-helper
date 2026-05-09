---
sidebar_position: 1
---

# Gantt Chart

## Overview

Interactive Gantt diagram on classic issue view. Lays out related tasks — sub-tasks, epic children, and linked issues — on a shared timeline with status breakdown, configurable bar colors, zoom/pan, and quick filters.

**Why:** Jira's built-in issue view shows related tasks as a flat list with no time dimension. The Gantt chart visualizes all related work on a common timeline so you can spot scheduling gaps, overlapping work, and dependencies at a glance.

**Where:** Open any issue in classic view → expand the **Jira Helper Gantt** collapsible section (below attachments). Settings accessible via the gear icon in the chart toolbar.

**How it works:**
- Each related task becomes a horizontal bar positioned by start/end dates
- Date sources are configurable with priority fallbacks (date fields, status-history events)
- Bar colors are rule-driven: by field value or JQL expression
- Multiple scope levels: Global, This Project, This Project + Issue Type (most specific wins)
- Quick filters, text/JQL search, and zoom/pan provide interactive exploration
- Optional status breakdown colors bar segments by time spent in each workflow status

<!-- SCREENSHOT: Gantt chart open on a classic issue page — multiple colored bars across a timeline, status breakdown segments visible on one bar, tooltip open showing assignee/status/dates -->

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Open the Chart](#open-gantt-on-an-issue-page-classic-view)
- [Navigate the Chart](#navigate-wheel-zoom-pan-hover-tooltips-click-bars)
- [Configure Dates](#configure-date-mappings-startend-fields-with-priority-fallbacks)
- [Configure Colors](#configure-bar-color-rules-field-or-jql--color)
- [Choose Issue Sources](#choose-what-to-include-subtasks-epic-children-linked-issues-specific-link-types)
- [Exclusion Filters](#exclusion-filters-field-or-jql)
- [Quick Filters](#quick-filters-built-in-filters-custom-presets-textjql-search)
- [Settings Cascade](#settings-cascade-global--project--projectissuetype-levels)
- [Status Breakdown](#status-breakdown-toggle)
- [Troubleshooting](#troubleshooting)
- [See Also](#see-also)

---

## Prerequisites

- The issue must be opened in **classic view** (the Gantt collapsible section is not available in Jira's new issue view)
- At least one related task (subtask, epic child, or linked issue) with a configured date source is required for bars to render
- Settings are stored in `localStorage` per browser — see [Settings (Local Storage)](/docs/settings#local-storage-personal)

---

## User Jobs

### Open Gantt on an issue page (classic view)

**Goal:** View a horizontal timeline of all work related to the current issue.

1. Open any issue in classic view.
2. Expand the **Jira Helper Gantt** collapsible section (below attachments).
3. Each related task appears as a horizontal bar labelled with issue key and summary.

**Performance note:** Charts with 200+ tasks may take 5–10 seconds to render and become sluggish when zooming/panning. Use exclusion filters and quick filters to reduce visible tasks. Date calculations require changelog access — on Jira Server/Data Center instances with large changelogs, the first load may be slow while historical status changes are fetched.

### Navigate: wheel zoom, pan, hover tooltips, click bars

**Goal:** Explore the chart — zoom in/out, scroll, inspect task details.

1. **Zoom:** Scroll wheel, or use **+ / −** buttons in the toolbar.
2. **Pan:** Click and drag anywhere on the chart, or use scrollbars.
3. **Hover tooltip:** Hover any bar to see full key, summary, and selected extra fields (assignee, status, priority, dates, custom fields).
4. **Click** a bar to select it (visual highlight).
5. Use the **interval selector** in the toolbar to switch between *hours*, *days*, *weeks*, *months* (auto-fits on first load).
6. Click **Open in modal** to enlarge the chart to a full-window overlay. Zoom, pan, and interval settings are preserved when entering and exiting the modal. Close the modal with the ✕ button or by pressing Escape.

<!-- SCREENSHOT: Chart toolbar — interval selector dropdown set to "days", +/− zoom buttons, Open in modal button, gear icon for settings -->

### Configure date mappings (start/end fields with priority fallbacks)

**Goal:** Define how bar start and end dates are determined per task.

1. Click the **gear** button in the chart toolbar → **Gantt Chart** tab → pick a scope: *Global*, *This project*, or *This project + issue type*.
2. Under **Start of bar** and **End of bar**, build a priority list of sources (date fields or status-history events like "entered *In Progress*").
3. Use **Add fallback** to add entries and **up/down arrows** to reorder.
4. The first source that yields a date wins per task; tasks with no matching source are omitted from the chart.

> **Field ID reference:** A field ID is the Jira internal identifier for a custom field (e.g., `customfield_10010`). Find it via Jira's REST API (`/rest/api/2/field`) or by inspecting the field name in Jira's **Administration → Issues → Custom Fields**.

### Configure bar color rules (field or JQL → color)

**Goal:** Highlight bars by field value or JQL expression.

1. In the same settings panel, scroll to **Bar colour rules**.
2. Click **Add rule**, pick a mode: **field value** (field ID + value) or **JQL** (JQL expression).
3. Choose a color and press **Save**.
4. Rules evaluate top to bottom; the first match wins. Reorder with arrows.

### Choose what to include: subtasks, epic children, linked issues, specific link types

**Goal:** Control which related tasks appear on the chart.

1. In settings → **Issues** section, check which categories to include:
   - Sub-tasks
   - Epic children
   - Linked issues (optionally restrict by link type and direction).

### Exclusion filters (field or JQL)

**Goal:** Hide noisy tasks (e.g. cancelled, trivial) from the chart for a scope.

1. In settings → **Exclusion filters** section, click **Add filter**.
2. Choose **field value** (field ID + value) or **JQL** mode.
3. A task matching any one filter (OR logic) is excluded from the chart.
4. Changes apply to everyone using that scope after **Save**.

### Quick filters: built-in filters, custom presets, text/JQL search

**Goal:** Filter bars interactively without changing settings.

1. Above the chart, use the **quick-filters row**:
   - **Search box** — type text or switch to **JQL mode** for JQL expressions.
   - Built-in **Unresolved** and **Hide completed** chips (always available).
   - **Custom chips** — save a JQL expression as a reusable chip via **Save as quick filter**.
2. Multiple chips combine with AND.
3. Active filters and search text are session-only (reset on reload); saved chip presets persist.

<!-- SCREENSHOT: Quick-filters row — search box, "Unresolved" chip active (highlighted), "Hide completed" chip active, one custom chip "Team Alpha" -->

### Settings cascade: global → project → project+issueType levels

**Goal:** Set defaults globally and override per project or per project+issueType.

1. Open settings → scope picker at the top: *Global*, *This project*, or *This project + issue type*.
2. Use **Copy from…** to seed a new scope from an existing one.
3. At view time, the most specific scope that has settings wins.
4. Reopening settings snaps the scope picker to the level actually being applied, so you never edit an empty form for a more specific scope.

### Status breakdown toggle

**Goal:** Split each bar into coloured segments based on actual status history.

1. In settings, toggle **Status breakdown** on.
2. Bars now show segments: gray (*to do*), blue (*in progress*), green (*done*), red (*blocked*).
3. Tasks with a start date but no end date are drawn from their start date through **today** with a warning marker (⚠️) at the right end of the bar, indicating an active task that hasn't finished.
4. Tasks with neither start nor end appear in a collapsible **not on chart** section below the chart with a per-task reason.

<!-- SCREENSHOT: Bar with status breakdown — segments in gray/blue/green/red along the bar, ⚠️ warning marker at the end for an unfinished task -->

---

## Troubleshooting

### No bars appear on the chart

- Verify at least one **Issues** category (subtasks, epic children, linked issues) is checked in settings
- Confirm the scope being applied has date sources configured — check the scope picker in settings to see which level is active
- For linked issues, ensure the link type filter (if set) matches actual links on the issue
- All configured date sources may be empty for the related tasks — try adding a fallback like a custom date field that is consistently populated

### Wrong dates on bars

- Check the **Start of bar** / **End of bar** priority order in settings. The first matching source wins — if a lower-priority source is more accurate, move it up in the list.
- Status-history date sources ("entered In Progress") require status transitions in the changelog. If a task was created directly in "In Progress," there is no "entered" event and that source yields no date.
- Date fields must be of type **Date** or **DateTime** in Jira — text fields containing dates are not recognized.

### Settings not applying / reverting

- Settings are stored in `localStorage`. Clearing browser data for the Jira domain will erase all Gantt chart configuration.
- If settings appear to revert, check that you're editing the correct scope (Global vs. This Project vs. This Project + Issue Type). A more specific scope may override the one you edited.
- After changing settings, click **Save** and reload the issue page for changes to take effect.

---

## See Also

- [Sub-tasks Progress](/docs/features/sub-tasks-progress) — progress bars for child work
- [Issue Links Display](/docs/features/card-information/issue-links-display) — in-card link badges
- [Settings: Local Storage](/docs/settings#local-storage-personal)
- [FAQ](/docs/advanced/faq)
- [Jira REST API: Fields](https://docs.atlassian.com/software/jira/docs/api/REST/latest/#api/2/field) — find custom field IDs
