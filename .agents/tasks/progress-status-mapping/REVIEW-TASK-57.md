# Review: TASK-57 — Gantt Date Mapping Status Select

**Дата**: 2026-04-28
**TASK**: [TASK-57](./TASK-57-gantt-date-mapping-status-select.md)
**Вердикт**: APPROVED

## Findings

### Critical

Нет.

### Warning

Нет.

### Nit

Нет.

## Резюме

The existing Gantt date-mapping status select now uses Jira status ids as option values and persists `statusName` only as fallback/debug metadata. Legacy rows with only `statusName` still render their fallback label but do not turn the name into a canonical id.
