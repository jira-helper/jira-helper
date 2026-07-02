# TASK-65: Sub-Tasks Board Property Store

**Status**: DONE
**Type**: model

**Parent**: [EPIC-3](./EPIC-3-progress-status-mapping.md)

---

## Описание

Добавить defaults и actions для `statusProgressMapping` в sub-tasks progress board property store. Autosync board property должен продолжить работать через существующий механизм без отдельного UI ошибки сохранения.

## Файлы

```text
src/features/sub-tasks-progress/SubTaskProgressSettings/stores/
├── subTaskProgressBoardProperty.types.ts  # изменение
├── subTaskProgressBoardProperty.ts        # изменение
└── subTaskProgressBoardProperty.test.ts   # новый
```

## BDD Scenarios

- `@SC-PSM-SUB-1` Configure sub-tasks progress status id mapping
- `@SC-PSM-DEFAULT-1` Missing settings block uses default Jira statusCategory mapping

## Тесты

- Vitest: `initialData.statusProgressMapping` is `{}` for runtime convenience.
- Vitest: `setData()` merges optional persisted block over initial data.
- Vitest: `setStatusProgressMapping`, `removeStatusProgressMapping`, `clearStatusProgressMapping` update store state.
- Vitest: actions preserve `statusId` keys and do not write legacy `newStatusMapping`.

## Что сделать

1. Add store action types for setting/removing/clearing mapping.
2. Add `statusProgressMapping: {}` to initial data.
3. Implement actions with existing Zustand/Immer style.
4. Add focused store tests.

## Критерии приёмки

- [ ] Store exposes actions required by settings container.
- [ ] Existing autosync path can persist the full board property data.
- [ ] Legacy `newStatusMapping` is not extended by new actions.
- [ ] Тесты проходят: `npm test -- subTaskProgressBoardProperty`.

## Зависимости

- Зависит от: [TASK-64](./TASK-64-subtasks-board-property-types.md).
- Блокирует: [TASK-66](./TASK-66-subtasks-runtime-progress-mapping.md), [TASK-67](./TASK-67-subtasks-settings-container.md).

---

## Результаты

**Дата**: TBD

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Added `setStatusProgressMapping`, `removeStatusProgressMapping`, and `clearStatusProgressMapping` store actions.
- Kept `statusProgressMapping: {}` in initial data for runtime convenience.
- Added focused store tests for defaults, persisted merge, action behavior, and legacy `newStatusMapping` preservation.

**Проблемы и решения**:

Нет.
