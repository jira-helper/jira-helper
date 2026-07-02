# Review: TASK-67 — Sub-Tasks Settings Container

**Дата**: 2026-04-28
**TASK**: [TASK-67](./TASK-67-subtasks-settings-container.md)
**Вердикт**: APPROVED

## Findings

### Critical

Нет.

### Warning

Нет.

### Nit

Нет.

## Резюме

Sub-tasks board settings now render the shared status progress mapping section after `CountSettings` and before grouping settings. The container reads Jira statuses, converts between store mapping and editable rows, updates the board property store through dedicated actions, preserves incomplete local rows during selection, and rejects arbitrary status search text.
