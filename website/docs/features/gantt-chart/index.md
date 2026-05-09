# Gantt Chart

## Overview

Interactive Gantt diagram on classic issue view. Lays out related tasks — sub-tasks, epic children, and linked issues — on a shared timeline with status breakdown, configurable bar colors, zoom/pan, and quick filters.

---

## User Jobs

### Open Gantt on an issue page (classic view)

**Goal:** View a horizontal timeline of all work related to the current issue.

1. Open any issue in classic view.
2. Expand the **Jira Helper Gantt** collapsible section (below attachments).
3. Each related task appears as a horizontal bar labelled with issue key and summary.

### Navigate: wheel zoom, pan, hover tooltips, click bars

**Goal:** Explore the chart — zoom in/out, scroll, inspect task details.

1. **Zoom:** Scroll wheel, or use **+ / −** buttons in the toolbar.  
2. **Pan:** Click and drag anywhere on the chart, or use scrollbars.  
3. **Hover tooltip:** Hover any bar to see full key, summary, and selected extra fields (assignee, status, priority, dates, custom fields).  
4. **Click** a bar to select it (visual highlight).  
5. Use the **interval selector** in the toolbar to switch between *hours*, *days*, *weeks*, *months* (auto-fits on first load).  
6. Click **Open in modal** to enlarge the chart to full browser window while preserving zoom and pan state.

### Configure date mappings (start/end fields with priority fallbacks)

**Goal:** Define how bar start and end dates are determined per task.

1. Click the **gear** button in the chart toolbar → **Gantt Chart** tab → pick a scope: *Global*, *This project*, or *This project + issue type*.  
2. Under **Start of bar** and **End of bar**, build a priority list of sources (date fields or status-history events like "entered *In Progress*").  
3. Use **Add fallback** to add entries and **up/down arrows** to reorder.  
4. The first source that yields a date wins per task; tasks with no matching source are omitted from the chart.

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
3. Tasks with a start but no end are drawn up to today with a warning marker.  
4. Tasks with neither start nor end appear in a collapsible **not on chart** section below the chart with a per-task reason.
