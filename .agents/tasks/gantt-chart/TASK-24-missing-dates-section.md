# TASK-24: MissingDatesSection

**Status**: TODO
**Type**: view

**Parent**: [EPIC-1](./EPIC-1-gantt-chart.md)

---

## Описание

Сворачиваемый блок со списком задач, не попавших на диаграмму, с причинами (FR-9).

## Файлы

```
src/features/gantt-chart/IssuePage/components/
├── MissingDatesSection.tsx
└── MissingDatesSection.test.tsx
```

## Что сделать

1. **TDD:** expand/collapse, рендер строк из `MissingDateIssue[]`.
2. Реализовать `MissingDatesSectionProps` из [target-design.md](./target-design.md).

## Критерии приёмки

- [ ] Соответствует [gantt-chart-display.feature](./gantt-chart-display.feature) (секция missing dates).
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-1](./TASK-1-types-and-tokens.md), [TASK-13](./TASK-13-compute-bars-util.md) (данные `missingDateIssues`)

---

## Результаты

_(заполняется по завершении)_
