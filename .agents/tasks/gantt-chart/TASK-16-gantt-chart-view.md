# TASK-16: GanttChartView (SVG, time axis)

**Status**: VERIFICATION
**Type**: view

**Parent**: [EPIC-1](./EPIC-1-gantt-chart.md)

---

## Описание

Основной SVG-график: ось времени (`d3-scale`), размещение строк и [TASK-15](./TASK-15-gantt-bar-view.md), интеграция с `computeTimeScale` ([TASK-19](./TASK-19-compute-time-scale-util.md)) — на первом шаге можно заглушка оси, затем подключить утилиту. Zoom/pan — в [TASK-21](./TASK-21-gantt-chart-view-d3-zoom.md).

## Файлы

```
src/features/gantt-chart/IssuePage/components/
├── GanttChartView.tsx
├── GanttChartView.module.css
└── GanttChartView.test.tsx
```

## Что сделать

1. **TDD:** моки scales / фиксированная ширина — снимок структуры SVG (оси, число баров).
2. Реализовать props из [target-design.md](./target-design.md); подключить `d3-scale` при необходимости — зависимости оформить в [TASK-7](./TASK-7-extension-config-content.md) (`package.json`).
3. Рендер подписей оси и баров так, чтобы текст был доступен для поиска в браузере.

## Критерии приёмки

- [ ] Компонент изолированно тестируется с фиктивными `bars` и `dateRange`.
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-1](./TASK-1-types-and-tokens.md), [TASK-15](./TASK-15-gantt-bar-view.md)
- Опционально до полной интеграции: [TASK-19](./TASK-19-compute-time-scale-util.md) (можно подключить параллельно или сразу после)

---

## Результаты

_(заполняется по завершении)_
