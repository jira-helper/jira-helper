# Review: TASK-55 — Gantt Changelog Status Ids

**Дата**: 2026-04-28
**TASK**: [TASK-55](./TASK-55-gantt-changelog-status-ids.md)
**Вердикт**: APPROVED

## Findings

### Critical

Нет.

### Warning

Нет.

### Nit

- **[src/features/gantt-chart/types.ts:11]**: `DateMapping` JSDoc still describes `statusTransition` as “status name in the changelog”. This is compatible with current runtime and likely belongs to TASK-56, but it can confuse future work around id-based mappings.
  - Предложение: when TASK-56 updates date mapping lookup, revise this comment to distinguish legacy `statusName` display/compatibility from canonical `statusId`.

## Резюме

Implementation correctly extracts `fromStatusId` / `toStatusId` from changelog `from` / `to`, keeps `fromStatusName` / `toStatusName` from `fromString` / `toString`, and does not substitute display names into id fields. Coverage now explicitly includes null, omitted, and empty-string changelog ids; focused Vitest passed for `parseChangelog.test.ts`.
