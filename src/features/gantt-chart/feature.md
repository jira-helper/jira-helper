# Gantt chart on issue view

Adds a horizontal Gantt diagram to the classic issue view that lays out every related task — sub-tasks, epic children, and linked issues — on a shared timeline so you can see when each piece of work runs and how its status has changed over time.

## What it does

- Adds a collapsible **Jira Helper Gantt** section to the issue page, just under the attachments area. One bar per related task, labelled with the issue **key and summary**.
- Lets you choose **what to include**: direct sub-tasks, epic children, and linked issues (with optional restriction by link type and direction).
- Builds each bar's **start and end** from a priority list you configure. Each entry can be a **date field** (for example *Created* or *Due date*) or a **status-history event** (for example "entered *In Progress*"). The first entry that yields a date wins; if nothing matches the task does not get a bar.
- A **Status breakdown** toggle splits each bar into coloured segments based on the task's actual status history: gray for *to do*, blue for *in progress*, green for *done*, red for *blocked*.
- **Bar colours** can be driven by your own rules — match by field value or by a JQL expression and pick any colour. Rules are evaluated top to bottom; the first match wins, otherwise the default colour is used.
- Tasks with a **start but no end** are drawn up to today and capped with a warning marker. Tasks with **no start and no end** are listed below the chart in a collapsible *not on chart* section with a per-task reason.
- A **quick-filters row** sits above the chart: a live search (text or JQL mode), built-in **Unresolved** and **Hide completed** chips, and any custom chips you save. Multiple chips combine with AND.
- In JQL search mode you can press **Save as quick filter**, name the expression, and turn it into a reusable chip on the current scope.
- **Exclusion filters** in the settings hide tasks that match any one of several conditions (OR), so you can keep noise like cancelled or trivial work off the chart for everyone using that scope.
- A **hover tooltip** on each bar always shows the full key and summary, plus any extra fields you select (assignee, status, priority, dates, custom fields…).
- **Yellow warning chips** in the toolbar appear only when the chart is incomplete: *No history for X of Y tasks* and *X tasks not on chart*. Hover either chip to see the affected tasks with the reason for each.
- **Zoom and pan**: scroll-wheel zoom, plus and minus buttons, an interval selector (*hours*, *days*, *weeks*, *months*) that auto-fits on first load, drag-to-pan anywhere on the chart, and standard scrollbars.
- An **Open in modal** button enlarges the chart to the full browser window while keeping the current zoom and toolbar state.

## How to set up

1. Open any issue in the classic view, click the **Helper** button in the issue toolbar (next to *Share* / *Export*) to open the Issue Settings dialog, then pick the **Gantt Chart** tab. The same panel opens directly from the gear button in the chart's own toolbar.
2. Pick the **scope** you want to edit at the top of the panel: *Global*, *This project*, or *This project + issue type*. When you start a new scope use **Copy from…** to seed it from an existing one. The most specific scope that has settings wins at view time.
3. Under **Start of bar** and **End of bar**, build a priority list of sources (date fields or status transitions). Use *Add fallback* and the up/down arrows to set the order; the first source that yields a date wins for each task.
4. In the **Issues** section, choose which categories to include — sub-tasks, epic children, linked issues — and, for links, optionally restrict to specific link types and directions.
5. Add **Exclusion filters** to drop tasks you never want on the chart for this scope. A task is excluded as soon as it matches any one filter.
6. Add **Bar colour rules** to highlight work by field value or JQL. Rules are evaluated top to bottom; reorder them with the arrows.
7. Add **Quick filters** for chips you want to reuse across sessions; choose *field value* or *JQL* mode and give each chip a short name. The built-in *Unresolved* and *Hide completed* chips are always available and cannot be edited.
8. Pick which extra fields appear in the **hover tooltip** and press **Save** to apply the changes to the selected scope.

## Behavior on the page

- The Gantt section is **collapsed by default**. Expanding it loads the related issues for the open task and renders the chart according to the resolved scope (*project + issue type* falls back to *project*, which falls back to *global*).
- Reopening the settings dialog **snaps the scope picker to the level whose options are actually being applied**, so you always edit the settings you currently see and never an empty form for a more specific scope.
- **Saved configuration** — start and end mapping, includes, exclusions, colour rules, custom quick filters, tooltip fields, status-breakdown toggle and chosen interval — survives reload. Settings are kept in the browser's local storage; nothing is written to Jira.
- The **active quick-filter chips**, the **search text** and its **text/JQL mode** are session-only and reset on reload, mirroring how Jira boards treat ad-hoc filters. Saved chip presets themselves are persistent.
- The **Open in modal** view shares state with the inline chart: zoom level and pan position are preserved when you enter or leave the modal, and the toolbar controls keep working there too.
- While typing inside any Gantt input or settings field, **Jira's keyboard shortcuts are suppressed** so letters like `a`, `c` or `i` do not trigger Assign, Comment or other Jira actions.
