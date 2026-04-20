# TASK-22: GanttToolbar

**Status**: TODO
**Type**: view

**Parent**: [EPIC-1](./EPIC-1-gantt-chart.md)

---

## Описание

Панель над диаграммой: zoom −/+, dropdown интервала времени, toggle «разбивка по статусам», кнопка gear (открытие настроек) — FR-14.

## Файлы

```
src/features/gantt-chart/IssuePage/components/
├── GanttToolbar.tsx
├── GanttToolbar.module.css
└── GanttToolbar.test.tsx
```

## Что сделать

1. **TDD:** клики/change вызывают колбэки props.
2. Реализовать по `GanttToolbarProps` из [target-design.md](./target-design.md).

## Критерии приёмки

- [ ] Все контролы доступны для Cypress-сценариев (data-testid по конвенции проекта).
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-1](./TASK-1-types-and-tokens.md)

---

## Результаты

_(заполняется по завершении)_
