# Review: TASK-64 — Sub-Tasks Board Property Types

**Дата**: 2026-04-28
**TASK**: [TASK-64](./TASK-64-subtasks-board-property-types.md)
**Вердикт**: APPROVED

## Findings

### Critical

Нет.

### Warning

Нет.

### Nit

Нет.

## Резюме

`BoardProperty` now supports optional `statusProgressMapping` using the shared status progress mapping contract while preserving legacy readable `statusMapping` and `newStatusMapping` fields. The type documents missing-block fallback semantics and keeps `blocked` outside persisted custom mapping because it remains a runtime override.

## Fix-loop notes

Initial TypeScript QA exposed strict typing issues from the new optional field and prior shared/Gantt mapping code. The store defaults now include an empty mapping for `Required<BoardProperty>`, Gantt mapping normalization uses a proper `ProgressBucket` type guard, and the shared bucket select receives mutable options.
