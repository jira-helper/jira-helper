# TASK-10: ErrorState view

**Status**: TODO
**Type**: view

**Parent**: [EPIC-1](./EPIC-1-gantt-chart.md)

---

## Описание

Состояние ошибки загрузки данных с текстом ошибки и кнопкой Retry (S10, [gantt-chart-errors.feature](./gantt-chart-errors.feature)).

## Файлы

```
src/features/gantt-chart/IssuePage/components/
├── ErrorState.tsx
└── ErrorState.test.tsx
```

## Что сделать

1. **TDD:** тест вызова `onRetry` по клику; отображение `error` строки.
2. Реализовать `ErrorState` по `ErrorStateProps` из [target-design.md](./target-design.md).

## Критерии приёмки

- [ ] Юнит-тесты проходят.
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-1](./TASK-1-types-and-tokens.md)

---

## Результаты

_(заполняется по завершении)_
