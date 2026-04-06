# TASK-188: buildInitDataFromColumns + unit tests

**Status**: TODO

**Parent**: [EPIC-19](./EPIC-19-column-wip-inline-board-tab.md)

---

## Описание

Добавить чистую функцию `buildInitDataFromColumns(columns, wipLimits)` в существующий `buildInitData.ts`, строящую `InitFromPropertyData` из массива `Column[]` и текущего `WipLimitsProperty` (аналог логики для group map, но без HTML). Покрыть поведение unit-тестами: группы, without-group, `issueTypeSelectorStates`.

## Файлы

```
src/column-limits/SettingsPage/utils/
├── buildInitData.ts        # + export buildInitDataFromColumns
└── buildInitData.test.ts   # новый или дополнение существующего
```

## Что сделать

1. Реализовать `buildInitDataFromColumns` с использованием `findGroupByColumnId` и структуры как в [target-design.md](./target-design.md).
2. Добавить/расширить `buildInitData.test.ts`: кейсы для пустого property, колонок only in without group, нескольких групп, состояний issue types.
3. Убедиться, что типы импортированы из `../../types` и `SettingsUIModel` (`InitFromPropertyData`).

## Критерии приёмки

- [ ] Поведение согласовано с `buildInitDataFromGroupMap` по смыслу (группы и without group).
- [ ] Unit-тесты стабильны и покрывают основные ветки.
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: нет (можно параллельно с [TASK-187](./TASK-187-board-page-get-ordered-columns.md))
- Референс: [target-design.md](./target-design.md) (Phase 2, полный фрагмент функции)

---

## Результаты

**Дата**: {YYYY-MM-DD}

**Агент**: {Coder / Architect / Manual}

**Статус**: VERIFICATION

**Что сделано**:

{Заполняется при завершении}

**Проблемы и решения**:

{ОБЯЗАТЕЛЬНО при завершении}
