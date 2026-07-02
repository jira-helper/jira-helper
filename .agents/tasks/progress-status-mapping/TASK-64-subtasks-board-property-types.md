# TASK-64: Sub-Tasks Board Property Types

**Status**: DONE
**Type**: types

**Parent**: [EPIC-3](./EPIC-3-progress-status-mapping.md)

---

## Описание

Расширить контракт sub-tasks progress board property optional-блоком `statusProgressMapping`. Legacy `statusMapping` / `newStatusMapping` остаются readable compatibility fields, но новая настройка не должна использовать их для записи.

## Файлы

```text
src/features/sub-tasks-progress/
└── types.ts  # изменение
```

## BDD Scenarios

- `@SC-PSM-SUB-1` Configure sub-tasks progress status id mapping
- `@SC-PSM-DEFAULT-1` Missing settings block uses default Jira statusCategory mapping
- `@SC-PSM-DEFAULT-3` Blocked remains outside custom status mapping

## Тесты

- Vitest не требуется для type-only изменения.
- Store/runtime тесты добавляются в [TASK-65](./TASK-65-subtasks-board-property-store.md) и [TASK-66](./TASK-66-subtasks-runtime-progress-mapping.md).

## Что сделать

1. Import shared `StatusProgressMapping` type.
2. Add `statusProgressMapping?: StatusProgressMapping` to `BoardProperty`.
3. Document absence semantics and why `blocked` is not included.
4. Do not remove legacy fields.

## Критерии приёмки

- [ ] Board property type supports optional `statusProgressMapping`.
- [ ] Legacy fields remain in type.
- [ ] New field uses shared buckets from [TASK-53](./TASK-53-status-progress-types.md).
- [ ] Нет ошибок TypeScript в sub-tasks progress types.

## Зависимости

- Зависит от: [TASK-53](./TASK-53-status-progress-types.md).
- Блокирует: [TASK-65](./TASK-65-subtasks-board-property-store.md).

---

## Результаты

**Дата**: TBD

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Added optional `statusProgressMapping?: StatusProgressMapping` to `BoardProperty`.
- Preserved legacy `statusMapping` and `newStatusMapping` fields for readable compatibility.
- Documented missing-block default behavior and why `blocked` remains outside persisted mapping.
- Fixed strict TypeScript follow-ups exposed by the new type contract.

**Проблемы и решения**:

Initial TypeScript QA failed because `Required<BoardProperty>` defaults needed the new field and earlier mapping utilities had strict type issues. Added a default empty mapping, tightened the Gantt bucket type guard, and passed mutable bucket options to AntD Select.
