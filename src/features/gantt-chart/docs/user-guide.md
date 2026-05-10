# Gantt Chart

| | |
|---|---|
| Где настраивается | «Issue Page» → «Helper» button or gear in «Gantt» panel → «Gantt Chart» tab |
| Где видно | Issue Page (classic view, below attachments) |
| Settings apply to | Only for you |(`jh-gantt-settings`) |

## Цель

Add a horizontal Gantt diagram to the classic issue view that lays out every related task — sub-tasks, epic children, and linked issues — on a shared timeline so you can see when each piece of work runs and how its status has changed over time.

<div class="feature-mockup">
  <div class="mockup-board">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
      <span class="mockup-badge blue">Unresolved</span>
      <span class="mockup-badge green">Hide done</span>
      <span style="font-size:0.65rem;color:#5e6c84;margin-left:auto;">days</span>
    </div>
    <div style="position:relative;padding-left:60px;font-size:0.65rem;">
      <div style="position:absolute;left:8px;top:0;color:#5e6c84;">TASK-99</div>
      <div style="background:#4c9aff;height:14px;border-radius:3px;margin:4px 0;display:flex;">
        <div style="background:#dfe1e6;width:20%"></div><div style="background:#4c9aff;width:30%"></div><div style="background:#36b37e;width:25%"></div><div style="background:#ff5630;width:25%"></div>
      </div>
      <div style="position:absolute;left:8px;top:22px;color:#5e6c84;">TASK-88</div>
      <div style="background:#ff8b00;height:14px;border-radius:3px;margin:4px 0;display:flex;">
        <div style="background:#dfe1e6;width:5%"></div><div style="background:#ff8b00;width:70%"></div><div style="background:#36b37e;width:25%"></div>
      </div>
      <div style="position:absolute;left:8px;top:44px;color:#5e6c84;">TASK-77</div>
      <div style="background:#36b37e;height:14px;border-radius:3px;margin:4px 0"></div>
    </div>
    <div style="display:flex;gap:2px;margin-top:6px;font-size:0.55rem;color:#5e6c84;">
      <span>To Do</span><span style="background:#dfe1e6;width:12px;height:8px;border-radius:2px"></span>
      <span>In Progress</span><span style="background:#4c9aff;width:12px;height:8px;border-radius:2px"></span>
      <span>Done</span><span style="background:#36b37e;width:12px;height:8px;border-radius:2px"></span>
      <span>Blocked</span><span style="background:#ff5630;width:12px;height:8px;border-radius:2px"></span>
    </div>
  </div>
</div>

## Как настроить

### Where to find settings

The Gantt chart settings can be opened in two ways:

**Via the issue toolbar:**

1. Open any issue in the classic view and click **«Helper»** in the issue toolbar.
2. Select the **«Gantt Chart»** tab.

**Via the chart panel:**

1. Open the Gantt chart panel on an issue page.
2. Click the gear button in the chart's toolbar.

Both methods open the same settings dialog.

### How to configure

- **Select a scope**: choose «Global», «This project», or «This project + issue type». Use **«Copy from…»** to seed a new scope from an existing one. The most specific scope with settings wins at view time.
- **Set bar start and end sources**: build a priority list of date fields or status transitions. Use **«Add fallback»** and the up/down arrows to set order — the first source that yields a date for each task wins.
- **Choose issue categories**: include sub-tasks, epic children, linked issues. For links, optionally restrict by link type and direction.
- **Add exclusion filters**: drop tasks you never want on the chart — a task is excluded if any filter matches.
- **Add bar colour rules**: highlight work by field value or JQL expression. Rules are evaluated top to bottom; first match wins.
- **Add quick filters**: create reusable toggle chips in «field value» or JQL mode. Built-in **«Unresolved»** and **«Hide completed»** chips are always available.
- **Pick tooltip fields**: select extra fields to show in the hover tooltip.

Click **«Save»** to persist settings. Settings cascade: project+issue type → project → global. Settings survive browser reload.

## Как использовать

- The Gantt section is **collapsed by default**. Click to expand and load the chart.
- **Zoom and pan:** Scroll-wheel zoom, +/- buttons, interval selector («hours», «days», «weeks», «months»), drag-to-pan anywhere on the chart.
- **Hover tooltip:** Hover any bar to see the issue key, summary, status, dates, and any extra configured fields.
- **Status breakdown:** Enable in settings to split each bar into colored segments (gray = to do, blue = in progress, green = done, red = blocked).
- **Quick filters:** Use the chips above the chart to filter visible tasks. Type in the search box for text or JQL search. Multiple chips combine with AND.
- **Open in modal:** Click the expand button to view the chart full-screen while keeping zoom and toolbar state.
- **Yellow warnings:** Alert chips appear when the chart is incomplete — "No history for X of Y tasks" or "X tasks not on chart". Hover for details.
- While typing in Gantt inputs, Jira keyboard shortcuts are suppressed.

## Сценарии использования

- **Sprint planning:** See all related tasks on a timeline to assess readiness and dependencies.
- **Status review:** Use the status breakdown to see how long issues spent in each state.
- **Dependency tracking:** Include linked issues to visualize cross-issue dependencies.
- **Team sync:** Use the modal view during stand-ups to walk through the timeline.

## Устранение неполадок

- **Chart not loading:** Check browser console for errors. The chart may fail if Jira API requests are rate-limited.
- **Tasks missing from chart:** Check exclusion filters and ensure start/end mappings yield dates for those tasks. Look in the "not on chart" section for reasons.
- **Status breakdown wrong:** Verify the status-to-category mapping in settings or the scope's status progress mapping.
- **Settings not persisting:** Ensure localStorage is not cleared between sessions and the browser does not block local storage.

## См. также

- [Sub-tasks Progress](/docs/features/sub-tasks-progress)
