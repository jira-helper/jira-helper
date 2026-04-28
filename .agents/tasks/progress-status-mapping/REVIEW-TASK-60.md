# Review: TASK-60 — Gantt Progress Mapping Storage

**Дата**: 2026-04-28
**TASK**: [TASK-60](./TASK-60-gantt-progress-mapping-storage.md)
**Вердикт**: APPROVED

## Findings

### Critical

Нет.

### Warning

Нет.

### Nit

Нет.

## Резюме

`GanttScopeSettings` now accepts optional `statusProgressMapping`, while default scope settings omit the block for backwards compatibility. Load/save normalization preserves valid id-keyed rows and drops rows without `statusId` or with non-configurable buckets.
