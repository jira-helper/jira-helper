# TASK-53: Status Progress Mapping Types

**Status**: DONE
**Type**: types

**Parent**: [EPIC-3](./EPIC-3-progress-status-mapping.md)

---

## Описание

Ввести общий доменный контракт для настройки `status id -> progress bucket`. Этот слой не знает о Gantt или sub-tasks storage и фиксирует, что `blocked` не является пользовательским bucket.

## Файлы

```text
src/shared/status-progress-mapping/
├── types.ts       # новый
└── constants.ts   # новый
```

## BDD Scenarios

- `@SC-PSM-DEFAULT-2` Custom mapping offers only three progress buckets
- `@SC-PSM-DEFAULT-3` Blocked remains outside custom status mapping

## Тесты

- Vitest не требуется для type-only контракта.
- Проверка bucket constraints выполняется в [TASK-54](./TASK-54-resolve-progress-bucket.md) и UI/Cypress задачах.

## Что сделать

1. Создать `ProgressBucket = 'todo' | 'inProgress' | 'done'`.
2. Создать `StatusProgressMappingEntry`, `StatusProgressMapping`, `StatusProgressMappingRow`.
3. Создать constants/options для buckets с labels `To Do`, `In Progress`, `Done`; не добавлять `blocked`.
4. Задокументировать, что `statusId` — единственный stable matching key, а `statusName` — fallback/debug label.

## Критерии приёмки

- [ ] Общие типы импортируются без зависимости от feature modules.
- [ ] Bucket constants содержат только `todo`, `inProgress`, `done`.
- [ ] `statusName` явно описан как fallback/debug metadata.
- [ ] Нет ошибок TypeScript в новых файлах.

## Зависимости

- Зависит от: нет.
- Блокирует: [TASK-54](./TASK-54-resolve-progress-bucket.md), [TASK-58](./TASK-58-status-progress-mapping-section-view.md), [TASK-60](./TASK-60-gantt-progress-mapping-storage.md), [TASK-64](./TASK-64-subtasks-board-property-types.md).

---

## Результаты

**Дата**: 2026-04-28

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Созданы shared types для status progress mapping: `ProgressBucket`, `StatusProgressMappingEntry`, `StatusProgressMapping`, `StatusProgressMappingRow`.
- Созданы bucket constants/options с единственными пользовательскими buckets `To Do`, `In Progress`, `Done`.
- В JSDoc зафиксировано, что `statusId` является единственным stable matching key, а `statusName` используется только как fallback/debug label.
- Пройдены review и QA: `REVIEW-TASK-53.md`, `QA-TASK-53.md`.

**Проблемы и решения**:

Нет.
