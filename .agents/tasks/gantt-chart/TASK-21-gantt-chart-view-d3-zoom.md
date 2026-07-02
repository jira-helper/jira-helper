# TASK-21: d3-zoom / pan / scrollbars в GanttChartView

**Status**: VERIFICATION
**Type**: view

**Parent**: [EPIC-1](./EPIC-1-gantt-chart.md)

---

## Описание

Интеграция `d3-zoom` с React (без владения DOM d3-ом вне SVG-группы): wheel zoom (Ctrl+scroll / pinch), drag pan, горизонтальный и вертикальный scrollbars (FR-12, FR-13). Синхронизация с `GanttViewportModel` ([TASK-20](./TASK-20-gantt-viewport-model.md)).

## Файлы

```
src/features/gantt-chart/IssuePage/components/
├── GanttChartView.tsx          # изменение
├── GanttChartView.module.css   # изменение при необходимости
└── GanttChartView.test.tsx     # изменение / доп. тесты
```

## Что сделать

1. **TDD:** симуляция вызовов `onTransformChange` при изменении мок transform; тесты scrollbars при overflow.
2. Подключить `d3-zoom`/`d3-selection` — зависимости в [TASK-7](./TASK-7-extension-config-content.md).
3. Соблюдать принцип из [target-design.md](./target-design.md): React владеет SVG, d3 только поведение.

## Критерии приёмки

- [ ] Поведение соответствует [gantt-chart-interactions.feature](./gantt-chart-interactions.feature) (S7 pan/zoom/scrollbars).
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-16](./TASK-16-gantt-chart-view.md), [TASK-19](./TASK-19-compute-time-scale-util.md), [TASK-20](./TASK-20-gantt-viewport-model.md)

---

## Результаты

_(заполняется по завершении)_
