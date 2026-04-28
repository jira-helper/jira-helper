# TASK-66: Sub-Tasks Runtime Progress Mapping

**Status**: DONE
**Type**: model

**Parent**: [EPIC-3](./EPIC-3-progress-status-mapping.md)

---

## Описание

Подключить `statusProgressMapping` к runtime расчёту sub-tasks progress. Custom mapping должен применяться по issue `statusId` перед существующими blocked overrides для flags/link rules.

## Файлы

```text
src/features/sub-tasks-progress/IssueCardSubTasksProgress/hooks/
├── useSubtasksProgress.tsx       # изменение
└── useSubtasksProgress.test.tsx  # новый / изменение
```

## BDD Scenarios

- `@SC-PSM-SUB-1` Configure sub-tasks progress status id mapping
- `@SC-PSM-SUB-2` Sub-tasks progress mapping matches by status id, not status name
- `@SC-PSM-DEFAULT-1` Missing settings block uses default Jira statusCategory mapping
- `@SC-PSM-DEFAULT-3` Blocked remains outside custom status mapping

## Тесты

- Vitest: sub-task with custom mapped `statusId` is counted in configured bucket.
- Vitest: same `statusName` with different id falls back to Jira category.
- Vitest: missing mapping block keeps default category behavior.
- Vitest: existing `flagsAsBlocked` / `blockedByLinksAsBlocked` overrides still win after resolver bucket.

## Что сделать

1. Read `statusProgressMapping` from board property store data.
2. Call shared `resolveProgressBucket` from [TASK-54](./TASK-54-resolve-progress-bucket.md).
3. Ensure issue input uses stable status id; if current type lacks id, extend only the local input type needed by this hook.
4. Keep external issue status color fallback unchanged unless stable status id exists.

## Критерии приёмки

- [ ] Sub-tasks progress calculation uses custom mapping by id.
- [ ] Fallback status names are ignored for matching.
- [ ] Blocked remains runtime override and is not a configurable bucket.
- [ ] Тесты проходят: `npm test -- useSubtasksProgress`.

## Зависимости

- Зависит от: [TASK-54](./TASK-54-resolve-progress-bucket.md), [TASK-65](./TASK-65-subtasks-board-property-store.md).
- Блокирует: [TASK-71](./TASK-71-subtasks-status-mapping-cypress.md).

---

## Результаты

**Дата**: TBD

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Connected sub-tasks progress calculation to shared `resolveProgressBucket`.
- Applied custom mapping by stable Jira `statusId` before existing flagged/link blocked overrides.
- Added focused tests for id-only matching, missing mapping fallback, and blocked override priority.

**Проблемы и решения**:

Нет.
