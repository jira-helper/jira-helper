# TASK-20: GanttViewportModel

**Status**: VERIFICATION
**Type**: model

**Parent**: [EPIC-1](./EPIC-1-gantt-chart.md)

---

## Описание

Состояние zoom/pan и выбранного интервала времени; сериализуемый transform для d3-zoom.

## Файлы

```
src/features/gantt-chart/models/
├── GanttViewportModel.ts
├── GanttViewportModel.test.ts
# + правка src/features/gantt-chart/module.ts (ganttViewportModelToken)
```

## Что сделать

1. **TDD:** команды `zoomIn/Out`, `setTimeInterval`, `setTransform`, `resetViewport`.
2. Реализовать класс из [target-design.md](./target-design.md).
3. Зарегистрировать токен в `GanttChartModule`.

## Критерии приёмки

- [ ] Модель резолвится из контейнера после `ensure`.
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-1](./TASK-1-types-and-tokens.md), [TASK-6](./TASK-6-gantt-chart-module-di-wiring.md)

---

## Результаты

_(заполняется по завершении)_
