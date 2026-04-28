# Review: TASK-62 — Gantt Progress Mapping Settings UI

**Дата**: 2026-04-28
**TASK**: [TASK-62](./TASK-62-gantt-progress-mapping-settings-ui.md)
**Вердикт**: APPROVED

## Findings

### Critical

Нет.

### Warning

Нет.

### Nit

Нет.

## Резюме

`GanttSettingsModal` now renders the shared `StatusProgressMappingSection` on the Bars tab after start/end mappings and before tooltip fields. The modal converts between persisted id-keyed settings and view rows, patches `draft.statusProgressMapping` through the existing draft flow, uses Jira statuses from `useGetStatuses()`, and keeps arbitrary search text out of persisted mappings.
