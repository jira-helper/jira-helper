# TASK-9: EmptyState view

**Status**: TODO
**Type**: view

**Parent**: [EPIC-1](./EPIC-1-gantt-chart.md)

---

## Описание

Пустое состояние, когда нет связанных задач для диаграммы (S9, FR по пустым данным).

## Файлы

```
src/features/gantt-chart/IssuePage/components/
├── EmptyState.tsx
└── EmptyState.test.tsx
```

## Что сделать

1. **TDD:** тест отображения сообщения из props.
2. Реализовать `EmptyState` по `EmptyStateProps` из [target-design.md](./target-design.md).

## Критерии приёмки

- [ ] Юнит-тесты проходят.
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-1](./TASK-1-types-and-tokens.md)

---

## Результаты

_(заполняется по завершении)_
