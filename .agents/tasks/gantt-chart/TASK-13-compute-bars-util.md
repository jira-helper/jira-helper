# TASK-13: computeBars

**Status**: TODO
**Type**: utils

**Parent**: [EPIC-1](./EPIC-1-gantt-chart.md)

---

## Описание

Агрегация сабтасков и настроек в `GanttBar[]` + `missingDateIssues`: mapping дат, фильтр исключения, open-ended до «сегодня», label/tooltip поля, клиентская фильтрация по типам связей (FR-5, FR-6, FR-9).

## Файлы

```
src/features/gantt-chart/utils/
├── computeBars.ts
└── computeBars.test.ts
```

## Что сделать

1. **TDD:** табличные кейсы — полные даты, нет end, нет обеих дат, excluded по фильтру, фильтр по subtasks/epic/links.
2. Реализовать `computeBars(subtasks, settings)` используя [TASK-12](./TASK-12-parse-changelog-util.md) для status transition mapping.
3. «Сегодня» — инжектировать через параметр `now: Date` для тестов.

## Критерии приёмки

- [ ] Результат совпадает с сценариями [gantt-chart-display.feature](./gantt-chart-display.feature) (логически).
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-1](./TASK-1-types-and-tokens.md), [TASK-12](./TASK-12-parse-changelog-util.md)

---

## Результаты

_(заполняется по завершении)_
